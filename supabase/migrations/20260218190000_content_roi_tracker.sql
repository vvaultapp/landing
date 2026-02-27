-- Content 2.0 (ROI Tracker):
-- - Manual Instagram content items
-- - CTA mapping per content source -> tracked link

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
-- Instagram content sources (manual)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.instagram_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('post', 'story', 'bio', 'other')),
  title TEXT NOT NULL,
  url TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instagram_content_items_workspace_created
  ON public.instagram_content_items(workspace_id, created_at DESC);

ALTER TABLE public.instagram_content_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view instagram content items" ON public.instagram_content_items;
CREATE POLICY "Workspace members can view instagram content items"
  ON public.instagram_content_items FOR SELECT
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Owners can manage instagram content items" ON public.instagram_content_items;
CREATE POLICY "Owners can manage instagram content items"
  ON public.instagram_content_items FOR ALL
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP TRIGGER IF EXISTS update_instagram_content_items_updated_at ON public.instagram_content_items;
CREATE TRIGGER update_instagram_content_items_updated_at
  BEFORE UPDATE ON public.instagram_content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- -------------------------------------------------------
-- Content CTAs (one CTA per source)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_ctas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('youtube_video', 'instagram')),
  source_ref TEXT NOT NULL,
  tracked_link_id UUID NOT NULL REFERENCES public.tracked_links(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, source_type, source_ref)
);

CREATE INDEX IF NOT EXISTS idx_content_ctas_workspace_source
  ON public.content_ctas(workspace_id, source_type, source_ref);

CREATE INDEX IF NOT EXISTS idx_content_ctas_workspace_tracked_link
  ON public.content_ctas(workspace_id, tracked_link_id);

ALTER TABLE public.content_ctas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view content CTAs" ON public.content_ctas;
CREATE POLICY "Workspace members can view content CTAs"
  ON public.content_ctas FOR SELECT
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Owners can manage content CTAs" ON public.content_ctas;
CREATE POLICY "Owners can manage content CTAs"
  ON public.content_ctas FOR ALL
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

