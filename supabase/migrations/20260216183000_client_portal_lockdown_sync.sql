-- Client portal lockdown + synced drive + pending invite visibility support.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------
-- Invites: support client-specific invites
-- -------------------------------------------------------
ALTER TABLE public.invites
  ADD COLUMN IF NOT EXISTS invite_type TEXT NOT NULL DEFAULT 'team',
  ADD COLUMN IF NOT EXISTS client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'invites_invite_type_check'
  ) THEN
    ALTER TABLE public.invites
      ADD CONSTRAINT invites_invite_type_check
      CHECK (invite_type IN ('team', 'client'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_invites_workspace_type_client_created
  ON public.invites(workspace_id, invite_type, client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invites_client_id
  ON public.invites(client_id);

-- Backfill client linkage for still-pending invites where email uniquely maps to one client.
WITH normalized_clients AS (
  SELECT
    c.id AS client_id,
    c.workspace_id,
    lower(trim(c.email)) AS email_key
  FROM public.clients c
  WHERE c.email IS NOT NULL
    AND trim(c.email) <> ''
),
invite_candidates AS (
  SELECT
    i.id AS invite_id,
    i.workspace_id,
    lower(trim(i.email)) AS email_key
  FROM public.invites i
  WHERE i.client_id IS NULL
    AND i.accepted_at IS NULL
    AND i.email IS NOT NULL
    AND trim(i.email) <> ''
),
matches AS (
  SELECT
    ic.invite_id,
    nc.client_id,
    count(*) OVER (PARTITION BY ic.invite_id) AS match_count
  FROM invite_candidates ic
  JOIN normalized_clients nc
    ON nc.workspace_id = ic.workspace_id
   AND nc.email_key = ic.email_key
)
UPDATE public.invites i
SET
  client_id = m.client_id,
  invite_type = 'client'
FROM matches m
WHERE i.id = m.invite_id
  AND m.match_count = 1;

-- -------------------------------------------------------
-- Client folders + nested drive
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES public.client_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_folders_workspace_client
  ON public.client_folders(workspace_id, client_id);

CREATE INDEX IF NOT EXISTS idx_client_folders_parent
  ON public.client_folders(parent_folder_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_client_folders_client_parent_name
  ON public.client_folders(
    client_id,
    COALESCE(parent_folder_id, '00000000-0000-0000-0000-000000000000'::UUID),
    lower(name)
  );

ALTER TABLE public.client_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage client folders" ON public.client_folders;
CREATE POLICY "Owners can manage client folders"
  ON public.client_folders FOR ALL
  USING (public.is_workspace_owner(workspace_id::text, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id::text, auth.uid()));

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
  );

-- Keep updated_at current on folder updates.
DROP TRIGGER IF EXISTS update_client_folders_updated_at ON public.client_folders;
CREATE TRIGGER update_client_folders_updated_at
  BEFORE UPDATE ON public.client_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure a folder's parent stays inside the same client/workspace scope.
CREATE OR REPLACE FUNCTION public.client_folders_enforce_parent_scope()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  parent_row public.client_folders%ROWTYPE;
BEGIN
  IF NEW.parent_folder_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.parent_folder_id = NEW.id THEN
    RAISE EXCEPTION 'Folder cannot be its own parent'
      USING ERRCODE = '23514';
  END IF;

  SELECT *
  INTO parent_row
  FROM public.client_folders
  WHERE id = NEW.parent_folder_id;

  IF parent_row.id IS NULL THEN
    RAISE EXCEPTION 'Parent folder not found'
      USING ERRCODE = '23503';
  END IF;

  IF parent_row.client_id <> NEW.client_id OR parent_row.workspace_id <> NEW.workspace_id THEN
    RAISE EXCEPTION 'Parent folder must belong to the same client/workspace'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_client_folder_parent_scope ON public.client_folders;
CREATE TRIGGER enforce_client_folder_parent_scope
  BEFORE INSERT OR UPDATE ON public.client_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.client_folders_enforce_parent_scope();

-- -------------------------------------------------------
-- Client files: folder support + unified owner/client policies
-- -------------------------------------------------------
ALTER TABLE public.client_files
  ADD COLUMN IF NOT EXISTS folder_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'client_files_folder_id_fkey'
  ) THEN
    ALTER TABLE public.client_files
      ADD CONSTRAINT client_files_folder_id_fkey
      FOREIGN KEY (folder_id)
      REFERENCES public.client_folders(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_client_files_folder_id
  ON public.client_files(folder_id);

ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coaches can view workspace files" ON public.client_files;
DROP POLICY IF EXISTS "Clients can view their own files" ON public.client_files;
DROP POLICY IF EXISTS "Coaches can upload files" ON public.client_files;
DROP POLICY IF EXISTS "Clients can upload files" ON public.client_files;
DROP POLICY IF EXISTS "Coaches can delete files" ON public.client_files;
DROP POLICY IF EXISTS "Owners can manage client files" ON public.client_files;
DROP POLICY IF EXISTS "Clients can insert their own files" ON public.client_files;
DROP POLICY IF EXISTS "Clients can update their own files" ON public.client_files;
DROP POLICY IF EXISTS "Clients can delete their own files" ON public.client_files;

CREATE POLICY "Owners can manage client files"
  ON public.client_files FOR ALL
  USING (public.is_workspace_owner(workspace_id::text, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id::text, auth.uid()));

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
  );

CREATE POLICY "Clients can insert their own files"
  ON public.client_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.portal_roles pr
      WHERE pr.role = 'client'
        AND pr.user_id::text = auth.uid()::text
        AND pr.workspace_id::text = client_files.workspace_id::text
        AND pr.client_id::text = client_files.client_id::text
    )
    AND uploaded_by::text = auth.uid()::text
  );

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
  );

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
  );

-- Keep folder references inside the same client/workspace scope.
CREATE OR REPLACE FUNCTION public.client_files_enforce_folder_scope()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  folder_row public.client_folders%ROWTYPE;
BEGIN
  IF NEW.folder_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT *
  INTO folder_row
  FROM public.client_folders
  WHERE id = NEW.folder_id;

  IF folder_row.id IS NULL THEN
    RAISE EXCEPTION 'Folder not found'
      USING ERRCODE = '23503';
  END IF;

  IF folder_row.client_id <> NEW.client_id OR folder_row.workspace_id <> NEW.workspace_id THEN
    RAISE EXCEPTION 'Folder must belong to the same client/workspace'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_client_file_folder_scope ON public.client_files;
CREATE TRIGGER enforce_client_file_folder_scope
  BEFORE INSERT OR UPDATE ON public.client_files
  FOR EACH ROW
  EXECUTE FUNCTION public.client_files_enforce_folder_scope();

-- -------------------------------------------------------
-- Client task access restore for portal clients
-- -------------------------------------------------------
ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;

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
  );

-- Existing trigger currently restricts setters only; extend it to clients as well.
CREATE OR REPLACE FUNCTION public.client_tasks_restrict_setter_updates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_client_id TEXT;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.portal_roles pr
    WHERE pr.role = 'setter'
      AND pr.user_id::text = auth.uid()::text
      AND pr.workspace_id::text = NEW.workspace_id::text
  ) THEN
    IF NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
       OR NEW.created_by IS DISTINCT FROM OLD.created_by
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.due_date IS DISTINCT FROM OLD.due_date
       OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
       OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id THEN
      RAISE EXCEPTION 'Setter can only update task completion state'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  SELECT pr.client_id::text
  INTO v_client_id
  FROM public.portal_roles pr
  WHERE pr.role = 'client'
    AND pr.user_id::text = auth.uid()::text
    AND pr.workspace_id::text = NEW.workspace_id::text
  LIMIT 1;

  IF v_client_id IS NOT NULL AND v_client_id::text = NEW.client_id::text THEN
    IF NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
       OR NEW.created_by IS DISTINCT FROM OLD.created_by
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.due_date IS DISTINCT FROM OLD.due_date
       OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
       OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id THEN
      RAISE EXCEPTION 'Client can only update task completion state'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
