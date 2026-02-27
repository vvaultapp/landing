-- Add structured options for onboarding question types like dropdown/multiple-choice.

ALTER TABLE public.client_onboarding_questions
  ADD COLUMN IF NOT EXISTS options_json JSONB;
