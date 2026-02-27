const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_MODEL = Deno.env.get('CLAUDE_MODEL') || 'claude-3-5-sonnet-20240620';
const KNOWLEDGE_BUCKET = Deno.env.get('AI_KNOWLEDGE_BUCKET') || 'uploads';
const KNOWLEDGE_PATH = Deno.env.get('AI_KNOWLEDGE_PATH') || 'ai/knowledge.txt';
const KNOWLEDGE_MAX_CHARS = Number(Deno.env.get('AI_KNOWLEDGE_MAX_CHARS') || 12000);

export type AutoPhaseMode = 'shadow' | 'enforce';
export type AutoPhaseRunSource = 'incremental' | 'catchup' | 'backfill' | 'manual_rephase';

export type AutoPhaseSettingsRow = {
  workspace_id: string;
  enabled: boolean;
  mode: AutoPhaseMode;
  historical_policy: 'manual_backlog_only' | 'auto_catchup';
  enabled_at: string | null;
  min_confidence: number;
  incremental_max_conversations: number;
  catchup_max_conversations: number;
  classify_on_any_message: boolean;
  apply_temperature: boolean;
  manual_lock_enabled: boolean;
  uncertain_new_lead_window_hours: number;
  uncertain_existing_phase: 'in_contact' | 'keep_current';
  allow_setter_trigger: boolean;
  backfill_state: 'pending' | 'running' | 'completed';
  backfill_completed_at: string | null;
  last_incremental_run_at: string | null;
  last_catchup_run_at: string | null;
  last_error: string | null;
  updated_at: string;
};

export type AutoPhaseRunSummary = {
  workspaceId: string;
  source: AutoPhaseRunSource;
  mode: AutoPhaseMode;
  totalCandidates: number;
  processed: number;
  applied: number;
  shadowed: number;
  skippedManual: number;
  skippedLowConfidence: number;
  skippedOther: number;
  errors: number;
  errorMessages: string[];
  startedAt: string;
  completedAt: string;
  lockAcquired: boolean;
  skippedReason: string | null;
};

type TagDef = {
  id: string;
  name: string;
  prompt: string | null;
};

type TagCatalog = {
  phaseTags: TagDef[];
  phaseTagIds: string[];
  temperatureTags: TagDef[];
  temperatureTagIds: string[];
  managedTagIds: string[];
  newLeadTagId: string | null;
  inContactTagId: string | null;
  phaseKeyByTagId: Record<string, string>;
};

type ConversationTagLink = {
  tag_id: string;
  source: string;
};

type ThreadCandidate = {
  conversation_id: string;
  instagram_account_id: string | null;
  instagram_user_id: string | null;
  last_message_at: string | null;
  last_message_direction: string | null;
  lead_status: string | null;
  is_spam: boolean | null;
  ai_phase_updated_at: string | null;
  created_at: string | null;
};

type ClassifierOutput = {
  phaseTagId: string | null;
  phaseConfidence: number;
  temperatureTagId: string | null;
  temperatureConfidence: number;
  reason: string;
};

export type RunWorkspaceAutoPhaseOptions = {
  workspaceId: string;
  source: AutoPhaseRunSource;
  actorUserId?: string | null;
  actorRole?: string | null;
  conversationIds?: string[];
  maxConversations?: number;
  forceRunWhenDisabled?: boolean;
  lockTtlSeconds?: number;
};

export type UnlockThreadForAutoPhaseOptions = {
  workspaceId: string;
  conversationId: string;
  actorUserId?: string | null;
  actorRole?: string | null;
};

const DEFAULT_SETTINGS: AutoPhaseSettingsRow = {
  workspace_id: '',
  enabled: false,
  mode: 'shadow',
  historical_policy: 'manual_backlog_only',
  enabled_at: null,
  min_confidence: 70,
  incremental_max_conversations: 30,
  catchup_max_conversations: 120,
  classify_on_any_message: true,
  apply_temperature: true,
  manual_lock_enabled: true,
  uncertain_new_lead_window_hours: 24,
  uncertain_existing_phase: 'in_contact',
  allow_setter_trigger: true,
  backfill_state: 'pending',
  backfill_completed_at: null,
  last_incremental_run_at: null,
  last_catchup_run_at: null,
  last_error: null,
  updated_at: new Date(0).toISOString(),
};

const FUNNEL_STAGE_PRIORITY = ['new_lead', 'in_contact', 'qualified', 'unqualified', 'call_booked', 'won', 'no_show'];

const asString = (v: unknown) => (v == null ? '' : String(v));

function clampInt(v: unknown, min: number, max: number, fallback: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function normalizeName(value: string | null | undefined) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function nowIso() {
  return new Date().toISOString();
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

function stageKeyFromTagName(value: string | null | undefined): string | null {
  const n = normalizeName(value);
  if (!n) return null;
  if (n === 'new lead' || n === 'new') return 'new_lead';
  if (n === 'in contact' || n === 'contacted') return 'in_contact';
  if (n === 'qualified') return 'qualified';
  if (n === 'unqualified' || n === 'disqualified') return 'unqualified';
  if (n === 'call booked' || n === 'booked call' || n === 'call') return 'call_booked';
  if (n === 'won' || n === 'closed won') return 'won';
  if (n === 'no show' || n === 'noshow') return 'no_show';
  return null;
}

function statusFromStageKey(stageKey: string | null): 'open' | 'qualified' | 'disqualified' {
  if (stageKey === 'qualified') return 'qualified';
  if (stageKey === 'unqualified') return 'disqualified';
  return 'open';
}

function pickHighestPriorityPhaseId(tagIds: string[], catalog: TagCatalog): string | null {
  if (!Array.isArray(tagIds) || tagIds.length === 0) return null;
  const keySet = new Set<string>();
  const idByKey: Record<string, string> = {};
  for (const tagId of tagIds) {
    const key = catalog.phaseKeyByTagId[tagId] || null;
    if (!key) continue;
    keySet.add(key);
    if (!idByKey[key]) idByKey[key] = tagId;
  }
  for (const key of FUNNEL_STAGE_PRIORITY) {
    if (keySet.has(key)) return idByKey[key] || null;
  }
  return tagIds[0] || null;
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

async function callClaude(system: string, userPrompt: string, maxTokens = 900): Promise<any | null> {
  if (!CLAUDE_API_KEY) return null;

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
    const retryable = status === 429 || status >= 500;
    if (attempt < maxAttempts && retryable) {
      await new Promise((r) => setTimeout(r, 250 * attempt));
      continue;
    }

    return null;
  }

  return null;
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

async function getThreadMeta(admin: any, workspaceId: string, conversationId: string) {
  const { data } = await admin
    .from('instagram_threads')
    .select('conversation_id,instagram_account_id,instagram_user_id')
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
  const byKey = await admin
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

  const fallback = await admin
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

async function writeAudit(admin: any, payload: {
  workspaceId: string;
  conversationId: string;
  action: string;
  actorUserId?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    await admin.from('instagram_thread_audit_log').insert({
      workspace_id: payload.workspaceId,
      conversation_id: payload.conversationId,
      action: payload.action,
      actor_user_id: payload.actorUserId || null,
      details: payload.details || {},
    });
  } catch {
    // ignore audit failures
  }
}

function fallbackClassifier(transcript: string, catalog: TagCatalog): ClassifierOutput {
  const t = transcript.toLowerCase();
  let reason = 'Fallback classifier used.';

  let phaseTagId: string | null = null;
  let phaseConfidence = 42;
  if (/\b(book|schedule|calendar|call tomorrow|call today|zoom|meet)\b/.test(t)) {
    phaseTagId = catalog.phaseTags.find((x) => stageKeyFromTagName(x.name) === 'call_booked')?.id || null;
    phaseConfidence = 58;
    reason = 'Detected call-booking language.';
  } else if (/\b(price|pricing|budget|ready|start|buy|payment|invoice|proposal)\b/.test(t)) {
    phaseTagId = catalog.phaseTags.find((x) => stageKeyFromTagName(x.name) === 'qualified')?.id || null;
    phaseConfidence = 57;
    reason = 'Detected qualification/purchase intent language.';
  }

  let temperatureTagId: string | null = null;
  let temperatureConfidence = 41;
  if (/\b(price|pricing|ready|start|book|call|buy|payment)\b/.test(t)) {
    temperatureTagId = catalog.temperatureTags.find((x) => normalizeName(x.name).includes('hot'))?.id || null;
    temperatureConfidence = 56;
  } else if (/\binterested|maybe|later|soon|curious\b/.test(t)) {
    temperatureTagId = catalog.temperatureTags.find((x) => normalizeName(x.name).includes('warm'))?.id || null;
    temperatureConfidence = 47;
  } else if (/\bnot now|busy|no thanks|stop|unsubscribe\b/.test(t)) {
    temperatureTagId = catalog.temperatureTags.find((x) => normalizeName(x.name).includes('cold'))?.id || null;
    temperatureConfidence = 55;
  }

  return {
    phaseTagId,
    phaseConfidence,
    temperatureTagId,
    temperatureConfidence,
    reason,
  };
}

async function classifyConversation(
  transcript: string,
  catalog: TagCatalog,
  knowledge: string,
): Promise<ClassifierOutput> {
  if (!transcript.trim()) {
    return {
      phaseTagId: null,
      phaseConfidence: 20,
      temperatureTagId: null,
      temperatureConfidence: 20,
      reason: 'No transcript available.',
    };
  }

  const phasePayload = catalog.phaseTags
    .filter((t) => !isExcludedPhaseName(t.name))
    .map((t) => ({ id: t.id, name: t.name, prompt: asString(t.prompt).trim() || null }));
  const temperaturePayload = catalog.temperatureTags.map((t) => ({ id: t.id, name: t.name, prompt: asString(t.prompt).trim() || null }));

  const system = [
    'You classify Instagram lead conversations into ONE funnel phase and ONE temperature.',
    'Return ONLY strict JSON with this shape:',
    '{',
    '  "phase_tag_id": "uuid|null",',
    '  "phase_confidence": 0-100 integer,',
    '  "temperature_tag_id": "uuid|null",',
    '  "temperature_confidence": 0-100 integer,',
    '  "reason": "1-2 concise sentences grounded in the conversation"',
    '}',
    'Rules:',
    '- Choose IDs only from provided options.',
    '- Be conservative and prefer null if unclear.',
    '- Confidence reflects certainty for EACH field separately.',
    '- Reason must mention concrete cues from recent messages.',
  ].join('\n');

  const userPrompt = [
    `Knowledge:\n${knowledge || 'No additional context provided.'}`,
    '',
    `Phase options:\n${JSON.stringify(phasePayload, null, 2)}`,
    '',
    `Temperature options:\n${JSON.stringify(temperaturePayload, null, 2)}`,
    '',
    `Conversation transcript:\n${transcript}`,
  ].join('\n');

  const parsed = await callClaude(system, userPrompt, 750);
  if (!parsed || typeof parsed !== 'object') {
    return fallbackClassifier(transcript, catalog);
  }

  const validPhaseIds = new Set(catalog.phaseTagIds);
  const validTempIds = new Set(catalog.temperatureTagIds);

  const phaseTagIdRaw = parsed?.phase_tag_id != null ? String(parsed.phase_tag_id) : '';
  const tempTagIdRaw = parsed?.temperature_tag_id != null ? String(parsed.temperature_tag_id) : '';

  const phaseTagId = phaseTagIdRaw && validPhaseIds.has(phaseTagIdRaw) ? phaseTagIdRaw : null;
  const temperatureTagId = tempTagIdRaw && validTempIds.has(tempTagIdRaw) ? tempTagIdRaw : null;

  const phaseConfidence = clampInt(parsed?.phase_confidence, 0, 100, phaseTagId ? 62 : 45);
  const temperatureConfidence = clampInt(parsed?.temperature_confidence, 0, 100, temperatureTagId ? 58 : 45);
  const reason = asString(parsed?.reason).trim() || 'Classified from latest conversation context.';

  return {
    phaseTagId,
    phaseConfidence,
    temperatureTagId,
    temperatureConfidence,
    reason,
  };
}

function normalizeSettingsRow(raw: any, workspaceId: string): AutoPhaseSettingsRow {
  const out: AutoPhaseSettingsRow = {
    ...DEFAULT_SETTINGS,
    workspace_id: workspaceId,
  };
  if (!raw || typeof raw !== 'object') return out;

  out.enabled = Boolean(raw.enabled);
  out.mode = raw.mode === 'enforce' ? 'enforce' : 'shadow';
  out.historical_policy = raw.historical_policy === 'auto_catchup' ? 'auto_catchup' : 'manual_backlog_only';
  out.enabled_at = raw.enabled_at ? String(raw.enabled_at) : null;
  out.min_confidence = clampInt(raw.min_confidence, 0, 100, 70);
  out.incremental_max_conversations = clampInt(raw.incremental_max_conversations, 1, 500, 30);
  out.catchup_max_conversations = clampInt(raw.catchup_max_conversations, 1, 1500, 120);
  out.classify_on_any_message = raw.classify_on_any_message !== false;
  out.apply_temperature = raw.apply_temperature !== false;
  out.manual_lock_enabled = raw.manual_lock_enabled !== false;
  out.uncertain_new_lead_window_hours = clampInt(raw.uncertain_new_lead_window_hours, 1, 168, 24);
  out.uncertain_existing_phase = raw.uncertain_existing_phase === 'keep_current' ? 'keep_current' : 'in_contact';
  out.allow_setter_trigger = raw.allow_setter_trigger !== false;
  out.backfill_state = raw.backfill_state === 'completed' || raw.backfill_state === 'running' ? raw.backfill_state : 'pending';
  out.backfill_completed_at = raw.backfill_completed_at ? String(raw.backfill_completed_at) : null;
  out.last_incremental_run_at = raw.last_incremental_run_at ? String(raw.last_incremental_run_at) : null;
  out.last_catchup_run_at = raw.last_catchup_run_at ? String(raw.last_catchup_run_at) : null;
  out.last_error = raw.last_error ? String(raw.last_error) : null;
  out.updated_at = raw.updated_at ? String(raw.updated_at) : nowIso();

  return out;
}

export async function getOrCreateAutoPhaseSettings(admin: any, workspaceId: string): Promise<AutoPhaseSettingsRow> {
  const ws = asString(workspaceId).trim();
  if (!ws) throw new Error('Missing workspaceId');

  const { data, error } = await admin
    .from('instagram_phase_automation_settings')
    .select('*')
    .eq('workspace_id', ws)
    .maybeSingle();

  if (error) throw new Error(error.message || 'Failed to load auto-phase settings');
  if (data) return normalizeSettingsRow(data, ws);

  const { data: inserted, error: insertError } = await admin
    .from('instagram_phase_automation_settings')
    .insert({ workspace_id: ws })
    .select('*')
    .maybeSingle();

  if (insertError) {
    const { data: fallback } = await admin
      .from('instagram_phase_automation_settings')
      .select('*')
      .eq('workspace_id', ws)
      .maybeSingle();
    if (fallback) return normalizeSettingsRow(fallback, ws);
    throw new Error(insertError.message || 'Failed to initialize auto-phase settings');
  }

  return normalizeSettingsRow(inserted || {}, ws);
}

export async function setAutoPhaseSettings(
  admin: any,
  workspaceId: string,
  patch: Record<string, unknown>,
): Promise<AutoPhaseSettingsRow> {
  const current = await getOrCreateAutoPhaseSettings(admin, workspaceId);

  const nextPatch: Record<string, unknown> = {};
  const has = (k: string) => Object.prototype.hasOwnProperty.call(patch || {}, k);

  if (has('enabled')) nextPatch.enabled = Boolean(patch.enabled);
  if (has('mode')) nextPatch.mode = patch.mode === 'enforce' ? 'enforce' : 'shadow';
  if (has('historical_policy')) {
    nextPatch.historical_policy = patch.historical_policy === 'auto_catchup' ? 'auto_catchup' : 'manual_backlog_only';
  }
  if (has('min_confidence')) nextPatch.min_confidence = clampInt(patch.min_confidence, 0, 100, current.min_confidence);
  if (has('incremental_max_conversations')) {
    nextPatch.incremental_max_conversations = clampInt(
      patch.incremental_max_conversations,
      1,
      500,
      current.incremental_max_conversations,
    );
  }
  if (has('catchup_max_conversations')) {
    nextPatch.catchup_max_conversations = clampInt(
      patch.catchup_max_conversations,
      1,
      1500,
      current.catchup_max_conversations,
    );
  }
  if (has('classify_on_any_message')) nextPatch.classify_on_any_message = Boolean(patch.classify_on_any_message);
  if (has('apply_temperature')) nextPatch.apply_temperature = Boolean(patch.apply_temperature);
  if (has('manual_lock_enabled')) nextPatch.manual_lock_enabled = Boolean(patch.manual_lock_enabled);
  if (has('allow_setter_trigger')) nextPatch.allow_setter_trigger = Boolean(patch.allow_setter_trigger);
  if (has('uncertain_new_lead_window_hours')) {
    nextPatch.uncertain_new_lead_window_hours = clampInt(
      patch.uncertain_new_lead_window_hours,
      1,
      168,
      current.uncertain_new_lead_window_hours,
    );
  }
  if (has('uncertain_existing_phase')) {
    nextPatch.uncertain_existing_phase = patch.uncertain_existing_phase === 'keep_current' ? 'keep_current' : 'in_contact';
  }
  if (has('backfill_state')) {
    const v = asString(patch.backfill_state);
    if (v === 'pending' || v === 'running' || v === 'completed') {
      nextPatch.backfill_state = v;
    }
  }

  const nextEnabled = Object.prototype.hasOwnProperty.call(nextPatch, 'enabled')
    ? Boolean(nextPatch.enabled)
    : current.enabled;
  if (nextEnabled && !current.enabled_at) {
    nextPatch.enabled_at = nowIso();
  }

  if (Object.keys(nextPatch).length === 0) return current;

  const { data, error } = await admin
    .from('instagram_phase_automation_settings')
    .update(nextPatch)
    .eq('workspace_id', workspaceId)
    .select('*')
    .maybeSingle();

  if (error) throw new Error(error.message || 'Failed to save auto-phase settings');
  return normalizeSettingsRow(data || {}, workspaceId);
}

async function acquireWorkspaceLock(admin: any, workspaceId: string, ttlSeconds: number) {
  try {
    const { data, error } = await admin.rpc('acquire_instagram_auto_phase_lock', {
      p_workspace_id: workspaceId,
      p_ttl_seconds: clampInt(ttlSeconds, 10, 3600, 90),
    });
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

async function releaseWorkspaceLock(admin: any, workspaceId: string) {
  try {
    await admin.rpc('release_instagram_auto_phase_lock', { p_workspace_id: workspaceId });
  } catch {
    // ignore
  }
}

async function loadTagCatalog(admin: any, workspaceId: string): Promise<TagCatalog> {
  const { data, error } = await admin
    .from('instagram_tags')
    .select('id,name,prompt')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message || 'Failed to load Instagram tags');

  const tags = (Array.isArray(data) ? data : [])
    .map((row: any) => ({
      id: asString(row?.id),
      name: asString(row?.name),
      prompt: row?.prompt != null ? String(row.prompt) : null,
    }))
    .filter((t) => t.id && t.name);

  const temperatureTags = tags.filter((t) => isTemperatureTagName(t.name));
  const phaseTags = tags.filter((t) => !isTemperatureTagName(t.name)).filter((t) => !isExcludedPhaseName(t.name));

  const phaseKeyByTagId: Record<string, string> = {};
  for (const tag of phaseTags) {
    const key = stageKeyFromTagName(tag.name);
    if (key) phaseKeyByTagId[tag.id] = key;
  }

  const newLeadTagId =
    phaseTags.find((t) => {
      const n = normalizeName(t.name);
      return n === 'new lead' || n === 'new';
    })?.id || null;

  const inContactTagId =
    phaseTags.find((t) => {
      const n = normalizeName(t.name);
      return n === 'in contact' || n === 'contacted';
    })?.id || null;

  const phaseTagIds = phaseTags.map((x) => x.id);
  const temperatureTagIds = temperatureTags.map((x) => x.id);

  return {
    phaseTags,
    phaseTagIds,
    temperatureTags,
    temperatureTagIds,
    managedTagIds: Array.from(new Set([...phaseTagIds, ...temperatureTagIds])),
    newLeadTagId,
    inContactTagId,
    phaseKeyByTagId,
  };
}

async function loadConversationManagedTagLinks(
  admin: any,
  workspaceId: string,
  conversationIds: string[],
  managedTagIds: string[],
): Promise<Record<string, ConversationTagLink[]>> {
  const byConv: Record<string, ConversationTagLink[]> = {};
  if (conversationIds.length === 0 || managedTagIds.length === 0) return byConv;

  const { data, error } = await admin
    .from('instagram_conversation_tags')
    .select('conversation_id,tag_id,source')
    .eq('workspace_id', workspaceId)
    .in('conversation_id', conversationIds)
    .in('tag_id', managedTagIds);

  if (error || !Array.isArray(data)) return byConv;

  for (const row of data) {
    const conversationId = asString((row as any)?.conversation_id);
    const tagId = asString((row as any)?.tag_id);
    const source = normalizeName((row as any)?.source || '');
    if (!conversationId || !tagId) continue;
    if (!byConv[conversationId]) byConv[conversationId] = [];
    byConv[conversationId].push({ tag_id: tagId, source });
  }

  return byConv;
}

async function loadThreadCandidates(
  admin: any,
  workspaceId: string,
  settings: AutoPhaseSettingsRow,
  source: AutoPhaseRunSource,
  maxConversations: number,
  explicitConversationIds?: string[],
): Promise<ThreadCandidate[]> {
  const baseSelect =
    'conversation_id,instagram_account_id,instagram_user_id,last_message_at,last_message_direction,lead_status,is_spam,ai_phase_updated_at,created_at';

  if (Array.isArray(explicitConversationIds) && explicitConversationIds.length > 0) {
    const ids = Array.from(new Set(explicitConversationIds.map((x) => String(x || '').trim()).filter(Boolean))).slice(0, maxConversations);
    if (ids.length === 0) return [];

    const { data, error } = await admin
      .from('instagram_threads')
      .select(baseSelect)
      .eq('workspace_id', workspaceId)
      .in('conversation_id', ids)
      .neq('lead_status', 'removed')
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw new Error(error.message || 'Failed to load thread candidates');
    return (Array.isArray(data) ? data : []) as ThreadCandidate[];
  }

  const pageLimit = Math.min(800, Math.max(80, maxConversations * 6));
  const { data, error } = await admin
    .from('instagram_threads')
    .select(baseSelect)
    .eq('workspace_id', workspaceId)
    .neq('lead_status', 'removed')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(pageLimit);

  if (error) throw new Error(error.message || 'Failed to load thread candidates');

  const rows = (Array.isArray(data) ? data : []) as ThreadCandidate[];
  const enabledAtMs = toMs(settings.enabled_at);
  const staleRows = rows.filter((row) => {
    if (Boolean((row as any)?.is_spam)) return false;
    const lastAt = toMs((row as any)?.last_message_at || (row as any)?.created_at);
    const aiAt = toMs((row as any)?.ai_phase_updated_at);
    const createdAtMs = toMs((row as any)?.created_at);
    const createdAfterEnabledAt =
      enabledAtMs > 0 &&
      createdAtMs > 0 &&
      createdAtMs >= enabledAtMs;

    if (source === 'backfill') {
      if (settings.historical_policy === 'manual_backlog_only') return false;
      return !aiAt;
    }
    if (source === 'catchup') {
      if (settings.historical_policy === 'manual_backlog_only') {
        if (aiAt) return lastAt > aiAt;
        return createdAfterEnabledAt;
      }
      if (!aiAt) return true;
      return lastAt > aiAt;
    }

    if (!aiAt) return true;
    return lastAt > aiAt;
  });

  return staleRows.slice(0, maxConversations);
}

function buildLowConfidenceFallbackPhaseId(
  settings: AutoPhaseSettingsRow,
  catalog: TagCatalog,
  currentPhaseTagId: string | null,
  lastActivityMs: number,
): string | null {
  if (settings.uncertain_existing_phase === 'keep_current' && currentPhaseTagId) {
    return currentPhaseTagId;
  }

  if (currentPhaseTagId) {
    // Guardrail: below threshold should not force phase changes on existing leads.
    return currentPhaseTagId;
  }

  const freshWindowMs = Math.max(1, settings.uncertain_new_lead_window_hours) * 60 * 60 * 1000;
  const isFresh = lastActivityMs > 0 && Date.now() - lastActivityMs <= freshWindowMs;
  if (isFresh && catalog.newLeadTagId) return catalog.newLeadTagId;
  if (catalog.inContactTagId) return catalog.inContactTagId;
  if (catalog.newLeadTagId) return catalog.newLeadTagId;
  return null;
}

async function updateThreadAiMetadata(
  admin: any,
  workspaceId: string,
  conversationId: string,
  payload: {
    phaseConfidence: number | null;
    temperatureConfidence: number | null;
    reason: string;
    mode: AutoPhaseMode;
    source: AutoPhaseRunSource;
  },
) {
  await admin
    .from('instagram_threads')
    .update({
      ai_phase_updated_at: nowIso(),
      ai_phase_confidence: payload.phaseConfidence,
      ai_temperature_confidence: payload.temperatureConfidence,
      ai_phase_reason: payload.reason || null,
      ai_phase_mode: payload.mode,
      ai_phase_last_run_source: payload.source,
    })
    .eq('workspace_id', workspaceId)
    .eq('conversation_id', conversationId);
}

async function applyEnforceTagsAndStatus(
  admin: any,
  workspaceId: string,
  conversationId: string,
  settings: AutoPhaseSettingsRow,
  catalog: TagCatalog,
  targetPhaseTagId: string | null,
  targetTemperatureTagId: string | null,
  actorUserId?: string | null,
) {
  const tagsToManage = settings.apply_temperature
    ? Array.from(new Set([...catalog.phaseTagIds, ...catalog.temperatureTagIds]))
    : catalog.phaseTagIds.slice();

  if (tagsToManage.length > 0) {
    let deleteQuery = admin
      .from('instagram_conversation_tags')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('conversation_id', conversationId)
      .in('tag_id', tagsToManage);

    if (settings.manual_lock_enabled) {
      deleteQuery = deleteQuery.in('source', ['ai', 'retag']);
    }

    await deleteQuery;
  }

  const rows: any[] = [];
  if (targetPhaseTagId) {
    rows.push({
      workspace_id: workspaceId,
      conversation_id: conversationId,
      tag_id: targetPhaseTagId,
      source: 'ai',
      created_by: actorUserId || null,
    });
  }
  if (settings.apply_temperature && targetTemperatureTagId) {
    rows.push({
      workspace_id: workspaceId,
      conversation_id: conversationId,
      tag_id: targetTemperatureTagId,
      source: 'ai',
      created_by: actorUserId || null,
    });
  }

  if (rows.length > 0) {
    await admin.from('instagram_conversation_tags').upsert(rows, {
      onConflict: 'workspace_id,conversation_id,tag_id',
    });
  }

  const stageKey = targetPhaseTagId ? catalog.phaseKeyByTagId[targetPhaseTagId] || null : null;
  const leadStatus = statusFromStageKey(stageKey);

  await admin
    .from('instagram_threads')
    .update({ lead_status: leadStatus })
    .eq('workspace_id', workspaceId)
    .eq('conversation_id', conversationId);
}

function summarizeError(error: unknown, fallback = 'Unknown error') {
  const message = asString((error as any)?.message || (error as any)?.details || error || fallback).trim();
  return message || fallback;
}

function pickMaxConversations(settings: AutoPhaseSettingsRow, source: AutoPhaseRunSource, requested?: number) {
  const fallback = source === 'incremental' ? settings.incremental_max_conversations : settings.catchup_max_conversations;
  const max = clampInt(requested, 1, 1500, fallback);
  return Math.max(1, max);
}

async function markRunResult(
  admin: any,
  workspaceId: string,
  source: AutoPhaseRunSource,
  runError: string | null,
) {
  const patch: Record<string, unknown> = {
    last_error: runError,
  };

  if (source === 'incremental') {
    patch.last_incremental_run_at = nowIso();
  }
  if (source === 'catchup' || source === 'backfill') {
    patch.last_catchup_run_at = nowIso();
  }

  await admin
    .from('instagram_phase_automation_settings')
    .update(patch)
    .eq('workspace_id', workspaceId);
}

async function refreshBackfillState(
  admin: any,
  workspaceId: string,
  settings: AutoPhaseSettingsRow,
) {
  if (settings.historical_policy === 'manual_backlog_only') {
    await admin
      .from('instagram_phase_automation_settings')
      .update({
        backfill_state: 'completed',
        backfill_completed_at: nowIso(),
      })
      .eq('workspace_id', workspaceId);
    return;
  }

  let remaining = 0;
  try {
    const pending = await loadThreadCandidates(admin, workspaceId, settings, 'backfill', 1);
    remaining = Array.isArray(pending) ? pending.length : 0;
  } catch {
    return;
  }

  if (remaining <= 0) {
    await admin
      .from('instagram_phase_automation_settings')
      .update({
        backfill_state: 'completed',
        backfill_completed_at: nowIso(),
      })
      .eq('workspace_id', workspaceId);
    return;
  }

  await admin
    .from('instagram_phase_automation_settings')
    .update({
      backfill_state: 'running',
      backfill_completed_at: null,
    })
    .eq('workspace_id', workspaceId);
}

export async function runWorkspaceAutoPhase(
  admin: any,
  opts: RunWorkspaceAutoPhaseOptions,
): Promise<AutoPhaseRunSummary> {
  const workspaceId = asString(opts.workspaceId).trim();
  if (!workspaceId) throw new Error('Missing workspaceId');

  const settings = await getOrCreateAutoPhaseSettings(admin, workspaceId);
  const source = opts.source;
  const startedAt = nowIso();

  const summary: AutoPhaseRunSummary = {
    workspaceId,
    source,
    mode: settings.mode,
    totalCandidates: 0,
    processed: 0,
    applied: 0,
    shadowed: 0,
    skippedManual: 0,
    skippedLowConfidence: 0,
    skippedOther: 0,
    errors: 0,
    errorMessages: [],
    startedAt,
    completedAt: startedAt,
    lockAcquired: false,
    skippedReason: null,
  };

  const actorRole = normalizeName(opts.actorRole || '');
  if (!opts.forceRunWhenDisabled && !settings.enabled) {
    summary.skippedReason = 'auto-phasing disabled';
    summary.completedAt = nowIso();
    return summary;
  }

  if (actorRole === 'setter' && !settings.allow_setter_trigger) {
    summary.skippedReason = 'setter trigger disabled';
    summary.completedAt = nowIso();
    return summary;
  }

  const lockAcquired = await acquireWorkspaceLock(admin, workspaceId, clampInt(opts.lockTtlSeconds, 10, 3600, 120));
  summary.lockAcquired = lockAcquired;

  if (!lockAcquired) {
    summary.skippedReason = 'workspace lock busy';
    summary.completedAt = nowIso();
    return summary;
  }

  let runError: string | null = null;
  try {
    const catalog = await loadTagCatalog(admin, workspaceId);
    if (catalog.phaseTags.length === 0) {
      summary.skippedReason = 'no phase tags configured';
      summary.completedAt = nowIso();
      return summary;
    }

    const maxConversations = pickMaxConversations(settings, source, opts.maxConversations);
    const candidates = await loadThreadCandidates(
      admin,
      workspaceId,
      settings,
      source,
      maxConversations,
      opts.conversationIds,
    );

    summary.totalCandidates = candidates.length;
    if (candidates.length === 0) {
      if (source === 'backfill' || source === 'catchup') {
        await refreshBackfillState(admin, workspaceId, settings);
      }
      summary.completedAt = nowIso();
      await markRunResult(admin, workspaceId, source, null);
      return summary;
    }

    const conversationIds = candidates.map((x) => asString(x.conversation_id)).filter(Boolean);
    const linksByConversation = await loadConversationManagedTagLinks(
      admin,
      workspaceId,
      conversationIds,
      catalog.managedTagIds,
    );

    const knowledge = await loadKnowledge(admin);

    for (const candidate of candidates) {
      const conversationId = asString(candidate?.conversation_id);
      if (!conversationId) continue;

      try {
        const existingLinks = linksByConversation[conversationId] || [];
        const currentPhaseTagIds = existingLinks
          .filter((x) => catalog.phaseTagIds.includes(x.tag_id))
          .map((x) => x.tag_id);
        const currentTempTagIds = existingLinks
          .filter((x) => catalog.temperatureTagIds.includes(x.tag_id))
          .map((x) => x.tag_id);

        const currentPhaseTagId = pickHighestPriorityPhaseId(currentPhaseTagIds, catalog);
        const currentTempTagId = currentTempTagIds[0] || null;

        const manualLock =
          settings.manual_lock_enabled &&
          existingLinks.some((x) => {
            const source = normalizeName(x.source);
            return Boolean(source) && source !== 'ai' && source !== 'retag';
          });

        if (!settings.classify_on_any_message) {
          const direction = normalizeName(candidate?.last_message_direction || '');
          if (direction && direction !== 'inbound') {
            summary.skippedOther += 1;
            summary.processed += 1;
            await updateThreadAiMetadata(admin, workspaceId, conversationId, {
              phaseConfidence: currentPhaseTagId ? settings.min_confidence : null,
              temperatureConfidence: currentTempTagId ? settings.min_confidence : null,
              reason: 'Skipped: latest message was outbound and classify_on_any_message is disabled.',
              mode: settings.mode,
              source,
            });
            continue;
          }
        }

        const messages = await getConversationMessages(admin, workspaceId, conversationId, 80);
        const transcript = formatTranscript(messages, 45);

        const cls = await classifyConversation(transcript, catalog, knowledge);
        const predictedPhaseTagId = cls.phaseTagId && catalog.phaseTagIds.includes(cls.phaseTagId) ? cls.phaseTagId : null;
        const predictedTempTagId = cls.temperatureTagId && catalog.temperatureTagIds.includes(cls.temperatureTagId) ? cls.temperatureTagId : null;

        const phaseConfidence = clampInt(cls.phaseConfidence, 0, 100, 45);
        const tempConfidence = clampInt(cls.temperatureConfidence, 0, 100, 45);
        const lowPhaseConfidence = phaseConfidence < settings.min_confidence;

        const lastActivityMs = Math.max(toMs(candidate?.last_message_at), toMs(candidate?.created_at));
        const fallbackPhaseTagId = buildLowConfidenceFallbackPhaseId(settings, catalog, currentPhaseTagId, lastActivityMs);

        const targetPhaseTagId =
          !lowPhaseConfidence && predictedPhaseTagId
            ? predictedPhaseTagId
            : fallbackPhaseTagId || currentPhaseTagId || predictedPhaseTagId;

        const targetTempTagId = settings.apply_temperature
          ? tempConfidence >= settings.min_confidence
            ? predictedTempTagId || currentTempTagId
            : currentTempTagId
          : currentTempTagId;

        const metadataReason = lowPhaseConfidence
          ? `${cls.reason} Confidence below threshold (${phaseConfidence} < ${settings.min_confidence}).`
          : cls.reason;

        if (settings.mode === 'shadow') {
          await updateThreadAiMetadata(admin, workspaceId, conversationId, {
            phaseConfidence,
            temperatureConfidence: settings.apply_temperature ? tempConfidence : null,
            reason: metadataReason,
            mode: settings.mode,
            source,
          });

          await writeAudit(admin, {
            workspaceId,
            conversationId,
            action: 'auto_phase_shadow',
            actorUserId: opts.actorUserId || null,
            details: {
              phase_tag_id: targetPhaseTagId,
              temperature_tag_id: settings.apply_temperature ? targetTempTagId : null,
              phase_confidence: phaseConfidence,
              temperature_confidence: tempConfidence,
              reason: metadataReason,
              manual_lock: manualLock,
            },
          });

          summary.shadowed += 1;
          summary.processed += 1;
          continue;
        }

        if (manualLock) {
          await updateThreadAiMetadata(admin, workspaceId, conversationId, {
            phaseConfidence,
            temperatureConfidence: settings.apply_temperature ? tempConfidence : null,
            reason: `${metadataReason} Skipped: manual lock is active.`,
            mode: settings.mode,
            source,
          });

          await writeAudit(admin, {
            workspaceId,
            conversationId,
            action: 'auto_phase_skipped_manual',
            actorUserId: opts.actorUserId || null,
            details: {
              phase_tag_id: targetPhaseTagId,
              temperature_tag_id: settings.apply_temperature ? targetTempTagId : null,
              phase_confidence: phaseConfidence,
              temperature_confidence: tempConfidence,
              reason: metadataReason,
            },
          });

          summary.skippedManual += 1;
          summary.processed += 1;
          continue;
        }

        const unchanged =
          targetPhaseTagId === currentPhaseTagId &&
          (!settings.apply_temperature || targetTempTagId === currentTempTagId);

        if (lowPhaseConfidence && unchanged) {
          await updateThreadAiMetadata(admin, workspaceId, conversationId, {
            phaseConfidence,
            temperatureConfidence: settings.apply_temperature ? tempConfidence : null,
            reason: metadataReason,
            mode: settings.mode,
            source,
          });

          await writeAudit(admin, {
            workspaceId,
            conversationId,
            action: 'auto_phase_skipped_low_confidence',
            actorUserId: opts.actorUserId || null,
            details: {
              phase_confidence: phaseConfidence,
              threshold: settings.min_confidence,
              reason: metadataReason,
            },
          });

          summary.skippedLowConfidence += 1;
          summary.processed += 1;
          continue;
        }

        await applyEnforceTagsAndStatus(
          admin,
          workspaceId,
          conversationId,
          settings,
          catalog,
          targetPhaseTagId,
          targetTempTagId,
          opts.actorUserId || null,
        );

        await updateThreadAiMetadata(admin, workspaceId, conversationId, {
          phaseConfidence,
          temperatureConfidence: settings.apply_temperature ? tempConfidence : null,
          reason: metadataReason,
          mode: settings.mode,
          source,
        });

        await writeAudit(admin, {
          workspaceId,
          conversationId,
          action: 'auto_phase_applied',
          actorUserId: opts.actorUserId || null,
          details: {
            previous_phase_tag_id: currentPhaseTagId,
            phase_tag_id: targetPhaseTagId,
            previous_temperature_tag_id: currentTempTagId,
            temperature_tag_id: settings.apply_temperature ? targetTempTagId : null,
            phase_confidence: phaseConfidence,
            temperature_confidence: tempConfidence,
            reason: metadataReason,
            low_confidence_fallback: lowPhaseConfidence,
          },
        });

        summary.applied += 1;
        summary.processed += 1;
      } catch (threadError) {
        const message = summarizeError(threadError, 'Conversation processing failed');
        summary.errors += 1;
        summary.errorMessages.push(`${conversationId}: ${message}`);
      }
    }

    if (source === 'backfill' || source === 'catchup') {
      await refreshBackfillState(admin, workspaceId, settings);
    }

    runError = summary.errors > 0
      ? summary.errorMessages.slice(0, 6).join(' | ').slice(0, 1200)
      : null;

    await markRunResult(admin, workspaceId, source, runError);

    summary.completedAt = nowIso();
    return summary;
  } catch (error) {
    runError = summarizeError(error, 'Auto-phase run failed');
    summary.errors += 1;
    summary.errorMessages.push(runError);
    summary.completedAt = nowIso();
    await markRunResult(admin, workspaceId, source, runError);
    return summary;
  } finally {
    await releaseWorkspaceLock(admin, workspaceId);
  }
}

export async function unlockThreadForAutoPhase(
  admin: any,
  opts: UnlockThreadForAutoPhaseOptions,
): Promise<AutoPhaseRunSummary> {
  const workspaceId = asString(opts.workspaceId).trim();
  const conversationId = asString(opts.conversationId).trim();
  if (!workspaceId || !conversationId) throw new Error('Missing workspaceId or conversationId');

  await getOrCreateAutoPhaseSettings(admin, workspaceId);
  const catalog = await loadTagCatalog(admin, workspaceId);

  if (catalog.managedTagIds.length > 0) {
    await admin
      .from('instagram_conversation_tags')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('conversation_id', conversationId)
      .in('tag_id', catalog.managedTagIds)
      .in('source', ['manual', 'bulk']);
  }

  return await runWorkspaceAutoPhase(admin, {
    workspaceId,
    source: 'incremental',
    actorUserId: opts.actorUserId || null,
    actorRole: opts.actorRole || null,
    conversationIds: [conversationId],
    maxConversations: 1,
    forceRunWhenDisabled: true,
    lockTtlSeconds: 90,
  });
}
