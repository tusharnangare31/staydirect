-- ====================================================================
-- Migration: 003_favorites.sql
-- StayDirect — Phase 2: Student Favorites Management
-- Target: Supabase PostgreSQL
-- ====================================================================

-- 1. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_hostel_favorite UNIQUE (user_id, hostel_id)
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_hostel_id ON public.favorites(hostel_id);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Select policy: Users can only see their own saved favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Insert policy: Users can only insert favorites for themselves
DROP POLICY IF EXISTS "Users can add own favorites" ON public.favorites;
CREATE POLICY "Users can add own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Delete policy: Users can only remove their own favorites
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
