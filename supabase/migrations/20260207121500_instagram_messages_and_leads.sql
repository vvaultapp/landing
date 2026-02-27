-- Ensure pgcrypto is available for gen_random_uuid
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

-- Instagram connections (token storage + account metadata)
CREATE TABLE IF NOT EXISTS public.instagram_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  instagram_account_id TEXT NOT NULL,
  instagram_username TEXT,
  profile_picture_url TEXT,
  facebook_user_id TEXT,
  page_id TEXT,
  page_name TEXT,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, instagram_account_id)
);

-- Helper: allow workspace_id stored as TEXT to use existing UUID-based membership checks
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.is_workspace_member(ws_id::uuid);
EXCEPTION WHEN invalid_text_representation THEN
  RETURN false;
END
$$;

ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their Instagram connections" ON public.instagram_connections;
CREATE POLICY "Users can manage their Instagram connections"
  ON public.instagram_connections FOR ALL
  USING (user_id = auth.uid() AND is_workspace_member(workspace_id))
  WITH CHECK (user_id = auth.uid() AND is_workspace_member(workspace_id));

DROP TRIGGER IF EXISTS update_instagram_connections_updated_at ON public.instagram_connections;
CREATE TRIGGER update_instagram_connections_updated_at
  BEFORE UPDATE ON public.instagram_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Instagram messages (webhook storage)
CREATE TABLE IF NOT EXISTS public.instagram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  instagram_account_id TEXT NOT NULL,
  instagram_user_id TEXT NOT NULL,
  sender_id TEXT,
  recipient_id TEXT,
  message_id TEXT UNIQUE,
  message_text TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  message_timestamp TIMESTAMP WITH TIME ZONE,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instagram_messages_workspace ON public.instagram_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_user ON public.instagram_messages(instagram_user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_created_at ON public.instagram_messages(created_at);

ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view Instagram messages" ON public.instagram_messages;
CREATE POLICY "Workspace members can view Instagram messages"
  ON public.instagram_messages FOR SELECT
  USING (is_workspace_member(workspace_id));

-- Instagram lead insights (Claude classification)
CREATE TABLE IF NOT EXISTS public.instagram_lead_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL,
  lead_stage TEXT NOT NULL,
  funnel_stage TEXT NOT NULL,
  summary TEXT,
  recommended_next_message TEXT,
  follow_up_message TEXT,
  confidence INTEGER,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, instagram_user_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_lead_insights_workspace ON public.instagram_lead_insights(workspace_id);
CREATE INDEX IF NOT EXISTS idx_instagram_lead_insights_stage ON public.instagram_lead_insights(lead_stage);
CREATE INDEX IF NOT EXISTS idx_instagram_lead_insights_funnel ON public.instagram_lead_insights(funnel_stage);

ALTER TABLE public.instagram_lead_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can manage Instagram lead insights" ON public.instagram_lead_insights;
CREATE POLICY "Workspace members can manage Instagram lead insights"
  ON public.instagram_lead_insights FOR ALL
  USING (is_workspace_member(workspace_id))
  WITH CHECK (is_workspace_member(workspace_id));

DROP TRIGGER IF EXISTS update_instagram_lead_insights_updated_at ON public.instagram_lead_insights;
CREATE TRIGGER update_instagram_lead_insights_updated_at
  BEFORE UPDATE ON public.instagram_lead_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
