import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface Meeting {
  id: string;
  workspace_id: string;
  client_id: string | null;
  conversation_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  meeting_link: string | null;
  google_event_id: string | null;
  status: string;
  outcome_status: 'pending' | 'completed' | 'no_show' | 'rescheduled' | 'cancelled';
  outcome_notes: string | null;
  outcome_set_by: string | null;
  outcome_set_at: string | null;
  follow_up_task_id: string | null;
  reminder_24h_sent_at: string | null;
  reminder_1h_sent_at: string | null;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    email: string | null;
  } | null;
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  client_id?: string | null;
  conversation_id?: string | null;
  assigned_to?: string | null;
  location?: string;
  meeting_link?: string;
  add_google_meet?: boolean;
  sync_to_google?: boolean;
  attendee_emails?: string[];
}

interface SyncOptions {
  silent?: boolean;
  timeMin?: string;
  timeMax?: string;
}

export function useMeetings() {
  const { user } = useAuth();
  const { workspace, userRole } = useWorkspace();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [needsCalendarReconnect, setNeedsCalendarReconnect] = useState(false);

  const fetchMeetings = useCallback(async () => {
    if (!workspace?.id) {
      setMeetings([]);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('meetings')
        .select('*')
        .eq('workspace_id', workspace.id)
        .not('google_event_id', 'is', null)
        .not('meeting_link', 'is', null);

      if (userRole === 'setter' && user?.id) {
        query = query.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching meetings:', error);
        return;
      }

      setMeetings((data || []) as Meeting[]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspace?.id, userRole, user?.id]);

  useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  const syncFromGoogleCalendar = useCallback(async (opts?: SyncOptions) => {
    const silent = Boolean(opts?.silent);
    if (!workspace?.id) {
      if (!silent) toast.error('No workspace selected');
      return false;
    }

    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!silent) toast.error('Please sign in again');
        setIsSyncing(false);
        return false;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'sync-workspace-events',
          workspaceId: workspace.id,
          providerToken: session.provider_token,
          providerRefreshToken: session.provider_refresh_token,
          timeMin: opts?.timeMin,
          timeMax: opts?.timeMax,
        }),
      });

      const payload = await response.json().catch(() => ({} as any));
      if (!response.ok || payload?.error === 'token_expired') {
        if (payload?.error === 'token_expired') {
          setNeedsCalendarReconnect(true);
          if (!silent) {
            toast.error('Google Calendar needs a reconnect to continue syncing.');
          }
        } else if (!silent) {
          toast.error(String(payload?.error || 'Failed to sync meetings'));
        }
        setIsSyncing(false);
        return false;
      }

      setNeedsCalendarReconnect(false);
      await fetchMeetings();
      return true;
    } catch (err) {
      console.error('Sync error:', err);
      if (!silent) toast.error('An error occurred during sync');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [workspace?.id, fetchMeetings]);

  // Meetings should stay current without manual sync.
  useEffect(() => {
    if (!workspace?.id || userRole === 'setter') return;

    let disposed = false;
    const run = async () => {
      if (disposed) return;
      await syncFromGoogleCalendar({ silent: true });
    };

    void run();

    const intervalId = window.setInterval(() => {
      void run();
    }, 100_000);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void run();
      }
    };
    const onOnline = () => {
      void run();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    };
  }, [workspace?.id, userRole, syncFromGoogleCalendar]);

  const ensureCallBookedTag = useCallback(async (conversationId: string | null | undefined) => {
    if (!workspace?.id || !conversationId) return;

    try {
      const { data: tagRows, error: tagSelectError } = await supabase
        .from('instagram_tags')
        .select('id')
        .eq('workspace_id', workspace.id)
        .ilike('name', 'Call booked')
        .limit(1);

      if (tagSelectError) {
        console.warn('Failed to load Call booked tag:', tagSelectError);
        return;
      }

      let tagId = Array.isArray(tagRows) && tagRows[0]?.id ? String(tagRows[0].id) : '';
      if (!tagId) {
        const { data: newTag, error: insertTagError } = await supabase
          .from('instagram_tags')
          .insert({
            workspace_id: workspace.id,
            name: 'Call booked',
            color: '#9ca3af',
            icon: 'phone-call',
            prompt: 'A call has been booked with this lead.',
            created_by: user?.id || null,
          })
          .select('id')
          .single();

        if (insertTagError) {
          console.warn('Failed creating Call booked tag:', insertTagError);
          return;
        }
        tagId = String((newTag as any)?.id || '');
      }

      if (!tagId) return;

      const { error: mapError } = await (supabase as any)
        .from('instagram_conversation_tags')
        .upsert(
          {
            workspace_id: workspace.id,
            conversation_id: conversationId,
            tag_id: tagId,
            source: 'manual',
            created_by: user?.id || null,
          },
          { onConflict: 'workspace_id,conversation_id,tag_id' },
        );

      if (mapError) {
        console.warn('Failed to map Call booked tag to conversation:', mapError);
      }
    } catch (err) {
      console.warn('Call booked tag automation failed:', err);
    }
  }, [workspace?.id, user?.id]);

  const createMeeting = useCallback(async (meetingData: CreateMeetingData) => {
    if (!workspace?.id) {
      toast.error('No workspace selected');
      return null;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast.error('Please sign in');
        return null;
      }

      let googleEventId: string | null = null;
      let meetLink: string | null = meetingData.meeting_link || null;
      let googleSyncError: string | null = null;

      if (meetingData.sync_to_google || meetingData.add_google_meet) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                action: 'create-event',
                workspaceId: workspace.id,
                providerToken: session.provider_token,
                providerRefreshToken: session.provider_refresh_token,
                addMeet: meetingData.add_google_meet,
                attendees: meetingData.attendee_emails || [],
                event: {
                  summary: meetingData.title,
                  description: meetingData.description,
                  location: meetingData.location,
                  start: {
                    dateTime: meetingData.start_time,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  },
                  end: {
                    dateTime: meetingData.end_time,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  },
                },
              }),
            });

            if (response.ok) {
              const result = await response.json();
              googleEventId = result.googleEventId || null;
              if (result.meetLink) {
                meetLink = result.meetLink;
              }
            } else {
              const body = await response.json().catch(() => ({}));
              const msg = String(body?.error || body?.message || '').trim();
              googleSyncError = msg || `Google Calendar sync failed (${response.status})`;
              console.warn('Failed to sync to Google Calendar:', googleSyncError);
            }
          }
        } catch (err) {
          googleSyncError = 'Google Calendar sync failed';
          console.warn('Google Calendar sync failed:', err);
        }
      }

      if ((meetingData.sync_to_google || meetingData.add_google_meet) && !googleEventId) {
        toast.error(
          googleSyncError
            ? `Google Calendar sync failed: ${googleSyncError}`
            : 'Google Calendar sync failed. Reconnect Google Calendar to sync meetings.',
        );
        return null;
      }

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          workspace_id: workspace.id,
          created_by: authUser.id,
          title: meetingData.title,
          description: meetingData.description || null,
          start_time: meetingData.start_time,
          end_time: meetingData.end_time,
          client_id: meetingData.client_id || null,
          conversation_id: meetingData.conversation_id || null,
          assigned_to: meetingData.assigned_to || null,
          location: meetingData.location || null,
          meeting_link: meetLink,
          google_event_id: googleEventId,
          outcome_status: 'pending',
        } as any)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating meeting:', error);
        toast.error(String((error as any)?.message || 'Failed to create meeting'));
        return null;
      }

      const newMeeting = data as Meeting;
      setMeetings((prev) =>
        [...prev, newMeeting].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
        ),
      );

      if (newMeeting.conversation_id) {
        await ensureCallBookedTag(newMeeting.conversation_id);
      }

      toast.success('Meeting created and synced to Google Calendar');
      return newMeeting;
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred');
      return null;
    }
  }, [workspace?.id, ensureCallBookedTag]);

  const applyOutcome = useCallback(async (
    meetingId: string,
    outcome: 'pending' | 'completed' | 'no_show' | 'rescheduled' | 'cancelled',
    notes?: string,
    createFollowup = true,
  ) => {
    if (!workspace?.id) return false;
    try {
      const { error } = await (supabase as any).rpc('apply_meeting_outcome', {
        p_workspace_id: workspace.id,
        p_meeting_id: meetingId,
        p_outcome: outcome,
        p_notes: notes || null,
        p_create_followup: createFollowup,
      });
      if (error) throw error;

      await fetchMeetings();
      toast.success('Meeting outcome saved');
      return true;
    } catch (err: any) {
      console.error('Failed to apply meeting outcome:', err);
      toast.error(String(err?.message || 'Failed to save meeting outcome'));
      return false;
    }
  }, [workspace?.id, fetchMeetings]);

  const markReminderSent = useCallback(async (
    meetingId: string,
    kind: '24h' | '1h',
  ) => {
    const nowIso = new Date().toISOString();
    const patch =
      kind === '24h'
        ? { reminder_24h_sent_at: nowIso }
        : { reminder_1h_sent_at: nowIso };

    const { error } = await (supabase as any)
      .from('meetings')
      .update(patch)
      .eq('id', meetingId);

    if (error) {
      console.warn('Failed to mark meeting reminder sent:', error);
      return false;
    }

    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? ({ ...m, ...patch } as Meeting) : m)),
    );
    return true;
  }, []);

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      const meeting = meetings.find((m) => m.id === id);

      if (meeting?.google_event_id && workspace?.id) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                action: 'delete-event',
                workspaceId: workspace.id,
                providerToken: session.provider_token,
                providerRefreshToken: session.provider_refresh_token,
                googleEventId: meeting.google_event_id,
              }),
            });
          }
        } catch (err) {
          console.warn('Failed to delete from Google Calendar:', err);
        }
      }

      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting meeting:', error);
        toast.error('Failed to delete meeting');
        return false;
      }

      setMeetings((prev) => prev.filter((m) => m.id !== id));
      toast.success('Meeting deleted');
      return true;
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred');
      return false;
    }
  }, [meetings, workspace?.id]);

  const cancelMeeting = useCallback(async (id: string) => {
    const ok = await applyOutcome(id, 'cancelled', undefined, false);
    if (!ok) return null;
    const cancelled = meetings.find((m) => m.id === id) || null;
    return cancelled;
  }, [applyOutcome, meetings]);

  return {
    meetings,
    isLoading,
    isSyncing,
    needsCalendarReconnect,
    createMeeting,
    deleteMeeting,
    cancelMeeting,
    applyOutcome,
    markReminderSent,
    syncFromGoogleCalendar,
    refetch: fetchMeetings,
  };
}
