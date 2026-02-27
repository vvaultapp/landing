-- Create table for custom onboarding questions per client
CREATE TABLE public.client_onboarding_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL DEFAULT 0,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'textarea', 'phone', 'instagram'
  is_required BOOLEAN NOT NULL DEFAULT false,
  placeholder TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing client responses to custom questions
CREATE TABLE public.client_onboarding_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.client_onboarding_questions(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  response_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, question_id)
);

-- Enable RLS
ALTER TABLE public.client_onboarding_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for questions (coaches can manage, clients can view their own)
CREATE POLICY "Coaches can manage questions for their workspace"
ON public.client_onboarding_questions
FOR ALL
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Clients can view their own questions"
ON public.client_onboarding_questions
FOR SELECT
USING (public.can_access_client(client_id));

-- RLS policies for responses (coaches can view all, clients can manage their own)
CREATE POLICY "Coaches can view responses for their workspace"
ON public.client_onboarding_responses
FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Clients can manage their own responses"
ON public.client_onboarding_responses
FOR ALL
USING (public.can_access_client(client_id));

-- Create indexes for performance
CREATE INDEX idx_onboarding_questions_client ON public.client_onboarding_questions(client_id);
CREATE INDEX idx_onboarding_responses_client ON public.client_onboarding_responses(client_id);