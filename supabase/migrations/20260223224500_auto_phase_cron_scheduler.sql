-- Configure a recurring DB cron job that invokes the auto-phase-cron edge function.
-- Secret is supplied at runtime via RPC and is not stored in source control.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.configure_auto_phase_cron(
  p_url text,
  p_secret text,
  p_enabled boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_job_name text := 'auto_phase_cron_every_15_minutes';
  v_existing_job_id bigint;
  v_new_job_id bigint;
  v_sql text;
BEGIN
  IF coalesce(trim(p_url), '') = '' THEN
    RAISE EXCEPTION 'p_url is required';
  END IF;

  IF p_enabled AND coalesce(trim(p_secret), '') = '' THEN
    RAISE EXCEPTION 'p_secret is required when enabling schedule';
  END IF;

  SELECT jobid
    INTO v_existing_job_id
  FROM cron.job
  WHERE jobname = v_job_name
  LIMIT 1;

  IF v_existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_existing_job_id);
  END IF;

  IF p_enabled THEN
    v_sql := format(
      $fmt$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'X-AUTO-PHASE-SECRET', %L
        ),
        body := '{}'::jsonb
      );
      $fmt$,
      p_url,
      p_secret
    );

    SELECT cron.schedule(v_job_name, '*/15 * * * *', v_sql)
      INTO v_new_job_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'enabled', p_enabled,
    'job_name', v_job_name,
    'previous_job_id', v_existing_job_id,
    'job_id', v_new_job_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.configure_auto_phase_cron(text, text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.configure_auto_phase_cron(text, text, boolean) TO service_role;
