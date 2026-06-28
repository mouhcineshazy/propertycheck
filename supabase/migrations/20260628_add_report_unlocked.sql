-- Add report_unlocked flag to inspections
-- Tracks whether a one-time $5.99 payment has unlocked a watermark-free PDF for this inspection
ALTER TABLE public.inspections
  ADD COLUMN IF NOT EXISTS report_unlocked BOOLEAN NOT NULL DEFAULT FALSE;
