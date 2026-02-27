-- One-time reset requested by product owner:
-- Remove all client records and client-scoped artifacts so clients must be re-invited.

BEGIN;

-- Remove client portal access rows first.
DELETE FROM public.portal_roles
WHERE role = 'client';

-- Remove client invites (pending/expired/accepted history for client lifecycle).
DELETE FROM public.invites
WHERE invite_type = 'client'
   OR client_id IS NOT NULL;

-- Remove client-linked meetings (main-user can recreate/assign fresh meetings).
DELETE FROM public.meetings
WHERE client_id IS NOT NULL;

-- Remove all clients.
DELETE FROM public.clients;

COMMIT;
