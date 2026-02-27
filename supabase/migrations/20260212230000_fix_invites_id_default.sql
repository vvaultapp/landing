-- Ensure invite IDs are always generated server-side.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.invites
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL;
