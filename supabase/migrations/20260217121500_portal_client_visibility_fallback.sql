-- Ensure portal clients can see tasks/files/folders even if portal_roles linkage drifts.
-- We fall back to the canonical link: public.clients.user_id = auth.uid().

-- -------------------------------------------------------
-- Clients table: allow client to see/update their own record
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Clients can view their own record" ON public.clients;
CREATE POLICY "Clients can view their own record"
  ON public.clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = clients.workspace_id::text
        AND pr.client_id::text = clients.id::text
    )
    OR user_id::text = auth.uid()::text
  );

DROP POLICY IF EXISTS "Clients can update their own record" ON public.clients;
CREATE POLICY "Clients can update their own record"
  ON public.clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = clients.workspace_id::text
        AND pr.client_id::text = clients.id::text
    )
    OR user_id::text = auth.uid()::text
  );

-- -------------------------------------------------------
-- Client tasks: portal clients can see/update their tasks
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Clients can view their own tasks" ON public.client_tasks;
CREATE POLICY "Clients can view their own tasks"
  ON public.client_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = client_tasks.workspace_id::text
        AND pr.client_id::text = client_tasks.client_id::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id::text = client_tasks.client_id::text
        AND c.workspace_id::text = client_tasks.workspace_id::text
        AND c.user_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Clients can update their own tasks" ON public.client_tasks;
CREATE POLICY "Clients can update their own tasks"
  ON public.client_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = client_tasks.workspace_id::text
        AND pr.client_id::text = client_tasks.client_id::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id::text = client_tasks.client_id::text
        AND c.workspace_id::text = client_tasks.workspace_id::text
        AND c.user_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = client_tasks.workspace_id::text
        AND pr.client_id::text = client_tasks.client_id::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id::text = client_tasks.client_id::text
        AND c.workspace_id::text = client_tasks.workspace_id::text
        AND c.user_id::text = auth.uid()::text
    )
  );

-- -------------------------------------------------------
-- Client folders: allow client to manage their own folders
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Clients can manage their own folders" ON public.client_folders;
CREATE POLICY "Clients can manage their own folders"
  ON public.client_folders FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = client_folders.workspace_id::text
        AND pr.client_id::text = client_folders.client_id::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id::text = client_folders.client_id::text
        AND c.workspace_id::text = client_folders.workspace_id::text
        AND c.user_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = client_folders.workspace_id::text
        AND pr.client_id::text = client_folders.client_id::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id::text = client_folders.client_id::text
        AND c.workspace_id::text = client_folders.workspace_id::text
        AND c.user_id::text = auth.uid()::text
    )
  );

-- -------------------------------------------------------
-- Client files: allow client to see/manage their own files
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Clients can view their own files" ON public.client_files;
CREATE POLICY "Clients can view their own files"
  ON public.client_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = client_files.workspace_id::text
        AND pr.client_id::text = client_files.client_id::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id::text = client_files.client_id::text
        AND c.workspace_id::text = client_files.workspace_id::text
        AND c.user_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Clients can insert their own files" ON public.client_files;
CREATE POLICY "Clients can insert their own files"
  ON public.client_files FOR INSERT
  WITH CHECK (
    (
      EXISTS (
        SELECT 1
        FROM public.portal_roles pr
        WHERE pr.role = 'client'
          AND pr.user_id::text = auth.uid()::text
          AND pr.workspace_id::text = client_files.workspace_id::text
          AND pr.client_id::text = client_files.client_id::text
      )
      OR EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.id::text = client_files.client_id::text
          AND c.workspace_id::text = client_files.workspace_id::text
          AND c.user_id::text = auth.uid()::text
      )
    )
    AND uploaded_by::text = auth.uid()::text
  );

DROP POLICY IF EXISTS "Clients can update their own files" ON public.client_files;
CREATE POLICY "Clients can update their own files"
  ON public.client_files FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = client_files.workspace_id::text
        AND pr.client_id::text = client_files.client_id::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id::text = client_files.client_id::text
        AND c.workspace_id::text = client_files.workspace_id::text
        AND c.user_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = client_files.workspace_id::text
        AND pr.client_id::text = client_files.client_id::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id::text = client_files.client_id::text
        AND c.workspace_id::text = client_files.workspace_id::text
        AND c.user_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Clients can delete their own files" ON public.client_files;
CREATE POLICY "Clients can delete their own files"
  ON public.client_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = client_files.workspace_id::text
        AND pr.client_id::text = client_files.client_id::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id::text = client_files.client_id::text
        AND c.workspace_id::text = client_files.workspace_id::text
        AND c.user_id::text = auth.uid()::text
    )
  );

-- -------------------------------------------------------
-- Storage: make uploads bucket policies text-safe and allow client access via clients.user_id
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Users can upload their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their files" ON storage.objects;

DROP POLICY IF EXISTS "Coaches can upload files to workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can view workspace files" ON storage.objects;
DROP POLICY IF EXISTS "Coaches can update workspace files" ON storage.objects;
DROP POLICY IF EXISTS "Coaches can delete workspace files" ON storage.objects;

DROP POLICY IF EXISTS "Workspace members can download files" ON storage.objects;
DROP POLICY IF EXISTS "Workspace members can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Workspace members can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Workspace members can update files" ON storage.objects;

-- Common access predicate for workspace-rooted uploads:
-- Path: {workspace_id}/{client_id}/{...}
-- Also keep avatar uploads readable/writable via: {user_id}/avatar.png
CREATE POLICY "Workspace members can download files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'uploads'
    AND (
      public.is_workspace_member((storage.foldername(name))[1])
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.workspace_id::text = (storage.foldername(name))[1]
          AND c.id::text = (storage.foldername(name))[2]
          AND c.user_id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Workspace members can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'uploads'
    AND (
      public.is_workspace_member((storage.foldername(name))[1])
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.workspace_id::text = (storage.foldername(name))[1]
          AND c.id::text = (storage.foldername(name))[2]
          AND c.user_id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Workspace members can delete files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'uploads'
    AND (
      public.is_workspace_member((storage.foldername(name))[1])
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.workspace_id::text = (storage.foldername(name))[1]
          AND c.id::text = (storage.foldername(name))[2]
          AND c.user_id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Workspace members can update files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'uploads'
    AND (
      public.is_workspace_member((storage.foldername(name))[1])
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.workspace_id::text = (storage.foldername(name))[1]
          AND c.id::text = (storage.foldername(name))[2]
          AND c.user_id::text = auth.uid()::text
      )
    )
  );
