-- ============================================
-- PropertyCheck Initial Database Schema
-- Version: 1.0.0
-- Date: 2026-01-15
-- ============================================

-- ============================================
-- USERS TABLE
-- Extends Supabase auth.users with app-specific data
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow users to read/update only their own profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PROPERTIES TABLE
-- Stores rental properties for each user
-- ============================================
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'condo')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Users can only CRUD their own properties
CREATE POLICY "Users can CRUD own properties"
  ON public.properties FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_properties_user_id ON public.properties(user_id);

-- ============================================
-- INSPECTIONS TABLE
-- Each inspection belongs to a property
-- ============================================
CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  inspection_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  notes TEXT,
  -- Sharing functionality
  share_token UUID UNIQUE DEFAULT gen_random_uuid(),
  share_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Users can CRUD inspections for their own properties
CREATE POLICY "Users can CRUD own inspections"
  ON public.inspections FOR ALL
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    property_id IN (
      SELECT id FROM public.properties WHERE user_id = auth.uid()
    )
  );

-- Public can view shared inspections (via share_token, not expired)
-- This allows unauthenticated access to shared reports
CREATE POLICY "Public can view shared inspections"
  ON public.inspections FOR SELECT
  USING (
    share_token IS NOT NULL
    AND share_expires_at > NOW()
  );

CREATE INDEX idx_inspections_property_id ON public.inspections(property_id);
CREATE INDEX idx_inspections_share_token ON public.inspections(share_token) WHERE share_token IS NOT NULL;

-- ============================================
-- INSPECTION PHOTOS TABLE
-- Photos attached to each inspection
-- ============================================
CREATE TABLE public.inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,  -- Path in Supabase Storage
  caption TEXT,
  room_type TEXT CHECK (room_type IN ('bedroom', 'bathroom', 'kitchen', 'living_room', 'other')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inspection_photos ENABLE ROW LEVEL SECURITY;

-- Users can CRUD photos for their own inspections
CREATE POLICY "Users can CRUD own photos"
  ON public.inspection_photos FOR ALL
  USING (
    inspection_id IN (
      SELECT i.id FROM public.inspections i
      JOIN public.properties p ON i.property_id = p.id
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    inspection_id IN (
      SELECT i.id FROM public.inspections i
      JOIN public.properties p ON i.property_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Public can view photos for shared inspections
CREATE POLICY "Public can view shared inspection photos"
  ON public.inspection_photos FOR SELECT
  USING (
    inspection_id IN (
      SELECT id FROM public.inspections
      WHERE share_token IS NOT NULL AND share_expires_at > NOW()
    )
  );

CREATE INDEX idx_photos_inspection_id ON public.inspection_photos(inspection_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- Tracks Stripe subscription status per user
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'premium', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (via webhooks)
-- No INSERT/UPDATE policy for users - handled by backend

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- STORAGE BUCKET FOR INSPECTION PHOTOS
-- ============================================
-- Note: Run this in Supabase Dashboard > Storage > Create bucket
-- Or via Supabase CLI: supabase storage create inspection-photos

-- Storage policies are configured in Supabase Dashboard:
-- 1. Authenticated users can upload to their own folder: user_id/*
-- 2. Public can read photos for shared inspections

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get user's subscription status
CREATE OR REPLACE FUNCTION public.get_user_subscription_status()
RETURNS TEXT AS $$
DECLARE
  sub_status TEXT;
BEGIN
  SELECT status INTO sub_status
  FROM public.subscriptions
  WHERE user_id = auth.uid();

  RETURN COALESCE(sub_status, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is within free tier limits
CREATE OR REPLACE FUNCTION public.check_free_tier_limits()
RETURNS TABLE (
  can_create_property BOOLEAN,
  can_create_inspection BOOLEAN,
  properties_count INTEGER,
  inspections_count INTEGER,
  properties_limit INTEGER,
  inspections_limit INTEGER
) AS $$
DECLARE
  user_status TEXT;
  prop_count INTEGER;
  insp_count INTEGER;
  prop_limit INTEGER := 2;
  insp_limit INTEGER := 5;
BEGIN
  -- Get user subscription status
  SELECT COALESCE(s.status, 'free') INTO user_status
  FROM public.users u
  LEFT JOIN public.subscriptions s ON u.id = s.user_id
  WHERE u.id = auth.uid();

  -- Premium users have no limits
  IF user_status = 'premium' THEN
    RETURN QUERY SELECT TRUE, TRUE, 0, 0, -1, -1;
    RETURN;
  END IF;

  -- Count user's properties and inspections
  SELECT COUNT(*)::INTEGER INTO prop_count
  FROM public.properties
  WHERE user_id = auth.uid();

  SELECT COUNT(*)::INTEGER INTO insp_count
  FROM public.inspections i
  JOIN public.properties p ON i.property_id = p.id
  WHERE p.user_id = auth.uid();

  RETURN QUERY SELECT
    prop_count < prop_limit,
    insp_count < insp_limit,
    prop_count,
    insp_count,
    prop_limit,
    insp_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth';
COMMENT ON TABLE public.properties IS 'Rental properties owned by users';
COMMENT ON TABLE public.inspections IS 'Property inspections with photos';
COMMENT ON TABLE public.inspection_photos IS 'Photos attached to inspections';
COMMENT ON TABLE public.subscriptions IS 'Stripe subscription tracking';
COMMENT ON FUNCTION public.check_free_tier_limits IS 'Returns whether user can create more properties/inspections based on their plan';
