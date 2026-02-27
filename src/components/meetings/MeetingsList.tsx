import { useMemo } from 'react';
import { Meeting } from '@/hooks/useMeetings';
import { MeetingCard } from './MeetingCard';
import { Calendar } from '@/components/ui/icons';

interface MeetingsListProps {
  meetings: Meeting[];
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onMeetingClick?: (meeting: Meeting) => void;
  filter: 'upcoming' | 'past';
  readOnly?: boolean;
}

export function MeetingsList({ meetings, onCancel, onDelete, onMeetingClick, filter, readOnly = false }: MeetingsListProps) {
  const filteredMeetings = useMemo(() => {
    const now = new Date();

    // Only show meetings that are actually linked to Google Calendar and have a join link.
    const syncedMeetings = meetings.filter((m) => Boolean(m.google_event_id) && Boolean(m.meeting_link));
    
    // Filter based on selected filter
    let result = syncedMeetings;
    if (filter === 'upcoming') {
      result = syncedMeetings.filter(m => 
        new Date(m.end_time) >= now && m.status !== 'cancelled'
      );
    } else if (filter === 'past') {
      result = syncedMeetings.filter(m => 
        new Date(m.end_time) < now || m.status === 'cancelled'
      );
    }

    return result.sort((a, b) => {
      const aTime = new Date(a.start_time).getTime();
      const bTime = new Date(b.start_time).getTime();
      if (filter === 'past') {
        return bTime - aTime;
      }
      return aTime - bTime;
    });
  }, [meetings, filter]);

  if (filteredMeetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-1">No meetings</h3>
        <p className="text-muted-foreground text-sm">
          {filter === 'upcoming' 
            ? 'No upcoming meetings scheduled'
            : filter === 'past'
            ? 'No past meetings'
            : 'No meetings yet. Create your first meeting!'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {filteredMeetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          onCancel={onCancel}
          onDelete={onDelete}
          onClick={onMeetingClick}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
