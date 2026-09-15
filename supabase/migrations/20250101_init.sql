-- ==========================================================
-- StayDirect: Complete Supabase PostgreSQL Schema & RLS Policies
-- Target: Supabase Database (PostgreSQL 15+)
-- Brand: StayDirect - Zero Brokerage Hostel Marketplace
-- ==========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'owner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gender_preference AS ENUM ('boys', 'girls', 'co-ed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'scheduled_visit', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  college_or_company TEXT,
  city TEXT DEFAULT 'Pune',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. HOSTELS TABLE
CREATE TABLE IF NOT EXISTS public.hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Pune',
  address TEXT NOT NULL,
  nearby_college TEXT,
  distance_to_college TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  monthly_rent_min INTEGER NOT NULL,
  monthly_rent_max INTEGER NOT NULL,
  security_deposit INTEGER NOT NULL DEFAULT 0,
  gender_preference gender_preference NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  total_beds INTEGER NOT NULL DEFAULT 10,
  available_beds INTEGER NOT NULL DEFAULT 5,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  rating NUMERIC(2,1) DEFAULT 4.8,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. HOSTEL IMAGES
CREATE TABLE IF NOT EXISTS public.hostel_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ROOMS (Single, Double, Triple sharing options)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  sharing_type TEXT NOT NULL,
  monthly_rent INTEGER NOT NULL,
  deposit INTEGER NOT NULL,
  total_capacity INTEGER NOT NULL DEFAULT 2,
  vacant_beds INTEGER NOT NULL DEFAULT 1,
  has_ac BOOLEAN DEFAULT false,
  has_attached_washroom BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. AMENITIES
CREATE TABLE IF NOT EXISTS public.amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FAVORITES (Students saving hostels)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, hostel_id)
);

-- 8. INQUIRIES (Visit scheduling & zero brokerage inquiries)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_sharing TEXT,
  visit_date DATE,
  visit_time TEXT,
  message TEXT,
  status inquiry_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. BOOKINGS (Room requests)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  move_in_date DATE NOT NULL,
  duration_months INTEGER DEFAULT 6,
  sharing_type TEXT NOT NULL,
  monthly_rent INTEGER NOT NULL,
  security_deposit INTEGER NOT NULL,
  brokerage_fee INTEGER NOT NULL DEFAULT 0,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CONVERSATIONS & REALTIME MESSAGING
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID REFERENCES public.hostels(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, owner_id, hostel_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. OWNER VERIFICATIONS
CREATE TABLE IF NOT EXISTS public.owner_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id UUID REFERENCES public.hostels(id) ON DELETE SET NULL,
  electricity_bill_url TEXT,
  property_tax_receipt_url TEXT,
  aadhar_or_pan_url TEXT,
  status verification_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_hostels_area ON public.hostels(area);
CREATE INDEX IF NOT EXISTS idx_hostels_gender ON public.hostels(gender_preference);
CREATE INDEX IF NOT EXISTS idx_hostels_owner ON public.hostels(owner_id);
CREATE INDEX IF NOT EXISTS idx_hostels_rent ON public.hostels(monthly_rent_min);
CREATE INDEX IF NOT EXISTS idx_favorites_student ON public.favorites(student_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_owner ON public.inquiries(owner_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_student ON public.inquiries(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON public.bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON public.bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);

-- TRIGGER: AUTOMATIC PROFILE CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone, college_or_company)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'college_or_company'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Hostels are viewable by everyone" ON public.hostels
  FOR SELECT USING (true);

CREATE POLICY "Owners can create hostels" ON public.hostels
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own hostels" ON public.hostels
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own hostels" ON public.hostels
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Hostel images are viewable by everyone" ON public.hostel_images
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage hostel images" ON public.hostel_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.hostels WHERE hostels.id = hostel_images.hostel_id AND hostels.owner_id = auth.uid())
  );

CREATE POLICY "Rooms viewable by everyone" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage rooms" ON public.rooms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.hostels WHERE hostels.id = rooms.hostel_id AND hostels.owner_id = auth.uid())
  );

CREATE POLICY "Amenities viewable by everyone" ON public.amenities
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage amenities" ON public.amenities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.hostels WHERE hostels.id = amenities.hostel_id AND hostels.owner_id = auth.uid())
  );

CREATE POLICY "Students can view their favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can add favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can delete favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = student_id);

CREATE POLICY "Students can view their inquiries" ON public.inquiries
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = owner_id);

CREATE POLICY "Students can create inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Owners and students can update inquiries" ON public.inquiries
  FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = owner_id);

CREATE POLICY "Bookings viewable by student or owner" ON public.bookings
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = owner_id);

CREATE POLICY "Students can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Owners and students can update bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = owner_id);

CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = owner_id);

CREATE POLICY "Users can insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = student_id OR auth.uid() = owner_id);

CREATE POLICY "Users can view conversation messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.student_id = auth.uid() OR conversations.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
