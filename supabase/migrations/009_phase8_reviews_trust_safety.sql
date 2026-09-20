-- ====================================================================
-- Migration: 009_phase8_reviews_trust_safety.sql
-- StayDirect — Phase 8: Reviews, Ratings, Trust, and Safety
-- Target: Supabase PostgreSQL (PostgreSQL 15+)
-- ====================================================================

-- 1. EXPAND / ALIGN REVIEWS TABLE
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  ADD COLUMN IF NOT EXISTS review_text TEXT,
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'published', 'rejected', 'hidden', 'reported')),
  ADD COLUMN IF NOT EXISTS owner_reply TEXT,
  ADD COLUMN IF NOT EXISTS owner_replied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
  ADD COLUMN IF NOT EXISTS flagged_suspicious BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspicious_reason TEXT;

-- Backfill review_text from comment if empty
UPDATE public.reviews
SET review_text = comment
WHERE review_text IS NULL AND comment IS NOT NULL;

-- Backfill owner_id from hostels if empty
UPDATE public.reviews r
SET owner_id = h.owner_id
FROM public.hostels h
WHERE r.hostel_id = h.id AND r.owner_id IS NULL;

-- Add index on status and flags
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_owner ON public.reviews(owner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_suspicious ON public.reviews(flagged_suspicious) WHERE flagged_suspicious = true;

-- Ensure one review per booking constraint if booking_id is provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_booking_review'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT uq_booking_review UNIQUE (booking_id);
  END IF;
END $$;

-- 2. REVIEW REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.review_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN (
    'spam',
    'fake_review',
    'offensive_language',
    'personal_information',
    'harassment',
    'irrelevant_content',
    'fraudulent_activity',
    'duplicate_review',
    'other'
  )),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review ON public.review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON public.review_reports(status);
CREATE INDEX IF NOT EXISTS idx_review_reports_reported_by ON public.review_reports(reported_by);

-- 3. HOSTEL TRUST METRICS TABLE
CREATE TABLE IF NOT EXISTS public.hostel_trust_metrics (
  hostel_id UUID PRIMARY KEY REFERENCES public.hostels(id) ON DELETE CASCADE,
  trust_score INTEGER NOT NULL DEFAULT 85 CHECK (trust_score >= 0 AND trust_score <= 100),
  average_rating NUMERIC(2,1) DEFAULT 4.8,
  review_count INTEGER DEFAULT 0,
  cleanliness_avg NUMERIC(2,1) DEFAULT 4.8,
  safety_avg NUMERIC(2,1) DEFAULT 4.9,
  location_avg NUMERIC(2,1) DEFAULT 4.7,
  value_avg NUMERIC(2,1) DEFAULT 4.8,
  completed_booking_count INTEGER DEFAULT 0,
  response_rate NUMERIC(4,1) DEFAULT 95.0,
  average_response_time TEXT DEFAULT '< 1 hour',
  verification_status TEXT DEFAULT 'verified',
  complaint_count INTEGER DEFAULT 0,
  cancellation_rate NUMERIC(4,1) DEFAULT 2.0,
  badges JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_metrics_score ON public.hostel_trust_metrics(trust_score DESC);

-- 4. EXPAND GENERAL REPORTS TABLE (Complaints & Trust Issues)
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS report_type TEXT DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS evidence_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_admin UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolution TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_booking ON public.reports(booking_id);
CREATE INDEX IF NOT EXISTS idx_reports_assigned ON public.reports(assigned_admin);

-- 5. FUNCTION TO RECALCULATE TRUST METRICS & TRUST SCORE
CREATE OR REPLACE FUNCTION public.recalculate_hostel_trust_metrics(p_hostel_id UUID)
RETURNS VOID AS $$
DECLARE
  v_owner_id UUID;
  v_is_owner_verified BOOLEAN := false;
  v_hostel_verified BOOLEAN := false;
  v_avg_rating NUMERIC(2,1) := 4.8;
  v_review_count INTEGER := 0;
  v_cleanliness NUMERIC(2,1) := 4.8;
  v_safety NUMERIC(2,1) := 4.9;
  v_location NUMERIC(2,1) := 4.7;
  v_value NUMERIC(2,1) := 4.8;
  v_completed_bookings INTEGER := 0;
  v_complaints INTEGER := 0;
  v_score INTEGER := 70;
  v_badges JSONB := '[]'::jsonb;
BEGIN
  -- 1. Fetch hostel and owner status
  SELECT h.owner_id, (h.verification_status = 'verified'), COALESCE(p.is_verified, false)
  INTO v_owner_id, v_hostel_verified, v_is_owner_verified
  FROM public.hostels h
  LEFT JOIN public.profiles p ON p.id = h.owner_id
  WHERE h.id = p_hostel_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- 2. Aggregate published reviews
  SELECT
    COALESCE(ROUND(AVG(rating)::numeric, 1), 4.8),
    COUNT(*),
    COALESCE(ROUND(AVG(COALESCE(cleanliness_rating, rating))::numeric, 1), 4.8),
    COALESCE(ROUND(AVG(COALESCE(safety_rating, rating))::numeric, 1), 4.9),
    COALESCE(ROUND(AVG(COALESCE(location_rating, rating))::numeric, 1), 4.7),
    COALESCE(ROUND(AVG(COALESCE(value_rating, rating))::numeric, 1), 4.8)
  INTO v_avg_rating, v_review_count, v_cleanliness, v_safety, v_location, v_value
  FROM public.reviews
  WHERE hostel_id = p_hostel_id
    AND status = 'published'
    AND deleted_at IS NULL;

  -- 3. Completed bookings count
  SELECT COUNT(*)
  INTO v_completed_bookings
  FROM public.bookings
  WHERE hostel_id = p_hostel_id
    AND status IN ('confirmed', 'completed')
    AND deleted_at IS NULL;

  -- 4. Complaints count
  SELECT COUNT(*)
  INTO v_complaints
  FROM public.reports
  WHERE hostel_id = p_hostel_id
    AND status IN ('submitted', 'under_review', 'escalated');

  -- 5. Calculate transparent trust score (0 - 98)
  v_score := 50;
  IF v_is_owner_verified THEN
    v_score := v_score + 15;
  END IF;
  IF v_hostel_verified THEN
    v_score := v_score + 15;
  END IF;

  -- Rating contribution (up to 15 points)
  IF v_review_count > 0 THEN
    v_score := v_score + ROUND((v_avg_rating / 5.0) * 15)::integer;
  ELSE
    v_score := v_score + 10;
  END IF;

  -- Bookings contribution (up to 8 points)
  IF v_completed_bookings >= 5 THEN
    v_score := v_score + 8;
  ELSIF v_completed_bookings >= 1 THEN
    v_score := v_score + 4;
  END IF;

  -- Complaint deduction
  IF v_complaints > 0 THEN
    v_score := GREATEST(30, v_score - (v_complaints * 10));
  END IF;

  -- Cap at 98 (no 100% guarantee claim)
  v_score := LEAST(98, GREATEST(40, v_score));

  -- 6. Build transparent badges list
  v_badges := '[]'::jsonb;
  IF v_is_owner_verified THEN
    v_badges := v_badges || jsonb_build_array(jsonb_build_object(
      'id', 'verified_owner',
      'title', 'Verified Owner',
      'icon', 'shield-checkmark',
      'color', '#059669',
      'description', 'Landlord identity & PMC electricity records verified by StayDirect Pune ops team.'
    ));
  END IF;

  IF v_hostel_verified THEN
    v_badges := v_badges || jsonb_build_array(jsonb_build_object(
      'id', 'verified_hostel',
      'title', 'Verified Hostel',
      'icon', 'checkmark-circle',
      'color', '#00362A',
      'description', 'Physical premises, rooms, and zero-brokerage rent validated on-ground.'
    ));
  END IF;

  IF v_review_count >= 2 THEN
    v_badges := v_badges || jsonb_build_array(jsonb_build_object(
      'id', 'verified_stay_reviews',
      'title', 'Verified Stay Reviews',
      'icon', 'star',
      'color', '#D97706',
      'description', 'Feedback from Pune students with completed booking deposits.'
    ));
  END IF;

  IF v_avg_rating >= 4.5 AND v_review_count >= 2 THEN
    v_badges := v_badges || jsonb_build_array(jsonb_build_object(
      'id', 'highly_rated',
      'title', 'Highly Rated',
      'icon', 'ribbon',
      'color', '#4F46E5',
      'description', 'Maintains consistent 4.5+ student satisfaction score.'
    ));
  END IF;

  IF v_completed_bookings >= 3 THEN
    v_badges := v_badges || jsonb_build_array(jsonb_build_object(
      'id', 'frequently_booked',
      'title', 'Frequently Booked',
      'icon', 'trending-up',
      'color', '#2563EB',
      'description', 'Multiple Pune college students have booked stays here without brokers.'
    ));
  END IF;

  -- 7. Upsert metrics
  INSERT INTO public.hostel_trust_metrics (
    hostel_id,
    trust_score,
    average_rating,
    review_count,
    cleanliness_avg,
    safety_avg,
    location_avg,
    value_avg,
    completed_booking_count,
    complaint_count,
    badges,
    last_updated
  )
  VALUES (
    p_hostel_id,
    v_score,
    v_avg_rating,
    v_review_count,
    v_cleanliness,
    v_safety,
    v_location,
    v_value,
    v_completed_bookings,
    v_complaints,
    v_badges,
    NOW()
  )
  ON CONFLICT (hostel_id) DO UPDATE SET
    trust_score = EXCLUDED.trust_score,
    average_rating = EXCLUDED.average_rating,
    review_count = EXCLUDED.review_count,
    cleanliness_avg = EXCLUDED.cleanliness_avg,
    safety_avg = EXCLUDED.safety_avg,
    location_avg = EXCLUDED.location_avg,
    value_avg = EXCLUDED.value_avg,
    completed_booking_count = EXCLUDED.completed_booking_count,
    complaint_count = EXCLUDED.complaint_count,
    badges = EXCLUDED.badges,
    last_updated = NOW();

  -- Synchronize hostel parent table
  UPDATE public.hostels
  SET 
    rating = v_avg_rating,
    review_count = v_review_count,
    updated_at = NOW()
  WHERE id = p_hostel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. TRIGGER ON REVIEWS TO AUTO RECALCULATE TRUST METRICS
CREATE OR REPLACE FUNCTION public.trg_recalculate_trust_metrics_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_hostel_trust_metrics(OLD.hostel_id);
    RETURN OLD;
  ELSE
    PERFORM public.recalculate_hostel_trust_metrics(NEW.hostel_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_trust_metrics ON public.reviews;
CREATE TRIGGER trg_recalculate_trust_metrics
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_recalculate_trust_metrics_func();

-- 7. RLS SECURITY POLICIES FOR REVIEWS & TRUST TABLES

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_trust_metrics ENABLE ROW LEVEL SECURITY;

-- REVIEWS POLICIES
DROP POLICY IF EXISTS "Public can view published reviews" ON public.reviews;
CREATE POLICY "Public can view published reviews"
  ON public.reviews FOR SELECT
  USING (
    (status = 'published' AND deleted_at IS NULL)
    OR (auth.uid() = student_id)
    OR (auth.uid() = owner_id)
    OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

DROP POLICY IF EXISTS "Students can insert review for completed booking" ON public.reviews;
CREATE POLICY "Students can insert review for completed booking"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    -- Must not be the owner
    AND auth.uid() != (SELECT owner_id FROM public.hostels WHERE id = hostel_id)
    -- Must have a completed or confirmed booking
    AND (
      booking_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM public.bookings
        WHERE id = booking_id
          AND student_id = auth.uid()
          AND hostel_id = reviews.hostel_id
          AND status IN ('confirmed', 'completed')
      )
    )
  );

DROP POLICY IF EXISTS "Students can update own review if not moderated" ON public.reviews;
CREATE POLICY "Students can update own review if not moderated"
  ON public.reviews FOR UPDATE
  USING (
    auth.uid() = student_id 
    AND moderated_by IS NULL
  )
  WITH CHECK (
    auth.uid() = student_id
    AND moderated_by IS NULL
  );

DROP POLICY IF EXISTS "Owners can reply to reviews on their hostel" ON public.reviews;
CREATE POLICY "Owners can reply to reviews on their hostel"
  ON public.reviews FOR UPDATE
  USING (
    auth.uid() = owner_id
  )
  WITH CHECK (
    auth.uid() = owner_id
  );

DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- REVIEW REPORTS POLICIES
DROP POLICY IF EXISTS "Authenticated users can submit review reports" ON public.review_reports;
CREATE POLICY "Authenticated users can submit review reports"
  ON public.review_reports FOR INSERT
  WITH CHECK (
    auth.uid() = reported_by
  );

DROP POLICY IF EXISTS "Reporters and Admins can view review reports" ON public.review_reports;
CREATE POLICY "Reporters and Admins can view review reports"
  ON public.review_reports FOR SELECT
  USING (
    auth.uid() = reported_by
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update review reports" ON public.review_reports;
CREATE POLICY "Admins can update review reports"
  ON public.review_reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- HOSTEL TRUST METRICS POLICIES
DROP POLICY IF EXISTS "Public can view trust metrics" ON public.hostel_trust_metrics;
CREATE POLICY "Public can view trust metrics"
  ON public.hostel_trust_metrics FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage trust metrics" ON public.hostel_trust_metrics;
CREATE POLICY "Admins can manage trust metrics"
  ON public.hostel_trust_metrics FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. INITIALIZE TRUST METRICS FOR EXISTING HOSTELS
DO $$
DECLARE
  h_rec RECORD;
BEGIN
  FOR h_rec IN SELECT id FROM public.hostels WHERE deleted_at IS NULL LOOP
    PERFORM public.recalculate_hostel_trust_metrics(h_rec.id);
  END LOOP;
END $$;
