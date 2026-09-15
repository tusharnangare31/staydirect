-- ====================================================================
-- Migration: 002_hostel_discovery.sql
-- StayDirect — Phase 2: Student Hostel Discovery
-- Target: Supabase PostgreSQL
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE OR EXTEND HOSTELS TABLE
CREATE TABLE IF NOT EXISTS public.hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  city TEXT DEFAULT 'Pune',
  area TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  monthly_rent INTEGER NOT NULL,
  security_deposit INTEGER DEFAULT 0,
  gender_preference TEXT CHECK (gender_preference IN ('boys', 'girls', 'co-ed')),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In case table already existed from Phase 1, ensure all columns match
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS monthly_rent INTEGER;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS security_deposit INTEGER DEFAULT 0;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- 3. HOSTEL IMAGES
CREATE TABLE IF NOT EXISTS public.hostel_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROOMS
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL, -- e.g. 'Single Room', 'Twin Sharing', 'Triple Sharing'
  monthly_rent INTEGER NOT NULL,
  total_beds INTEGER DEFAULT 1,
  available_beds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AMENITIES
CREATE TABLE IF NOT EXISTS public.amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL
);

-- 6. HOSTEL AMENITIES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.hostel_amenities (
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (hostel_id, amenity_id)
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_hostels_city ON public.hostels(city);
CREATE INDEX IF NOT EXISTS idx_hostels_area ON public.hostels(area);
CREATE INDEX IF NOT EXISTS idx_hostels_monthly_rent ON public.hostels(monthly_rent);
CREATE INDEX IF NOT EXISTS idx_hostels_is_published ON public.hostels(is_published);
CREATE INDEX IF NOT EXISTS idx_hostels_gender ON public.hostels(gender_preference);
CREATE INDEX IF NOT EXISTS idx_hostel_images_hostel_id ON public.hostel_images(hostel_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_rooms_hostel_id ON public.rooms(hostel_id);

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_amenities ENABLE ROW LEVEL SECURITY;

-- 8.1 Hostels RLS:
-- Anyone (including authenticated students and public) can read published hostels
DROP POLICY IF EXISTS "Anyone can view published hostels" ON public.hostels;
CREATE POLICY "Anyone can view published hostels"
  ON public.hostels
  FOR SELECT
  USING (is_published = true OR (auth.uid() IS NOT NULL AND auth.uid() = owner_id));

-- Owners can insert their own hostels
DROP POLICY IF EXISTS "Owners can insert their own hostels" ON public.hostels;
CREATE POLICY "Owners can insert their own hostels"
  ON public.hostels
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- Owners can update their own hostels
DROP POLICY IF EXISTS "Owners can update their own hostels" ON public.hostels;
CREATE POLICY "Owners can update their own hostels"
  ON public.hostels
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- Owners can delete their own hostels
DROP POLICY IF EXISTS "Owners can delete their own hostels" ON public.hostels;
CREATE POLICY "Owners can delete their own hostels"
  ON public.hostels
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- 8.2 Hostel Images RLS:
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

-- 8.3 Rooms RLS:
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

-- 8.4 Amenities & Hostel Amenities RLS:
DROP POLICY IF EXISTS "Anyone can view amenities" ON public.amenities;
CREATE POLICY "Anyone can view amenities"
  ON public.amenities
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create amenities" ON public.amenities;
CREATE POLICY "Authenticated users can create amenities"
  ON public.amenities
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view hostel amenities" ON public.hostel_amenities;
CREATE POLICY "Anyone can view hostel amenities"
  ON public.hostel_amenities
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners can manage hostel amenities" ON public.hostel_amenities;
CREATE POLICY "Owners can manage hostel amenities"
  ON public.hostel_amenities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.hostels
      WHERE hostels.id = hostel_amenities.hostel_id
      AND hostels.owner_id = auth.uid()
    )
  );
