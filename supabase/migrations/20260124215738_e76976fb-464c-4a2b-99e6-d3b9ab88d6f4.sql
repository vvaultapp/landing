-- Add assigned_to field to meetings table for team assignment (closers)
ALTER TABLE public.meetings
ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create calendar_todos table for Notion Calendar-like todos on dates
CREATE TABLE public.calendar_todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  due_time TIME,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_calendar_todos_workspace_date ON public.calendar_todos(workspace_id, due_date);
CREATE INDEX idx_meetings_assigned_to ON public.meetings(assigned_to);

-- Enable RLS on calendar_todos
ALTER TABLE public.calendar_todos ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_todos
CREATE POLICY "Workspace members can view todos"
  ON public.calendar_todos FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can create todos"
  ON public.calendar_todos FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id) AND created_by = auth.uid());

CREATE POLICY "Workspace members can update todos"
  ON public.calendar_todos FOR UPDATE
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace owners can delete todos"
  ON public.calendar_todos FOR DELETE
  USING (is_workspace_owner(workspace_id) OR created_by = auth.uid());

-- Trigger for updating updated_at on calendar_todos
CREATE TRIGGER update_calendar_todos_updated_at
  BEFORE UPDATE ON public.calendar_todos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();