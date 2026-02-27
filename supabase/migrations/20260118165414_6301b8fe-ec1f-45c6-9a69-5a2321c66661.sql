-- Drop existing restrictive policies on storage.objects
DROP POLICY IF EXISTS "Users can upload their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their files" ON storage.objects;

-- Create new policies that allow coaches to manage files for their workspace
-- Coaches can upload files to their workspace folder
CREATE POLICY "Coaches can upload files to workspace"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' 
  AND public.is_workspace_member((storage.foldername(name))[1]::uuid)
);

-- Coaches and clients can view files in their workspace
CREATE POLICY "Users can view workspace files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'uploads'
  AND public.is_workspace_member((storage.foldername(name))[1]::uuid)
);

-- Coaches can update files in their workspace
CREATE POLICY "Coaches can update workspace files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'uploads'
  AND public.is_workspace_member((storage.foldername(name))[1]::uuid)
);

-- Coaches can delete files in their workspace
CREATE POLICY "Coaches can delete workspace files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'uploads'
  AND public.is_workspace_member((storage.foldername(name))[1]::uuid)
);