-- Ensure clients.id always auto-generates a UUID.
-- This prevents inserts from failing when id default drifted/missing.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.clients
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
