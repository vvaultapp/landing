import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-whop-signature, x-whop-signature-v2, x-whop-timestamp",
};

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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

async function verifyWhopSignature(req: Request, rawBody: string, webhookSecret: string) {
  const providedRaw =
    String(req.headers.get("x-whop-signature-v2") || "").trim() ||
    String(req.headers.get("x-whop-signature") || "").trim() ||
    String(req.headers.get("whop-signature") || "").trim();

  if (!providedRaw) return false;

  const provided = providedRaw
    .replace(/^sha256=/i, "")
    .replace(/^v1=/i, "")
    .trim()
    .toLowerCase();

  if (!provided) return false;

  const timestamp = String(req.headers.get("x-whop-timestamp") || "").trim();

  const candidates: string[] = [];
  candidates.push((await hmacSha256Hex(webhookSecret, rawBody)).toLowerCase());

  if (timestamp) {
    candidates.push((await hmacSha256Hex(webhookSecret, `${timestamp}.${rawBody}`)).toLowerCase());
  }

  return candidates.some((candidate) => timingSafeEqual(candidate, provided));
}

function toIsoIfDateLike(value: unknown): string | null {
  if (!value) return null;

  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    // Handle unix seconds and milliseconds.
    const ms = asNumber > 10_000_000_000 ? asNumber : asNumber * 1000;
    return new Date(ms).toISOString();
  }

  const asString = String(value).trim();
  if (!asString) return null;
  const parsed = new Date(asString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
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

  const rawBody = await req.text();

  const webhookSecret = String(Deno.env.get("WHOP_WEBHOOK_SECRET") || "").trim();
  if (webhookSecret) {
    const valid = await verifyWhopSignature(req, rawBody, webhookSecret);
    if (!valid) {
      return json({ error: "Invalid Whop signature" }, 401);
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

  const eventId = String(event?.id || event?.event_id || crypto.randomUUID()).trim();
  const eventType = String(event?.type || event?.event || event?.action || "").trim();

  const { data: existingEvent } = await admin
    .from("billing_webhook_events")
    .select("id")
    .eq("provider", "whop")
    .eq("external_event_id", eventId)
    .maybeSingle();

  if (existingEvent?.id) {
    return json({ ok: true, duplicate: true });
  }

  const { data: eventLog, error: eventLogError } = await admin
    .from("billing_webhook_events")
    .insert({
      provider: "whop",
      external_event_id: eventId,
      payload: event,
      status: "received",
    })
    .select("id")
    .single();

  if (eventLogError || !eventLog?.id) {
    console.error("Failed to log Whop webhook event:", eventLogError);
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
    const data = event?.data || event;
    const membership = data?.membership || data?.data || data;

    const membershipId =
      String(
        membership?.id ||
          membership?.membership_id ||
          data?.membership_id ||
          event?.membership_id ||
          "",
      ).trim() || null;

    let workspaceId =
      String(
        membership?.metadata?.workspace_id ||
          membership?.workspace_id ||
          data?.workspace_id ||
          data?.metadata?.workspace_id ||
          "",
      ).trim() || null;

    if (!workspaceId && membershipId) {
      const { data: rowByMembership } = await admin
        .from("workspace_billing_integrations")
        .select("workspace_id")
        .eq("whop_membership_id", membershipId)
        .maybeSingle();
      workspaceId = String(rowByMembership?.workspace_id || "").trim() || null;
    }

    if (!workspaceId) {
      await markEvent("ignored", null, "Workspace could not be resolved for this event");
      return json({ ok: true, ignored: true, reason: "workspace_not_resolved" });
    }

    const whopStatus =
      String(
        membership?.status ||
          membership?.access_status ||
          membership?.state ||
          data?.status ||
          "",
      ).trim() || null;

    const whopExpiresAt =
      toIsoIfDateLike(
        membership?.expires_at ||
          membership?.expiry ||
          membership?.valid_until ||
          membership?.renewal_date ||
          data?.expires_at,
      );

    const whopProductId =
      String(membership?.product_id || membership?.product?.id || data?.product_id || "").trim() || null;

    const whopPlanId =
      String(membership?.plan_id || membership?.plan?.id || data?.plan_id || "").trim() || null;

    const metadataPatch = {
      whop_last_event_type: eventType,
      whop_last_event_id: eventId,
      whop_last_event_at: new Date().toISOString(),
      whop_last_event_payload: event,
    };

    const { data: existingBilling } = await admin
      .from("workspace_billing_integrations")
      .select("metadata")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    const { error: upsertError } = await admin
      .from("workspace_billing_integrations")
      .upsert(
        {
          workspace_id: workspaceId,
          whop_membership_id: membershipId,
          whop_status: whopStatus,
          whop_expires_at: whopExpiresAt,
          whop_product_id: whopProductId,
          whop_plan_id: whopPlanId,
          metadata: {
            ...(existingBilling?.metadata || {}),
            ...metadataPatch,
          },
        },
        { onConflict: "workspace_id" },
      );

    if (upsertError) {
      throw upsertError;
    }

    await markEvent("processed", workspaceId, null);
    return json({ ok: true });
  } catch (error) {
    console.error("whop-webhook processing error:", error);
    await markEvent("error", null, String((error as any)?.message || error || "Unknown error"));
    return json({ error: String((error as any)?.message || error || "Unknown error") }, 500);
  }
});
