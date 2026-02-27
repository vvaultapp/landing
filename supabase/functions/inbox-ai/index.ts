import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  getOrCreateAutoPhaseSettings,
  runWorkspaceAutoPhase,
  setAutoPhaseSettings,
  unlockThreadForAutoPhase,
} from '../_shared/auto-phase.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_MODEL = Deno.env.get('CLAUDE_MODEL') || 'claude-3-5-sonnet-20240620';
const KNOWLEDGE_BUCKET = Deno.env.get('AI_KNOWLEDGE_BUCKET') || 'uploads';
const KNOWLEDGE_PATH = Deno.env.get('AI_KNOWLEDGE_PATH') || 'ai/knowledge.txt';
const KNOWLEDGE_MAX_CHARS = Number(Deno.env.get('AI_KNOWLEDGE_MAX_CHARS') || 12000);

const RETAG_BATCH_SIZE = Number(Deno.env.get('INBOX_RETAG_BATCH_SIZE') || 20);
const RETAG_CONCURRENCY = Math.max(1, Number(Deno.env.get('INBOX_RETAG_CONCURRENCY') || 3));

const DASHBOARD_TODO_CACHE_MAX_AGE_MINUTES = Number(
  Deno.env.get('DASHBOARD_TODO_CACHE_MAX_AGE_MINUTES') || 30,
);
const DASHBOARD_TODO_CANDIDATE_LIMIT = Number(Deno.env.get('DASHBOARD_TODO_CANDIDATE_LIMIT') || 18);
const DASHBOARD_TODO_RECENT_MSGS_PER_CONV = Number(
  Deno.env.get('DASHBOARD_TODO_RECENT_MSGS_PER_CONV') || 18,
);
const INBOX_AI_VERSION = '2026-02-24.1';
const SUPPORTED_ACTIONS = [
  'health',
  'auto-phase-config-get',
  'auto-phase-config-set',
  'auto-phase-run-now',
  'auto-phase-unlock-thread',
  'retag-start',
  'retag-step',
  'retag-all',
  'retag-status',
  'summarize-conversation',
  'scan-alerts',
  'resolve-alert',
  'dashboard-todos',
] as const;

type TagRow = {
  id: string;
  name: string;
  prompt: string | null;
};

type RetagJobRow = {
  id: string;
  workspace_id: string;
  requested_by: string;
  tag_id: string | null;
  only_last_30_days: boolean;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress_total: number;
  progress_done: number;
  message: string | null;
};

type DashboardTodoDraft = {
  conversation_id: string;
  title: string;
  subtitle: string;
  icon: string;
};

type DashboardTodoItem = DashboardTodoDraft & {
  peer_username: string | null;
  peer_name: string | null;
  peer_profile_picture_url: string | null;
};

const asString = (v: unknown) => (v == null ? '' : String(v));

function normalizeName(value: string | null | undefined) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function isTemperatureTagName(value: string | null | undefined) {
  const n = normalizeName(value);
  return (
    n === 'hot' ||
    n === 'warm' ||
    n === 'cold' ||
    n === 'hot lead' ||
    n === 'warm lead' ||
    n === 'cold lead'
  );
}

function isExcludedPhaseName(value: string | null | undefined) {
  const n = normalizeName(value);
  return n === 'priority' || n === 'spam';
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

function compactText(value: unknown, maxLen = 140) {
  const s = asString(value).replace(/\s+/g, ' ').trim();
  if (s.length <= maxLen) return s;
  return `${s.slice(0, Math.max(0, maxLen - 1)).trim()}…`;
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

async function callClaude(system: string, userPrompt: string, maxTokens = 900): Promise<any | null> {
  if (!CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY not configured');
  }

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
        temperature: 0,
        system,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (resp.ok) {
      const payload = await resp.json();
      const text = asString(payload?.content?.[0]?.text);
      return parseJsonFromText(text);
    }

    const status = resp.status;
    const raw = await resp.text();
    const retryable = status === 429 || status >= 500;
    if (attempt < maxAttempts && retryable) {
      const delayMs = 250 * attempt;
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }

    throw new Error(`Claude request failed (${status}): ${raw.slice(0, 320)}`);
  }

  return null;
}

function iconForAlertType(alertType: string) {
  const t = asString(alertType).trim();
  if (t === 'no_show_followup') return 'call';
  if (t === 'hot_lead_unreplied') return 'hot';
  if (t === 'qualified_inactive') return 'qualified';
  return 'follow_up';
}

function defaultTitleForIcon(icon: string) {
  const k = asString(icon).trim().toLowerCase();
  if (k === 'call') return 'Reschedule call';
  if (k === 'hot') return 'Follow up hot lead';
  if (k === 'qualified') return 'Follow up qualified';
  return 'Follow up';
}

function isAllowedTodoIcon(icon: string) {
  const k = asString(icon).trim().toLowerCase();
  return k === 'call' || k === 'hot' || k === 'qualified' || k === 'no_show' || k === 'follow_up';
}

type WorkspaceAccess = {
  role: string;
  source: 'workspace_members' | 'portal_roles';
};

function normalizeWorkspaceRole(value: unknown): string {
  const role = asString(value).trim().toLowerCase();
  if (role === 'coach') return 'owner';
  return role;
}

async function resolveWorkspaceAccess(admin: any, workspaceId: string, userId: string): Promise<WorkspaceAccess | null> {
  const { data: memberRows, error: memberError } = await (admin as any)
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .limit(20);

  if (!memberError && Array.isArray(memberRows) && memberRows.length > 0) {
    const normalized = memberRows
      .map((row: any) => normalizeWorkspaceRole(row?.role))
      .filter(Boolean);

    if (normalized.includes('owner')) return { role: 'owner', source: 'workspace_members' };
    if (normalized.includes('setter')) return { role: 'setter', source: 'workspace_members' };

    const first = normalized[0];
    if (first) return { role: first, source: 'workspace_members' };
  }

  const { data: portalRows, error: portalError } = await (admin as any)
    .from('portal_roles')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .neq('role', 'client')
    .limit(20);

  if (!portalError && Array.isArray(portalRows) && portalRows.length > 0) {
    const normalized = portalRows
      .map((row: any) => normalizeWorkspaceRole(row?.role))
      .filter(Boolean);

    if (normalized.includes('owner')) return { role: 'owner', source: 'portal_roles' };
    if (normalized.includes('setter')) return { role: 'setter', source: 'portal_roles' };

    const first = normalized[0];
    if (first) return { role: first, source: 'portal_roles' };
  }

  return null;
}

async function ensureActorCanAccessConversation(
  admin: any,
  workspaceId: string,
  actorUserId: string,
  role: string,
  conversationId: string,
) {
  const r = asString(role).trim();
  if (r === 'owner' || r === 'coach') return;
  if (r === 'setter') {
    const { data, error } = await (admin as any)
      .from('instagram_threads')
      .select('conversation_id,hidden_from_setters,shared_with_setters,assigned_user_id,is_spam,lead_status')
      .eq('workspace_id', workspaceId)
      .eq('conversation_id', conversationId)
      .maybeSingle();

    if (error) throw new Error(error.message || 'Failed to validate thread access');
    if (!data) throw new Error('Forbidden');
    if (Boolean((data as any)?.hidden_from_setters)) throw new Error('Forbidden');

    const assigned = (data as any)?.assigned_user_id ? String((data as any).assigned_user_id) : '';
    if (assigned && assigned === String(actorUserId)) return;
    if (Boolean((data as any)?.shared_with_setters)) return;

    throw new Error('Forbidden');
  }
  throw new Error('Forbidden');
}

async function getThreadMeta(admin: any, workspaceId: string, conversationId: string) {
  const { data } = await (admin as any)
    .from('instagram_threads')
    .select('conversation_id,instagram_account_id,instagram_user_id,last_message_at,summary_text,summary_updated_at,summary_version,lead_status,is_spam,hidden_from_setters')
    .eq('workspace_id', workspaceId)
    .eq('conversation_id', conversationId)
    .maybeSingle();
  return data || null;
}

async function getConversationMessages(
  admin: any,
  workspaceId: string,
  conversationId: string,
  limit = 120,
) {
  const byKey = await (admin as any)
    .from('instagram_messages')
    .select('id,message_id,message_text,direction,message_timestamp,created_at,sender_id,recipient_id,instagram_account_id,instagram_user_id,raw_payload')
    .eq('workspace_id', workspaceId)
    .eq('raw_payload->>conversation_key', conversationId)
    .order('message_timestamp', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (!byKey.error && Array.isArray(byKey.data) && byKey.data.length > 0) {
    return byKey.data;
  }

  const thread = await getThreadMeta(admin, workspaceId, conversationId);
  if (!thread) return [];

  const fallback = await (admin as any)
    .from('instagram_messages')
    .select('id,message_id,message_text,direction,message_timestamp,created_at,sender_id,recipient_id,instagram_account_id,instagram_user_id,raw_payload')
    .eq('workspace_id', workspaceId)
    .eq('instagram_account_id', String(thread.instagram_account_id))
    .or(`sender_id.eq.${String(thread.instagram_user_id)},recipient_id.eq.${String(thread.instagram_user_id)},instagram_user_id.eq.${String(thread.instagram_user_id)}`)
    .order('message_timestamp', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (fallback.error || !Array.isArray(fallback.data)) return [];

  return fallback.data.filter((m: any) => {
    const key = m?.raw_payload?.conversation_key;
    return !key || String(key) === conversationId;
  });
}

function formatTranscript(messages: any[], maxMessages = 60) {
  const sorted = (Array.isArray(messages) ? messages : [])
    .map((m, idx) => ({ m, idx }))
    .sort((a, b) => {
      const ta = toMs(a.m?.message_timestamp || a.m?.created_at || a.m?.raw_payload?.created_time);
      const tb = toMs(b.m?.message_timestamp || b.m?.created_at || b.m?.raw_payload?.created_time);
      if (ta !== tb) return ta - tb;
      return a.idx - b.idx;
    })
    .slice(-maxMessages)
    .map((x) => x.m);

  return sorted
    .map((m) => {
      const dir = asString(m?.direction) === 'outbound' ? 'Setter' : 'Lead';
      const text = asString(
        m?.message_text ?? m?.raw_payload?.message ?? m?.raw_payload?.text ?? ''
      )
        .replace(/\s+/g, ' ')
        .trim();
      const ts = m?.message_timestamp || m?.created_at || m?.raw_payload?.created_time || '';
      return `[${dir}${ts ? ` @ ${ts}` : ''}] ${text || '(no text)'}`;
    })
    .join('\n');
}

function hotLeadFallback(transcript: string) {
  const t = transcript.toLowerCase();
  const indicators = ['price', 'pricing', 'book', 'call', 'available', 'ready', 'start', 'interested'];
  let score = 0;
  for (const k of indicators) if (t.includes(k)) score += 1;
  return score >= 2;
}

async function classifyConversationTags(
  transcript: string,
  tags: TagRow[],
  knowledge: string,
): Promise<string[]> {
  const eligible = tags.filter((t) => Boolean(asString(t.prompt).trim()));
  if (!transcript.trim() || eligible.length === 0) return [];

  try {
    const defaultTagId =
      eligible.find((t) => {
        const n = normalizeName(t.name);
        return n === 'new lead' || n === 'new';
      })?.id || null;

    const system = [
      'You assign EXACTLY ONE phase (tag id) to an Instagram lead conversation.',
      'Return ONLY strict JSON with this shape:',
      '{"tag_id": "uuid" | null}',
      '',
      'Rules:',
      '- Use the tag prompt as the requirements. Do not tag by name alone.',
      '- Only pick from the provided tag IDs.',
      '- If no tag is strongly supported, return the default "New lead" tag_id if provided, otherwise null.',
      '- Be conservative. Do not guess.',
      '',
      defaultTagId ? `Default "New lead" tag_id: ${defaultTagId}` : 'No default tag provided.',
    ].join('\n');

    const userPrompt = `Knowledge:\n${knowledge || 'No additional context provided.'}\n\nTags:\n${JSON.stringify(eligible, null, 2)}\n\nConversation:\n${transcript}`;

    const parsed = await callClaude(system, userPrompt, 450);
    const maybeSingle =
      parsed?.tag_id != null
        ? String(parsed.tag_id)
        : Array.isArray(parsed?.tag_ids) && parsed.tag_ids.length > 0
          ? String(parsed.tag_ids[0])
          : '';
    const valid = new Set(eligible.map((t) => t.id));
    return maybeSingle && valid.has(maybeSingle) ? [maybeSingle] : [];
  } catch {
    // Best-effort fallback: return nothing (manual phases are preserved elsewhere).
    return [];
  }
}

async function writeAudit(admin: any, payload: {
  workspaceId: string;
  conversationId: string;
  action: string;
  actorUserId: string;
  details?: Record<string, unknown>;
}) {
  try {
    await (admin as any).from('instagram_thread_audit_log').insert({
      workspace_id: payload.workspaceId,
      conversation_id: payload.conversationId,
      action: payload.action,
      actor_user_id: payload.actorUserId,
      details: payload.details || {},
    });
  } catch {
    // ignore audit failures
  }
}

async function enforceWeeklyRephaseLimit(
  admin: any,
  workspaceId: string,
  tagId: string | null,
  onlyLast30Days: boolean,
) {
  // Only rate-limit the "Re-Phase Leads" action (all tags, all time).
  if (tagId) return;
  if (onlyLast30Days) return;

  const { data: running } = await (admin as any)
    .from('instagram_retag_jobs')
    .select('id,status,created_at')
    .eq('workspace_id', workspaceId)
    .is('tag_id', null)
    .eq('only_last_30_days', false)
    .in('status', ['queued', 'running'])
    .order('created_at', { ascending: false })
    .limit(1);

  if (Array.isArray(running) && running.length > 0) {
    throw new Error('Re-Phase Leads is already running.');
  }

  const cutoffIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await (admin as any)
    .from('instagram_retag_jobs')
    .select('id,status,created_at,completed_at')
    .eq('workspace_id', workspaceId)
    .is('tag_id', null)
    .eq('only_last_30_days', false)
    .eq('status', 'completed')
    .gte('created_at', cutoffIso)
    .order('created_at', { ascending: false })
    .limit(1);

  if (Array.isArray(recent) && recent.length > 0) {
    const createdAtMs = toMs((recent[0] as any)?.created_at);
    const nextAt = createdAtMs ? new Date(createdAtMs + 7 * 24 * 60 * 60 * 1000) : null;
    throw new Error(
      nextAt
        ? `Re-Phase Leads can only be run once a week. Try again after ${nextAt.toISOString()}.`
        : 'Re-Phase Leads can only be run once a week.',
    );
  }
}

async function createRetagJob(admin: any, workspaceId: string, userId: string, tagId: string | null, onlyLast30Days: boolean) {
  await enforceWeeklyRephaseLimit(admin, workspaceId, tagId, onlyLast30Days);

  const cutoffIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let countQuery = (admin as any)
    .from('instagram_threads')
    .select('conversation_id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .neq('lead_status', 'removed');

  if (onlyLast30Days) {
    countQuery = countQuery.gte('last_message_at', cutoffIso);
  }

  const countRes = await countQuery;
  const total = Number(countRes?.count || 0);

  const { data, error } = await (admin as any)
    .from('instagram_retag_jobs')
    .insert({
      workspace_id: workspaceId,
      requested_by: userId,
      tag_id: tagId,
      only_last_30_days: onlyLast30Days,
      status: total > 0 ? 'running' : 'completed',
      progress_total: total,
      progress_done: 0,
      started_at: total > 0 ? new Date().toISOString() : null,
      completed_at: total === 0 ? new Date().toISOString() : null,
      message: total === 0 ? 'No conversations matched this retag scope.' : 'Retag job started',
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Failed to create retag job');
  return data as RetagJobRow;
}

async function loadRetagTags(admin: any, workspaceId: string, tagId: string | null): Promise<TagRow[]> {
  let q = (admin as any)
    .from('instagram_tags')
    .select('id,name,prompt')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });

  if (tagId) q = q.eq('id', tagId);

  const { data, error } = await q;
  if (error) throw new Error(`Failed to load tags: ${error.message}`);
  const rows = Array.isArray(data) ? data : [];
  return rows
    .map((x: any) => ({
      id: String(x.id),
      name: String(x.name),
      prompt: x.prompt ? String(x.prompt).trim() : null,
    }))
    .filter((t) => t.id && t.name)
    .filter((t) => !isTemperatureTagName(t.name))
    .filter((t) => !isExcludedPhaseName(t.name));
}

async function runRetagStep(admin: any, workspaceId: string, userId: string, jobId: string, knowledge: string, batchSize = RETAG_BATCH_SIZE) {
  const { data: jobRow, error: jobError } = await (admin as any)
    .from('instagram_retag_jobs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('id', jobId)
    .maybeSingle();

  if (jobError || !jobRow) {
    throw new Error('Retag job not found');
  }

  const job = jobRow as RetagJobRow;
  if (job.status === 'completed' || job.status === 'failed') return job;

  const tags = await loadRetagTags(admin, workspaceId, job.tag_id || null);
  if (tags.length === 0) {
    const { data: failed } = await (admin as any)
      .from('instagram_retag_jobs')
      .update({
        status: 'failed',
        error: 'No tags found to evaluate',
        completed_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspaceId)
      .eq('id', job.id)
      .select('*')
      .single();
    return failed as RetagJobRow;
  }

  if ((job.progress_done || 0) >= (job.progress_total || 0)) {
    const { data: completed } = await (admin as any)
      .from('instagram_retag_jobs')
      .update({
        status: 'completed',
        message: 'Retag complete',
        completed_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspaceId)
      .eq('id', job.id)
      .select('*')
      .single();
    return completed as RetagJobRow;
  }

  const cutoffIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let batchQuery = (admin as any)
    .from('instagram_threads')
    .select('conversation_id,last_message_at')
    .eq('workspace_id', workspaceId)
    .neq('lead_status', 'removed')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .range(job.progress_done || 0, (job.progress_done || 0) + batchSize - 1);

  if (job.only_last_30_days) batchQuery = batchQuery.gte('last_message_at', cutoffIso);

  const { data: batchRows, error: batchError } = await batchQuery;
  if (batchError) throw new Error(batchError.message);

  const rows = Array.isArray(batchRows) ? batchRows : [];
  if (rows.length === 0) {
    const { data: completed } = await (admin as any)
      .from('instagram_retag_jobs')
      .update({
        status: 'completed',
        message: 'Retag complete',
        progress_done: job.progress_total,
        completed_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspaceId)
      .eq('id', job.id)
      .select('*')
      .single();
    return completed as RetagJobRow;
  }

  const consideredTagIds = tags.map((t) => t.id);
  const aiTags = tags.filter((t) => Boolean(asString(t.prompt).trim()));
  if (aiTags.length === 0) {
    const { data: failed } = await (admin as any)
      .from('instagram_retag_jobs')
      .update({
        status: 'failed',
        error: 'No phases have requirements (prompt) configured. Add requirements in Settings → Phases and retry.',
        completed_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspaceId)
      .eq('id', job.id)
      .select('*')
      .single();
    return failed as RetagJobRow;
  }

  const conversationIds = rows.map((r: any) => String(r?.conversation_id || '')).filter(Boolean);

  // Detect manual phases (so we never override the user's explicit choices).
  const hasManualPhase: Record<string, boolean> = {};
  try {
    if (conversationIds.length > 0 && consideredTagIds.length > 0) {
      const { data: existingLinks, error: linksError } = await (admin as any)
        .from('instagram_conversation_tags')
        .select('conversation_id,source')
        .eq('workspace_id', workspaceId)
        .in('conversation_id', conversationIds)
        .in('tag_id', consideredTagIds);
      if (!linksError && Array.isArray(existingLinks)) {
        for (const link of existingLinks) {
          const conv = link?.conversation_id ? String(link.conversation_id) : '';
          const source = String(link?.source || '').trim().toLowerCase();
          if (!conv) continue;
          if (source && source !== 'ai' && source !== 'retag') {
            hasManualPhase[conv] = true;
          }
        }
      }
    }
  } catch {
    // If this fails, fall back to applying AI phases (manual phases are still preserved by the delete filter).
  }

  // Clear previous AI phasing for this batch. Manual phases (source=manual) remain untouched.
  if (conversationIds.length > 0 && consideredTagIds.length > 0) {
    await (admin as any)
      .from('instagram_conversation_tags')
      .delete()
      .eq('workspace_id', workspaceId)
      .in('conversation_id', conversationIds)
      .in('tag_id', consideredTagIds)
      .in('source', ['ai', 'retag']);
  }

  const defaultNewLeadId =
    aiTags.find((t) => {
      const n = normalizeName(t.name);
      return n === 'new lead' || n === 'new';
    })?.id || null;

  const targets = conversationIds.filter((id) => !hasManualPhase[id]);

  const mapLimit = async <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> => {
    const out: R[] = new Array(items.length);
    let idx = 0;
    const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
      while (true) {
        const i = idx++;
        if (i >= items.length) return;
        out[i] = await fn(items[i]);
      }
    });
    await Promise.all(workers);
    return out;
  };

  const results = await mapLimit(targets, RETAG_CONCURRENCY, async (conversationId) => {
    try {
      const messages = await getConversationMessages(admin, workspaceId, conversationId, 80);
      const transcript = formatTranscript(messages, 40);
      const matched = await classifyConversationTags(transcript, aiTags, knowledge);
      const tagId = matched[0] || defaultNewLeadId;

      await writeAudit(admin, {
        workspaceId,
        conversationId,
        action: 'retag-evaluated',
        actorUserId: userId,
        details: {
          matched_tag_ids: tagId ? [tagId] : [],
          considered_tag_ids: consideredTagIds,
        },
      });

      return { conversationId, tagId };
    } catch (error: any) {
      const tagId = defaultNewLeadId;
      await writeAudit(admin, {
        workspaceId,
        conversationId,
        action: 'retag-evaluated',
        actorUserId: userId,
        details: {
          matched_tag_ids: tagId ? [tagId] : [],
          considered_tag_ids: consideredTagIds,
          error: error?.message || String(error),
        },
      });
      return { conversationId, tagId };
    }
  });

  // Manual phases are preserved; we just log them so the user can debug what was skipped.
  const skipped = conversationIds.filter((id) => hasManualPhase[id]);
  for (const conversationId of skipped) {
    await writeAudit(admin, {
      workspaceId,
      conversationId,
      action: 'retag-skipped-manual',
      actorUserId: userId,
      details: {
        reason: 'manual phase present',
      },
    });
  }

  const inserts = results
    .filter((r) => Boolean(r.tagId))
    .map((r) => ({
      workspace_id: workspaceId,
      conversation_id: r.conversationId,
      tag_id: String(r.tagId),
      source: 'ai',
      created_by: userId,
    }));

  let applied = 0;
  if (inserts.length > 0) {
    const { error: insertError } = await (admin as any)
      .from('instagram_conversation_tags')
      .upsert(inserts, { onConflict: 'workspace_id,conversation_id,tag_id' });
    if (!insertError) applied = inserts.length;
  }

  const nextDone = (job.progress_done || 0) + rows.length;
  const finished = nextDone >= (job.progress_total || 0);

  const { data: updated, error: updateError } = await (admin as any)
    .from('instagram_retag_jobs')
    .update({
      status: finished ? 'completed' : 'running',
      progress_done: finished ? job.progress_total : nextDone,
      message: finished
        ? `Retag complete. Applied ${applied} tags in final batch.`
        : `Processed ${nextDone}/${job.progress_total} conversations`,
      completed_at: finished ? new Date().toISOString() : null,
      started_at: job.started_at || new Date().toISOString(),
    })
    .eq('workspace_id', workspaceId)
    .eq('id', job.id)
    .select('*')
    .single();

  if (updateError || !updated) throw new Error(updateError?.message || 'Failed to update retag job progress');
  return updated as RetagJobRow;
}

async function summarizeConversation(
  admin: any,
  workspaceId: string,
  conversationId: string,
  actorUserId: string,
  forceRefresh: boolean,
  knowledge: string,
) {
  const thread = await getThreadMeta(admin, workspaceId, conversationId);
  if (!thread) throw new Error('Conversation not found');
  if ((thread as any)?.is_spam) throw new Error('Conversation not found');
  if (asString((thread as any)?.lead_status || 'open') === 'removed') throw new Error('Conversation not found');

  const lastSummaryAtMs = toMs(thread.summary_updated_at);
  if (!forceRefresh && thread.summary_text && lastSummaryAtMs && (Date.now() - lastSummaryAtMs) < 60_000) {
    return {
      summary: String(thread.summary_text),
      cached: true,
      updatedAt: thread.summary_updated_at,
    };
  }

  const messages = await getConversationMessages(admin, workspaceId, conversationId, 140);
  const transcript = formatTranscript(messages, 60);

  const system = `You summarize Instagram lead conversations for setters.\nReturn ONLY strict JSON:\n{\n  "summary": "short paragraph",\n  "key_points": ["..."],\n  "recommended_action": "single concrete next step"\n}`;

  const userPrompt = `Knowledge:\n${knowledge || 'No additional context provided.'}\n\nConversation:\n${transcript || 'No messages available.'}`;

  let parsed: any | null = null;
  try {
    parsed = await callClaude(system, userPrompt, 750);
  } catch (error) {
    console.warn('summarizeConversation Claude fallback:', error);
  }

  const summary = asString(parsed?.summary).trim();
  const keyPoints = Array.isArray(parsed?.key_points)
    ? parsed.key_points.map((x: any) => asString(x).trim()).filter(Boolean)
    : [];
  const recommendedAction = asString(parsed?.recommended_action).trim();

  const transcriptLines = (transcript || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const lastLines = transcriptLines.slice(-3);
  const lastLine = lastLines[lastLines.length - 1] || '';
  const fallbackSummary = transcriptLines.length > 0
    ? `Conversation has ${transcriptLines.length} recent messages. Latest: ${lastLine.replace(/^\[[^\]]+\]\s*/, '').slice(0, 180)}`
    : 'No messages available yet.';
  const fallbackKeyPoints = transcriptLines.length > 0
    ? [`Recent messages: ${Math.min(transcriptLines.length, 60)}`, ...lastLines.map((line) => line.replace(/^\[[^\]]+\]\s*/, '').slice(0, 120))]
    : [];
  const fallbackRecommendedAction = /\[lead/i.test(lastLine)
    ? 'Reply to the latest inbound message with a specific next step.'
    : 'Send a concise follow-up to move the lead to the next step.';

  const summaryText = [
    summary || fallbackSummary,
    (keyPoints.length ? keyPoints : fallbackKeyPoints).length
      ? `Key points: ${(keyPoints.length ? keyPoints : fallbackKeyPoints).join(' | ')}`
      : '',
    `Recommended action: ${recommendedAction || fallbackRecommendedAction}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const nextVersion = Number(thread.summary_version || 0) + 1;
  const updatedAt = new Date().toISOString();

  const { error: updateError } = await (admin as any)
    .from('instagram_threads')
    .update({
      summary_text: summaryText,
      summary_updated_at: updatedAt,
      summary_version: nextVersion,
    })
    .eq('workspace_id', workspaceId)
    .eq('conversation_id', conversationId);

  if (updateError) throw new Error(updateError.message);

  await writeAudit(admin, {
    workspaceId,
    conversationId,
    action: 'summarize',
    actorUserId,
    details: { summary_version: nextVersion },
  });

  return {
    summary: summaryText,
    cached: false,
    updatedAt,
  };
}

async function openOrUpdateAlert(admin: any, payload: {
  workspaceId: string;
  conversationId: string;
  alertType: 'hot_lead_unreplied' | 'qualified_inactive' | 'no_show_followup';
  assignedUserId?: string | null;
  overdueMinutes: number;
  recommendedAction: string;
  details?: Record<string, unknown>;
}) {
  const { data: existing } = await (admin as any)
    .from('instagram_alerts')
    .select('id')
    .eq('workspace_id', payload.workspaceId)
    .eq('conversation_id', payload.conversationId)
    .eq('alert_type', payload.alertType)
    .eq('status', 'open')
    .maybeSingle();

  if (existing?.id) {
    await (admin as any)
      .from('instagram_alerts')
      .update({
        assigned_user_id: payload.assignedUserId || null,
        overdue_minutes: payload.overdueMinutes,
        recommended_action: payload.recommendedAction,
        details: payload.details || {},
      })
      .eq('id', existing.id);
    return { created: false };
  }

  await (admin as any)
    .from('instagram_alerts')
    .insert({
      workspace_id: payload.workspaceId,
      conversation_id: payload.conversationId,
      alert_type: payload.alertType,
      status: 'open',
      assigned_user_id: payload.assignedUserId || null,
      overdue_minutes: payload.overdueMinutes,
      recommended_action: payload.recommendedAction,
      details: payload.details || {},
    });
  return { created: true };
}

async function resolveNonActiveAlerts(
  admin: any,
  workspaceId: string,
  alertType: 'hot_lead_unreplied' | 'qualified_inactive' | 'no_show_followup',
  activeConversationIds: Set<string>,
  resolverUserId: string,
) {
  const { data: openRows } = await (admin as any)
    .from('instagram_alerts')
    .select('id,conversation_id')
    .eq('workspace_id', workspaceId)
    .eq('alert_type', alertType)
    .eq('status', 'open');

  const rows = Array.isArray(openRows) ? openRows : [];
  const toResolve = rows
    .filter((row: any) => !activeConversationIds.has(String(row.conversation_id)))
    .map((row: any) => String(row.id));

  if (toResolve.length === 0) return 0;

  await (admin as any)
    .from('instagram_alerts')
    .update({
      status: 'resolved',
      resolved_by: resolverUserId,
      resolved_at: new Date().toISOString(),
    })
    .in('id', toResolve);

  return toResolve.length;
}

async function scanAlerts(admin: any, workspaceId: string, userId: string, opts?: {
  hotLeadHours?: number;
  qualifiedInactiveHours?: number;
  noShowHours?: number;
}) {
  const now = Date.now();
  const hotLeadMs = Math.max(1, Number(opts?.hotLeadHours || 4)) * 60 * 60 * 1000;
  const qualifiedMs = Math.max(1, Number(opts?.qualifiedInactiveHours || 24)) * 60 * 60 * 1000;
  const noShowMs = Math.max(1, Number(opts?.noShowHours || 12)) * 60 * 60 * 1000;

  let opened = 0;
  let resolved = 0;

  // Hot lead not replied > X hours.
  const { data: hotTags } = await (admin as any)
    .from('instagram_tags')
    .select('id')
    .eq('workspace_id', workspaceId)
    .ilike('name', 'hot lead');

  const hotTagIds = (Array.isArray(hotTags) ? hotTags : []).map((x: any) => String(x.id));
  const activeHot = new Set<string>();

  if (hotTagIds.length > 0) {
    const { data: hotLinks } = await (admin as any)
      .from('instagram_conversation_tags')
      .select('conversation_id')
      .eq('workspace_id', workspaceId)
      .in('tag_id', hotTagIds);

    const hotConvIds = Array.from(new Set((Array.isArray(hotLinks) ? hotLinks : []).map((x: any) => String(x.conversation_id))));

    if (hotConvIds.length > 0) {
      const { data: hotThreads } = await (admin as any)
        .from('instagram_threads')
        .select('conversation_id,assigned_user_id,last_inbound_at,last_outbound_at,last_message_at,lead_status,is_spam,hidden_from_setters')
        .eq('workspace_id', workspaceId)
        .in('conversation_id', hotConvIds);

      for (const row of Array.isArray(hotThreads) ? hotThreads : []) {
        const conversationId = String(row.conversation_id);
        const status = asString(row.lead_status || 'open');
        if (row?.is_spam) continue;
        if (row?.hidden_from_setters) continue;
        if (status === 'removed') continue;

        const inboundMs = Math.max(toMs(row.last_inbound_at), toMs(row.last_message_at));
        const outboundMs = toMs(row.last_outbound_at);

        if (!inboundMs) continue;
        if (inboundMs <= outboundMs) continue;
        if (now - inboundMs < hotLeadMs) continue;

        activeHot.add(conversationId);
        const overdueMinutes = Math.floor((now - inboundMs) / 60000);
        const result = await openOrUpdateAlert(admin, {
          workspaceId,
          conversationId,
          alertType: 'hot_lead_unreplied',
          assignedUserId: row.assigned_user_id ? String(row.assigned_user_id) : null,
          overdueMinutes,
          recommendedAction: 'Reply now or reassign this Hot Lead to an active setter.',
          details: { rule: 'hot_lead_unreplied', threshold_hours: hotLeadMs / 3600000 },
        });
        if (result.created) opened += 1;
      }
    }
  }

  resolved += await resolveNonActiveAlerts(admin, workspaceId, 'hot_lead_unreplied', activeHot, userId);

  // Qualified inactive > X hours.
  const { data: qualifiedRows } = await (admin as any)
    .from('instagram_threads')
    .select('conversation_id,assigned_user_id,last_inbound_at,last_outbound_at,last_message_at,lead_status,is_spam,hidden_from_setters')
    .eq('workspace_id', workspaceId)
    .eq('lead_status', 'qualified');

  const activeQualified = new Set<string>();
  for (const row of Array.isArray(qualifiedRows) ? qualifiedRows : []) {
    const conversationId = String(row.conversation_id);
    if (row?.is_spam) continue;
    if (row?.hidden_from_setters) continue;
    const lastMs = Math.max(toMs(row.last_inbound_at), toMs(row.last_outbound_at), toMs(row.last_message_at));
    if (!lastMs) continue;
    if (now - lastMs < qualifiedMs) continue;

    activeQualified.add(conversationId);
    const overdueMinutes = Math.floor((now - lastMs) / 60000);
    const result = await openOrUpdateAlert(admin, {
      workspaceId,
      conversationId,
      alertType: 'qualified_inactive',
      assignedUserId: row.assigned_user_id ? String(row.assigned_user_id) : null,
      overdueMinutes,
      recommendedAction: 'Qualified lead is inactive. Send a follow-up and update next step.',
      details: { rule: 'qualified_inactive', threshold_hours: qualifiedMs / 3600000 },
    });
    if (result.created) opened += 1;
  }

  resolved += await resolveNonActiveAlerts(admin, workspaceId, 'qualified_inactive', activeQualified, userId);

  // No-show follow-up > Y hours (event-driven via audit actions).
  const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: noShowAuditRows } = await (admin as any)
    .from('instagram_thread_audit_log')
    .select('conversation_id,action,created_at')
    .eq('workspace_id', workspaceId)
    .in('action', ['meeting_no_show', 'follow_up_done'])
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: true });

  const latestNoShowByConv = new Map<string, number>();
  const latestFollowByConv = new Map<string, number>();

  for (const row of Array.isArray(noShowAuditRows) ? noShowAuditRows : []) {
    const conversationId = asString(row.conversation_id);
    if (!conversationId) continue;
    const ts = toMs(row.created_at);
    if (!ts) continue;

    if (row.action === 'meeting_no_show') {
      latestNoShowByConv.set(conversationId, ts);
    } else if (row.action === 'follow_up_done') {
      latestFollowByConv.set(conversationId, ts);
    }
  }

  const activeNoShow = new Set<string>();
  for (const [conversationId, noShowTs] of latestNoShowByConv.entries()) {
    if (now - noShowTs < noShowMs) continue;
    const followTs = latestFollowByConv.get(conversationId) || 0;
    if (followTs >= noShowTs) continue;

    activeNoShow.add(conversationId);
    const overdueMinutes = Math.floor((now - noShowTs) / 60000);

    const { data: thread } = await (admin as any)
      .from('instagram_threads')
      .select('assigned_user_id,is_spam,hidden_from_setters,lead_status')
      .eq('workspace_id', workspaceId)
      .eq('conversation_id', conversationId)
      .maybeSingle();
    if ((thread as any)?.is_spam) continue;
    if ((thread as any)?.hidden_from_setters) continue;
    if (asString((thread as any)?.lead_status || 'open') === 'removed') continue;

    const result = await openOrUpdateAlert(admin, {
      workspaceId,
      conversationId,
      alertType: 'no_show_followup',
      assignedUserId: thread?.assigned_user_id ? String(thread.assigned_user_id) : null,
      overdueMinutes,
      recommendedAction: 'No-show detected. Send reschedule follow-up immediately.',
      details: { rule: 'no_show_followup', threshold_hours: noShowMs / 3600000 },
    });
    if (result.created) opened += 1;
  }

  resolved += await resolveNonActiveAlerts(admin, workspaceId, 'no_show_followup', activeNoShow, userId);

  return { opened, resolved };
}

async function generateDashboardTodos(
  admin: any,
  workspaceId: string,
  knowledge: string,
  sinceIso: string | null,
) {
  type Candidate = {
    conversation_id: string;
    peer_username: string | null;
    peer_name: string | null;
    peer_profile_picture_url: string | null;
    lead_status: string;
    priority: boolean;
    last_message_at: string | null;
    last_message_direction: string | null;
    last_message_text: string | null;
    last_inbound_at: string | null;
    last_outbound_at: string | null;
    summary_text: string | null;
    alert_type: string | null;
    alert_recommended_action: string | null;
    alert_overdue_minutes: number | null;
  };

  const now = Date.now();
  const cacheTtlMs = Math.max(1, DASHBOARD_TODO_CACHE_MAX_AGE_MINUTES) * 60_000;

  // Best-effort cache read (missing table should not break dashboard).
  try {
    const { data: cacheRow, error: cacheError } = await (admin as any)
      .from('instagram_dashboard_todos_cache')
      .select('tasks_json,generated_at')
      .eq('workspace_id', workspaceId)
      .maybeSingle();
    if (!cacheError && cacheRow) {
      const ageMs = now - toMs(cacheRow.generated_at);
      const raw = cacheRow.tasks_json;
      if (ageMs >= 0 && ageMs < cacheTtlMs && Array.isArray(raw) && raw.length > 0) {
        const drafts: DashboardTodoDraft[] = raw
          .map((t: any) => ({
            conversation_id: asString(t?.conversation_id),
            icon: asString(t?.icon),
            title: asString(t?.title),
            subtitle: asString(t?.subtitle),
          }))
          .filter((t) => t.conversation_id && t.title && isAllowedTodoIcon(t.icon))
          .slice(0, 6);
        if (drafts.length > 0) {
          const ids = drafts.map((d) => d.conversation_id);
          const { data: threadMetaRows } = await (admin as any)
            .from('instagram_threads')
            .select(
              'conversation_id,peer_username,peer_name,peer_profile_picture_url,last_message_at,created_at',
            )
            .eq('workspace_id', workspaceId)
            .in('conversation_id', ids);

          const metaByConv = new Map<
            string,
            { peer_username: string | null; peer_name: string | null; peer_profile_picture_url: string | null; last_ts: number }
          >();

          for (const row of Array.isArray(threadMetaRows) ? threadMetaRows : []) {
            const conversationId = asString(row?.conversation_id);
            if (!conversationId) continue;
            metaByConv.set(conversationId, {
              peer_username: row?.peer_username != null ? asString(row.peer_username) : null,
              peer_name: row?.peer_name != null ? asString(row.peer_name) : null,
              peer_profile_picture_url:
                row?.peer_profile_picture_url != null ? asString(row.peer_profile_picture_url) : null,
              last_ts: Math.max(toMs(row?.last_message_at), toMs(row?.created_at)),
            });
          }

          let result: DashboardTodoItem[] = drafts.map((d) => {
            const meta = metaByConv.get(d.conversation_id);
            return {
              ...d,
              peer_username: meta?.peer_username || null,
              peer_name: meta?.peer_name || null,
              peer_profile_picture_url: meta?.peer_profile_picture_url || null,
            };
          });

          const sinceMs = toMs(sinceIso);
          if (sinceMs) {
            const filtered = result.filter((t) => (metaByConv.get(t.conversation_id)?.last_ts || 0) >= sinceMs);
            if (filtered.length > 0) result = filtered;
          }

          return result;
        }
      }
    }
  } catch {
    // ignore cache failures
  }

  // -------------------------------------------------------
  // Build a candidate set of conversations for Claude to scan.
  // -------------------------------------------------------
  const candidates: Candidate[] = [];
  const picked = new Set<string>();

  const pushCandidate = (c: Candidate | null) => {
    if (!c) return;
    if (!c.conversation_id) return;
    if (picked.has(c.conversation_id)) return;
    if (c.lead_status === 'removed') return;
    picked.add(c.conversation_id);
    candidates.push(c);
  };

  // Start with open alerts (most urgent).
  const { data: alertRows } = await (admin as any)
    .from('instagram_alerts')
    .select('conversation_id,alert_type,overdue_minutes,recommended_action,created_at')
    .eq('workspace_id', workspaceId)
    .eq('status', 'open')
    .order('overdue_minutes', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20);

  const alertConvIds = Array.from(
    new Set(
      (Array.isArray(alertRows) ? alertRows : [])
        .map((x: any) => asString(x?.conversation_id))
        .filter(Boolean),
    ),
  );

  const alertByConv = new Map<
    string,
    { alert_type: string; alert_overdue_minutes: number | null; alert_recommended_action: string | null }
  >();
  for (const row of Array.isArray(alertRows) ? alertRows : []) {
    const conv = asString(row?.conversation_id);
    if (!conv || alertByConv.has(conv)) continue;
    alertByConv.set(conv, {
      alert_type: asString(row?.alert_type),
      alert_overdue_minutes: row?.overdue_minutes != null ? Number(row.overdue_minutes) : null,
      alert_recommended_action: row?.recommended_action != null ? asString(row.recommended_action) : null,
    });
  }

  if (alertConvIds.length > 0) {
    const { data: rows } = await (admin as any)
      .from('instagram_threads')
      .select(
        'conversation_id,peer_username,peer_name,peer_profile_picture_url,lead_status,priority,last_message_at,last_message_direction,last_message_text,last_inbound_at,last_outbound_at,summary_text,is_spam,hidden_from_setters',
      )
      .eq('workspace_id', workspaceId)
      .in('conversation_id', alertConvIds);

    for (const r of Array.isArray(rows) ? rows : []) {
      const conversationId = asString(r?.conversation_id);
      if (!conversationId) continue;
      if (r?.is_spam) continue;
      if (r?.hidden_from_setters) continue;
      const status = asString(r?.lead_status || 'open');
      if (status === 'removed') continue;

      const a = alertByConv.get(conversationId);
      pushCandidate({
        conversation_id: conversationId,
        peer_username: r?.peer_username != null ? asString(r.peer_username) : null,
        peer_name: r?.peer_name != null ? asString(r.peer_name) : null,
        peer_profile_picture_url:
          r?.peer_profile_picture_url != null ? asString(r.peer_profile_picture_url) : null,
        lead_status: status,
        priority: Boolean(r?.priority),
        last_message_at: r?.last_message_at != null ? asString(r.last_message_at) : null,
        last_message_direction: r?.last_message_direction != null ? asString(r.last_message_direction) : null,
        last_message_text: r?.last_message_text != null ? asString(r.last_message_text) : null,
        last_inbound_at: r?.last_inbound_at != null ? asString(r.last_inbound_at) : null,
        last_outbound_at: r?.last_outbound_at != null ? asString(r.last_outbound_at) : null,
        summary_text: r?.summary_text != null ? asString(r.summary_text) : null,
        alert_type: a?.alert_type || null,
        alert_recommended_action: a?.alert_recommended_action || null,
        alert_overdue_minutes: a?.alert_overdue_minutes || null,
      });
    }
  }

  // Then: recent unreplied inbound (likely needs a response).
  if (candidates.length < DASHBOARD_TODO_CANDIDATE_LIMIT) {
    const sinceRecentIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: rows } = await (admin as any)
      .from('instagram_threads')
      .select(
        'conversation_id,peer_username,peer_name,peer_profile_picture_url,lead_status,priority,last_message_at,last_message_direction,last_message_text,last_inbound_at,last_outbound_at,summary_text,is_spam,hidden_from_setters',
      )
      .eq('workspace_id', workspaceId)
      .gte('last_inbound_at', sinceRecentIso)
      .order('last_inbound_at', { ascending: false })
      .limit(80);

    for (const r of Array.isArray(rows) ? rows : []) {
      if (candidates.length >= DASHBOARD_TODO_CANDIDATE_LIMIT) break;
      const conversationId = asString(r?.conversation_id);
      if (!conversationId) continue;
      if (picked.has(conversationId)) continue;
      if (r?.is_spam) continue;
      if (r?.hidden_from_setters) continue;
      const status = asString(r?.lead_status || 'open');
      if (status === 'removed') continue;

      const inboundMs = toMs(r?.last_inbound_at);
      const outboundMs = toMs(r?.last_outbound_at);
      if (!inboundMs || inboundMs <= outboundMs) continue;

      pushCandidate({
        conversation_id: conversationId,
        peer_username: r?.peer_username != null ? asString(r.peer_username) : null,
        peer_name: r?.peer_name != null ? asString(r.peer_name) : null,
        peer_profile_picture_url:
          r?.peer_profile_picture_url != null ? asString(r.peer_profile_picture_url) : null,
        lead_status: status,
        priority: Boolean(r?.priority),
        last_message_at: r?.last_message_at != null ? asString(r.last_message_at) : null,
        last_message_direction: r?.last_message_direction != null ? asString(r.last_message_direction) : null,
        last_message_text: r?.last_message_text != null ? asString(r.last_message_text) : null,
        last_inbound_at: r?.last_inbound_at != null ? asString(r.last_inbound_at) : null,
        last_outbound_at: r?.last_outbound_at != null ? asString(r.last_outbound_at) : null,
        summary_text: r?.summary_text != null ? asString(r.summary_text) : null,
        alert_type: null,
        alert_recommended_action: null,
        alert_overdue_minutes: null,
      });
    }
  }

  // Fill remaining with recent activity (gives Claude broader context).
  if (candidates.length < DASHBOARD_TODO_CANDIDATE_LIMIT) {
    const { data: rows } = await (admin as any)
      .from('instagram_threads')
      .select(
        'conversation_id,peer_username,peer_name,peer_profile_picture_url,lead_status,priority,last_message_at,last_message_direction,last_message_text,last_inbound_at,last_outbound_at,summary_text,is_spam,hidden_from_setters',
      )
      .eq('workspace_id', workspaceId)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(120);

    for (const r of Array.isArray(rows) ? rows : []) {
      if (candidates.length >= DASHBOARD_TODO_CANDIDATE_LIMIT) break;
      const conversationId = asString(r?.conversation_id);
      if (!conversationId) continue;
      if (picked.has(conversationId)) continue;
      if (r?.is_spam) continue;
      if (r?.hidden_from_setters) continue;
      const status = asString(r?.lead_status || 'open');
      if (status === 'removed') continue;

      pushCandidate({
        conversation_id: conversationId,
        peer_username: r?.peer_username != null ? asString(r.peer_username) : null,
        peer_name: r?.peer_name != null ? asString(r.peer_name) : null,
        peer_profile_picture_url:
          r?.peer_profile_picture_url != null ? asString(r.peer_profile_picture_url) : null,
        lead_status: status,
        priority: Boolean(r?.priority),
        last_message_at: r?.last_message_at != null ? asString(r.last_message_at) : null,
        last_message_direction: r?.last_message_direction != null ? asString(r.last_message_direction) : null,
        last_message_text: r?.last_message_text != null ? asString(r.last_message_text) : null,
        last_inbound_at: r?.last_inbound_at != null ? asString(r.last_inbound_at) : null,
        last_outbound_at: r?.last_outbound_at != null ? asString(r.last_outbound_at) : null,
        summary_text: r?.summary_text != null ? asString(r.summary_text) : null,
        alert_type: null,
        alert_recommended_action: null,
        alert_overdue_minutes: null,
      });
    }
  }

  if (candidates.length === 0) return [];

  // -------------------------------------------------------
  // Fetch recent messages for each candidate and ask Claude
  // to produce a prioritized, content-grounded to-do list.
  // -------------------------------------------------------
  const clampMessage = (text: string) => compactText(text, 260);

  const enrich = async (c: Candidate) => {
    const msgs = await getConversationMessages(admin, workspaceId, c.conversation_id, 160);
    const recent = (Array.isArray(msgs) ? msgs : [])
      .map((m, idx) => ({ m, idx }))
      .sort((a, b) => {
        const ta = toMs(a.m?.message_timestamp || a.m?.created_at || a.m?.raw_payload?.created_time);
        const tb = toMs(b.m?.message_timestamp || b.m?.created_at || b.m?.raw_payload?.created_time);
        if (ta !== tb) return ta - tb;
        return a.idx - b.idx;
      })
      .slice(-Math.max(1, DASHBOARD_TODO_RECENT_MSGS_PER_CONV))
      .map((x) => x.m)
      .map((m) => {
        const dir = asString(m?.direction) === 'outbound' ? 'you' : 'lead';
        const text = asString(m?.message_text ?? m?.raw_payload?.message ?? m?.raw_payload?.text ?? '')
          .replace(/\s+/g, ' ')
          .trim();
        return { from: dir, text: clampMessage(text || '(no text)') };
      })
      .filter((m) => m.text && m.text !== '(no text)');

    return {
      conversation_id: c.conversation_id,
      peer_username: c.peer_username,
      peer_name: c.peer_name,
      lead_status: c.lead_status,
      priority: c.priority,
      alert: c.alert_type
        ? {
            type: c.alert_type,
            overdue_minutes: c.alert_overdue_minutes,
            recommended_action: c.alert_recommended_action,
          }
        : null,
      last_message: {
        at: c.last_message_at,
        direction: c.last_message_direction,
        text: compactText(c.last_message_text || '', 220),
      },
      summary_text: compactText(c.summary_text || '', 600),
      recent_messages: recent,
    };
  };

  const toEnriched: any[] = [];
  const concurrency = 4;
  for (let i = 0; i < candidates.length; i += concurrency) {
    const batch = candidates.slice(i, i + concurrency);
    const done = await Promise.all(batch.map((c) => enrich(c)));
    toEnriched.push(...done);
  }

  const system = [
    'You generate an owner dashboard "Urgent Tasks" list from multiple Instagram DM conversations.',
    'Return ONLY strict JSON with this shape:',
    '{"tasks":[{"conversation_id":"...","icon":"follow_up|hot|qualified|call|no_show","title":"...","subtitle":"..."}]}',
    '',
    'Rules:',
    '- Produce up to 6 tasks, highest impact first.',
    '- Each task MUST reference a conversation_id from the input.',
    '- Ground every task in the conversation content. Subtitle should reference the lead question/objection/next step.',
    '- No emojis.',
    '- Titles: 2-6 words, action-oriented, no ending punctuation.',
    '- Subtitles: concise (8-18 words).',
    '- Do not invent facts. If missing, make the task be to ask ONE clear question.',
    '',
    'Icon guide:',
    '- call: reschedule/no-show/booking a call',
    '- hot: strong buying intent or pricing/availability discussion',
    '- qualified: clearly qualified but stalled',
    '- no_show: explicit no-show follow-up',
    '- follow_up: default',
  ].join('\n');

  const userPrompt = [
    `Knowledge:\n${knowledge || 'No additional context provided.'}`,
    '',
    'Inbox snapshot (recent messages are most relevant; most recent message is last):',
    JSON.stringify(toEnriched, null, 2),
  ].join('\n');

  const candidateIds = new Set(candidates.map((c) => c.conversation_id));
  const drafts: DashboardTodoDraft[] = [];
  const seen = new Set<string>();

  try {
    const parsed = await callClaude(system, userPrompt, 900);
    const out = Array.isArray(parsed?.tasks) ? parsed.tasks : [];

    for (const t of out) {
      const conversationId = asString(t?.conversation_id);
      if (!conversationId || !candidateIds.has(conversationId) || seen.has(conversationId)) continue;
      const icon = asString(t?.icon || 'follow_up').trim().toLowerCase();
      if (!isAllowedTodoIcon(icon)) continue;
      const title = compactText(t?.title || defaultTitleForIcon(icon), 44);
      const subtitle = compactText(t?.subtitle || '', 140);
      if (!title) continue;
      seen.add(conversationId);
      drafts.push({
        conversation_id: conversationId,
        icon,
        title,
        subtitle: subtitle || 'Open the conversation and take the next step.',
      });
      if (drafts.length >= 6) break;
    }
  } catch (e) {
    console.warn('dashboard-todos Claude failure:', e);
  }

  // Deterministic fallback if Claude returns nothing (keep dashboard usable).
  if (drafts.length === 0) {
    for (const c of candidates) {
      if (drafts.length >= 6) break;
      const icon = c.alert_type ? iconForAlertType(c.alert_type) : 'follow_up';
      drafts.push({
        conversation_id: c.conversation_id,
        icon,
        title: defaultTitleForIcon(icon),
        subtitle:
          compactText(c.alert_recommended_action || '', 140) ||
          (c.last_message_direction === 'inbound' ? 'New inbound message waiting.' : 'Follow up to move the lead forward.'),
      });
    }
  }

  // Best-effort cache write.
  try {
    await (admin as any)
      .from('instagram_dashboard_todos_cache')
      .upsert(
        {
          workspace_id: workspaceId,
          tasks_json: drafts,
          generated_at: new Date().toISOString(),
          model: CLAUDE_MODEL,
          version: 2,
        },
        { onConflict: 'workspace_id' },
      );
  } catch {
    // ignore
  }

  const ids = drafts.map((d) => d.conversation_id).filter(Boolean);
  if (ids.length === 0) return [];

  const { data: threadMetaRows } = await (admin as any)
    .from('instagram_threads')
    .select('conversation_id,peer_username,peer_name,peer_profile_picture_url,last_message_at,created_at')
    .eq('workspace_id', workspaceId)
    .in('conversation_id', ids);

  const metaByConv = new Map<
    string,
    { peer_username: string | null; peer_name: string | null; peer_profile_picture_url: string | null; last_ts: number }
  >();

  for (const row of Array.isArray(threadMetaRows) ? threadMetaRows : []) {
    const conversationId = asString(row?.conversation_id);
    if (!conversationId) continue;
    metaByConv.set(conversationId, {
      peer_username: row?.peer_username != null ? asString(row.peer_username) : null,
      peer_name: row?.peer_name != null ? asString(row.peer_name) : null,
      peer_profile_picture_url: row?.peer_profile_picture_url != null ? asString(row.peer_profile_picture_url) : null,
      last_ts: Math.max(toMs(row?.last_message_at), toMs(row?.created_at)),
    });
  }

  let result: DashboardTodoItem[] = drafts.map((d) => {
    const meta = metaByConv.get(d.conversation_id);
    return {
      ...d,
      peer_username: meta?.peer_username || null,
      peer_name: meta?.peer_name || null,
      peer_profile_picture_url: meta?.peer_profile_picture_url || null,
    };
  });

  const sinceMs = toMs(sinceIso);
  if (sinceMs) {
    const filtered = result.filter((t) => (metaByConv.get(t.conversation_id)?.last_ts || 0) >= sinceMs);
    if (filtered.length > 0) result = filtered;
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const user = authData.user;
    const body = await req.json();
    const action = asString(body?.action);

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'health') {
      return new Response(
        JSON.stringify({
          success: true,
          version: INBOX_AI_VERSION,
          supported_actions: SUPPORTED_ACTIONS,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const workspaceId = asString(body?.workspaceId).trim();
    if (!workspaceId) {
      return new Response(JSON.stringify({ error: 'Missing workspaceId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const access = await resolveWorkspaceAccess(admin, workspaceId, user.id);
    if (!access) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const role = normalizeWorkspaceRole(access.role);

    if (action === 'auto-phase-config-get') {
      if (role !== 'owner' && role !== 'setter') {
        return new Response(JSON.stringify({ error: 'Only owners and setters can view auto-phasing settings' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const config = await getOrCreateAutoPhaseSettings(admin, workspaceId);
      return new Response(JSON.stringify({ success: true, config }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'auto-phase-config-set') {
      if (role !== 'owner' && role !== 'setter') {
        return new Response(JSON.stringify({ error: 'Only owners and setters can update auto-phasing settings' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const configPatch = body?.configPatch && typeof body.configPatch === 'object' ? body.configPatch : {};
      const config = await setAutoPhaseSettings(admin, workspaceId, configPatch as Record<string, unknown>);
      return new Response(JSON.stringify({ success: true, config }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'auto-phase-run-now') {
      if (role !== 'owner' && role !== 'setter') {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const summary = await runWorkspaceAutoPhase(admin, {
        workspaceId,
        source: 'incremental',
        actorUserId: user.id,
        actorRole: role,
      });
      const config = await getOrCreateAutoPhaseSettings(admin, workspaceId);
      return new Response(JSON.stringify({ success: true, summary, config }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'auto-phase-unlock-thread') {
      const conversationId = asString(body?.conversationId);
      if (!conversationId) {
        return new Response(JSON.stringify({ error: 'Missing conversationId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (role !== 'owner' && role !== 'setter') {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await ensureActorCanAccessConversation(admin, workspaceId, user.id, role, conversationId);
      const summary = await unlockThreadForAutoPhase(admin, {
        workspaceId,
        conversationId,
        actorUserId: user.id,
        actorRole: role,
      });
      return new Response(JSON.stringify({ success: true, summary }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'retag-start') {
      const tagId = body?.tagId ? String(body.tagId) : null;
      const onlyLast30Days = Boolean(body?.onlyLast30Days);
      try {
        const job = await createRetagJob(admin, workspaceId, user.id, tagId, onlyLast30Days);
        return new Response(JSON.stringify({ success: true, job }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error: any) {
        // Return 200 so the client can read `error` instead of surfacing a generic non-2xx toast.
        return new Response(
          JSON.stringify({ success: false, error: error?.message || 'Failed to start re-phase job' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    if (action === 'retag-step') {
      const jobId = asString(body?.jobId);
      if (!jobId) {
        return new Response(JSON.stringify({ error: 'Missing jobId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      try {
        const knowledge = await loadKnowledge(admin);
        const job = await runRetagStep(admin, workspaceId, user.id, jobId, knowledge);
        return new Response(JSON.stringify({ success: true, job }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error: any) {
        return new Response(
          JSON.stringify({ success: false, error: error?.message || 'Re-phase step failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    if (action === 'retag-all') {
      const tagId = body?.tagId ? String(body.tagId) : null;
      const onlyLast30Days = Boolean(body?.onlyLast30Days);
      let job = await createRetagJob(admin, workspaceId, user.id, tagId, onlyLast30Days);
      const knowledge = await loadKnowledge(admin);

      let guard = 0;
      while (job.status === 'running' && guard < 200) {
        job = await runRetagStep(admin, workspaceId, user.id, job.id, knowledge);
        guard += 1;
      }

      return new Response(JSON.stringify({ success: true, job, rounds: guard }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'retag-status') {
      const jobId = asString(body?.jobId);
      if (!jobId) {
        return new Response(JSON.stringify({ error: 'Missing jobId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: job } = await (admin as any)
        .from('instagram_retag_jobs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('id', jobId)
        .maybeSingle();

      return new Response(JSON.stringify({ success: true, job: job || null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'summarize-conversation') {
      const conversationId = asString(body?.conversationId);
      if (!conversationId) {
        return new Response(JSON.stringify({ error: 'Missing conversationId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await ensureActorCanAccessConversation(admin, workspaceId, user.id, role, conversationId);
      const knowledge = await loadKnowledge(admin);
      const result = await summarizeConversation(
        admin,
        workspaceId,
        conversationId,
        user.id,
        Boolean(body?.forceRefresh),
        knowledge,
      );

      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'scan-alerts') {
      const result = await scanAlerts(admin, workspaceId, user.id, {
        hotLeadHours: Number(body?.hotLeadHours || 4),
        qualifiedInactiveHours: Number(body?.qualifiedInactiveHours || 24),
        noShowHours: Number(body?.noShowHours || 12),
      });

      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'resolve-alert') {
      const alertId = asString(body?.alertId);
      if (!alertId) {
        return new Response(JSON.stringify({ error: 'Missing alertId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await (admin as any)
        .from('instagram_alerts')
        .update({
          status: 'resolved',
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('workspace_id', workspaceId)
        .eq('id', alertId);

      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'dashboard-todos') {
      const sinceIso = body?.sinceIso ? String(body.sinceIso) : null;
      const knowledge = await loadKnowledge(admin);
      const tasks = await generateDashboardTodos(admin, workspaceId, knowledge, sinceIso);
      return new Response(JSON.stringify({ success: true, tasks }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('inbox-ai error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Internal server error' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
