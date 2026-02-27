import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type BillingApiAction =
  | "status"
  | "stripe_create_checkout"
  | "stripe_create_portal"
  | "stripe_sync_subscription"
  | "whop_link_membership"
  | "whop_sync_membership";

type BillingApiRequest = {
  action: BillingApiAction;
  workspaceId: string;
  priceId?: string;
  successUrl?: string;
  cancelUrl?: string;
  returnUrl?: string;
  membershipId?: string;
};

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function toFormBody(values: Record<string, string | number | boolean | null | undefined>) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined) continue;
    body.append(key, String(value));
  }
  return body;
}

function isLikelyUrl(value: string | undefined | null) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

async function stripeRequest<T>(
  secretKey: string,
  path: string,
  params: Record<string, string | number | boolean | null | undefined> = {},
  method: "GET" | "POST" = "POST",
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
  };

  let url = `https://api.stripe.com/v1${path}`;
  let body: string | undefined;

  if (method === "GET") {
    const qs = toFormBody(params).toString();
    if (qs) url += `?${qs}`;
  } else {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = toFormBody(params).toString();
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  const text = await response.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const reason =
      String(payload?.error?.message || payload?.message || text || "Stripe API error").trim() ||
      `Stripe API ${response.status}`;
    throw new Error(reason);
  }

  return payload as T;
}

async function whopRequest<T>(
  apiKey: string,
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
): Promise<T> {
  const base = String(Deno.env.get("WHOP_API_BASE_URL") || "https://api.whop.com/api/v5").replace(/\/$/, "");
  const url = `${base}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "x-whop-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const reason =
      String(payload?.error || payload?.message || text || "Whop API error").trim() ||
      `Whop API ${response.status}`;
    throw new Error(reason);
  }

  return payload as T;
}

function normalizeWhopMembership(raw: any, fallbackMembershipId?: string | null) {
  const root = raw?.data?.membership || raw?.membership || raw?.data || raw || {};
  const id =
    String(
      root?.id ||
        root?.membership_id ||
        root?.membershipId ||
        raw?.id ||
        raw?.membership_id ||
        fallbackMembershipId ||
        "",
    ).trim() || null;

  const status =
    String(
      root?.status ||
        root?.access_status ||
        root?.state ||
        raw?.status ||
        raw?.access_status ||
        "",
    ).trim() || null;

  const expiresAt =
    String(
      root?.expires_at ||
        root?.expiry ||
        root?.valid_until ||
        root?.renewal_date ||
        raw?.expires_at ||
        "",
    ).trim() || null;

  const productId =
    String(root?.product_id || root?.product?.id || raw?.product_id || "").trim() || null;

  const planId =
    String(root?.plan_id || root?.plan?.id || raw?.plan_id || "").trim() || null;

  return {
    membershipId: id,
    status,
    expiresAt,
    productId,
    planId,
    raw,
  };
}

async function requireOwner(
  supabase: ReturnType<typeof createClient>,
  bearerToken: string,
  workspaceId: string,
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(bearerToken);

  if (authError || !user) {
    return { user: null, error: new Error("Unauthorized"), status: 401 };
  }

  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberError) {
    console.error("workspace_members lookup failed:", memberError);
    return { user: null, error: new Error("Failed to verify workspace access"), status: 500 };
  }

  if (!member || String(member.role || "") !== "owner") {
    return { user: null, error: new Error("Only workspace owners can manage billing integrations"), status: 403 };
  }

  return { user, error: null, status: 200 };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Server configuration error" }, 500);
    }

    const authHeader = req.headers.get("Authorization") || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
    if (!bearerToken) {
      return json({ error: "Unauthorized" }, 401);
    }

    let body: BillingApiRequest | null = null;
    try {
      body = (await req.json()) as BillingApiRequest;
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const action = String(body?.action || "").trim() as BillingApiAction;
    const workspaceId = String(body?.workspaceId || "").trim();

    if (!action) return json({ error: "action is required" }, 400);
    if (!workspaceId) return json({ error: "workspaceId is required" }, 400);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const ownerCheck = await requireOwner(supabase, bearerToken, workspaceId);
    if (ownerCheck.error || !ownerCheck.user) {
      return json({ error: ownerCheck.error?.message || "Unauthorized" }, ownerCheck.status);
    }

    const ownerUser = ownerCheck.user;

    const loadBilling = async () => {
      const { data, error } = await supabase
        .from("workspace_billing_integrations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    };

    const upsertBilling = async (patch: Record<string, unknown>) => {
      const payload = {
        workspace_id: workspaceId,
        ...patch,
      };

      const { error } = await supabase
        .from("workspace_billing_integrations")
        .upsert(payload, { onConflict: "workspace_id" });
      if (error) throw error;
    };

    if (action === "status") {
      const billing = await loadBilling();
      return json({ ok: true, billing });
    }

    if (action === "stripe_create_checkout") {
      const stripeSecret = String(Deno.env.get("STRIPE_SECRET_KEY") || "").trim();
      if (!stripeSecret) return json({ error: "Missing STRIPE_SECRET_KEY" }, 500);

      const billing = await loadBilling();
      let customerId = String(billing?.stripe_customer_id || "").trim();

      if (!customerId) {
        const customer = await stripeRequest<any>(stripeSecret, "/customers", {
          email: ownerUser.email || undefined,
          name:
            String(
              (ownerUser.user_metadata as any)?.full_name ||
                (ownerUser.user_metadata as any)?.display_name ||
                ownerUser.email ||
                "",
            ).trim() || undefined,
          "metadata[workspace_id]": workspaceId,
          "metadata[owner_user_id]": ownerUser.id,
        });

        customerId = String(customer?.id || "").trim();
        if (!customerId) {
          return json({ error: "Stripe did not return a customer id" }, 502);
        }
      }

      const priceId = String(body?.priceId || Deno.env.get("STRIPE_DEFAULT_PRICE_ID") || "").trim();
      if (!priceId) {
        return json({ error: "Missing price id. Set STRIPE_DEFAULT_PRICE_ID or pass priceId." }, 400);
      }

      const appUrl = String(Deno.env.get("APP_URL") || "https://theacq.app").trim();
      const successUrl = isLikelyUrl(body?.successUrl)
        ? String(body?.successUrl)
        : `${appUrl}/settings?tab=integrations&billing=stripe-success`;
      const cancelUrl = isLikelyUrl(body?.cancelUrl)
        ? String(body?.cancelUrl)
        : `${appUrl}/settings?tab=integrations&billing=stripe-cancel`;

      const session = await stripeRequest<any>(stripeSecret, "/checkout/sessions", {
        mode: "subscription",
        customer: customerId,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": 1,
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        client_reference_id: workspaceId,
        "metadata[workspace_id]": workspaceId,
        "metadata[owner_user_id]": ownerUser.id,
        "subscription_data[metadata][workspace_id]": workspaceId,
        "subscription_data[metadata][owner_user_id]": ownerUser.id,
      });

      const sessionUrl = String(session?.url || "").trim();
      const sessionId = String(session?.id || "").trim();
      if (!sessionUrl) return json({ error: "Stripe did not return a checkout URL" }, 502);

      await upsertBilling({
        stripe_customer_id: customerId,
      });

      return json({ ok: true, url: sessionUrl, sessionId, customerId });
    }

    if (action === "stripe_create_portal") {
      const stripeSecret = String(Deno.env.get("STRIPE_SECRET_KEY") || "").trim();
      if (!stripeSecret) return json({ error: "Missing STRIPE_SECRET_KEY" }, 500);

      const billing = await loadBilling();
      const customerId = String(billing?.stripe_customer_id || "").trim();
      if (!customerId) {
        return json({ error: "No Stripe customer linked yet. Start checkout first." }, 400);
      }

      const appUrl = String(Deno.env.get("APP_URL") || "https://theacq.app").trim();
      const returnUrl = isLikelyUrl(body?.returnUrl)
        ? String(body?.returnUrl)
        : `${appUrl}/settings?tab=integrations`;

      const portal = await stripeRequest<any>(stripeSecret, "/billing_portal/sessions", {
        customer: customerId,
        return_url: returnUrl,
      });

      const url = String(portal?.url || "").trim();
      if (!url) return json({ error: "Stripe did not return a portal URL" }, 502);

      return json({ ok: true, url });
    }

    if (action === "stripe_sync_subscription") {
      const stripeSecret = String(Deno.env.get("STRIPE_SECRET_KEY") || "").trim();
      if (!stripeSecret) return json({ error: "Missing STRIPE_SECRET_KEY" }, 500);

      const billing = await loadBilling();
      const subscriptionId = String(billing?.stripe_subscription_id || "").trim();
      if (!subscriptionId) {
        return json({ error: "No Stripe subscription linked yet" }, 400);
      }

      const subscription = await stripeRequest<any>(stripeSecret, `/subscriptions/${subscriptionId}`, {
        "expand[]": "items.data.price",
      }, "GET");

      const nextStatus = String(subscription?.status || "").trim() || null;
      const currentPeriodEndRaw = Number(subscription?.current_period_end || 0);
      const nextPeriodEnd = currentPeriodEndRaw > 0 ? new Date(currentPeriodEndRaw * 1000).toISOString() : null;

      const nextPriceId = String(subscription?.items?.data?.[0]?.price?.id || "").trim() || null;

      await upsertBilling({
        stripe_subscription_id: String(subscription?.id || subscriptionId),
        stripe_customer_id: String(subscription?.customer || billing?.stripe_customer_id || "").trim() || null,
        stripe_status: nextStatus,
        stripe_current_period_end: nextPeriodEnd,
        stripe_price_id: nextPriceId,
      });

      const refreshed = await loadBilling();
      return json({ ok: true, billing: refreshed });
    }

    if (action === "whop_link_membership") {
      const membershipId = String(body?.membershipId || "").trim();
      if (!membershipId) return json({ error: "membershipId is required" }, 400);

      await upsertBilling({
        whop_membership_id: membershipId,
      });

      const refreshed = await loadBilling();
      return json({ ok: true, billing: refreshed });
    }

    if (action === "whop_sync_membership") {
      const whopApiKey = String(Deno.env.get("WHOP_API_KEY") || "").trim();
      if (!whopApiKey) return json({ error: "Missing WHOP_API_KEY" }, 500);

      const billing = await loadBilling();
      const membershipId = String(body?.membershipId || billing?.whop_membership_id || "").trim();
      if (!membershipId) {
        return json({ error: "No Whop membership linked yet. Add membership id first." }, 400);
      }

      const rawMembership = await whopRequest<any>(whopApiKey, `/memberships/${membershipId}`, "GET");
      const normalized = normalizeWhopMembership(rawMembership, membershipId);

      await upsertBilling({
        whop_membership_id: normalized.membershipId,
        whop_status: normalized.status,
        whop_expires_at: normalized.expiresAt,
        whop_product_id: normalized.productId,
        whop_plan_id: normalized.planId,
        metadata: {
          ...(billing?.metadata || {}),
          whop_last_sync_at: new Date().toISOString(),
          whop_last_membership_raw: normalized.raw,
        },
      });

      const refreshed = await loadBilling();
      return json({ ok: true, billing: refreshed, membership: normalized });
    }

    return json({ error: `Unsupported action: ${action}` }, 400);
  } catch (error) {
    console.error("billing-api error:", error);
    return json({ error: String((error as any)?.message || error || "Unknown error") }, 500);
  }
});
