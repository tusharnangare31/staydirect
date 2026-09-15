-- ====================================================================
-- Migration: 008_phase7_hardening_and_reviews.sql
-- StayDirect — Phase 7: Reviews, Hardening, Platform Settings & Indexing
-- Target: Supabase PostgreSQL (PostgreSQL 15+)
-- ====================================================================

-- 1. REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  is_verified_stay BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_hostel_review UNIQUE(student_id, hostel_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_hostel ON public.reviews(hostel_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_student ON public.reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews(created_at DESC);

CREATE OR REPLACE FUNCTION public.recalculate_hostel_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_hostel_id UUID;
  new_avg NUMERIC(2,1);
  new_count INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_hostel_id := OLD.hostel_id;
  ELSE
    target_hostel_id := NEW.hostel_id;
  END IF;

  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 4.8),
    COUNT(*)
  INTO new_avg, new_count
  FROM public.reviews
  WHERE hostel_id = target_hostel_id
    AND deleted_at IS NULL;

  UPDATE public.hostels
  SET 
    rating = new_avg,
    review_count = new_count,
    updated_at = NOW()
  WHERE id = target_hostel_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_hostel_rating ON public.reviews;
CREATE TRIGGER trg_recalculate_hostel_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_hostel_rating();

ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_hostels_deleted ON public.hostels(deleted_at);
CREATE INDEX IF NOT EXISTS idx_bookings_deleted ON public.bookings(deleted_at);

CREATE INDEX IF NOT EXISTS idx_hostels_area_rent ON public.hostels(area, monthly_rent_min) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hostels_gender ON public.hostels(gender_preference) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hostels_verification_published ON public.hostels(verification_status, is_published) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_student_status ON public.bookings(student_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_owner_status ON public.bookings(owner_id, status) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES
  ('zero_brokerage_guarantee', '{"enabled": true, "penalty_policy": "immediate_delist", "fee_amount": 0}'::jsonb, 'Zero brokerage enforcement and owner penalty configuration'),
  ('escrow_rules', '{"auto_refund_days": 2, "deposit_hold_hours": 48, "convenience_fee": 99}'::jsonb, 'Escrow release timelines and student booking deposit rules'),
  ('pune_support_contact', '{"helpline": "+91 98901 23456", "email": "support@staydirect.in", "city_office": "FC Road, Deccan Gymkhana, Pune 411004"}'::jsonb, 'Student support contact information for Pune operations'),
  ('maintenance_mode', '{"enabled": false, "notice": ""}'::jsonb, 'Emergency maintenance mode switch')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

CREATE OR REPLACE FUNCTION public.validate_booking_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('rejected', 'cancelled') AND NEW.status = 'confirmed' THEN
    RAISE EXCEPTION 'Invalid status transition: A cancelled or rejected booking cannot be directly confirmed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_booking_status ON public.bookings;
CREATE TRIGGER trg_validate_booking_status
  BEFORE UPDATE OF status ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_status_transition();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;
CREATE POLICY "Public can read reviews"
  ON public.reviews FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Students can insert their own reviews" ON public.reviews;
CREATE POLICY "Students can insert their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_suspended = false
    )
  );

DROP POLICY IF EXISTS "Students can update their own reviews" ON public.reviews;
CREATE POLICY "Students can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can read platform settings" ON public.platform_settings;
CREATE POLICY "Anyone can read platform settings"
  ON public.platform_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Only admins can update platform settings"
  ON public.platform_settings FOR ALL
  USING (public.is_admin());
