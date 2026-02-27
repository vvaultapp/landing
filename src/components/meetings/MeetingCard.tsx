import { format, isToday, isPast } from 'date-fns';
import { Meeting } from '@/hooks/useMeetings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  MoreVertical,
  Trash2,
  XCircle,
  ExternalLink,
  Video
} from '@/components/ui/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MeetingCardProps {
  meeting: Meeting;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (meeting: Meeting) => void;
  readOnly?: boolean;
}

export function MeetingCard({ meeting, onCancel, onDelete, onClick, readOnly = false }: MeetingCardProps) {
  const startDate = new Date(meeting.start_time);
  const endDate = new Date(meeting.end_time);
  const isCompleted = meeting.outcome_status === 'completed';
  const isNoShow = meeting.outcome_status === 'no_show';
  const isRescheduled = meeting.outcome_status === 'rescheduled';
  const isCancelled = meeting.status === 'cancelled' || meeting.outcome_status === 'cancelled';
  const dateLabel = format(startDate, 'EEEE d MMMM yyyy');

  const getStatusBadge = () => {
    if (isCancelled) {
      return <Badge variant="destructive" className="text-xs">Cancelled</Badge>;
    }
    if (isNoShow) {
      return <Badge className="text-xs bg-[#3c2616] text-[#fb923c] border-0">No show</Badge>;
    }
    if (isRescheduled) {
      return <Badge className="text-xs bg-[#1f2f3c] text-[#7dd3fc] border-0">Rescheduled</Badge>;
    }
    if (isCompleted) {
      return <Badge variant="secondary" className="text-xs">Completed</Badge>;
    }
    if (isPast(endDate)) {
      return <Badge className="text-xs bg-[#2d2415] text-[#fbbf24] border-0">Needs outcome</Badge>;
    }
    if (isToday(startDate)) {
      return <Badge className="text-xs bg-white/10 text-white border-border">Today</Badge>;
    }
    return null;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click if clicking on buttons or dropdown
    if ((e.target as HTMLElement).closest('button, a, [role="menuitem"]')) {
      return;
    }
    onClick?.(meeting);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`relative w-full rounded-2xl p-6 overflow-hidden cursor-pointer transition-colors duration-200 hover:bg-white/[0.03] bg-black ${isCancelled ? 'opacity-60' : ''}`}
    >
      {/* Fading border effect - matches week analytics card */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(155deg, 
            rgba(255, 255, 255, 0.16) 0%, 
            rgba(255, 255, 255, 0.10) 20%, 
            rgba(255, 255, 255, 0.06) 40%, 
            rgba(255, 255, 255, 0.035) 60%,
            rgba(255, 255, 255, 0.02) 80%,
            rgba(255, 255, 255, 0.008) 95%,
            transparent 100%
          )`,
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Client Name as Headline */}
          <div className="flex items-center gap-3 mb-2">
            <h3 
              className={`text-xl text-white ${isCancelled ? 'line-through opacity-50' : ''}`}
              style={{ 
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                letterSpacing: '0.005em'
              }}
            >
              {meeting.client?.name || meeting.title}
            </h3>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-white/35 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            {dateLabel}
          </p>
          
          {/* Meeting Title if different from client */}
          {meeting.client && meeting.title !== meeting.client.name && (
            <p className="text-white/60 text-sm mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              {meeting.title}
            </p>
          )}
          
          {/* Time and Details */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" strokeWidth={2} />
              {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
            </span>
            
            {meeting.location && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" strokeWidth={2} />
                {meeting.location}
              </span>
            )}
            
            {meeting.meeting_link && (
              <span className="flex items-center gap-2">
                <Video className="w-4 h-4" strokeWidth={2} />
                Google Meet
              </span>
            )}
          </div>

          {meeting.description && (
            <p className="text-sm text-white/40 mt-4 line-clamp-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              {meeting.description}
            </p>
          )}
        </div>

        {readOnly ? null : (
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {!isCancelled && !isCompleted && (
                  <DropdownMenuItem onClick={() => onCancel(meeting.id)} className="rounded-lg">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Meeting
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(meeting.id)}
                  className="text-destructive focus:text-destructive rounded-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

          {meeting.meeting_link && !isCancelled && (
        <div className="relative z-10 mt-5">
          <Button
            size="sm"
            className="w-full rounded-xl bg-white/5 text-white transition-all duration-300 hover:bg-white hover:text-black border-0 shadow-none"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
            asChild
          >
            <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <ExternalLink className="w-4 h-4 mr-1.5" />
              Join
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
