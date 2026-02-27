-- Repair drifted defaults on core workspace bootstrap tables.
-- New owner accounts rely on these defaults when rows are created via RPCs/triggers.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- workspaces.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'id'
  ) THEN
    EXECUTE 'ALTER TABLE public.workspaces ALTER COLUMN id SET DEFAULT gen_random_uuid()';
    EXECUTE 'ALTER TABLE public.workspaces ALTER COLUMN id SET NOT NULL';
  END IF;
END
$$;

-- workspace_members.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspace_members' AND column_name = 'id'
  ) THEN
    EXECUTE 'ALTER TABLE public.workspace_members ALTER COLUMN id SET DEFAULT gen_random_uuid()';
    EXECUTE 'ALTER TABLE public.workspace_members ALTER COLUMN id SET NOT NULL';
  END IF;
END
$$;

-- onboarding_responses.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'onboarding_responses' AND column_name = 'id'
  ) THEN
    EXECUTE 'ALTER TABLE public.onboarding_responses ALTER COLUMN id SET DEFAULT gen_random_uuid()';
    EXECUTE 'ALTER TABLE public.onboarding_responses ALTER COLUMN id SET NOT NULL';
  END IF;
END
$$;

-- portal_roles.id may be uuid or text depending on project drift.
DO $$
DECLARE
  v_data_type text;
BEGIN
  SELECT data_type
  INTO v_data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'portal_roles'
    AND column_name = 'id'
  LIMIT 1;

  IF v_data_type IS NOT NULL THEN
    IF v_data_type = 'uuid' THEN
      EXECUTE 'ALTER TABLE public.portal_roles ALTER COLUMN id SET DEFAULT gen_random_uuid()';
    ELSE
      EXECUTE 'ALTER TABLE public.portal_roles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text';
    END IF;
    EXECUTE 'ALTER TABLE public.portal_roles ALTER COLUMN id SET NOT NULL';
  END IF;
END
$$;

-- portal_roles.created_at should always be present for deterministic ordering.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'portal_roles' AND column_name = 'created_at'
  ) THEN
    UPDATE public.portal_roles
    SET created_at = now()
    WHERE created_at IS NULL;

    EXECUTE 'ALTER TABLE public.portal_roles ALTER COLUMN created_at SET DEFAULT now()';
    EXECUTE 'ALTER TABLE public.portal_roles ALTER COLUMN created_at SET NOT NULL';
  END IF;
END
$$;
