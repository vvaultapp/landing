-- Hard cleanup for all client-scoped records.
-- Keep this deterministic so a fresh reset leaves zero client data.

BEGIN;

DELETE FROM public.client_onboarding_responses;
DELETE FROM public.client_onboarding_questions;
DELETE FROM public.client_messages;
DELETE FROM public.client_tasks;
DELETE FROM public.client_files;
DELETE FROM public.client_folders;
DELETE FROM public.client_pins;

DELETE FROM public.meetings
WHERE client_id IS NOT NULL;

DELETE FROM public.invites
WHERE invite_type = 'client'
   OR client_id IS NOT NULL;

DELETE FROM public.portal_roles
WHERE role = 'client';

DELETE FROM public.clients;

COMMIT;
