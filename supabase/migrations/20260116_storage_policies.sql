-- ============================================
-- Storage Policies for Inspection Photos
-- Version: 1.0.1
-- Date: 2026-01-16
-- ============================================

-- Create the storage bucket if it doesn't exist
-- Note: This needs to be run with service role permissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspection-photos', 'inspection-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Storage policies work differently from table RLS.
-- They use storage.objects table and check bucket_id and name (path).
--
-- IMPORTANT: Run these in Supabase Dashboard if they fail via migration.
-- Storage policies sometimes need to be created through the Dashboard UI.

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Authenticated users can upload inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view inspection photos" ON storage.objects;

-- Policy: Authenticated users can upload files to inspection-photos bucket
-- Simple policy: any authenticated user can upload to this bucket
-- The app enforces which inspection IDs are valid
CREATE POLICY "Authenticated users can upload inspection photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'inspection-photos');

-- Policy: Authenticated users can update photos in this bucket
CREATE POLICY "Users can update own inspection photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'inspection-photos');

-- Policy: Authenticated users can delete photos from this bucket
CREATE POLICY "Users can delete own inspection photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'inspection-photos');

-- Policy: Anyone can read photos (bucket is public for shared reports)
-- This allows unauthenticated access to view shared inspection photos
CREATE POLICY "Anyone can view inspection photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'inspection-photos');
