-- Content Hub:
-- - tracked links + click/conversion events
-- - content ideas + scripts

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

-- -------------------------------------------------------
-- Tracked links
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tracked_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  destination_url TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'redirect' CHECK (mode IN ('redirect', 'booking')),
  utm_params JSONB,
  archived BOOLEAN NOT NULL DEFAULT false,
  clicks_total BIGINT NOT NULL DEFAULT 0,
  conversions_total BIGINT NOT NULL DEFAULT 0,
  last_clicked_at TIMESTAMP WITH TIME ZONE,
  last_converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracked_links_workspace ON public.tracked_links(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tracked_links_archived ON public.tracked_links(archived);

ALTER TABLE public.tracked_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view tracked links" ON public.tracked_links;
CREATE POLICY "Workspace members can view tracked links"
  ON public.tracked_links FOR SELECT
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Owners can create tracked links" ON public.tracked_links;
CREATE POLICY "Owners can create tracked links"
  ON public.tracked_links FOR INSERT
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Owners can update tracked links" ON public.tracked_links;
CREATE POLICY "Owners can update tracked links"
  ON public.tracked_links FOR UPDATE
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Owners can delete tracked links" ON public.tracked_links;
CREATE POLICY "Owners can delete tracked links"
  ON public.tracked_links FOR DELETE
  USING (public.is_workspace_owner(workspace_id, auth.uid()));

DROP TRIGGER IF EXISTS update_tracked_links_updated_at ON public.tracked_links;
CREATE TRIGGER update_tracked_links_updated_at
  BEFORE UPDATE ON public.tracked_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- -------------------------------------------------------
-- Tracked link events
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tracked_link_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  link_id UUID NOT NULL REFERENCES public.tracked_links(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('click', 'conversion')),
  event_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  visitor_id TEXT,
  user_agent TEXT,
  referer TEXT,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracked_link_events_workspace ON public.tracked_link_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tracked_link_events_link ON public.tracked_link_events(link_id);
CREATE INDEX IF NOT EXISTS idx_tracked_link_events_at ON public.tracked_link_events(event_at);
CREATE INDEX IF NOT EXISTS idx_tracked_link_events_type_at ON public.tracked_link_events(event_type, event_at);

ALTER TABLE public.tracked_link_events ENABLE ROW LEVEL SECURITY;

-- Owners-only for now (events can contain referrer/user-agent metadata)
DROP POLICY IF EXISTS "Owners can view tracked link events" ON public.tracked_link_events;
CREATE POLICY "Owners can view tracked link events"
  ON public.tracked_link_events FOR SELECT
  USING (public.is_workspace_owner(workspace_id, auth.uid()));

-- No INSERT/UPDATE/DELETE policies on events.
-- Events are written by server-side code (service role) and should not be client-writable.

-- Keep counters on tracked_links in sync.
CREATE OR REPLACE FUNCTION public.bump_tracked_link_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.event_type = 'click' THEN
    UPDATE public.tracked_links
    SET
      clicks_total = clicks_total + 1,
      last_clicked_at = COALESCE(GREATEST(last_clicked_at, NEW.event_at), NEW.event_at)
    WHERE id = NEW.link_id;
  ELSIF NEW.event_type = 'conversion' THEN
    UPDATE public.tracked_links
    SET
      conversions_total = conversions_total + 1,
      last_converted_at = COALESCE(GREATEST(last_converted_at, NEW.event_at), NEW.event_at)
    WHERE id = NEW.link_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_tracked_link_counters ON public.tracked_link_events;
CREATE TRIGGER trg_bump_tracked_link_counters
  AFTER INSERT ON public.tracked_link_events
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_tracked_link_counters();

-- -------------------------------------------------------
-- Content ideas
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  platform TEXT NOT NULL,
  format TEXT,
  title TEXT NOT NULL,
  hook TEXT,
  angle TEXT,
  cta TEXT,
  outline_json JSONB,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'scripted', 'posted', 'archived')),
  source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_ideas_workspace ON public.content_ideas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_ideas_status ON public.content_ideas(status);

ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage content ideas" ON public.content_ideas;
CREATE POLICY "Owners can manage content ideas"
  ON public.content_ideas FOR ALL
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP TRIGGER IF EXISTS update_content_ideas_updated_at ON public.content_ideas;
CREATE TRIGGER update_content_ideas_updated_at
  BEFORE UPDATE ON public.content_ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- -------------------------------------------------------
-- Content scripts
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  idea_id UUID REFERENCES public.content_ideas(id) ON DELETE SET NULL,
  title TEXT,
  script_text TEXT NOT NULL,
  sections_json JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_scripts_workspace ON public.content_scripts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_scripts_idea ON public.content_scripts(idea_id);

ALTER TABLE public.content_scripts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage content scripts" ON public.content_scripts;
CREATE POLICY "Owners can manage content scripts"
  ON public.content_scripts FOR ALL
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP TRIGGER IF EXISTS update_content_scripts_updated_at ON public.content_scripts;
CREATE TRIGGER update_content_scripts_updated_at
  BEFORE UPDATE ON public.content_scripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

