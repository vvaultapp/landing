import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FALLBACK_DESTINATION = 'https://get.vvault.app/';
const CLICK_DEDUP_WINDOW_MS = 15 * 60 * 1000;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function getIp(req: NextRequest) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const xr = req.headers.get('x-real-ip');
  if (xr) return xr.trim();
  return null;
}

function isPrefetchRequest(req: NextRequest) {
  const purpose = req.headers.get('purpose') || req.headers.get('sec-purpose');
  if (purpose && purpose.toLowerCase().includes('prefetch')) return true;
  if (req.headers.get('x-middleware-prefetch') === '1') return true;
  if (req.headers.get('next-router-prefetch') === '1') return true;
  return false;
}

function isLikelyBot(ua: string) {
  return /(bot|crawler|spider|preview|slackbot|discordbot|telegrambot|whatsapp|facebookexternalhit|twitterbot|linkedinbot|pinterest|embedly|quora link preview|skypeuripreview|bingpreview)/i.test(
    ua,
  );
}

function isLikelyNavigation(req: NextRequest) {
  const secFetchUser = req.headers.get('sec-fetch-user');
  if (secFetchUser === '?1') return true;
  const mode = req.headers.get('sec-fetch-mode');
  if (mode === 'navigate') return true;
  const dest = req.headers.get('sec-fetch-dest');
  if (dest === 'document' || dest === 'iframe') return true;
  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/html')) return true;
  const upgrade = req.headers.get('upgrade-insecure-requests');
  if (upgrade === '1') return true;
  return false;
}

function shouldTrackClick(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  if (isLikelyBot(ua)) return false;
  if (isPrefetchRequest(req)) return false;
  return isLikelyNavigation(req);
}

function buildSourceId(linkId: string, ip: string | null, ua: string | null) {
  if (!ip && !ua) return null;
  const bucket = Math.floor(Date.now() / CLICK_DEDUP_WINDOW_MS);
  const raw = `${linkId}|${ip || ''}|${ua || ''}|${bucket}`;
  return createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

type UtmLink = {
  id: string;
  utm_source: string;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  destination_url: string | null;
  is_active: boolean | null;
};

function buildRedirectUrl(link: UtmLink, incoming: URL) {
  let target: URL;
  try {
    target = new URL(link.destination_url || FALLBACK_DESTINATION);
  } catch {
    target = new URL(FALLBACK_DESTINATION);
  }

  const setIfMissing = (key: string, value: string | null | undefined) => {
    if (!value) return;
    if (!target.searchParams.get(key)) target.searchParams.set(key, value);
  };

  setIfMissing('utm_source', link.utm_source);
  setIfMissing('utm_medium', link.utm_medium);
  setIfMissing('utm_campaign', link.utm_campaign);
  setIfMissing('utm_content', link.utm_content);
  setIfMissing('utm_term', link.utm_term);

  incoming.searchParams.forEach((value, key) => {
    if (key === 'slug') return;
    if (!target.searchParams.has(key)) target.searchParams.set(key, value);
  });

  return target.toString();
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const cleanSlug = String(slug || '').trim().toLowerCase();

  if (!cleanSlug) {
    return NextResponse.redirect(FALLBACK_DESTINATION);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.redirect(FALLBACK_DESTINATION);
  }

  const { data: link, error } = await supabase
    .from('utm_links')
    .select('id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, destination_url, is_active')
    .eq('slug', cleanSlug)
    .maybeSingle();

  if (error) {
    console.warn('utm link resolve failed', error);
  }

  if (!link?.id || link.is_active === false) {
    return NextResponse.redirect(FALLBACK_DESTINATION);
  }

  const redirectUrl = buildRedirectUrl(link as UtmLink, req.nextUrl);

  if (shouldTrackClick(req)) {
    const ip = getIp(req);
    const ua = req.headers.get('user-agent') || null;
    const referer = req.headers.get('referer') || null;
    const sourceId = buildSourceId(link.id, ip, ua);

    try {
      if (sourceId) {
        await supabase
          .from('utm_clicks')
          .upsert(
            { link_id: link.id, source_id: sourceId, ip, user_agent: ua, referer },
            { onConflict: 'link_id,source_id', ignoreDuplicates: true },
          );
      } else {
        await supabase
          .from('utm_clicks')
          .insert({ link_id: link.id, ip, user_agent: ua, referer });
      }
    } catch (err) {
      console.warn('utm click insert failed', err);
    }
  }

  return NextResponse.redirect(redirectUrl, { status: 302 });
}
