-- Create a table for connected Google calendars
CREATE TABLE public.connected_google_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  time_zone TEXT,
  access_role TEXT,
  primary_calendar BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, calendar_id)
);

-- Enable Row Level Security
ALTER TABLE public.connected_google_calendars ENABLE ROW LEVEL SECURITY;

-- Create policies for workspace members
CREATE POLICY "Workspace members can view connected calendars" 
ON public.connected_google_calendars 
FOR SELECT 
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert calendars" 
ON public.connected_google_calendars 
FOR INSERT 
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update calendars" 
ON public.connected_google_calendars 
FOR UPDATE 
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete calendars" 
ON public.connected_google_calendars 
FOR DELETE 
USING (public.is_workspace_member(workspace_id));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_connected_google_calendars_updated_at
BEFORE UPDATE ON public.connected_google_calendars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();