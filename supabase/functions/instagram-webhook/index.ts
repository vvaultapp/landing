import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MEDIA_BUCKET = Deno.env.get('INSTAGRAM_MEDIA_BUCKET') || 'instagram-media';
const GRAPH_API_VERSION = Deno.env.get('META_GRAPH_API_VERSION') || 'v24.0';
const BASE_IG = `https://graph.instagram.com/${GRAPH_API_VERSION}`;
const BASE_FB = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

const NEW_LEAD_TAG_PRESET = {
  name: 'New lead',
  color: '#ec4899',
  icon: 'user-plus',
  prompt: 'Brand new inbound lead that has not been worked yet.',
};

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
    const msg = err?.message || `${label} request failed`;
    throw Object.assign(new Error(msg), { details: { status: resp.status, label, url: url.toString(), error: err || data } });
  }
  return data;
}

async function ensureNewLeadTagId(admin: any, workspaceId: string): Promise<string | null> {
  if (!workspaceId) return null;

  const normalized = NEW_LEAD_TAG_PRESET.name.trim().toLowerCase();

  try {
    const { data: existing, error } = await admin
      .from('instagram_tags')
      .select('id,name')
      .eq('workspace_id', workspaceId)
      .ilike('name', NEW_LEAD_TAG_PRESET.name)
      .maybeSingle();
    if (!error && existing?.id) return String(existing.id);
  } catch {
    // ignore
  }

  try {
    const { data: created, error } = await admin
      .from('instagram_tags')
      .insert({
        workspace_id: workspaceId,
        name: NEW_LEAD_TAG_PRESET.name,
        color: NEW_LEAD_TAG_PRESET.color,
        icon: NEW_LEAD_TAG_PRESET.icon,
        prompt: NEW_LEAD_TAG_PRESET.prompt,
        created_by: null,
      })
      .select('id')
      .maybeSingle();
    if (!error && created?.id) return String(created.id);
  } catch {
    // ignore
  }

  // Race-safe fallback: re-scan tags if insert conflicted.
  try {
    const { data: rows, error } = await admin
      .from('instagram_tags')
      .select('id,name')
      .eq('workspace_id', workspaceId);
    if (error) return null;
    const found = (Array.isArray(rows) ? rows : []).find((r: any) => String(r?.name || '').trim().toLowerCase() === normalized);
    if (found?.id) return String(found.id);
  } catch {
    // ignore
  }

  return null;
}

async function tryFetchIgUserProfile(instagramUserId: string, accessToken: string) {
  const url = new URL(`${BASE_IG}/${encodeURIComponent(instagramUserId)}`);
  url.searchParams.set('fields', 'name,username,profile_pic');
  url.searchParams.set('access_token', accessToken);
  try {
    return await fetchJson(url, 'user_profile', accessToken);
  } catch {
    return null;
  }
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

  return score >= 3;
}

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

function inferShareKind(typeHint: any, url: string | null): 'reel' | 'post' | 'story' | null {
  const t = typeHint != null ? String(typeHint).toLowerCase() : '';
  if (t.includes('reel')) return 'reel';
  if (t.includes('story')) return 'story';
  if (t.includes('post')) return 'post';
  const byUrl = inferShareKindFromUrl(url);
  if (byUrl) return byUrl;
  // Meta often uses a generic "share" type for shared posts/reels.
  if (t === 'share') return 'post';
  return null;
}

function extractAttachmentUrl(att: any): string | null {
  const candidates = [
    att?.payload?.url,
    att?.payload?.link,
    att?.payload?.href,
    att?.payload?.permalink_url,
    att?.payload?.permalink,
    att?.payload?.story_url,
    att?.payload?.reel_url,
    att?.payload?.post_url,
    att?.url,
    att?.link,
  ];
  for (const c of candidates) {
    if (isHttpUrl(c)) return unwrapMetaRedirectUrl(c.trim());
  }

  // Last resort: deep-scan the attachment payload for any http(s) URL.
  const deepUrls = collectHttpUrlsDeep(att);
  const best = pickBestShareUrl(deepUrls);
  return best;
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
    att?.id,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
    if (typeof c === 'number' && Number.isFinite(c)) return String(c);
  }
  return null;
}

async function tryFetchMediaPermalink(mediaId: string, accessToken: string): Promise<string | null> {
  if (!mediaId || !accessToken) return null;
  const candidates: Array<{ base: string; fields: string; label: string }> = [
    {
      base: BASE_IG,
      fields: 'permalink,permalink_url,media_url,thumbnail_url,media_type',
      label: 'ig_media_permalink',
    },
    {
      base: BASE_FB,
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

function isHtmlContentType(contentType: string | null): boolean {
  const ct = (contentType || '').toLowerCase();
  return ct.includes('text/html');
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
    // bucket may already exist or project may restrict creation; ignore
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // GET request = Meta verification challenge
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log('Webhook verification request:', { mode, token, challenge });

    const verifyToken = Deno.env.get('INSTAGRAM_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified successfully');
      // Return ONLY the challenge as plain text - this is what Meta expects
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      console.error('Webhook verification failed:', { mode, token, verifyToken });
      return new Response('Forbidden', { status: 403 });
    }
  }

  // POST request = incoming message/event from Instagram
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('Received Instagram webhook event:', JSON.stringify(body, null, 2));

      // Process messaging events
      // Meta can deliver Instagram DM webhooks either as `object=instagram` (IG scoped)
      // or `object=page` (Messenger API surface). Support both.
      if (body.object === 'instagram' || body.object === 'page') {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceKey) {
          console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
          return new Response('EVENT_RECEIVED', {
            status: 200,
            headers: corsHeaders,
          });
        }

        const admin = createClient(supabaseUrl, serviceKey);
        await ensurePublicBucket(admin, MEDIA_BUCKET);

        for (const entry of body.entry || []) {
          const entryId = entry.id;
          if (!entryId) {
            continue;
          }

          let connection: any | null = null;
          try {
            const res = await admin
              .from('instagram_connections')
              .select('workspace_id, access_token, facebook_user_id, page_id, instagram_account_id')
              .eq('instagram_account_id', entryId)
              .maybeSingle();
            connection = res?.data || null;
          } catch {
            connection = null;
          }

          if (!connection) {
            try {
              const res = await admin
                .from('instagram_connections')
                .select('workspace_id, access_token, facebook_user_id, page_id, instagram_account_id')
                .eq('page_id', entryId)
                .maybeSingle();
              connection = res?.data || null;
            } catch {
              connection = null;
            }
          }

          if (!connection) {
            try {
              const res = await admin
                .from('instagram_connections')
                .select('workspace_id, access_token, facebook_user_id, page_id, instagram_account_id')
                .eq('facebook_user_id', entryId)
                .maybeSingle();
              connection = res?.data || null;
            } catch {
              connection = null;
            }
          }

          if (!connection?.workspace_id) {
            console.warn('No workspace mapping for Instagram webhook entry:', entryId);
            continue;
          }

          const instagramAccountId = connection?.instagram_account_id
            ? String(connection.instagram_account_id)
            : String(entryId);
          const accessToken = connection?.access_token ? String(connection.access_token) : null;
          const selfIds = new Set<string>([String(instagramAccountId), String(entryId)]);
          if (connection?.page_id) selfIds.add(String(connection.page_id));
          if (connection?.facebook_user_id) selfIds.add(String(connection.facebook_user_id));
          const now = Date.now();
          const STALE_MS = 24 * 60 * 60 * 1000;
          const peerCache = new Map<string, { username?: string | null; name?: string | null; pic?: string | null }>();
          const threadExistedByKey = new Map<string, boolean>();
          const newLeadTaggedByKey = new Set<string>();
          let cachedNewLeadTagId: string | null = null;

	          for (const messaging of entry.messaging || []) {
	            const senderId = messaging.sender?.id || null;
	            const recipientId = messaging.recipient?.id || null;
	            const timestampMs = messaging.timestamp || null;
	            const messageNode = messaging?.message || null;
	            const messageId = messageNode?.mid || messageNode?.id || null;
	            const messageText = messageNode?.text || null;
	            const attachments = Array.isArray(messageNode?.attachments) ? messageNode.attachments : [];

	            if (!senderId || !recipientId) {
	              continue;
	            }
	            // Ignore non-message webhook events (read/delivery/etc). These do not have a stable Meta `mid`,
	            // and older code would insert "ghost" rows with `message_id = NULL` that break unread + previews.
	            if (!messageId) {
	              continue;
	            }

            const direction = selfIds.has(String(senderId)) ? 'outbound' : 'inbound';
            let peerId = direction === 'inbound' ? String(senderId) : String(recipientId);
            if (peerId && selfIds.has(peerId)) {
              peerId = direction === 'inbound' ? String(recipientId) : String(senderId);
            }
            if (!peerId || selfIds.has(peerId)) {
              peerId = `unknown:${String(messageId || timestampMs || crypto.randomUUID())}`;
            }
            const instagramUserId = peerId;
            const threadKey = `${instagramAccountId}:${String(instagramUserId)}`;
            const messageTimestampIso = timestampMs ? new Date(timestampMs).toISOString() : null;

            if (!threadExistedByKey.has(threadKey)) {
              try {
                const { data, error } = await admin
                  .from('instagram_threads')
                  .select('conversation_id')
                  .eq('workspace_id', connection.workspace_id)
                  .eq('conversation_id', threadKey)
                  .maybeSingle();
                if (error) {
                  // If we can't confirm existence, assume it exists to avoid mis-tagging.
                  threadExistedByKey.set(threadKey, true);
                } else {
                  threadExistedByKey.set(threadKey, Boolean(data?.conversation_id));
                }
              } catch {
                threadExistedByKey.set(threadKey, true);
              }
            }

            const storedAttachments: any[] = [];
            let sharePreviewText: string | null = null;
            // Best-effort store attachment media in Supabase Storage (public bucket).
            for (let i = 0; i < attachments.length; i++) {
              const att = attachments[i];
              const type = att?.type || null;
              let url = extractAttachmentUrl(att);
              let shareKind = inferShareKind(type, url);
              if (shareKind) {
                if (!url && accessToken) {
                  const mediaId = extractAttachmentId(att);
                  if (mediaId) {
                    url = await tryFetchMediaPermalink(mediaId, accessToken);
                  }
                }
                // Recompute kind after resolving a permalink (type "share" can point to a reel/post).
                shareKind = inferShareKind(type, url) || shareKind;
                if (!sharePreviewText) sharePreviewText = `See ${shareKind}`;
                storedAttachments.push({
                  type: shareKind,
                  share_kind: shareKind,
                  is_share: true,
                  source_url: url,
                  public_url: url,
                });
                continue;
              }
              if (!url) continue;

              try {
                const resp = await fetch(String(url));
                if (!resp.ok) {
                  storedAttachments.push({ type: type || 'file', source_url: url, public_url: null });
                  continue;
                }
                const contentType = resp.headers.get('content-type');
                if (isHtmlContentType(contentType)) {
                  // Shared permalinks often resolve to HTML and cannot be stored as a usable media file.
                  storedAttachments.push({ type: type || 'file', source_url: url, public_url: null });
                  continue;
                }
                const ext = extFromContentType(contentType);
                const buf = new Uint8Array(await resp.arrayBuffer());
                const safeMessageId = messageId ? String(messageId) : crypto.randomUUID();
                const path = `instagram/${connection.workspace_id}/${instagramAccountId}/${safeMessageId}/${i}.${ext}`;

                const { error: uploadError } = await admin.storage
                  .from(MEDIA_BUCKET)
                  .upload(path, buf, { contentType: contentType || undefined, upsert: true });

                if (uploadError) {
                  console.warn('Attachment upload failed:', uploadError);
                  continue;
                }

                const { data: pub } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(path);
                storedAttachments.push({
                  type,
                  source_url: url,
                  bucket: MEDIA_BUCKET,
                  path,
                  public_url: pub?.publicUrl || null,
                  content_type: contentType,
                  size: buf.byteLength,
                });
              } catch (e) {
                console.warn('Attachment store error:', e);
                storedAttachments.push({ type: type || 'file', source_url: url, public_url: null });
              }
            }

            // Best-effort: cache peer username/profile picture for better inbox display.
            let peer = peerCache.get(String(instagramUserId)) || null;
            if (!peer && accessToken && !String(instagramUserId).startsWith('unknown:')) {
              try {
                const { data: existing } = await admin
                  .from('instagram_users')
                  .select('username,name,profile_pic_url,profile_pic_public_url,profile_pic_storage_path,profile_fetched_at')
                  .eq('workspace_id', connection.workspace_id)
                  .eq('instagram_user_id', String(instagramUserId))
                  .maybeSingle();

                const fetchedAtMs = existing?.profile_fetched_at ? new Date(existing.profile_fetched_at).getTime() : 0;
                const isStale = !fetchedAtMs || (now - fetchedAtMs) > STALE_MS;
                const needsFetch = isStale || !existing?.username || (!existing?.profile_pic_public_url && !existing?.profile_pic_url);

                let profile: any | null = null;
                if (needsFetch) {
                  profile = await tryFetchIgUserProfile(String(instagramUserId), accessToken);
                }

                const profilePicUrl = (profile?.profile_pic as string | undefined) || existing?.profile_pic_url || null;
                let stored = null as any;
                if (profile && profilePicUrl) {
                  const resp = await fetch(String(profilePicUrl));
                  if (resp.ok) {
                    const contentType = resp.headers.get('content-type');
                    const ext = extFromContentType(contentType);
                    const buf = new Uint8Array(await resp.arrayBuffer());
                    const path = `instagram/profile-pics/${connection.workspace_id}/${instagramUserId}.${ext}`;
                    const { error: uploadError } = await admin.storage
                      .from(MEDIA_BUCKET)
                      .upload(path, buf, { contentType: contentType || undefined, upsert: true });
                    if (!uploadError) {
                      const { data: pub } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(path);
                      stored = { fullPath: path, publicUrl: pub?.publicUrl || null };
                    }
                  }
                }

                const username = (profile?.username as string | undefined) || existing?.username || null;
                const name = (profile?.name as string | undefined) || existing?.name || null;
                const publicPic = stored?.publicUrl || existing?.profile_pic_public_url || null;

                await admin
                  .from('instagram_users')
                  .upsert(
                    {
                      workspace_id: connection.workspace_id,
                      instagram_user_id: String(instagramUserId),
                      username,
                      name,
                      profile_pic_url: profilePicUrl,
                      profile_pic_storage_path: stored?.fullPath || existing?.profile_pic_storage_path || null,
                      profile_pic_public_url: publicPic,
                      profile_fetched_at: new Date().toISOString(),
                    },
                    { onConflict: 'workspace_id,instagram_user_id' }
                  );

                peer = { username, name, pic: publicPic || profilePicUrl };
                peerCache.set(String(instagramUserId), peer);
              } catch {
                // ignore
              }
            }

            // Upsert thread metadata (manual priority lives on this row and is NOT overwritten here).
            try {
              const lastTextCandidate = messageText != null ? String(messageText).trim() : '';
              const lastText =
                lastTextCandidate ||
                sharePreviewText ||
                (storedAttachments.length ? '[attachment]' : 'Content not available');
              const spam = direction === 'inbound' && isProbablySpam(lastText);
              const baseThreadRow = {
                workspace_id: connection.workspace_id,
                instagram_account_id: String(instagramAccountId),
                conversation_id: threadKey,
                instagram_user_id: String(instagramUserId),
                peer_username: peer?.username ?? null,
                peer_name: peer?.name ?? null,
                peer_profile_picture_url: peer?.pic ?? null,
                last_message_id: messageId,
                last_message_text: lastText,
                last_message_direction: direction,
                last_message_at: messageTimestampIso,
              };

              const candidates = [
                {
                  ...baseThreadRow,
                  ...(direction === 'inbound'
                    ? { last_inbound_at: messageTimestampIso }
                    : { last_outbound_at: messageTimestampIso }),
                  ...(spam ? { is_spam: true } : {}),
                },
                baseThreadRow,
                {
                  workspace_id: connection.workspace_id,
                  instagram_account_id: String(instagramAccountId),
                  conversation_id: threadKey,
                  instagram_user_id: String(instagramUserId),
                  last_message_id: messageId,
                  last_message_text: lastText,
                  last_message_direction: direction,
                  last_message_at: messageTimestampIso,
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
                // Only retry on schema drift (missing columns).
                if (!msg.includes('column') && !msg.includes('does not exist')) break;
              }

              if (upsertError) {
                console.warn('instagram_threads upsert failed:', upsertError);
              }

              const existed = threadExistedByKey.get(threadKey);
              const shouldDefaultPhaseToNewLead = existed === false && !newLeadTaggedByKey.has(threadKey);
              if (shouldDefaultPhaseToNewLead) {
                newLeadTaggedByKey.add(threadKey);

                cachedNewLeadTagId = cachedNewLeadTagId || await ensureNewLeadTagId(admin, connection.workspace_id);
                if (cachedNewLeadTagId) {
                  try {
                    const { error: tagLinkError } = await admin
                      .from('instagram_conversation_tags')
                      .insert({
                        workspace_id: connection.workspace_id,
                        conversation_id: threadKey,
                        tag_id: cachedNewLeadTagId,
                        source: 'ai',
                        created_by: null,
                      });
                    if (tagLinkError && String(tagLinkError?.code || '') !== '23505') {
                      console.warn('Failed to apply New lead tag:', tagLinkError);
                    }
                  } catch (e) {
                    // table may not exist yet; ignore
                  }
                }
              }
            } catch {
              // table may not exist yet; ignore
            }

            {
              const { error } = await admin
                .from('instagram_messages')
                .upsert({
                  workspace_id: connection.workspace_id,
                  instagram_account_id: instagramAccountId,
                  instagram_user_id: instagramUserId,
                  sender_id: senderId,
                  recipient_id: recipientId,
                  message_id: messageId,
                  // Only store the real text (attachments are rendered from raw_payload.stored_attachments).
                  message_text: messageText ? String(messageText) : null,
                  direction,
                  message_timestamp: messageTimestampIso,
                  raw_payload: { ...messaging, stored_attachments: storedAttachments, conversation_key: threadKey },
                }, { onConflict: 'message_id' });
              if (error) console.warn('instagram_messages upsert failed:', error);
            }
          }
        }
      }

      // Always respond with 200 OK to acknowledge receipt
      return new Response('EVENT_RECEIVED', {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('EVENT_RECEIVED', {
        status: 200,
        headers: corsHeaders,
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});
