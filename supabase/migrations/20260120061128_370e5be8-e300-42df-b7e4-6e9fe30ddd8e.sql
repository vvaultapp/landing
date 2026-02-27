-- Allow coach personal tasks (tasks without a client)
-- Change client_id to be nullable so coaches can create personal tasks
ALTER TABLE public.client_tasks ALTER COLUMN client_id DROP NOT NULL;

-- Update RLS policies to allow tasks with null client_id
DROP POLICY IF EXISTS "Workspace members can view client_tasks" ON public.client_tasks;
DROP POLICY IF EXISTS "Workspace members can create client_tasks" ON public.client_tasks;
DROP POLICY IF EXISTS "Workspace members can update client_tasks" ON public.client_tasks;
DROP POLICY IF EXISTS "Workspace members can delete client_tasks" ON public.client_tasks;

-- Recreate policies with support for null client_id
CREATE POLICY "Workspace members can view client_tasks" 
ON public.client_tasks FOR SELECT 
USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can create client_tasks" 
ON public.client_tasks FOR INSERT 
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update client_tasks" 
ON public.client_tasks FOR UPDATE 
USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete client_tasks" 
ON public.client_tasks FOR DELETE 
USING (is_workspace_member(workspace_id));