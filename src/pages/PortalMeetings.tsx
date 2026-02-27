import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { PortalAccessBlocked } from '@/components/portal/PortalAccessBlocked';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ExternalLink } from '@/components/ui/icons';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { PortalFrameSkeleton } from '@/components/skeletons/PortalFrameSkeleton';

interface ClientMeeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string | null;
  meetingLink: string | null;
  status: string;
  outcomeStatus: 'pending' | 'completed' | 'no_show' | 'rescheduled' | 'cancelled';
}

type MeetingFilter = 'upcoming' | 'past';

export default function PortalMeetings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { portalRole, client, loading, isAccessBlocked, blockReason } = usePortalAuth();
  const [meetings, setMeetings] = useState<ClientMeeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [filter, setFilter] = useState<MeetingFilter>('upcoming');

  const fetchMeetings = useCallback(async () => {
    if (!client) return;

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('id,title,start_time,end_time,location,meeting_link,status,outcome_status')
        .eq('client_id', client.id)
        // Only show meetings that are actually linked to Google Calendar.
        .not('google_event_id', 'is', null)
        // ...and have a join link.
        .not('meeting_link', 'is', null)
        .order('start_time', { ascending: true });

      if (error) throw error;

      setMeetings(
        (data || []).map((meeting) => ({
          id: meeting.id,
          title: meeting.title || 'Meeting',
          startTime: new Date(meeting.start_time),
          endTime: new Date(meeting.end_time),
          location: meeting.location || null,
          meetingLink: meeting.meeting_link || null,
          status: meeting.status || 'scheduled',
          outcomeStatus: (meeting as any).outcome_status || 'pending',
        }))
      );
    } catch (err) {
      console.error('Error fetching portal meetings:', err);
    } finally {
      setMeetingsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (authLoading || loading) return;

    if (!user) {
      navigate('/portal/login');
      return;
    }

    if (portalRole !== 'client') {
      navigate('/dashboard');
      return;
    }

    if (client && !client.onboardingCompleted) {
      navigate('/portal/onboarding');
      return;
    }

    void fetchMeetings();
  }, [user, authLoading, loading, portalRole, client, navigate, fetchMeetings]);

  useEffect(() => {
    if (!client?.id) return;

    const channel = supabase
      .channel(`portal-meetings-${client.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meetings', filter: `client_id=eq.${client.id}` },
        () => {
          void fetchMeetings();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [client?.id, fetchMeetings]);

  useEffect(() => {
    const refetch = () => {
      if (document.visibilityState === 'visible') {
        void fetchMeetings();
      }
    };
    const onOnline = () => void fetchMeetings();
    document.addEventListener('visibilitychange', refetch);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', refetch);
      window.removeEventListener('online', onOnline);
    };
  }, [fetchMeetings]);

  const filteredMeetings = useMemo(() => {
    const now = new Date();
    if (filter === 'upcoming') {
      return meetings.filter((meeting) => meeting.startTime >= now && meeting.status !== 'cancelled');
    }
    return meetings
      .filter((meeting) => meeting.startTime < now || meeting.status === 'cancelled')
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [filter, meetings]);

  if (authLoading || loading) {
    return <PortalFrameSkeleton />;
  }

  if (isAccessBlocked) {
    return <PortalAccessBlocked reason={blockReason} />;
  }

  if (!client) return null;

  return (
    <PortalLayout client={client}>
      <div className="p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[36px] font-bold mb-2">Meetings</h1>
            <p className="text-muted-foreground">
              {meetings.length > 0 ? `${meetings.length} total meeting${meetings.length !== 1 ? 's' : ''}` : 'No meetings scheduled yet'}
            </p>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2">
          {(['upcoming', 'past'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`h-8 px-3.5 rounded-xl transition-colors text-[13px] font-semibold tracking-[0.02em] ${
                filter === key ? 'bg-[#1b1f21] text-white' : 'bg-transparent text-[#a1a4a5]'
              }`}
            >
              {key === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>

        {meetingsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-56 rounded-xl bg-white/[0.10]" />
                    <Skeleton className="h-3 w-72 rounded-xl bg-white/[0.06] mt-2" />
                    <Skeleton className="h-3 w-44 rounded-xl bg-white/[0.06] mt-2" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-xl bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="border border-border rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filter === 'upcoming' ? 'No upcoming meetings' : 'No past meetings'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Meetings created by your coach for this client will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMeetings.map((meeting) => {
              const isCancelled = meeting.status === 'cancelled' || meeting.outcomeStatus === 'cancelled';
              const showCompleted = meeting.outcomeStatus === 'completed';
              const showNoShow = meeting.outcomeStatus === 'no_show';
              const showRescheduled = meeting.outcomeStatus === 'rescheduled';
              return (
                <div key={meeting.id} className="border border-border rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${isCancelled ? 'line-through text-muted-foreground' : ''}`}>
                          {meeting.title}
                        </h3>
                        {showCompleted ? (
                          <Badge className="bg-[#133a2a] text-[#86efac] border-0 rounded-full px-2 py-0.5">
                            Completed
                          </Badge>
                        ) : showNoShow ? (
                          <Badge className="bg-[#3c2616] text-[#fb923c] border-0 rounded-full px-2 py-0.5">
                            No show
                          </Badge>
                        ) : showRescheduled ? (
                          <Badge className="bg-[#1f2f3c] text-[#7dd3fc] border-0 rounded-full px-2 py-0.5">
                            Rescheduled
                          </Badge>
                        ) : null}
                        {isCancelled ? (
                          <Badge className="bg-[#3d1f1f] text-[#f87171] border-0 rounded-full px-2 py-0.5">
                            Cancelled
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(meeting.startTime, 'EEE, MMM d • h:mm a')} - {format(meeting.endTime, 'h:mm a')}
                      </p>
                      {meeting.location && (
                        <p className="text-xs text-muted-foreground mt-1">{meeting.location}</p>
                      )}
                    </div>

                    {!isCancelled && meeting.meetingLink && (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-border hover:bg-sidebar-accent transition-colors"
                      >
                        Join
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
