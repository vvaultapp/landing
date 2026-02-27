import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, isToday } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGoogleCalendarOAuth } from '@/hooks/useGoogleCalendarOAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useMeetings, Meeting } from '@/hooks/useMeetings';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MoreVertical, Calendar, ExternalLink, LogOut, MessageCircle, Copy, CheckCircle2, RotateCcw, UserRoundX, XCircle } from '@/components/ui/icons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { CreateMeetingDialog } from '@/components/meetings/CreateMeetingDialog';
import { MeetingsList } from '@/components/meetings/MeetingsList';
import { MeetingDetailDrawer } from '@/components/meetings/MeetingDetailDrawer';
import { ListPageSkeleton } from '@/components/skeletons/ListPageSkeleton';
import googleCalendarLogo from '@/assets/google-calendar-logo.png';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConnectedCalendar {
  id: string;
  calendar_id: string;
  summary: string | null;
  description: string | null;
  time_zone: string | null;
  primary_calendar: boolean;
  last_synced_at?: string | null;
  last_sync_status?: 'ok' | 'error';
  last_sync_error?: string | null;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
}

interface TeamMember {
  id: string;
  user_id: string;
  display_name: string | null;
  role: string;
}

interface LeadOption {
  conversation_id: string;
  instagram_user_id: string;
  peer_username: string | null;
  peer_name: string | null;
  assigned_user_id: string | null;
}

interface AlertItem {
  id: string;
  conversation_id: string;
  alert_type: string;
  status: string;
  overdue_minutes: number | null;
  recommended_action: string | null;
}

type OutcomeStatus = 'pending' | 'completed' | 'no_show' | 'rescheduled' | 'cancelled';
type ReminderKind = '24h' | '1h';

type ReminderQueueItem = {
  meeting: Meeting;
  kind: ReminderKind;
  dueAt: Date;
};

export default function Meetings() {
  const navigate = useNavigate();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const { connectGoogleCalendar } = useGoogleCalendarOAuth();
  const { workspace, userRole } = useWorkspace();
  const {
    meetings,
    isLoading: isMeetingsLoading,
    isSyncing,
    needsCalendarReconnect,
    createMeeting,
    cancelMeeting,
    deleteMeeting,
    applyOutcome,
    syncFromGoogleCalendar,
  } = useMeetings();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [connectedCalendar, setConnectedCalendar] = useState<ConnectedCalendar | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [openAlerts, setOpenAlerts] = useState<AlertItem[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);
  const [listFilter, setListFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
  const [outcomeMeeting, setOutcomeMeeting] = useState<Meeting | null>(null);
  const [outcomeValue, setOutcomeValue] = useState<OutcomeStatus>('completed');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [createFollowupTask, setCreateFollowupTask] = useState(true);
  const [isOutcomeSaving, setIsOutcomeSaving] = useState(false);
  const isSetterMode = userRole === 'setter';

  const requestedCreate = urlSearchParams.get('create') === '1';
  const requestedConversationId = urlSearchParams.get('conversation');

  const clearCreateParams = useCallback(() => {
    const next = new URLSearchParams(urlSearchParams);
    next.delete('create');
    next.delete('conversation');
    setUrlSearchParams(next, { replace: true });
  }, [urlSearchParams, setUrlSearchParams]);

  const handleCreateDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      setCreateDialogOpen(nextOpen);
      if (!nextOpen && requestedCreate) {
        clearCreateParams();
      }
    },
    [clearCreateParams, requestedCreate],
  );

  useEffect(() => {
    if (requestedCreate) setCreateDialogOpen(true);
  }, [requestedCreate]);

  useEffect(() => {
    if (isSetterMode) {
      navigate('/messages', { replace: true });
    }
  }, [isSetterMode, navigate]);

  const fetchSupportData = useCallback(async () => {
    if (!workspace?.id) {
      setIsLoadingCalendar(false);
      return;
    }

    try {
      const [{ data: calendarData, error: calendarError }, { data: clientsData, error: clientsError }, { data: membersData, error: membersError }, { data: leadData, error: leadsError }, { data: alertData, error: alertsError }] = await Promise.all([
        supabase
          .from('connected_google_calendars')
          .select('*')
          .eq('workspace_id', workspace.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('clients')
          .select('id, name, email')
          .eq('workspace_id', workspace.id)
          .order('name'),
        supabase
          .from('workspace_members')
          .select('id, user_id, display_name, role')
          .eq('workspace_id', workspace.id)
          .order('created_at'),
        (supabase as any)
          .from('instagram_threads')
          .select('conversation_id,instagram_user_id,peer_username,peer_name,assigned_user_id,is_spam,lead_status')
          .eq('workspace_id', workspace.id)
          .order('last_message_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(500),
        (supabase as any)
          .from('instagram_alerts')
          .select('id,conversation_id,alert_type,status,overdue_minutes,recommended_action')
          .eq('workspace_id', workspace.id)
          .eq('status', 'open')
          .eq('alert_type', 'no_show_followup')
          .order('created_at', { ascending: false }),
      ]);

      if (calendarError && calendarError.code !== 'PGRST116') {
        console.error('Error fetching calendar:', calendarError);
      }
      if (clientsError) console.error('Error fetching clients:', clientsError);
      if (membersError) console.error('Error fetching team members:', membersError);
      if (leadsError) console.error('Error fetching lead threads:', leadsError);
      if (alertsError) console.error('Error fetching no-show alerts:', alertsError);

      setConnectedCalendar((calendarData as ConnectedCalendar) || null);
      setClients((clientsData || []) as Client[]);
      setTeamMembers((membersData || []) as TeamMember[]);
      setLeads(
        (Array.isArray(leadData) ? leadData : [])
          .filter((row: any) => !row?.is_spam)
          .filter((row: any) => String(row?.lead_status || 'open') !== 'removed')
          .map((row: any) => ({
            conversation_id: String(row?.conversation_id || ''),
            instagram_user_id: String(row?.instagram_user_id || ''),
            peer_username: row?.peer_username ? String(row.peer_username) : null,
            peer_name: row?.peer_name ? String(row.peer_name) : null,
            assigned_user_id: row?.assigned_user_id ? String(row.assigned_user_id) : null,
          }))
          .filter((row: LeadOption) => row.conversation_id.length > 0),
      );
      setOpenAlerts((Array.isArray(alertData) ? alertData : []) as AlertItem[]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoadingCalendar(false);
    }
  }, [workspace?.id]);

  useEffect(() => {
    void fetchSupportData();
  }, [fetchSupportData]);

  useEffect(() => {
    if (!workspace?.id) return;
    const alertsChannel = supabase
      .channel(`meetings-alerts-${workspace.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'instagram_alerts', filter: `workspace_id=eq.${workspace.id}` },
        () => {
          void fetchSupportData();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(alertsChannel);
    };
  }, [workspace?.id, fetchSupportData]);

  const refreshSupportData = useCallback(async () => {
    await fetchSupportData();
  }, [fetchSupportData]);

  const handleConnectCalendar = async () => {
    if (isSetterMode) return;
    setIsConnecting(true);
    try {
      const { error } = await connectGoogleCalendar();
      if (error) {
        toast.error('Failed to start Google Calendar connection');
        console.error('OAuth error:', error);
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error('Error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (isSetterMode) return;
    if (!connectedCalendar || !workspace?.id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in again');
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'disconnect',
          calendarDbId: connectedCalendar.id,
          workspaceId: workspace.id
        })
      });
      if (response.ok) {
        setConnectedCalendar(null);
        toast.success('Google Calendar disconnected');
        await refreshSupportData();
      } else {
        toast.error('Failed to disconnect calendar');
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error('Error:', err);
    }
  };

  const handleSyncCalendar = async () => {
    if (isSetterMode) return;
    const ok = await syncFromGoogleCalendar();
    if (ok) {
      await refreshSupportData();
      toast.success('Calendar synced');
    }
  };

  const handleCancelMeeting = async (id: string) => {
    await cancelMeeting(id);
  };

  const handleDeleteMeeting = async (id: string) => {
    await deleteMeeting(id);
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDrawerOpen(true);
  };

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const joinableMeetings = useMemo(
    () => meetings.filter((meeting) => Boolean(meeting.google_event_id) && Boolean(meeting.meeting_link)),
    [meetings],
  );

  const upcomingMeetings = useMemo(
    () =>
      joinableMeetings
        .filter((meeting) => new Date(meeting.end_time) >= now && meeting.status !== 'cancelled')
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [joinableMeetings, now],
  );

  const agendaMeetings = useMemo(() => upcomingMeetings.slice(0, 8), [upcomingMeetings]);

  const upcoming7dCount = useMemo(
    () =>
      joinableMeetings.filter((meeting) => {
        const start = new Date(meeting.start_time);
        return start >= now && start <= sevenDaysFromNow && meeting.status !== 'cancelled';
      }).length,
    [joinableMeetings, now, sevenDaysFromNow],
  );

  const reminderQueue = useMemo<ReminderQueueItem[]>(() => {
    const items: ReminderQueueItem[] = [];
    for (const meeting of upcomingMeetings) {
      if (meeting.outcome_status !== 'pending') continue;
      const start = new Date(meeting.start_time);
      const msUntil = start.getTime() - now.getTime();
      if (msUntil <= 0) continue;

      if (msUntil <= 24 * 60 * 60 * 1000 && msUntil > 60 * 60 * 1000 && !meeting.reminder_24h_sent_at) {
        items.push({ meeting, kind: '24h', dueAt: new Date(start.getTime() - 24 * 60 * 60 * 1000) });
      } else if (msUntil <= 60 * 60 * 1000 && !meeting.reminder_1h_sent_at) {
        items.push({ meeting, kind: '1h', dueAt: new Date(start.getTime() - 60 * 60 * 1000) });
      }
    }

    return items.sort((a, b) => new Date(a.meeting.start_time).getTime() - new Date(b.meeting.start_time).getTime());
  }, [upcomingMeetings, now]);

  const meetingsNeedingOutcome = useMemo(
    () =>
      joinableMeetings
        .filter((meeting) => new Date(meeting.end_time) < now && meeting.outcome_status === 'pending' && meeting.status !== 'cancelled')
        .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime()),
    [joinableMeetings, now],
  );

  const meetingsNeedingFollowup = useMemo(
    () =>
      joinableMeetings
        .filter((meeting) => ['completed', 'no_show', 'rescheduled'].includes(meeting.outcome_status))
        .filter((meeting) => !meeting.follow_up_task_id)
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()),
    [joinableMeetings],
  );

  const showRateBase = useMemo(() => {
    const inRange = joinableMeetings.filter((meeting) => new Date(meeting.start_time) >= thirtyDaysAgo);
    const finalized = inRange.filter((meeting) => meeting.outcome_status === 'completed' || meeting.outcome_status === 'no_show');
    const completed = finalized.filter((meeting) => meeting.outcome_status === 'completed').length;
    const noShows = finalized.filter((meeting) => meeting.outcome_status === 'no_show').length;
    const rate = finalized.length > 0 ? Math.round((completed / finalized.length) * 100) : 0;
    return { completed, noShows, rate, finalizedCount: finalized.length };
  }, [joinableMeetings, thirtyDaysAgo]);

  const openNoShowFollowups = openAlerts.length;

  const formatMeetingBadge = useCallback((meeting: Meeting) => {
    if (meeting.outcome_status === 'completed') {
      return <Badge className="bg-[#133a2a] text-[#86efac] border-0">Completed</Badge>;
    }
    if (meeting.outcome_status === 'no_show') {
      return <Badge className="bg-[#3c2616] text-[#fb923c] border-0">No show</Badge>;
    }
    if (meeting.outcome_status === 'rescheduled') {
      return <Badge className="bg-[#1f2f3c] text-[#7dd3fc] border-0">Rescheduled</Badge>;
    }
    if (meeting.status === 'cancelled' || meeting.outcome_status === 'cancelled') {
      return <Badge className="bg-[#3d1f1f] text-[#f87171] border-0">Cancelled</Badge>;
    }
    if (isToday(new Date(meeting.start_time))) {
      return <Badge className="bg-white/10 text-white border-border">Today</Badge>;
    }
    return <Badge className="bg-white/[0.06] text-white/80 border-0">Scheduled</Badge>;
  }, []);

  const buildReminderMessage = useCallback((meeting: Meeting, kind: ReminderKind) => {
    const start = new Date(meeting.start_time);
    const dateLabel = format(start, 'EEEE, MMM d');
    const timeLabel = format(start, 'h:mm a');
    const leadName = meeting.client?.name || meeting.title || 'you';

    if (kind === '24h') {
      return `Quick reminder for our call tomorrow (${dateLabel} at ${timeLabel}). ${meeting.meeting_link || ''}`.trim();
    }

    return `Quick reminder: our call starts in about 1 hour (${timeLabel}). ${meeting.meeting_link || ''}`.trim();
  }, []);

  const openLead = useCallback(
    (conversationId: string | null | undefined, prefill?: string, reminderMeetingId?: string, reminderKind?: ReminderKind) => {
      if (!conversationId) {
        toast.error('No linked lead conversation on this meeting yet.');
        return;
      }
      const params = new URLSearchParams();
      params.set('conversation', String(conversationId));
      if (prefill) params.set('msg', prefill);
      if (reminderMeetingId && reminderKind) {
        params.set('reminderMeeting', reminderMeetingId);
        params.set('reminderKind', reminderKind);
      }
      navigate(`/messages?${params.toString()}`);
    },
    [navigate],
  );

  const copyInvite = useCallback(async (meeting: Meeting) => {
    const startDate = new Date(meeting.start_time);
    const endDate = new Date(meeting.end_time);
    const invite = `You're invited to: ${meeting.title}

Date: ${format(startDate, 'EEEE, MMMM d, yyyy')}
Time: ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}
${meeting.location ? `Location: ${meeting.location}` : ''}
${meeting.meeting_link ? `Join: ${meeting.meeting_link}` : ''}
${meeting.description ? `\nNotes: ${meeting.description}` : ''}`.trim();
    try {
      await navigator.clipboard.writeText(invite);
      toast.success('Invite copied');
    } catch {
      toast.error('Copy failed');
    }
  }, []);

  const openOutcomeDialog = useCallback((meeting: Meeting, suggested?: OutcomeStatus) => {
    setOutcomeMeeting(meeting);
    setOutcomeValue(suggested || meeting.outcome_status || 'completed');
    setOutcomeNotes(meeting.outcome_notes || '');
    setCreateFollowupTask(true);
    setOutcomeDialogOpen(true);
  }, []);

  const saveOutcome = useCallback(async () => {
    if (!outcomeMeeting) return;
    setIsOutcomeSaving(true);
    try {
      const ok = await applyOutcome(outcomeMeeting.id, outcomeValue, outcomeNotes, createFollowupTask);
      if (ok) {
        setOutcomeDialogOpen(false);
        await refreshSupportData();
      }
    } finally {
      setIsOutcomeSaving(false);
    }
  }, [outcomeMeeting, applyOutcome, outcomeValue, outcomeNotes, createFollowupTask, refreshSupportData]);

  const isLoading = isLoadingCalendar || isMeetingsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <ListPageSkeleton rows={7} showFilters={false} />
      </DashboardLayout>
    );
  }

  const getAssigneeInfo = (meeting: Meeting) => {
    if (!meeting.assigned_to) return null;
    const member = teamMembers.find(m => m.user_id === meeting.assigned_to);
    return member ? {
      display_name: member.display_name,
      user_id: member.user_id
    } : null;
  };

  if (!connectedCalendar && !isSetterMode) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground/60 mb-8 text-sm text-center max-w-md">
              Connect your Google Calendar to create meetings, add Google Meet links, and keep everything synced
            </p>
            <PremiumButton size="sm" onClick={handleConnectCalendar} disabled={isConnecting}>
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <img src={googleCalendarLogo} alt="Google Calendar" className="w-4 h-4" />
              )}
              {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
            </PremiumButton>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[36px] font-medium">Meetings</h1>
            <p className="text-sm text-white/45 mt-1">Revenue call command center</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncCalendar}
              disabled={isSyncing}
              className="h-9 px-4 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
            {!isSetterMode ? (
              <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl min-w-[220px]">
                  <DropdownMenuLabel className="text-xs text-white/60">Google Calendar</DropdownMenuLabel>
                  <DropdownMenuItem disabled className="text-sm text-white/80">
                    <Calendar className="h-4 w-4 mr-2 text-white/60" />
                    {connectedCalendar?.summary || connectedCalendar?.calendar_id || 'Not connected'}
                  </DropdownMenuItem>
                  {connectedCalendar?.last_synced_at ? (
                    <DropdownMenuItem disabled className="text-xs text-white/45">
                      Last synced {format(new Date(connectedCalendar.last_synced_at), 'MMM d, h:mm a')}
                    </DropdownMenuItem>
                  ) : null}
                  {connectedCalendar?.last_sync_status === 'error' && connectedCalendar?.last_sync_error ? (
                    <DropdownMenuItem disabled className="text-xs text-red-300/80">
                      Last error: {connectedCalendar.last_sync_error}
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  {connectedCalendar ? (
                    <>
                      <DropdownMenuItem onClick={handleSyncCalendar} disabled={isSyncing}>
                        Sync now
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDisconnect}
                        className="text-red-400 focus:text-red-400 hover:bg-red-500/20 data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-200"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={handleConnectCalendar}>
                      Connect Google Calendar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <CreateMeetingDialog
                open={createDialogOpen}
                onOpenChange={handleCreateDialogOpenChange}
                clients={clients}
                leads={leads}
                teamMembers={teamMembers}
                onCreateMeeting={async (payload) => {
                  const created = await createMeeting(payload);
                  if (created) {
                    await refreshSupportData();
                  }
                  return created;
                }}
                defaultDate={new Date()}
                defaultConversationId={requestedConversationId}
                isCalendarConnected={!!connectedCalendar}
              />
              </>
            ) : null}
          </div>
        </div>

        {!isSetterMode && connectedCalendar && needsCalendarReconnect ? (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-white/90">Google Calendar needs reconnect</div>
              <div className="mt-1 text-xs text-white/45">
                Your Google session expired. Reconnect to keep meetings synced.
              </div>
            </div>
            <button
              type="button"
              className="h-8 px-3.5 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90 disabled:opacity-60"
              onClick={handleConnectCalendar}
              disabled={isConnecting}
            >
              Reconnect
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          <div className="rounded-2xl border border-white/10 bg-black p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-white/45">Upcoming 7d</div>
            <div className="mt-2 text-[28px] leading-none font-semibold">{upcoming7dCount}</div>
            <div className="mt-2 text-xs text-white/40">Google-linked joinable calls</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-white/45">Due reminders</div>
            <div className="mt-2 text-[28px] leading-none font-semibold">{reminderQueue.length}</div>
            <div className="mt-2 text-xs text-white/40">24h + 1h reminder queue</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-white/45">Show-up rate (30d)</div>
            <div className="mt-2 text-[28px] leading-none font-semibold">{showRateBase.rate}%</div>
            <div className="mt-2 text-xs text-white/40">{showRateBase.completed} completed · {showRateBase.noShows} no-show</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-white/45">Open no-show follow-ups</div>
            <div className="mt-2 text-[28px] leading-none font-semibold">{openNoShowFollowups}</div>
            <div className="mt-2 text-xs text-white/40">Active alerts from no-show outcomes</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
          <div className="rounded-2xl border border-white/10 bg-black p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Today & Next</h2>
                <p className="text-xs text-white/45 mt-1">Timeline for your next joinable calls</p>
              </div>
            </div>
            {agendaMeetings.length === 0 ? (
              <div className="text-sm text-white/45 py-8 text-center">No upcoming joinable calls</div>
            ) : (
              <div className="space-y-3">
                {agendaMeetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-xl border border-white/10 px-4 py-3 bg-black/60">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-white truncate">{meeting.title}</div>
                          {formatMeetingBadge(meeting)}
                        </div>
                        <div className="text-xs text-white/45 mt-1">
                          {format(new Date(meeting.start_time), 'EEE, MMM d · h:mm a')} - {format(new Date(meeting.end_time), 'h:mm a')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          className="h-8 px-3 rounded-lg border border-white/10 text-[12px] text-white/75 hover:bg-white/[0.06]"
                          onClick={() => copyInvite(meeting)}
                        >
                          <Copy className="h-3.5 w-3.5 mr-1 inline-block" />
                          Invite
                        </button>
                        {meeting.conversation_id ? (
                          <button
                            type="button"
                            className="h-8 px-3 rounded-lg border border-white/10 text-[12px] text-white/75 hover:bg-white/[0.06]"
                            onClick={() => openLead(meeting.conversation_id)}
                          >
                            <MessageCircle className="h-3.5 w-3.5 mr-1 inline-block" />
                            Lead
                          </button>
                        ) : null}
                        {meeting.meeting_link ? (
                          <a
                            href={meeting.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 px-3 rounded-lg bg-white/[0.06] text-[12px] text-white hover:bg-white hover:text-black inline-flex items-center"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Join
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Action Queue</h2>
                <p className="text-xs text-white/45 mt-1">Reminders, outcomes, and follow-ups to clear next</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-white/45 mb-2">Needs reminder</div>
                {reminderQueue.length === 0 ? (
                  <div className="text-xs text-white/35">No reminders due</div>
                ) : (
                  <div className="space-y-2">
                    {reminderQueue.slice(0, 4).map((item) => (
                      <div key={`${item.meeting.id}-${item.kind}`} className="rounded-xl border border-white/10 px-3 py-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm text-white/90 truncate">{item.meeting.title}</div>
                            <div className="text-xs text-white/45 mt-1">
                              {item.kind === '24h' ? '24h reminder' : '1h reminder'} · {format(new Date(item.meeting.start_time), 'EEE, h:mm a')}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="h-8 px-3 rounded-lg bg-white text-black text-[12px] font-semibold hover:bg-white/90"
                            onClick={() =>
                              openLead(
                                item.meeting.conversation_id,
                                buildReminderMessage(item.meeting, item.kind),
                                item.meeting.id,
                                item.kind,
                              )
                            }
                          >
                            Send in DM
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-white/45 mb-2">Needs outcome</div>
                {meetingsNeedingOutcome.length === 0 ? (
                  <div className="text-xs text-white/35">All recent meetings are updated</div>
                ) : (
                  <div className="space-y-2">
                    {meetingsNeedingOutcome.slice(0, 4).map((meeting) => (
                      <div key={meeting.id} className="rounded-xl border border-white/10 px-3 py-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm text-white/90 truncate">{meeting.title}</div>
                            <div className="text-xs text-white/45 mt-1">
                              Ended {format(new Date(meeting.end_time), 'EEE, MMM d · h:mm a')}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="h-8 px-3 rounded-lg border border-white/10 text-[12px] text-white/85 hover:bg-white/[0.06]"
                            onClick={() => openOutcomeDialog(meeting, 'completed')}
                          >
                            Mark outcome
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-white/45 mb-2">Needs follow-up</div>
                {meetingsNeedingFollowup.length === 0 && openAlerts.length === 0 ? (
                  <div className="text-xs text-white/35">No follow-up gaps detected</div>
                ) : (
                  <div className="space-y-2">
                    {meetingsNeedingFollowup.slice(0, 4).map((meeting) => (
                      <div key={meeting.id} className="rounded-xl border border-white/10 px-3 py-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm text-white/90 truncate">{meeting.title}</div>
                            <div className="text-xs text-white/45 mt-1">
                              Outcome: {meeting.outcome_status.replace('_', ' ')}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="h-8 px-3 rounded-lg border border-white/10 text-[12px] text-white/85 hover:bg-white/[0.06]"
                            onClick={() => openOutcomeDialog(meeting, meeting.outcome_status)}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                    {openAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="rounded-xl border border-orange-300/20 bg-orange-500/[0.05] px-3 py-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm text-orange-100 truncate">No-show follow-up alert</div>
                            <div className="text-xs text-orange-200/70 mt-1">
                              {alert.recommended_action || 'Send a recovery message and offer a new slot.'}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="h-8 px-3 rounded-lg border border-orange-300/30 text-[12px] text-orange-100 hover:bg-orange-500/20"
                            onClick={() => openLead(alert.conversation_id)}
                          >
                            Open lead
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="-ml-2 flex items-center gap-2 mb-6">
          {(['upcoming', 'past'] as const).map((filter) => {
            const isActive = listFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setListFilter(filter)}
                className={`h-8 px-3.5 rounded-xl transition-colors text-[13px] font-semibold tracking-[0.02em] ${
                  isActive ? 'bg-[#1b1f21] text-white' : 'bg-transparent text-[#a1a4a5]'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            );
          })}
        </div>

        <MeetingsList
          meetings={meetings}
          onCancel={handleCancelMeeting}
          onDelete={handleDeleteMeeting}
          onMeetingClick={handleMeetingClick}
          filter={listFilter}
          readOnly={isSetterMode}
        />

        <MeetingDetailDrawer
          meeting={selectedMeeting}
          open={meetingDrawerOpen}
          onOpenChange={setMeetingDrawerOpen}
          onCancel={handleCancelMeeting}
          onDelete={handleDeleteMeeting}
          assignee={selectedMeeting ? getAssigneeInfo(selectedMeeting) : null}
          readOnly={isSetterMode}
        />

        <Dialog open={outcomeDialogOpen} onOpenChange={setOutcomeDialogOpen}>
          <DialogContent className="sm:max-w-xl rounded-2xl border border-white/10 bg-black">
            <DialogHeader>
              <DialogTitle>Mark meeting outcome</DialogTitle>
            </DialogHeader>

            {outcomeMeeting ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="text-sm text-white/90">{outcomeMeeting.title}</div>
                  <div className="text-xs text-white/45 mt-1">
                    {format(new Date(outcomeMeeting.start_time), 'EEE, MMM d · h:mm a')}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setOutcomeValue('completed')}
                    className={`h-9 rounded-xl border text-[12px] ${outcomeValue === 'completed' ? 'border-emerald-300/40 bg-emerald-500/20 text-emerald-200' : 'border-white/10 text-white/80 hover:bg-white/[0.05]'}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 inline-block" />
                    Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcomeValue('no_show')}
                    className={`h-9 rounded-xl border text-[12px] ${outcomeValue === 'no_show' ? 'border-orange-300/40 bg-orange-500/20 text-orange-200' : 'border-white/10 text-white/80 hover:bg-white/[0.05]'}`}
                  >
                    <UserRoundX className="h-3.5 w-3.5 mr-1 inline-block" />
                    No show
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcomeValue('rescheduled')}
                    className={`h-9 rounded-xl border text-[12px] ${outcomeValue === 'rescheduled' ? 'border-sky-300/40 bg-sky-500/20 text-sky-200' : 'border-white/10 text-white/80 hover:bg-white/[0.05]'}`}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1 inline-block" />
                    Rescheduled
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcomeValue('cancelled')}
                    className={`h-9 rounded-xl border text-[12px] ${outcomeValue === 'cancelled' ? 'border-red-300/40 bg-red-500/20 text-red-200' : 'border-white/10 text-white/80 hover:bg-white/[0.05]'}`}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1 inline-block" />
                    Cancelled
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-outcome-notes" className="text-white/70 text-xs uppercase tracking-[0.12em]">
                    Notes
                  </Label>
                  <Textarea
                    id="meeting-outcome-notes"
                    value={outcomeNotes}
                    onChange={(e) => setOutcomeNotes(e.target.value)}
                    placeholder="What happened on the call?"
                    rows={4}
                    className="rounded-xl border-white/10 bg-black"
                  />
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/85">Create follow-up task</div>
                    <div className="text-xs text-white/45 mt-1">Automatically create the next best action task</div>
                  </div>
                  <Switch checked={createFollowupTask} onCheckedChange={setCreateFollowupTask} />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    className="h-9 px-4 rounded-xl border border-white/10 text-sm text-white/80 hover:bg-white/[0.04]"
                    onClick={() => setOutcomeDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="h-9 px-4 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
                    onClick={saveOutcome}
                    disabled={isOutcomeSaving}
                  >
                    {isOutcomeSaving ? 'Saving...' : 'Save outcome'}
                  </button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
