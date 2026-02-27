import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Download,
  Filter,
  Flame,
  MessageCircle,
  PhoneCall,
  Search,
  Snowflake,
  Star,
  Sun,
  Tag as TagIcon,
  Trophy,
  UserPlus,
  UserRoundX,
  XCircle,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/components/FileUpload';
import { KeywordInput } from '@/components/KeywordInput';
import { RunHistory } from '@/components/RunHistory';
import { OpenerStyle, OpenerToggle } from '@/components/OpenerToggle';
import { useAuth } from '@/hooks/useAuth';
import { useFilterRuns } from '@/hooks/useFilterRuns';
import { useWorkspace } from '@/hooks/useWorkspace';
import { parseCSV, filterData, enrichRow } from '@/lib/csv-utils';
import { generateOpeners, getPromptTemplate } from '@/lib/opener-service';
import { supabase } from '@/integrations/supabase/client';
import { CSVRow } from '@/types';

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
  in_contact: { label: 'In contact', color: '#6366f1', icon: MessageCircle },
  qualified: { label: 'Qualified', color: '#f59e0b', icon: Star },
  unqualified: { label: 'Unqualified', color: '#ef4444', icon: XCircle },
  call_booked: { label: 'Call booked', color: '#9ca3af', icon: PhoneCall },
  won: { label: 'Won', color: '#10b981', icon: Trophy },
  no_show: { label: 'No show', color: '#f97316', icon: UserRoundX },
};

const TEMPERATURE_PRESETS: Record<TemperatureLevel, { label: string; icon: any; color: string }> = {
  hot: { label: 'Hot', icon: Flame, color: '#ff8b4a' },
  warm: { label: 'Warm', icon: Sun, color: '#facc15' },
  cold: { label: 'Cold', icon: Snowflake, color: '#93c5fd' },
};

const TEMPERATURE_TAG_SEED_PRESETS: Record<
  TemperatureLevel,
  { name: string; color: string; icon: string; prompt: string }
> = {
  hot: {
    name: 'Hot Lead',
    color: '#F97316',
    icon: 'flame',
    prompt: 'High-intent lead. Asking for pricing, timeline, booking, or immediate next steps.',
  },
  warm: {
    name: 'Warm Lead',
    color: '#FACC15',
    icon: 'sun',
    prompt: 'Interested lead. Engaged in conversation, but not yet asking for immediate commitment.',
  },
  cold: {
    name: 'Cold Lead',
    color: '#60A5FA',
    icon: 'snowflake',
    prompt: 'Low-intent lead. Non-committal responses, low engagement, or no clear buying signals yet.',
  },
};

const FUNNEL_STAGE_ICON_NAME_BY_KEY: Record<FunnelStageKey, string> = {
  new_lead: 'user-plus',
  in_contact: 'message-circle',
  qualified: 'star',
  unqualified: 'x-circle',
  call_booked: 'phone-call',
  won: 'trophy',
  no_show: 'user-round-x',
};

const FUNNEL_STAGE_PROMPT_BY_KEY: Record<FunnelStageKey, string> = {
  new_lead: 'Brand new inbound lead that has not been worked yet.',
  in_contact: 'You have started a conversation with this lead.',
  qualified: 'Lead is a fit and has buying intent.',
  unqualified: 'Lead is not a fit or has been disqualified.',
  call_booked: 'A call has been booked with this lead.',
  won: 'Lead converted successfully.',
  no_show: 'Lead did not show up to the scheduled call.',
};

const normalizeTagName = (value: string | null | undefined) => String(value || '').trim().toLowerCase();
const matchesTemperatureTag = (name: string, level: TemperatureLevel) => {
  const normalized = normalizeTagName(name);
  if (level === 'hot') return normalized === 'hot lead' || normalized === 'hot';
  if (level === 'warm') return normalized === 'warm lead' || normalized === 'warm';
  return normalized === 'cold lead' || normalized === 'cold';
};

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

function pickPhaseIcon(iconName: string | null | undefined, tagName?: string | null) {
  const name = normalizeTagName(iconName);
  if (name === 'user-plus') return UserPlus;
  if (name === 'message-circle') return MessageCircle;
  if (name === 'star') return Star;
  if (name === 'x-circle') return XCircle;
  if (name === 'phone-call') return PhoneCall;
  if (name === 'trophy') return Trophy;
  if (name === 'user-round-x') return UserRoundX;
  if (name === 'tag') return TagIcon;

  const label = normalizeTagName(tagName);
  if (label === 'new lead') return UserPlus;
  if (label === 'in contact') return MessageCircle;
  if (label === 'qualified') return Star;
  if (label === 'unqualified' || label === 'disqualified') return XCircle;
  if (label === 'call booked') return PhoneCall;
  if (label === 'won') return Trophy;
  if (label === 'no show') return UserRoundX;
  return TagIcon;
}

function colorWithAlpha(color: string | null | undefined, alpha = 0.22): string {
  const value = String(color || '').trim();
  if (!value) return `rgba(255, 255, 255, ${alpha})`;

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const hex = value.slice(1).split('').map((ch) => ch + ch).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (/^#[0-9a-f]{6}$/i.test(value)) {
    const hex = value.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return value;
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
  return `${base} ago`;
}

type InstagramTagRow = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
};

type InstagramThreadRow = {
  conversation_id: string;
  instagram_user_id: string;
  peer_username: string | null;
  peer_name: string | null;
  peer_profile_picture_url: string | null;
  assigned_user_id: string | null;
  lead_status: string | null;
  last_message_at: string | null;
  last_message_text: string | null;
  ai_phase_updated_at: string | null;
  ai_phase_confidence: number | null;
  ai_temperature_confidence: number | null;
  ai_phase_reason: string | null;
  ai_phase_mode: 'shadow' | 'enforce' | null;
  ai_phase_last_run_source: 'incremental' | 'catchup' | 'backfill' | 'manual_rephase' | null;
};

type WorkspaceMemberRow = {
  user_id: string;
  role: string | null;
  display_name: string | null;
};

function pickLeadLabel(t: InstagramThreadRow) {
  const name = String(t.peer_name || '').trim();
  if (name) return name;
  const username = String(t.peer_username || '').trim();
  if (username) return username;
  return 'Instagram lead';
}

function pickLeadHandle(t: InstagramThreadRow) {
  const username = String(t.peer_username || '').trim();
  return username ? `@${username}` : '';
}

function computeLeadTemperature(tagIds: string[], tagById: Record<string, InstagramTagRow>): TemperatureLevel | null {
  let hasHot = false;
  let hasWarm = false;
  let hasCold = false;
  for (const id of tagIds) {
    const name = tagById[id]?.name || '';
    if (matchesTemperatureTag(name, 'hot')) hasHot = true;
    if (matchesTemperatureTag(name, 'warm')) hasWarm = true;
    if (matchesTemperatureTag(name, 'cold')) hasCold = true;
  }
  if (hasHot) return 'hot';
  if (hasWarm) return 'warm';
  if (hasCold) return 'cold';
  return null;
}

function computeLeadFunnelStage(thread: InstagramThreadRow, tagIds: string[], tagById: Record<string, InstagramTagRow>): FunnelStageKey {
  const status = normalizeTagName(thread.lead_status);
  if (status === 'qualified') return 'qualified';
  if (status === 'disqualified') return 'unqualified';

  const stages = new Set<FunnelStageKey>();
  for (const id of tagIds) {
    const key = funnelStageKeyFromTagName(tagById[id]?.name);
    if (key) stages.add(key);
  }
  for (const key of FUNNEL_STAGE_ORDER) {
    if (stages.has(key)) return key;
  }
  return 'new_lead';
}

function escapeCsvValue(value: any) {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function CsvFilterLeadsPanel() {
  const { user } = useAuth();
  const { runs, loading: runsLoading, createRun, deleteRun } = useFilterRuns();

  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [includeKeywords, setIncludeKeywords] = useState<string[]>([]);
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [generateOpenersEnabled, setGenerateOpenersEnabled] = useState(false);
  const [openerStyle, setOpenerStyle] = useState<OpenerStyle>('pain-driven');
  const [customScript, setCustomScript] = useState('');
  const [openerProgress, setOpenerProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const { data, headers: parsedHeaders } = await parseCSV(file);
      setCsvData(data);
      setHeaders(parsedHeaders);
      setFileName(file.name);
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      toast.error('Failed to parse CSV');
    }
  }, []);

  const handleStart = useCallback(async () => {
    if (csvData.length === 0 || !user) return;

    setIsProcessing(true);
    setOpenerProgress(null);

    const { filtered, matchedIncludes } = filterData(csvData, headers, includeKeywords, excludeKeywords);

    const enrichedData = filtered.map((row) => {
      const originalIndex = csvData.indexOf(row);
      return enrichRow(row, headers, matchedIncludes.get(originalIndex) || [], []);
    });

    let finalData = enrichedData;
    let promptSnapshot: string | null = null;

    if (generateOpenersEnabled) {
      promptSnapshot = getPromptTemplate(openerStyle, customScript);

      if (enrichedData.length > 0) {
        setOpenerProgress({ current: 0, total: enrichedData.length });

        const openerResults = await generateOpeners(
          enrichedData,
          headers,
          openerStyle,
          customScript,
          (current, total) => setOpenerProgress({ current, total })
        );

        finalData = enrichedData.map((row, index) => {
          const result = openerResults.get(index);
          return { ...row, opener: result?.opener || '', openerError: result?.error || '' };
        });
      }
    } else {
      finalData = enrichedData.map((row) => ({ ...row, opener: '' }));
    }

    const runNumber = runs.length + 1;

    await createRun({
      name: `Run ${runNumber}`,
      timestamp: new Date(),
      totalProfiles: csvData.length,
      matchingProfiles: finalData.length,
      includeKeywords: [...includeKeywords],
      excludeKeywords: [...excludeKeywords],
      filteredData: finalData,
      originalHeaders: headers,
      promptId: generateOpenersEnabled ? openerStyle : null,
      promptSnapshot: generateOpenersEnabled ? promptSnapshot : null,
      generateOpeners: generateOpenersEnabled,
    });

    setIsProcessing(false);
    setOpenerProgress(null);
    toast.success('Run saved');
  }, [csvData, headers, includeKeywords, excludeKeywords, runs.length, generateOpenersEnabled, openerStyle, customScript, user, createRun]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <FileUpload onFileSelect={handleFileSelect} fileName={fileName} />

        {csvData.length > 0 ? (
          <p className="text-sm text-white/55">{csvData.length.toLocaleString()} profiles loaded</p>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <KeywordInput
            label="Include Keywords"
            keywords={includeKeywords}
            onAdd={(k) => setIncludeKeywords((p) => [...p, k])}
            onRemove={(k) => setIncludeKeywords((p) => p.filter((x) => x !== k))}
            placeholder="Add keyword..."
          />
          <KeywordInput
            label="Exclude Keywords"
            keywords={excludeKeywords}
            onAdd={(k) => setExcludeKeywords((p) => [...p, k])}
            onRemove={(k) => setExcludeKeywords((p) => p.filter((x) => x !== k))}
            placeholder="Add keyword..."
          />
        </div>

        <OpenerToggle
          enabled={generateOpenersEnabled}
          onToggle={setGenerateOpenersEnabled}
          style={openerStyle}
          onStyleChange={setOpenerStyle}
          customScript={customScript}
          onCustomScriptChange={setCustomScript}
        />

        <Button
          onClick={handleStart}
          disabled={csvData.length === 0 || isProcessing || (includeKeywords.length === 0 && excludeKeywords.length === 0)}
          className="w-full h-12 text-sm font-medium"
        >
          {isProcessing
            ? openerProgress
              ? `Generating openers: ${openerProgress.current}/${openerProgress.total}`
              : 'Processing...'
            : `Start Filtering${csvData.length > 0 ? ` (${csvData.length.toLocaleString()} profiles)` : ''}`}
        </Button>

        {openerProgress ? (
          <Progress value={(openerProgress.current / openerProgress.total) * 100} className="h-2" />
        ) : null}
      </div>

      <div>
        <h2 className="text-xs text-white/45 uppercase tracking-wider mb-4">Run History</h2>
        {runsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="border border-white/10 rounded-2xl p-4 bg-black">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-44 rounded-xl bg-white/[0.10]" />
                    <Skeleton className="h-3 w-64 rounded-xl bg-white/[0.06] mt-2" />
                  </div>
                  <Skeleton className="h-9 w-28 rounded-xl bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <RunHistory runs={runs} onDelete={(id) => deleteRun(id)} />
        )}
      </div>
    </div>
  );
}

export default function Outreach() {
  const { workspace, userRole } = useWorkspace();
  const { user } = useAuth();

  const [threads, setThreads] = useState<InstagramThreadRow[]>([]);
  const [tags, setTags] = useState<InstagramTagRow[]>([]);
  const [conversationTagIds, setConversationTagIds] = useState<Record<string, string[]>>({});
  const [manualLockByConversationId, setManualLockByConversationId] = useState<Record<string, boolean>>({});
  const [members, setMembers] = useState<WorkspaceMemberRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [range, setRange] = useState<'all' | 'today' | 'yesterday' | 'last7' | 'last30'>('all');
  const [assigned, setAssigned] = useState<'all' | 'unassigned' | string>('all');
  const [stage, setStage] = useState<'all' | FunnelStageKey>('all');
  const [temperature, setTemperature] = useState<'all' | TemperatureLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const setterFastLeadsInFlightRef = useRef(false);
  const setterFastLeadsSinceMsRef = useRef<number>(Date.now());
  const setterFastLeadsWorkspaceRef = useRef<string | null>(null);

  const tagById = useMemo(() => {
    const out: Record<string, InstagramTagRow> = {};
    for (const t of tags) out[t.id] = t;
    return out;
  }, [tags]);

  const memberByUserId = useMemo(() => {
    const out: Record<string, { name: string; role: string }> = {};
    for (const m of members) {
      const id = String(m.user_id || '');
      if (!id) continue;
      out[id] = {
        name: String(m.display_name || 'Team member'),
        role: String(m.role || ''),
      };
    }
    return out;
  }, [members]);

  const temperatureTagByLevel = useMemo(() => {
    const out: Record<TemperatureLevel, InstagramTagRow | null> = {
      hot: null,
      warm: null,
      cold: null,
    };
    for (const tag of tags) {
      if (!out.hot && matchesTemperatureTag(tag.name, 'hot')) out.hot = tag;
      if (!out.warm && matchesTemperatureTag(tag.name, 'warm')) out.warm = tag;
      if (!out.cold && matchesTemperatureTag(tag.name, 'cold')) out.cold = tag;
    }
    return out;
  }, [tags]);

  const funnelStageTagIds = useMemo(() => {
    return tags
      .filter((tag) => Boolean(funnelStageKeyFromTagName(tag?.name)))
      .map((tag) => tag.id);
  }, [tags]);

  const managedAutoPhaseTagIds = useMemo(() => {
    return tags
      .filter((tag) => {
        if (Boolean(funnelStageKeyFromTagName(tag?.name))) return true;
        if (matchesTemperatureTag(String(tag?.name || ''), 'hot')) return true;
        if (matchesTemperatureTag(String(tag?.name || ''), 'warm')) return true;
        if (matchesTemperatureTag(String(tag?.name || ''), 'cold')) return true;
        return false;
      })
      .map((tag) => tag.id);
  }, [tags]);

  const refreshManualLockForConversation = useCallback(
    async (conversationId: string) => {
      const convId = String(conversationId || '').trim();
      if (!workspace?.id || !convId) return;
      if (managedAutoPhaseTagIds.length === 0) {
        setManualLockByConversationId((prev) => {
          if (!(convId in prev)) return prev;
          const next = { ...prev };
          delete next[convId];
          return next;
        });
        return;
      }

      const { data, error } = await (supabase as any)
        .from('instagram_conversation_tags')
        .select('tag_id,source')
        .eq('workspace_id', workspace.id)
        .eq('conversation_id', convId)
        .in('tag_id', managedAutoPhaseTagIds);

      if (error) return;

      const hasManual = (Array.isArray(data) ? data : []).some((row: any) => {
        const source = normalizeTagName(row?.source || '');
        return source && source !== 'ai' && source !== 'retag';
      });

      setManualLockByConversationId((prev) => {
        if (!hasManual && !(convId in prev)) return prev;
        if (!hasManual) {
          const next = { ...prev };
          delete next[convId];
          return next;
        }
        if (prev[convId]) return prev;
        return { ...prev, [convId]: true };
      });
    },
    [workspace?.id, managedAutoPhaseTagIds]
  );

  const funnelStageTagByKey = useMemo(() => {
    const out: Record<FunnelStageKey, InstagramTagRow | null> = {
      new_lead: null,
      in_contact: null,
      qualified: null,
      unqualified: null,
      call_booked: null,
      won: null,
      no_show: null,
    };
    for (const tag of tags) {
      const key = funnelStageKeyFromTagName(tag?.name);
      if (!key) continue;
      if (!out[key]) out[key] = tag;
    }
    return out;
  }, [tags]);

  const funnelStageVisualByKey = useMemo(() => {
    const out: Record<FunnelStageKey, { label: string; color: string; iconName: string }> = {
      new_lead: { label: FUNNEL_STAGE_PRESETS.new_lead.label, color: FUNNEL_STAGE_PRESETS.new_lead.color, iconName: FUNNEL_STAGE_ICON_NAME_BY_KEY.new_lead },
      in_contact: { label: FUNNEL_STAGE_PRESETS.in_contact.label, color: FUNNEL_STAGE_PRESETS.in_contact.color, iconName: FUNNEL_STAGE_ICON_NAME_BY_KEY.in_contact },
      qualified: { label: FUNNEL_STAGE_PRESETS.qualified.label, color: FUNNEL_STAGE_PRESETS.qualified.color, iconName: FUNNEL_STAGE_ICON_NAME_BY_KEY.qualified },
      unqualified: { label: FUNNEL_STAGE_PRESETS.unqualified.label, color: FUNNEL_STAGE_PRESETS.unqualified.color, iconName: FUNNEL_STAGE_ICON_NAME_BY_KEY.unqualified },
      call_booked: { label: FUNNEL_STAGE_PRESETS.call_booked.label, color: FUNNEL_STAGE_PRESETS.call_booked.color, iconName: FUNNEL_STAGE_ICON_NAME_BY_KEY.call_booked },
      won: { label: FUNNEL_STAGE_PRESETS.won.label, color: FUNNEL_STAGE_PRESETS.won.color, iconName: FUNNEL_STAGE_ICON_NAME_BY_KEY.won },
      no_show: { label: FUNNEL_STAGE_PRESETS.no_show.label, color: FUNNEL_STAGE_PRESETS.no_show.color, iconName: FUNNEL_STAGE_ICON_NAME_BY_KEY.no_show },
    };

    for (const key of FUNNEL_STAGE_ORDER) {
      const tag = funnelStageTagByKey[key];
      if (!tag) continue;
      out[key] = {
        label: String(tag.name || out[key].label),
        color: String(tag.color || out[key].color),
        iconName: String(tag.icon || out[key].iconName),
      };
    }

    return out;
  }, [funnelStageTagByKey]);

  const ensureTemperatureTag = useCallback(
    async (level: TemperatureLevel): Promise<InstagramTagRow | null> => {
      const existing = temperatureTagByLevel[level];
      if (existing) return existing;

      if (!workspace?.id || !user?.id) return null;
      if (userRole === 'setter') return null;

      const preset = TEMPERATURE_TAG_SEED_PRESETS[level];
      const { data, error } = await (supabase as any)
        .from('instagram_tags')
        .insert({
          workspace_id: workspace.id,
          name: preset.name,
          color: preset.color,
          icon: preset.icon,
          prompt: preset.prompt,
          created_by: user.id,
        })
        .select('id,name,color,icon')
        .maybeSingle();
      if (error) {
        toast.error(error?.message || `Failed to create ${preset.name}`);
        return null;
      }
      if (!data?.id) return null;

      const created: InstagramTagRow = {
        id: String(data.id),
        name: String(data.name || preset.name),
        color: data.color != null ? String(data.color) : preset.color,
        icon: data.icon != null ? String(data.icon) : preset.icon,
      };
      setTags((prev) => (prev.some((t) => t.id === created.id) ? prev : [...prev, created]));
      return created;
    },
    [temperatureTagByLevel, workspace?.id, user?.id, userRole]
  );

  const setConversationTemperature = useCallback(
    async (conversationId: string, next: TemperatureLevel | null) => {
      if (!workspace?.id) return;
      if (!conversationId) return;

      const prevIds = conversationTagIds[conversationId] || [];
      const current = new Set(prevIds);

      const tempIds = new Set(
        (['hot', 'warm', 'cold'] as TemperatureLevel[])
          .map((k) => temperatureTagByLevel[k]?.id)
          .filter(Boolean) as string[]
      );

      let targetTag: InstagramTagRow | null = null;
      if (next) {
        targetTag = await ensureTemperatureTag(next);
        if (!targetTag) return;
        tempIds.add(targetTag.id);
      }

      const nextIds = new Set(current);
      for (const id of Array.from(nextIds)) {
        if (tempIds.has(id)) nextIds.delete(id);
      }
      if (targetTag) nextIds.add(targetTag.id);

      setConversationTagIds((prev) => ({ ...prev, [conversationId]: Array.from(nextIds) }));

      try {
        const toRemove = Array.from(current).filter((id) => tempIds.has(id) && (!targetTag || id !== targetTag.id));
        if (toRemove.length > 0) {
          const { error } = await (supabase as any)
            .from('instagram_conversation_tags')
            .delete()
            .eq('workspace_id', workspace.id)
            .eq('conversation_id', conversationId)
            .in('tag_id', toRemove);
          if (error) throw error;
        }

        if (targetTag && !current.has(targetTag.id)) {
          const { error } = await (supabase as any)
            .from('instagram_conversation_tags')
            .insert({
              workspace_id: workspace.id,
              conversation_id: conversationId,
              tag_id: targetTag.id,
              source: 'manual',
              created_by: user?.id || null,
            });
          if (error && String(error?.code || '') !== '23505') throw error;
        }
      } catch (error: any) {
        setConversationTagIds((prev) => ({ ...prev, [conversationId]: prevIds }));
        toast.error(error?.message || 'Failed to update temperature');
      }
    },
    [
      workspace?.id,
      user?.id,
      conversationTagIds,
      temperatureTagByLevel,
      ensureTemperatureTag,
    ]
  );

  const ensureFunnelStageTagId = useCallback(
    async (key: FunnelStageKey): Promise<string | null> => {
      const canonicalName = FUNNEL_STAGE_PRESETS[key]?.label || '';
      const canonicalNormalized = normalizeTagName(canonicalName);
      const existing =
        tags.find((t) => normalizeTagName(t.name) === canonicalNormalized) ||
        tags.find((t) => funnelStageKeyFromTagName(t.name) === key) ||
        null;
      if (existing?.id) return existing.id;

      if (!workspace?.id || !user?.id) return null;
      if (userRole === 'setter') return null;

      const { data, error } = await (supabase as any)
        .from('instagram_tags')
        .insert({
          workspace_id: workspace.id,
          name: canonicalName,
          color: FUNNEL_STAGE_PRESETS[key]?.color || '#9ca3af',
          icon: FUNNEL_STAGE_ICON_NAME_BY_KEY[key] || 'tag',
          prompt: FUNNEL_STAGE_PROMPT_BY_KEY[key] || null,
          created_by: user.id,
        })
        .select('id,name,color,icon')
        .maybeSingle();
      if (error) {
        toast.error(error?.message || `Failed to create ${canonicalName || 'phase'} tag`);
        return null;
      }
      if (!data?.id) return null;

      const created: InstagramTagRow = {
        id: String(data.id),
        name: String(data.name || canonicalName),
        color: data.color != null ? String(data.color) : FUNNEL_STAGE_PRESETS[key]?.color || null,
        icon: data.icon != null ? String(data.icon) : FUNNEL_STAGE_ICON_NAME_BY_KEY[key] || null,
      };
      setTags((prev) => (prev.some((t) => t.id === created.id) ? prev : [...prev, created]));
      return created.id;
    },
    [tags, workspace?.id, user?.id, userRole]
  );

  const setConversationPhase = useCallback(
    async (conversationId: string, next: FunnelStageKey) => {
      if (!workspace?.id) return;
      if (!conversationId) return;

      const targetTagId = await ensureFunnelStageTagId(next);
      if (!targetTagId) {
        toast.error('Phase tags are missing. Run migrations or connect Instagram to seed them.');
        return;
      }

      const prevIds = conversationTagIds[conversationId] || [];
      const current = new Set(prevIds);
      const stageIds = new Set(funnelStageTagIds);

      const nextIds = new Set(current);
      for (const id of Array.from(nextIds)) {
        if (stageIds.has(id)) nextIds.delete(id);
      }
      nextIds.add(targetTagId);

      const prevLeadStatus = threads.find((t) => String(t.conversation_id) === String(conversationId))?.lead_status || null;
      const nextLeadStatus =
        next === 'qualified' ? 'qualified' : next === 'unqualified' ? 'disqualified' : 'open';

      setConversationTagIds((prev) => ({ ...prev, [conversationId]: Array.from(nextIds) }));
      setThreads((prev) =>
        prev.map((t) =>
          String(t.conversation_id) === String(conversationId)
            ? { ...t, lead_status: nextLeadStatus }
            : t
        )
      );

      try {
        const toRemove = Array.from(current).filter((id) => stageIds.has(id) && id !== targetTagId);
        if (toRemove.length > 0) {
          const { error } = await (supabase as any)
            .from('instagram_conversation_tags')
            .delete()
            .eq('workspace_id', workspace.id)
            .eq('conversation_id', conversationId)
            .in('tag_id', toRemove);
          if (error) throw error;
        }

        if (!current.has(targetTagId)) {
          const { error } = await (supabase as any)
            .from('instagram_conversation_tags')
            .insert({
              workspace_id: workspace.id,
              conversation_id: conversationId,
              tag_id: targetTagId,
              source: 'manual',
              created_by: user?.id || null,
            });
          if (error && String(error?.code || '') !== '23505') throw error;
        }

        const { error: statusError } = await (supabase as any)
          .from('instagram_threads')
          .update({ lead_status: nextLeadStatus })
          .eq('workspace_id', workspace.id)
          .eq('conversation_id', conversationId);
        if (statusError) throw statusError;
      } catch (error: any) {
        setConversationTagIds((prev) => ({ ...prev, [conversationId]: prevIds }));
        setThreads((prev) =>
          prev.map((t) =>
            String(t.conversation_id) === String(conversationId)
              ? { ...t, lead_status: prevLeadStatus }
              : t
          )
        );
        toast.error(error?.message || 'Failed to update phase');
      }
    },
    [
      workspace?.id,
      user?.id,
      tags,
      threads,
      conversationTagIds,
      funnelStageTagIds,
      ensureFunnelStageTagId,
    ]
  );

  const loadLeads = useCallback(async () => {
    if (!workspace?.id) return;
    setIsLoading(true);
    try {
      const [threadsRes, tagsRes, membersRes] = await Promise.all([
        (supabase as any)
          .from('instagram_threads')
          .select(
            'conversation_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,assigned_user_id,lead_status,last_message_at,last_message_text,ai_phase_updated_at,ai_phase_confidence,ai_temperature_confidence,ai_phase_reason,ai_phase_mode,ai_phase_last_run_source'
          )
          .eq('workspace_id', workspace.id)
          .neq('lead_status', 'removed')
          .order('last_message_at', { ascending: false })
          .limit(1000),
        (supabase as any)
          .from('instagram_tags')
          .select('id,name,color,icon')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: true }),
        (supabase as any)
          .from('workspace_members')
          .select('user_id,role,display_name')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: true }),
      ]);

      if (threadsRes.error) throw threadsRes.error;
      if (tagsRes.error) throw tagsRes.error;
      if (membersRes.error) throw membersRes.error;

      const nextThreads = Array.isArray(threadsRes.data) ? (threadsRes.data as InstagramThreadRow[]) : [];
      const nextTags = Array.isArray(tagsRes.data) ? (tagsRes.data as InstagramTagRow[]) : [];
      const nextMembers = Array.isArray(membersRes.data) ? (membersRes.data as WorkspaceMemberRow[]) : [];
      const managedSet = new Set(
        nextTags
          .filter((tag) => {
            if (Boolean(funnelStageKeyFromTagName(tag?.name))) return true;
            if (matchesTemperatureTag(String(tag?.name || ''), 'hot')) return true;
            if (matchesTemperatureTag(String(tag?.name || ''), 'warm')) return true;
            if (matchesTemperatureTag(String(tag?.name || ''), 'cold')) return true;
            return false;
          })
          .map((tag) => String(tag.id))
      );

      const convIds = nextThreads.map((t) => String(t.conversation_id)).filter(Boolean);
      let links: any[] = [];
      if (convIds.length > 0) {
        const linkRes = await (supabase as any)
          .from('instagram_conversation_tags')
          .select('conversation_id,tag_id,source')
          .eq('workspace_id', workspace.id)
          .in('conversation_id', convIds);
        if (linkRes.error) throw linkRes.error;
        links = Array.isArray(linkRes.data) ? linkRes.data : [];
      }

      const nextConversationTagIds: Record<string, string[]> = {};
      const nextManualLocks: Record<string, boolean> = {};
      for (const row of links) {
        const convId = String(row.conversation_id || '');
        const tId = String(row.tag_id || '');
        if (!convId || !tId) continue;
        if (!nextConversationTagIds[convId]) nextConversationTagIds[convId] = [];
        nextConversationTagIds[convId].push(tId);
        if (managedSet.has(tId)) {
          const source = normalizeTagName((row as any)?.source || '');
          if (source && source !== 'ai' && source !== 'retag') {
            nextManualLocks[convId] = true;
          }
        }
      }

      setThreads(nextThreads);
      setTags(nextTags);
      setMembers(nextMembers);
      setConversationTagIds(nextConversationTagIds);
      setManualLockByConversationId(nextManualLocks);
    } catch (error: any) {
      console.error('Failed to load leads:', error);
      toast.error(error?.message || 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [workspace?.id]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Realtime sync so tags/assignment updates in Inbox reflect instantly here.
  useEffect(() => {
    if (!workspace?.id) return;
    const wsId = workspace.id;

    const toThreadRow = (row: any): InstagramThreadRow | null => {
      if (!row?.conversation_id) return null;
      return {
        conversation_id: String(row.conversation_id),
        instagram_user_id: String(row.instagram_user_id || ''),
        peer_username: row.peer_username != null ? String(row.peer_username) : null,
        peer_name: row.peer_name != null ? String(row.peer_name) : null,
        peer_profile_picture_url: row.peer_profile_picture_url != null ? String(row.peer_profile_picture_url) : null,
        assigned_user_id: row.assigned_user_id != null ? String(row.assigned_user_id) : null,
        lead_status: row.lead_status != null ? String(row.lead_status) : null,
        last_message_at: row.last_message_at != null ? String(row.last_message_at) : null,
        last_message_text: row.last_message_text != null ? String(row.last_message_text) : null,
        ai_phase_updated_at: row.ai_phase_updated_at != null ? String(row.ai_phase_updated_at) : null,
        ai_phase_confidence:
          row.ai_phase_confidence != null && Number.isFinite(Number(row.ai_phase_confidence))
            ? Number(row.ai_phase_confidence)
            : null,
        ai_temperature_confidence:
          row.ai_temperature_confidence != null && Number.isFinite(Number(row.ai_temperature_confidence))
            ? Number(row.ai_temperature_confidence)
            : null,
        ai_phase_reason: row.ai_phase_reason != null ? String(row.ai_phase_reason) : null,
        ai_phase_mode: row.ai_phase_mode === 'shadow' || row.ai_phase_mode === 'enforce' ? row.ai_phase_mode : null,
        ai_phase_last_run_source:
          row.ai_phase_last_run_source === 'incremental' ||
          row.ai_phase_last_run_source === 'catchup' ||
          row.ai_phase_last_run_source === 'backfill' ||
          row.ai_phase_last_run_source === 'manual_rephase'
            ? row.ai_phase_last_run_source
            : null,
      };
    };

    const threadLastMs = (t: InstagramThreadRow) => {
      const ms = t.last_message_at ? Date.parse(String(t.last_message_at)) : 0;
      return Number.isFinite(ms) ? ms : 0;
    };

    const channel = (supabase as any)
      .channel(`leads:${wsId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'instagram_threads', filter: `workspace_id=eq.${wsId}` },
        (payload: any) => {
          const eventType = String(payload?.eventType || '');
          const raw = eventType === 'DELETE' ? payload?.old : payload?.new;
          const row = toThreadRow(raw);
          if (!row) return;

          if (eventType === 'DELETE') {
            setThreads((prev) => prev.filter((t) => t.conversation_id !== row.conversation_id));
            setSelectedConversationIds((prev) => prev.filter((id) => id !== row.conversation_id));
            setConversationTagIds((prev) => {
              if (!(row.conversation_id in prev)) return prev;
              const next = { ...prev };
              delete next[row.conversation_id];
              return next;
            });
            setManualLockByConversationId((prev) => {
              if (!(row.conversation_id in prev)) return prev;
              const next = { ...prev };
              delete next[row.conversation_id];
              return next;
            });
            return;
          }

          // Keep the table consistent with Inbox (removed leads are hidden).
          if (normalizeTagName(row.lead_status) === 'removed') {
            setThreads((prev) => prev.filter((t) => t.conversation_id !== row.conversation_id));
            setSelectedConversationIds((prev) => prev.filter((id) => id !== row.conversation_id));
            setManualLockByConversationId((prev) => {
              if (!(row.conversation_id in prev)) return prev;
              const next = { ...prev };
              delete next[row.conversation_id];
              return next;
            });
            return;
          }

          setThreads((prev) => {
            const idx = prev.findIndex((t) => t.conversation_id === row.conversation_id);
            const next =
              idx >= 0
                ? [...prev.slice(0, idx), { ...prev[idx], ...row }, ...prev.slice(idx + 1)]
                : [...prev, row];
            next.sort((a, b) => threadLastMs(b) - threadLastMs(a));
            return next;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'instagram_conversation_tags', filter: `workspace_id=eq.${wsId}` },
        (payload: any) => {
          const eventType = String(payload?.eventType || '');
          const raw = eventType === 'DELETE' ? payload?.old : payload?.new;
          const convId = raw?.conversation_id ? String(raw.conversation_id) : '';
          const tId = raw?.tag_id ? String(raw.tag_id) : '';
          if (!convId || !tId) return;

          setConversationTagIds((prev) => {
            const current = new Set(prev[convId] || []);
            if (eventType === 'DELETE') current.delete(tId);
            else current.add(tId);
            return { ...prev, [convId]: Array.from(current) };
          });

          if (managedAutoPhaseTagIds.includes(tId)) {
            const source = normalizeTagName(raw?.source || '');
            if (eventType !== 'DELETE' && source && source !== 'ai' && source !== 'retag') {
              setManualLockByConversationId((prev) => ({ ...prev, [convId]: true }));
            } else {
              refreshManualLockForConversation(convId);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'instagram_tags', filter: `workspace_id=eq.${wsId}` },
        (payload: any) => {
          const eventType = String(payload?.eventType || '');
          const raw = eventType === 'DELETE' ? payload?.old : payload?.new;
          const id = raw?.id ? String(raw.id) : '';
          if (!id) return;

	          if (eventType === 'DELETE') {
	            setTags((prev) => prev.filter((t) => t.id !== id));
	            return;
	          }

          const nextTag: InstagramTagRow = {
            id,
            name: String(raw?.name || 'Tag'),
            color: raw?.color != null ? String(raw.color) : null,
            icon: raw?.icon != null ? String(raw.icon) : null,
          };
          setTags((prev) => {
            const idx = prev.findIndex((t) => t.id === id);
            if (idx >= 0) return [...prev.slice(0, idx), { ...prev[idx], ...nextTag }, ...prev.slice(idx + 1)];
            return [...prev, nextTag];
          });
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [workspace?.id, managedAutoPhaseTagIds, refreshManualLockForConversation]);

  // Setters: fast DB poll to reflect newly-assigned leads quickly (Realtime + RLS can miss rows becoming visible).
  useEffect(() => {
    if (!workspace?.id) return;
    if (userRole !== 'setter') return;
    const wsId = workspace.id;

    if (setterFastLeadsWorkspaceRef.current !== wsId) {
      setterFastLeadsWorkspaceRef.current = wsId;
      setterFastLeadsSinceMsRef.current = Date.now() - 10_000;
    }

    let cancelled = false;

    const toThreadRow = (row: any): InstagramThreadRow | null => {
      if (!row?.conversation_id) return null;
      return {
        conversation_id: String(row.conversation_id),
        instagram_user_id: String(row.instagram_user_id || ''),
        peer_username: row.peer_username != null ? String(row.peer_username) : null,
        peer_name: row.peer_name != null ? String(row.peer_name) : null,
        peer_profile_picture_url: row.peer_profile_picture_url != null ? String(row.peer_profile_picture_url) : null,
        assigned_user_id: row.assigned_user_id != null ? String(row.assigned_user_id) : null,
        lead_status: row.lead_status != null ? String(row.lead_status) : null,
        last_message_at: row.last_message_at != null ? String(row.last_message_at) : null,
        last_message_text: row.last_message_text != null ? String(row.last_message_text) : null,
        ai_phase_updated_at: row.ai_phase_updated_at != null ? String(row.ai_phase_updated_at) : null,
        ai_phase_confidence:
          row.ai_phase_confidence != null && Number.isFinite(Number(row.ai_phase_confidence))
            ? Number(row.ai_phase_confidence)
            : null,
        ai_temperature_confidence:
          row.ai_temperature_confidence != null && Number.isFinite(Number(row.ai_temperature_confidence))
            ? Number(row.ai_temperature_confidence)
            : null,
        ai_phase_reason: row.ai_phase_reason != null ? String(row.ai_phase_reason) : null,
        ai_phase_mode: row.ai_phase_mode === 'shadow' || row.ai_phase_mode === 'enforce' ? row.ai_phase_mode : null,
        ai_phase_last_run_source:
          row.ai_phase_last_run_source === 'incremental' ||
          row.ai_phase_last_run_source === 'catchup' ||
          row.ai_phase_last_run_source === 'backfill' ||
          row.ai_phase_last_run_source === 'manual_rephase'
            ? row.ai_phase_last_run_source
            : null,
      };
    };

    const threadLastMs = (t: InstagramThreadRow) => {
      const ms = t.last_message_at ? Date.parse(String(t.last_message_at)) : 0;
      return Number.isFinite(ms) ? ms : 0;
    };

    const run = async () => {
      if (cancelled) return;
      if (setterFastLeadsInFlightRef.current) return;
      setterFastLeadsInFlightRef.current = true;
      try {
        const sinceIso = new Date(setterFastLeadsSinceMsRef.current).toISOString();
        const res = await (supabase as any)
          .from('instagram_threads')
          .select(
            'conversation_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,assigned_user_id,lead_status,last_message_at,last_message_text,ai_phase_updated_at,ai_phase_confidence,ai_temperature_confidence,ai_phase_reason,ai_phase_mode,ai_phase_last_run_source,updated_at'
          )
          .eq('workspace_id', wsId)
          .gt('updated_at', sinceIso)
          .order('updated_at', { ascending: false, nullsFirst: false })
          .limit(250);
        if (res.error) return;

        const rows = Array.isArray(res.data) ? res.data : [];
        if (rows.length === 0) return;

        let maxUpdated = setterFastLeadsSinceMsRef.current;
        const nextRows: InstagramThreadRow[] = [];
        const convIds: string[] = [];

        for (const row of rows) {
          const updatedAt = row?.updated_at ? String(row.updated_at) : '';
          if (updatedAt) {
            const ms = Date.parse(updatedAt);
            if (Number.isFinite(ms) && ms > maxUpdated) maxUpdated = ms;
          }
          const t = toThreadRow(row);
          if (!t) continue;
          // Keep the table consistent with Inbox (removed leads are hidden).
          if (normalizeTagName(t.lead_status) === 'removed') continue;
          nextRows.push(t);
          convIds.push(String(t.conversation_id));
        }

        if (nextRows.length === 0) return;
        setterFastLeadsSinceMsRef.current = maxUpdated;

        setThreads((prev) => {
          const byId = new Map<string, InstagramThreadRow>();
          for (const t of prev) byId.set(String(t.conversation_id), t);
          for (const t of nextRows) {
            const id = String(t.conversation_id);
            const existing = byId.get(id);
            byId.set(id, existing ? { ...existing, ...t } : t);
          }
          const next = Array.from(byId.values());
          next.sort((a, b) => threadLastMs(b) - threadLastMs(a));
          return next;
        });

        // Pull tag links for any updated/new conversations so filtering stays correct.
        const uniqueConvIds = Array.from(new Set(convIds)).slice(0, 250);
        if (uniqueConvIds.length > 0) {
          const linkRes = await (supabase as any)
            .from('instagram_conversation_tags')
            .select('conversation_id,tag_id,source')
            .eq('workspace_id', wsId)
            .in('conversation_id', uniqueConvIds);
          if (!linkRes.error) {
            const links = Array.isArray(linkRes.data) ? linkRes.data : [];
            setConversationTagIds((prev) => {
              const next = { ...prev };
              for (const row of links) {
                const cId = String(row?.conversation_id || '');
                const tId = String(row?.tag_id || '');
                if (!cId || !tId) continue;
                const set = new Set(next[cId] || []);
                set.add(tId);
                next[cId] = Array.from(set);
              }
              return next;
            });

            const managedSet = new Set(managedAutoPhaseTagIds);
            const nextManual: Record<string, boolean> = {};
            for (const row of links) {
              const cId = String(row?.conversation_id || '');
              const tId = String(row?.tag_id || '');
              if (!cId || !tId || !managedSet.has(tId)) continue;
              const source = normalizeTagName((row as any)?.source || '');
              if (source && source !== 'ai' && source !== 'retag') {
                nextManual[cId] = true;
              }
            }
            setManualLockByConversationId((prev) => {
              const next = { ...prev };
              for (const cId of uniqueConvIds) {
                if (nextManual[cId]) next[cId] = true;
                else delete next[cId];
              }
              return next;
            });
          }
        }
      } finally {
        setterFastLeadsInFlightRef.current = false;
      }
    };

    const t = setTimeout(run, 1200);
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      run();
    }, 3500);
    const onFocus = () => run();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      clearTimeout(t);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [workspace?.id, userRole, managedAutoPhaseTagIds]);

  const filteredThreads = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const startMs =
      range === 'today'
        ? new Date(new Date().toDateString()).getTime()
        : range === 'yesterday'
          ? new Date(new Date(now - dayMs).toDateString()).getTime()
          : range === 'last7'
            ? now - 7 * dayMs
            : range === 'last30'
              ? now - 30 * dayMs
              : 0;

    const q = searchQuery.trim().toLowerCase();

    return threads.filter((t) => {
      const convId = String(t.conversation_id || '');
      const tagIds = conversationTagIds[convId] || [];

      if (startMs) {
        const tMs = t.last_message_at ? Date.parse(String(t.last_message_at)) : 0;
        if (!tMs || tMs < startMs) return false;
      }

      if (assigned === 'unassigned') {
        if (t.assigned_user_id) return false;
      } else if (assigned !== 'all') {
        if (String(t.assigned_user_id || '') !== assigned) return false;
      }

      if (stage !== 'all') {
        const s = computeLeadFunnelStage(t, tagIds, tagById);
        if (s !== stage) return false;
      }

      if (temperature !== 'all') {
        const temp = computeLeadTemperature(tagIds, tagById);
        if (temp !== temperature) return false;
      }

      if (q) {
        const name = pickLeadLabel(t).toLowerCase();
        const handle = pickLeadHandle(t).toLowerCase();
        const snippet = String(t.last_message_text || '').toLowerCase();
        if (!name.includes(q) && !handle.includes(q) && !snippet.includes(q)) return false;
      }

      return true;
    });
  }, [threads, range, assigned, stage, temperature, searchQuery, conversationTagIds, tagById]);

  const shownCount = filteredThreads.length;

  const totalPages = Math.max(1, Math.ceil(shownCount / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filteredThreads.slice(safePage * pageSize, safePage * pageSize + pageSize);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const handleExport = () => {
    const exportRows = filteredThreads;

    const lines: string[] = [];
    lines.push(['lead_name', 'instagram_handle', 'phase', 'temperature', 'assigned_to', 'last_interacted'].join(','));

    for (const t of exportRows) {
      const convId = String(t.conversation_id || '');
      const tagIds = conversationTagIds[convId] || [];

      const stageKey = computeLeadFunnelStage(t, tagIds, tagById);
      const tempKey = computeLeadTemperature(tagIds, tagById);
      const stageLabel = funnelStageVisualByKey[stageKey]?.label || stageKey;

      const assignedName = t.assigned_user_id ? memberByUserId[String(t.assigned_user_id)]?.name || 'Team member' : 'Unassigned';
      const interacted = t.last_message_at ? new Date(String(t.last_message_at)).toISOString() : '';

      lines.push(
        [
          escapeCsvValue(pickLeadLabel(t)),
          escapeCsvValue(pickLeadHandle(t)),
          escapeCsvValue(stageLabel),
          escapeCsvValue(tempKey ? TEMPERATURE_PRESETS[tempKey]?.label || tempKey : ''),
          escapeCsvValue(assignedName),
          escapeCsvValue(interacted),
        ].join(',')
      );
    }

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="headline-domaine text-[36px] font-medium">Leads</h1>
            <p className="text-sm text-white/45 mt-1">Track, tag, and assign your inbound leads</p>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10"
                  aria-label="Filter leads"
                  title="Filter leads"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl w-[92vw] h-[82vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Filter Leads (CSV)</DialogTitle>
                </DialogHeader>
                <CsvFilterLeadsPanel />
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10"
              onClick={handleExport}
              disabled={filteredThreads.length === 0}
              aria-label="Export as CSV"
              title="Export as CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-11 rounded-2xl bg-black border border-white/10 pl-4 pr-3 text-[15px] font-medium text-white/85 hover:bg-white/[0.03] transition-colors inline-flex items-center gap-2"
                >
                  <span>
                    {range === 'all'
                      ? 'All time'
                      : range === 'today'
                        ? 'Today'
                        : range === 'yesterday'
                          ? 'Yesterday'
                          : range === 'last7'
                            ? 'Last 7 days'
                            : 'Last 30 days'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/45" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[180px] rounded-2xl border border-white/10 bg-black p-1">
                <DropdownMenuRadioGroup
                  value={range}
                  onValueChange={(value) => {
                    setRange(value as any);
                    setPage(0);
                  }}
                >
                  <DropdownMenuRadioItem value="all" className="rounded-xl text-[13px]">
                    All time
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="today" className="rounded-xl text-[13px]">
                    Today
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="yesterday" className="rounded-xl text-[13px]">
                    Yesterday
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="last7" className="rounded-xl text-[13px]">
                    Last 7 days
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="last30" className="rounded-xl text-[13px]">
                    Last 30 days
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-11 rounded-2xl bg-black border border-white/10 pl-4 pr-3 text-[15px] font-medium text-white/85 hover:bg-white/[0.03] transition-colors inline-flex items-center gap-2"
                >
                  <span>
                    {assigned === 'all'
                      ? 'All users'
                      : assigned === 'unassigned'
                        ? 'Unassigned'
                        : (() => {
                            const m = memberByUserId[String(assigned)];
                            const roleBadge = m?.role === 'setter' ? ' [S]' : m?.role === 'owner' ? ' [O]' : '';
                            return `${m?.name || 'Team member'}${roleBadge}`;
                          })()}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/45" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px] rounded-2xl border border-white/10 bg-black p-1">
                <DropdownMenuRadioGroup
                  value={assigned}
                  onValueChange={(value) => {
                    setAssigned(value as any);
                    setPage(0);
                  }}
                >
                  <DropdownMenuRadioItem value="all" className="rounded-xl text-[13px]">
                    All users
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="unassigned" className="rounded-xl text-[13px]">
                    Unassigned
                  </DropdownMenuRadioItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {members.map((m) => {
                    const name = String(m.display_name || 'Team member');
                    const roleLabel = m.role === 'setter' ? ' [S]' : m.role === 'owner' ? ' [O]' : '';
                    return (
                      <DropdownMenuRadioItem key={String(m.user_id)} value={String(m.user_id)} className="rounded-xl text-[13px]">
                        {name}
                        {roleLabel}
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-11 rounded-2xl bg-black border border-white/10 pl-4 pr-3 text-[15px] font-medium text-white/85 hover:bg-white/[0.03] transition-colors inline-flex items-center gap-2"
                >
                  <span>
                    {stage === 'all'
                      ? 'Phase'
                      : funnelStageVisualByKey[stage]?.label || 'Phase'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/45" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px] rounded-2xl border border-white/10 bg-black p-1">
                <DropdownMenuRadioGroup
                  value={stage}
                  onValueChange={(value) => {
                    setStage(value as any);
                    setPage(0);
                  }}
                >
                  <DropdownMenuRadioItem value="all" className="rounded-xl text-[13px]">
                    Phase: All
                  </DropdownMenuRadioItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {FUNNEL_STAGE_ORDER.map((key) => {
                    const visual = funnelStageVisualByKey[key];
                    const IconCmp = pickPhaseIcon(visual.iconName, visual.label);
                    return (
                      <DropdownMenuRadioItem key={key} value={key} className="rounded-xl text-[13px]">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-6 w-6 rounded-lg border border-white/10 inline-flex items-center justify-center"
                            style={{ backgroundColor: colorWithAlpha(visual.color, 0.16) }}
                          >
                            <IconCmp className="h-3.5 w-3.5" style={{ color: visual.color }} />
                          </span>
                          {visual.label}
                        </span>
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-11 rounded-2xl bg-black border border-white/10 pl-4 pr-3 text-[15px] font-medium text-white/85 hover:bg-white/[0.03] transition-colors inline-flex items-center gap-2"
                >
                  <span>{temperature === 'all' ? 'Temperature' : TEMPERATURE_PRESETS[temperature]?.label || 'Temperature'}</span>
                  <ChevronDown className="h-4 w-4 text-white/45" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px] rounded-2xl border border-white/10 bg-black p-1">
                <DropdownMenuRadioGroup
                  value={temperature}
                  onValueChange={(value) => {
                    setTemperature(value as any);
                    setPage(0);
                  }}
                >
                  <DropdownMenuRadioItem value="all" className="rounded-xl text-[13px]">
                    Temperature: All
                  </DropdownMenuRadioItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {(['hot', 'warm', 'cold'] as TemperatureLevel[]).map((key) => {
                    const preset = TEMPERATURE_PRESETS[key];
                    const IconCmp = preset.icon;
                    return (
                      <DropdownMenuRadioItem key={key} value={key} className="rounded-xl text-[13px]">
                        <span className="inline-flex items-center gap-2">
                          <IconCmp className="h-4 w-4 fill-current" style={{ color: preset.color }} />
                          {preset.label}
                        </span>
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative w-full sm:w-[320px]">
            <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search leads by name, handle, or message..."
              className="w-full h-11 pl-9 pr-3 rounded-2xl bg-black border border-white/10 text-sm text-white/80 placeholder:text-white/30 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-sm text-white/55">Loading leads…</div>
          ) : pageRows.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-sm text-white/75">No leads found.</div>
              <div className="text-xs text-white/35 mt-2">Try adjusting filters or connect Instagram to start receiving leads.</div>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader className="bg-black/40">
                <TableRow className="border-white/8">
                  <TableHead className="text-white/55">Lead name</TableHead>
                  <TableHead className="text-white/55">Phase</TableHead>
                  <TableHead className="text-white/55">Temperature</TableHead>
                  <TableHead className="text-white/55">Assigned to</TableHead>
                  <TableHead className="text-white/55 text-right">Interacted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((t) => {
                  const conversationId = String(t.conversation_id || '');
                  const tagIds = conversationTagIds[conversationId] || [];
                  const stageKey = computeLeadFunnelStage(t, tagIds, tagById);
                  const stageVisual = funnelStageVisualByKey[stageKey];
                  const StageIcon = pickPhaseIcon(stageVisual?.iconName, stageVisual?.label);

                  const tempKey = computeLeadTemperature(tagIds, tagById);
                  const tempPreset = tempKey ? TEMPERATURE_PRESETS[tempKey] : null;
                  const TempIcon = tempPreset?.icon;

                  const aiModeLabel = t.ai_phase_mode ? String(t.ai_phase_mode) : 'n/a';
                  const aiPhaseConfidenceLabel =
                    t.ai_phase_confidence != null && Number.isFinite(Number(t.ai_phase_confidence))
                      ? `${Number(t.ai_phase_confidence)}%`
                      : '—';
                  const aiTempConfidenceLabel =
                    t.ai_temperature_confidence != null && Number.isFinite(Number(t.ai_temperature_confidence))
                      ? `${Number(t.ai_temperature_confidence)}%`
                      : '—';
                  const aiReason = String(t.ai_phase_reason || '').trim();
                  const phaseTooltip = [
                    `AI mode: ${aiModeLabel}`,
                    `Phase confidence: ${aiPhaseConfidenceLabel}`,
                    aiReason ? `Reason: ${aiReason}` : 'Reason: —',
                  ].join('\\n');
                  const temperatureTooltip = [
                    `AI mode: ${aiModeLabel}`,
                    `Temperature confidence: ${aiTempConfidenceLabel}`,
                    aiReason ? `Reason: ${aiReason}` : 'Reason: —',
                  ].join('\\n');

                  const assignedName = t.assigned_user_id ? memberByUserId[String(t.assigned_user_id)]?.name || 'Team member' : 'Unassigned';
                  const assignedRole = t.assigned_user_id ? memberByUserId[String(t.assigned_user_id)]?.role || '' : '';
                  const roleBadge = assignedRole === 'setter' ? ' [S]' : assignedRole === 'owner' ? ' [O]' : '';

                  const interactedAt = t.last_message_at ? new Date(String(t.last_message_at)) : null;
                  const interactedLabel = interactedAt ? formatRelativeTimeAgo(interactedAt) : '';

                  const leadLabel = pickLeadLabel(t);
                  const leadHandle = pickLeadHandle(t);
                  const initial = leadLabel.slice(0, 1).toUpperCase() || '?';

                  return (
                    <TableRow
                      key={conversationId}
                      className="border-white/8 hover:bg-white/[0.03] cursor-pointer"
                      onClick={(e) => {
                        const el = e.target as HTMLElement | null;
                        if (el && el.closest('button, a, input, textarea, select, [role^=\"menuitem\"]')) return;
                        navigate(`/messages?conversation=${encodeURIComponent(conversationId)}`);
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={t.peer_profile_picture_url || undefined} alt={leadLabel} />
                            <AvatarFallback className="text-white/70 text-xs">{initial}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm text-white/85 truncate">{leadLabel}</div>
                            {leadHandle ? <div className="text-xs text-white/35 truncate">{leadHandle}</div> : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="h-9 px-2 rounded-xl inline-flex items-center gap-2 text-sm text-white/80 hover:bg-white/[0.04] transition-colors"
                              aria-label="Change phase"
                              title={phaseTooltip}
                            >
                              {stageVisual && StageIcon ? (
                                <>
                                  <span
                                    className="h-6 w-6 rounded-lg border border-white/10 inline-flex items-center justify-center"
                                    style={{ backgroundColor: colorWithAlpha(stageVisual.color, 0.16) }}
                                  >
                                    <StageIcon className="h-3.5 w-3.5" style={{ color: stageVisual.color }} />
                                  </span>
                                  <span className="whitespace-nowrap">{stageVisual.label}</span>
                                </>
                              ) : (
                                <span className="text-sm text-white/35">—</span>
                              )}
                              <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="min-w-[220px] rounded-2xl border border-white/10 bg-black p-1">
                            <DropdownMenuRadioGroup
                              value={stageKey}
                              onValueChange={(value) => setConversationPhase(conversationId, value as FunnelStageKey)}
                            >
                              {FUNNEL_STAGE_ORDER.map((key) => {
                                const visual = funnelStageVisualByKey[key];
                                const IconCmp = pickPhaseIcon(visual.iconName, visual.label);
                                return (
                                  <DropdownMenuRadioItem key={key} value={key} className="rounded-xl text-[13px]">
                                    <span className="inline-flex items-center gap-2">
                                      <span
                                        className="h-6 w-6 rounded-lg border border-white/10 inline-flex items-center justify-center"
                                        style={{ backgroundColor: colorWithAlpha(visual.color, 0.16) }}
                                      >
                                        <IconCmp className="h-3.5 w-3.5" style={{ color: visual.color }} />
                                      </span>
                                      {visual.label}
                                    </span>
                                  </DropdownMenuRadioItem>
                                );
                              })}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="h-9 px-2 rounded-xl inline-flex items-center gap-2 text-sm text-white/80 hover:bg-white/[0.04] transition-colors"
                              aria-label="Change temperature"
                              title={temperatureTooltip}
                            >
                              {tempPreset && TempIcon ? (
                                <>
                                  <TempIcon className="h-4 w-4 fill-current" style={{ color: tempPreset.color }} />
                                  <span className="whitespace-nowrap">{tempPreset.label}</span>
                                </>
                              ) : (
                                <span className="text-sm text-white/35">—</span>
                              )}
                              <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="min-w-[220px] rounded-2xl border border-white/10 bg-black p-1">
                            <DropdownMenuRadioGroup
                              value={tempKey || 'none'}
                              onValueChange={(value) =>
                                setConversationTemperature(
                                  conversationId,
                                  value === 'none' ? null : (value as TemperatureLevel)
                                )
                              }
                            >
                              <DropdownMenuRadioItem value="none" className="rounded-xl text-[13px]">
                                No temperature
                              </DropdownMenuRadioItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              {(['hot', 'warm', 'cold'] as TemperatureLevel[]).map((key) => {
                                const preset = TEMPERATURE_PRESETS[key];
                                const IconCmp = preset.icon;
                                return (
                                  <DropdownMenuRadioItem key={key} value={key} className="rounded-xl text-[13px]">
                                    <span className="inline-flex items-center gap-2">
                                      <IconCmp className="h-4 w-4 fill-current" style={{ color: preset.color }} />
                                      {preset.label}
                                    </span>
                                  </DropdownMenuRadioItem>
                                );
                              })}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-2 text-sm text-white/80">
                          <span
                            className="acq-orb h-6 w-6 text-white/80 text-xs grid place-items-center"
                            style={
                              (assignedRole === 'owner'
                                ? { '--orb-tint': colorWithAlpha('#60a5fa', 0.16), '--orb-glow': colorWithAlpha('#60a5fa', 0.42) }
                                : assignedRole === 'setter'
                                  ? { '--orb-tint': colorWithAlpha('#a78bfa', 0.16), '--orb-glow': colorWithAlpha('#a78bfa', 0.42) }
                                  : { '--orb-tint': 'rgba(255,255,255,0.06)', '--orb-glow': 'rgba(255,255,255,0.18)' }) as any
                            }
                          >
                            {(assignedName || 'U').slice(0, 1).toUpperCase()}
                          </span>
                          <span className="truncate max-w-[180px]">
                            {assignedName}
                            {roleBadge}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-white/75">{interactedLabel || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
	          <div className="flex items-center gap-2 text-xs text-white/45">
	            Rows per page
	            <DropdownMenu>
	              <DropdownMenuTrigger asChild>
	                <button
	                  type="button"
	                  className="h-8 rounded-lg bg-black border border-white/10 px-2 text-xs text-white/80 hover:bg-white/[0.03] transition-colors"
	                >
	                  {pageSize}
	                </button>
	              </DropdownMenuTrigger>
	              <DropdownMenuContent align="start" className="min-w-[120px] rounded-2xl border border-white/10 bg-black p-1">
	                <DropdownMenuRadioGroup
	                  value={String(pageSize)}
	                  onValueChange={(value) => {
	                    setPageSize(Number(value) || 25);
	                    setPage(0);
	                  }}
	                >
	                  {['10', '25', '50', '100'].map((value) => (
	                    <DropdownMenuRadioItem key={value} value={value} className="rounded-xl text-[13px]">
	                      {value}
	                    </DropdownMenuRadioItem>
	                  ))}
	                </DropdownMenuRadioGroup>
	              </DropdownMenuContent>
	            </DropdownMenu>
	          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage <= 0}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
            >
              Next
            </Button>
            <div className="text-xs text-white/45">
              Page {safePage + 1} of {totalPages}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
