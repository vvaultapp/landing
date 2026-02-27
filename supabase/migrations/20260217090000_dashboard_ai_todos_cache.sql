-- Cache Claude-generated dashboard to-dos so we don't rescan the inbox on every page load.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure updated_at helper exists (safe create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'update_updated_at_column'
      AND n.nspname = 'public'
  ) THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.instagram_dashboard_todos_cache (
  workspace_id TEXT PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  tasks_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  model TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instagram_dashboard_todos_cache_generated_at
  ON public.instagram_dashboard_todos_cache(generated_at DESC);

ALTER TABLE public.instagram_dashboard_todos_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view dashboard todos cache" ON public.instagram_dashboard_todos_cache;
CREATE POLICY "Owners can view dashboard todos cache"
  ON public.instagram_dashboard_todos_cache FOR SELECT
  USING (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Owners can manage dashboard todos cache" ON public.instagram_dashboard_todos_cache;
CREATE POLICY "Owners can manage dashboard todos cache"
  ON public.instagram_dashboard_todos_cache FOR ALL
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP TRIGGER IF EXISTS update_instagram_dashboard_todos_cache_updated_at ON public.instagram_dashboard_todos_cache;
CREATE TRIGGER update_instagram_dashboard_todos_cache_updated_at
  BEFORE UPDATE ON public.instagram_dashboard_todos_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

