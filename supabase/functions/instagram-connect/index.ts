import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { runWorkspaceAutoPhase } from '../_shared/auto-phase.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH_API_VERSION = Deno.env.get('META_GRAPH_API_VERSION') || 'v24.0';
const MEDIA_BUCKET = Deno.env.get('INSTAGRAM_MEDIA_BUCKET') || 'instagram-media';
const SYNC_MESSAGES_LIMIT = Number(Deno.env.get('INSTAGRAM_SYNC_MESSAGES_LIMIT') || '50');

function extFromContentType(contentType: string | null): string {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('image/jpeg')) return 'jpg';
  if (ct.includes('image/png')) return 'png';
  if (ct.includes('image/webp')) return 'webp';
  if (ct.includes('image/gif')) return 'gif';
  if (ct.includes('video/mp4')) return 'mp4';
  if (ct.includes('video/quicktime')) return 'mov';
  if (ct.includes('audio/mpeg')) return 'mp3';
  if (ct.includes('audio/mp4')) return 'm4a';
  return 'bin';
}

function isHttpUrl(value: any): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

function unwrapMetaRedirectUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host === 'l.instagram.com' || host === 'l.facebook.com') {
      const target = u.searchParams.get('u');
      if (target) {
        const decoded = decodeURIComponent(target);
        if (/^https?:\/\//i.test(decoded)) return decoded;
      }
    }
  } catch {
    // ignore
  }
  return url;
}

function inferShareKindFromUrl(url: string | null): 'reel' | 'post' | 'story' | null {
  if (!url || typeof url !== 'string') return null;
  const u = unwrapMetaRedirectUrl(url).toLowerCase();
  if (u.includes('/reel/')) return 'reel';
  if (u.includes('/stories/')) return 'story';
  if (u.includes('/p/') || u.includes('/tv/')) return 'post';
  return null;
}

function inferShareKind(typeHint: string | null, url: string | null): 'reel' | 'post' | 'story' | null {
  const t = (typeHint || '').toLowerCase();
  if (t.includes('reel')) return 'reel';
  if (t.includes('story')) return 'story';
  if (t.includes('post')) return 'post';
  const byUrl = inferShareKindFromUrl(url);
  if (byUrl) return byUrl;
  if (t === 'share') return 'post';
  return null;
}

function isHtmlContentType(contentType: string | null): boolean {
  const ct = (contentType || '').toLowerCase();
  return ct.includes('text/html');
}

function extractAttachmentUrl(att: any): string | null {
  const candidates = [
    att?.payload?.url,
    att?.payload?.link,
    att?.payload?.href,
    att?.payload?.permalink_url,
    att?.payload?.permalink,
    att?.image_data?.url,
    att?.video_data?.url,
    att?.file_url,
    att?.url,
    att?.link,
  ];
  for (const c of candidates) {
    if (isHttpUrl(c)) return unwrapMetaRedirectUrl(c.trim());
  }

  const deepUrls = collectHttpUrlsDeep(att);
  return pickBestShareUrl(deepUrls);
}

function collectHttpUrlsDeep(root: any): string[] {
  const out: string[] = [];
  const visited = new Set<any>();
  const walk = (value: any, depth: number) => {
    if (out.length >= 30) return;
    if (depth > 5) return;
    if (!value) return;
    if (typeof value === 'string') {
      const s = value.trim();
      if (/^https?:\/\//i.test(s)) out.push(unwrapMetaRedirectUrl(s));
      return;
    }
    if (typeof value !== 'object') return;
    if (visited.has(value)) return;
    visited.add(value);
    if (Array.isArray(value)) {
      for (const item of value) walk(item, depth + 1);
      return;
    }
    for (const k of Object.keys(value)) {
      walk((value as any)[k], depth + 1);
      if (out.length >= 30) return;
    }
  };
  walk(root, 0);
  return out;
}

function scoreShareUrl(url: string): number {
  const u = url.toLowerCase();
  if (u.includes('/reel/')) return 100;
  if (u.includes('/stories/')) return 90;
  if (u.includes('/p/') || u.includes('/tv/')) return 80;
  if (u.includes('instagram.com')) return 60;
  if (u.includes('fb.watch')) return 40;
  return 10;
}

function pickBestShareUrl(urls: string[]): string | null {
  let best: string | null = null;
  let bestScore = 0;
  for (const url of Array.isArray(urls) ? urls : []) {
    if (!url || typeof url !== 'string') continue;
    const score = scoreShareUrl(url);
    if (score > bestScore) {
      bestScore = score;
      best = url;
    }
  }
  return best;
}

function extractAttachmentId(att: any): string | null {
  const candidates = [
    att?.payload?.id,
    att?.payload?.media_id,
    att?.payload?.post_id,
    att?.payload?.reel_id,
    att?.payload?.story_id,
    att?.target?.id,
    att?.id,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
    if (typeof c === 'number' && Number.isFinite(c)) return String(c);
  }
  return null;
}

function parseMetaTimestamp(value: any): { value: string | null; ms: number } {
  if (value == null) return { value: null, ms: 0 };

  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? { value: value.toISOString(), ms } : { value: null, ms: 0 };
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return { value: null, ms: 0 };
    const ms = value < 1e12 ? Math.round(value * 1000) : Math.round(value);
    const d = new Date(ms);
    const t = d.getTime();
    return Number.isFinite(t) ? { value: d.toISOString(), ms: t } : { value: null, ms: 0 };
  }

  const raw = String(value).trim();
  if (!raw) return { value: null, ms: 0 };

  // Some Meta endpoints return unix timestamps (seconds or ms) as strings.
  if (/^\d{10,13}(\.\d+)?$/.test(raw)) {
    const num = Number(raw);
    if (!Number.isFinite(num)) return { value: null, ms: 0 };
    const digits = raw.split('.')[0].length;
    const ms = digits >= 13 ? num : num * 1000;
    const d = new Date(ms);
    const t = d.getTime();
    return Number.isFinite(t) ? { value: d.toISOString(), ms: t } : { value: null, ms: 0 };
  }

  // Normalize timezone offsets like +0000 to +00:00 so Date parsing is consistent.
  const normalized = raw.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  const d1 = new Date(normalized);
  if (Number.isFinite(d1.getTime())) return { value: d1.toISOString(), ms: d1.getTime() };

  const d2 = new Date(raw);
  if (Number.isFinite(d2.getTime())) return { value: d2.toISOString(), ms: d2.getTime() };

  // Let Postgres attempt parsing if it's a timestamp-ish string we don't understand here.
  return { value: raw, ms: 0 };
}

async function ensurePublicBucket(admin: any, bucket: string) {
  try {
    const { data } = await admin.storage.getBucket(bucket);
    if (data) {
      if (data.public) return;
      try {
        await admin.storage.updateBucket(bucket, { public: true });
      } catch {
        // ignore
      }
      return;
    }
  } catch {
    // ignore
  }
  try {
    await admin.storage.createBucket(bucket, { public: true });
  } catch {
    // ignore
  }
}

async function userHasWorkspaceAccess(admin: any, workspaceId: string, userId: string): Promise<boolean> {
  const { data: member, error: memberError } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (memberError) {
    console.warn('workspace_members access check failed:', memberError);
  }
  if (member) return true;

  const { data: portalRole, error: portalRoleError } = await admin
    .from('portal_roles')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .neq('role', 'client')
    .limit(1)
    .maybeSingle();

  if (portalRoleError) {
    console.warn('portal_roles access check failed:', portalRoleError);
  }

  return Boolean(portalRole);
}

async function resolveWorkspaceRole(admin: any, workspaceId: string, userId: string): Promise<string | null> {
  try {
    const { data: member, error: memberError } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    if (!memberError && member?.role) return String(member.role).trim().toLowerCase();
  } catch {
    // ignore
  }

  try {
    const { data: portalRole, error: portalError } = await admin
      .from('portal_roles')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .neq('role', 'client')
      .limit(1)
      .maybeSingle();
    if (!portalError && portalRole?.role) return String(portalRole.role).trim().toLowerCase();
  } catch {
    // ignore
  }

  return null;
}

async function storeImageUrlToBucket(admin: any, bucket: string, path: string, sourceUrl: string) {
  const resp = await fetch(sourceUrl);
  if (!resp.ok) return null;
  const contentType = resp.headers.get('content-type');
  if (isHtmlContentType(contentType)) return null;
  const ext = extFromContentType(contentType);
  const buf = new Uint8Array(await resp.arrayBuffer());
  const fullPath = path.endsWith(`.${ext}`) ? path : `${path}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(fullPath, buf, { contentType: contentType || undefined, upsert: true });

  if (uploadError) return null;
  const { data: pub } = admin.storage.from(bucket).getPublicUrl(fullPath);
  return { fullPath, publicUrl: pub?.publicUrl || null };
}

function inferAttachmentType(typeHint: string | null, url: string | null): string | null {
  if (typeHint && typeof typeHint === 'string') return typeHint;
  if (!url || typeof url !== 'string') return null;
  if (/\.(png|jpe?g|gif|webp)(\?|$)/i.test(url)) return 'image';
  if (/\.(mp4|mov|webm)(\?|$)/i.test(url)) return 'video';
  if (/\.(mp3|m4a|wav)(\?|$)/i.test(url)) return 'audio';
  return 'file';
}

function normalizeAttachmentCandidates(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [raw];
}

async function tryFetchMediaPermalink(
  baseIg: string,
  baseFb: string,
  accessToken: string,
  mediaId: string
): Promise<string | null> {
  if (!accessToken || !mediaId) return null;
  const candidates: Array<{ base: string; fields: string; label: string }> = [
    {
      base: baseIg,
      fields: 'permalink,permalink_url,media_url,thumbnail_url,media_type',
      label: 'ig_media_permalink',
    },
    {
      base: baseFb,
      fields: 'permalink,permalink_url,media_url,thumbnail_url,media_type',
      label: 'fb_media_permalink',
    },
  ];

  for (const c of candidates) {
    try {
      const url = new URL(`${c.base}/${encodeURIComponent(String(mediaId))}`);
      url.searchParams.set('fields', c.fields);
      url.searchParams.set('access_token', accessToken);
      const data = await fetchJson(url, c.label, accessToken);
      const maybe =
        (data?.permalink_url ? String(data.permalink_url) : null) ||
        (data?.permalink ? String(data.permalink) : null) ||
        (data?.url ? String(data.url) : null) ||
        (data?.media_url ? String(data.media_url) : null) ||
        null;
      if (maybe && isHttpUrl(maybe)) return unwrapMetaRedirectUrl(maybe.trim());
    } catch {
      // try next host
    }
  }
  return null;
}

async function storeAttachmentsToBucket(
  admin: any,
  workspaceId: string,
  instagramAccountId: string,
  messageId: string,
  rawAttachments: any,
  accessToken: string,
  baseIg: string,
  baseFb: string
) {
  const stored: any[] = [];
  const candidates = normalizeAttachmentCandidates(rawAttachments);
  for (let i = 0; i < candidates.length; i++) {
    const att = candidates[i];
    const typeHint = att?.type != null ? String(att.type) : (att?.mime_type != null ? String(att.mime_type) : null);
    let url = extractAttachmentUrl(att);
    let shareKind = inferShareKind(typeHint, url);

    if (shareKind && !url) {
      const mediaId = extractAttachmentId(att);
      if (mediaId) {
        url = await tryFetchMediaPermalink(baseIg, baseFb, accessToken, mediaId);
      }
      shareKind = inferShareKind(typeHint, url) || shareKind;
      stored.push({
        type: shareKind,
        share_kind: shareKind,
        is_share: true,
        source_url: url,
        public_url: url,
      });
      continue;
    }

    if (shareKind) {
      shareKind = inferShareKind(typeHint, url) || shareKind;
      stored.push({
        type: shareKind,
        share_kind: shareKind,
        is_share: true,
        source_url: url,
        public_url: url,
      });
      continue;
    }

    if (!url) continue;
    const inferredType = inferAttachmentType(typeHint, url);

    try {
      const saved = await storeImageUrlToBucket(
        admin,
        MEDIA_BUCKET,
        `instagram/${workspaceId}/${instagramAccountId}/${messageId}/${i}`,
        url
      );
      if (saved) {
        stored.push({
          type: inferredType,
          source_url: url,
          bucket: MEDIA_BUCKET,
          path: saved.fullPath,
          public_url: saved.publicUrl,
        });
      } else {
        stored.push({ type: inferredType || 'file', source_url: url, public_url: null });
      }
    } catch {
      stored.push({ type: inferredType || 'file', source_url: url, public_url: null });
    }
  }
  return stored;
}

function sharePreviewTextFromStoredAttachments(stored: any[]): string | null {
  for (const att of Array.isArray(stored) ? stored : []) {
    const kind = att?.share_kind ? String(att.share_kind) : null;
    if (kind === 'reel' || kind === 'post' || kind === 'story') return `See ${kind}`;
    const t = att?.type ? String(att.type).toLowerCase() : '';
    if (t === 'reel' || t === 'post' || t === 'story') return `See ${t}`;
  }
  return null;
}

function getAppOrigin(req: Request): string {
  const origin = req.headers.get('Origin');
  if (origin) return origin;

  const referer = req.headers.get('Referer');
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      // fall through
    }
  }

  return 'https://theacq.app';
}

async function fetchJson(url: URL, label: string, bearerToken?: string) {
  const resp = await fetch(url.toString(), {
    headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : undefined,
  });
  const text = await resp.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!resp.ok || (data && typeof data === 'object' && (data as any).error)) {
    const err = (data as any)?.error;
    const msg =
      err?.message ||
      (typeof data === 'string' ? data : null) ||
      `${label} request failed`;
    const details = {
      status: resp.status,
      label,
      url: url.toString(),
      error: err || data,
    };
    throw Object.assign(new Error(msg), { details });
  }

  return data;
}

async function tryFetchIgUserProfile(baseIg: string, instagramUserId: string, accessToken: string) {
  const profileUrl = new URL(`${baseIg}/${encodeURIComponent(instagramUserId)}`);
  profileUrl.searchParams.set('fields', 'name,username,profile_pic');
  profileUrl.searchParams.set('access_token', accessToken);
  try {
    return await fetchJson(profileUrl, 'user_profile', accessToken);
  } catch {
    return null;
  }
}

function uniqueStrings(xs: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  for (const x of xs) {
    const s = (x == null ? '' : String(x)).trim();
    if (!s) continue;
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

function inferPeerIdFromMessages(selfIds: Set<string>, messages: any[]): string | null {
  for (const msg of Array.isArray(messages) ? messages : []) {
    const senderId = msg?.from?.id ? String(msg.from.id) : null;
    const toData = msg?.to?.data;
    const toIds = uniqueStrings(
      Array.isArray(toData) ? toData.map((x: any) => (x?.id ? String(x.id) : null)) : []
    );
    if (msg?.to?.id) toIds.push(String(msg.to.id));

    const ids = uniqueStrings([senderId, ...toIds]);
    const other = ids.filter((id) => !selfIds.has(id));
    if (other[0]) return other[0];
  }
  return null;
}

function pickPeerId(selfIds: Set<string>, senderId: string | null, recipientIds: string[]) {
  const ids = uniqueStrings([senderId, ...recipientIds]);
  const other = ids.filter((id) => !selfIds.has(id));
  return other[0] || null;
}

function isProbablySpam(text: string | null): boolean {
  const t = (text == null ? '' : String(text)).toLowerCase();
  if (!t.trim()) return false;

  const severeSignals = [
    'onlyfans',
    'porn',
    'airdrop',
    'double your',
    'guaranteed return',
    'forex signal',
  ];
  if (severeSignals.some((k) => t.includes(k))) return true;

  let score = 0;
  const mildSignals = [
    'whatsapp',
    'telegram',
    't.me/',
    'crypto',
    'investment',
    'dm me now',
    'limited offer',
    'click here',
  ];
  for (const signal of mildSignals) {
    if (t.includes(signal)) score += 1;
  }

  const hasUrl = /https?:\/\//i.test(t) || /\bwww\./i.test(t);
  const hasShortener = /bit\.ly|tinyurl|linktr\.ee|t\.co/i.test(t);
  if (hasUrl) score += 1;
  if (hasShortener) score += 2;
  if (/\$\d+|\d+\$|\b\d+%\b/.test(t)) score += 1;
  if ((t.match(/!/g) || []).length >= 3) score += 1;

  // Require multiple weak signals to avoid false positives on normal lead chats.
  return score >= 3;
}

function isAllowedMetaPagingUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return host === 'graph.facebook.com' || host === 'graph.instagram.com';
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

	    const userId = claimsData.claims.sub;
	    const contentType = req.headers.get('content-type') || '';
	    let body: any = null;
	    let uploadFile: File | null = null;
	
	    if (contentType.includes('multipart/form-data')) {
	      const form = await req.formData();
	      body = {};
	      for (const [key, value] of form.entries()) {
	        if (key === 'file' && value instanceof File) {
	          uploadFile = value;
	          continue;
	        }
	        body[key] = typeof value === 'string' ? value : null;
	      }
	      if (uploadFile) body.__file = uploadFile;
	    } else {
	      body = await req.json();
	    }
	
	    const { action, workspaceId, code } = body || {};

    console.log(`Instagram connect action: ${action}, user: ${userId}, workspace: ${workspaceId}`);

    if (action === 'status') {
      if (!workspaceId) {
        return new Response(
          JSON.stringify({ error: 'Missing workspaceId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseServiceKey) {
        return new Response(
          JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const admin = createClient(supabaseUrl, supabaseServiceKey);
      const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, userId);
      if (!hasWorkspaceAccess) {
        return new Response(
          JSON.stringify({ error: 'You do not have access to this workspace' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const { data: connection, error } = await admin
        .from('instagram_connections')
        .select('instagram_account_id, facebook_user_id, page_id, instagram_username, profile_picture_url, token_expires_at')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Instagram status error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to load Instagram status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ connected: !!connection, connection: connection || null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Backfill threads at scale: fetch conversation pages only (no message history).
    // This is the only reliable way to surface "every chat" when a workspace has thousands of DMs.
    if (action === 'sync-conversations') {
      if (!workspaceId) {
        return new Response(
          JSON.stringify({ error: 'Missing workspaceId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseServiceKey) {
        return new Response(
          JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const admin = createClient(supabaseUrl, supabaseServiceKey);

      const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, userId);
      if (!hasWorkspaceAccess) {
        return new Response(
          JSON.stringify({ error: 'You do not have access to this workspace' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const { data: connection, error: connectionError } = await admin
        .from('instagram_connections')
        .select('instagram_account_id, access_token, facebook_user_id, page_id')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (connectionError) {
        console.error('Instagram sync-conversations connection lookup error:', connectionError);
        return new Response(
          JSON.stringify({ error: 'Failed to load Instagram connection', details: connectionError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!connection?.instagram_account_id || !connection?.access_token) {
        return new Response(
          JSON.stringify({ error: 'No Instagram connection found for this workspace' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const instagramAccountId = String(connection.instagram_account_id);
      const accessToken = String(connection.access_token);
      const selfIds = new Set<string>([instagramAccountId]);
      if (connection?.page_id) selfIds.add(String(connection.page_id));
      if (connection?.facebook_user_id) selfIds.add(String(connection.facebook_user_id));

      const baseIg = `https://graph.instagram.com/${GRAPH_API_VERSION}`;
      const baseFb = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

      const requestedMaxPages = Number(body?.maxPages);
      const envMaxPages = Number(Deno.env.get('INSTAGRAM_SYNC_CONVERSATIONS_PAGES_PER_RUN') || '3');
      const MAX_PAGES =
        Number.isFinite(requestedMaxPages) && requestedMaxPages > 0
          ? Math.min(Math.round(requestedMaxPages), 25)
          : Math.min(Math.max(1, envMaxPages), 25);

      const pageUrlRaw = body?.pageUrl != null ? String(body.pageUrl).trim() : '';
      const conversationFieldsCandidates = [
        'id,updated_time,participants.limit(10){id,username,name}',
        'id,updated_time',
      ] as const;

      const fetchFirstPage = async () => {
        let lastError: any = null;
        for (const fields of conversationFieldsCandidates) {
          try {
            const url = new URL(`${baseIg}/${encodeURIComponent(instagramAccountId)}/conversations`);
            url.searchParams.set('platform', 'instagram');
            url.searchParams.set('limit', '50');
            url.searchParams.set('fields', fields);
            url.searchParams.set('access_token', accessToken);
            return { data: await fetchJson(url, 'conversations', accessToken), base: 'ig' as const };
          } catch (e1: any) {
            lastError = e1;
          }
          try {
            const url = new URL(`${baseIg}/me/conversations`);
            url.searchParams.set('platform', 'instagram');
            url.searchParams.set('limit', '50');
            url.searchParams.set('fields', fields);
            url.searchParams.set('access_token', accessToken);
            return { data: await fetchJson(url, 'me_conversations', accessToken), base: 'ig' as const };
          } catch (e2: any) {
            lastError = e2;
          }
          try {
            const url = new URL(`${baseFb}/${encodeURIComponent(instagramAccountId)}/conversations`);
            url.searchParams.set('platform', 'instagram');
            url.searchParams.set('limit', '50');
            url.searchParams.set('fields', fields);
            url.searchParams.set('access_token', accessToken);
            return { data: await fetchJson(url, 'fb_conversations', accessToken), base: 'fb' as const };
          } catch (e3: any) {
            lastError = e3;
          }
        }
        throw lastError || new Error('Failed to fetch conversations');
      };

      const normalizeNextUrl = (raw: string): URL | null => {
        if (!raw) return null;
        if (!isAllowedMetaPagingUrl(raw)) return null;
        try {
          const u = new URL(raw);
          if (!u.searchParams.get('access_token')) u.searchParams.set('access_token', accessToken);
          return u;
        } catch {
          return null;
        }
      };

      let pageData: any = null;
      let activeBase: 'ig' | 'fb' = 'ig';
      let nextPageUrl: string | null = null;

      if (pageUrlRaw) {
        const u = normalizeNextUrl(pageUrlRaw);
        if (!u) {
          return new Response(
            JSON.stringify({ error: 'Invalid pageUrl' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        pageData = await fetchJson(u, 'conversations_page', accessToken);
        activeBase = u.hostname.toLowerCase().includes('facebook') ? 'fb' : 'ig';
      } else {
        const first = await fetchFirstPage();
        pageData = first.data;
        activeBase = first.base;
      }

      const rowsToUpsert: any[] = [];
      let conversationsFetched = 0;
      let pagesFetched = 0;

      const safeSeg = (value: string): string => String(value || '').trim();

      while (pageData && pagesFetched < MAX_PAGES) {
        pagesFetched += 1;
        const items: any[] = Array.isArray(pageData?.data) ? pageData.data : [];
        conversationsFetched += items.length;

        for (const conversation of items) {
          const metaConversationId = conversation?.id ? String(conversation.id) : null;
          if (!metaConversationId) continue;

          const participants = Array.isArray(conversation?.participants?.data) ? conversation.participants.data : [];
          const peerObj = participants.find((p: any) => {
            const pid = p?.id ? String(p.id) : '';
            return pid && !selfIds.has(pid);
          }) || null;
          const peerIdCandidate = peerObj?.id ? String(peerObj.id) : '';

          const peerId =
            peerIdCandidate && !selfIds.has(peerIdCandidate)
              ? peerIdCandidate
              : `unknown:${metaConversationId}`;

          const threadKey = `${safeSeg(instagramAccountId)}:${safeSeg(peerId)}`;
          const updatedTime = conversation?.updated_time ? String(conversation.updated_time) : null;
          const { value: updatedIso } = parseMetaTimestamp(updatedTime);

          const row: Record<string, any> = {
            workspace_id: workspaceId,
            instagram_account_id: instagramAccountId,
            conversation_id: threadKey,
            instagram_user_id: peerId,
            // Product decision: setters can see all leads by default.
            // "Private lead" is represented by hidden_from_setters=true and will override this via trigger.
            shared_with_setters: true,
          };

          // Best-effort peer display data. Do not overwrite known values with empty strings.
          const peerUsername = peerObj?.username != null ? String(peerObj.username).trim() : '';
          const peerName = peerObj?.name != null ? String(peerObj.name).trim() : '';
          if (peerUsername) row.peer_username = peerUsername;
          if (peerName) row.peer_name = peerName;
          if (updatedIso) row.last_message_at = updatedIso;

          rowsToUpsert.push(row);
        }

        const nextRaw = pageData?.paging?.next ? String(pageData.paging.next) : null;
        nextPageUrl = nextRaw && isAllowedMetaPagingUrl(nextRaw) ? nextRaw : null;
        if (!nextPageUrl) break;

        const u = normalizeNextUrl(nextPageUrl);
        if (!u) break;
        pageData = await fetchJson(u, 'conversations_page', accessToken);
      }

      const CHUNK = 200;
      let threadsUpserted = 0;
      for (let i = 0; i < rowsToUpsert.length; i += CHUNK) {
        const batch = rowsToUpsert.slice(i, i + CHUNK);
        const { error: upsertError } = await admin
          .from('instagram_threads')
          .upsert(batch, { onConflict: 'workspace_id,conversation_id' });
        if (upsertError) {
          console.error('sync-conversations: instagram_threads upsert error:', upsertError);
          return new Response(
            JSON.stringify({ error: 'Failed to save thread metadata', details: upsertError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        threadsUpserted += batch.length;
      }

      return new Response(
        JSON.stringify({
          success: true,
          mode: activeBase,
          pagesFetched,
          conversationsFetched,
          threadsUpserted,
          nextPageUrl,
          done: !nextPageUrl,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'sync-messages') {
      if (!workspaceId) {
        return new Response(
          JSON.stringify({ error: 'Missing workspaceId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseServiceKey) {
        return new Response(
          JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const admin = createClient(supabaseUrl, supabaseServiceKey);

      // Use the service role client for connection lookup. RLS on instagram_connections can vary,
      // so we do our own workspace access check and then read the workspace's active connection.
      const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, userId);
      if (!hasWorkspaceAccess) {
        return new Response(
          JSON.stringify({ error: 'You do not have access to this workspace' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const workspaceRole = await resolveWorkspaceRole(admin, workspaceId, userId);

      const { data: connection, error: connectionError } = await admin
        .from('instagram_connections')
        .select('instagram_account_id, access_token, facebook_user_id, page_id')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (connectionError) {
        console.error('Instagram sync connection lookup error:', connectionError);
        return new Response(
          JSON.stringify({ error: 'Failed to load Instagram connection', details: connectionError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!connection?.instagram_account_id || !connection?.access_token) {
        return new Response(
          JSON.stringify({ error: 'No Instagram connection found for this workspace' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const instagramAccountId = String(connection.instagram_account_id);
      const accessToken = String(connection.access_token);
      const selfIds = new Set<string>([instagramAccountId]);
      if (connection?.page_id) selfIds.add(String(connection.page_id));
      if (connection?.facebook_user_id) selfIds.add(String(connection.facebook_user_id));
      await ensurePublicBucket(admin, MEDIA_BUCKET);

      // Fetch recent conversations and messages.
      // Meta has multiple Instagram messaging surfaces and the correct base host depends on the token type.
      // We try graph.instagram.com first (Instagram Login tokens) and fall back to graph.facebook.com
      // (Page-based / Messenger API tokens) when needed.
      const baseIg = `https://graph.instagram.com/${GRAPH_API_VERSION}`;
      const baseFb = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

      const syncErrors: any[] = [];
      const warnings: string[] = [];
      const conversationFieldsCandidates = [
        'id,updated_time,participants.limit(10){id,username,name}',
        'id,updated_time',
      ] as const;

      const tryFetchConversations = async (base: string, path: string) => {
        let lastError: any = null;
        for (const fields of conversationFieldsCandidates) {
          try {
            const url = new URL(`${base}/${path}`);
            url.searchParams.set('platform', 'instagram');
            url.searchParams.set('limit', '50');
            url.searchParams.set('fields', fields);
            // Use query param for compatibility + Bearer header (some endpoints are stricter).
            url.searchParams.set('access_token', accessToken);
            return await fetchJson(url, 'conversations', accessToken);
          } catch (err) {
            lastError = err;
          }
        }
        throw lastError || new Error('Failed to fetch conversations');
      };

      let conversationsData: any = null;
      let activeBase: 'ig' | 'fb' = 'ig';
      try {
        conversationsData = await tryFetchConversations(baseIg, `${encodeURIComponent(instagramAccountId)}/conversations`);
      } catch (e: any) {
        syncErrors.push({ step: 'conversations', details: e?.details || String(e) });
        // Fallback to /me/conversations
        try {
          conversationsData = await tryFetchConversations(baseIg, `me/conversations`);
          activeBase = 'ig';
        } catch (e2: any) {
          syncErrors.push({ step: 'me_conversations', details: e2?.details || String(e2) });
          // Fall back to Facebook Graph host. This can work when the token is Page-based.
          try {
            conversationsData = await tryFetchConversations(baseFb, `${encodeURIComponent(instagramAccountId)}/conversations`);
            activeBase = 'fb';
          } catch (e3: any) {
            syncErrors.push({ step: 'fb_conversations', details: e3?.details || String(e3) });
            console.error('Conversations fetch failed:', syncErrors);
            return new Response(
              JSON.stringify({
                error: 'Failed to fetch conversations from Meta',
                details: syncErrors.slice(0, 3),
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      const envMaxConversations = Number(Deno.env.get('INSTAGRAM_SYNC_MAX_CONVERSATIONS') || '100');
      const envMaxPages = Number(Deno.env.get('INSTAGRAM_SYNC_MAX_CONVERSATION_PAGES') || '20');
      const envMessagesLimit = Number(Deno.env.get('INSTAGRAM_SYNC_MESSAGES_LIMIT') || String(SYNC_MESSAGES_LIMIT || 50));
      const requestedMaxConversations = Number(body?.maxConversations);
      const requestedMaxPages = Number(body?.maxPages);
      const requestedMessagesLimit = Number(body?.messagesLimit);
      const MAX_CONVERSATIONS =
        Number.isFinite(requestedMaxConversations) && requestedMaxConversations > 0
          ? Math.min(Math.round(requestedMaxConversations), 250)
          : envMaxConversations;
      const MAX_CONVERSATION_PAGES =
        Number.isFinite(requestedMaxPages) && requestedMaxPages > 0
          ? Math.min(Math.round(requestedMaxPages), 50)
          : envMaxPages;
      const messagesLimit =
        Number.isFinite(requestedMessagesLimit) && requestedMessagesLimit > 0
          ? Math.min(Math.round(requestedMessagesLimit), 80)
          : envMessagesLimit;
      const START_MS = Date.now();

      const allConversations: any[] = [];
      let pageData: any = conversationsData;
      let pageCount = 0;

      while (pageData) {
        const items: any[] = Array.isArray(pageData?.data) ? pageData.data : [];
        if (items.length > 0) allConversations.push(...items);

        const nextUrl = pageData?.paging?.next ? String(pageData.paging.next) : null;
        if (!nextUrl) break;
        if (allConversations.length >= MAX_CONVERSATIONS) {
          warnings.push(`Fetched first ${MAX_CONVERSATIONS} conversations (truncated for performance).`);
          break;
        }
        if (pageCount >= MAX_CONVERSATION_PAGES) {
          warnings.push('Conversation list pagination stopped early (too many pages).');
          break;
        }
        if (Date.now() - START_MS > 45_000) {
          warnings.push('Sync took too long; stopped fetching more conversations.');
          break;
        }

        try {
          pageData = await fetchJson(new URL(nextUrl), 'conversations_page', accessToken);
          pageCount += 1;
        } catch (ePage: any) {
          syncErrors.push({ step: 'conversations_page', details: ePage?.details || String(ePage) });
          break;
        }
      }

      const conversationIds = Array.from(
        new Set(allConversations.map((c) => (c?.id ? String(c.id) : null)).filter(Boolean))
      ).slice(0, MAX_CONVERSATIONS);
      const hintedPeerIdByConversationId: Record<string, string> = {};
      const updatedTimeByConversationId: Record<string, string> = {};
      for (const conversation of allConversations) {
        const conversationId = conversation?.id ? String(conversation.id) : null;
        if (!conversationId) continue;
        if (conversation?.updated_time) {
          updatedTimeByConversationId[conversationId] = String(conversation.updated_time);
        }
        const participants = Array.isArray(conversation?.participants?.data)
          ? conversation.participants.data
          : [];
        const participantIds = uniqueStrings(
          participants.map((p: any) => (p?.id ? String(p.id) : null))
        );
        const hintedPeerId = participantIds.find((id) => !selfIds.has(id)) || null;
        if (hintedPeerId) hintedPeerIdByConversationId[conversationId] = hintedPeerId;
      }

      if (conversationIds.length === 0) {
        warnings.push(
          'No conversations were returned by Meta. This is common if your inbox is empty in Primary/General, or if most chats are in Requests and inactive > 30 days.'
        );
      }

      const messagesToUpsert: any[] = [];
      const threadMetaByConversation: Record<string, {
        conversation_id: string;
        instagram_user_id: string;
        last_message_id: string | null;
        last_message_text: string | null;
        last_message_direction: 'inbound' | 'outbound' | null;
        last_message_at: string | null;
        last_inbound_at: string | null;
        last_inbound_ts: number;
        last_outbound_at: string | null;
        last_outbound_ts: number;
        last_ts: number;
      }> = {};
      let conversationsWithMessages = 0;

      for (const conversationId of conversationIds) {
        try {
          if (activeBase === 'fb') {
            // Facebook Graph style: /{conversation-id}/messages
            const messagesUrl = new URL(`${baseFb}/${encodeURIComponent(String(conversationId))}/messages`);
            messagesUrl.searchParams.set('access_token', accessToken);
            messagesUrl.searchParams.set('limit', String(messagesLimit));
            messagesUrl.searchParams.set('fields', 'id,created_time,from,to,message,attachments');

            const messagesData = await fetchJson(messagesUrl, 'messages', accessToken);
            const msgs: any[] = Array.isArray(messagesData?.data) ? messagesData.data : [];
            if (msgs.length > 0) conversationsWithMessages += 1;
            const peerIdForConversation =
              inferPeerIdFromMessages(selfIds, msgs) ||
              hintedPeerIdByConversationId[String(conversationId)] ||
              null;

            // If Meta returns a conversation shell but no messages, still materialize a thread row so the
            // inbox can show it and allow future syncs to attach messages when they become available.
            if (msgs.length === 0) {
              const hintedPeer = hintedPeerIdByConversationId[String(conversationId)] || null;
              const peerId = hintedPeer && !selfIds.has(hintedPeer) ? hintedPeer : null;
              const instagramUserId = peerId ? peerId : `unknown:${String(conversationId)}`;
              const threadKey = `${instagramAccountId}:${String(instagramUserId)}`;
              const updatedTime = updatedTimeByConversationId[String(conversationId)] || null;
              const { value: messageTimestamp, ms: tsNum } = parseMetaTimestamp(updatedTime);
              const existing = threadMetaByConversation[threadKey];
              if (!existing || tsNum >= existing.last_ts) {
                threadMetaByConversation[threadKey] = {
                  conversation_id: threadKey,
                  instagram_user_id: String(instagramUserId),
                  last_message_id: null,
                  last_message_text: null,
                  last_message_direction: null,
                  last_message_at: messageTimestamp,
                  last_inbound_at: null,
                  last_inbound_ts: 0,
                  last_outbound_at: null,
                  last_outbound_ts: 0,
                  last_ts: tsNum || 0,
                };
              }
            }

            for (const msg of msgs) {
              const messageId = msg?.id ? String(msg.id) : null;
              if (!messageId) continue;

              const senderId = msg?.from?.id ? String(msg.from.id) : null;
              const toData = msg?.to?.data;
              const toIds = uniqueStrings(
                Array.isArray(toData) ? toData.map((x: any) => (x?.id ? String(x.id) : null)) : []
              );
              if (msg?.to?.id) toIds.push(String(msg.to.id));

              const direction = senderId && selfIds.has(senderId) ? 'outbound' : 'inbound';
              const peerId = peerIdForConversation || pickPeerId(selfIds, senderId, toIds);
              const instagramUserId = peerId && !selfIds.has(peerId) ? peerId : `unknown:${String(conversationId)}`;
              const threadKey = `${instagramAccountId}:${String(instagramUserId)}`;

              const messageText = msg?.message != null ? String(msg.message) : null;
              const storedAttachments = await storeAttachmentsToBucket(
                admin,
                String(workspaceId),
                String(instagramAccountId),
                String(messageId),
                msg?.attachments,
                accessToken,
                baseIg,
                baseFb
              );
              const sharePreviewText = sharePreviewTextFromStoredAttachments(storedAttachments);
              const lastTextCandidate = messageText != null ? String(messageText).trim() : '';
              const lastText =
                lastTextCandidate ||
                sharePreviewText ||
                (storedAttachments.length ? '[attachment]' : 'Content not available');

              const { value: messageTimestamp, ms: tsNum } = parseMetaTimestamp(msg?.created_time);

              // Track thread "last message" metadata for the conversation.
              const existing = threadMetaByConversation[threadKey];
              if (!existing || tsNum >= existing.last_ts) {
                threadMetaByConversation[threadKey] = {
                  conversation_id: threadKey,
                  instagram_user_id: String(instagramUserId),
                  last_message_id: messageId,
                  last_message_text: lastText,
                  last_message_direction: direction,
                  last_message_at: messageTimestamp,
                  last_inbound_at:
                    direction === 'inbound' ? messageTimestamp : (existing?.last_inbound_at || null),
                  last_inbound_ts:
                    direction === 'inbound' ? tsNum : (existing?.last_inbound_ts || 0),
                  last_outbound_at:
                    direction === 'outbound' ? messageTimestamp : (existing?.last_outbound_at || null),
                  last_outbound_ts:
                    direction === 'outbound' ? tsNum : (existing?.last_outbound_ts || 0),
                  last_ts: tsNum,
                };
              } else if (existing) {
                if (direction === 'inbound' && tsNum >= (existing.last_inbound_ts || 0)) {
                  existing.last_inbound_ts = tsNum;
                  existing.last_inbound_at = messageTimestamp;
                } else if (direction === 'outbound' && tsNum >= (existing.last_outbound_ts || 0)) {
                  existing.last_outbound_ts = tsNum;
                  existing.last_outbound_at = messageTimestamp;
                }
              }

              messagesToUpsert.push({
                workspace_id: workspaceId,
                instagram_account_id: instagramAccountId,
                instagram_user_id: instagramUserId,
                sender_id: senderId,
                recipient_id:
                  direction === 'outbound'
                    ? (peerId || toIds.find((id) => !selfIds.has(id)) || toIds.find((id) => id !== senderId) || toIds[0] || null)
                    : (toIds.find((id) => selfIds.has(id)) || toIds.find((id) => id !== senderId) || toIds[0] || null),
                message_id: messageId,
                // Only store actual message text. Attachments are rendered from raw_payload.
                message_text: messageText ? String(messageText) : null,
                direction,
                message_timestamp: messageTimestamp,
                raw_payload: { ...msg, conversation_id: String(conversationId), conversation_key: threadKey, stored_attachments: storedAttachments },
              });
            }
          } else {
            // Instagram Graph style: list message IDs then fetch message details.
            const listUrl = new URL(`${baseIg}/${encodeURIComponent(String(conversationId))}`);
            // Try to fetch message details in one call to avoid N+1 requests.
            listUrl.searchParams.set(
              'fields',
              `messages.limit(${messagesLimit}){id,created_time,from,to,message,attachments}`
            );
            listUrl.searchParams.set('access_token', accessToken);

            const listData = await fetchJson(listUrl, 'conversation_messages', accessToken);
            let messageEdges: any[] = Array.isArray(listData?.messages?.data) ? listData.messages.data : [];

            // Some Meta surfaces expose messages via an explicit `/messages` edge.
            if (messageEdges.length === 0) {
              try {
                const altUrl = new URL(`${baseIg}/${encodeURIComponent(String(conversationId))}/messages`);
                altUrl.searchParams.set('access_token', accessToken);
                altUrl.searchParams.set('limit', String(messagesLimit));
                altUrl.searchParams.set('fields', 'id,created_time,from,to,message,attachments');
                const altData = await fetchJson(altUrl, 'conversation_messages_edge', accessToken);
                const altEdges: any[] = Array.isArray(altData?.data) ? altData.data : [];
                if (altEdges.length > 0) messageEdges = altEdges;
              } catch {
                // ignore; best-effort fallback
              }
            }

            // Some tokens work on the Facebook Graph host even when conversations were fetched via graph.instagram.com.
            if (messageEdges.length === 0) {
              try {
                const fbUrl = new URL(`${baseFb}/${encodeURIComponent(String(conversationId))}/messages`);
                fbUrl.searchParams.set('access_token', accessToken);
                fbUrl.searchParams.set('limit', String(messagesLimit));
                fbUrl.searchParams.set('fields', 'id,created_time,from,to,message,attachments');
                const fbData = await fetchJson(fbUrl, 'conversation_messages_fb_fallback', accessToken);
                const fbEdges: any[] = Array.isArray(fbData?.data) ? fbData.data : [];
                if (fbEdges.length > 0) messageEdges = fbEdges;
              } catch {
                // ignore; best-effort fallback
              }
            }
            if (messageEdges.length > 0) conversationsWithMessages += 1;
            const peerIdForConversation =
              inferPeerIdFromMessages(selfIds, messageEdges) ||
              hintedPeerIdByConversationId[String(conversationId)] ||
              null;

            // If Meta returns a conversation shell but no messages, still materialize a thread row so the
            // inbox can show it and allow future syncs to attach messages when they become available.
            if (messageEdges.length === 0) {
              const hintedPeer = hintedPeerIdByConversationId[String(conversationId)] || null;
              const peerId = hintedPeer && !selfIds.has(hintedPeer) ? hintedPeer : null;
              const instagramUserId = peerId ? peerId : `unknown:${String(conversationId)}`;
              const threadKey = `${instagramAccountId}:${String(instagramUserId)}`;
              const updatedTime = updatedTimeByConversationId[String(conversationId)] || null;
              const { value: messageTimestamp, ms: tsNum } = parseMetaTimestamp(updatedTime);
              const existing = threadMetaByConversation[threadKey];
              if (!existing || tsNum >= existing.last_ts) {
                threadMetaByConversation[threadKey] = {
                  conversation_id: threadKey,
                  instagram_user_id: String(instagramUserId),
                  last_message_id: null,
                  last_message_text: null,
                  last_message_direction: null,
                  last_message_at: messageTimestamp,
                  last_inbound_at: null,
                  last_inbound_ts: 0,
                  last_outbound_at: null,
                  last_outbound_ts: 0,
                  last_ts: tsNum || 0,
                };
              }
            }

            for (const edge of messageEdges) {
              const messageId = edge?.id ? String(edge.id) : null;
              if (!messageId) continue;

              let msg: any = edge;
              const edgeHasDetails = Boolean(edge?.created_time || edge?.message || edge?.attachments);
              if (!edgeHasDetails) {
                try {
                  const msgUrl = new URL(`${baseIg}/${encodeURIComponent(messageId)}`);
                  msgUrl.searchParams.set('fields', 'id,created_time,from,to,message,attachments');
                  msgUrl.searchParams.set('access_token', accessToken);
                  msg = await fetchJson(msgUrl, 'message', accessToken);
                } catch (eMsg: any) {
                  syncErrors.push({
                    step: 'message_detail',
                    message_id: messageId,
                    conversation_id: String(conversationId),
                    details: eMsg?.details || String(eMsg),
                  });
                  msg = edge;
                }
              }

              const senderId = msg?.from?.id ? String(msg.from.id) : (edge?.from?.id ? String(edge.from.id) : null);
              const toData = msg?.to?.data ?? edge?.to?.data;
              const toIds = uniqueStrings(
                Array.isArray(toData) ? toData.map((x: any) => (x?.id ? String(x.id) : null)) : []
              );
              if (msg?.to?.id) toIds.push(String(msg.to.id));
              if (edge?.to?.id) toIds.push(String(edge.to.id));

              const direction = senderId && selfIds.has(senderId) ? 'outbound' : 'inbound';
              const peerId = peerIdForConversation || pickPeerId(selfIds, senderId, toIds);
              const instagramUserId = peerId && !selfIds.has(peerId) ? peerId : `unknown:${String(conversationId)}`;
              const threadKey = `${instagramAccountId}:${String(instagramUserId)}`;

              const messageText =
                msg?.message != null
                  ? String(msg.message)
                  : (msg?.text != null ? String(msg.text) : null);
              const storedAttachments = await storeAttachmentsToBucket(
                admin,
                String(workspaceId),
                String(instagramAccountId),
                String(messageId),
                msg?.attachments ?? edge?.attachments,
                accessToken,
                baseIg,
                baseFb
              );
              const sharePreviewText = sharePreviewTextFromStoredAttachments(storedAttachments);
              const lastTextCandidate = messageText != null ? String(messageText).trim() : '';
              const lastText =
                lastTextCandidate ||
                sharePreviewText ||
                (storedAttachments.length ? '[attachment]' : 'Content not available');

              const { value: messageTimestamp, ms: tsNum } = parseMetaTimestamp(msg?.created_time ?? edge?.created_time);

              // Track thread "last message" metadata for the conversation.
              const existing = threadMetaByConversation[threadKey];
              if (!existing || tsNum >= existing.last_ts) {
                threadMetaByConversation[threadKey] = {
                  conversation_id: threadKey,
                  instagram_user_id: String(instagramUserId),
                  last_message_id: messageId,
                  last_message_text: lastText,
                  last_message_direction: direction,
                  last_message_at: messageTimestamp,
                  last_inbound_at:
                    direction === 'inbound' ? messageTimestamp : (existing?.last_inbound_at || null),
                  last_inbound_ts:
                    direction === 'inbound' ? tsNum : (existing?.last_inbound_ts || 0),
                  last_outbound_at:
                    direction === 'outbound' ? messageTimestamp : (existing?.last_outbound_at || null),
                  last_outbound_ts:
                    direction === 'outbound' ? tsNum : (existing?.last_outbound_ts || 0),
                  last_ts: tsNum,
                };
              } else if (existing) {
                if (direction === 'inbound' && tsNum >= (existing.last_inbound_ts || 0)) {
                  existing.last_inbound_ts = tsNum;
                  existing.last_inbound_at = messageTimestamp;
                } else if (direction === 'outbound' && tsNum >= (existing.last_outbound_ts || 0)) {
                  existing.last_outbound_ts = tsNum;
                  existing.last_outbound_at = messageTimestamp;
                }
              }

              messagesToUpsert.push({
                workspace_id: workspaceId,
                instagram_account_id: instagramAccountId,
                instagram_user_id: instagramUserId,
                sender_id: senderId,
                recipient_id:
                  direction === 'outbound'
                    ? (peerId || toIds.find((id) => !selfIds.has(id)) || toIds.find((id) => id !== senderId) || toIds[0] || null)
                    : (toIds.find((id) => selfIds.has(id)) || toIds.find((id) => id !== senderId) || toIds[0] || null),
                message_id: messageId,
                message_text: messageText ? String(messageText) : null,
                direction,
                message_timestamp: messageTimestamp,
                raw_payload: { ...(msg || {}), conversation_id: String(conversationId), conversation_key: threadKey, stored_attachments: storedAttachments },
              });
            }
          }
        } catch (e: any) {
          syncErrors.push({ step: 'conversation_loop', conversation_id: String(conversationId), details: e?.details || String(e) });
          // Continue other conversations (best-effort).
        }
      }

      const CHUNK = 200;
      let upserted = 0;
      for (let i = 0; i < messagesToUpsert.length; i += CHUNK) {
        const batch = messagesToUpsert.slice(i, i + CHUNK);
        const { error: upsertError } = await admin
          .from('instagram_messages')
          .upsert(batch, { onConflict: 'message_id' });

        if (upsertError) {
          console.error('Messages upsert error:', upsertError);
          return new Response(
            JSON.stringify({ error: 'Failed to save messages', details: upsertError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        upserted += batch.length;
      }

      // Best-effort: backfill usernames/profile pics for conversation peers and upsert thread metadata.
      const peerIds = Array.from(
        new Set(
          Object.values(threadMetaByConversation)
            .map((m) => m.instagram_user_id)
            .filter((v) => v && v !== 'unknown' && !String(v).startsWith('unknown:'))
        )
      );

      const peerProfileById: Record<string, { username?: string | null; name?: string | null; pic?: string | null }> = {};
      const now = Date.now();
      const STALE_MS = 24 * 60 * 60 * 1000;

      for (const peerId of peerIds) {
        try {
          const { data: existing } = await admin
            .from('instagram_users')
            .select('username,name,profile_pic_url,profile_pic_public_url,profile_pic_storage_path,profile_fetched_at')
            .eq('workspace_id', workspaceId)
            .eq('instagram_user_id', peerId)
            .maybeSingle();

          const fetchedAtMs = existing?.profile_fetched_at ? new Date(existing.profile_fetched_at).getTime() : 0;
          const isStale = !fetchedAtMs || (now - fetchedAtMs) > STALE_MS;
          const needsFetch = isStale || !existing?.username || (!existing?.profile_pic_public_url && !existing?.profile_pic_url);

          let profile: any | null = null;
          if (needsFetch) {
            profile = await tryFetchIgUserProfile(baseIg, peerId, accessToken);
          }

          const profilePicUrl = (profile?.profile_pic as string | undefined) || existing?.profile_pic_url || null;
          let stored = null as any;
          if (profile && profilePicUrl) {
            // Store to Supabase Storage so avatars don't break when Meta's URL expires.
            stored = await storeImageUrlToBucket(
              admin,
              MEDIA_BUCKET,
              `instagram/profile-pics/${workspaceId}/${peerId}`,
              profilePicUrl
            );
          }

          const username = (profile?.username as string | undefined) || existing?.username || null;
          const name = (profile?.name as string | undefined) || existing?.name || null;
          const publicPic = stored?.publicUrl || existing?.profile_pic_public_url || null;

          await admin
            .from('instagram_users')
            .upsert(
              {
                workspace_id: workspaceId,
                instagram_user_id: peerId,
                username,
                name,
                profile_pic_url: profilePicUrl,
                profile_pic_storage_path: stored?.fullPath || existing?.profile_pic_storage_path || null,
                profile_pic_public_url: publicPic,
                profile_fetched_at: new Date().toISOString(),
              },
              { onConflict: 'workspace_id,instagram_user_id' }
            );

          peerProfileById[peerId] = { username, name, pic: publicPic || profilePicUrl };
        } catch (e) {
          // Ignore profile failures; fallback to IDs in UI.
        }
      }

      const threadsToUpsert = Object.values(threadMetaByConversation)
        .filter((m) => m.instagram_user_id && m.instagram_user_id !== 'unknown')
        .map((m) => {
          const peer = peerProfileById[m.instagram_user_id] || {};
          return {
            workspace_id: workspaceId,
            instagram_account_id: instagramAccountId,
            conversation_id: m.conversation_id,
            instagram_user_id: m.instagram_user_id,
            // Setters can see all leads by default (unless explicitly made private).
            shared_with_setters: true,
            peer_username: peer.username || null,
            peer_name: peer.name || null,
            peer_profile_picture_url: peer.pic || null,
            last_message_id: m.last_message_id,
            last_message_text: m.last_message_text,
            last_message_direction: m.last_message_direction,
            last_message_at: m.last_message_at,
            last_inbound_at: m.last_inbound_at,
            last_outbound_at: m.last_outbound_at,
          };
        });

      // Default funnel-stage behavior:
      // - Newly discovered conversations (including initial backfill) default to "New lead".
      let newConversationIdsForDefaultPhase: string[] = [];
      try {
        if (threadsToUpsert.length > 0) {
          const convIds = threadsToUpsert.map((t) => String(t.conversation_id)).filter(Boolean).slice(0, 1000);
          if (convIds.length > 0) {
            const { data: anyExisting, error: anyExistingError } = await admin
              .from('instagram_threads')
              .select('conversation_id')
              .eq('workspace_id', workspaceId)
              .eq('instagram_account_id', instagramAccountId)
              .limit(1)
              .maybeSingle();

            const hadThreadsBefore = !anyExistingError && Boolean(anyExisting?.conversation_id);
            if (!hadThreadsBefore) {
              newConversationIdsForDefaultPhase = convIds;
            } else {
              const { data: existingRows, error: existingRowsError } = await admin
                .from('instagram_threads')
                .select('conversation_id')
                .eq('workspace_id', workspaceId)
                .in('conversation_id', convIds);

              const existingSet = new Set<string>();
              if (!existingRowsError && Array.isArray(existingRows)) {
                for (const row of existingRows) {
                  const cid = row?.conversation_id ? String(row.conversation_id) : '';
                  if (cid) existingSet.add(cid);
                }
              }

              newConversationIdsForDefaultPhase = convIds.filter((cid) => !existingSet.has(cid));
            }
          }
        }
      } catch {
        newConversationIdsForDefaultPhase = [];
      }

      if (threadsToUpsert.length > 0) {
        try {
          const tryUpsert = async (rows: any[]) => {
            const { error } = await admin
              .from('instagram_threads')
              .upsert(rows, { onConflict: 'workspace_id,conversation_id' });
            return error || null;
          };

          let threadError: any = await tryUpsert(threadsToUpsert);

          // Backwards compatibility: older environments may not have some columns yet.
          if (threadError) {
            const msg = `${String(threadError?.message || '')} ${String(threadError?.details || '')} ${String(threadError?.hint || '')}`.toLowerCase();
            const looksLikeMissingColumn = msg.includes('column') || msg.includes('does not exist');
            if (looksLikeMissingColumn) {
              const reduced = threadsToUpsert.map((t) => {
                const { last_inbound_at, last_outbound_at, ...rest } = t as any;
                return rest;
              });
              threadError = await tryUpsert(reduced);

              if (threadError) {
                const minimal = threadsToUpsert.map((t) => ({
                  workspace_id: t.workspace_id,
                  instagram_account_id: t.instagram_account_id,
                  conversation_id: t.conversation_id,
                  instagram_user_id: t.instagram_user_id,
                  last_message_id: t.last_message_id,
                  last_message_text: t.last_message_text,
                  last_message_direction: t.last_message_direction,
                  last_message_at: t.last_message_at,
                }));
                threadError = await tryUpsert(minimal);
              }
            }
          }

          if (threadError) {
            // If we also failed to fetch messages, threads are the only way the inbox can render.
            if (upserted === 0) {
              return new Response(
                JSON.stringify({ error: 'Failed to save thread metadata', details: threadError }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            warnings.push('Failed to update thread metadata. Your inbox will still work but names/avatars may be missing.');
          }
        } catch {
          if (upserted === 0) {
            return new Response(
              JSON.stringify({ error: 'Failed to save thread metadata' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          warnings.push('Thread metadata update failed (table missing?).');
        }
      }

      // Apply "New lead" funnel-stage tag to newly discovered conversations (including initial backfill).
      if (newConversationIdsForDefaultPhase.length > 0) {
        try {
          const preset = {
            name: 'New lead',
            color: '#ec4899',
            icon: 'user-plus',
            prompt: 'Brand new inbound lead that has not been worked yet.',
          };

          let newLeadTagId: string | null = null;
          const { data: existingTag, error: existingTagError } = await admin
            .from('instagram_tags')
            .select('id,name')
            .eq('workspace_id', workspaceId)
            .ilike('name', preset.name)
            .maybeSingle();
          if (!existingTagError && existingTag?.id) {
            newLeadTagId = String(existingTag.id);
          } else {
            const { data: createdTag, error: createdTagError } = await admin
              .from('instagram_tags')
              .insert({
                workspace_id: workspaceId,
                name: preset.name,
                color: preset.color,
                icon: preset.icon,
                prompt: preset.prompt,
                created_by: null,
              })
              .select('id')
              .maybeSingle();
            if (!createdTagError && createdTag?.id) {
              newLeadTagId = String(createdTag.id);
            } else {
              const { data: rows } = await admin
                .from('instagram_tags')
                .select('id,name')
                .eq('workspace_id', workspaceId);
              const fallback = (Array.isArray(rows) ? rows : []).find(
                (r: any) => String(r?.name || '').trim().toLowerCase() === preset.name.toLowerCase()
              );
              if (fallback?.id) newLeadTagId = String(fallback.id);
            }
          }

          if (newLeadTagId) {
            const rows = newConversationIdsForDefaultPhase.slice(0, 1000).map((conversationId) => ({
              workspace_id: workspaceId,
              conversation_id: conversationId,
              tag_id: newLeadTagId,
              source: 'ai',
              created_by: null,
            }));
            if (rows.length > 0) {
              const { error: linkError } = await admin.from('instagram_conversation_tags').insert(rows);
              if (linkError && String((linkError as any)?.code || '') !== '23505') {
                warnings.push('Failed to apply default phase tags for newly discovered leads.');
              }
            }
          }
        } catch {
          // Ignore tagging failures; inbox should still load.
        }
      }

      // Spam auto-classification (heuristic): only ever promotes to spam (never auto-unspams).
      try {
        const spamConvIds = Object.values(threadMetaByConversation)
          .filter((m) => String(m?.last_message_direction || '') === 'inbound')
          .filter((m) => isProbablySpam(m?.last_message_text || null))
          .map((m) => String(m.conversation_id))
          .slice(0, 500);

        if (spamConvIds.length > 0) {
          await admin
            .from('instagram_threads')
            .update({ is_spam: true })
            .eq('workspace_id', workspaceId)
            .in('conversation_id', spamConvIds);
        }
      } catch {
        // ignore
      }

      // Best-effort cleanup: older versions sometimes inferred the "peer" as the sender self-id, which merged
      // unrelated conversations. Remove those bogus self-thread rows so the inbox doesn't show mixed chats.
      try {
        const selfList = Array.from(selfIds);
        if (selfList.length > 0) {
          await admin
            .from('instagram_threads')
            .delete()
            .eq('workspace_id', workspaceId)
            .eq('instagram_account_id', instagramAccountId)
            .in('instagram_user_id', selfList);
        }
      } catch {
        // ignore
      }

      // Best-effort incremental auto-phasing from changed conversation IDs.
      // Sync success must not be blocked by classifier failures.
      try {
        const changedConversationIds = Array.from(
          new Set(
            Object.values(threadMetaByConversation)
              .map((m: any) => (m?.conversation_id ? String(m.conversation_id) : ''))
              .filter(Boolean)
          )
        ).slice(0, 500);

        if (changedConversationIds.length > 0) {
          const autoPhaseSummary = await runWorkspaceAutoPhase(admin, {
            workspaceId,
            source: 'incremental',
            actorUserId: userId,
            actorRole: workspaceRole,
            conversationIds: changedConversationIds,
          });

          if (autoPhaseSummary.errors > 0) {
            warnings.push('Auto-phasing completed with partial errors.');
          }
        }
      } catch (autoPhaseError: any) {
        console.warn('sync-messages auto-phase trigger failed:', autoPhaseError);
        warnings.push('Auto-phasing failed for this sync run; sync data was still saved.');
      }

      return new Response(
        JSON.stringify({
          success: true,
          conversationsFetched: conversationIds.length,
          conversationsWithMessages,
          messagesUpserted: upserted,
          threadsUpserted: threadsToUpsert.length,
          mode: activeBase,
          warnings,
          errors: syncErrors.slice(0, 3),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'ensure-booking-link') {
      const { conversationId } = body || {};
      if (!workspaceId) {
        return new Response(JSON.stringify({ error: 'Missing workspaceId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const convId = conversationId != null ? String(conversationId) : '';
      if (!convId) {
        return new Response(JSON.stringify({ error: 'Missing conversationId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseServiceKey) {
        return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const admin = createClient(supabaseUrl, supabaseServiceKey);

      const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, userId);
      if (!hasWorkspaceAccess) {
        return new Response(JSON.stringify({ error: 'You do not have access to this workspace' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: ws, error: wsError } = await admin
        .from('workspaces')
        .select('booking_url')
        .eq('id', workspaceId)
        .maybeSingle();

      if (wsError) {
        const msg = String(wsError?.message || '').toLowerCase();
        if (msg.includes('booking_url') && msg.includes('column')) {
          return new Response(
            JSON.stringify({ error: 'Missing DB column `booking_url` on workspaces. Run migration `20260217213000_booking_links_inbox.sql`.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(JSON.stringify({ error: 'Failed to load workspace' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const destinationUrl = ws?.booking_url != null ? String((ws as any).booking_url).trim() : '';
      if (!destinationUrl) {
        return new Response(JSON.stringify({ success: false, error: 'Booking URL not set' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: thread, error: threadError } = await admin
        .from('instagram_threads')
        .select('booking_link_slug,peer_username')
        .eq('workspace_id', workspaceId)
        .eq('conversation_id', convId)
        .maybeSingle();

      if (threadError) {
        const msg = String(threadError?.message || '').toLowerCase();
        if (msg.includes('booking_link_slug') && msg.includes('column')) {
          return new Response(
            JSON.stringify({ error: 'Missing DB column `booking_link_slug` on instagram_threads. Run migration `20260217213000_booking_links_inbox.sql`.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(JSON.stringify({ error: 'Failed to load thread' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!thread) {
        return new Response(JSON.stringify({ error: 'Thread not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const appOrigin = getAppOrigin(req);
      const existingSlug = (thread as any)?.booking_link_slug ? String((thread as any).booking_link_slug).trim() : '';
      if (existingSlug) {
        return new Response(JSON.stringify({ success: true, bookingUrl: `${appOrigin}/book/${existingSlug}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const peerUsername = (thread as any)?.peer_username ? String((thread as any).peer_username).trim() : '';
      const nameBase = peerUsername ? `Booking - @${peerUsername}` : 'Booking link';

      const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const randomSlug = (len = 8) => {
        const bytes = new Uint8Array(len);
        crypto.getRandomValues(bytes);
        let out = '';
        for (let i = 0; i < bytes.length; i += 1) {
          out += alphabet[bytes[i] % alphabet.length];
        }
        return out;
      };

      let slug: string | null = null;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const candidate = randomSlug(8);
        const { data: linkRow, error: linkError } = await admin
          .from('tracked_links')
          .insert({
            workspace_id: workspaceId,
            created_by: userId,
            name: nameBase.slice(0, 120),
            slug: candidate,
            destination_url: destinationUrl,
            mode: 'booking',
            utm_params: {
              source: 'inbox',
              conversation_id: convId,
              peer_username: peerUsername || null,
            },
          })
          .select('slug')
          .maybeSingle();

        if (!linkError && linkRow?.slug) {
          slug = String(linkRow.slug);
          break;
        }

        const msg = `${String((linkError as any)?.message || '')} ${String((linkError as any)?.details || '')}`.toLowerCase();
        const duplicate =
          msg.includes('duplicate') ||
          msg.includes('unique') ||
          msg.includes('tracked_links_slug_key') ||
          msg.includes('tracked_links') && msg.includes('slug');
        if (!duplicate) {
          if (msg.includes('relation') && msg.includes('tracked_links')) {
            return new Response(
              JSON.stringify({ error: 'Missing DB table `tracked_links`. Run migration `20260215193000_content_hub_links_ai.sql` on this Supabase project.' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.warn('ensure-booking-link insert failed:', linkError);
          break;
        }
      }

      if (!slug) {
        return new Response(JSON.stringify({ error: 'Failed to create tracked booking link' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error: updateError } = await admin
        .from('instagram_threads')
        .update({ booking_link_slug: slug })
        .eq('workspace_id', workspaceId)
        .eq('conversation_id', convId);

      if (updateError) {
        console.warn('ensure-booking-link thread update failed:', updateError);
      }

      return new Response(JSON.stringify({ success: true, bookingUrl: `${appOrigin}/book/${slug}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

	    if (action === 'send-message') {
	      const { recipientId, text, replyToMessageId, replyToText } = body || {};
      if (!workspaceId) {
        return new Response(
          JSON.stringify({ error: 'Missing workspaceId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const to = recipientId != null ? String(recipientId) : '';
      const msgText = text != null ? String(text) : '';
      if (!to || !msgText.trim()) {
        return new Response(
          JSON.stringify({ error: 'Missing recipientId or text' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseServiceKey) {
        return new Response(
          JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const admin = createClient(supabaseUrl, supabaseServiceKey);

      const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, userId);
      if (!hasWorkspaceAccess) {
        return new Response(
          JSON.stringify({ error: 'You do not have access to this workspace' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: connection, error: connectionError } = await admin
        .from('instagram_connections')
        .select('instagram_account_id, access_token')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (connectionError) {
        return new Response(
          JSON.stringify({ error: 'Failed to load Instagram connection', details: connectionError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!connection?.instagram_account_id || !connection?.access_token) {
        return new Response(
          JSON.stringify({ error: 'No Instagram connection found for this workspace' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const instagramAccountId = String(connection.instagram_account_id);
      const accessToken = String(connection.access_token);

	      const replyId = replyToMessageId != null ? String(replyToMessageId) : null;
	      const replyText = replyToText != null ? String(replyToText) : null;

	      // Some workspaces use Page-based tokens (graph.facebook.com); others use IG-login tokens (graph.instagram.com).
	      // Replies are more reliable via the Facebook Graph host, so we try it first, then fall back.
	      const baseHosts = [
	        `https://graph.facebook.com/${GRAPH_API_VERSION}`,
	        `https://graph.instagram.com/${GRAPH_API_VERSION}`,
	      ];

	      const sendOnce = async (base: string, payload: any) => {
	        const sendUrl = new URL(`${base}/${encodeURIComponent(instagramAccountId)}/messages`);
	        // Some endpoints require Bearer auth, others accept query param. Send both for compatibility.
	        sendUrl.searchParams.set('access_token', accessToken);

	        const r = await fetch(sendUrl.toString(), {
	          method: 'POST',
	          headers: {
	            'Content-Type': 'application/json',
	            Authorization: `Bearer ${accessToken}`,
	          },
	          body: JSON.stringify(payload),
	        });
	        const rawText = await r.text();
	        let parsed: any = null;
	        try {
	          parsed = rawText ? JSON.parse(rawText) : null;
	        } catch {
	          parsed = { raw: rawText };
	        }
	        return { response: r, data: parsed };
	      };

	      const trySendAcrossHosts = async (payload: any) => {
	        let last: any = null;
	        for (const base of baseHosts) {
	          const { response, data } = await sendOnce(base, payload);
	          if (response.ok && !(data && typeof data === 'object' && (data as any).error)) {
	            return { response, data };
	          }
	          last = { response, data };
	        }
	        return { response: last?.response, data: last?.data };
	      };

	      // For replies, do NOT silently fall back to non-reply; that would look "broken" in Instagram.
	      const candidatePayloads: any[] = replyId
	        ? [
	            // Most common: reply_to object inside message.
	            { recipient: { id: to }, message: { text: msgText, reply_to: { mid: replyId } } },
	            // Some surfaces accept reply_to as a raw mid string.
	            { recipient: { id: to }, message: { text: msgText, reply_to: replyId } },
	            // Some accept reply_to at the root.
	            { recipient: { id: to }, message: { text: msgText }, reply_to: { mid: replyId } },
	            { recipient: { id: to }, message: { text: msgText }, reply_to: replyId },
	          ]
	        : [{ recipient: { id: to }, message: { text: msgText } }];

	      let resp: Response | null = null;
	      let data: any = null;
	      for (const payload of candidatePayloads) {
	        const r = await trySendAcrossHosts(payload);
	        resp = r.response || null;
	        data = r.data;
	        if (resp && resp.ok && !(data && typeof data === 'object' && (data as any).error)) break;
	      }

	      if (!resp || !resp.ok || (data && typeof data === 'object' && (data as any).error)) {
	        const err = data?.error || data;
	        const msg = err?.message || 'Failed to send message';
	        return new Response(
	          JSON.stringify({ error: msg, details: err }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const messageId = data?.message_id ? String(data.message_id) : (data?.id ? String(data.id) : null);
      const sentAt = new Date().toISOString();
      const threadKey = `${instagramAccountId}:${to}`;

      await ensurePublicBucket(admin, MEDIA_BUCKET);

      // Store outbound message so UI updates immediately even if the webhook is delayed.
      try {
        const { error } = await admin
          .from('instagram_messages')
          .upsert(
            {
              workspace_id: workspaceId,
              instagram_account_id: instagramAccountId,
              instagram_user_id: to,
              sender_id: instagramAccountId,
              recipient_id: to,
              message_id: messageId,
              message_text: msgText,
              direction: 'outbound',
              message_timestamp: sentAt,
              raw_payload: {
                sent_via: 'api',
                conversation_key: threadKey,
                api_response: data,
                reply_to_message_id: replyId,
                reply_to_text: replyText,
              },
            },
            { onConflict: 'message_id' }
          );
        if (error) console.warn('instagram_messages outbound upsert failed:', error);
      } catch (e) {
        console.warn('instagram_messages outbound upsert threw:', e);
      }

      // Update thread "last message" fields (do not overwrite manual priority).
      try {
        const baseThreadRow = {
          workspace_id: workspaceId,
          instagram_account_id: instagramAccountId,
          conversation_id: threadKey,
          instagram_user_id: to,
          last_message_id: messageId,
          last_message_text: msgText,
          last_message_direction: 'outbound',
          last_message_at: sentAt,
        };

        const candidates = [
          { ...baseThreadRow, last_outbound_at: sentAt },
          baseThreadRow,
          {
            workspace_id: workspaceId,
            instagram_account_id: instagramAccountId,
            conversation_id: threadKey,
            instagram_user_id: to,
            last_message_id: messageId,
            last_message_text: msgText,
            last_message_direction: 'outbound',
            last_message_at: sentAt,
          },
        ];

        let upsertError: any = null;
        for (const rowToUpsert of candidates) {
          const { error } = await admin
            .from('instagram_threads')
            .upsert(rowToUpsert, { onConflict: 'workspace_id,conversation_id' });
          if (!error) {
            upsertError = null;
            break;
          }
          upsertError = error;
          const msg = `${String(error?.message || '')} ${String(error?.details || '')} ${String(error?.hint || '')}`.toLowerCase();
          if (!msg.includes('column') && !msg.includes('does not exist')) break;
        }
        if (upsertError) console.warn('instagram_threads outbound upsert failed:', upsertError);
      } catch (e) {
        console.warn('instagram_threads outbound upsert threw:', e);
      }

      return new Response(
        JSON.stringify({ success: true, messageId, sentAt }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
	    }

	    if (action === 'send-image') {
	      const { recipientId, bucket, path, mimeType } = body || {};
	      if (!workspaceId) {
	        return new Response(
	          JSON.stringify({ error: 'Missing workspaceId' }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const to = recipientId != null ? String(recipientId) : '';
	      const uploadBucket = bucket != null ? String(bucket) : 'uploads';
	      const uploadPath = path != null ? String(path) : '';
	      const hintedMime = mimeType != null ? String(mimeType) : '';

	      if (!to || !uploadPath) {
	        return new Response(
	          JSON.stringify({ error: 'Missing recipientId or path' }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      // Security: the function runs with service-role; lock down what it can read.
	      if (uploadBucket !== 'uploads') {
	        return new Response(
	          JSON.stringify({ error: 'Invalid bucket' }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }
	      const allowedPrefixes = [`${workspaceId}/`, `${userId}/`];
	      if (!allowedPrefixes.some((prefix) => uploadPath.startsWith(prefix))) {
	        return new Response(
	          JSON.stringify({ error: 'Invalid path' }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
	      if (!supabaseServiceKey) {
	        return new Response(
	          JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }),
	          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }
	      const admin = createClient(supabaseUrl, supabaseServiceKey);

	      const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, userId);
	      if (!hasWorkspaceAccess) {
	        return new Response(
	          JSON.stringify({ error: 'You do not have access to this workspace' }),
	          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const { data: connection, error: connectionError } = await admin
	        .from('instagram_connections')
	        .select('instagram_account_id, access_token')
	        .eq('workspace_id', workspaceId)
	        .order('updated_at', { ascending: false })
	        .limit(1)
	        .maybeSingle();

	      if (connectionError) {
	        return new Response(
	          JSON.stringify({ error: 'Failed to load Instagram connection', details: connectionError }),
	          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      if (!connection?.instagram_account_id || !connection?.access_token) {
	        return new Response(
	          JSON.stringify({ error: 'No Instagram connection found for this workspace' }),
	          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const instagramAccountId = String(connection.instagram_account_id);
	      const accessToken = String(connection.access_token);
	      await ensurePublicBucket(admin, MEDIA_BUCKET);

	      // Copy the uploaded image into a public bucket so Meta can fetch it by URL.
	      const { data: blob, error: downloadError } = await admin.storage.from(uploadBucket).download(uploadPath);
	      if (downloadError || !blob) {
	        return new Response(
	          JSON.stringify({ error: 'Failed to read uploaded image', details: downloadError || null }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const blobType = (blob as any)?.type ? String((blob as any).type) : '';
	      const contentType = (hintedMime || blobType || '').trim();
	      const isImage = contentType ? contentType.toLowerCase().startsWith('image/') : false;
	      if (!isImage) {
	        return new Response(
	          JSON.stringify({ error: 'Only image attachments are supported for now.' }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const bytes = new Uint8Array(await blob.arrayBuffer());
	      const fromPathExt = (() => {
	        const last = uploadPath.split('/').pop() || '';
	        const ext = last.includes('.') ? last.split('.').pop()!.toLowerCase() : '';
	        if (ext && ext.length <= 6 && /^[a-z0-9]+$/.test(ext)) return ext;
	        return '';
	      })();
	      const ext = (() => {
	        const byMime = extFromContentType(contentType);
	        if (byMime && byMime !== 'bin') return byMime;
	        if (fromPathExt) return fromPathExt;
	        return 'jpg';
	      })();

	      const safeSeg = (value: string): string =>
	        String(value || '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'x';

	      const publicPath = `instagram/outbound/${safeSeg(workspaceId)}/${safeSeg(instagramAccountId)}/${safeSeg(to)}/${crypto.randomUUID()}.${ext}`;
	      const { error: uploadError } = await admin.storage
	        .from(MEDIA_BUCKET)
	        .upload(publicPath, bytes, { contentType: contentType || undefined, upsert: true });
	      if (uploadError) {
	        return new Response(
	          JSON.stringify({ error: 'Failed to store image', details: uploadError }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

		      const { data: pub } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(publicPath);
		      const publicUrl = pub?.publicUrl ? String(pub.publicUrl) : null;

		      // Meta sometimes fails to fetch from "public" URLs if a bucket wasn't actually made public.
		      // A signed URL works regardless of bucket visibility, so we prefer it for delivery.
		      let signedUrl: string | null = null;
		      try {
		        const { data: signed, error: signedError } = await admin.storage
		          .from(MEDIA_BUCKET)
		          .createSignedUrl(publicPath, 60 * 60 * 24 * 7);
		        const candidate = (signed as any)?.signedUrl;
		        if (!signedError && candidate) signedUrl = String(candidate);
		      } catch {
		        // ignore
		      }

		      const metaImageUrl = signedUrl || publicUrl;
		      const imageUrl = publicUrl || signedUrl;
		      if (!metaImageUrl) {
		        return new Response(
		          JSON.stringify({ error: 'Failed to generate image URL' }),
		          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		        );
		      }

			      const payload = {
			        recipient: { id: to },
			        message: {
			          attachment: {
			            type: 'image',
			            payload: { url: metaImageUrl, is_reusable: true },
			          },
			        },
			      };

		      // Some workspaces use Page-based tokens (graph.facebook.com); others use IG-login tokens (graph.instagram.com).
		      // Try both to maximize compatibility.
		      const baseHosts = [
		        `https://graph.facebook.com/${GRAPH_API_VERSION}`,
		        `https://graph.instagram.com/${GRAPH_API_VERSION}`,
		      ];

		      let resp: Response | null = null;
		      let data: any = null;
		      for (const base of baseHosts) {
		        const sendUrl = new URL(`${base}/${encodeURIComponent(instagramAccountId)}/messages`);
		        // Some endpoints accept query param auth, others accept Bearer header. Send both.
		        sendUrl.searchParams.set('access_token', accessToken);

		        const r = await fetch(sendUrl.toString(), {
		          method: 'POST',
		          headers: {
		            'Content-Type': 'application/json',
		            Authorization: `Bearer ${accessToken}`,
		          },
		          body: JSON.stringify(payload),
		        });

		        const rawText = await r.text();
		        let parsed: any = null;
		        try {
		          parsed = rawText ? JSON.parse(rawText) : null;
		        } catch {
		          parsed = { raw: rawText };
		        }

		        resp = r;
		        data = parsed;
		        if (r.ok && !(parsed && typeof parsed === 'object' && (parsed as any).error)) break;
		      }

		      if (!resp || !resp.ok || (data && typeof data === 'object' && (data as any).error)) {
		        const err = data?.error || data;
		        const msg = err?.message || 'Failed to send image';
		        return new Response(
		          JSON.stringify({ error: msg, details: err }),
		          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		        );
		      }

	      const messageId = data?.message_id ? String(data.message_id) : (data?.id ? String(data.id) : null);
	      const sentAt = new Date().toISOString();
	      const threadKey = `${instagramAccountId}:${to}`;

	      const storedAttachments = [
	        {
	          type: 'image',
	          source_url: imageUrl,
	          bucket: MEDIA_BUCKET,
	          path: publicPath,
	          public_url: imageUrl,
	          content_type: contentType || null,
	          size: bytes.byteLength,
	        },
	      ];

	      // Store outbound message so UI updates immediately even if the webhook is delayed.
	      try {
	        const { error } = await admin
	          .from('instagram_messages')
	          .upsert(
	            {
	              workspace_id: workspaceId,
	              instagram_account_id: instagramAccountId,
	              instagram_user_id: to,
	              sender_id: instagramAccountId,
	              recipient_id: to,
	              message_id: messageId,
	              message_text: null,
	              direction: 'outbound',
	              message_timestamp: sentAt,
	              raw_payload: {
	                sent_via: 'api',
	                conversation_key: threadKey,
	                api_response: data,
	                stored_attachments: storedAttachments,
	                original_upload: { bucket: uploadBucket, path: uploadPath },
	              },
	            },
	            { onConflict: 'message_id' }
	          );
	        if (error) console.warn('instagram_messages outbound image upsert failed:', error);
	      } catch (e) {
	        console.warn('instagram_messages outbound image upsert threw:', e);
	      }

	      // Update thread "last message" fields (do not overwrite manual priority).
	      try {
	        const baseThreadRow = {
	          workspace_id: workspaceId,
	          instagram_account_id: instagramAccountId,
	          conversation_id: threadKey,
	          instagram_user_id: to,
	          last_message_id: messageId,
	          last_message_text: 'Photo',
	          last_message_direction: 'outbound',
	          last_message_at: sentAt,
	        };

	        const candidates = [
	          { ...baseThreadRow, last_outbound_at: sentAt },
	          baseThreadRow,
	          {
	            workspace_id: workspaceId,
	            instagram_account_id: instagramAccountId,
	            conversation_id: threadKey,
	            instagram_user_id: to,
	            last_message_id: messageId,
	            last_message_text: 'Photo',
	            last_message_direction: 'outbound',
	            last_message_at: sentAt,
	          },
	        ];

	        let upsertError: any = null;
	        for (const rowToUpsert of candidates) {
	          const { error } = await admin
	            .from('instagram_threads')
	            .upsert(rowToUpsert, { onConflict: 'workspace_id,conversation_id' });
	          if (!error) {
	            upsertError = null;
	            break;
	          }
	          upsertError = error;
	          const msg = `${String(error?.message || '')} ${String(error?.details || '')} ${String(error?.hint || '')}`.toLowerCase();
	          if (!msg.includes('column') && !msg.includes('does not exist')) break;
	        }
	        if (upsertError) console.warn('instagram_threads outbound image upsert failed:', upsertError);
	      } catch (e) {
	        console.warn('instagram_threads outbound image upsert threw:', e);
	      }

	      return new Response(
	        JSON.stringify({ success: true, messageId, sentAt, imageUrl }),
	        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	      );
	    }

	    if (action === 'send-image-multipart') {
	      const { recipientId } = body || {};
	      if (!workspaceId) {
	        return new Response(
	          JSON.stringify({ error: 'Missing workspaceId' }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const to = recipientId != null ? String(recipientId) : '';
	      if (!to) {
	        return new Response(
	          JSON.stringify({ error: 'Missing recipientId' }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const file = (body as any)?.__file as File | null;
	      if (!file) {
	        return new Response(
	          JSON.stringify({ error: 'Missing file' }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const MAX_BYTES = 10 * 1024 * 1024;
	      const fileType = (file as any)?.type ? String((file as any).type) : '';
	      const isImage = fileType.toLowerCase().startsWith('image/');
	      if (!isImage) {
	        return new Response(
	          JSON.stringify({ error: 'Only image attachments are supported for now.' }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const bytes = new Uint8Array(await file.arrayBuffer());
	      if (bytes.byteLength > MAX_BYTES) {
	        return new Response(
	          JSON.stringify({ error: 'Image must be 10MB or smaller.' }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
	      if (!supabaseServiceKey) {
	        return new Response(
	          JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }),
	          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }
	      const admin = createClient(supabaseUrl, supabaseServiceKey);

	      const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, userId);
	      if (!hasWorkspaceAccess) {
	        return new Response(
	          JSON.stringify({ error: 'You do not have access to this workspace' }),
	          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const { data: connection, error: connectionError } = await admin
	        .from('instagram_connections')
	        .select('instagram_account_id, access_token')
	        .eq('workspace_id', workspaceId)
	        .order('updated_at', { ascending: false })
	        .limit(1)
	        .maybeSingle();

	      if (connectionError) {
	        return new Response(
	          JSON.stringify({ error: 'Failed to load Instagram connection', details: connectionError }),
	          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      if (!connection?.instagram_account_id || !connection?.access_token) {
	        return new Response(
	          JSON.stringify({ error: 'No Instagram connection found for this workspace' }),
	          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

	      const instagramAccountId = String(connection.instagram_account_id);
	      const accessToken = String(connection.access_token);
	      await ensurePublicBucket(admin, MEDIA_BUCKET);

	      const safeSeg = (value: string): string =>
	        String(value || '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'x';

	      const ext = (() => {
	        const byMime = extFromContentType(fileType);
	        if (byMime && byMime !== 'bin') return byMime;
	        const rawName = (file as any)?.name ? String((file as any).name) : '';
	        const last = rawName.split('.').pop()?.toLowerCase() || '';
	        if (last && last.length <= 6 && /^[a-z0-9]+$/.test(last)) return last;
	        return 'jpg';
	      })();

	      const publicPath = `instagram/outbound/${safeSeg(workspaceId)}/${safeSeg(instagramAccountId)}/${safeSeg(to)}/${crypto.randomUUID()}.${ext}`;
	      const { error: uploadError } = await admin.storage
	        .from(MEDIA_BUCKET)
	        .upload(publicPath, bytes, { contentType: fileType || undefined, upsert: true });
	      if (uploadError) {
	        return new Response(
	          JSON.stringify({ error: 'Failed to store image', details: uploadError }),
	          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	        );
	      }

		      const { data: pub } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(publicPath);
		      const publicUrl = pub?.publicUrl ? String(pub.publicUrl) : null;

		      // Meta sometimes fails to fetch from "public" URLs if a bucket wasn't actually made public.
		      // A signed URL works regardless of bucket visibility, so we prefer it for delivery.
		      let signedUrl: string | null = null;
		      try {
		        const { data: signed, error: signedError } = await admin.storage
		          .from(MEDIA_BUCKET)
		          .createSignedUrl(publicPath, 60 * 60 * 24 * 7);
		        const candidate = (signed as any)?.signedUrl;
		        if (!signedError && candidate) signedUrl = String(candidate);
		      } catch {
		        // ignore
		      }

		      const metaImageUrl = signedUrl || publicUrl;
		      const imageUrl = publicUrl || signedUrl;
		      if (!metaImageUrl) {
		        return new Response(
		          JSON.stringify({ error: 'Failed to generate image URL' }),
		          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		        );
		      }

			      const payload = {
			        recipient: { id: to },
			        message: {
			          attachment: {
			            type: 'image',
			            payload: { url: metaImageUrl, is_reusable: true },
			          },
			        },
			      };

		      // Some workspaces use Page-based tokens (graph.facebook.com); others use IG-login tokens (graph.instagram.com).
		      // Try both to maximize compatibility.
		      const baseHosts = [
		        `https://graph.facebook.com/${GRAPH_API_VERSION}`,
		        `https://graph.instagram.com/${GRAPH_API_VERSION}`,
		      ];

		      let resp: Response | null = null;
		      let data: any = null;
		      for (const base of baseHosts) {
		        const sendUrl = new URL(`${base}/${encodeURIComponent(instagramAccountId)}/messages`);
		        // Some endpoints accept query param auth, others accept Bearer header. Send both.
		        sendUrl.searchParams.set('access_token', accessToken);

		        const r = await fetch(sendUrl.toString(), {
		          method: 'POST',
		          headers: {
		            'Content-Type': 'application/json',
		            Authorization: `Bearer ${accessToken}`,
		          },
		          body: JSON.stringify(payload),
		        });

		        const rawText = await r.text();
		        let parsed: any = null;
		        try {
		          parsed = rawText ? JSON.parse(rawText) : null;
		        } catch {
		          parsed = { raw: rawText };
		        }

		        resp = r;
		        data = parsed;
		        if (r.ok && !(parsed && typeof parsed === 'object' && (parsed as any).error)) break;
		      }

		      if (!resp || !resp.ok || (data && typeof data === 'object' && (data as any).error)) {
		        const err = data?.error || data;
		        const msg = err?.message || 'Failed to send image';
		        return new Response(
		          JSON.stringify({ error: msg, details: err }),
		          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		        );
		      }

	      const messageId = data?.message_id ? String(data.message_id) : (data?.id ? String(data.id) : null);
	      const sentAt = new Date().toISOString();
	      const threadKey = `${instagramAccountId}:${to}`;

	      const storedAttachments = [
	        {
	          type: 'image',
	          source_url: imageUrl,
	          bucket: MEDIA_BUCKET,
	          path: publicPath,
	          public_url: imageUrl,
	          content_type: fileType || null,
	          size: bytes.byteLength,
	        },
	      ];

	      // Store outbound message so UI updates immediately even if the webhook is delayed.
	      try {
	        const { error } = await admin
	          .from('instagram_messages')
	          .upsert(
	            {
	              workspace_id: workspaceId,
	              instagram_account_id: instagramAccountId,
	              instagram_user_id: to,
	              sender_id: instagramAccountId,
	              recipient_id: to,
	              message_id: messageId,
	              message_text: null,
	              direction: 'outbound',
	              message_timestamp: sentAt,
	              raw_payload: {
	                sent_via: 'api',
	                conversation_key: threadKey,
	                api_response: data,
	                stored_attachments: storedAttachments,
	              },
	            },
	            { onConflict: 'message_id' }
	          );
	        if (error) console.warn('instagram_messages outbound image upsert failed:', error);
	      } catch (e) {
	        console.warn('instagram_messages outbound image upsert threw:', e);
	      }

	      // Update thread "last message" fields (do not overwrite manual priority).
	      try {
	        const baseThreadRow = {
	          workspace_id: workspaceId,
	          instagram_account_id: instagramAccountId,
	          conversation_id: threadKey,
	          instagram_user_id: to,
	          last_message_id: messageId,
	          last_message_text: 'Photo',
	          last_message_direction: 'outbound',
	          last_message_at: sentAt,
	        };

	        const candidates = [
	          { ...baseThreadRow, last_outbound_at: sentAt },
	          baseThreadRow,
	          {
	            workspace_id: workspaceId,
	            instagram_account_id: instagramAccountId,
	            conversation_id: threadKey,
	            instagram_user_id: to,
	            last_message_id: messageId,
	            last_message_text: 'Photo',
	            last_message_direction: 'outbound',
	            last_message_at: sentAt,
	          },
	        ];

	        let upsertError: any = null;
	        for (const rowToUpsert of candidates) {
	          const { error } = await admin
	            .from('instagram_threads')
	            .upsert(rowToUpsert, { onConflict: 'workspace_id,conversation_id' });
	          if (!error) {
	            upsertError = null;
	            break;
	          }
	          upsertError = error;
	          const msg = `${String(error?.message || '')} ${String(error?.details || '')} ${String(error?.hint || '')}`.toLowerCase();
	          if (!msg.includes('column') && !msg.includes('does not exist')) break;
	        }
	        if (upsertError) console.warn('instagram_threads outbound image upsert failed:', upsertError);
	      } catch (e) {
	        console.warn('instagram_threads outbound image upsert threw:', e);
	      }

	      return new Response(
	        JSON.stringify({ success: true, messageId, sentAt, imageUrl }),
	        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
	      );
	    }

	    if (action === 'react-message') {
	      const { recipientId, messageId, mode, reaction } = body || {};
	      if (!workspaceId) {
	        return new Response(
          JSON.stringify({ error: 'Missing workspaceId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const to = recipientId != null ? String(recipientId) : '';
      const targetMessageId = messageId != null ? String(messageId) : '';
      const senderAction = mode === 'unreact' ? 'unreact' : 'react';
      const reactionType = reaction != null ? String(reaction) : 'love';

      if (!to || !targetMessageId) {
        return new Response(
          JSON.stringify({ error: 'Missing recipientId or messageId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseServiceKey) {
        return new Response(
          JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const admin = createClient(supabaseUrl, supabaseServiceKey);

      const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, userId);
      if (!hasWorkspaceAccess) {
        return new Response(
          JSON.stringify({ error: 'You do not have access to this workspace' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: connection, error: connectionError } = await admin
        .from('instagram_connections')
        .select('instagram_account_id, access_token')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (connectionError) {
        return new Response(
          JSON.stringify({ error: 'Failed to load Instagram connection', details: connectionError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!connection?.instagram_account_id || !connection?.access_token) {
        return new Response(
          JSON.stringify({ error: 'No Instagram connection found for this workspace' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const instagramAccountId = String(connection.instagram_account_id);
      const accessToken = String(connection.access_token);

      const payload = {
        recipient: { id: to },
        sender_action: senderAction,
        payload: {
          message_id: targetMessageId,
          reaction: reactionType,
        },
      };

      // Some workspaces use Page-based tokens (graph.facebook.com); others use IG-login tokens (graph.instagram.com).
      // Try both to maximize compatibility.
      const baseHosts = [
        `https://graph.facebook.com/${GRAPH_API_VERSION}`,
        `https://graph.instagram.com/${GRAPH_API_VERSION}`,
      ];

      let resp: Response | null = null;
      let data: any = null;
      for (const base of baseHosts) {
        const sendUrl = new URL(`${base}/${encodeURIComponent(instagramAccountId)}/messages`);
        // Some endpoints accept query param auth, others accept Bearer header. Send both.
        sendUrl.searchParams.set('access_token', accessToken);

        const r = await fetch(sendUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        const rawText = await r.text();
        let parsed: any = null;
        try {
          parsed = rawText ? JSON.parse(rawText) : null;
        } catch {
          parsed = { raw: rawText };
        }

        resp = r;
        data = parsed;
        if (r.ok && !(parsed && typeof parsed === 'object' && (parsed as any).error)) break;
      }

      if (!resp || !resp.ok || (data && typeof data === 'object' && (data as any).error)) {
        const err = data?.error || data;
        const msg = err?.message || 'Failed to react to message';
        return new Response(
          JSON.stringify({ error: msg, details: err }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const { data: existing } = await admin
          .from('instagram_messages')
          .select('raw_payload')
          .eq('workspace_id', workspaceId)
          .eq('message_id', targetMessageId)
          .maybeSingle();

        const prevRaw = (existing as any)?.raw_payload || {};
        const nextRaw = {
          ...(prevRaw && typeof prevRaw === 'object' ? prevRaw : {}),
          my_reaction: senderAction === 'react' ? reactionType : null,
        };

        await admin
          .from('instagram_messages')
          .update({ raw_payload: nextRaw })
          .eq('workspace_id', workspaceId)
          .eq('message_id', targetMessageId);
      } catch {
        // ignore
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-auth-url') {
      const instagramAppId = Deno.env.get('INSTAGRAM_APP_ID');
      if (!instagramAppId) {
        console.error('INSTAGRAM_APP_ID not configured');
        return new Response(
          JSON.stringify({ error: 'INSTAGRAM_APP_ID not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!workspaceId) {
        return new Response(
          JSON.stringify({ error: 'Missing workspaceId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Instagram API with Instagram Login uses instagram.com OAuth and instagram_business_* scopes.
      // Meta renamed these scopes and deprecated the older business_* values (Jan 27, 2025).
      const appOrigin = getAppOrigin(req);
      const redirectUri = `${appOrigin}/instagram-callback`;

      const state = { workspaceId };
      const encodedState = encodeURIComponent(btoa(JSON.stringify(state)));

      const authUrl = new URL('https://www.instagram.com/oauth/authorize');
      authUrl.searchParams.set('client_id', instagramAppId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set(
        'scope',
        'instagram_business_basic,instagram_business_manage_messages'
      );
      authUrl.searchParams.set('state', encodedState);
      authUrl.searchParams.set('enable_fb_login', '0');
      authUrl.searchParams.set('force_authentication', '1');

      console.log('Generated Instagram auth URL:', authUrl.toString());
      return new Response(
        JSON.stringify({ authUrl: authUrl.toString(), redirectUri }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'exchange-code') {
      const instagramAppId = Deno.env.get('INSTAGRAM_APP_ID');
      const instagramAppSecret = Deno.env.get('INSTAGRAM_APP_SECRET');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const appOrigin = getAppOrigin(req);
      const redirectUri = `${appOrigin}/instagram-callback`;

      if (!instagramAppId || !instagramAppSecret || !supabaseServiceKey) {
        return new Response(
          JSON.stringify({ error: 'Instagram credentials not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!workspaceId || !code) {
        return new Response(
          JSON.stringify({ error: 'Missing workspaceId or code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const admin = createClient(supabaseUrl, supabaseServiceKey);
      const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, userId);

      if (!hasWorkspaceAccess) {
        return new Response(
          JSON.stringify({ error: 'You do not have access to this workspace' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Exchange code for a short-lived token (server-to-server).
      const tokenResp = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: instagramAppId,
          client_secret: instagramAppSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        }),
      });

      const tokenData: any = await tokenResp.json();
      if (!tokenResp.ok || tokenData?.error_type || tokenData?.error_message || tokenData?.error) {
        console.error('Instagram token exchange error:', tokenData);
        const msg =
          tokenData?.error_message ||
          tokenData?.error?.message ||
          'Instagram token exchange failed';
        return new Response(
          JSON.stringify({ error: msg, details: tokenData }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const shortLivedToken = tokenData.access_token as string | undefined;
      if (!shortLivedToken) {
        return new Response(
          JSON.stringify({ error: 'No access_token returned from Instagram' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Exchange for a long-lived token.
      let finalAccessToken = shortLivedToken;
      let expiresIn: number | null = null;
      try {
        const llUrl = new URL('https://graph.instagram.com/access_token');
        llUrl.searchParams.set('grant_type', 'ig_exchange_token');
        llUrl.searchParams.set('client_secret', instagramAppSecret);
        llUrl.searchParams.set('access_token', shortLivedToken);

        const llResp = await fetch(llUrl.toString());
        const llData: any = await llResp.json();
        if (llResp.ok && llData?.access_token) {
          finalAccessToken = llData.access_token;
          expiresIn = Number(llData.expires_in) || null;
        }
      } catch (e) {
        console.log('Long-lived exchange failed, using short-lived token');
      }

      // Fetch the Instagram professional account profile for storage.
      const meUrl = new URL('https://graph.instagram.com/me');
      meUrl.searchParams.set('fields', 'id,username,account_type,profile_picture_url');
      meUrl.searchParams.set('access_token', finalAccessToken);

      const meResp = await fetch(meUrl.toString());
      const meData: any = await meResp.json();
      if (!meResp.ok || meData?.error) {
        console.error('Failed to fetch Instagram profile:', meData);
        return new Response(
          JSON.stringify({ error: meData?.error?.message || 'Failed to fetch Instagram profile' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const instagramAccountId = String(meData.id);
      const instagramUsername = meData.username as string | undefined;
      const profilePictureUrl = meData.profile_picture_url as string | undefined;

      const tokenExpiresAt = (() => {
        if (!expiresIn) return null;
        return new Date(Date.now() + Number(expiresIn) * 1000).toISOString();
      })();

      const { error: saveError } = await admin
        .from('instagram_connections')
        .upsert(
          {
            workspace_id: workspaceId,
            user_id: userId,
            instagram_account_id: instagramAccountId,
            instagram_username: instagramUsername || null,
            profile_picture_url: profilePictureUrl || null,
            access_token: finalAccessToken,
            token_expires_at: tokenExpiresAt,
          },
          { onConflict: 'workspace_id,instagram_account_id' }
        );

      if (saveError) {
        console.error('Failed to save Instagram connection:', saveError);
        return new Response(
          JSON.stringify({ error: 'Failed to save Instagram connection' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: profileUpdateError } = await admin
        .from('profiles')
        .update({ current_workspace_id: workspaceId })
        .eq('id', userId);
      if (profileUpdateError) {
        console.warn('Failed to set current workspace after Instagram connect:', profileUpdateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          instagramAccountId,
          instagramUsername,
          expiresIn,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'save-connection') {
      // Save Instagram connection from client-side Facebook SDK login
      const { accessToken, instagramAccountId, instagramUsername, profilePictureUrl, facebookUserId, pageId, pageName, expiresIn } = body;
      
      if (!accessToken || !instagramAccountId || !workspaceId) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseServiceKey) {
        return new Response(
          JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const admin = createClient(supabaseUrl, supabaseServiceKey);
      const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, userId);
      if (!hasWorkspaceAccess) {
        return new Response(
          JSON.stringify({ error: 'You do not have access to this workspace' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get long-lived token
      const instagramAppId = Deno.env.get('INSTAGRAM_APP_ID');
      const instagramAppSecret = Deno.env.get('INSTAGRAM_APP_SECRET');
      
      let finalAccessToken = accessToken;
      let longLivedData: any | null = null;
      
      if (instagramAppId && instagramAppSecret) {
        try {
          const longLivedUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
          longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
          longLivedUrl.searchParams.set('client_id', instagramAppId);
          longLivedUrl.searchParams.set('client_secret', instagramAppSecret);
          longLivedUrl.searchParams.set('fb_exchange_token', accessToken);

          const longLivedResponse = await fetch(longLivedUrl.toString());
          longLivedData = await longLivedResponse.json();
          
          if (longLivedData.access_token) {
            finalAccessToken = longLivedData.access_token;
            console.log('Exchanged for long-lived token');
          }
        } catch (e) {
          console.log('Could not exchange for long-lived token, using short-lived');
        }
      }

      console.log('Saving Instagram connection:', instagramAccountId, instagramUsername);

      const tokenExpiresAt = (() => {
        const ttl = longLivedData?.expires_in || expiresIn;
        if (!ttl) return null;
        return new Date(Date.now() + Number(ttl) * 1000).toISOString();
      })();

      const { error: saveError } = await admin
        .from('instagram_connections')
        .upsert({
          workspace_id: workspaceId,
          user_id: userId,
          instagram_account_id: instagramAccountId,
          instagram_username: instagramUsername || null,
          profile_picture_url: profilePictureUrl || null,
          facebook_user_id: facebookUserId || null,
          page_id: pageId || null,
          page_name: pageName || null,
          access_token: finalAccessToken,
          token_expires_at: tokenExpiresAt,
        }, { onConflict: 'workspace_id,instagram_account_id' });

      if (saveError) {
        console.error('Failed to save Instagram connection:', saveError);
        return new Response(
          JSON.stringify({ error: 'Failed to save Instagram connection' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: profileUpdateError } = await admin
        .from('profiles')
        .update({ current_workspace_id: workspaceId })
        .eq('id', userId);
      if (profileUpdateError) {
        console.warn('Failed to set current workspace after Instagram save-connection:', profileUpdateError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          instagramAccountId,
          instagramUsername,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Instagram connect error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
