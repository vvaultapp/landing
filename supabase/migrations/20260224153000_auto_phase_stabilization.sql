-- Stabilize auto-phasing + setter role resolution compatibility.

-- 1) Normalize setter_codes schema across drifted environments.
DO $$
BEGIN
  IF to_regclass('public.setter_codes') IS NULL THEN
    RETURN;
  END IF;

  EXECUTE 'ALTER TABLE public.setter_codes ADD COLUMN IF NOT EXISTS user_id uuid';
  EXECUTE 'ALTER TABLE public.setter_codes ADD COLUMN IF NOT EXISTS workspace_id uuid';
  EXECUTE 'ALTER TABLE public.setter_codes ADD COLUMN IF NOT EXISTS code_hash text';
  EXECUTE 'ALTER TABLE public.setter_codes ADD COLUMN IF NOT EXISTS email text';
  EXECUTE 'ALTER TABLE public.setter_codes ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()';
  EXECUTE 'ALTER TABLE public.setter_codes ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()';

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'setter_codes'
      AND column_name = 'user_id'
      AND data_type <> 'uuid'
  ) THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.setter_codes ALTER COLUMN user_id TYPE uuid USING NULLIF(user_id::text, '''')::uuid';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not coerce setter_codes.user_id to uuid; leaving current type';
    END;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'setter_codes'
      AND column_name = 'workspace_id'
      AND data_type <> 'uuid'
  ) THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.setter_codes ALTER COLUMN workspace_id TYPE uuid USING NULLIF(workspace_id::text, '''')::uuid';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not coerce setter_codes.workspace_id to uuid; leaving current type';
    END;
  END IF;
END
$$;

ALTER TABLE IF EXISTS public.setter_codes
  DROP CONSTRAINT IF EXISTS setter_codes_user_workspace_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_setter_codes_user_workspace_unique
  ON public.setter_codes(user_id, workspace_id)
  WHERE user_id IS NOT NULL AND workspace_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_setter_codes_email ON public.setter_codes(email);

ALTER TABLE IF EXISTS public.setter_codes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regclass('public.setter_codes') IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_setter_codes_updated_at'
      AND tgrelid = 'public.setter_codes'::regclass
      AND NOT tgisinternal
  ) THEN
    EXECUTE 'CREATE TRIGGER update_setter_codes_updated_at BEFORE UPDATE ON public.setter_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
  END IF;
END
$$;

DO $$
DECLARE
  pol RECORD;
BEGIN
  IF to_regclass('public.setter_codes') IS NULL THEN
    RETURN;
  END IF;

  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'setter_codes'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.setter_codes', pol.policyname);
  END LOOP;
END
$$;

CREATE POLICY "setter_codes_select"
  ON public.setter_codes
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_workspace_owner(workspace_id::text, auth.uid())
  );

CREATE POLICY "setter_codes_insert_self"
  ON public.setter_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "setter_codes_update_self"
  ON public.setter_codes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2) Add policy controls needed for backlog behavior alignment.
ALTER TABLE public.instagram_phase_automation_settings
  ADD COLUMN IF NOT EXISTS historical_policy text NOT NULL DEFAULT 'manual_backlog_only',
  ADD COLUMN IF NOT EXISTS enabled_at timestamptz NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'instagram_phase_automation_settings_historical_policy_check'
      AND conrelid = 'public.instagram_phase_automation_settings'::regclass
  ) THEN
    ALTER TABLE public.instagram_phase_automation_settings
      ADD CONSTRAINT instagram_phase_automation_settings_historical_policy_check
      CHECK (historical_policy IN ('manual_backlog_only', 'auto_catchup'));
  END IF;
END
$$;

UPDATE public.instagram_phase_automation_settings
SET historical_policy = 'manual_backlog_only'
WHERE historical_policy IS NULL
   OR historical_policy NOT IN ('manual_backlog_only', 'auto_catchup');

UPDATE public.instagram_phase_automation_settings
SET enabled_at = COALESCE(enabled_at, updated_at, now())
WHERE enabled = true
  AND enabled_at IS NULL;
