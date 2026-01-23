-- Add province and onboarding_completed columns to users table
-- Migration: 20260123_add_user_province.sql

-- Add province column for Canadian province customization
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS province VARCHAR(2) DEFAULT NULL;

-- Add onboarding_completed flag
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.users.province IS 'Canadian province code (ON, BC, AB, QC) for province-specific messaging';
COMMENT ON COLUMN public.users.onboarding_completed IS 'Whether user has completed the onboarding flow';

-- Update check_free_tier_limits function to use new 2 inspection limit
CREATE OR REPLACE FUNCTION public.check_free_tier_limits()
RETURNS TABLE(
  can_create_property BOOLEAN,
  can_create_inspection BOOLEAN,
  properties_count INTEGER,
  inspections_count INTEGER,
  properties_limit INTEGER,
  inspections_limit INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_is_premium BOOLEAN;
  v_properties_count INTEGER;
  v_inspections_count INTEGER;
  v_properties_limit INTEGER := 1;  -- Free tier: 1 property
  v_inspections_limit INTEGER := 2; -- Free tier: 2 inspections (move-in + move-out)
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, FALSE, 0, 0, v_properties_limit, v_inspections_limit;
    RETURN;
  END IF;

  -- Check if user has premium subscription
  SELECT COALESCE(s.status = 'premium', FALSE) INTO v_is_premium
  FROM public.subscriptions s
  WHERE s.user_id = v_user_id;

  -- If premium, return unlimited (represented by -1)
  IF v_is_premium THEN
    -- Count current usage for display purposes
    SELECT COUNT(*)::INTEGER INTO v_properties_count
    FROM public.properties
    WHERE user_id = v_user_id;

    SELECT COUNT(*)::INTEGER INTO v_inspections_count
    FROM public.inspections i
    JOIN public.properties p ON i.property_id = p.id
    WHERE p.user_id = v_user_id;

    RETURN QUERY SELECT TRUE, TRUE, v_properties_count, v_inspections_count, -1, -1;
    RETURN;
  END IF;

  -- Count user's properties
  SELECT COUNT(*)::INTEGER INTO v_properties_count
  FROM public.properties
  WHERE user_id = v_user_id;

  -- Count user's total inspections (across all properties)
  SELECT COUNT(*)::INTEGER INTO v_inspections_count
  FROM public.inspections i
  JOIN public.properties p ON i.property_id = p.id
  WHERE p.user_id = v_user_id;

  -- Return limits check
  RETURN QUERY SELECT
    (v_properties_count < v_properties_limit),  -- can_create_property
    (v_inspections_count < v_inspections_limit), -- can_create_inspection
    v_properties_count,
    v_inspections_count,
    v_properties_limit,
    v_inspections_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_free_tier_limits() TO authenticated;
