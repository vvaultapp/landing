import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type LinkRow = {
  id: string;
  workspace_id: string;
  slug: string;
  destination_url: string;
  mode: string | null;
  archived: boolean | null;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function asString(v: unknown) {
  return v == null ? '' : String(v);
}

function normalizeSlug(raw: string) {
  return raw.trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'Server misconfigured' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const qsSlug = url.searchParams.get('slug');

    let body: any = null;
    if (req.method !== 'GET') {
      try {
        body = await req.json();
      } catch {
        body = null;
      }
    }

    const action = asString(body?.action || body?.eventType || '').trim().toLowerCase() || 'click';
    const rawSlug = asString(body?.slug || qsSlug);
    const slug = normalizeSlug(rawSlug);
    const visitorId = asString(body?.visitorId || body?.visitor_id || '').trim() || null;
    const referrer = asString(body?.referrer || body?.referer || '').trim() || null;
    const meta = body?.meta && typeof body.meta === 'object' ? body.meta : null;

    if (!slug || slug.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return json({ error: 'Invalid slug' }, 400);
    }

    const { data: link, error: linkError } = await admin
      .from('tracked_links')
      .select('id,workspace_id,slug,destination_url,mode,archived')
      .eq('slug', slug)
      .maybeSingle();

    if (linkError) return json({ error: 'Failed to resolve link' }, 500);
    if (!link) return json({ error: 'Link not found' }, 404);

    const linkRow = link as LinkRow;
    if (linkRow.archived) return json({ error: 'Link archived' }, 410);

    if (action === 'resolve') {
      return json({
        success: true,
        destinationUrl: linkRow.destination_url,
        mode: linkRow.mode || 'redirect',
      });
    }

    const eventType = action === 'conversion' || action === 'convert' ? 'conversion' : 'click';

    // Best-effort event logging. If inserts fail, still return the destination URL so user flow is not blocked.
    try {
      const ua = req.headers.get('user-agent') || null;
      const refererToStore = referrer || req.headers.get('referer') || null;

      await admin.from('tracked_link_events').insert({
        workspace_id: linkRow.workspace_id,
        link_id: linkRow.id,
        event_type: eventType,
        event_at: new Date().toISOString(),
        visitor_id: visitorId,
        user_agent: ua,
        referer: refererToStore,
        meta,
      });
    } catch (e) {
      console.warn('link-tracker: event insert failed:', e);
    }

    return json({
      success: true,
      eventType,
      destinationUrl: linkRow.destination_url,
      mode: linkRow.mode || 'redirect',
    });
  } catch (e: any) {
    console.error('link-tracker error:', e);
    return json({ error: e?.message || 'Unexpected error' }, 500);
  }
});

