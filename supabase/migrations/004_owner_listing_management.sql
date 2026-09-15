-- ====================================================================
-- Migration: 004_owner_listing_management.sql
-- StayDirect — Phase 3: Owner Listing Management & Storage Security
-- Target: Supabase PostgreSQL
-- ====================================================================

-- 1. ENSURE PROFILE COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college_or_company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Pune';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. ENSURE HOSTEL COLUMNS & SCHEMA
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS hostel_type TEXT DEFAULT 'PG';
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS monthly_rent INTEGER DEFAULT 8000;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS security_deposit INTEGER DEFAULT 0;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS total_beds INTEGER DEFAULT 10;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS available_beds INTEGER DEFAULT 5;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS nearby_college TEXT;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS distance_to_college TEXT;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add constraints if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hostels_hostel_type_check'
  ) THEN
    ALTER TABLE public.hostels 
    ADD CONSTRAINT hostels_hostel_type_check 
    CHECK (hostel_type IN ('PG', 'hostel', 'co-living'));
  END IF;
END $$;

-- 3. ENSURE ROOMS TABLE STRUCTURE
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL,
  monthly_rent INTEGER NOT NULL,
  total_beds INTEGER DEFAULT 1,
  available_beds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENSURE HOSTEL_IMAGES TABLE STRUCTURE
CREATE TABLE IF NOT EXISTS public.hostel_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_hostels_owner_id ON public.hostels(owner_id);
CREATE INDEX IF NOT EXISTS idx_hostels_owner_status ON public.hostels(owner_id, verification_status, is_published);
CREATE INDEX IF NOT EXISTS idx_rooms_hostel_beds ON public.rooms(hostel_id, available_beds);
CREATE INDEX IF NOT EXISTS idx_inquiries_owner_status ON public.inquiries(owner_id, status);

-- 6. SECURITY: PREVENT OWNER FROM SELF-VERIFYING THEIR LISTINGS
CREATE OR REPLACE FUNCTION public.prevent_owner_self_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.verification_status IS DISTINCT FROM NEW.verification_status) AND (NEW.verification_status = 'verified') THEN
    IF auth.uid() IS NOT NULL AND auth.uid() = OLD.owner_id THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ) THEN
        RAISE EXCEPTION 'Property owners cannot self-verify listings. Verification requires StayDirect administrative review.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_owner_self_verification ON public.hostels;
CREATE TRIGGER trg_prevent_owner_self_verification
  BEFORE UPDATE ON public.hostels
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_owner_self_verification();

-- 7. AUTO-UPDATE UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION public.set_hostel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hostels_updated_at ON public.hostels;
CREATE TRIGGER trg_hostels_updated_at
  BEFORE UPDATE ON public.hostels
  FOR EACH ROW
  EXECUTE FUNCTION public.set_hostel_updated_at();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view verified published hostels, owners view own" ON public.hostels;
DROP POLICY IF EXISTS "Anyone can view published hostels" ON public.hostels;
CREATE POLICY "Public can view verified published hostels, owners view own"
  ON public.hostels
  FOR SELECT
  USING (
    (is_published = true AND verification_status = 'verified')
    OR (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
  );

DROP POLICY IF EXISTS "Owners can insert their own hostels" ON public.hostels;
CREATE POLICY "Owners can insert their own hostels"
  ON public.hostels
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = owner_id
  );

DROP POLICY IF EXISTS "Owners can update their own hostels" ON public.hostels;
CREATE POLICY "Owners can update their own hostels"
  ON public.hostels
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their own hostels" ON public.hostels;
CREATE POLICY "Owners can delete their own hostels"
  ON public.hostels
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;
CREATE POLICY "Anyone can view rooms"
  ON public.rooms
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners can manage rooms" ON public.rooms;
CREATE POLICY "Owners can manage rooms"
  ON public.rooms
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.hostels
      WHERE hostels.id = rooms.hostel_id
      AND hostels.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can view hostel images" ON public.hostel_images;
CREATE POLICY "Anyone can view hostel images"
  ON public.hostel_images
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners can manage hostel images" ON public.hostel_images;
CREATE POLICY "Owners can manage hostel images"
  ON public.hostel_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.hostels
      WHERE hostels.id = hostel_images.hostel_id
      AND hostels.owner_id = auth.uid()
    )
  );

-- 9. SUPABASE STORAGE BUCKET & POLICIES FOR HOSTEL-IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('hostel-images', 'hostel-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view hostel images" ON storage.objects;
CREATE POLICY "Public can view hostel images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hostel-images');

DROP POLICY IF EXISTS "Owners can upload hostel images" ON storage.objects;
CREATE POLICY "Owners can upload hostel images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hostel-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'hostels'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owners can delete their own hostel images" ON storage.objects;
CREATE POLICY "Owners can delete their own hostel images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'hostel-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'hostels'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
