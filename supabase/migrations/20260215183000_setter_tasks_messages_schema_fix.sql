-- Ensure setter tasks + coach/setter chat tables match what the app expects.
-- We make this migration defensive because early deployments may have created
-- these tables with partial schemas.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------
-- setter_tasks
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.setter_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setter_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.setter_tasks
  ADD COLUMN IF NOT EXISTS setter_id UUID,
  ADD COLUMN IF NOT EXISTS workspace_id UUID,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.setter_tasks ENABLE ROW LEVEL SECURITY;

-- Policies (owner uses workspace_members role; setter only sees their own tasks).
DROP POLICY IF EXISTS "Owners can view setter tasks" ON public.setter_tasks;
CREATE POLICY "Owners can view setter tasks"
  ON public.setter_tasks FOR SELECT
  USING (public.is_workspace_owner(workspace_id::text, auth.uid()));

DROP POLICY IF EXISTS "Owners can create setter tasks" ON public.setter_tasks;
CREATE POLICY "Owners can create setter tasks"
  ON public.setter_tasks FOR INSERT
  WITH CHECK (
    public.is_workspace_owner(workspace_id::text, auth.uid())
    AND (created_by IS NULL OR created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can update setter tasks" ON public.setter_tasks;
CREATE POLICY "Owners can update setter tasks"
  ON public.setter_tasks FOR UPDATE
  USING (public.is_workspace_owner(workspace_id::text, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id::text, auth.uid()));

DROP POLICY IF EXISTS "Owners can delete setter tasks" ON public.setter_tasks;
CREATE POLICY "Owners can delete setter tasks"
  ON public.setter_tasks FOR DELETE
  USING (public.is_workspace_owner(workspace_id::text, auth.uid()));

DROP POLICY IF EXISTS "Setters can view their setter tasks" ON public.setter_tasks;
CREATE POLICY "Setters can view their setter tasks"
  ON public.setter_tasks FOR SELECT
  USING (
    setter_id = auth.uid()
    AND public.is_workspace_member(workspace_id::text)
  );

DROP POLICY IF EXISTS "Setters can update their setter tasks" ON public.setter_tasks;
CREATE POLICY "Setters can update their setter tasks"
  ON public.setter_tasks FOR UPDATE
  USING (
    setter_id = auth.uid()
    AND public.is_workspace_member(workspace_id::text)
  )
  WITH CHECK (
    setter_id = auth.uid()
    AND public.is_workspace_member(workspace_id::text)
  );

CREATE INDEX IF NOT EXISTS idx_setter_tasks_workspace_id ON public.setter_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_setter_tasks_setter_id ON public.setter_tasks(setter_id);

-- Keep updated_at current (best-effort).
DROP TRIGGER IF EXISTS update_setter_tasks_updated_at ON public.setter_tasks;
CREATE TRIGGER update_setter_tasks_updated_at
  BEFORE UPDATE ON public.setter_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- -------------------------------------------------------
-- setter_messages
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.setter_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setter_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('coach', 'setter')),
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.setter_messages
  ADD COLUMN IF NOT EXISTS setter_id UUID,
  ADD COLUMN IF NOT EXISTS workspace_id UUID,
  ADD COLUMN IF NOT EXISTS sender_id UUID,
  ADD COLUMN IF NOT EXISTS sender_type TEXT,
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.setter_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view setter messages" ON public.setter_messages;
CREATE POLICY "Owners can view setter messages"
  ON public.setter_messages FOR SELECT
  USING (public.is_workspace_owner(workspace_id::text, auth.uid()));

DROP POLICY IF EXISTS "Owners can send setter messages" ON public.setter_messages;
CREATE POLICY "Owners can send setter messages"
  ON public.setter_messages FOR INSERT
  WITH CHECK (
    public.is_workspace_owner(workspace_id::text, auth.uid())
    AND sender_id = auth.uid()
    AND sender_type = 'coach'
  );

DROP POLICY IF EXISTS "Owners can update setter messages" ON public.setter_messages;
CREATE POLICY "Owners can update setter messages"
  ON public.setter_messages FOR UPDATE
  USING (public.is_workspace_owner(workspace_id::text, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id::text, auth.uid()));

DROP POLICY IF EXISTS "Setters can view their setter messages" ON public.setter_messages;
CREATE POLICY "Setters can view their setter messages"
  ON public.setter_messages FOR SELECT
  USING (
    setter_id = auth.uid()
    AND public.is_workspace_member(workspace_id::text)
  );

DROP POLICY IF EXISTS "Setters can send setter messages" ON public.setter_messages;
CREATE POLICY "Setters can send setter messages"
  ON public.setter_messages FOR INSERT
  WITH CHECK (
    setter_id = auth.uid()
    AND public.is_workspace_member(workspace_id::text)
    AND sender_id = auth.uid()
    AND sender_type = 'setter'
  );

DROP POLICY IF EXISTS "Setters can update setter messages" ON public.setter_messages;
CREATE POLICY "Setters can update setter messages"
  ON public.setter_messages FOR UPDATE
  USING (
    setter_id = auth.uid()
    AND public.is_workspace_member(workspace_id::text)
  )
  WITH CHECK (
    setter_id = auth.uid()
    AND public.is_workspace_member(workspace_id::text)
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'setter_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.setter_messages;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_setter_messages_workspace_setter_created
  ON public.setter_messages(workspace_id, setter_id, created_at DESC);

