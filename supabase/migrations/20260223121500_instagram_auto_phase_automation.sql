-- Automatic AI lead phasing: settings, metadata, locking, and permissions.

CREATE TABLE IF NOT EXISTS public.instagram_phase_automation_settings (
  workspace_id text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  mode text NOT NULL DEFAULT 'shadow' CHECK (mode IN ('shadow', 'enforce')),
  min_confidence integer NOT NULL DEFAULT 70,
  incremental_max_conversations integer NOT NULL DEFAULT 30,
  catchup_max_conversations integer NOT NULL DEFAULT 120,
  classify_on_any_message boolean NOT NULL DEFAULT true,
  apply_temperature boolean NOT NULL DEFAULT true,
  manual_lock_enabled boolean NOT NULL DEFAULT true,
  uncertain_new_lead_window_hours integer NOT NULL DEFAULT 24,
  uncertain_existing_phase text NOT NULL DEFAULT 'in_contact' CHECK (uncertain_existing_phase IN ('in_contact', 'keep_current')),
  allow_setter_trigger boolean NOT NULL DEFAULT true,
  backfill_state text NOT NULL DEFAULT 'pending' CHECK (backfill_state IN ('pending', 'running', 'completed')),
  backfill_completed_at timestamptz NULL,
  last_incremental_run_at timestamptz NULL,
  last_catchup_run_at timestamptz NULL,
  last_error text NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instagram_phase_automation_settings_enabled
  ON public.instagram_phase_automation_settings(enabled, mode);

ALTER TABLE public.instagram_phase_automation_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can read Instagram phase automation settings" ON public.instagram_phase_automation_settings;
CREATE POLICY "Workspace members can read Instagram phase automation settings"
  ON public.instagram_phase_automation_settings FOR SELECT
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Owners can insert Instagram phase automation settings" ON public.instagram_phase_automation_settings;
CREATE POLICY "Owners can insert Instagram phase automation settings"
  ON public.instagram_phase_automation_settings FOR INSERT
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Owners can update Instagram phase automation settings" ON public.instagram_phase_automation_settings;
CREATE POLICY "Owners can update Instagram phase automation settings"
  ON public.instagram_phase_automation_settings FOR UPDATE
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP TRIGGER IF EXISTS update_instagram_phase_automation_settings_updated_at ON public.instagram_phase_automation_settings;
CREATE TRIGGER update_instagram_phase_automation_settings_updated_at
  BEFORE UPDATE ON public.instagram_phase_automation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.instagram_threads
  ADD COLUMN IF NOT EXISTS ai_phase_updated_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS ai_phase_confidence integer NULL,
  ADD COLUMN IF NOT EXISTS ai_temperature_confidence integer NULL,
  ADD COLUMN IF NOT EXISTS ai_phase_reason text NULL,
  ADD COLUMN IF NOT EXISTS ai_phase_mode text NULL CHECK (ai_phase_mode IN ('shadow', 'enforce')),
  ADD COLUMN IF NOT EXISTS ai_phase_last_run_source text NULL CHECK (ai_phase_last_run_source IN ('incremental', 'catchup', 'backfill', 'manual_rephase'));

CREATE INDEX IF NOT EXISTS idx_instagram_threads_ai_phase_updated_at
  ON public.instagram_threads(workspace_id, ai_phase_updated_at DESC);

CREATE TABLE IF NOT EXISTS public.instagram_auto_phase_locks (
  workspace_id text PRIMARY KEY,
  locked_until timestamptz NOT NULL,
  holder text NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_auto_phase_locks ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_instagram_auto_phase_locks_updated_at ON public.instagram_auto_phase_locks;
CREATE TRIGGER update_instagram_auto_phase_locks_updated_at
  BEFORE UPDATE ON public.instagram_auto_phase_locks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.acquire_instagram_auto_phase_lock(
  p_workspace_id text,
  p_ttl_seconds int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_ttl_seconds int := GREATEST(10, LEAST(COALESCE(p_ttl_seconds, 90), 3600));
  v_locked_until timestamptz := v_now + make_interval(secs => v_ttl_seconds);
  v_holder text := nullif(current_setting('request.jwt.claim.sub', true), '');
BEGIN
  IF coalesce(trim(p_workspace_id), '') = '' THEN
    RETURN false;
  END IF;

  UPDATE public.instagram_auto_phase_locks
  SET
    locked_until = v_locked_until,
    holder = v_holder,
    updated_at = v_now
  WHERE workspace_id = p_workspace_id
    AND locked_until <= v_now;

  IF FOUND THEN
    RETURN true;
  END IF;

  BEGIN
    INSERT INTO public.instagram_auto_phase_locks (workspace_id, locked_until, holder, updated_at)
    VALUES (p_workspace_id, v_locked_until, v_holder, v_now);
    RETURN true;
  EXCEPTION
    WHEN unique_violation THEN
      RETURN false;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_instagram_auto_phase_lock(
  p_workspace_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(trim(p_workspace_id), '') = '' THEN
    RETURN;
  END IF;

  DELETE FROM public.instagram_auto_phase_locks
  WHERE workspace_id = p_workspace_id;
END;
$$;

REVOKE ALL ON TABLE public.instagram_auto_phase_locks FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.acquire_instagram_auto_phase_lock(text, int) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_instagram_auto_phase_lock(text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.acquire_instagram_auto_phase_lock(text, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_instagram_auto_phase_lock(text) TO service_role;
