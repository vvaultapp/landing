-- Create table for client access PINs
CREATE TABLE public.client_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_pins ENABLE ROW LEVEL SECURITY;

-- Coaches can view/manage PINs for their workspace clients
CREATE POLICY "Coaches can view client pins"
ON public.client_pins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_pins.client_id
    AND is_coach(c.workspace_id)
  )
);

-- Clients can view their own PIN record (to check if one exists)
CREATE POLICY "Clients can view their own pin"
ON public.client_pins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_pins.client_id
    AND get_client_id_for_user(auth.uid(), c.workspace_id) = c.id
  )
);

-- Clients can create their own PIN (during onboarding)
CREATE POLICY "Clients can create their own pin"
ON public.client_pins
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_pins.client_id
    AND get_client_id_for_user(auth.uid(), c.workspace_id) = c.id
  )
);

-- Clients can update their own PIN
CREATE POLICY "Clients can update their own pin"
ON public.client_pins
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_pins.client_id
    AND get_client_id_for_user(auth.uid(), c.workspace_id) = c.id
  )
);

-- Coaches can reset client PINs
CREATE POLICY "Coaches can manage client pins"
ON public.client_pins
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_pins.client_id
    AND is_coach(c.workspace_id)
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_client_pins_updated_at
BEFORE UPDATE ON public.client_pins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();