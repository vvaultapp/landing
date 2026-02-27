-- Create setter_tasks table for tasks between coach and setters
CREATE TABLE public.setter_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setter_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.setter_tasks ENABLE ROW LEVEL SECURITY;

-- Coaches can view all setter tasks in their workspace
CREATE POLICY "Coaches can view workspace setter tasks"
ON public.setter_tasks
FOR SELECT
USING (is_coach(workspace_id));

-- Coaches can create setter tasks
CREATE POLICY "Coaches can create setter tasks"
ON public.setter_tasks
FOR INSERT
WITH CHECK (is_coach(workspace_id) AND created_by = auth.uid());

-- Coaches can update setter tasks
CREATE POLICY "Coaches can update setter tasks"
ON public.setter_tasks
FOR UPDATE
USING (is_coach(workspace_id));

-- Coaches can delete setter tasks
CREATE POLICY "Coaches can delete setter tasks"
ON public.setter_tasks
FOR DELETE
USING (is_coach(workspace_id));

-- Setters can view their own tasks
CREATE POLICY "Setters can view their tasks"
ON public.setter_tasks
FOR SELECT
USING (setter_id = auth.uid());

-- Setters can update their own tasks (status changes)
CREATE POLICY "Setters can update their tasks"
ON public.setter_tasks
FOR UPDATE
USING (setter_id = auth.uid());

-- Create setter_messages table for coach-setter messaging
CREATE TABLE public.setter_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setter_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('coach', 'setter')),
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.setter_messages ENABLE ROW LEVEL SECURITY;

-- Coaches can view all setter messages in their workspace
CREATE POLICY "Coaches can view workspace setter messages"
ON public.setter_messages
FOR SELECT
USING (is_coach(workspace_id));

-- Coaches can send messages to setters
CREATE POLICY "Coaches can send setter messages"
ON public.setter_messages
FOR INSERT
WITH CHECK (is_coach(workspace_id) AND sender_type = 'coach' AND sender_id = auth.uid());

-- Coaches can update messages (mark as read)
CREATE POLICY "Coaches can update setter messages"
ON public.setter_messages
FOR UPDATE
USING (is_coach(workspace_id));

-- Setters can view their own messages
CREATE POLICY "Setters can view their messages"
ON public.setter_messages
FOR SELECT
USING (setter_id = auth.uid());

-- Setters can send messages
CREATE POLICY "Setters can send messages"
ON public.setter_messages
FOR INSERT
WITH CHECK (setter_id = auth.uid() AND sender_type = 'setter' AND sender_id = auth.uid());

-- Setters can update their messages (mark as read)
CREATE POLICY "Setters can update their messages"
ON public.setter_messages
FOR UPDATE
USING (setter_id = auth.uid());

-- Enable realtime for setter messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.setter_messages;

-- Create indexes for performance
CREATE INDEX idx_setter_tasks_setter_id ON public.setter_tasks(setter_id);
CREATE INDEX idx_setter_tasks_workspace_id ON public.setter_tasks(workspace_id);
CREATE INDEX idx_setter_messages_setter_id ON public.setter_messages(setter_id);
CREATE INDEX idx_setter_messages_created_at ON public.setter_messages(created_at DESC);

-- Add trigger for updated_at on setter_tasks
CREATE TRIGGER update_setter_tasks_updated_at
BEFORE UPDATE ON public.setter_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();