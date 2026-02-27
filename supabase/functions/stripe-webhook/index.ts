import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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

async function stripeRequest<T>(
  secretKey: string,
  path: string,
  params: Record<string, string | number | boolean | null | undefined> = {},
  method: "GET" | "POST" = "GET",
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

  const response = await fetch(url, { method, headers, body });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const reason = String(payload?.error?.message || payload?.message || text || "Stripe API error").trim();
    throw new Error(reason || `Stripe API ${response.status}`);
  }

  return payload as T;
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

async function hmacSha256Hex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyStripeSignature(rawBody: string, signatureHeader: string, webhookSecret: string) {
  const segments = String(signatureHeader || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const tsEntry = segments.find((part) => part.startsWith("t="));
  const v1Entries = segments
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3).trim())
    .filter(Boolean);

  if (!tsEntry || v1Entries.length === 0) return false;

  const timestamp = Number(tsEntry.slice(2).trim());
  if (!Number.isFinite(timestamp)) return false;

  // Stripe default tolerance is 300 seconds.
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - timestamp) > 300) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = await hmacSha256Hex(webhookSecret, signedPayload);
  return v1Entries.some((v1) => timingSafeEqual(String(v1).toLowerCase(), expected.toLowerCase()));
}

function parseIsoFromUnixSeconds(value: unknown): string | null {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n * 1000).toISOString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const SUPABASE_URL = String(Deno.env.get("SUPABASE_URL") || "").trim();
  const SUPABASE_SERVICE_ROLE_KEY = String(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Server configuration error" }, 500);
  }

  const webhookSecret = String(Deno.env.get("STRIPE_WEBHOOK_SECRET") || "").trim();
  const stripeSecret = String(Deno.env.get("STRIPE_SECRET_KEY") || "").trim();

  const rawBody = await req.text();

  if (webhookSecret) {
    const signatureHeader = String(req.headers.get("Stripe-Signature") || "").trim();
    const valid = await verifyStripeSignature(rawBody, signatureHeader, webhookSecret);
    if (!valid) {
      return json({ error: "Invalid Stripe signature" }, 401);
    }
  }

  let event: any = null;
  try {
    event = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  if (!event || typeof event !== "object") {
    return json({ error: "Missing webhook event payload" }, 400);
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const eventId = String(event?.id || crypto.randomUUID()).trim();
  const eventType = String(event?.type || "").trim();

  const { data: existingEvent } = await admin
    .from("billing_webhook_events")
    .select("id")
    .eq("provider", "stripe")
    .eq("external_event_id", eventId)
    .maybeSingle();

  if (existingEvent?.id) {
    return json({ ok: true, duplicate: true });
  }

  const { data: eventLog, error: eventLogError } = await admin
    .from("billing_webhook_events")
    .insert({
      provider: "stripe",
      external_event_id: eventId,
      payload: event,
      status: "received",
    })
    .select("id")
    .single();

  if (eventLogError || !eventLog?.id) {
    console.error("Failed to log Stripe webhook event:", eventLogError);
    return json({ error: "Failed to log webhook event" }, 500);
  }

  const markEvent = async (status: "processed" | "ignored" | "error", workspaceId?: string | null, errorMessage?: string | null) => {
    await admin
      .from("billing_webhook_events")
      .update({
        status,
        workspace_id: workspaceId || null,
        error_message: errorMessage || null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", eventLog.id);
  };

  try {
    const object = event?.data?.object || {};

    let workspaceId =
      String(
        object?.metadata?.workspace_id ||
          object?.client_reference_id ||
          event?.data?.metadata?.workspace_id ||
          "",
      ).trim() || null;

    const customerId = String(object?.customer || "").trim() || null;
    const subscriptionId = String(object?.subscription || object?.id || "").trim() || null;

    if (!workspaceId && customerId) {
      const { data: rowByCustomer } = await admin
        .from("workspace_billing_integrations")
        .select("workspace_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      workspaceId = String(rowByCustomer?.workspace_id || "").trim() || null;
    }

    if (!workspaceId && subscriptionId && eventType.startsWith("customer.subscription.")) {
      const { data: rowBySubscription } = await admin
        .from("workspace_billing_integrations")
        .select("workspace_id")
        .eq("stripe_subscription_id", subscriptionId)
        .maybeSingle();
      workspaceId = String(rowBySubscription?.workspace_id || "").trim() || null;
    }

    if (!workspaceId) {
      await markEvent("ignored", null, "Workspace could not be resolved for this event");
      return json({ ok: true, ignored: true, reason: "workspace_not_resolved" });
    }

    const patch: Record<string, unknown> = {
      workspace_id: workspaceId,
      metadata: {
        stripe_last_event_type: eventType,
        stripe_last_event_id: eventId,
        stripe_last_event_at: new Date().toISOString(),
      },
    };

    if (customerId) patch.stripe_customer_id = customerId;

    if (eventType === "checkout.session.completed") {
      const checkoutSubscriptionId = String(object?.subscription || "").trim() || null;
      if (checkoutSubscriptionId) {
        patch.stripe_subscription_id = checkoutSubscriptionId;
        patch.stripe_status = "active";
      }
    }

    if (eventType.startsWith("customer.subscription.")) {
      const status = String(object?.status || "").trim() || null;
      const nextSubscriptionId = String(object?.id || subscriptionId || "").trim() || null;
      const nextPriceId =
        String(object?.items?.data?.[0]?.price?.id || "").trim() || null;

      if (nextSubscriptionId) patch.stripe_subscription_id = nextSubscriptionId;
      if (status) patch.stripe_status = status;
      if (nextPriceId) patch.stripe_price_id = nextPriceId;

      const nextPeriodEnd = parseIsoFromUnixSeconds(object?.current_period_end);
      if (nextPeriodEnd) patch.stripe_current_period_end = nextPeriodEnd;
    }

    if (eventType === "invoice.payment_failed") {
      patch.stripe_status = "past_due";
    }

    // If checkout completed but we still miss status/price, enrich from Stripe subscription.
    const nextSubId = String(patch.stripe_subscription_id || "").trim();
    if (stripeSecret && nextSubId && (!patch.stripe_status || !patch.stripe_price_id)) {
      try {
        const subscription = await stripeRequest<any>(stripeSecret, `/subscriptions/${nextSubId}`, {
          "expand[]": "items.data.price",
        });

        const syncStatus = String(subscription?.status || "").trim() || null;
        const syncPriceId = String(subscription?.items?.data?.[0]?.price?.id || "").trim() || null;
        const syncPeriodEnd = parseIsoFromUnixSeconds(subscription?.current_period_end);

        if (syncStatus) patch.stripe_status = syncStatus;
        if (syncPriceId) patch.stripe_price_id = syncPriceId;
        if (syncPeriodEnd) patch.stripe_current_period_end = syncPeriodEnd;
        if (!patch.stripe_customer_id) {
          const syncCustomerId = String(subscription?.customer || "").trim() || null;
          if (syncCustomerId) patch.stripe_customer_id = syncCustomerId;
        }
      } catch (syncError) {
        console.warn("Failed to enrich Stripe subscription from API:", syncError);
      }
    }

    const { error: upsertError } = await admin
      .from("workspace_billing_integrations")
      .upsert(patch, { onConflict: "workspace_id" });

    if (upsertError) {
      throw upsertError;
    }

    await markEvent("processed", workspaceId, null);
    return json({ ok: true });
  } catch (error) {
    console.error("stripe-webhook processing error:", error);
    await markEvent("error", null, String((error as any)?.message || error || "Unknown error"));
    return json({ error: String((error as any)?.message || error || "Unknown error") }, 500);
  }
});
