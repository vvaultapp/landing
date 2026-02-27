import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY') || '';
const DEFAULT_CLAUDE_MODEL = Deno.env.get('CLAUDE_MODEL') || 'claude-3-5-sonnet-latest';
const KNOWLEDGE_BUCKET = Deno.env.get('AI_KNOWLEDGE_BUCKET') || 'uploads';
const KNOWLEDGE_PATH = Deno.env.get('AI_KNOWLEDGE_PATH') || 'ai/knowledge.txt';
const KNOWLEDGE_MAX_CHARS = Number(Deno.env.get('AI_KNOWLEDGE_MAX_CHARS') || 12000);
const INBOX_CONTEXT_MAX_CHARS = Number(Deno.env.get('AI_INBOX_CONTEXT_MAX_CHARS') || 24000);
const INBOX_THREADS_LIMIT = Number(Deno.env.get('AI_INBOX_THREADS_LIMIT') || 220);
const INBOX_TOP_LEADS_LIMIT = Number(Deno.env.get('AI_INBOX_TOP_LEADS_LIMIT') || 15);
const INBOX_LEAD_INDEX_LIMIT = Number(Deno.env.get('AI_INBOX_LEAD_INDEX_LIMIT') || 70);
const INBOX_DETAILED_CONV_LIMIT = Number(Deno.env.get('AI_INBOX_DETAILED_CONV_LIMIT') || 18);
const INBOX_RECENT_MSGS_PER_CONV = Number(Deno.env.get('AI_INBOX_RECENT_MSGS_PER_CONV') || 14);

const MODEL_ENV_KEY_BY_ID: Record<string, string> = {
  'sonnet-4.5': 'CLAUDE_MODEL_SONNET',
  'opus-4.5': 'CLAUDE_MODEL_OPUS',
  'haiku-4.5': 'CLAUDE_MODEL_HAIKU',
};

const FALLBACK_CLAUDE_MODELS = Array.from(
  new Set(
    String(
      Deno.env.get('CLAUDE_MODEL_FALLBACKS') || 'claude-3-5-sonnet-latest,claude-3-7-sonnet-latest',
    )
      .split(',')
      .map((v) => String(v || '').trim())
      .filter(Boolean),
  ),
);

const SYSTEM_PROMPT = `You are ACQ's executive AI operator for sales teams.

Your role:
- Help owners and setters make better decisions fast.
- Use concise, practical, execution-first guidance.
- Prefer concrete next steps over theory.
- When the user asks for scripts/messages, produce ready-to-send copy.
- When data is missing, say exactly what is missing and how to get it.
- Never invent workspace facts, metrics, or history.

Response style:
- Keep responses structured and scannable.
- Use plain language, no fluff, no hype.
- Be direct and useful.

Identity rules (strict):
- You are ACQ AI inside the ACQ app.
- The user-facing assistant profiles are "Saturn 1.1" and "Saturn Light".
- If asked what app this is, what AI this is, or which model this is, answer with ACQ + Saturn naming only.
- Never mention Anthropic, Claude, or internal provider/model IDs in identity answers.

Lead and inbox rules:
- When live inbox context is provided, treat it as source-of-truth.
- For "best/hottest leads" requests, prioritize by priority_score and explain each pick with the provided reasons and message evidence.
- If the user asks for "today", use the today_focus section first.
- If requested data is not in the live context, say exactly that instead of guessing.`;

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Array<{
    kind?: string;
    previewUrl?: string;
    type?: string;
    name?: string;
  }>;
};

type RequestBody = {
  workspaceId?: string;
  modelId?: string;
  modelProfile?: string;
  isThinkingEnabled?: boolean;
  messages?: ChatMessage[];
};

type ClaudeImageBlock = {
  type: 'image';
  source: {
    type: 'base64';
    media_type: string;
    data: string;
  };
};

type ClaudeTextBlock = {
  type: 'text';
  text: string;
};

type ClaudeMessage = {
  role: 'user' | 'assistant';
  content: string | Array<ClaudeTextBlock | ClaudeImageBlock>;
};

type WorkspaceRole = 'owner' | 'coach' | 'setter';

type InboxThreadRow = {
  conversation_id: string;
  instagram_account_id: string | null;
  instagram_user_id: string | null;
  peer_username: string | null;
  peer_name: string | null;
  assigned_user_id: string | null;
  priority: boolean | null;
  shared_with_setters: boolean | null;
  hidden_from_setters: boolean | null;
  is_spam: boolean | null;
  lead_status: string | null;
  summary_text: string | null;
  last_message_at: string | null;
  last_message_direction: string | null;
  last_message_text: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
};

type InboxAlertRow = {
  conversation_id: string;
  alert_type: string;
  overdue_minutes: number | null;
  recommended_action: string | null;
};

type InboxMessageRow = {
  message_text: string | null;
  direction: string | null;
  message_timestamp: string | null;
  created_at: string | null;
  raw_payload: Record<string, unknown> | null;
  sender_id: string | null;
  recipient_id: string | null;
  instagram_user_id: string | null;
};

type LeadInsight = {
  conversation_id: string;
  lead_name: string;
  instagram_handle: string | null;
  lead_status: string;
  temperature: 'hot' | 'warm' | 'cold' | 'none';
  priority_score: number;
  waiting_for_reply: boolean;
  priority_reasons: string[];
  open_alert: {
    type: string;
    overdue_minutes: number | null;
    recommended_action: string | null;
  } | null;
  last_message_at: string | null;
  last_message_direction: string | null;
  last_message_text: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  summary_text: string | null;
  recent_messages: Array<{ from: 'lead' | 'you'; at: string | null; text: string }>;
};

type InboxSnapshot = {
  generated_at: string;
  total_visible_conversations: number;
  ranking_method: string;
  today_focus: LeadInsight[];
  top_leads: LeadInsight[];
  lead_index: Array<{
    conversation_id: string;
    lead_name: string;
    instagram_handle: string | null;
    priority_score: number;
    waiting_for_reply: boolean;
    lead_status: string;
    temperature: 'hot' | 'warm' | 'cold' | 'none';
    open_alert_type: string | null;
    last_message_at: string | null;
    last_message_preview: string | null;
  }>;
};

const MAX_IMAGES_PER_MESSAGE = 10;
const MAX_IMAGE_BASE64_CHARS = Number(Deno.env.get('CLAUDE_IMAGE_MAX_BASE64_CHARS') || 4_500_000);

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const asString = (v: unknown) => (v == null ? '' : String(v));

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

function normalizeName(value: string | null | undefined) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function toMs(v: unknown): number {
  if (v == null) return 0;
  if (v instanceof Date) return Number.isFinite(v.getTime()) ? v.getTime() : 0;
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return 0;
    return v < 1e12 ? Math.round(v * 1000) : Math.round(v);
  }
  const s = String(v).trim();
  if (!s) return 0;
  if (/^\d{10,13}(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (!Number.isFinite(n)) return 0;
    const d = s.split('.')[0].length;
    return d >= 13 ? n : n * 1000;
  }
  const normalized = s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  const t1 = Date.parse(normalized);
  if (Number.isFinite(t1)) return t1;
  const t2 = Date.parse(s);
  return Number.isFinite(t2) ? t2 : 0;
}

function compactText(value: unknown, maxLen = 180) {
  const s = asString(value).replace(/\s+/g, ' ').trim();
  if (s.length <= maxLen) return s;
  return `${s.slice(0, Math.max(0, maxLen - 1)).trim()}...`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  const text = asString(error).trim();
  return text || 'Unknown error';
}

function readClaudeErrorReason(payload: Record<string, unknown> | null, raw: string): string {
  const errorMessage = asString(asRecord(payload?.error).message).trim();
  if (errorMessage) return errorMessage;
  const message = asString(payload?.message).trim();
  if (message) return message;
  const fallback = asString(raw).trim();
  return fallback || 'Claude request failed';
}

function readClaudeUsage(payload: Record<string, unknown> | null): Record<string, unknown> | null {
  const usage = payload?.usage;
  return usage && typeof usage === 'object' ? (usage as Record<string, unknown>) : null;
}

function resolveClaudeModel(modelId: string | undefined | null): string {
  const id = String(modelId || '').trim();

  if (id.startsWith('claude-')) return id;

  const envKey = MODEL_ENV_KEY_BY_ID[id];
  if (envKey) {
    const envModel = String(Deno.env.get(envKey) || '').trim();
    if (envModel) return envModel;
  }

  return DEFAULT_CLAUDE_MODEL;
}

function parseImageDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  const match = String(dataUrl || '').match(
    /^data:(image\/[a-z0-9.+-]+)(?:;[a-z0-9-]+=[^;,]+)*;base64,([A-Za-z0-9+/=]+)$/i,
  );
  if (!match) return null;
  const mediaType = String(match[1] || '').trim().toLowerCase();
  const base64 = String(match[2] || '').trim();
  if (!mediaType.startsWith('image/')) return null;
  if (!base64 || base64.length > MAX_IMAGE_BASE64_CHARS) return null;
  return { mediaType, base64 };
}

function normalizeMessages(input: unknown): ClaudeMessage[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((m: unknown) => {
      const msg = asRecord(m);
      const role = msg.role === 'assistant' ? 'assistant' : msg.role === 'user' ? 'user' : null;
      const content = String(msg.content || '').trim();
      if (!role) return null;

      if (role === 'user') {
        const attachments = Array.isArray(msg.attachments) ? msg.attachments : [];
        const imageBlocks: ClaudeImageBlock[] = attachments
          .map((a) => asRecord(a))
          .filter((a) => String(a.kind || '').toLowerCase() === 'image')
          .slice(0, MAX_IMAGES_PER_MESSAGE)
          .map((a) => parseImageDataUrl(String(a.previewUrl || '')))
          .filter(
            (
              parsed: { mediaType: string; base64: string } | null,
            ): parsed is { mediaType: string; base64: string } => Boolean(parsed),
          )
          .map((parsed) => ({
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: parsed.mediaType,
              data: parsed.base64,
            },
          }));

        if (!content && imageBlocks.length === 0) return null;

        if (imageBlocks.length > 0) {
          const textBlock: ClaudeTextBlock = {
            type: 'text',
            text: (content || 'Analyze the attached images and answer the request.').slice(0, 12000),
          };
          return {
            role,
            content: [textBlock, ...imageBlocks],
          } as ClaudeMessage;
        }
      }

      if (!content) return null;

      return {
        role,
        content: content.slice(0, 12000),
      } as ClaudeMessage;
    })
    .filter(Boolean)
    .slice(-24) as ClaudeMessage[];
}

function extractClaudeText(payload: unknown): string {
  const root = asRecord(payload);
  const content = Array.isArray(root.content) ? root.content : [];
  return content
    .map((item) => {
      const block = asRecord(item);
      return block.type === 'text' && typeof block.text === 'string' ? block.text : '';
    })
    .join('\n')
    .trim();
}

function messageContentToText(content: ClaudeMessage['content']): string {
  if (typeof content === 'string') return String(content || '').trim();
  if (!Array.isArray(content)) return '';
  return content
    .map((block) => (block?.type === 'text' ? String((block as ClaudeTextBlock)?.text || '') : ''))
    .join('\n')
    .trim();
}

function latestUserPrompt(messages: ClaudeMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m?.role === 'user') {
      const text = messageContentToText(m.content);
      if (text) return text;
    }
  }
  return '';
}

function normalizeIdentityText(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isIdentityQuestion(text: string): boolean {
  const q = normalizeIdentityText(text);
  if (!q) return false;
  return (
    /\bwhat app is this\b/.test(q) ||
    /\bwhich app is this\b/.test(q) ||
    /\bwhat(?:'s| is)? this app(?:lication)?(?: called| name)?\b/.test(q) ||
    /\bname of (?:this|the) app\b/.test(q) ||
    /\bwhat(?:'s| is)? this ai\b/.test(q) ||
    /\bwhat ai(?: are you| is this)?\b/.test(q) ||
    /\bwhich ai\b/.test(q) ||
    /\bwho are you\b/.test(q) ||
    /\bwhat are you\b/.test(q) ||
    /\bwhat(?:'s| is)? (?:the )?model\b/.test(q) ||
    /\bwhich model\b/.test(q) ||
    /\bare you (?:using )?claude\b/.test(q) ||
    /\bclaude\b/.test(q) ||
    /\banthropic\b/.test(q)
  );
}

function isLeadInboxQuestion(text: string): boolean {
  const q = normalizeIdentityText(text);
  if (!q) return false;

  if (
    /\binstagram\b/.test(q) ||
    /\binbox\b/.test(q) ||
    /\bdm\b/.test(q) ||
    /\bdms\b/.test(q) ||
    /\bconversation(s)?\b/.test(q) ||
    /\bmessage(s)?\b/.test(q)
  ) {
    return true;
  }

  const hasLeadTerm = /\blead\b|\bleads\b/.test(q);
  const hasExecutionIntent =
    /\bbest\b|\bhottest\b|\bhot\b|\bpriority\b|\brank\b|\btop\b|\brespond\b|\breply\b|\bfollow up\b|\bfollow-up\b|\bqualified\b|\btoday\b|\bwho\b|\bwhich\b|\bshow\b|\bgive\b/.test(
      q,
    );
  return hasLeadTerm && hasExecutionIntent;
}

function shouldAttachInboxContext(messages: ClaudeMessage[]): boolean {
  const userPrompts = messages
    .filter((m) => m.role === 'user')
    .map((m) => messageContentToText(m.content))
    .filter(Boolean)
    .slice(-4);
  if (userPrompts.length === 0) return false;
  return userPrompts.some((prompt) => isLeadInboxQuestion(prompt));
}

function resolveProductModelLabel(modelProfile: unknown): string {
  const profile = String(modelProfile || '')
    .trim()
    .toLowerCase();
  if (profile === 'saturn-light') return 'Saturn Light';
  return 'Saturn 1.1';
}

function buildIdentityReply(modelProfile: unknown): string {
  const modelLabel = resolveProductModelLabel(modelProfile);
  return `This is the ACQ app, and you're chatting with ACQ AI on the ${modelLabel} profile. ACQ AI profiles are Saturn 1.1 and Saturn Light.`;
}

function buildDegradedReply(messages: ClaudeMessage[], reason = ''): string {
  const latest = latestUserPrompt(messages);
  const suffix = String(reason || '').trim();
  if (!latest) return 'AI is temporarily unavailable. Please try again in a few seconds.';
  const clipped = suffix ? ` (${suffix.slice(0, 120)})` : '';
  return `AI is temporarily unavailable${clipped}. I saved your request: "${latest.slice(0, 220)}". Please try again in a few seconds.`;
}

function isModelResolutionError(status: number, reason: string): boolean {
  const normalized = String(reason || '').toLowerCase();
  if (status !== 400 && status !== 404) return false;
  return (
    normalized.includes('model') ||
    normalized.includes('not found') ||
    normalized.includes('invalid') ||
    normalized.includes('unsupported')
  );
}

async function loadKnowledge(admin: ReturnType<typeof createClient>): Promise<string> {
  try {
    const { data, error } = await admin.storage.from(KNOWLEDGE_BUCKET).download(KNOWLEDGE_PATH);
    if (error || !data) return '';
    const raw = await data.text();
    return String(raw || '').slice(0, KNOWLEDGE_MAX_CHARS);
  } catch {
    return '';
  }
}

async function userHasWorkspaceAccess(
  admin: ReturnType<typeof createClient>,
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const { data: member } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle();

  if (member) return true;

  const { data: portalRole } = await admin
    .from('portal_roles')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .neq('role', 'client')
    .maybeSingle();

  if (portalRole) return true;

  const { data: profile } = await admin
    .from('profiles')
    .select('current_workspace_id')
    .eq('id', userId)
    .maybeSingle();

  return String(profile?.current_workspace_id || '') === workspaceId;
}

async function resolveWorkspaceRole(
  admin: ReturnType<typeof createClient>,
  workspaceId: string,
  userId: string,
): Promise<WorkspaceRole> {
  const { data: member } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle();

  const memberRole = normalizeName(asString(member?.role));
  if (memberRole === 'setter') return 'setter';
  if (memberRole === 'coach') return 'coach';
  if (memberRole) return 'owner';

  const { data: portalRole } = await admin
    .from('portal_roles')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .neq('role', 'client')
    .maybeSingle();

  const portal = normalizeName(asString(portalRole?.role));
  if (portal === 'setter') return 'setter';
  if (portal === 'coach') return 'coach';
  if (portal) return 'owner';
  return 'owner';
}

function isVisibleThreadForRole(row: InboxThreadRow, actorUserId: string, role: WorkspaceRole): boolean {
  if (row.is_spam) return false;
  if (normalizeName(row.lead_status) === 'removed') return false;
  if (role !== 'setter') return true;

  if (row.hidden_from_setters) return false;
  const assigned = asString(row.assigned_user_id);
  if (assigned && assigned === actorUserId) return true;
  if (row.shared_with_setters) return true;
  return false;
}

function inferTemperature(tagNames: string[]): 'hot' | 'warm' | 'cold' | 'none' {
  const normalized = new Set(tagNames.map((name) => normalizeName(name)));
  if (normalized.has('hot') || normalized.has('hot lead')) return 'hot';
  if (normalized.has('warm') || normalized.has('warm lead')) return 'warm';
  if (normalized.has('cold') || normalized.has('cold lead')) return 'cold';
  return 'none';
}

function pickLeadName(row: InboxThreadRow) {
  const name = compactText(row.peer_name || '', 64);
  if (name) return name;
  const username = compactText(row.peer_username || '', 64).replace(/^@+/, '');
  if (username) return `@${username}`;
  return 'Instagram lead';
}

function pickLeadHandle(row: InboxThreadRow): string | null {
  const username = compactText(row.peer_username || '', 64).replace(/^@+/, '');
  return username ? `@${username}` : null;
}

function extractIntentSignals(text: string): { positive: string[]; negative: string[] } {
  const source = normalizeIdentityText(text);
  const positive: string[] = [];
  const negative: string[] = [];

  if (
    /\bprice\b|\bpricing\b|\bcost\b|\brate\b|\bquote\b|\bbudget\b|\binvest(?:ment)?\b/.test(source)
  ) {
    positive.push('pricing intent');
  }
  if (/\bavailable\b|\bavailability\b|\bopenings\b/.test(source)) {
    positive.push('availability question');
  }
  if (/\bbook\b|\bbooking\b|\bcall\b|\bdemo\b|\bzoom\b|\bmeeting\b/.test(source)) {
    positive.push('call booking intent');
  }
  if (/\bready\b|\bstart\b|\blet'?s go\b|\bmove forward\b/.test(source)) {
    positive.push('ready-to-start language');
  }
  if (/\binterested\b|\bsounds good\b|\byes\b/.test(source)) {
    positive.push('buying interest');
  }

  if (/\bnot interested\b|\bno thanks\b|\bstop\b|\bremove me\b|\bdo not contact\b/.test(source)) {
    negative.push('opt-out language');
  }
  if (/\bmaybe later\b|\bnot now\b|\bbusy now\b/.test(source)) {
    negative.push('timing objection');
  }

  return { positive, negative };
}

function summarizeRecentMessages(messages: InboxMessageRow[]): Array<{ from: 'lead' | 'you'; at: string | null; text: string }> {
  return messages
    .map((m, idx) => ({ m, idx }))
    .sort((a, b) => {
      const ta = toMs(a.m?.message_timestamp || a.m?.created_at || a.m?.raw_payload?.created_time);
      const tb = toMs(b.m?.message_timestamp || b.m?.created_at || b.m?.raw_payload?.created_time);
      if (ta !== tb) return ta - tb;
      return a.idx - b.idx;
    })
    .slice(-Math.max(1, INBOX_RECENT_MSGS_PER_CONV))
    .map((x) => x.m)
    .map((m) => {
      const text = compactText(
        m?.message_text ?? m?.raw_payload?.message ?? m?.raw_payload?.text ?? '',
        220,
      );
      if (!text) return null;
      const from = asString(m?.direction) === 'outbound' ? 'you' : 'lead';
      const at = m?.message_timestamp ? asString(m.message_timestamp) : m?.created_at ? asString(m.created_at) : null;
      return { from, at, text };
    })
    .filter((entry): entry is { from: 'lead' | 'you'; at: string | null; text: string } => Boolean(entry));
}

function scoreLead(params: {
  nowMs: number;
  thread: InboxThreadRow;
  temperature: 'hot' | 'warm' | 'cold' | 'none';
  alert: InboxAlertRow | null;
  recentMessages: Array<{ from: 'lead' | 'you'; at: string | null; text: string }>;
}): { score: number; reasons: string[]; waitingForReply: boolean } {
  const { nowMs, thread, temperature, alert, recentMessages } = params;
  const reasons: string[] = [];
  let score = 0;

  const status = normalizeName(thread.lead_status || 'open');
  if (status === 'qualified') {
    score += 18;
    reasons.push('Lead is already qualified.');
  } else if (status === 'disqualified') {
    score -= 40;
    reasons.push('Lead is marked disqualified.');
  } else {
    score += 5;
  }

  if (thread.priority) {
    score += 14;
    reasons.push('Conversation is marked as priority.');
  }

  if (temperature === 'hot') {
    score += 30;
    reasons.push('Tagged as Hot Lead.');
  } else if (temperature === 'warm') {
    score += 15;
    reasons.push('Tagged as Warm Lead.');
  } else if (temperature === 'cold') {
    score -= 8;
    reasons.push('Tagged as Cold Lead.');
  }

  if (alert) {
    const alertType = normalizeName(alert.alert_type);
    if (alertType === 'hot lead unreplied') {
      score += 28;
      reasons.push('Open alert: hot lead waiting on reply.');
    } else if (alertType === 'qualified inactive') {
      score += 20;
      reasons.push('Open alert: qualified lead inactive.');
    } else if (alertType === 'no show followup') {
      score += 24;
      reasons.push('Open alert: no-show follow-up needed.');
    } else {
      score += 12;
      reasons.push(`Open alert: ${compactText(alert.alert_type, 38)}.`);
    }
    const overdueMinutes = Number(alert.overdue_minutes || 0);
    if (overdueMinutes > 0) {
      score += Math.min(12, Math.floor(overdueMinutes / 60));
      reasons.push(`Alert overdue by ${overdueMinutes} minutes.`);
    }
  }

  const inboundMs = Math.max(
    toMs(thread.last_inbound_at),
    asString(thread.last_message_direction) === 'inbound' ? toMs(thread.last_message_at) : 0,
  );
  const outboundMs = Math.max(
    toMs(thread.last_outbound_at),
    asString(thread.last_message_direction) === 'outbound' ? toMs(thread.last_message_at) : 0,
  );
  const waitingForReply = inboundMs > 0 && inboundMs > outboundMs;

  if (waitingForReply) {
    const waitHours = Math.max(0, (nowMs - inboundMs) / 3600000);
    if (waitHours >= 24) {
      score += 18;
      reasons.push(`Lead has been waiting ${Math.round(waitHours)}h for a reply.`);
    } else if (waitHours >= 6) {
      score += 13;
      reasons.push(`Lead has been waiting ${Math.round(waitHours)}h for a reply.`);
    } else {
      score += 8;
      reasons.push('Unread inbound message needs response.');
    }
  }

  const lastTouchMs = Math.max(inboundMs, toMs(thread.last_message_at), toMs(thread.last_outbound_at));
  if (lastTouchMs > 0) {
    const hoursAgo = (nowMs - lastTouchMs) / 3600000;
    if (hoursAgo <= 4) score += 8;
    else if (hoursAgo <= 24) score += 5;
    else if (hoursAgo <= 72) score += 2;
  }

  const inboundText = recentMessages
    .filter((m) => m.from === 'lead')
    .slice(-6)
    .map((m) => m.text)
    .join(' \n ');
  const backupText = compactText(
    asString(thread.last_message_direction) === 'inbound' ? asString(thread.last_message_text) : '',
    240,
  );
  const signalSource = `${inboundText} ${backupText}`.trim();
  const signals = extractIntentSignals(signalSource);
  if (signals.positive.length > 0) {
    score += Math.min(14, signals.positive.length * 4);
    reasons.push(`Intent signals: ${Array.from(new Set(signals.positive)).slice(0, 3).join(', ')}.`);
  }
  if (signals.negative.length > 0) {
    score -= Math.min(26, signals.negative.length * 10);
    reasons.push(`Risk signals: ${Array.from(new Set(signals.negative)).slice(0, 2).join(', ')}.`);
  }

  return {
    score: clamp(Math.round(score), -100, 100),
    reasons: Array.from(new Set(reasons)).slice(0, 6),
    waitingForReply,
  };
}

async function getConversationMessages(
  admin: ReturnType<typeof createClient>,
  workspaceId: string,
  thread: InboxThreadRow,
  limit = INBOX_RECENT_MSGS_PER_CONV,
): Promise<InboxMessageRow[]> {
  const conversationId = asString(thread.conversation_id);
  if (!conversationId) return [];

  const byKey = await admin
    .from('instagram_messages')
    .select(
      'message_text,direction,message_timestamp,created_at,raw_payload,sender_id,recipient_id,instagram_user_id',
    )
    .eq('workspace_id', workspaceId)
    .eq('raw_payload->>conversation_key', conversationId)
    .order('message_timestamp', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (!byKey.error && Array.isArray(byKey.data) && byKey.data.length > 0) {
    return byKey.data as InboxMessageRow[];
  }

  const accountId = asString(thread.instagram_account_id);
  const userId = asString(thread.instagram_user_id);
  if (!accountId || !userId) return [];

  const fallback = await admin
    .from('instagram_messages')
    .select(
      'message_text,direction,message_timestamp,created_at,raw_payload,sender_id,recipient_id,instagram_user_id',
    )
    .eq('workspace_id', workspaceId)
    .eq('instagram_account_id', accountId)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId},instagram_user_id.eq.${userId}`)
    .order('message_timestamp', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (fallback.error || !Array.isArray(fallback.data)) return [];

  return (fallback.data as InboxMessageRow[]).filter((m) => {
    const key = asString(m?.raw_payload?.conversation_key);
    return !key || key === conversationId;
  });
}

function extractHandleHints(question: string): string[] {
  const out = new Set<string>();
  const re = /@([a-z0-9._]+)/gi;
  let match: RegExpExecArray | null = null;
  while ((match = re.exec(question)) !== null) {
    const handle = String(match[1] || '')
      .trim()
      .toLowerCase();
    if (!handle) continue;
    out.add(handle);
  }
  return Array.from(out);
}

async function buildInboxSnapshot(
  admin: ReturnType<typeof createClient>,
  workspaceId: string,
  actorUserId: string,
  role: WorkspaceRole,
  latestPrompt: string,
): Promise<InboxSnapshot | null> {
  const { data: rawThreads, error: threadError } = await admin
    .from('instagram_threads')
    .select(
      'conversation_id,instagram_account_id,instagram_user_id,peer_username,peer_name,assigned_user_id,priority,shared_with_setters,hidden_from_setters,is_spam,lead_status,summary_text,last_message_at,last_message_direction,last_message_text,last_inbound_at,last_outbound_at',
    )
    .eq('workspace_id', workspaceId)
    .order('priority', { ascending: false, nullsFirst: false })
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(Math.max(40, INBOX_THREADS_LIMIT));

  if (threadError) {
    console.warn('dashboard-ai-chat inbox snapshot thread load failed:', threadError);
    return null;
  }

  const visibleThreads = (Array.isArray(rawThreads) ? rawThreads : [])
    .map((row) => {
      const r = asRecord(row);
      return {
        conversation_id: asString(r.conversation_id),
        instagram_account_id: r.instagram_account_id != null ? asString(r.instagram_account_id) : null,
        instagram_user_id: r.instagram_user_id != null ? asString(r.instagram_user_id) : null,
        peer_username: r.peer_username != null ? asString(r.peer_username) : null,
        peer_name: r.peer_name != null ? asString(r.peer_name) : null,
        assigned_user_id: r.assigned_user_id != null ? asString(r.assigned_user_id) : null,
        priority: Boolean(r.priority),
        shared_with_setters: Boolean(r.shared_with_setters),
        hidden_from_setters: Boolean(r.hidden_from_setters),
        is_spam: Boolean(r.is_spam),
        lead_status: r.lead_status != null ? asString(r.lead_status) : null,
        summary_text: r.summary_text != null ? asString(r.summary_text) : null,
        last_message_at: r.last_message_at != null ? asString(r.last_message_at) : null,
        last_message_direction:
          r.last_message_direction != null ? asString(r.last_message_direction) : null,
        last_message_text: r.last_message_text != null ? asString(r.last_message_text) : null,
        last_inbound_at: r.last_inbound_at != null ? asString(r.last_inbound_at) : null,
        last_outbound_at: r.last_outbound_at != null ? asString(r.last_outbound_at) : null,
      };
    })
    .filter((row) => row.conversation_id)
    .filter((row) => isVisibleThreadForRole(row, actorUserId, role));

  if (visibleThreads.length === 0) {
    return {
      generated_at: new Date().toISOString(),
      total_visible_conversations: 0,
      ranking_method:
        'No visible inbox conversations for this user role. Connect Instagram or check permissions.',
      today_focus: [],
      top_leads: [],
      lead_index: [],
    };
  }

  const conversationIds = visibleThreads.map((row) => row.conversation_id);
  const [alertRes, linkRes] = await Promise.all([
    admin
      .from('instagram_alerts')
      .select('conversation_id,alert_type,overdue_minutes,recommended_action')
      .eq('workspace_id', workspaceId)
      .eq('status', 'open')
      .in('conversation_id', conversationIds),
    admin
      .from('instagram_conversation_tags')
      .select('conversation_id,tag_id')
      .eq('workspace_id', workspaceId)
      .in('conversation_id', conversationIds),
  ]);

  const alertByConversation = new Map<string, InboxAlertRow>();
  for (const row of Array.isArray(alertRes.data) ? alertRes.data : []) {
    const r = asRecord(row);
    const conversationId = asString(r.conversation_id);
    if (!conversationId || alertByConversation.has(conversationId)) continue;
    alertByConversation.set(conversationId, {
      conversation_id: conversationId,
      alert_type: asString(r.alert_type),
      overdue_minutes: r.overdue_minutes != null ? Number(r.overdue_minutes) : null,
      recommended_action: r.recommended_action != null ? asString(r.recommended_action) : null,
    });
  }

  const links = (Array.isArray(linkRes.data) ? linkRes.data : [])
    .map((row) => {
      const r = asRecord(row);
      return {
        conversation_id: asString(r.conversation_id),
        tag_id: asString(r.tag_id),
      };
    })
    .filter((row) => row.conversation_id && row.tag_id);
  const tagIds = Array.from(new Set(links.map((x) => x.tag_id)));

  const tagNameById = new Map<string, string>();
  if (tagIds.length > 0) {
    const { data: tagRows } = await admin
      .from('instagram_tags')
      .select('id,name')
      .eq('workspace_id', workspaceId)
      .in('id', tagIds);
    for (const row of Array.isArray(tagRows) ? tagRows : []) {
      const r = asRecord(row);
      const id = asString(r.id);
      const name = asString(r.name);
      if (!id || !name) continue;
      tagNameById.set(id, name);
    }
  }

  const tagNamesByConversation = new Map<string, string[]>();
  for (const link of links) {
    const name = tagNameById.get(link.tag_id);
    if (!name) continue;
    const current = tagNamesByConversation.get(link.conversation_id) || [];
    current.push(name);
    tagNamesByConversation.set(link.conversation_id, current);
  }

  const preliminaryInsights = visibleThreads.map((thread) => {
    const temperature = inferTemperature(tagNamesByConversation.get(thread.conversation_id) || []);
    const alert = alertByConversation.get(thread.conversation_id) || null;
    const scored = scoreLead({
      nowMs: Date.now(),
      thread,
      temperature,
      alert,
      recentMessages: [],
    });
    return {
      thread,
      temperature,
      alert,
      score: scored.score,
      reasons: scored.reasons,
      waitingForReply: scored.waitingForReply,
    };
  });

  preliminaryInsights.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return toMs(b.thread.last_message_at) - toMs(a.thread.last_message_at);
  });

  const handleHints = extractHandleHints(latestPrompt);
  const detailedConversationIds = new Set<string>();
  for (const item of preliminaryInsights.slice(0, Math.max(8, INBOX_DETAILED_CONV_LIMIT))) {
    detailedConversationIds.add(item.thread.conversation_id);
  }
  if (handleHints.length > 0) {
    for (const item of preliminaryInsights) {
      if (detailedConversationIds.size >= Math.max(8, INBOX_DETAILED_CONV_LIMIT + 6)) break;
      const handle = normalizeIdentityText(item.thread.peer_username || '').replace(/^@+/, '');
      if (!handle) continue;
      if (handleHints.some((hint) => handle.includes(hint) || hint.includes(handle))) {
        detailedConversationIds.add(item.thread.conversation_id);
      }
    }
  }

  const messagesByConversation = new Map<string, Array<{ from: 'lead' | 'you'; at: string | null; text: string }>>();
  const detailedThreads = preliminaryInsights
    .map((entry) => entry.thread)
    .filter((thread) => detailedConversationIds.has(thread.conversation_id));

  const concurrency = 4;
  for (let i = 0; i < detailedThreads.length; i += concurrency) {
    const batch = detailedThreads.slice(i, i + concurrency);
    const rows = await Promise.all(
      batch.map(async (thread) => {
        const rawMessages = await getConversationMessages(admin, workspaceId, thread, INBOX_RECENT_MSGS_PER_CONV);
        return { conversationId: thread.conversation_id, messages: summarizeRecentMessages(rawMessages) };
      }),
    );
    for (const row of rows) {
      messagesByConversation.set(row.conversationId, row.messages);
    }
  }

  const nowMs = Date.now();
  const insights = visibleThreads
    .map((thread) => {
      const temperature = inferTemperature(tagNamesByConversation.get(thread.conversation_id) || []);
      const alert = alertByConversation.get(thread.conversation_id) || null;
      const recentMessages = messagesByConversation.get(thread.conversation_id) || [];
      const scored = scoreLead({
        nowMs,
        thread,
        temperature,
        alert,
        recentMessages,
      });

      const lead: LeadInsight = {
        conversation_id: thread.conversation_id,
        lead_name: pickLeadName(thread),
        instagram_handle: pickLeadHandle(thread),
        lead_status: asString(thread.lead_status || 'open') || 'open',
        temperature,
        priority_score: scored.score,
        waiting_for_reply: scored.waitingForReply,
        priority_reasons: scored.reasons,
        open_alert: alert
          ? {
              type: asString(alert.alert_type),
              overdue_minutes: alert.overdue_minutes,
              recommended_action: alert.recommended_action,
            }
          : null,
        last_message_at: thread.last_message_at,
        last_message_direction: thread.last_message_direction,
        last_message_text: compactText(thread.last_message_text || '', 220) || null,
        last_inbound_at: thread.last_inbound_at,
        last_outbound_at: thread.last_outbound_at,
        summary_text: compactText(thread.summary_text || '', 420) || null,
        recent_messages: recentMessages,
      };
      return lead;
    })
    .sort((a, b) => {
      if (a.priority_score !== b.priority_score) return b.priority_score - a.priority_score;
      return toMs(b.last_message_at) - toMs(a.last_message_at);
    });

  const now = new Date();
  const startOfUtcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const todayFocus = insights
    .filter((lead) => Math.max(toMs(lead.last_inbound_at), toMs(lead.last_message_at)) >= startOfUtcToday)
    .slice(0, Math.max(1, Math.min(12, INBOX_TOP_LEADS_LIMIT)));

  return {
    generated_at: new Date().toISOString(),
    total_visible_conversations: visibleThreads.length,
    ranking_method:
      'Priority score combines lead status, hot/warm/cold tags, open alerts, reply wait time, recency, and intent signals from recent inbound messages.',
    today_focus: todayFocus,
    top_leads: insights.slice(0, Math.max(1, INBOX_TOP_LEADS_LIMIT)),
    lead_index: insights.slice(0, Math.max(10, INBOX_LEAD_INDEX_LIMIT)).map((lead) => ({
      conversation_id: lead.conversation_id,
      lead_name: lead.lead_name,
      instagram_handle: lead.instagram_handle,
      priority_score: lead.priority_score,
      waiting_for_reply: lead.waiting_for_reply,
      lead_status: lead.lead_status,
      temperature: lead.temperature,
      open_alert_type: lead.open_alert?.type || null,
      last_message_at: lead.last_message_at,
      last_message_preview: compactText(lead.last_message_text || '', 120) || null,
    })),
  };
}

function buildInboxContextBlock(snapshot: InboxSnapshot | null): string {
  if (!snapshot) return '';
  const payload = JSON.stringify(snapshot, null, 2);
  const clipped = payload.length > INBOX_CONTEXT_MAX_CHARS ? `${payload.slice(0, INBOX_CONTEXT_MAX_CHARS)}\n...` : payload;
  return [
    'Live Instagram inbox context (source-of-truth for lead/message answers):',
    clipped,
    '',
    'Instructions for this context:',
    '- Use this data directly for lead and inbox questions.',
    '- For prioritization, rank by priority_score and explain each pick with priority_reasons.',
    '- Use today_focus for "today" requests before broader lead_index entries.',
    '- Do not claim anything that is not present in this snapshot.',
  ].join('\n');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const SUPABASE_URL = String(Deno.env.get('SUPABASE_URL') || '').trim();
    const SUPABASE_ANON_KEY = String(Deno.env.get('SUPABASE_ANON_KEY') || '').trim();
    const SUPABASE_SERVICE_ROLE_KEY = String(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ success: true, degraded: true, reply: buildDegradedReply([], 'Server config missing') });
    }

    const authHeader = String(req.headers.get('Authorization') || '').trim();
    if (!authHeader.startsWith('Bearer ')) {
      return json({ success: true, degraded: true, reply: buildDegradedReply([], 'Unauthorized') });
    }

    const body = (await req.json().catch(() => null)) as RequestBody | null;
    const workspaceId = String(body?.workspaceId || '').trim();
    const messages = normalizeMessages(body?.messages);
    const selectedModel = resolveClaudeModel(body?.modelId);
    const thinkingEnabled = Boolean(body?.isThinkingEnabled);
    const latestPrompt = latestUserPrompt(messages);

    if (!workspaceId) {
      return json({ success: true, degraded: true, reply: buildDegradedReply(messages, 'workspace missing') });
    }

    if (messages.length === 0) {
      return json({ success: true, degraded: true, reply: buildDegradedReply(messages, 'message missing') });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ success: true, degraded: true, reply: buildDegradedReply(messages, 'Unauthorized') });
    }

    const hasAccess = await userHasWorkspaceAccess(admin, workspaceId, user.id);
    if (!hasAccess) {
      return json({
        success: true,
        degraded: true,
        reply: buildDegradedReply(messages, 'Workspace access not linked yet'),
      });
    }

    if (isIdentityQuestion(latestPrompt)) {
      return json({
        success: true,
        reply: buildIdentityReply(body?.modelProfile),
        model: selectedModel,
        usage: null,
      });
    }

    if (!CLAUDE_API_KEY) {
      return json({
        success: true,
        degraded: true,
        reply: buildDegradedReply(messages, 'AI key missing'),
        model: selectedModel,
        usage: null,
      });
    }

    const attachInbox = shouldAttachInboxContext(messages);
    const [knowledge, workspaceRole] = await Promise.all([
      loadKnowledge(admin),
      attachInbox ? resolveWorkspaceRole(admin, workspaceId, user.id) : Promise.resolve<WorkspaceRole>('owner'),
    ]);

    let inboxContext = '';
    if (attachInbox) {
      const snapshot = await buildInboxSnapshot(admin, workspaceId, user.id, workspaceRole, latestPrompt);
      inboxContext = buildInboxContextBlock(snapshot);
    }

    const systemPromptSections = [SYSTEM_PROMPT];
    if (knowledge) {
      systemPromptSections.push(`Workspace knowledge context:\n${knowledge}`);
    }
    if (inboxContext) {
      systemPromptSections.push(inboxContext);
    }
    const systemPrompt = systemPromptSections.join('\n\n');

    const callClaude = async (model: string) => {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: thinkingEnabled ? 1800 : 900,
          temperature: thinkingEnabled ? 0.15 : 0.25,
          system: systemPrompt,
          messages,
        }),
      });

      const raw = await response.text();
      let payload: Record<string, unknown> | null = null;
      try {
        payload = raw ? asRecord(JSON.parse(raw)) : null;
      } catch {
        payload = null;
      }

      return { response, raw, payload, model };
    };

    let attempt = await callClaude(selectedModel);
    if (!attempt.response.ok) {
      const firstReason = readClaudeErrorReason(attempt.payload, attempt.raw);

      if (isModelResolutionError(attempt.response.status, firstReason)) {
        for (const fallbackModel of FALLBACK_CLAUDE_MODELS) {
          if (!fallbackModel || fallbackModel === attempt.model) continue;
          const nextAttempt = await callClaude(fallbackModel);
          if (nextAttempt.response.ok) {
            attempt = nextAttempt;
            break;
          }
        }
      }
    }

    if (!attempt.response.ok) {
      const reason = readClaudeErrorReason(attempt.payload, attempt.raw);
      return json({
        success: true,
        degraded: true,
        reply: buildDegradedReply(messages, reason || 'Claude request failed'),
        model: attempt.model,
        usage: null,
      });
    }

    const reply = extractClaudeText(attempt.payload);
    if (!reply) {
      return json({
        success: true,
        degraded: true,
        reply: buildDegradedReply(messages, 'Empty AI response'),
        model: attempt.model,
        usage: null,
      });
    }

    return json({
      success: true,
      reply,
      model: attempt.model,
      usage: readClaudeUsage(attempt.payload),
    });
  } catch (error: unknown) {
    console.error('dashboard-ai-chat error:', error);
    return json({
      success: true,
      degraded: true,
      reply: buildDegradedReply([], toErrorMessage(error)),
      usage: null,
    });
  }
});
