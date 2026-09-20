-- ====================================================================
-- Migration: 010_phase9_advanced_search_recommendations.sql
-- StayDirect — Phase 9: Advanced Search, Recommendations, and Discovery
-- Target: Supabase PostgreSQL (PostgreSQL 15+)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. EXPAND HOSTELS TABLE WITH ADVANCED SEARCH COLUMNS
ALTER TABLE public.hostels
  ADD COLUMN IF NOT EXISTS food_availability TEXT DEFAULT 'food_not_included' CHECK (food_availability IN ('veg_only', 'veg_non_veg', 'food_included', 'food_not_included')),
  ADD COLUMN IF NOT EXISTS furnished_status TEXT DEFAULT 'furnished' CHECK (furnished_status IN ('furnished', 'semi-furnished', 'unfurnished')),
  ADD COLUMN IF NOT EXISTS landmark TEXT,
  ADD COLUMN IF NOT EXISTS nearby_transportation TEXT,
  ADD COLUMN IF NOT EXISTS security_features TEXT[] DEFAULT '{cctv, security_guard, biometric}',
  ADD COLUMN IF NOT EXISTS available_from DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0;

-- 2. CREATE STUDENT PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.student_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_areas TEXT[] DEFAULT '{}',
  min_budget NUMERIC DEFAULT 5000,
  max_budget NUMERIC DEFAULT 15000,
  preferred_room_types TEXT[] DEFAULT '{}',
  preferred_occupancy TEXT[] DEFAULT '{}',
  food_preference TEXT DEFAULT 'any' CHECK (food_preference IN ('any', 'veg', 'non_veg', 'food_included', 'food_not_included')),
  gender_preference TEXT DEFAULT 'any' CHECK (gender_preference IN ('any', 'boys', 'girls', 'co-ed')),
  required_amenities TEXT[] DEFAULT '{}',
  move_in_date DATE,
  personalization_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_preferences_student UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_preferences_student ON public.student_preferences(student_id);

-- 3. CREATE RECENTLY VIEWED HOSTELS TABLE
CREATE TABLE IF NOT EXISTS public.recently_viewed_hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_hostel_view UNIQUE (student_id, hostel_id)
);

CREATE INDEX IF NOT EXISTS idx_recently_viewed_student_viewed ON public.recently_viewed_hostels(student_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_hostel ON public.recently_viewed_hostels(hostel_id);

-- 4. CREATE SAVED SEARCHES TABLE
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  notification_enabled BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  last_alerted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_student ON public.saved_searches(student_id, active);

-- 5. CREATE SAVED SEARCH ALERTS TABLE (Duplicate alert prevention)
CREATE TABLE IF NOT EXISTS public.saved_search_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  saved_search_id UUID NOT NULL REFERENCES public.saved_searches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  alerted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_saved_search_hostel_alert UNIQUE (saved_search_id, hostel_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_search_alerts_search ON public.saved_search_alerts(saved_search_id);
CREATE INDEX IF NOT EXISTS idx_saved_search_alerts_student ON public.saved_search_alerts(student_id);

-- 6. CREATE SEARCH ANALYTICS TABLE (Privacy-conscious, aggregate-ready)
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'search_performed',
    'filter_applied',
    'hostel_opened',
    'hostel_saved',
    'inquiry_created',
    'booking_started',
    'booking_completed'
  )),
  search_term TEXT,
  area TEXT,
  filters_applied JSONB DEFAULT '{}'::jsonb,
  hostel_id UUID REFERENCES public.hostels(id) ON DELETE SET NULL,
  results_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_event ON public.search_analytics(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_area ON public.search_analytics(area) WHERE area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_search_analytics_hostel ON public.search_analytics(hostel_id) WHERE hostel_id IS NOT NULL;

-- 7. SEARCH DATABASE OPTIMIZATION & TRIGRAM INDEXES
CREATE INDEX IF NOT EXISTS idx_hostels_trgm_name ON public.hostels USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hostels_trgm_area ON public.hostels USING gin (area gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hostels_trgm_address ON public.hostels USING gin (address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hostels_trgm_college ON public.hostels USING gin (nearby_college gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hostels_trgm_landmark ON public.hostels USING gin (landmark gin_trgm_ops);

-- Composite filter index for fast multi-attribute scanning
CREATE INDEX IF NOT EXISTS idx_hostels_composite_search ON public.hostels (
  is_published,
  verification_status,
  gender_preference,
  monthly_rent
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES

-- Student Preferences RLS
ALTER TABLE public.student_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own preferences" ON public.student_preferences;
CREATE POLICY "Students can view their own preferences"
  ON public.student_preferences
  FOR SELECT
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can insert their own preferences" ON public.student_preferences;
CREATE POLICY "Students can insert their own preferences"
  ON public.student_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update their own preferences" ON public.student_preferences;
CREATE POLICY "Students can update their own preferences"
  ON public.student_preferences
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can delete their own preferences" ON public.student_preferences;
CREATE POLICY "Students can delete their own preferences"
  ON public.student_preferences
  FOR DELETE
  USING (auth.uid() = student_id);

-- Recently Viewed Hostels RLS
ALTER TABLE public.recently_viewed_hostels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own recently viewed" ON public.recently_viewed_hostels;
CREATE POLICY "Students can view their own recently viewed"
  ON public.recently_viewed_hostels
  FOR SELECT
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can insert their own recently viewed" ON public.recently_viewed_hostels;
CREATE POLICY "Students can insert their own recently viewed"
  ON public.recently_viewed_hostels
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update their own recently viewed" ON public.recently_viewed_hostels;
CREATE POLICY "Students can update their own recently viewed"
  ON public.recently_viewed_hostels
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can delete their own recently viewed" ON public.recently_viewed_hostels;
CREATE POLICY "Students can delete their own recently viewed"
  ON public.recently_viewed_hostels
  FOR DELETE
  USING (auth.uid() = student_id);

-- Saved Searches RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own saved searches" ON public.saved_searches;
CREATE POLICY "Students can view their own saved searches"
  ON public.saved_searches
  FOR SELECT
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can manage their own saved searches" ON public.saved_searches;
CREATE POLICY "Students can manage their own saved searches"
  ON public.saved_searches
  FOR ALL
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Saved Search Alerts RLS
ALTER TABLE public.saved_search_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own alerts" ON public.saved_search_alerts;
CREATE POLICY "Students can view their own alerts"
  ON public.saved_search_alerts
  FOR SELECT
  USING (auth.uid() = student_id);

-- Search Analytics RLS
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert search analytics" ON public.search_analytics;
CREATE POLICY "Anyone can insert search analytics"
  ON public.search_analytics
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all search analytics" ON public.search_analytics;
CREATE POLICY "Admins can view all search analytics"
  ON public.search_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 9. STORED PROCEDURES & HELPER FUNCTIONS

-- Function to record hostel view atomically and increment view count
CREATE OR REPLACE FUNCTION public.record_hostel_view(p_student_id UUID, p_hostel_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Insert or update recently viewed timestamp
  INSERT INTO public.recently_viewed_hostels (student_id, hostel_id, viewed_at)
  VALUES (p_student_id, p_hostel_id, NOW())
  ON CONFLICT (student_id, hostel_id)
  DO UPDATE SET viewed_at = NOW();

  -- 2. Increment view_count on hostel
  UPDATE public.hostels
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_hostel_id;

  -- 3. Log analytics event
  INSERT INTO public.search_analytics (event_type, hostel_id, user_id)
  VALUES ('hostel_opened', p_hostel_id, p_student_id);
END;
$$;

-- Function to process saved search alerts for a newly published or verified hostel
CREATE OR REPLACE FUNCTION public.process_saved_search_alerts(p_hostel_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hostel RECORD;
  v_search RECORD;
  v_alerts_created INTEGER := 0;
  v_matches BOOLEAN;
  v_min_budget NUMERIC;
  v_max_budget NUMERIC;
  v_area TEXT;
  v_gender TEXT;
BEGIN
  -- Fetch hostel details
  SELECT * INTO v_hostel
  FROM public.hostels
  WHERE id = p_hostel_id AND is_published = true AND verification_status = 'verified';

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Loop through active saved searches with notifications enabled
  FOR v_search IN
    SELECT * FROM public.saved_searches
    WHERE active = true AND notification_enabled = true
  LOOP
    -- Check if student already alerted for this hostel
    IF EXISTS (
      SELECT 1 FROM public.saved_search_alerts
      WHERE saved_search_id = v_search.id AND hostel_id = p_hostel_id
    ) THEN
      CONTINUE;
    END IF;

    -- Extract filters
    v_area := v_search.filters->>'area';
    v_gender := v_search.filters->>'gender';
    v_min_budget := COALESCE((v_search.filters->>'min_budget')::NUMERIC, 0);
    v_max_budget := COALESCE((v_search.filters->>'max_budget')::NUMERIC, 999999);

    v_matches := true;

    -- Area check
    IF v_area IS NOT NULL AND v_area <> 'All' AND v_area <> 'All Pune' THEN
      IF LOWER(v_hostel.area) NOT LIKE LOWER('%' || v_area || '%') THEN
        v_matches := false;
      END IF;
    END IF;

    -- Gender check
    IF v_matches AND v_gender IS NOT NULL AND v_gender <> 'All' AND v_gender <> 'any' THEN
      IF LOWER(v_hostel.gender_preference) <> LOWER(v_gender) THEN
        v_matches := false;
      END IF;
    END IF;

    -- Budget check
    IF v_matches AND v_hostel.monthly_rent IS NOT NULL THEN
      IF v_hostel.monthly_rent < v_min_budget OR v_hostel.monthly_rent > v_max_budget THEN
        v_matches := false;
      END IF;
    END IF;

    -- If matched, create alert record and notification
    IF v_matches THEN
      INSERT INTO public.saved_search_alerts (saved_search_id, student_id, hostel_id, alerted_at)
      VALUES (v_search.id, v_search.student_id, p_hostel_id, NOW())
      ON CONFLICT (saved_search_id, hostel_id) DO NOTHING;

      -- Update last_alerted_at
      UPDATE public.saved_searches
      SET last_alerted_at = NOW()
      WHERE id = v_search.id;

      -- Insert into notifications table
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        data
      ) VALUES (
        v_search.student_id,
        'New Matching Hostel Alert 🔔',
        'A verified hostel matching your saved search "' || v_search.name || '" is now available: ' || v_hostel.name || ' in ' || v_hostel.area || '.',
        'saved_search_match',
        jsonb_build_object('hostel_id', p_hostel_id, 'saved_search_id', v_search.id)
      );

      v_alerts_created := v_alerts_created + 1;
    END IF;
  END LOOP;

  RETURN v_alerts_created;
END;
$$;
