-- Fix storage policies to enforce path ownership
-- Previous policies allowed any authenticated user to write to any path.
-- Now we enforce that the first folder segment matches the uploading user's ID.
-- Required path convention: {user_id}/{inspection_id}/{filename}

DROP POLICY IF EXISTS "Authenticated users can upload inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view inspection photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload inspection photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'inspection-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own inspection photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'inspection-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own inspection photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'inspection-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read remains open: required for shared inspection report links
CREATE POLICY "Anyone can view inspection photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'inspection-photos');
