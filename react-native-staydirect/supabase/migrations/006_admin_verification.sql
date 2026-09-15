-- ====================================================================
-- Migration: 006_admin_verification.sql
-- StayDirect — Phase 5: Admin Panel, Verification, Moderation & Reports
-- Target: Supabase PostgreSQL
-- ====================================================================

-- 1. EXTEND PROFILES TABLE
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. PROTECTED ADMIN USERS TABLE
-- Server-controlled admin role storage. Normal users cannot insert or elevate themselves.
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. SECURE SERVER-SIDE ADMIN AUTHORIZATION HELPER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check 1: User exists in protected admin_users table
  IF auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- Check 2: Supabase Auth JWT app_metadata has admin role (custom claims)
  IF (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR
     (auth.jwt() -> 'app_metadata' ->> 'role' = 'super_admin') OR
     (auth.jwt() ->> 'role' = 'admin') THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RPC for client to verify admin status securely without trusting client state
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. OWNER VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.owner_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'aadhaar', 'pan', 'electricity_bill', 'property_tax', 'rent_agreement', 'trade_license'
  document_path TEXT NOT NULL, -- Private path in 'owner-verifications' bucket
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_owner_verifications_owner ON public.owner_verifications(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_verifications_status ON public.owner_verifications(status);

-- 5. ADMIN AUDIT ACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'approve_listing', 'reject_listing', 'unpublish_listing', 'approve_owner', 'reject_owner', 'suspend_user', 'unsuspend_user', 'investigate_report', 'resolve_report', 'dismiss_report'
  target_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON public.admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON public.admin_actions(target_id);

-- 6. REPORTS AND MODERATION TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hostel_id UUID REFERENCES public.hostels(id) ON DELETE SET NULL,
  reason TEXT NOT NULL, -- 'Fraudulent listing', 'Incorrect rent', 'Inappropriate content', 'Suspicious user', 'Other issue'
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);

-- 7. SUSPENDED USER GUARD (Triggers on listings, inquiries, bookings)
CREATE OR REPLACE FUNCTION public.enforce_unsuspended_user()
RETURNS TRIGGER AS $$
DECLARE
  user_suspended BOOLEAN;
BEGIN
  SELECT is_suspended INTO user_suspended
  FROM public.profiles
  WHERE id = auth.uid();

  IF user_suspended = true THEN
    RAISE EXCEPTION 'This account is currently suspended. Actions such as creating listings, sending inquiries, or booking rooms are restricted. Contact StayDirect support.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Guard hostels creation
DROP TRIGGER IF EXISTS trg_guard_suspended_hostels ON public.hostels;
CREATE TRIGGER trg_guard_suspended_hostels
  BEFORE INSERT ON public.hostels
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_unsuspended_user();

-- Guard inquiries creation
DROP TRIGGER IF EXISTS trg_guard_suspended_inquiries ON public.inquiries;
CREATE TRIGGER trg_guard_suspended_inquiries
  BEFORE INSERT ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_unsuspended_user();

-- Guard bookings creation
DROP TRIGGER IF EXISTS trg_guard_suspended_bookings ON public.bookings;
CREATE TRIGGER trg_guard_suspended_bookings
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_unsuspended_user();

-- 8. PREVENT OWNERS FROM SELF-APPROVING VERIFICATION
CREATE OR REPLACE FUNCTION public.handle_owner_verification_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent owners from self-approving or altering their verification status
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only verified StayDirect administrators can review or update owner verification status.';
    END IF;

    -- Automatically set reviewed_by and reviewed_at
    NEW.reviewed_by = auth.uid();
    NEW.reviewed_at = NOW();

    -- If approved, sync profile is_verified = true
    IF NEW.status = 'approved' THEN
      UPDATE public.profiles
      SET is_verified = true, updated_at = NOW()
      WHERE id = NEW.owner_id;
    ELSIF NEW.status = 'rejected' THEN
      UPDATE public.profiles
      SET is_verified = false, updated_at = NOW()
      WHERE id = NEW.owner_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_owner_verification_update ON public.owner_verifications;
CREATE TRIGGER trg_owner_verification_update
  BEFORE UPDATE ON public.owner_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_owner_verification_update();

-- 9. ADMIN LIVE STATS RPC FUNCTION
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  v_total_students INT := 0;
  v_total_owners INT := 0;
  v_pending_verifications INT := 0;
  v_pending_listings INT := 0;
  v_active_hostels INT := 0;
  v_open_reports INT := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrative privileges required.';
  END IF;

  SELECT COUNT(*) INTO v_total_students FROM public.profiles WHERE role = 'student';
  SELECT COUNT(*) INTO v_total_owners FROM public.profiles WHERE role = 'owner';
  SELECT COUNT(*) INTO v_pending_verifications FROM public.owner_verifications WHERE status = 'pending';
  SELECT COUNT(*) INTO v_pending_listings FROM public.hostels WHERE verification_status = 'pending';
  SELECT COUNT(*) INTO v_active_hostels FROM public.hostels WHERE is_published = true AND verification_status IN ('approved', 'verified');
  SELECT COUNT(*) INTO v_open_reports FROM public.reports WHERE status = 'open';

  RETURN json_build_object(
    'total_students', v_total_students,
    'total_owners', v_total_owners,
    'pending_owner_verifications', v_pending_verifications,
    'pending_hostel_listings', v_pending_listings,
    'active_hostels', v_active_hostels,
    'open_reports', v_open_reports
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE public.owner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 10.1 admin_users RLS
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 10.2 profiles RLS updates
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin() OR auth.uid() = id OR is_verified = true);

DROP POLICY IF EXISTS "Admins can update user suspension status" ON public.profiles;
CREATE POLICY "Admins can update user suspension status"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10.3 owner_verifications RLS
DROP POLICY IF EXISTS "Owners can view own verification submissions" ON public.owner_verifications;
CREATE POLICY "Owners can view own verification submissions"
  ON public.owner_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Owners can submit their verification" ON public.owner_verifications;
CREATE POLICY "Owners can submit their verification"
  ON public.owner_verifications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id 
    AND status = 'pending' 
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
  );

DROP POLICY IF EXISTS "Admins can update verification status" ON public.owner_verifications;
CREATE POLICY "Admins can update verification status"
  ON public.owner_verifications FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10.4 admin_actions RLS
DROP POLICY IF EXISTS "Admins can view all admin actions" ON public.admin_actions;
CREATE POLICY "Admins can view all admin actions"
  ON public.admin_actions FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can log admin actions" ON public.admin_actions;
CREATE POLICY "Admins can log admin actions"
  ON public.admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() AND auth.uid() = admin_id);

-- 10.5 reports RLS
DROP POLICY IF EXISTS "Users can view own submitted reports" ON public.reports;
CREATE POLICY "Users can view own submitted reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can submit reports" ON public.reports;
CREATE POLICY "Authenticated users can submit reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id AND status = 'open');

DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10.6 hostels RLS update for admin moderation & student search
DROP POLICY IF EXISTS "Public can view verified published hostels, owners view own" ON public.hostels;
DROP POLICY IF EXISTS "Hostels select policy for public, owners, and admins" ON public.hostels;
CREATE POLICY "Hostels select policy for public, owners, and admins"
  ON public.hostels FOR SELECT
  USING (
    -- Public & students see ONLY approved/verified AND published listings
    (is_published = true AND verification_status IN ('verified', 'approved'))
    -- Owners see their own listings regardless of status
    OR (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
    -- Admins can view ALL listings
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update any hostel listing" ON public.hostels;
CREATE POLICY "Admins can update any hostel listing"
  ON public.hostels FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin())
  WITH CHECK (auth.uid() = owner_id OR public.is_admin());

-- 11. PRIVATE SUPABASE STORAGE BUCKET: owner-verifications
INSERT INTO storage.buckets (id, name, public)
VALUES ('owner-verifications', 'owner-verifications', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage RLS:
-- 1) Owners can upload their documents to their own subfolder: {owner_id}/*
DROP POLICY IF EXISTS "Owners can upload verification documents" ON storage.objects;
CREATE POLICY "Owners can upload verification documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'owner-verifications'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2) Owners can view their own documents
DROP POLICY IF EXISTS "Owners can view own verification documents" ON storage.objects;
CREATE POLICY "Owners can view own verification documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'owner-verifications'
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- 3) Admins can read all documents in owner-verifications bucket
DROP POLICY IF EXISTS "Admins have full read access to verification bucket" ON storage.objects;
CREATE POLICY "Admins have full read access to verification bucket"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'owner-verifications'
    AND public.is_admin()
  );
