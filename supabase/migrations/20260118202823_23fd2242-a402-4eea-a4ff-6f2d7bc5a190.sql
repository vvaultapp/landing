-- Fix storage RLS policies for uploads bucket

-- Allow workspace members (coaches) to SELECT/download files from uploads bucket
CREATE POLICY "Workspace members can download files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads' AND
  (
    -- Workspace folder structure: {workspace_id}/{client_id}/{filename}
    public.is_workspace_member((storage.foldername(name))[1]::uuid)
    OR
    -- Or if they are a client accessing their own files
    public.get_client_id_for_user(auth.uid(), (storage.foldername(name))[1]::uuid)::text = (storage.foldername(name))[2]
    OR
    -- For avatar files: {user_id}/avatar.png
    (storage.foldername(name))[1]::uuid = auth.uid()
  )
);

-- Allow workspace members to upload files
CREATE POLICY "Workspace members can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  (
    public.is_workspace_member((storage.foldername(name))[1]::uuid)
    OR
    -- Clients can upload to their own client folder
    public.get_client_id_for_user(auth.uid(), (storage.foldername(name))[1]::uuid)::text = (storage.foldername(name))[2]
    OR
    -- Avatar uploads
    (storage.foldername(name))[1]::uuid = auth.uid()
  )
);

-- Allow workspace members to delete files
CREATE POLICY "Workspace members can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads' AND
  (
    public.is_workspace_member((storage.foldername(name))[1]::uuid)
    OR
    (storage.foldername(name))[1]::uuid = auth.uid()
  )
);

-- Allow workspace members to update files
CREATE POLICY "Workspace members can update files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'uploads' AND
  (
    public.is_workspace_member((storage.foldername(name))[1]::uuid)
    OR
    (storage.foldername(name))[1]::uuid = auth.uid()
  )
);

-- Add policy for clients to insert files to client_files table
DROP POLICY IF EXISTS "Clients can upload files" ON public.client_files;
CREATE POLICY "Clients can upload files"
ON public.client_files
FOR INSERT
WITH CHECK (
  get_client_id_for_user(auth.uid(), workspace_id) = client_id
  AND uploaded_by = auth.uid()
);