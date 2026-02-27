import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar, ChevronDown } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProfileAvatar } from '@/components/layout/AppSidebar';
import { DashboardClaudeChat } from '@/components/dashboard/DashboardClaudeChat';
import { supabase } from '@/integrations/supabase/client';
import { invokeInboxAi } from '@/integrations/supabase/authedInvoke';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { orbCssVars } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { Flame, MessageSquare, PhoneCall, Star, Trophy, UserPlus, UserRoundX, XCircle } from 'lucide-react';

type DashboardRange = 'this_month' | 'last_7_days' | 'last_30_days';

type TemperatureLevel = 'hot' | 'warm' | 'cold';

type FunnelStageKey =
  | 'new_lead'
  | 'in_contact'
  | 'qualified'
  | 'unqualified'
  | 'call_booked'
  | 'won'
  | 'no_show';

const FUNNEL_STAGE_ORDER: FunnelStageKey[] = [
  'new_lead',
  'in_contact',
  'qualified',
  'unqualified',
  'call_booked',
  'won',
  'no_show',
];

const FUNNEL_STAGE_PRESETS: Record<
  FunnelStageKey,
  { label: string; color: string; icon: any }
> = {
  new_lead: { label: 'New lead', color: '#ec4899', icon: UserPlus },
  in_contact: { label: 'In contact', color: '#6366f1', icon: MessageSquare },
  qualified: { label: 'Qualified', color: '#f59e0b', icon: Star },
  unqualified: { label: 'Unqualified', color: '#ef4444', icon: XCircle },
  call_booked: { label: 'Call booked', color: '#9ca3af', icon: PhoneCall },
  won: { label: 'Won', color: '#10b981', icon: Trophy },
  no_show: { label: 'No show', color: '#f97316', icon: UserRoundX },
};

const RANGE_LABELS: Record<DashboardRange, string> = {
  this_month: 'This month',
  last_7_days: 'Last 7 days',
  last_30_days: 'Last 30 days',
};

const normalizeTagName = (value: string | null | undefined) => String(value || '').trim().toLowerCase();

function funnelStageKeyFromTagName(value: string | null | undefined): FunnelStageKey | null {
  const n = normalizeTagName(value);
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

const matchesTemperatureTag = (name: string, level: TemperatureLevel) => {
  const normalized = normalizeTagName(name);
  if (level === 'hot') return normalized === 'hot lead' || normalized === 'hot';
  if (level === 'warm') return normalized === 'warm lead' || normalized === 'warm';
  return normalized === 'cold lead' || normalized === 'cold';
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getRangeStart(range: DashboardRange, now = new Date()): Date {
  const today = startOfDay(now);
  if (range === 'last_7_days') {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return d;
  }
  if (range === 'last_30_days') {
    const d = new Date(today);
    d.setDate(d.getDate() - 29);
    return d;
  }
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${Math.round(value)}%`;
}

function formatMinutes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  if (value < 1) return '< 1';
  if (value < 10) return value.toFixed(1);
  return String(Math.round(value));
}

function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString();
}

type ThreadRow = {
  conversation_id: string;
  created_at: string;
  last_message_at: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  peer_username: string | null;
  peer_name: string | null;
  peer_profile_picture_url: string | null;
  assigned_user_id: string | null;
  lead_status: string | null;
  priority: boolean | null;
  is_spam: boolean | null;
  hidden_from_setters: boolean | null;
};

type InstagramTagRow = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
};

type ConversationTagRow = {
  conversation_id: string | null;
  tag: InstagramTagRow | null;
};

type EnrichedThread = ThreadRow & {
  phase: FunnelStageKey;
  temperature: TemperatureLevel | null;
};

type AlertRow = {
  id: string;
  conversation_id: string;
  alert_type: string;
  overdue_minutes: number;
  recommended_action: string | null;
  assigned_user_id: string | null;
  created_at: string;
};

type MeetingMetricRow = {
  id: string;
  start_time: string;
  status: string | null;
  outcome_status: 'pending' | 'completed' | 'no_show' | 'rescheduled' | 'cancelled' | null;
};

type DashboardTodoItem = {
  conversation_id: string;
  title: string;
  subtitle: string;
  icon: string;
  peer_username: string | null;
  peer_name: string | null;
  peer_profile_picture_url: string | null;
};

function ensureAtUsername(value: string) {
  const v = String(value || '').trim();
  if (!v) return '';
  return v.startsWith('@') ? v : `@${v}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatRelativeTime(d?: Date | null) {
  if (!d) return '';
  const ms = Date.now() - d.getTime();
  if (!Number.isFinite(ms)) return '';

  const s = Math.floor(ms / 1000);
  if (s < 0) return '';
  if (s < 60) return `${Math.max(1, s)}s`;

  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;

  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;

  const w = Math.floor(days / 7);
  if (w < 5) return `${w}w`;

  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo}mo`;

  const y = Math.floor(days / 365);
  return `${Math.max(1, y)}y`;
}

function formatRelativeTimeAgo(d?: Date | null) {
  const base = formatRelativeTime(d);
  if (!base) return '';
  return base === 'now' ? 'now' : `${base} ago`;
}

function formatDurationShortMinutes(minutes: number) {
  const mins = Math.max(0, Math.floor(minutes));
  if (!Number.isFinite(mins)) return '';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const w = Math.floor(days / 7);
  if (w < 5) return `${w}w`;
  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo}mo`;
  const y = Math.floor(days / 365);
  return `${Math.max(1, y)}y`;
}

function getThreadSortMs(t: ThreadRow | null | undefined): number {
  if (!t) return 0;
  const candidates = [t.last_inbound_at, t.last_message_at, t.created_at].filter(Boolean) as string[];
  for (const iso of candidates) {
    const ms = new Date(iso).getTime();
    if (Number.isFinite(ms) && ms > 0) return ms;
  }
  return 0;
}

function getTodoPriorityScore({
  iconKey,
  thread,
  alert,
}: {
  iconKey: string;
  thread?: EnrichedThread | null;
  alert?: AlertRow | null;
}): number {
  const key = String(iconKey || '').trim().toLowerCase();
  const temp = thread?.temperature || null;
  const phase = thread?.phase || null;
  const leadStatus = String(thread?.lead_status || '').toLowerCase();
  const isQualified = phase === 'qualified' || leadStatus === 'qualified' || key === 'qualified';

  let score = 0;

  // Always surface the most intent-heavy leads first.
  if (temp === 'hot' || key === 'hot') score += 1000;
  if (isQualified) score += 700;

  // Concrete actions are next most useful.
  if (key === 'call' || key === 'reschedule') score += 600;
  if (key === 'no_show') score += 520;

  // Alerts should matter, but still obey hot/qualified ordering above.
  if (alert) {
    score += 250;
    const overdue = Number(alert.overdue_minutes || 0);
    if (Number.isFinite(overdue) && overdue > 0) score += Math.min(180, overdue / 10);
  }

  // Priority flag from the thread (real state).
  if ((thread as any)?.priority) score += 120;

  // Default follow-up/reply items.
  if (key === 'follow_up') score += 100;

  return score;
}

function formatTodoSubtitle(t: DashboardTodoItem) {
  const username = t.peer_username ? ensureAtUsername(t.peer_username) : '';
  const raw = String(t.subtitle || '').trim();
  if (!username) return raw;

  // If the subtitle already includes the username (once or multiple times), strip it and re-prefix once.
  const re = new RegExp(`^(?:${escapeRegExp(username)}\\s*)+`, 'i');
  const rest = raw.replace(re, '').trim();
  return rest ? `${username} ${rest}` : username;
}

function compactTodoSubtitleLine(value: string, maxChars = 120) {
  let t = String(value || '').trim().replace(/\s+/g, ' ');
  if (!t) return '';

  // Make urgent task subtitles mobile-safe: keep meaning, drop fluff.
  t = t
    .replace(/\bsent a new message\b/gi, 'messaged you')
    .replace(/\bhas been quiet for\b/gi, 'quiet for')
    .replace(/\breply while it'?s hot\.?/gi, 'reply now')
    .replace(/\bkeep momentum\.?/gi, '')
    .replace(/\bsend a follow up\.?/gi, '')
    .replace(/\bopen the conversation and take action\.?/gi, 'take action')
    .replace(/\s+/g, ' ')
    .replace(/\s*\.\s*/g, '. ')
    .trim()
    .replace(/\.$/, '')
    .trim();

  if (t.length <= maxChars) return t;

  // Remove some filler words first to keep meaning but reduce length.
  const softened = t
    .replace(/\bwhile it'?s\b/gi, '')
    .replace(/\bwhile it is\b/gi, '')
    .replace(/\bplease\b/gi, '')
    .replace(/\bjust\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (softened.length <= maxChars) return softened;

  // Hard cut at word boundary.
  const sliced = softened.slice(0, maxChars).replace(/\s+\S*$/, '').trim();
  return sliced || softened.slice(0, maxChars).trim();
}

async function fetchConversationTags(
  workspaceId: string,
  conversationIds: string[],
): Promise<ConversationTagRow[]> {
  const ids = conversationIds.filter(Boolean);
  if (ids.length === 0) return [];

  // PostgREST uses URL query params for `in`, keep batches modest to avoid URL-length limits.
  const batchSize = 200;
  const out: ConversationTagRow[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('instagram_conversation_tags')
      .select('conversation_id, tag:instagram_tags(id,name,color,icon)')
      .eq('workspace_id', workspaceId)
      .in('conversation_id', batch);

    if (error) throw error;
    out.push(...((data || []) as any));
  }

  return out;
}

function pickPhase(tags: InstagramTagRow[]): FunnelStageKey {
  for (const tag of tags) {
    const key = funnelStageKeyFromTagName(tag?.name);
    if (key) return key;
  }
  // Default phase is always "New lead" (even when older conversations backfill).
  return 'new_lead';
}

function pickTemperature(tags: InstagramTagRow[]): TemperatureLevel | null {
  for (const tag of tags) {
    const name = tag?.name || '';
    if (matchesTemperatureTag(name, 'hot')) return 'hot';
    if (matchesTemperatureTag(name, 'warm')) return 'warm';
    if (matchesTemperatureTag(name, 'cold')) return 'cold';
  }
  return null;
}

function buildTip({
  replyRate,
  avgResponseMins,
  unqualifiedPercent,
}: {
  replyRate: number;
  avgResponseMins: number;
  unqualifiedPercent: number;
}) {
  if (avgResponseMins > 60) return 'Your response time is slipping. Aim for fast replies on new inbound today.';
  if (replyRate < 55) return 'Reply rate is low. Clear the newest inbound messages first, then follow up on warm leads.';
  if (unqualifiedPercent > 35) return 'A lot of leads are getting disqualified. Tighten your qualification questions early.';
  return "You're doing awesome! Keep it up.";
}

function getTimeOfDayGreeting(localDate = new Date()) {
  const hour = localDate.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  if (hour >= 18 && hour < 22) return 'Good evening';
  return 'Still awake';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { workspace, members, userRole } = useWorkspace();

  const [range, setRange] = useState<DashboardRange>('this_month');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [dashboardReveal, setDashboardReveal] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollHintTimeoutRef = useRef<number | null>(null);

  const [threads, setThreads] = useState<EnrichedThread[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [meetingRows, setMeetingRows] = useState<MeetingMetricRow[]>([]);

  const [todos, setTodos] = useState<DashboardTodoItem[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [localNowMs, setLocalNowMs] = useState(() => Date.now());

  const rangeStart = useMemo(() => getRangeStart(range), [range]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLocalNowMs(Date.now());
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = pageRef.current?.closest('main');
    if (!root) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Number((root as HTMLElement).scrollTop || 0);
        const next = Math.max(0, Math.min(1, y / 420));
        setDashboardReveal((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
      });
    };

    onScroll();
    root.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const root = pageRef.current?.closest('main') as HTMLElement | null;
    if (!root) return;

    const clearPending = () => {
      if (scrollHintTimeoutRef.current != null) {
        window.clearTimeout(scrollHintTimeoutRef.current);
        scrollHintTimeoutRef.current = null;
      }
    };

    const scheduleHint = () => {
      clearPending();
      setShowScrollHint(false);
      scrollHintTimeoutRef.current = window.setTimeout(() => {
        const currentY = Number(root.scrollTop || 0);
        if (currentY <= 8) setShowScrollHint(true);
      }, 3000);
    };

    const onScroll = () => {
      const currentY = Number(root.scrollTop || 0);
      if (currentY > 8) setShowScrollHint(false);
      scheduleHint();
    };

    const onActivity = () => {
      scheduleHint();
    };

    scheduleHint();
    root.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('wheel', onActivity, { passive: true });
    root.addEventListener('touchstart', onActivity, { passive: true });
    root.addEventListener('touchmove', onActivity, { passive: true });
    root.addEventListener('pointerdown', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity);

    return () => {
      clearPending();
      root.removeEventListener('scroll', onScroll);
      root.removeEventListener('wheel', onActivity);
      root.removeEventListener('touchstart', onActivity);
      root.removeEventListener('touchmove', onActivity);
      root.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, []);

  useEffect(() => {
    if (!workspace?.id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const load = async () => {
      try {
        const startIso = rangeStart.toISOString();

        const [{ data: threadRows, error: threadsError }, { data: meetingsData, error: meetingsError }] = await Promise.all([
          supabase
            .from('instagram_threads')
            .select(
              'conversation_id,created_at,last_message_at,last_inbound_at,last_outbound_at,peer_username,peer_name,peer_profile_picture_url,assigned_user_id,lead_status,priority,is_spam,hidden_from_setters',
            )
            .eq('workspace_id', workspace.id)
            .or(`last_message_at.gte.${startIso},created_at.gte.${startIso}`),
          (supabase as any)
            .from('meetings')
            .select('id,start_time,status,outcome_status')
            .eq('workspace_id', workspace.id)
            .not('google_event_id', 'is', null)
            .not('meeting_link', 'is', null)
            .gte('start_time', startIso),
        ]);

        if (threadsError) throw threadsError;
        if (meetingsError) throw meetingsError;

	        const baseThreads = ((threadRows || []) as ThreadRow[])
	          .filter((t) => !t.is_spam)
	          .filter((t) => !t.hidden_from_setters)
	          .filter((t) => String(t.lead_status || 'open') !== 'removed');

        const conversationIds = baseThreads.map((t) => String(t.conversation_id)).filter(Boolean);
        const tagRows = await fetchConversationTags(workspace.id, conversationIds);

        const tagsByConversationId: Record<string, InstagramTagRow[]> = {};
        for (const row of tagRows) {
          const convId = String(row?.conversation_id || '').trim();
          if (!convId || !row?.tag) continue;
          if (!tagsByConversationId[convId]) tagsByConversationId[convId] = [];
          tagsByConversationId[convId].push(row.tag);
        }

        const enriched: EnrichedThread[] = baseThreads.map((t) => {
          const convId = String(t.conversation_id);
          const tags = tagsByConversationId[convId] || [];
          return {
            ...t,
            phase: pickPhase(tags),
            temperature: pickTemperature(tags),
          };
        });

	        const { data: alertRows, error: alertsError } = await supabase
	          .from('instagram_alerts')
	          .select(
	            'id,conversation_id,alert_type,overdue_minutes,recommended_action,assigned_user_id,created_at',
	          )
	          .eq('workspace_id', workspace.id)
	          .eq('status', 'open')
	          .order('overdue_minutes', { ascending: false })
	          .order('created_at', { ascending: false })
	          .limit(6);

	        if (alertsError) throw alertsError;

	        if (!cancelled) {
	          const allowedConversationIds = new Set(baseThreads.map((t) => String(t.conversation_id)));
	          const filteredAlerts = (Array.isArray(alertRows) ? alertRows : []).filter((a: any) =>
	            allowedConversationIds.has(String(a?.conversation_id || ''))
	          );
	          setThreads(enriched);
	          setAlerts(filteredAlerts as AlertRow[]);
            setMeetingRows((Array.isArray(meetingsData) ? meetingsData : []) as MeetingMetricRow[]);
	        }
      } catch (err: any) {
        console.error('Dashboard load error:', err);
        if (!cancelled) setLoadError(err?.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [workspace?.id, rangeStart]);

  useEffect(() => {
    if (!workspace?.id) return;
    if (userRole === 'setter') return;
    let cancelled = false;
    setTodosLoading(true);

    const load = async () => {
      try {
        const { data, error } = await invokeInboxAi<any>({
          action: 'dashboard-todos',
          workspaceId: workspace.id,
          sinceIso: rangeStart.toISOString(),
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Failed to load to-dos');

        const raw = Array.isArray(data?.tasks) ? data.tasks : [];
        const normalized: DashboardTodoItem[] = raw
          .map((t: any) => ({
            conversation_id: String(t?.conversation_id || t?.conversationId || '').trim(),
            title: String(t?.title || '').trim(),
            subtitle: String(t?.subtitle || '').trim(),
            icon: String(t?.icon || '').trim(),
            peer_username: t?.peer_username != null ? String(t.peer_username) : null,
            peer_name: t?.peer_name != null ? String(t.peer_name) : null,
            peer_profile_picture_url:
              t?.peer_profile_picture_url != null ? String(t.peer_profile_picture_url) : null,
          }))
          .filter((t) => t.conversation_id && t.title);

        if (!cancelled) setTodos(normalized);
      } catch (e: any) {
        console.warn('Dashboard todos error:', e);
      } finally {
        if (!cancelled) setTodosLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [workspace?.id, userRole, rangeStart]);

  const displayName = profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || 'User';
  const firstName = (displayName || '').split(' ')[0] || displayName;
  const greetingPrefix = useMemo(() => getTimeOfDayGreeting(new Date(localNowMs)), [localNowMs]);

  const phaseCounts = useMemo(() => {
    const counts: Record<FunnelStageKey, number> = {
      new_lead: 0,
      in_contact: 0,
      qualified: 0,
      unqualified: 0,
      call_booked: 0,
      won: 0,
      no_show: 0,
    };

    for (const t of threads) counts[t.phase] += 1;
    return counts;
  }, [threads]);

  const totalConversations = threads.length;

  const qualifiedLeads = useMemo(() => {
    return threads.filter((t) => String(t.lead_status || '').toLowerCase() === 'qualified').length;
  }, [threads]);

  const linksSentCount = 0;
  const bookedCalls = useMemo(() => {
    return meetingRows.filter((meeting) => {
      const status = String(meeting.status || '').toLowerCase();
      const outcome = String(meeting.outcome_status || '').toLowerCase();
      return status !== 'cancelled' && outcome !== 'cancelled';
    }).length;
  }, [meetingRows]);
  const showUps = useMemo(() => {
    return meetingRows.filter((meeting) => String(meeting.outcome_status || '').toLowerCase() === 'completed').length;
  }, [meetingRows]);
  const closedLeads = 0;
  const conversionRate: number | null = null;

  const newConversations = useMemo(() => {
    const startMs = rangeStart.getTime();
    return threads.filter((t) => new Date(t.created_at).getTime() >= startMs).length;
  }, [threads, rangeStart]);

  const inboundSinceStart = useMemo(() => {
    const startMs = rangeStart.getTime();
    return threads.filter((t) => t.last_inbound_at && new Date(t.last_inbound_at).getTime() >= startMs);
  }, [threads, rangeStart]);

  const repliedSinceStart = useMemo(() => {
    return inboundSinceStart.filter((t) => {
      if (!t.last_inbound_at || !t.last_outbound_at) return false;
      const inMs = new Date(t.last_inbound_at).getTime();
      const outMs = new Date(t.last_outbound_at).getTime();
      return outMs >= inMs;
    });
  }, [inboundSinceStart]);

  const replyRate = inboundSinceStart.length
    ? (repliedSinceStart.length / inboundSinceStart.length) * 100
    : 0;

  const avgResponseMins = useMemo(() => {
    const diffs: number[] = [];
    for (const t of repliedSinceStart) {
      if (!t.last_inbound_at || !t.last_outbound_at) continue;
      const inMs = new Date(t.last_inbound_at).getTime();
      const outMs = new Date(t.last_outbound_at).getTime();
      const mins = (outMs - inMs) / 60000;
      if (Number.isFinite(mins) && mins >= 0 && mins <= 60 * 24 * 7) diffs.push(mins);
    }
    if (!diffs.length) return 0;
    return diffs.reduce((a, b) => a + b, 0) / diffs.length;
  }, [repliedSinceStart]);

  const unqualifiedPercent = totalConversations
    ? (phaseCounts.unqualified / totalConversations) * 100
    : 0;

  const funnelMetrics = useMemo(
    () => [
      { key: 'conversations', label: 'Conversations', value: totalConversations },
      { key: 'qualified', label: 'Qualified', value: qualifiedLeads },
      { key: 'links_sent', label: 'Links sent', value: linksSentCount },
      { key: 'booked_calls', label: 'Booked calls', value: bookedCalls },
      { key: 'show_ups', label: 'Show ups', value: showUps },
      { key: 'closed', label: 'Closed', value: closedLeads },
    ],
    [totalConversations, qualifiedLeads, linksSentCount, bookedCalls, showUps, closedLeads],
  );

  const funnelSeries = useMemo(
    () => funnelMetrics.map((m) => ({ stage: m.label, value: m.value })),
    [funnelMetrics],
  );

  const unqualifiedDonutData = useMemo(() => {
    const unqualifiedCount = Math.max(0, phaseCounts.unqualified || 0);
    const otherCount = Math.max(0, totalConversations - unqualifiedCount);
    return [
      { key: 'unqualified', name: 'Unqualified', value: unqualifiedCount, color: '#ef4444' },
      { key: 'other', name: 'Other', value: otherCount, color: '#22c55e' },
    ];
  }, [phaseCounts.unqualified, totalConversations]);

  const paymentsSeries = useMemo(
    () => [
      { w: 'W1', earned: 0, potential: 0 },
      { w: 'W2', earned: 0, potential: 0 },
      { w: 'W3', earned: 0, potential: 0 },
      { w: 'W4', earned: 0, potential: 0 },
    ],
    [],
  );

  const fallbackTodos = useMemo(() => {
    const candidates: DashboardTodoItem[] = [];
    const threadById = new Map<string, EnrichedThread>();
    for (const t of threads) threadById.set(String(t.conversation_id), t);

    const alertByConversationId = new Map<string, AlertRow>();
    for (const a of alerts) alertByConversationId.set(String(a.conversation_id), a);

    // 1) Alerts are the most concrete, actionable items.
    for (const a of alerts) {
      const thread = threads.find((x) => String(x.conversation_id) === String(a.conversation_id));
      const icon =
        a.alert_type === 'no_show_followup'
          ? 'call'
          : a.alert_type === 'hot_lead_unreplied'
            ? 'hot'
            : a.alert_type === 'qualified_inactive'
              ? 'qualified'
              : 'follow_up';

      const overdue = Number(a.overdue_minutes || 0);
      const overdueLabel =
        Number.isFinite(overdue) && overdue > 0 ? formatDurationShortMinutes(overdue) : '';
      const base = a.recommended_action || 'Open the conversation and take action.';
      const subtitle = overdueLabel ? `${base} (overdue ${overdueLabel})` : base;

      candidates.push({
        conversation_id: a.conversation_id,
        title: humanizeAlertType(a.alert_type),
        subtitle,
        icon,
        peer_username: thread?.peer_username ?? null,
        peer_name: thread?.peer_name ?? null,
        peer_profile_picture_url: thread?.peer_profile_picture_url ?? null,
      });
    }

    // 2) New unreplied inbound messages (real, derived from last inbound/outbound timestamps).
    const unreplied = threads
      .filter((t) => Boolean(t.last_inbound_at))
      .filter((t) => {
        const inboundMs = t.last_inbound_at ? new Date(t.last_inbound_at).getTime() : 0;
        const outboundMs = t.last_outbound_at ? new Date(t.last_outbound_at).getTime() : 0;
        return inboundMs > outboundMs;
      })
      .sort((a, b) => {
        const am = a.last_inbound_at ? new Date(a.last_inbound_at).getTime() : 0;
        const bm = b.last_inbound_at ? new Date(b.last_inbound_at).getTime() : 0;
        return bm - am;
      });

    for (const t of unreplied.slice(0, 25)) {
      const inboundAt = t.last_inbound_at ? new Date(t.last_inbound_at) : null;
      const ago = formatRelativeTimeAgo(inboundAt);
      const delay = ago ? `${ago}` : 'recently';
      const isHot = t.temperature === 'hot';
      const subtitle = isHot
        ? `messaged you ${delay}. Reply while it's hot.`
        : `sent a new message ${delay}. Keep momentum.`;
      candidates.push({
        conversation_id: String(t.conversation_id),
        title: t.temperature === 'hot' ? 'Follow up hot lead' : 'Reply now',
        subtitle,
        icon:
          t.temperature === 'hot'
            ? 'hot'
            : String(t.lead_status || '').toLowerCase() === 'qualified'
              ? 'qualified'
              : 'follow_up',
        peer_username: t.peer_username ?? null,
        peer_name: t.peer_name ?? null,
        peer_profile_picture_url: t.peer_profile_picture_url ?? null,
      });
    }

    // 3) Qualified leads that are inactive (real, derived from lead_status + last message timestamp).
    const now = Date.now();
    const qualifiedInactive = threads
      .filter((t) => String(t.lead_status || '').toLowerCase() === 'qualified')
      .filter((t) => {
        const lastMs = t.last_message_at ? new Date(t.last_message_at).getTime() : new Date(t.created_at).getTime();
        return Number.isFinite(lastMs) && now - lastMs > 24 * 60 * 60 * 1000;
      })
      .sort((a, b) => {
        const am = a.last_message_at ? new Date(a.last_message_at).getTime() : new Date(a.created_at).getTime();
        const bm = b.last_message_at ? new Date(b.last_message_at).getTime() : new Date(b.created_at).getTime();
        return am - bm;
      });

    for (const t of qualifiedInactive.slice(0, 25)) {
      const lastMs = t.last_message_at
        ? new Date(t.last_message_at).getTime()
        : new Date(t.created_at).getTime();
      const lastAt = Number.isFinite(lastMs) && lastMs > 0 ? new Date(lastMs) : null;
      const silent = formatRelativeTime(lastAt) || '24h+';
      candidates.push({
        conversation_id: String(t.conversation_id),
        title: 'Follow up qualified lead',
        subtitle: `has been quiet for ${silent}. Send a follow up.`,
        icon: 'qualified',
        peer_username: t.peer_username ?? null,
        peer_name: t.peer_name ?? null,
        peer_profile_picture_url: t.peer_profile_picture_url ?? null,
      });
    }

    // Rank + dedupe + take top N so hot/qualified always float to the top.
    const deduped = new Map<string, DashboardTodoItem>();
    const sorted = candidates
      .filter((t) => t.conversation_id && t.title)
      .slice()
      .sort((a, b) => {
        const aThread = threadById.get(String(a.conversation_id)) || null;
        const bThread = threadById.get(String(b.conversation_id)) || null;
        const aAlert = alertByConversationId.get(String(a.conversation_id)) || null;
        const bAlert = alertByConversationId.get(String(b.conversation_id)) || null;

        const aScore = getTodoPriorityScore({ iconKey: a.icon, thread: aThread, alert: aAlert });
        const bScore = getTodoPriorityScore({ iconKey: b.icon, thread: bThread, alert: bAlert });
        if (bScore !== aScore) return bScore - aScore;

        const aMs = getThreadSortMs(aThread);
        const bMs = getThreadSortMs(bThread);
        return bMs - aMs;
      });

    for (const t of sorted) {
      const id = String(t.conversation_id);
      if (!id || deduped.has(id)) continue;
      deduped.set(id, t);
      if (deduped.size >= 6) break;
    }

    return Array.from(deduped.values());
  }, [alerts, threads]);

  const topPerformers = useMemo(() => {
    const memberByUserId = new Map(members.map((m) => [m.userId, m]));
    const statsByUser: Record<string, { assigned: number; won: number }> = {};

    for (const t of threads) {
      const uid = t.assigned_user_id || '';
      if (!uid) continue;
      if (!statsByUser[uid]) statsByUser[uid] = { assigned: 0, won: 0 };
      statsByUser[uid].assigned += 1;
      if (t.phase === 'won') statsByUser[uid].won += 1;
    }

    const rows = Object.entries(statsByUser)
      .map(([userId, stat]) => ({
        userId,
        assigned: stat.assigned,
        won: stat.won,
        member: memberByUserId.get(userId) || null,
      }))
      .sort((a, b) => (b.won - a.won) || (b.assigned - a.assigned))
      .slice(0, 3);

    return rows;
  }, [threads, members]);

  const tip = useMemo(
    () => buildTip({ replyRate, avgResponseMins, unqualifiedPercent }),
    [replyRate, avgResponseMins, unqualifiedPercent],
  );

  const urgentTasks = useMemo(() => {
    const base = todos.length ? todos : fallbackTodos;
    const threadById = new Map<string, EnrichedThread>();
    for (const t of threads) threadById.set(String(t.conversation_id), t);
    const alertByConversationId = new Map<string, AlertRow>();
    for (const a of alerts) alertByConversationId.set(String(a.conversation_id), a);

    return base
      .slice()
      .sort((a, b) => {
        const aThread = threadById.get(String(a.conversation_id)) || null;
        const bThread = threadById.get(String(b.conversation_id)) || null;
        const aAlert = alertByConversationId.get(String(a.conversation_id)) || null;
        const bAlert = alertByConversationId.get(String(b.conversation_id)) || null;

        const aScore = getTodoPriorityScore({ iconKey: a.icon, thread: aThread, alert: aAlert });
        const bScore = getTodoPriorityScore({ iconKey: b.icon, thread: bThread, alert: bAlert });
        if (bScore !== aScore) return bScore - aScore;

        const aMs = getThreadSortMs(aThread);
        const bMs = getThreadSortMs(bThread);
        return bMs - aMs;
      })
      .slice(0, 6);
  }, [todos, fallbackTodos, threads, alerts]);

  // Setters should never land on the owner dashboard. Redirect instead of rendering nothing,
  // otherwise they can hit a blank black screen if a flow sends them to `/dashboard`.
  useEffect(() => {
    if (userRole === 'setter') {
      navigate('/setter-portal/messages', { replace: true });
    }
  }, [userRole, navigate]);

  if (userRole === 'setter') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  const dashboardVisibility = Math.max(0, Math.min(1, (dashboardReveal - 0.06) / 0.94));
  const dashboardOpacity = dashboardVisibility;
  const dashboardTranslateY = (1 - dashboardVisibility) * 110;

  return (
    <DashboardLayout>
      <div ref={pageRef} className="p-8 pt-32 md:pt-36 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="headline-domaine text-[52px] leading-[1.05] font-medium">
            {greetingPrefix === 'Still awake' ? `Still awake, ${firstName}?` : `${greetingPrefix}, ${firstName}`}
          </h1>
        </div>

        <div className="mt-10">
          <DashboardClaudeChat workspaceId={workspace?.id || null} />
        </div>

        <div
          className={cn(
            'mt-40 md:mt-48 flex flex-col items-center select-none pointer-events-none transition-all duration-500 ease-out',
            showScrollHint && dashboardReveal <= 0.08 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          )}
          aria-hidden
        >
          <ChevronDown className="h-5 w-5 text-white/58 acq-scroll-hint-arrow" />
          <div className="mt-1.5 text-[12px] font-normal tracking-[0.015em] text-white/45">
            scroll to view dashboard
          </div>
        </div>

        <div
          className="mt-24 transition-[opacity,transform] duration-200 ease-out"
          style={{
            opacity: dashboardOpacity,
            transform: `translateY(${dashboardTranslateY}px)`,
            visibility: dashboardOpacity <= 0.001 ? 'hidden' : 'visible',
          }}
        >
          <div className="flex items-center justify-end mb-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-11 rounded-2xl bg-black border border-white/10 pl-4 pr-3 text-[15px] font-medium text-white/85 hover:bg-white/[0.03] transition-colors inline-flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-white/55" />
                  <span>{RANGE_LABELS[range]}</span>
                  <ChevronDown className="h-4 w-4 text-white/40" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl min-w-[220px]">
                <DropdownMenuRadioGroup value={range} onValueChange={(v) => setRange(v as DashboardRange)}>
                  {Object.entries(RANGE_LABELS).map(([key, label]) => (
                    <DropdownMenuRadioItem key={key} value={key} className="text-sm">
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {loadError ? (
            <div className="rounded-3xl border border-white/10 bg-black p-6 text-sm text-white/70 mb-6">
              Failed to load dashboard: {loadError}
            </div>
          ) : null}

          <div className="grid grid-cols-12 gap-6">
          {/* Left (main) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="grid grid-cols-12 gap-4">
              <StatCard
                className="col-span-12 md:col-span-4"
                title="Conversion rate"
                value={loading ? '—' : conversionRate == null ? '—' : formatPercent(conversionRate)}
                meta="Call booking integrations coming soon"
              />
              <StatCard
                className="col-span-12 md:col-span-4"
                title="Avg response time"
                value={loading ? '—' : formatMinutes(avgResponseMins)}
                valueSuffix={loading ? '' : 'min'}
                meta="Outbound after inbound"
              />
              <StatCard
                className="col-span-12 md:col-span-4"
                title="Total conversations"
                value={loading ? '—' : formatCompactNumber(totalConversations)}
                meta={
                  loading
                    ? ''
                    : `${formatCompactNumber(totalConversations - newConversations)} active • ${formatCompactNumber(newConversations)} new`
                }
              />
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold text-white/85">Funnel</div>
                  <div className="text-xs text-white/45 mt-1">Phase distribution for the selected range</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-6 gap-0 rounded-2xl border border-white/10 overflow-hidden">
                {funnelMetrics.map((m, idx) => (
                  <div
                    key={m.key}
                    className={cn('px-4 py-4 bg-black/50 border-white/10', idx !== 0 ? 'border-l-[0.5px]' : '')}
                  >
                    <div className="text-[12px] text-white/45">{m.label}</div>
                    <div className="mt-1 text-[18px] font-semibold text-white/92">
                      {loading ? '—' : formatCompactNumber(m.value || 0)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={funnelSeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="funnelFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="stage"
                      tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
                      contentStyle={{
                        background: 'rgba(0,0,0,0.9)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 14,
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: 12,
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                      formatter={(v: any) => [String(v), 'Leads']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#funnelFill)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#3b82f6' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-12 gap-4">
              <Card className="col-span-12 md:col-span-5 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-semibold text-white/85">Unqualified leads</div>
                    <div className="mt-1 text-sm text-white/50">
                      {loading ? '—' : `${formatPercent(unqualifiedPercent)}`}
                    </div>
                  </div>
                </div>

                <div className="mt-6 h-[260px] relative flex items-center justify-center">
                  {loading ? (
                    <Skeleton className="h-40 w-40 rounded-full bg-white/[0.06]" />
                  ) : totalConversations === 0 ? (
                    <div className="text-sm text-white/45">No conversations yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <linearGradient id="unqualifiedRingFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.35} />
                          </linearGradient>
                          <linearGradient id="otherRingFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.72} />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.26} />
                          </linearGradient>
                          <filter id="unqualifiedRingInnerGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                            <feComposite in="blur" in2="SourceAlpha" operator="in" result="innerBlur" />
                            <feFlood floodColor="#ef4444" floodOpacity="0.18" result="color" />
                            <feComposite in="color" in2="innerBlur" operator="in" result="glow" />
                            <feComposite in="SourceGraphic" in2="glow" operator="over" />
                          </filter>
                          <filter id="otherRingInnerGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                            <feComposite in="blur" in2="SourceAlpha" operator="in" result="innerBlur" />
                            <feFlood floodColor="#22c55e" floodOpacity="0.16" result="color" />
                            <feComposite in="color" in2="innerBlur" operator="in" result="glow" />
                            <feComposite in="SourceGraphic" in2="glow" operator="over" />
                          </filter>
                        </defs>
                        <Pie
                          data={unqualifiedDonutData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="84%"
                          outerRadius="92%"
                          startAngle={90}
                          endAngle={-270}
                          stroke="rgba(0,0,0,0)"
                          paddingAngle={2}
                          cornerRadius={12}
                        >
                          {unqualifiedDonutData.map((entry) => (
                            <Cell
                              key={entry.key}
                              fill={
                                entry.key === 'unqualified'
                                  ? 'url(#unqualifiedRingFill)'
                                  : 'url(#otherRingFill)'
                              }
                              filter={
                                entry.key === 'unqualified'
                                  ? 'url(#unqualifiedRingInnerGlow)'
                                  : 'url(#otherRingInnerGlow)'
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 14,
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: 12,
                          }}
                          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Total leads</div>
                    <div className="mt-2 text-3xl text-white/92">
                      {loading ? '—' : formatCompactNumber(totalConversations)}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="col-span-12 md:col-span-7 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-white/45">Earned</div>
                    <div className="mt-2 text-2xl font-semibold text-white/92">$0</div>
                    <div className="mt-1 text-xs text-white/35">Stripe/Whop coming soon</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-white/45">Potential</div>
                    <div className="mt-2 text-2xl font-semibold text-white/92">$0</div>
                    <div className="mt-1 text-xs text-white/35">Stripe/Whop coming soon</div>
                  </div>
                </div>

                <div className="mt-6 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={paymentsSeries} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="earnedFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="potentialFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.02} />
                        </linearGradient>
                        <filter id="earnedGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#22c55e" floodOpacity="0.25" />
                          <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#22c55e" floodOpacity="0.10" />
                        </filter>
                        <filter id="potentialGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#60a5fa" floodOpacity="0.22" />
                          <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#60a5fa" floodOpacity="0.10" />
                        </filter>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="w"
                        tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={26}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(0,0,0,0.9)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 14,
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: 12,
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                        formatter={(v: any, name: any) => [`$${String(v ?? 0)}`, String(name || '')]}
                      />
                      <Area
                        type="monotone"
                        dataKey="earned"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#earnedFill)"
                        fillOpacity={1}
                        dot={false}
                        activeDot={false}
                        filter="url(#earnedGlow)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Area
                        type="monotone"
                        dataKey="potential"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        fill="url(#potentialFill)"
                        fillOpacity={1}
                        dot={false}
                        activeDot={false}
                        filter="url(#potentialGlow)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-white/45">
                  <span className="inline-block h-5 w-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-[11px]">⚡</span>
                  </span>
                  <span>{tip}</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Right */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className="p-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[15px] font-semibold text-white/90">
                    Urgent Tasks{loading ? '' : ` (${formatCompactNumber(urgentTasks.length)})`}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {loading || todosLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-full text-left rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                        >
                          <div className="flex items-start gap-2">
                            <Skeleton className="h-8 w-8 rounded-2xl bg-white/[0.06]" />
                            <Skeleton className="h-8 w-8 rounded-full bg-white/[0.08]" />
                            <div className="min-w-0 flex-1">
                              <Skeleton className="h-4 w-48 rounded-xl bg-white/[0.10]" />
                              <Skeleton className="h-3 w-64 rounded-xl bg-white/[0.06] mt-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : urgentTasks.length === 0 ? (
                    <div className="text-sm text-white/45">No urgent tasks right now</div>
                  ) : (
	                    urgentTasks.map((t) => (
	                      <button
	                        key={t.conversation_id}
	                        type="button"
	                        className="group w-full text-left rounded-2xl border border-white/10 bg-black/40 hover:bg-white/[0.03] hover:border-white/15 transition-colors px-4 py-3 overflow-hidden"
	                        onClick={() => {
	                          navigate(`/messages?c=${encodeURIComponent(t.conversation_id)}`);
	                        }}
	                      >
	                        <div className="flex items-center gap-3">
	                          <TodoIcon icon={t.icon} />
	                          <div className="shrink-0">
	                            <ProfileAvatar
	                              name={t.peer_name || t.peer_username || 'Lead'}
	                              size="sm"
	                              bgColor="#2A2A2A"
	                              imageUrl={t.peer_profile_picture_url || undefined}
	                              mode={t.peer_profile_picture_url ? 'photo' : 'letter'}
	                            />
	                          </div>
	                          <div className="min-w-0 flex-1">
	                            <div className="text-[13px] font-semibold text-white/85 truncate">{t.title}</div>
	                          </div>
	                        </div>
	                        <div className="max-h-0 opacity-0 translate-y-[-2px] transition-[max-height,opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:max-h-24 group-hover:opacity-100 group-hover:translate-y-0 group-focus:max-h-24 group-focus:opacity-100 group-focus:translate-y-0">
	                          <div className="pt-2 text-[11px] font-light text-white/35 leading-snug">
	                            {formatTodoSubtitle(t)}
	                          </div>
	                        </div>
	                      </button>
	                    ))
	                  )}
	                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-[15px] font-semibold text-white/90">Top 3 this month</div>
              <div className="text-xs text-white/45 mt-1">Based on assigned leads and wins</div>

              <div className="mt-5 space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Skeleton className="h-8 w-8 rounded-full bg-white/[0.08]" />
                          <div className="min-w-0">
                            <Skeleton className="h-4 w-40 rounded-xl bg-white/[0.10]" />
                            <Skeleton className="h-3 w-24 rounded-xl bg-white/[0.06] mt-2" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-10 rounded-xl bg-white/[0.06]" />
                      </div>
                    ))}
                  </div>
                ) : topPerformers.length === 0 ? (
                  <div className="text-sm text-white/45">No assignments yet</div>
                ) : (
                  topPerformers.map((p, idx) => {
                    const name = p.member?.displayName || `User ${p.userId.slice(0, 6)}`;
                    return (
                      <div key={p.userId} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <ProfileAvatar name={name} size="sm" bgColor="#2A2A2A" mode="letter" />
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white/85 truncate">{name}</div>
                            <div className="mt-0.5 text-xs text-white/45">
                              {p.won > 0 ? `${formatCompactNumber(p.won)} won` : `${formatCompactNumber(p.assigned)} assigned`}
                            </div>
                          </div>
                        </div>
                        <div className="text-[12px] text-white/35 font-semibold">#{idx + 1}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-3xl border border-white/10 bg-black', className)}>
      {children}
    </div>
  );
}

function TodoIcon({ icon }: { icon: string }) {
  const key = String(icon || '').trim().toLowerCase();
  const preset =
    key === 'call' || key === 'reschedule'
      ? { Icon: PhoneCall, fg: '#ef4444' }
      : key === 'hot'
        ? { Icon: Flame, fg: '#f97316' }
        : key === 'qualified'
          ? { Icon: Star, fg: '#f59e0b' }
          : key === 'no_show'
            ? { Icon: UserRoundX, fg: '#f97316' }
            : { Icon: MessageSquare, fg: '#60a5fa' };

  return (
    <div
      className="w-8 h-8 acq-orb flex items-center justify-center shrink-0"
      style={orbCssVars(preset.fg) as any}
    >
      <preset.Icon className="h-4 w-4" style={{ color: preset.fg }} strokeWidth={2.2} />
    </div>
  );
}

function StatCard({
  title,
  value,
  valueSuffix,
  meta,
  className,
}: {
  title: string;
  value: string;
  valueSuffix?: string;
  meta?: string;
  className?: string;
}) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[12px] text-white/45">{title}</div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-semibold text-white/92">{value}</div>
            {valueSuffix ? <div className="text-sm text-white/50">{valueSuffix}</div> : null}
          </div>
          {meta ? <div className="mt-1 text-xs text-white/35">{meta}</div> : null}
        </div>
      </div>
    </Card>
  );
}

function humanizeAlertType(alertType: string) {
  const t = String(alertType || '').trim();
  if (!t) return 'Urgent task';
  if (t === 'hot_lead_unreplied') return 'Follow up hot lead';
  if (t === 'qualified_inactive') return 'Follow up qualified lead';
  if (t === 'no_show_followup') return 'No-show follow up';
  return t.replace(/_/g, ' ');
}
