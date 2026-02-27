import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InviteSetterDialog } from '@/components/layout/InviteSetterDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowRight, CheckSquare, MessageCircle, MoreHorizontal, Send, Trash2, UserPlus } from '@/components/ui/icons';

type FunnelStageKey =
  | 'new_lead'
  | 'in_contact'
  | 'qualified'
  | 'unqualified'
  | 'call_booked'
  | 'won'
  | 'no_show';

type TemperatureLevel = 'hot' | 'warm' | 'cold';

const FUNNEL_STAGE_ORDER: FunnelStageKey[] = [
  'new_lead',
  'in_contact',
  'qualified',
  'unqualified',
  'call_booked',
  'won',
  'no_show',
];

type WorkspaceMemberRow = {
  id: string;
  user_id: string;
  role: 'owner' | 'setter';
  display_name: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type SetterRow = {
  memberId: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  joinedAt: string;
};

type SetterStats = {
  userId: string;
  assignedCount: number;
  unrepliedCount: number;
  avgResponseMinutes: number | null;
  stageCounts: Record<FunnelStageKey, number>;
  hotWaitingCount: number;
  priorityHandledCount: number;
};

type InstagramThreadRow = {
  conversation_id: string;
  assigned_user_id: string | null;
  lead_status: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  is_spam: boolean | null;
};

type TagRow = {
  id: string;
  name: string;
};

type ConversationTagLinkRow = {
  conversation_id: string;
  tag_id: string;
};

type SetterMessageRow = {
  id: string;
  workspace_id?: string;
  setter_id: string;
  sender_id?: string;
  sender_type: 'coach' | 'setter';
  content: string;
  read_at?: string | null;
  created_at: string;
};

function missingColumnFromPostgrestError(error: any): string | null {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`;
  const m1 = text.match(/Could not find the '([^']+)' column/i);
  if (m1?.[1]) return m1[1];
  const m2 = text.match(/column\s+[a-z_]+\.(\w+)\s+does not exist/i);
  if (m2?.[1]) return m2[1];
  return null;
}

function normalizeSetterMessageRow(row: any, workspaceId: string): SetterMessageRow {
  const senderTypeRaw = String(row?.sender_type || '').toLowerCase();
  const senderType: 'coach' | 'setter' = senderTypeRaw === 'setter' ? 'setter' : 'coach';
  const content =
    row?.content ??
    row?.message ??
    row?.text ??
    row?.body ??
    row?.message_text ??
    row?.message_body ??
    '';

  return {
    id: String(row?.id || ''),
    workspace_id: row?.workspace_id ? String(row.workspace_id) : workspaceId,
    setter_id: String(row?.setter_id || ''),
    sender_id: row?.sender_id ? String(row.sender_id) : undefined,
    sender_type: senderType,
    content: String(content || ''),
    read_at: row?.read_at ? String(row.read_at) : null,
    created_at: String(row?.created_at || new Date().toISOString()),
  };
}

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

function parseMs(value: any): number {
  if (!value) return 0;
  const d = new Date(String(value));
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

function computeTemperature(tagIds: string[], tagById: Record<string, TagRow>): TemperatureLevel | null {
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

function computeLeadStage(
  leadStatus: string | null | undefined,
  tagIds: string[],
  tagById: Record<string, TagRow>,
): FunnelStageKey {
  // Back-compat: some flows may still store qualified/unqualified here.
  const status = normalizeTagName(leadStatus);
  if (status === 'qualified') return 'qualified';
  if (status === 'disqualified' || status === 'unqualified') return 'unqualified';

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

async function fetchConversationTagLinks(
  workspaceId: string,
  conversationIds: string[],
): Promise<ConversationTagLinkRow[]> {
  const ids = conversationIds.filter(Boolean);
  if (ids.length === 0) return [];

  const batchSize = 200;
  const out: ConversationTagLinkRow[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const { data, error } = await (supabase as any)
      .from('instagram_conversation_tags')
      .select('conversation_id,tag_id')
      .eq('workspace_id', workspaceId)
      .in('conversation_id', batch);
    if (error) throw error;
    for (const row of Array.isArray(data) ? data : []) {
      out.push({
        conversation_id: String(row.conversation_id),
        tag_id: String(row.tag_id),
      });
    }
  }

  return out;
}

function formatCellValue(value: unknown) {
  if (value == null) return '—';
  return String(value);
}

export default function Team() {
  const navigate = useNavigate();
  const { workspace, userRole } = useWorkspace();
  const { user, profile } = useAuth();

  const [setters, setSetters] = useState<SetterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsByUserId, setStatsByUserId] = useState<Record<string, SetterStats>>({});

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [setterToDelete, setSetterToDelete] = useState<SetterRow | null>(null);

  const [chatSetter, setChatSetter] = useState<SetterRow | null>(null);
  const [chatMessages, setChatMessages] = useState<SetterMessageRow[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [taskSetter, setTaskSetter] = useState<SetterRow | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskCreating, setTaskCreating] = useState(false);

  const isOwner = userRole === 'owner';

  const fetchSetters = useCallback(async () => {
    if (!workspace?.id) return;

    setLoading(true);
    try {
      const { data: memberRows, error: memberError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('role', 'setter')
        .order('created_at', { ascending: true });

      if (memberError) throw memberError;

      const members = (memberRows || []) as WorkspaceMemberRow[];
      const userIds = members.map((m) => String(m.user_id)).filter(Boolean);

      const profilesById: Record<string, ProfileRow> = {};
      if (userIds.length > 0) {
        const { data: profilesRows, error: profilesError } = await supabase
          .from('profiles')
          .select('id,full_name,display_name,avatar_url')
          .in('id', userIds);
        if (profilesError) {
          // Non-fatal. We'll fall back to workspace member display_name.
          console.error('Error fetching profiles:', profilesError);
        } else {
          for (const p of (profilesRows || []) as ProfileRow[]) {
            profilesById[String(p.id)] = p;
          }
        }
      }

      const displayNameSyncUpdates: Array<{ memberId: string; displayName: string }> = [];

      const rows: SetterRow[] = members.map((m) => {
        const uid = String(m.user_id);
        const p = profilesById[uid] || null;

        const explicit = String(m.display_name || '').trim();
        const profileFullName = String(p?.full_name || '').trim();
        const profileDisplayName = String(p?.display_name || '').trim();
        const profilePreferredName = profileFullName || profileDisplayName;

        let name = profilePreferredName || explicit || 'Appointment Setter';
        if (uid === user?.id) {
          const selfName = String(profile?.full_name || profile?.display_name || '').trim();
          if (selfName) name = selfName;
        }

        if (profilePreferredName && profilePreferredName !== explicit) {
          displayNameSyncUpdates.push({
            memberId: String(m.id),
            displayName: profilePreferredName,
          });
        }

        return {
          memberId: String(m.id),
          userId: uid,
          name,
          avatarUrl: p?.avatar_url || null,
          joinedAt: String(m.created_at),
        };
      });

      setSetters(rows);

      if (displayNameSyncUpdates.length > 0) {
        Promise.all(
          displayNameSyncUpdates.map(async (u) => {
            const { error } = await supabase
              .from('workspace_members')
              .update({ display_name: u.displayName })
              .eq('id', u.memberId);
            if (error) {
              console.warn('Failed to sync setter display_name:', u.memberId, error);
            }
          })
        ).catch((syncError) => {
          console.warn('Failed syncing setter display names:', syncError);
        });
      }
    } catch (err) {
      console.error('Error fetching setters:', err);
      setSetters([]);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, user?.id, profile?.full_name, profile?.display_name]);

  const fetchStats = useCallback(async () => {
    if (!workspace?.id) return;
    if (setters.length === 0) return;

    setStatsLoading(true);
    try {
      const setterIds = new Set(setters.map((s) => s.userId));
      const setterIdList = Array.from(setterIds);

      const [threadsRes, tagsRes, auditRes] = await Promise.all([
        (supabase as any)
          .from('instagram_threads')
          .select('conversation_id,assigned_user_id,lead_status,last_inbound_at,last_outbound_at,is_spam')
          .eq('workspace_id', workspace.id)
          .neq('lead_status', 'removed'),
        (supabase as any).from('instagram_tags').select('id,name').eq('workspace_id', workspace.id),
        (supabase as any)
          .from('instagram_thread_audit_log')
          .select('actor_user_id,action,created_at')
          .eq('workspace_id', workspace.id)
          .in('action', ['priority_followed_up', 'unpin', 'bulk_pin']),
      ]);

      const threadsAll = (Array.isArray(threadsRes.data) ? threadsRes.data : []) as InstagramThreadRow[];
      const threads = threadsAll.filter((t) => {
        if (Boolean((t as any)?.is_spam)) return false;
        const assigned = t?.assigned_user_id ? String(t.assigned_user_id) : '';
        if (!assigned) return false;
        return setterIds.has(assigned);
      });

      const tagRows = (Array.isArray(tagsRes.data) ? tagsRes.data : []) as TagRow[];
      const tagById: Record<string, TagRow> = {};
      for (const t of tagRows) tagById[String(t.id)] = { id: String(t.id), name: String(t.name || '') };

      const conversationIds = threads.map((t) => String(t.conversation_id)).filter(Boolean);
      const convTagLinks = await fetchConversationTagLinks(workspace.id, conversationIds);

      const tagIdsByConversationId: Record<string, string[]> = {};
      for (const link of convTagLinks) {
        const convId = String(link.conversation_id);
        if (!tagIdsByConversationId[convId]) tagIdsByConversationId[convId] = [];
        tagIdsByConversationId[convId].push(String(link.tag_id));
      }

      const priorityHandledByUserId: Record<string, number> = {};
      for (const row of Array.isArray(auditRes.data) ? auditRes.data : []) {
        const actor = row?.actor_user_id ? String(row.actor_user_id) : '';
        if (!actor || !setterIds.has(actor)) continue;
        priorityHandledByUserId[actor] = (priorityHandledByUserId[actor] || 0) + 1;
      }

      const responseDeltasByUserId: Record<string, number[]> = {};

      const statsById: Record<string, SetterStats> = {};
      for (const id of setterIdList) {
        statsById[id] = {
          userId: id,
          assignedCount: 0,
          unrepliedCount: 0,
          avgResponseMinutes: null,
          stageCounts: {
            new_lead: 0,
            in_contact: 0,
            qualified: 0,
            unqualified: 0,
            call_booked: 0,
            won: 0,
            no_show: 0,
          },
          hotWaitingCount: 0,
          priorityHandledCount: priorityHandledByUserId[id] || 0,
        };
      }

      for (const t of threads) {
        const assigned = t?.assigned_user_id ? String(t.assigned_user_id) : '';
        if (!assigned || !statsById[assigned]) continue;

        const conversationId = String(t.conversation_id || '');
        const tagIds = tagIdsByConversationId[conversationId] || [];

        const inboundMs = parseMs(t?.last_inbound_at);
        const outboundMs = parseMs(t?.last_outbound_at);
        const awaitingReply = Boolean(inboundMs) && (!outboundMs || inboundMs > outboundMs);

        const stageKey = computeLeadStage(t?.lead_status, tagIds, tagById);
        const temp = computeTemperature(tagIds, tagById);

        statsById[assigned].assignedCount += 1;
        statsById[assigned].stageCounts[stageKey] += 1;
        if (awaitingReply) statsById[assigned].unrepliedCount += 1;
        if (awaitingReply && temp === 'hot') statsById[assigned].hotWaitingCount += 1;

        if (inboundMs && outboundMs && outboundMs > inboundMs) {
          const deltaMinutes = Math.max(0, Math.round((outboundMs - inboundMs) / 60000));
          if (!responseDeltasByUserId[assigned]) responseDeltasByUserId[assigned] = [];
          responseDeltasByUserId[assigned].push(deltaMinutes);
        }
      }

      for (const id of setterIdList) {
        const deltas = responseDeltasByUserId[id] || [];
        statsById[id].avgResponseMinutes = deltas.length
          ? Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length)
          : null;
      }

      setStatsByUserId(statsById);
    } catch (err: any) {
      console.error('Error fetching setter stats:', err);
      setStatsByUserId({});
      toast.error(err?.message || 'Failed to load setter metrics');
    } finally {
      setStatsLoading(false);
    }
  }, [workspace?.id, setters]);

  useEffect(() => {
    if (!workspace?.id) return;
    fetchSetters();
  }, [workspace?.id, fetchSetters]);

  useEffect(() => {
    if (!workspace?.id) return;
    if (setters.length === 0) return;
    fetchStats();
  }, [workspace?.id, setters.length, fetchStats]);

  useEffect(() => {
    if (!workspace?.id) return;
    if (!chatSetter?.userId) return;

    setChatLoading(true);
    (async () => {
      try {
        const withWorkspace = await (supabase as any)
          .from('setter_messages')
          .select('*')
          .eq('workspace_id', workspace.id)
          .eq('setter_id', chatSetter.userId)
          .order('created_at', { ascending: true });

        if (withWorkspace.error) {
          const missing = missingColumnFromPostgrestError(withWorkspace.error);
          if (missing === 'workspace_id') {
            const retry = await (supabase as any)
              .from('setter_messages')
              .select('*')
              .eq('setter_id', chatSetter.userId)
              .order('created_at', { ascending: true });
            if (retry.error) throw retry.error;
            setChatMessages(
              (Array.isArray(retry.data) ? retry.data : []).map((r: any) =>
                normalizeSetterMessageRow(r, workspace.id),
              ),
            );
            return;
          }
          throw withWorkspace.error;
        }

        setChatMessages(
          (Array.isArray(withWorkspace.data) ? withWorkspace.data : []).map((r: any) =>
            normalizeSetterMessageRow(r, workspace.id),
          ),
        );
      } catch (err: any) {
        console.error('Error loading setter chat:', err);
        toast.error(err?.message || 'Failed to load chat');
      } finally {
        setChatLoading(false);
      }
    })();
  }, [workspace?.id, chatSetter?.userId]);

  useEffect(() => {
    if (!workspace?.id) return;
    if (!chatSetter?.userId) return;

	    const channel = supabase
	      .channel(`setter_messages:${workspace.id}:${chatSetter.userId}`)
	      .on(
	        'postgres_changes',
	        { event: 'INSERT', schema: 'public', table: 'setter_messages', filter: `setter_id=eq.${chatSetter.userId}` },
	        (payload) => {
	          const row = payload?.new as any;
	          if (!row) return;
	          if (String(row.setter_id) !== String(chatSetter.userId)) return;
          setChatMessages((prev) => {
            const id = String(row.id || '');
            if (id && prev.some((m) => String(m.id) === id)) return prev;
            return [...prev, row as SetterMessageRow];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace?.id, chatSetter?.userId]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length, chatSetter?.userId]);

  const sendChatMessage = useCallback(async () => {
    if (!workspace?.id || !user?.id) return;
    if (!chatSetter?.userId) return;
    const content = chatDraft.trim();
    if (!content) return;

    setChatSending(true);
    try {
      const payloadBase: Record<string, any> = {
        setter_id: chatSetter.userId,
        sender_id: user.id,
        sender_type: 'coach',
      };

      const contentKeys = ['content', 'message', 'text', 'body', 'message_text', 'message_body'] as const;
      let inserted: any | null = null;
      let lastError: any = null;

      for (const contentKey of contentKeys) {
        const payload: Record<string, any> = { ...payloadBase, [contentKey]: content, workspace_id: workspace.id };
        // iterative retry: drop optional fields (workspace_id, sender_id, sender_type) if missing.
        for (let i = 0; i < 6; i += 1) {
          const { data, error } = await (supabase as any)
            .from('setter_messages')
            .insert(payload)
            .select('*')
            .single();
          if (!error) {
            inserted = data;
            lastError = null;
            break;
          }
          lastError = error;
          const missing = missingColumnFromPostgrestError(error);
          if (missing === contentKey) break; // try next content key
          if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
            delete payload[missing];
            continue;
          }
          break;
        }
        if (inserted) break;
      }

      if (!inserted) throw lastError || new Error('Failed to send message');

      setChatDraft('');
      const normalized = normalizeSetterMessageRow(inserted, workspace.id);
      if (normalized?.id) {
        setChatMessages((prev) => {
          const id = String(normalized.id);
          if (prev.some((m) => String(m.id) === id)) return prev;
          return [...prev, normalized];
        });
      }
    } catch (err: any) {
      console.error('Error sending setter chat message:', err);
      toast.error(err?.message || 'Failed to send message');
    } finally {
      setChatSending(false);
    }
  }, [workspace?.id, user?.id, chatSetter?.userId, chatDraft]);

  const createSetterTask = useCallback(async () => {
    if (!workspace?.id || !user?.id) return;
    if (!taskSetter?.userId) return;
    const title = taskTitle.trim();
    if (!title) {
      toast.error('Please enter a task title');
      return;
    }

    setTaskCreating(true);
    try {
      const payload: Record<string, any> = {
        setter_id: taskSetter.userId,
        title,
        description: taskDescription.trim() || null,
        due_date: taskDueDate || null,
        status: 'pending',
        workspace_id: workspace.id,
        created_by: user.id,
      };

      let lastErr: any = null;
      for (let i = 0; i < 6; i += 1) {
        const res = await (supabase as any).from('setter_tasks').insert(payload);
        if (!res.error) {
          lastErr = null;
          break;
        }
        lastErr = res.error;
        const missing = missingColumnFromPostgrestError(res.error);
        if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
          delete payload[missing];
          continue;
        }
        break;
      }
      if (lastErr) throw lastErr;

      toast.success('Task assigned');
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
      setTaskSetter(null);
    } catch (err: any) {
      console.error('Error creating setter task:', err);
      toast.error(err?.message || 'Failed to assign task');
    } finally {
      setTaskCreating(false);
    }
  }, [workspace?.id, user?.id, taskSetter?.userId, taskTitle, taskDescription, taskDueDate]);

  const rows = useMemo(() => {
    return setters.map((s) => {
      const stats = statsByUserId[s.userId] || null;
      return { setter: s, stats };
    });
  }, [setters, statsByUserId]);

  const handleRemoveSetter = useCallback(async () => {
    if (!setterToDelete) return;
    const { error } = await supabase.from('workspace_members').delete().eq('id', setterToDelete.memberId);
    if (error) {
      toast.error('Failed to remove setter');
      return;
    }
    toast.success('Setter removed');
    setDeleteDialogOpen(false);
    setSetterToDelete(null);
    await fetchSetters();
  }, [setterToDelete, fetchSetters]);

  return (
    <DashboardLayout requireOwner>
      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="headline-domaine text-[36px] font-medium">Setters</h1>
            <p className="text-sm text-white/45 mt-1">Invite setters and manage your team</p>
          </div>
          {isOwner ? (
            <Button
              onClick={() => setInviteDialogOpen(true)}
              className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-xl"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Setter
            </Button>
          ) : null}
        </div>

        {loading ? (
          <div className="text-muted-foreground text-sm">Loading setters…</div>
        ) : setters.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="p-10 text-center">
              <div className="text-sm text-white/75">No setters yet.</div>
              <div className="text-xs text-white/35 mt-2">Invite your first appointment setter to get started.</div>
              {isOwner ? (
                <div className="mt-6">
                  <Button
                    onClick={() => setInviteDialogOpen(true)}
                    className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-xl"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Setter
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-black/40">
                  <TableRow className="border-white/8">
                    <TableHead className="text-white/55">Setter</TableHead>
                    <TableHead className="text-white/55">Conversations</TableHead>
                    <TableHead className="text-white/55">Unreplied</TableHead>
                    <TableHead className="text-white/55">Avg response</TableHead>
                    <TableHead className="text-white/55">Qualified</TableHead>
                    <TableHead className="text-white/55">Booked</TableHead>
                    <TableHead className="text-white/55">Won</TableHead>
                    <TableHead className="text-white/55">Hot waiting</TableHead>
                    <TableHead className="text-white/55">Priority handled</TableHead>
                    <TableHead className="text-white/55 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ setter, stats }) => {
                    const initial = setter.name.slice(0, 1).toUpperCase() || 'S';
                    const joined = setter.joinedAt ? format(new Date(setter.joinedAt), 'MMM d, yyyy') : '';

                    const assignedCount = stats ? stats.assignedCount : null;
                    const unrepliedCount = stats ? stats.unrepliedCount : null;
                    const avgResponse = stats
                      ? stats.avgResponseMinutes == null
                        ? 'n/a'
                        : `${stats.avgResponseMinutes} min`
                      : null;

                    const qualifiedCount = stats ? stats.stageCounts.qualified : null;
                    const bookedCount = stats ? stats.stageCounts.call_booked : null;
                    const wonCount = stats ? stats.stageCounts.won : null;
                    const hotWaitingCount = stats ? stats.hotWaitingCount : null;
                    const priorityHandledCount = stats ? stats.priorityHandledCount : null;

                    return (
                      <TableRow
                        key={setter.userId}
                        className="border-white/8 hover:bg-white/[0.03] cursor-pointer"
                        onClick={(e) => {
                          const el = e.target as HTMLElement | null;
                          if (el && el.closest('button, a, input, textarea, select, [role^=\"menuitem\"]')) return;
                          navigate(`/messages?assigned=${encodeURIComponent(setter.userId)}`);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={setter.avatarUrl || undefined} alt={setter.name} />
                              <AvatarFallback className="text-white/70 text-xs">{initial}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm text-white/85 truncate">{setter.name}</div>
                              {joined ? <div className="text-xs text-white/35 truncate">Joined {joined}</div> : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-white/75">{formatCellValue(assignedCount)}</TableCell>
                        <TableCell className="text-sm text-white/75">{formatCellValue(unrepliedCount)}</TableCell>
                        <TableCell className="text-sm text-white/75">{formatCellValue(avgResponse)}</TableCell>
                        <TableCell className="text-sm text-white/75">{formatCellValue(qualifiedCount)}</TableCell>
                        <TableCell className="text-sm text-white/75">{formatCellValue(bookedCount)}</TableCell>
                        <TableCell className="text-sm text-white/75">{formatCellValue(wonCount)}</TableCell>
                        <TableCell className="text-sm text-white/75">{formatCellValue(hotWaitingCount)}</TableCell>
                        <TableCell className="text-sm text-white/75">{formatCellValue(priorityHandledCount)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl text-white/55 hover:text-white hover:bg-white/10"
                                aria-label="Setter actions"
                                title="Setter actions"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
	                            <DropdownMenuContent align="end" className="min-w-[200px] rounded-2xl border border-white/10 bg-black p-1">
	                              <DropdownMenuItem
	                                onClick={(e) => {
	                                  e.stopPropagation();
	                                  setChatSetter(setter);
	                                }}
	                                className="rounded-xl text-[13px]"
	                              >
	                                <MessageCircle className="h-4 w-4 mr-2 text-white/55" />
	                                Chat
	                              </DropdownMenuItem>
	                              <DropdownMenuItem
	                                onClick={(e) => {
	                                  e.stopPropagation();
	                                  setTaskSetter(setter);
	                                  setTaskTitle('');
	                                  setTaskDescription('');
	                                  setTaskDueDate('');
	                                }}
	                                className="rounded-xl text-[13px]"
	                              >
	                                <CheckSquare className="h-4 w-4 mr-2 text-white/55" />
	                                Assign task
	                              </DropdownMenuItem>
	                              <DropdownMenuItem
	                                onClick={(e) => {
	                                  e.stopPropagation();
	                                  navigate(`/messages?assigned=${encodeURIComponent(setter.userId)}`);
                                }}
                                className="rounded-xl text-[13px]"
                              >
                                View inbox
                                <ArrowRight className="h-4 w-4 ml-auto text-white/40" />
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSetterToDelete(setter);
                                  setDeleteDialogOpen(true);
                                }}
                                className="rounded-xl text-[13px] text-[#f87171] focus:text-[#f87171] focus:bg-[#3d2626] hover:bg-[#3d2626] data-[highlighted]:bg-[#3d2626]"
	                              >
	                                <Trash2 className="h-4 w-4 mr-2" />
	                                Remove setter
	                              </DropdownMenuItem>
	                            </DropdownMenuContent>
	                          </DropdownMenu>
	                        </TableCell>
	                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {statsLoading ? <div className="p-4 text-xs text-white/40">Loading metrics…</div> : null}
          </div>
        )}

        <InviteSetterDialog
          open={inviteDialogOpen}
          onOpenChange={(open) => {
            setInviteDialogOpen(open);
            if (!open) fetchSetters();
          }}
        />

	        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
	          <AlertDialogContent className="bg-[#0a0a0a] border-border rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Setter</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this setter? They will lose access to this workspace immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border hover:bg-[#1a1a1a] rounded-2xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveSetter} className="bg-[#dc2626] hover:bg-[#b91c1c] border-0 rounded-2xl">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
	        </AlertDialog>

          <Dialog
            open={!!chatSetter}
            onOpenChange={(open) => {
              if (open) return;
              setChatSetter(null);
              setChatDraft('');
              setChatMessages([]);
            }}
          >
            <DialogContent className="bg-black border border-white/10 rounded-3xl max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white/90">Chat{chatSetter?.name ? `: ${chatSetter.name}` : ''}</DialogTitle>
                <DialogDescription className="text-white/45">
                  Messages here are visible to the setter in their Coach tab.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
                <div ref={chatScrollRef} className="h-[420px] overflow-y-auto p-4 space-y-3">
                  {chatLoading ? (
                    <div className="space-y-4">
                      <div className="flex justify-start">
                        <Skeleton className="h-12 w-[62%] max-w-[520px] rounded-2xl bg-white/[0.06]" />
                      </div>
                      <div className="flex justify-end">
                        <Skeleton className="h-10 w-[50%] max-w-[420px] rounded-2xl bg-white/[0.08]" />
                      </div>
                      <div className="flex justify-start">
                        <Skeleton className="h-16 w-[70%] max-w-[560px] rounded-2xl bg-white/[0.06]" />
                      </div>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-sm text-white/40">No messages yet.</div>
                  ) : (
                    chatMessages.map((m) => {
                      const isMe = m.sender_type === 'coach';
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                              isMe
                                ? 'bg-white text-black'
                                : 'bg-white/[0.06] text-white/90 border border-white/10'
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3 border-t-[0.5px] border-white/10 bg-black">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={chatDraft}
                      onChange={(e) => setChatDraft(e.target.value)}
                      placeholder="Type a message…"
                      rows={1}
                      className="flex-1 min-w-0 max-h-32 resize-none rounded-2xl bg-black border border-white/10 px-4 py-3 text-[13px] text-white/85 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={sendChatMessage}
                      disabled={chatSending || !chatDraft.trim()}
                      className="h-11 w-11 rounded-2xl bg-white text-black grid place-items-center disabled:opacity-50"
                      aria-label="Send"
                      title="Send"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!taskSetter} onOpenChange={(open) => (!open ? setTaskSetter(null) : null)}>
            <DialogContent className="bg-black border border-white/10 rounded-3xl max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-white/90">Assign task{taskSetter?.name ? `: ${taskSetter.name}` : ''}</DialogTitle>
                <DialogDescription className="text-white/45">
                  This task will appear in the setter's Tasks page.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-white/70">Task title</div>
                  <input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Enter task title…"
                    className="w-full h-11 rounded-2xl bg-black border border-white/10 px-4 text-[13px] text-white/85 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/70">Description (optional)</div>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Add more detail…"
                    rows={3}
                    className="w-full rounded-2xl bg-black border border-white/10 px-4 py-3 text-[13px] text-white/85 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/70">Due date (optional)</div>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full h-11 rounded-2xl bg-black border border-white/10 px-4 text-[13px] text-white/85 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/15 hover:bg-white/[0.03] rounded-2xl"
                  onClick={() => setTaskSetter(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-white text-black hover:bg-white/90 border-0 rounded-2xl"
                  disabled={taskCreating || !taskTitle.trim()}
                  onClick={createSetterTask}
                >
                  {taskCreating ? 'Assigning…' : 'Assign task'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
	      </div>
	    </DashboardLayout>
	  );
}
