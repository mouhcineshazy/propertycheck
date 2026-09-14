-- Room-by-room inspections: a "room" is a numbered instance of a category,
-- e.g. room_type='bedroom' + room_label='Bedroom 1'. room_type stays the
-- category (for icon/ordering); room_label is the display identity within an
-- inspection. Nullable so existing photos (grouped by category only) are unaffected.
ALTER TABLE public.inspection_photos
  ADD COLUMN IF NOT EXISTS room_label TEXT;
