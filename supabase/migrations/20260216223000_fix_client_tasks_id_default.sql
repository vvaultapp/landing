-- Ensure client_tasks.id always auto-generates a UUID (or UUID string).
-- This prevents inserts from failing when the column default drifted/missing.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_data_type TEXT;
BEGIN
  SELECT c.data_type
  INTO v_data_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'client_tasks'
    AND c.column_name = 'id'
  LIMIT 1;

  IF v_data_type IS NULL THEN
    RAISE NOTICE 'client_tasks.id column not found, skipping default fix';
    RETURN;
  END IF;

  IF v_data_type = 'uuid' THEN
    EXECUTE 'ALTER TABLE public.client_tasks ALTER COLUMN id SET DEFAULT gen_random_uuid()';
  ELSE
    EXECUTE 'ALTER TABLE public.client_tasks ALTER COLUMN id SET DEFAULT gen_random_uuid()::text';
  END IF;

  EXECUTE 'ALTER TABLE public.client_tasks ALTER COLUMN id SET NOT NULL';
END
$$;

