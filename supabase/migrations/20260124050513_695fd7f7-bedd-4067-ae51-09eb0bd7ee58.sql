-- Create setter_codes table for appointment setter secure codes
CREATE TABLE public.setter_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT setter_codes_user_workspace_unique UNIQUE (user_id, workspace_id)
);

-- Create index on email for quick lookups during login
CREATE INDEX idx_setter_codes_email ON public.setter_codes(email);

-- Enable RLS
ALTER TABLE public.setter_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for setter_codes
-- Coaches can view setter codes in their workspace
CREATE POLICY "Coaches can view setter codes"
  ON public.setter_codes
  FOR SELECT
  USING (is_coach(workspace_id));

-- Setters can create their own code
CREATE POLICY "Setters can create their own code"
  ON public.setter_codes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Setters can update their own code
CREATE POLICY "Setters can update their own code"
  ON public.setter_codes
  FOR UPDATE
  USING (user_id = auth.uid());

-- Setters can view their own code
CREATE POLICY "Setters can view their own code"
  ON public.setter_codes
  FOR SELECT
  USING (user_id = auth.uid());

-- Add email column to client_pins for faster lookup during login
ALTER TABLE public.client_pins ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index on email for client_pins
CREATE INDEX IF NOT EXISTS idx_client_pins_email ON public.client_pins(email);

-- Add trigger for updated_at on setter_codes
CREATE TRIGGER update_setter_codes_updated_at
  BEFORE UPDATE ON public.setter_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();