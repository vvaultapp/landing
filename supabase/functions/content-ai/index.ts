import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_MODEL = Deno.env.get('CLAUDE_MODEL') || 'claude-3-5-sonnet-20240620';
const KNOWLEDGE_BUCKET = Deno.env.get('AI_KNOWLEDGE_BUCKET') || 'uploads';
const KNOWLEDGE_PATH = Deno.env.get('AI_KNOWLEDGE_PATH') || 'ai/knowledge.txt';
const KNOWLEDGE_MAX_CHARS = Number(Deno.env.get('AI_KNOWLEDGE_MAX_CHARS') || 12000);
const WEEKLY_IDEA_COUNT = 10;

const IDEA_BUCKETS = ['objections', 'pain_points', 'case_studies', 'mistakes', 'how_to'] as const;
type IdeaBucket = (typeof IDEA_BUCKETS)[number];

const TOPIC_STOP_WORDS = new Set([
  'the', 'and', 'for', 'you', 'your', 'with', 'that', 'this', 'from', 'into', 'about', 'how',
  'why', 'when', 'what', 'where', 'are', 'was', 'were', 'is', 'be', 'to', 'of', 'a', 'an',
  'in', 'on', 'at', 'it', 'as', 'or', 'if', 'my', 'we', 'our', 'their', 'they', 'them', 'i',
  'me', 'im', 'ive', 'vs', 'new', 'best', 'top', 'video', 'videos', 'youtube', 'short', 'shorts',
  'podcast', 'episode', 'guide',
]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function successError(error: string, details?: unknown) {
  return json({
    success: false,
    error,
    details: details == null ? undefined : String((details as any)?.message || details),
  });
}

const asString = (v: unknown) => (v == null ? '' : String(v));

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x || '').trim()).filter(Boolean);
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function randomSlug(len = 8): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(len);
  try {
    crypto.getRandomValues(bytes);
  } catch {
    for (let i = 0; i < len; i += 1) bytes[i] = Math.floor(Math.random() * 255);
  }
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function parseJsonFromText(text: string): any | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || text;
  const objectMatch = candidate.match(/\{[\s\S]*\}/);
  const target = objectMatch ? objectMatch[0] : candidate;
  try {
    return JSON.parse(target);
  } catch {
    return null;
  }
}

function extractAnthropicText(payload: any): string {
  const content = Array.isArray(payload?.content) ? payload.content : [];
  const parts: string[] = [];
  for (const c of content) {
    if (c?.type === 'text' && typeof c?.text === 'string') parts.push(c.text);
  }
  return parts.join('\n').trim();
}

async function callClaudeJson(system: string, userPrompt: string, maxTokens = 1400): Promise<any> {
  if (!CLAUDE_API_KEY) throw new Error('CLAUDE_API_KEY not configured');

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        temperature: 0.15,
        system,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const raw = await resp.text();
    if (!resp.ok) {
      const retryable = resp.status === 429 || resp.status >= 500;
      if (attempt < maxAttempts && retryable) {
        await new Promise((r) => setTimeout(r, 350 * attempt));
        continue;
      }
      throw new Error(`Claude request failed (${resp.status}): ${raw.slice(0, 420)}`);
    }

    let payload: any = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }

    const text = extractAnthropicText(payload);
    const parsed = parseJsonFromText(text);
    if (parsed) return parsed;

    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }

    throw new Error('Failed to parse Claude JSON response');
  }

  throw new Error('Claude request failed');
}

async function callClaudeText(system: string, userPrompt: string, maxTokens = 1000): Promise<string> {
  if (!CLAUDE_API_KEY) throw new Error('CLAUDE_API_KEY not configured');

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      temperature: 0.2,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) throw new Error(`Claude request failed (${resp.status}): ${raw.slice(0, 420)}`);

  let payload: any = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  return extractAnthropicText(payload);
}

async function loadKnowledge(admin: any): Promise<string> {
  try {
    const { data, error } = await admin.storage.from(KNOWLEDGE_BUCKET).download(KNOWLEDGE_PATH);
    if (error || !data) return '';
    const text = await data.text();
    return text.slice(0, KNOWLEDGE_MAX_CHARS);
  } catch {
    return '';
  }
}

async function userHasWorkspaceAccess(admin: any, workspaceId: string, userId: string): Promise<boolean> {
  const { data: member } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (member) return true;

  const { data: portalRole } = await admin
    .from('portal_roles')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .neq('role', 'client')
    .limit(1)
    .maybeSingle();

  return Boolean(portalRole);
}

function parseTimestampMs(value: any): number {
  if (!value) return 0;
  const d = new Date(String(value));
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

function normalizePhase(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (!s) return 'open';
  if (s.includes('downsell')) return 'downsell';
  if (s.includes('qualified')) return 'qualified';
  if (s.includes('disqualified') || s.includes('unqualified')) return 'disqualified';
  if (s.includes('no show')) return 'no_show';
  if (s.includes('book') || s.includes('appointment')) return 'booked_call';
  if (s.includes('follow')) return 'follow_up';
  if (s.includes('new lead')) return 'new_lead';
  if (s.includes('won') || s.includes('closed')) return 'closed_won';
  if (s.includes('lost')) return 'closed_lost';
  return s.replace(/\s+/g, '_').slice(0, 48);
}

function normalizeBucket(raw: string): IdeaBucket {
  const s = raw.trim().toLowerCase();
  if (s.includes('objection')) return 'objections';
  if (s.includes('pain')) return 'pain_points';
  if (s.includes('case')) return 'case_studies';
  if (s.includes('mistake')) return 'mistakes';
  if (s.includes('how')) return 'how_to';
  return 'pain_points';
}

function deriveConversationKey(row: any): string {
  const raw = row?.raw_payload;
  const keyFromPayload = raw?.conversation_key ? String(raw.conversation_key).trim() : '';
  if (keyFromPayload) return keyFromPayload;

  const acc = row?.instagram_account_id ? String(row.instagram_account_id).trim() : '';
  const peer = row?.instagram_user_id ? String(row.instagram_user_id).trim() : '';
  if (acc && peer) return `${acc}:${peer}`;

  return '';
}

function deriveMessageText(row: any): string {
  const direct = asString(row?.message_text).trim();
  if (direct) return direct;

  const payload = row?.raw_payload;
  const payloadMessage = payload?.message;
  if (typeof payloadMessage === 'string' && payloadMessage.trim()) return payloadMessage.trim();
  if (payloadMessage && typeof payloadMessage === 'object' && asString(payloadMessage?.text).trim()) {
    return asString(payloadMessage.text).trim();
  }

  const fallback = asString(payload?.text).trim();
  if (fallback) return fallback;

  const atts = Array.isArray(payload?.stored_attachments)
    ? payload.stored_attachments
    : Array.isArray(payload?.attachments?.data)
      ? payload.attachments.data
      : [];

  if (atts.length > 0) return 'Attachment shared';
  return '';
}

function normalizeIdeaMeta(raw: any): Record<string, any> {
  if (Array.isArray(raw)) {
    return { outline_steps: raw.map((x) => String(x || '').trim()).filter(Boolean) };
  }
  if (raw && typeof raw === 'object') {
    const out = { ...raw } as Record<string, any>;
    if (!Array.isArray(out.outline_steps)) out.outline_steps = [];
    out.outline_steps = out.outline_steps.map((x: any) => String(x || '').trim()).filter(Boolean);
    return out;
  }
  return { outline_steps: [] };
}

async function loadConversationPhaseMap(admin: any, workspaceId: string, conversationIds: string[], leadStatusByConversationId: Record<string, string>): Promise<Record<string, string>> {
  const out: Record<string, string> = {};

  for (const cid of conversationIds) {
    const status = normalizePhase(leadStatusByConversationId[cid] || 'open');
    out[cid] = status;
  }

  if (conversationIds.length === 0) return out;

  const links: Array<{ conversation_id: string; tag_id: string }> = [];
  const CHUNK = 1000;
  for (let i = 0; i < conversationIds.length; i += CHUNK) {
    const chunk = conversationIds.slice(i, i + CHUNK);
    const { data } = await admin
      .from('instagram_conversation_tags')
      .select('conversation_id,tag_id')
      .eq('workspace_id', workspaceId)
      .in('conversation_id', chunk);
    if (Array.isArray(data)) {
      for (const row of data) {
        if (!row?.conversation_id || !row?.tag_id) continue;
        links.push({ conversation_id: String(row.conversation_id), tag_id: String(row.tag_id) });
      }
    }
  }

  const tagIds = unique(links.map((x) => x.tag_id));
  const tagNameById: Record<string, string> = {};
  for (let i = 0; i < tagIds.length; i += CHUNK) {
    const chunk = tagIds.slice(i, i + CHUNK);
    const { data } = await admin
      .from('instagram_tags')
      .select('id,name')
      .eq('workspace_id', workspaceId)
      .in('id', chunk);
    if (Array.isArray(data)) {
      for (const row of data) {
        if (!row?.id) continue;
        tagNameById[String(row.id)] = asString(row?.name);
      }
    }
  }

  const phasePriority = [
    'downsell',
    'qualified',
    'booked_call',
    'follow_up',
    'new_lead',
    'no_show',
    'disqualified',
    'closed_won',
    'closed_lost',
  ];

  const tagPhasesByConversation: Record<string, string[]> = {};
  for (const link of links) {
    const tagName = asString(tagNameById[link.tag_id]);
    const phase = normalizePhase(tagName);
    if (!phase || phase === 'open' || phase === tagName.toLowerCase()) continue;
    if (!tagPhasesByConversation[link.conversation_id]) tagPhasesByConversation[link.conversation_id] = [];
    tagPhasesByConversation[link.conversation_id].push(phase);
  }

  for (const cid of Object.keys(tagPhasesByConversation)) {
    const phases = unique(tagPhasesByConversation[cid]);
    const ranked = phases.sort((a, b) => {
      const ai = phasePriority.includes(a) ? phasePriority.indexOf(a) : 999;
      const bi = phasePriority.includes(b) ? phasePriority.indexOf(b) : 999;
      return ai - bi;
    });
    if (ranked.length > 0) out[cid] = ranked[0];
  }

  return out;
}

function countKeywordHits(text: string, labels: Record<string, string[]>): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const label of Object.keys(labels)) {
    const keys = labels[label] || [];
    if (keys.some((k) => lower.includes(k))) hits.push(label);
  }
  return hits;
}

function topEntries(input: Record<string, number>, max = 8): Array<{ key: string; count: number }> {
  return Object.entries(input)
    .map(([key, count]) => ({ key, count: Number(count || 0) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, max);
}

function toInt(value: unknown): number {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function parseStringArrayFromJson(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((x) => asString(x).trim()).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((x) => asString(x).trim()).filter(Boolean);
    } catch {
      return [];
    }
  }
  return [];
}

function topicTokens(text: string): string[] {
  const cleaned = asString(text)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [];

  return cleaned
    .split(' ')
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && w.length <= 28 && !TOPIC_STOP_WORDS.has(w));
}

type YoutubeVideoSignal = {
  title: string;
  published_at: string | null;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
};

type YoutubeSignals = {
  hasData: boolean;
  channelTitle: string;
  channelDescription: string;
  subscriberCount: number;
  channelVideoCount: number;
  channelViewCount: number;
  recentVideos: YoutubeVideoSignal[];
  topVideos: Array<{ title: string; views: number; published_at: string | null }>;
  topTopics: Array<{ key: string; count: number }>;
  promptContext: string;
};

async function loadYoutubeSignals(admin: any, workspaceId: string): Promise<YoutubeSignals> {
  const empty: YoutubeSignals = {
    hasData: false,
    channelTitle: '',
    channelDescription: '',
    subscriberCount: 0,
    channelVideoCount: 0,
    channelViewCount: 0,
    recentVideos: [],
    topVideos: [],
    topTopics: [],
    promptContext: 'No connected YouTube channel data found.',
  };

  try {
    const { data: channelRow } = await admin
      .from('connected_youtube_channels')
      .select('id,title,description,subscriber_count,video_count,view_count,last_synced_at,created_at')
      .eq('workspace_id', workspaceId)
      .order('last_synced_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    const { data: videoRows } = await admin
      .from('youtube_videos')
      .select('title,description,published_at,view_count,like_count,comment_count,tags')
      .eq('workspace_id', workspaceId)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(120);

    const channelTitle = asString(channelRow?.title).trim();
    const channelDescription = asString(channelRow?.description).trim();

    const recentVideos: YoutubeVideoSignal[] = (Array.isArray(videoRows) ? videoRows : [])
      .map((row: any) => ({
        title: asString(row?.title).trim(),
        published_at: row?.published_at ? asString(row.published_at) : null,
        views: toInt(row?.view_count),
        likes: toInt(row?.like_count),
        comments: toInt(row?.comment_count),
        tags: parseStringArrayFromJson(row?.tags),
      }))
      .filter((v) => Boolean(v.title));

    const topicCounts: Record<string, number> = {};
    for (const v of recentVideos) {
      const tags = v.tags.slice(0, 8);
      const words = [
        ...topicTokens(v.title),
        ...tags.flatMap((t) => topicTokens(t)),
        ...topicTokens(asString(v.title).split(':')[0] || ''),
      ];
      for (const token of words) {
        topicCounts[token] = Number(topicCounts[token] || 0) + 1;
      }
    }

    const topTopics = topEntries(topicCounts, 14);
    const topVideos = recentVideos
      .slice()
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map((v) => ({ title: v.title, views: v.views, published_at: v.published_at }));

    const promptLines: string[] = [];
    if (channelTitle) {
      promptLines.push(`Channel: ${channelTitle}`);
      promptLines.push(`Subscribers: ${toInt(channelRow?.subscriber_count)}`);
      promptLines.push(`Channel videos: ${toInt(channelRow?.video_count)}`);
      promptLines.push(`Channel views: ${toInt(channelRow?.view_count)}`);
    }

    if (topTopics.length > 0) {
      promptLines.push(`Top recurring topics: ${topTopics.map((t) => `${t.key} (${t.count})`).join(', ')}`);
    }

    if (recentVideos.length > 0) {
      const recentList = recentVideos.slice(0, 15).map((v) => `${v.title} [views=${v.views}]`);
      promptLines.push(`Recent videos:\n- ${recentList.join('\n- ')}`);
    } else {
      promptLines.push('Recent videos: none');
    }

    if (topVideos.length > 0) {
      const topList = topVideos.slice(0, 8).map((v) => `${v.title} [views=${v.views}]`);
      promptLines.push(`Top performing videos:\n- ${topList.join('\n- ')}`);
    }

    const hasData = Boolean(channelTitle || recentVideos.length > 0);
    return {
      hasData,
      channelTitle,
      channelDescription,
      subscriberCount: toInt(channelRow?.subscriber_count),
      channelVideoCount: toInt(channelRow?.video_count),
      channelViewCount: toInt(channelRow?.view_count),
      recentVideos,
      topVideos,
      topTopics,
      promptContext: promptLines.join('\n').trim() || empty.promptContext,
    };
  } catch (error) {
    console.warn('loadYoutubeSignals failed:', error);
    return empty;
  }
}

async function buildInboxCorpus(admin: any, workspaceId: string, phaseFilter: string[]): Promise<{
  conversationsForPrompt: string;
  phaseCounts: Record<string, number>;
  topObjections: Array<{ key: string; count: number }>;
  topPainPoints: Array<{ key: string; count: number }>;
  topQuestions: Array<{ key: string; count: number }>;
  topConvincers: Array<{ key: string; count: number }>;
  sampledConversationCount: number;
}> {
  const { data: threadRows, error: threadError } = await admin
    .from('instagram_threads')
    .select('conversation_id,lead_status,last_message_at,last_inbound_at,last_outbound_at,priority')
    .eq('workspace_id', workspaceId)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(1200);

  if (threadError) throw new Error(`Failed to load inbox threads: ${threadError.message}`);

  const threads = Array.isArray(threadRows) ? threadRows : [];
  const conversationIds = threads
    .map((t: any) => asString(t?.conversation_id))
    .filter(Boolean);

  const leadStatusByConversationId: Record<string, string> = {};
  for (const t of threads) {
    const cid = asString((t as any)?.conversation_id);
    if (!cid) continue;
    leadStatusByConversationId[cid] = normalizePhase(asString((t as any)?.lead_status));
  }

  const phaseByConversationId = await loadConversationPhaseMap(admin, workspaceId, conversationIds, leadStatusByConversationId);

  const filterSet = new Set(phaseFilter.map(normalizePhase).filter(Boolean));
  const nowMs = Date.now();

  const rankedThreads = threads
    .map((t: any) => {
      const cid = asString(t?.conversation_id);
      const phase = phaseByConversationId[cid] || 'open';
      const inboundMs = parseTimestampMs(t?.last_inbound_at);
      const outboundMs = parseTimestampMs(t?.last_outbound_at);
      const lastMs = parseTimestampMs(t?.last_message_at);
      const waitingHours = inboundMs > outboundMs && inboundMs > 0 ? Math.max(0, (nowMs - inboundMs) / 3600000) : 0;
      const score = (waitingHours * 10) + (t?.priority ? 25 : 0) + (lastMs / 1e11);
      return { ...t, cid, phase, waitingHours, score };
    })
    .filter((t: any) => {
      if (!t.cid) return false;
      if (filterSet.size > 0 && !filterSet.has(t.phase)) return false;
      return true;
    })
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 180);

  const selectedConversationIds = new Set(rankedThreads.map((t: any) => t.cid));
  const selectedThreadById: Record<string, any> = {};
  for (const t of rankedThreads) selectedThreadById[t.cid] = t;

  const sinceIso = new Date(Date.now() - (180 * 24 * 60 * 60 * 1000)).toISOString();
  let messageRows: any[] = [];
  {
    const { data, error } = await admin
      .from('instagram_messages')
      .select('instagram_account_id,instagram_user_id,direction,message_text,message_timestamp,raw_payload')
      .eq('workspace_id', workspaceId)
      .gte('message_timestamp', sinceIso)
      .order('message_timestamp', { ascending: false, nullsFirst: false })
      .limit(12000);

    if (error) {
      const fallback = await admin
        .from('instagram_messages')
        .select('instagram_account_id,instagram_user_id,direction,message_text,message_timestamp,raw_payload')
        .eq('workspace_id', workspaceId)
        .order('message_timestamp', { ascending: false, nullsFirst: false })
        .limit(8000);
      messageRows = Array.isArray(fallback.data) ? fallback.data : [];
    } else {
      messageRows = Array.isArray(data) ? data : [];
    }
  }

  const messagesByConversation: Record<string, Array<{ direction: string; text: string; at: number }>> = {};
  for (const row of messageRows) {
    const key = deriveConversationKey(row);
    if (!key || !selectedConversationIds.has(key)) continue;
    const text = deriveMessageText(row);
    if (!text) continue;
    if (!messagesByConversation[key]) messagesByConversation[key] = [];
    if (messagesByConversation[key].length >= 80) continue;
    messagesByConversation[key].push({
      direction: asString(row?.direction).toLowerCase() === 'outbound' ? 'outbound' : 'inbound',
      text,
      at: parseTimestampMs(row?.message_timestamp),
    });
  }

  const objectionLabels: Record<string, string[]> = {
    pricing: ['price', 'pricing', 'expensive', 'too much', 'cost'],
    timing: ['later', 'not ready', 'too soon', 'busy', 'timing'],
    trust: ['proof', 'legit', 'trust', 'scam', 'real'],
    effort: ['too hard', 'complicated', 'overwhelming', 'difficult'],
    fit: ['not for me', 'not my niche', 'not my audience', 'not sure this fits'],
  };
  const painLabels: Record<string, string[]> = {
    no_leads: ['no leads', 'not getting leads', 'lead flow', 'inbound'],
    low_sales: ['no sales', 'not closing', 'close rate', 'conversion'],
    inconsistent_content: ['inconsistent', 'not posting', 'content plan', 'ideas'],
    time_shortage: ['no time', 'too busy', 'time'],
    low_confidence: ['not confident', 'camera shy', 'awkward on camera', 'hesitant'],
  };
  const convincerLabels: Record<string, string[]> = {
    proof: ['results', 'case study', 'testimonial', 'before and after'],
    clarity: ['makes sense', 'clear now', 'got it', 'understand'],
    urgency: ['need this', 'asap', 'right now', 'this week'],
    commitment: ['booked', 'book a call', 'send link', "i\'m in", 'let\'s do it'],
  };

  const objectionCounts: Record<string, number> = {};
  const painCounts: Record<string, number> = {};
  const questionCounts: Record<string, number> = {};
  const convincerCounts: Record<string, number> = {};
  const phaseCounts: Record<string, number> = {};

  const sections: string[] = [];
  for (const cid of Object.keys(messagesByConversation)) {
    const rows = messagesByConversation[cid]
      .slice()
      .sort((a, b) => a.at - b.at)
      .slice(-14);

    if (rows.length === 0) continue;

    const thread = selectedThreadById[cid];
    const phase = asString(thread?.phase || phaseByConversationId[cid] || 'open');
    phaseCounts[phase] = Number(phaseCounts[phase] || 0) + 1;

    const lines: string[] = [];
    for (const m of rows) {
      const label = m.direction === 'outbound' ? 'You' : 'Lead';
      const text = m.text.replace(/\s+/g, ' ').trim().slice(0, 260);
      if (!text) continue;
      lines.push(`${label}: ${text}`);

      if (m.direction === 'inbound') {
        const lower = text.toLowerCase();
        const objections = countKeywordHits(lower, objectionLabels);
        const pains = countKeywordHits(lower, painLabels);
        const convinces = countKeywordHits(lower, convincerLabels);

        for (const hit of objections) objectionCounts[hit] = Number(objectionCounts[hit] || 0) + 1;
        for (const hit of pains) painCounts[hit] = Number(painCounts[hit] || 0) + 1;
        for (const hit of convinces) convincerCounts[hit] = Number(convincerCounts[hit] || 0) + 1;

        if (lower.includes('?')) {
          const normalizedQuestion = text
            .toLowerCase()
            .replace(/[^a-z0-9\s?]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 90);
          if (normalizedQuestion) questionCounts[normalizedQuestion] = Number(questionCounts[normalizedQuestion] || 0) + 1;
        }
      }
    }

    const waitingHours = Number(thread?.waitingHours || 0);
    const header = `Conversation ${cid} | phase=${phase} | waiting_hours=${Math.round(waitingHours)}`;
    sections.push(`${header}\n${lines.join('\n')}`);
  }

  let conversationText = '';
  for (const section of sections) {
    const next = `${section}\n\n`;
    if (conversationText.length + next.length > 26000) break;
    conversationText += next;
  }

  return {
    conversationsForPrompt: conversationText.trim(),
    phaseCounts,
    topObjections: topEntries(objectionCounts, 10),
    topPainPoints: topEntries(painCounts, 10),
    topQuestions: topEntries(questionCounts, 10),
    topConvincers: topEntries(convincerCounts, 8),
    sampledConversationCount: sections.length,
  };
}

async function createTrackedBookingLink(
  admin: any,
  workspaceId: string,
  userId: string,
  title: string,
  destinationUrl: string,
): Promise<{ id: string; slug: string; destination_url: string } | null> {
  const nameBase = title.trim() ? `CTA - ${title.trim().slice(0, 72)}` : 'CTA link';

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const slug = randomSlug(8);
    const { data, error } = await admin
      .from('tracked_links')
      .insert({
        workspace_id: workspaceId,
        created_by: userId,
        name: nameBase,
        slug,
        destination_url: destinationUrl,
        mode: 'booking',
      })
      .select('id,slug,destination_url')
      .maybeSingle();

    if (!error && data) {
      return {
        id: String(data.id),
        slug: String(data.slug),
        destination_url: String(data.destination_url || destinationUrl),
      };
    }

    const msg = `${asString(error?.message)} ${asString(error?.details)}`.toLowerCase();
    const duplicate = msg.includes('duplicate') || msg.includes('unique') || msg.includes('tracked_links_slug_key');
    if (!duplicate) break;
  }

  return null;
}

const WEEKLY_IDEAS_SYSTEM = `You are an elite YouTube strategist for appointment-based businesses.

Return ONLY valid JSON in this shape:
{
  "insights": [
    {
      "bucket": "objections|pain_points|case_studies|mistakes|how_to",
      "phase": "string",
      "signal": "string",
      "frequency": number,
      "evidence": ["string"]
    }
  ],
  "ideas": [
    {
      "bucket": "objections|pain_points|case_studies|mistakes|how_to",
      "phase": "string",
      "title": "string",
      "hook": "string",
      "angle": "string",
      "pain": "string",
      "objection": "string",
      "what_convinced": "string",
      "cta_intent": "string"
    }
  ]
}

Rules:
- Ideas must be YouTube-ready and directly useful this week.
- Prioritize ideas that pre-qualify and drive booked calls.
- Use the YouTube history provided to avoid repeating old angles.
- Prefer adjacent topics that fit what already performs on the channel.
- Use concrete language, no vague generic tips.
- Keep titles short and specific.`;

const HOOK_SYSTEM = `Return ONLY JSON: {"hook":"string"}. Write one hard-hitting YouTube hook (<18 words) that speaks to the exact objection/pain.`;
const OUTLINE_SYSTEM = `Return ONLY JSON: {"outline":["string"]}. Create a practical 6-8 step YouTube outline that turns the objection into a booking conversation.`;
const CTA_SYSTEM = `Return ONLY JSON: {"cta":"string"}. Write one CTA that is direct, human, and includes the provided tracked booking link exactly once.`;
const SCRIPT_SYSTEM = `Return ONLY JSON:
{
  "title": "string",
  "script": "string",
  "sections": [
    { "label": "Hook", "text": "string" },
    { "label": "Body", "text": "string" },
    { "label": "CTA", "text": "string" }
  ]
}

Rules:
- Real human tone, no fluff.
- Strong first 2 seconds.
- Include practical examples and one CTA to book.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !supabaseAnonKey || !serviceKey) return json({ error: 'Server misconfigured' }, 500);

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userError || !user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json();
    const action = asString(body?.action).trim();
    const workspaceId = asString(body?.workspaceId).trim();
    if (!action || !workspaceId) return json({ error: 'Missing action or workspaceId' }, 400);

    const hasWorkspaceAccess = await userHasWorkspaceAccess(admin, workspaceId, user.id);
    if (!hasWorkspaceAccess) return json({ error: 'Workspace access denied' }, 403);

    const knowledge = await loadKnowledge(admin);

    if (action === 'generate-weekly-ideas' || action === 'generate-ideas') {
      const count = WEEKLY_IDEA_COUNT;
      const phaseFilter = asStringArray(body?.phaseFilter || body?.phases || []).map(normalizePhase);

      const weekAgoIso = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString();
      const { data: recentIdeas } = await admin
        .from('content_ideas')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('platform', 'youtube')
        .eq('source', 'ai')
        .gte('created_at', weekAgoIso)
        .order('created_at', { ascending: false })
        .limit(100);

      const existingThisWeek = Array.isArray(recentIdeas) ? recentIdeas : [];
      if (existingThisWeek.length >= count) {
        return json({ success: true, ideas: existingThisWeek, autoSkipped: true, generationMode: 'cached' });
      }

      const countToGenerate = Math.max(1, count - existingThisWeek.length);
      const emptyCorpus = {
        conversationsForPrompt: '',
        phaseCounts: {} as Record<string, number>,
        topObjections: [] as Array<{ key: string; count: number }>,
        topPainPoints: [] as Array<{ key: string; count: number }>,
        topQuestions: [] as Array<{ key: string; count: number }>,
        topConvincers: [] as Array<{ key: string; count: number }>,
        sampledConversationCount: 0,
      };
      let corpus = emptyCorpus;
      let inboxError = '';
      try {
        corpus = await buildInboxCorpus(admin, workspaceId, phaseFilter);
      } catch (error: any) {
        inboxError = asString(error?.message || error);
        console.warn('buildInboxCorpus failed:', inboxError);
      }

      const youtube = await loadYoutubeSignals(admin, workspaceId);
      if (!corpus.conversationsForPrompt) {
        if (existingThisWeek.length > 0) {
          return json({
            success: true,
            ideas: existingThisWeek,
            autoSkipped: true,
            generationMode: 'cached',
            warnings: ['No inbox conversation corpus available yet. Showing existing weekly ideas.'],
          });
        }
        return successError('Not enough inbox conversation data yet to generate ideas.');
      }

      const prompt = `Knowledge (internal context):
${knowledge || '(none)'}

Date: ${new Date().toISOString()}
Weekly idea count (fixed): ${countToGenerate}
${phaseFilter.length > 0 ? `Target phases: ${phaseFilter.join(', ')}` : 'Target phases: all'}
YouTube available: ${youtube.hasData ? 'yes' : 'no'}

Top pains: ${JSON.stringify(corpus.topPainPoints)}
Top objections: ${JSON.stringify(corpus.topObjections)}
Top questions: ${JSON.stringify(corpus.topQuestions)}
What convinced buyers: ${JSON.stringify(corpus.topConvincers)}
Phase counts: ${JSON.stringify(corpus.phaseCounts)}
Sampled conversations: ${corpus.sampledConversationCount}

YouTube context:
${youtube.promptContext}

Conversation excerpts:
${corpus.conversationsForPrompt || '(none available)'}

Generate exactly ${countToGenerate} ideas.`;

      let aiError = '';
      let result: any = null;
      try {
        result = await callClaudeJson(WEEKLY_IDEAS_SYSTEM, prompt, 1700);
      } catch (error: any) {
        aiError = asString(error?.message || error);
        console.warn('weekly idea Claude generation failed:', aiError);
        if (existingThisWeek.length > 0) {
          return json({
            success: true,
            ideas: existingThisWeek,
            autoSkipped: true,
            generationMode: 'cached',
            warnings: [`Claude generation failed: ${aiError}`],
          });
        }
        return successError('Claude generation failed', aiError);
      }

      let ideasRaw = Array.isArray(result?.ideas) ? result.ideas : [];
      let insightsRaw = Array.isArray(result?.insights) ? result.insights : [];
      if (ideasRaw.length > 0 && ideasRaw.length < countToGenerate) {
        try {
          const refillPrompt = `${prompt}\n\nYou only returned ${ideasRaw.length}. Return ${countToGenerate - ideasRaw.length} additional unique ideas now.`;
          const refill = await callClaudeJson(WEEKLY_IDEAS_SYSTEM, refillPrompt, 1400);
          const extraIdeas = Array.isArray(refill?.ideas) ? refill.ideas : [];
          if (extraIdeas.length > 0) ideasRaw = [...ideasRaw, ...extraIdeas];
          if (insightsRaw.length === 0 && Array.isArray(refill?.insights)) insightsRaw = refill.insights;
        } catch (error: any) {
          console.warn('weekly idea refill failed:', asString(error?.message || error));
        }
      }

      if (ideasRaw.length === 0) {
        if (existingThisWeek.length > 0) {
          return json({
            success: true,
            ideas: existingThisWeek,
            autoSkipped: true,
            generationMode: 'cached',
            warnings: ['Claude returned no ideas; showing existing weekly ideas.'],
          });
        }
        return successError('Claude returned no ideas for this week.');
      }

      const seenTitles = new Set<string>();
      const normalizedIdeas = ideasRaw
        .map((idea: any) => {
          const title = asString(idea?.title || '').trim();
          if (!title) return null;
          const key = title.toLowerCase();
          if (seenTitles.has(key)) return null;
          seenTitles.add(key);
          return idea;
        })
        .filter(Boolean)
        .slice(0, countToGenerate);
      if (normalizedIdeas.length === 0) {
        if (existingThisWeek.length > 0) {
          return json({
            success: true,
            ideas: existingThisWeek,
            autoSkipped: true,
            generationMode: 'cached',
            warnings: ['Claude output had no usable titles; showing existing weekly ideas.'],
          });
        }
        return successError('No usable ideas generated by Claude.');
      }

      const rowsToInsert = normalizedIdeas.map((idea: any) => {
        const bucket = normalizeBucket(asString(idea?.bucket || 'pain_points'));
        const phase = normalizePhase(asString(idea?.phase || 'open'));
        const outlineJson = {
          bucket,
          phase,
          insight: {
            pain: asString(idea?.pain || ''),
            objection: asString(idea?.objection || ''),
            what_convinced: asString(idea?.what_convinced || ''),
            evidence: asStringArray(idea?.evidence || []),
          },
          source: {
            mode: 'weekly_inbox_youtube_ai',
            generated_at: new Date().toISOString(),
            youtube_context_used: youtube.hasData,
            top_topic: youtube.topTopics.length > 0 ? youtube.topTopics[0].key : null,
            fallback_reason: null,
          },
          outline_steps: [] as string[],
        };

        return {
          workspace_id: workspaceId,
          created_by: user.id,
          platform: 'youtube',
          format: 'long',
          title: asString(idea?.title || 'Untitled idea').slice(0, 300),
          hook: asString(idea?.hook || '') || null,
          angle: asString(idea?.angle || '') || null,
          cta: null,
          outline_json: outlineJson,
          status: 'idea',
          source: 'ai',
        };
      });

      if (rowsToInsert.length === 0) {
        return json({
          success: true,
          ideas: existingThisWeek,
          autoSkipped: true,
          generationMode: 'cached',
          warnings: ['No new ideas generated; using existing weekly ideas.'],
        });
      }

      const { data: inserted, error: insertError } = await admin
        .from('content_ideas')
        .insert(rowsToInsert)
        .select('*');

      if (insertError) return successError('Failed to store ideas', insertError);

      const combinedIdeas = [...(Array.isArray(inserted) ? inserted : []), ...existingThisWeek]
        .sort((a: any, b: any) => {
          const ta = parseTimestampMs(a?.created_at);
          const tb = parseTimestampMs(b?.created_at);
          return tb - ta;
        })
        .slice(0, 100);

      const warnings: string[] = [];
      if (inboxError) warnings.push(`Inbox scan warning: ${inboxError}`);
      if (aiError) warnings.push(`Claude warning: ${aiError}`);

      return json({
        success: true,
        ideas: combinedIdeas,
        generatedCount: Array.isArray(inserted) ? inserted.length : 0,
        weeklyTarget: count,
        generationMode: 'ai',
        insights: insightsRaw,
        warnings,
        corpus: {
          phaseCounts: corpus.phaseCounts,
          topPainPoints: corpus.topPainPoints,
          topObjections: corpus.topObjections,
          topQuestions: corpus.topQuestions,
          topConvincers: corpus.topConvincers,
          sampledConversationCount: corpus.sampledConversationCount,
        },
        youtube: {
          hasData: youtube.hasData,
          channelTitle: youtube.channelTitle,
          subscriberCount: youtube.subscriberCount,
          topTopics: youtube.topTopics,
          topVideos: youtube.topVideos,
          recentVideoCount: youtube.recentVideos.length,
        },
      });
    }

    if (action === 'generate-idea-piece' || action === 'generate-script') {
      const ideaId = asString(body?.ideaId).trim();
      if (!ideaId) return successError('Missing ideaId');

      const requestedKind = action === 'generate-script' ? 'script' : asString(body?.kind).trim().toLowerCase();
      const kind = requestedKind === 'hook' || requestedKind === 'outline' || requestedKind === 'cta' || requestedKind === 'script'
        ? requestedKind
        : null;
      if (!kind) return successError('Invalid kind');

      const { data: idea, error: ideaError } = await admin
        .from('content_ideas')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('id', ideaId)
        .maybeSingle();

      if (ideaError || !idea) return successError('Idea not found');

      const title = asString((idea as any)?.title || 'Untitled idea');
      const angle = asString((idea as any)?.angle || '');
      const hook = asString((idea as any)?.hook || '');
      const cta = asString((idea as any)?.cta || '');
      const meta = normalizeIdeaMeta((idea as any)?.outline_json);
      const bucket = normalizeBucket(asString(meta?.bucket || 'pain_points'));
      const phase = normalizePhase(asString(meta?.phase || 'open'));
      const insight = meta?.insight && typeof meta.insight === 'object' ? meta.insight : {};
      const currentOutline = asStringArray(meta?.outline_steps || []);

      const commonContext = `Knowledge:\n${knowledge || '(none)'}\n\nIdea title: ${title}\nBucket: ${bucket}\nPhase: ${phase}\nAngle: ${angle || '(none)'}\nHook: ${hook || '(none)'}\nCurrent CTA: ${cta || '(none)'}\nCurrent outline: ${currentOutline.join(' | ') || '(none)'}\nInbox pain: ${asString(insight?.pain)}\nInbox objection: ${asString(insight?.objection)}\nWhat convinced buyers: ${asString(insight?.what_convinced)}`;

      if (kind === 'hook') {
        let nextHook = '';
        try {
          const result = await callClaudeJson(HOOK_SYSTEM, `${commonContext}\n\nWrite one hook now.`, 320);
          nextHook = asString(result?.hook).trim();
        } catch (error: any) {
          return successError('Claude hook generation failed', error);
        }
        if (!nextHook) return successError('Claude returned an empty hook');

        const { data: updated, error: updateError } = await admin
          .from('content_ideas')
          .update({ hook: nextHook })
          .eq('workspace_id', workspaceId)
          .eq('id', ideaId)
          .select('*')
          .maybeSingle();

        if (updateError || !updated) return successError('Failed to save hook', updateError);
        return json({ success: true, idea: updated, kind });
      }

      if (kind === 'outline') {
        let outline: string[] = [];
        try {
          const result = await callClaudeJson(OUTLINE_SYSTEM, `${commonContext}\n\nGenerate the outline now.`, 520);
          outline = asStringArray(result?.outline || []);
        } catch (error: any) {
          return successError('Claude outline generation failed', error);
        }
        if (outline.length === 0) return successError('Claude returned an empty outline');

        const nextMeta = {
          ...meta,
          bucket,
          phase,
          outline_steps: outline,
        };

        const { data: updated, error: updateError } = await admin
          .from('content_ideas')
          .update({ outline_json: nextMeta })
          .eq('workspace_id', workspaceId)
          .eq('id', ideaId)
          .select('*')
          .maybeSingle();

        if (updateError || !updated) return successError('Failed to save outline', updateError);
        return json({ success: true, idea: updated, kind });
      }

      if (kind === 'cta') {
        let destinationUrl = asString(body?.bookingDestination).trim();

        if (!isValidHttpUrl(destinationUrl)) {
          const { data: existing } = await admin
            .from('tracked_links')
            .select('destination_url')
            .eq('workspace_id', workspaceId)
            .eq('mode', 'booking')
            .eq('archived', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          destinationUrl = asString(existing?.destination_url).trim();
        }

        if (!isValidHttpUrl(destinationUrl)) {
          return successError('Set a valid booking destination URL first.');
        }

        const trackedLink = await createTrackedBookingLink(admin, workspaceId, user.id, title, destinationUrl);
        if (!trackedLink) return successError('Failed to create tracked booking link');

        const appOrigin = asString(body?.appOrigin).trim();
        const trackedUrl = isValidHttpUrl(appOrigin)
          ? `${appOrigin.replace(/\/$/, '')}/book/${trackedLink.slug}`
          : `/book/${trackedLink.slug}`;

        let nextCta = '';
        try {
          const ctaResult = await callClaudeJson(
            CTA_SYSTEM,
            `${commonContext}\n\nTracked booking link: ${trackedUrl}\n\nWrite the CTA now using this exact link once.`,
            420,
          );
          nextCta = asString(ctaResult?.cta).trim();
        } catch (error: any) {
          return successError('Claude CTA generation failed', error);
        }
        if (!nextCta) return successError('Claude returned an empty CTA');

        const nextMeta = {
          ...meta,
          bucket,
          phase,
          cta_link_id: trackedLink.id,
          cta_link_slug: trackedLink.slug,
          cta_link_url: trackedUrl,
        };

        const { data: updated, error: updateError } = await admin
          .from('content_ideas')
          .update({ cta: nextCta, outline_json: nextMeta })
          .eq('workspace_id', workspaceId)
          .eq('id', ideaId)
          .select('*')
          .maybeSingle();

        if (updateError || !updated) return successError('Failed to save CTA', updateError);

        return json({
          success: true,
          kind,
          idea: updated,
          link: {
            id: trackedLink.id,
            slug: trackedLink.slug,
            destination_url: trackedLink.destination_url,
            tracked_url: trackedUrl,
          },
        });
      }

      // kind === 'script'
      let scriptTitle = title;
      let scriptText = '';
      let sections: any = null;
      try {
        const scriptResult = await callClaudeJson(
          SCRIPT_SYSTEM,
          `${commonContext}\n\nWrite a complete script now. Include the CTA exactly once near the end.`,
          1800,
        );
        scriptTitle = asString(scriptResult?.title).trim() || title;
        scriptText = asString(scriptResult?.script).trim();
        sections = Array.isArray(scriptResult?.sections) ? scriptResult.sections : null;
      } catch (error: any) {
        return successError('Claude script generation failed', error);
      }
      if (!scriptText) return successError('Claude returned an empty script');

      const { data: insertedScript, error: insertScriptError } = await admin
        .from('content_scripts')
        .insert({
          workspace_id: workspaceId,
          created_by: user.id,
          idea_id: ideaId,
          title: scriptTitle,
          script_text: scriptText,
          sections_json: sections,
          status: 'draft',
        })
        .select('*')
        .maybeSingle();

      if (insertScriptError || !insertedScript) return successError('Failed to store script', insertScriptError);

      const nextMeta = {
        ...meta,
        bucket,
        phase,
        script_id: asString((insertedScript as any)?.id),
      };

      const { data: updatedIdea, error: updateIdeaError } = await admin
        .from('content_ideas')
        .update({ status: 'scripted', outline_json: nextMeta })
        .eq('workspace_id', workspaceId)
        .eq('id', ideaId)
        .select('*')
        .maybeSingle();

      if (updateIdeaError || !updatedIdea) return successError('Failed to update idea status', updateIdeaError);

      return json({ success: true, kind, idea: updatedIdea, script: insertedScript });
    }

    if (action === 'health-check') {
      const text = await callClaudeText('Return exactly OK', 'OK', 8);
      return json({ success: true, claude: text || 'ok' });
    }

    return successError(`Unknown action: ${action}`);
  } catch (e: any) {
    console.error('content-ai error:', e);
    return successError(e?.message || 'Unexpected error');
  }
});
