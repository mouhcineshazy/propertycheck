-- Bundle-backed properties no longer consume the free property allowance.
--
-- Transaction-first model: a free user gets ONE free property; any additional
-- property must be backed by an active Moving Bundle ($24.99, per property) or
-- Premium. So the free-tier property cap counts only properties WITHOUT an active
-- bundle. Bundle-backed properties are effectively paid and unlimited.
--
-- Only the free-tier branch changes; premium stays unlimited. Inspections logic
-- is untouched.
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
  v_properties_limit INTEGER := 1;  -- Free tier: 1 property without a bundle
  v_inspections_limit INTEGER := 2; -- Free tier: 2 inspections (move-in + move-out)
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, FALSE, 0, 0, v_properties_limit, v_inspections_limit;
    RETURN;
  END IF;

  SELECT COALESCE(s.status = 'premium', FALSE) INTO v_is_premium
  FROM public.subscriptions s
  WHERE s.user_id = v_user_id;

  IF v_is_premium THEN
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

  -- Free tier: count only properties WITHOUT an active bundle. Bundle-backed
  -- properties are paid and do not consume the free slot.
  SELECT COUNT(*)::INTEGER INTO v_properties_count
  FROM public.properties p
  WHERE p.user_id = v_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.bundle_purchases b
      WHERE b.property_id = p.id
        AND b.expires_at > NOW()
    );

  SELECT COUNT(*)::INTEGER INTO v_inspections_count
  FROM public.inspections i
  JOIN public.properties p ON i.property_id = p.id
  WHERE p.user_id = v_user_id;

  RETURN QUERY SELECT
    (v_properties_count < v_properties_limit),   -- can_create_property (free slot)
    (v_inspections_count < v_inspections_limit), -- can_create_inspection
    v_properties_count,
    v_inspections_count,
    v_properties_limit,
    v_inspections_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_free_tier_limits() TO authenticated;
