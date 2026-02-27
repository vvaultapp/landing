-- =====================================================
-- MILESTONE 1: Client Portal - DB Tables + RBAC
-- =====================================================

-- 1. Create a new enum for portal roles (COACH, CLIENT, SETTER)
-- This is separate from workspace_role to avoid conflicts with existing system
CREATE TYPE public.portal_role AS ENUM ('coach', 'client', 'setter');

-- 2. Create clients table (represents a client record in a workspace)
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- linked user account (nullable until they sign up)
  
  -- Basic info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  instagram_handle TEXT,
  
  -- Onboarding
  business_name TEXT,
  goals TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Subscription / access control
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'paused')),
  access_until TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 3. Create client_files table
CREATE TABLE public.client_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- File info
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, image, video, zip, csv, xlsx
  mime_type TEXT,
  size_bytes BIGINT,
  is_video BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on client_files
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

-- 4. Create client_tasks table
CREATE TABLE public.client_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Task info
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on client_tasks
ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create portal_roles table for RBAC (separate from workspace_members)
CREATE TABLE public.portal_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role portal_role NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE, -- only set if role = 'client'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE (user_id, workspace_id) -- one role per user per workspace
);

-- Enable RLS on portal_roles
ALTER TABLE public.portal_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECURITY DEFINER FUNCTIONS FOR RBAC
-- =====================================================

-- 6. Function to check if user has a specific portal role in a workspace
CREATE OR REPLACE FUNCTION public.has_portal_role(_user_id UUID, _workspace_id UUID, _role portal_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portal_roles
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND role = _role
  )
$$;

-- 7. Function to check if user is a coach in a workspace
CREATE OR REPLACE FUNCTION public.is_coach(_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_portal_role(auth.uid(), _workspace_id, 'coach')
$$;

-- 8. Function to check if user is a client and get their client_id
CREATE OR REPLACE FUNCTION public.get_client_id_for_user(_user_id UUID, _workspace_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id
  FROM public.portal_roles
  WHERE user_id = _user_id
    AND workspace_id = _workspace_id
    AND role = 'client'
$$;

-- 9. Function to check if a user can access a specific client's data
CREATE OR REPLACE FUNCTION public.can_access_client(_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clients c
    WHERE c.id = _client_id
      AND (
        -- Coach can access all clients in their workspace
        public.is_coach(c.workspace_id)
        OR
        -- Client can only access their own record
        public.get_client_id_for_user(auth.uid(), c.workspace_id) = _client_id
      )
  )
$$;

-- =====================================================
-- RLS POLICIES FOR clients TABLE
-- =====================================================

-- Coaches can view all clients in their workspace
CREATE POLICY "Coaches can view workspace clients"
ON public.clients FOR SELECT
USING (public.is_coach(workspace_id));

-- Clients can view their own record
CREATE POLICY "Clients can view their own record"
ON public.clients FOR SELECT
USING (public.get_client_id_for_user(auth.uid(), workspace_id) = id);

-- Coaches can create clients
CREATE POLICY "Coaches can create clients"
ON public.clients FOR INSERT
WITH CHECK (public.is_coach(workspace_id));

-- Coaches can update clients
CREATE POLICY "Coaches can update clients"
ON public.clients FOR UPDATE
USING (public.is_coach(workspace_id));

-- Clients can update their own record (for onboarding)
CREATE POLICY "Clients can update their own record"
ON public.clients FOR UPDATE
USING (public.get_client_id_for_user(auth.uid(), workspace_id) = id);

-- Coaches can delete clients
CREATE POLICY "Coaches can delete clients"
ON public.clients FOR DELETE
USING (public.is_coach(workspace_id));

-- =====================================================
-- RLS POLICIES FOR client_files TABLE
-- =====================================================

-- Coaches can view all files in their workspace
CREATE POLICY "Coaches can view workspace files"
ON public.client_files FOR SELECT
USING (public.is_coach(workspace_id));

-- Clients can view their own files
CREATE POLICY "Clients can view their own files"
ON public.client_files FOR SELECT
USING (public.get_client_id_for_user(auth.uid(), workspace_id) = client_id);

-- Coaches can upload files
CREATE POLICY "Coaches can upload files"
ON public.client_files FOR INSERT
WITH CHECK (public.is_coach(workspace_id) AND uploaded_by = auth.uid());

-- Coaches can delete files
CREATE POLICY "Coaches can delete files"
ON public.client_files FOR DELETE
USING (public.is_coach(workspace_id));

-- =====================================================
-- RLS POLICIES FOR client_tasks TABLE
-- =====================================================

-- Coaches can view all tasks in their workspace
CREATE POLICY "Coaches can view workspace tasks"
ON public.client_tasks FOR SELECT
USING (public.is_coach(workspace_id));

-- Clients can view their own tasks
CREATE POLICY "Clients can view their own tasks"
ON public.client_tasks FOR SELECT
USING (public.get_client_id_for_user(auth.uid(), workspace_id) = client_id);

-- Coaches can create tasks
CREATE POLICY "Coaches can create tasks"
ON public.client_tasks FOR INSERT
WITH CHECK (public.is_coach(workspace_id) AND created_by = auth.uid());

-- Coaches can update tasks
CREATE POLICY "Coaches can update tasks"
ON public.client_tasks FOR UPDATE
USING (public.is_coach(workspace_id));

-- Clients can update their own tasks (to mark complete)
CREATE POLICY "Clients can update their own tasks"
ON public.client_tasks FOR UPDATE
USING (public.get_client_id_for_user(auth.uid(), workspace_id) = client_id);

-- Coaches can delete tasks
CREATE POLICY "Coaches can delete tasks"
ON public.client_tasks FOR DELETE
USING (public.is_coach(workspace_id));

-- =====================================================
-- RLS POLICIES FOR portal_roles TABLE
-- =====================================================

-- Coaches can view all roles in their workspace
CREATE POLICY "Coaches can view workspace roles"
ON public.portal_roles FOR SELECT
USING (public.is_coach(workspace_id));

-- Users can view their own role
CREATE POLICY "Users can view their own role"
ON public.portal_roles FOR SELECT
USING (user_id = auth.uid());

-- Coaches can create roles (to add clients/setters)
CREATE POLICY "Coaches can create roles"
ON public.portal_roles FOR INSERT
WITH CHECK (public.is_coach(workspace_id));

-- Coaches can delete roles
CREATE POLICY "Coaches can delete roles"
ON public.portal_roles FOR DELETE
USING (public.is_coach(workspace_id));

-- =====================================================
-- AUTO-ASSIGN COACH ROLE TO WORKSPACE OWNERS
-- =====================================================

-- When a workspace_member is created with 'owner' role, also create a portal_role as 'coach'
CREATE OR REPLACE FUNCTION public.assign_coach_role_to_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'owner' THEN
    INSERT INTO public.portal_roles (user_id, workspace_id, role)
    VALUES (NEW.user_id, NEW.workspace_id, 'coach')
    ON CONFLICT (user_id, workspace_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_coach_on_owner_insert
AFTER INSERT ON public.workspace_members
FOR EACH ROW
EXECUTE FUNCTION public.assign_coach_role_to_owner();

-- =====================================================
-- UPDATED_AT TRIGGER FOR CLIENTS
-- =====================================================

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_tasks_updated_at
BEFORE UPDATE ON public.client_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_clients_workspace_id ON public.clients(workspace_id);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_client_files_client_id ON public.client_files(client_id);
CREATE INDEX idx_client_files_workspace_id ON public.client_files(workspace_id);
CREATE INDEX idx_client_tasks_client_id ON public.client_tasks(client_id);
CREATE INDEX idx_client_tasks_workspace_id ON public.client_tasks(workspace_id);
CREATE INDEX idx_portal_roles_user_id ON public.portal_roles(user_id);
CREATE INDEX idx_portal_roles_workspace_id ON public.portal_roles(workspace_id);