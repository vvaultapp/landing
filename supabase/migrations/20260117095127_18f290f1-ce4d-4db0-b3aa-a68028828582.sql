-- =====================================================
-- ACQ DASHBOARD: Multi-Tenant Database Schema
-- =====================================================

-- 1. Create role enum
CREATE TYPE public.workspace_role AS ENUM ('owner', 'setter');

-- 2. Create workspaces table
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- 3. Create workspace_members table (links users to workspaces with roles)
CREATE TABLE public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'setter',
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 4. Create invites table
CREATE TABLE public.invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role workspace_role NOT NULL DEFAULT 'setter',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- 5. Create onboarding_responses table
CREATE TABLE public.onboarding_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT,
  has_team BOOLEAN DEFAULT false,
  revenue_range TEXT,
  kpi_file_path TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- 6. Create files table for all uploads
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('profile_pic', 'kpi_upload', 'csv_upload')),
  storage_path TEXT NOT NULL,
  original_name TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 7. Create email_verifications table
CREATE TABLE public.email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- 8. Create password_resets table
CREATE TABLE public.password_resets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- 9. Update profiles table to link to workspace
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 10. Update filter_runs to be workspace-scoped
ALTER TABLE public.filter_runs
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is member of workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
  )
$$;

-- Function to check if user is owner of workspace
CREATE OR REPLACE FUNCTION public.is_workspace_owner(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
      AND role = 'owner'
  )
$$;

-- Function to get user's role in workspace
CREATE OR REPLACE FUNCTION public.get_workspace_role(ws_id UUID)
RETURNS workspace_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.workspace_members
  WHERE workspace_id = ws_id
    AND user_id = auth.uid()
  LIMIT 1
$$;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Workspaces: Users can only see workspaces they are members of
CREATE POLICY "Users can view their workspaces"
ON public.workspaces FOR SELECT
USING (public.is_workspace_member(id));

CREATE POLICY "Users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owners can update their workspaces"
ON public.workspaces FOR UPDATE
USING (public.is_workspace_owner(id));

CREATE POLICY "Owners can delete their workspaces"
ON public.workspaces FOR DELETE
USING (public.is_workspace_owner(id));

-- Workspace Members: Users can see members of their workspaces
CREATE POLICY "Members can view workspace members"
ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Users can join workspaces"
ON public.workspace_members FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can manage members"
ON public.workspace_members FOR UPDATE
USING (public.is_workspace_owner(workspace_id));

CREATE POLICY "Owners can remove members"
ON public.workspace_members FOR DELETE
USING (public.is_workspace_owner(workspace_id) OR user_id = auth.uid());

-- Invites: Owners can manage, invitees can view their own
CREATE POLICY "Owners can view workspace invites"
ON public.invites FOR SELECT
USING (public.is_workspace_owner(workspace_id));

CREATE POLICY "Owners can create invites"
ON public.invites FOR INSERT
WITH CHECK (public.is_workspace_owner(workspace_id));

CREATE POLICY "Owners can delete invites"
ON public.invites FOR DELETE
USING (public.is_workspace_owner(workspace_id));

-- Onboarding: Members can view, owners can update
CREATE POLICY "Members can view onboarding"
ON public.onboarding_responses FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Owners can create onboarding"
ON public.onboarding_responses FOR INSERT
WITH CHECK (public.is_workspace_owner(workspace_id));

CREATE POLICY "Owners can update onboarding"
ON public.onboarding_responses FOR UPDATE
USING (public.is_workspace_owner(workspace_id));

-- Files: Workspace members can view, uploaders and owners can manage
CREATE POLICY "Members can view workspace files"
ON public.files FOR SELECT
USING (workspace_id IS NULL AND uploaded_by = auth.uid() OR public.is_workspace_member(workspace_id));

CREATE POLICY "Users can upload files"
ON public.files FOR INSERT
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Uploaders and owners can delete files"
ON public.files FOR DELETE
USING (uploaded_by = auth.uid() OR (workspace_id IS NOT NULL AND public.is_workspace_owner(workspace_id)));

-- Email verifications: Users can only see their own
CREATE POLICY "Users can view their verifications"
ON public.email_verifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create verifications"
ON public.email_verifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update verifications"
ON public.email_verifications FOR UPDATE
USING (true);

-- Password resets: Users can only see their own
CREATE POLICY "Users can view their resets"
ON public.password_resets FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create resets"
ON public.password_resets FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update resets"
ON public.password_resets FOR UPDATE
USING (true);

-- Update filter_runs policies to be workspace-aware
DROP POLICY IF EXISTS "Users can view their own runs" ON public.filter_runs;
DROP POLICY IF EXISTS "Users can create their own runs" ON public.filter_runs;
DROP POLICY IF EXISTS "Users can update their own runs" ON public.filter_runs;
DROP POLICY IF EXISTS "Users can delete their own runs" ON public.filter_runs;

CREATE POLICY "Members can view workspace runs"
ON public.filter_runs FOR SELECT
USING (
  (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id))
  OR (workspace_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Members can create workspace runs"
ON public.filter_runs FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  (workspace_id IS NULL OR public.is_workspace_member(workspace_id))
);

CREATE POLICY "Owners can update workspace runs"
ON public.filter_runs FOR UPDATE
USING (
  (workspace_id IS NOT NULL AND public.is_workspace_owner(workspace_id))
  OR (workspace_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Owners can delete workspace runs"
ON public.filter_runs FOR DELETE
USING (
  (workspace_id IS NOT NULL AND public.is_workspace_owner(workspace_id))
  OR (workspace_id IS NULL AND user_id = auth.uid())
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps trigger for new tables
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at
BEFORE UPDATE ON public.workspace_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_responses_updated_at
BEFORE UPDATE ON public.onboarding_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for uploads bucket
CREATE POLICY "Users can upload their files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their files"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their files"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_workspace ON public.invites(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(token);
CREATE INDEX IF NOT EXISTS idx_files_workspace ON public.files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_filter_runs_workspace ON public.filter_runs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON public.email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON public.password_resets(token);