-- Inspection completion rules + bundle finalization — enforced in the database.
--
-- Product model (transaction-first):
--   * Properties: unlimited for every tier (no property cap).
--   * Inspections: a property may hold at most TWO COMPLETED inspections
--     (move-in + move-out) — a universal domain rule that applies to free,
--     bundle, and premium alike. Draft/in-progress inspections can be created
--     and deleted freely; the cap is on COMPLETED ones.
--   * Moving Bundle ($24.99, per property): buying it finalizes the property —
--     its inspections and photos become read-only (no inserts, no edits). It
--     unlocks watermark-free PDFs. The purchase itself is recorded server-side
--     by the RevenueCat webhook (bundle_purchases), so a finalized property is
--     one with an active bundle.
--
-- Enforced with triggers so no client path or direct API call can bypass it.
-- DELETE is always allowed (so a user can remove their own data and property
-- deletion can cascade); only INSERT/UPDATE are gated.

-- Is this property finalized (has an active Moving Bundle)?
CREATE OR REPLACE FUNCTION public.property_is_locked(p_property_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bundle_purchases b
    WHERE b.property_id = p_property_id
      AND b.expires_at > NOW()
  );
$$;

CREATE OR REPLACE FUNCTION public.completed_inspection_count(p_property_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.inspections
  WHERE property_id = p_property_id
    AND status = 'completed';
$$;

-- Client-facing: can this property accept another inspection right now?
CREATE OR REPLACE FUNCTION public.can_add_inspection(p_property_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT NOT public.property_is_locked(p_property_id)
     AND public.completed_inspection_count(p_property_id) < 2;
$$;

GRANT EXECUTE ON FUNCTION public.property_is_locked(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.completed_inspection_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_add_inspection(UUID) TO authenticated;

-- Gate writes to inspections.
CREATE OR REPLACE FUNCTION public.enforce_inspection_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  IF public.property_is_locked(NEW.property_id) THEN
    RAISE EXCEPTION 'This property has been finalized with a Moving Bundle and can no longer be changed.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF public.completed_inspection_count(NEW.property_id) >= 2 THEN
      RAISE EXCEPTION 'This property already has 2 completed inspections (move-in and move-out).';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'completed'
       AND OLD.status IS DISTINCT FROM 'completed'
       AND public.completed_inspection_count(NEW.property_id) >= 2 THEN
      RAISE EXCEPTION 'This property already has 2 completed inspections (move-in and move-out).';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_inspection_write ON public.inspections;
CREATE TRIGGER trg_enforce_inspection_write
  BEFORE INSERT OR UPDATE OR DELETE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.enforce_inspection_write();

-- A finalized property's photos are read-only too.
CREATE OR REPLACE FUNCTION public.enforce_photo_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_property_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  SELECT property_id INTO v_property_id
  FROM public.inspections
  WHERE id = NEW.inspection_id;

  IF v_property_id IS NOT NULL AND public.property_is_locked(v_property_id) THEN
    RAISE EXCEPTION 'This property has been finalized with a Moving Bundle and its photos can no longer be changed.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_photo_lock ON public.inspection_photos;
CREATE TRIGGER trg_enforce_photo_lock
  BEFORE INSERT OR UPDATE OR DELETE ON public.inspection_photos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_photo_lock();
