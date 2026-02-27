-- Billing integrations: Stripe + Whop workspace-level state + webhook event logs.

CREATE TABLE IF NOT EXISTS public.workspace_billing_integrations (
  workspace_id TEXT PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_status TEXT,
  stripe_current_period_end TIMESTAMPTZ,
  whop_membership_id TEXT,
  whop_product_id TEXT,
  whop_plan_id TEXT,
  whop_status TEXT,
  whop_expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_billing_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view workspace billing integrations" ON public.workspace_billing_integrations;
CREATE POLICY "Members can view workspace billing integrations"
  ON public.workspace_billing_integrations
  FOR SELECT
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Owners can manage workspace billing integrations" ON public.workspace_billing_integrations;
CREATE POLICY "Owners can manage workspace billing integrations"
  ON public.workspace_billing_integrations
  FOR ALL
  USING (public.is_workspace_owner(workspace_id))
  WITH CHECK (public.is_workspace_owner(workspace_id));

CREATE INDEX IF NOT EXISTS idx_workspace_billing_integrations_stripe_customer
  ON public.workspace_billing_integrations(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_workspace_billing_integrations_stripe_subscription
  ON public.workspace_billing_integrations(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_workspace_billing_integrations_whop_membership
  ON public.workspace_billing_integrations(whop_membership_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'update_updated_at_column'
      AND pg_function_is_visible(oid)
  ) THEN
    DROP TRIGGER IF EXISTS update_workspace_billing_integrations_updated_at
      ON public.workspace_billing_integrations;

    CREATE TRIGGER update_workspace_billing_integrations_updated_at
      BEFORE UPDATE ON public.workspace_billing_integrations
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.billing_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'whop')),
  external_event_id TEXT NOT NULL,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'ignored', 'error')),
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view billing webhook events" ON public.billing_webhook_events;
CREATE POLICY "Members can view billing webhook events"
  ON public.billing_webhook_events
  FOR SELECT
  USING (
    workspace_id IS NOT NULL
    AND public.is_workspace_member(workspace_id)
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_webhook_events_provider_external_id
  ON public.billing_webhook_events(provider, external_event_id);

CREATE INDEX IF NOT EXISTS idx_billing_webhook_events_workspace
  ON public.billing_webhook_events(workspace_id);
