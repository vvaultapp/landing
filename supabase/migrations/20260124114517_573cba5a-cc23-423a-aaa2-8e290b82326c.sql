-- Create client_messages table for coach-client messaging
CREATE TABLE public.client_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('coach', 'client')),
  content TEXT NOT NULL,
  attachment_id UUID REFERENCES public.client_files(id) ON DELETE SET NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;

-- Coaches can view all messages in their workspace
CREATE POLICY "Coaches can view workspace messages"
ON public.client_messages
FOR SELECT
USING (is_coach(workspace_id));

-- Coaches can send messages
CREATE POLICY "Coaches can send messages"
ON public.client_messages
FOR INSERT
WITH CHECK (is_coach(workspace_id) AND sender_type = 'coach' AND sender_id = auth.uid());

-- Coaches can update messages (mark as read)
CREATE POLICY "Coaches can update messages"
ON public.client_messages
FOR UPDATE
USING (is_coach(workspace_id));

-- Coaches can delete messages
CREATE POLICY "Coaches can delete messages"
ON public.client_messages
FOR DELETE
USING (is_coach(workspace_id));

-- Clients can view their own messages
CREATE POLICY "Clients can view their messages"
ON public.client_messages
FOR SELECT
USING (get_client_id_for_user(auth.uid(), workspace_id) = client_id);

-- Clients can send messages
CREATE POLICY "Clients can send messages"
ON public.client_messages
FOR INSERT
WITH CHECK (
  get_client_id_for_user(auth.uid(), workspace_id) = client_id 
  AND sender_type = 'client' 
  AND sender_id = auth.uid()
);

-- Clients can update their messages (mark as read)
CREATE POLICY "Clients can update their messages"
ON public.client_messages
FOR UPDATE
USING (get_client_id_for_user(auth.uid(), workspace_id) = client_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_messages;

-- Create index for faster lookups
CREATE INDEX idx_client_messages_client_id ON public.client_messages(client_id);
CREATE INDEX idx_client_messages_created_at ON public.client_messages(created_at DESC);