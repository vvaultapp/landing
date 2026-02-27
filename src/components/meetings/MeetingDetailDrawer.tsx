import { format, parseISO } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  MapPin, 
  User, 
  Video, 
  ExternalLink, 
  Copy, 
  Trash2, 
  XCircle,
  Calendar,
  Users
} from '@/components/ui/icons';
import { Meeting } from '@/hooks/useMeetings';
import { toast } from 'sonner';

interface MeetingDetailDrawerProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  assignee?: { display_name: string | null; user_id: string } | null;
  readOnly?: boolean;
}

export function MeetingDetailDrawer({ 
  meeting, 
  open, 
  onOpenChange, 
  onCancel, 
  onDelete,
  assignee,
  readOnly = false,
}: MeetingDetailDrawerProps) {
  if (!meeting) return null;

  const startDate = parseISO(meeting.start_time);
  const endDate = parseISO(meeting.end_time);
  const isCancelled = meeting.status === 'cancelled';
  const isPast = endDate < new Date();

  const copyMeetingLink = () => {
    if (meeting.meeting_link) {
      navigator.clipboard.writeText(meeting.meeting_link);
      toast.success('Meeting link copied!');
    }
  };

  const copyInvite = () => {
    const inviteText = `You're invited to: ${meeting.title}
    
📅 Date: ${format(startDate, 'EEEE, MMMM d, yyyy')}
🕐 Time: ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}
${meeting.location ? `📍 Location: ${meeting.location}` : ''}
${meeting.meeting_link ? `🔗 Join: ${meeting.meeting_link}` : ''}
${meeting.description ? `\n📝 Description:\n${meeting.description}` : ''}`;
    
    navigator.clipboard.writeText(inviteText);
    toast.success('Invite copied to clipboard!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <SheetTitle className={`text-xl ${isCancelled ? 'line-through text-muted-foreground' : ''}`}>
              {meeting.title}
            </SheetTitle>
            {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
            {isPast && !isCancelled && <Badge variant="secondary">Completed</Badge>}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium">{format(startDate, 'EEEE, MMMM d, yyyy')}</div>
              <div className="text-sm text-muted-foreground">
                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
              </div>
            </div>
          </div>

          {/* Client */}
          {meeting.client && (
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Client</div>
                <div className="font-medium">{meeting.client.name}</div>
                {meeting.client.email && (
                  <div className="text-sm text-muted-foreground">{meeting.client.email}</div>
                )}
              </div>
            </div>
          )}

          {/* Assigned To */}
          {assignee && (
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Assigned to</div>
                <div className="font-medium">{assignee.display_name || 'Team Member'}</div>
              </div>
            </div>
          )}

          {/* Location */}
          {meeting.location && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-medium">{meeting.location}</div>
              </div>
            </div>
          )}

          {/* Meeting Link */}
          {meeting.meeting_link && (
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">Meeting Link</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Meeting
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" onClick={copyMeetingLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {meeting.description && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-2">Description</div>
                <p className="text-sm whitespace-pre-wrap">{meeting.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={copyInvite}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Invite to Clipboard
            </Button>

            {!readOnly && !isCancelled && !isPast && (
              <Button 
                variant="outline" 
                className="w-full justify-start text-amber-600 hover:text-amber-700"
                onClick={() => { onCancel(meeting.id); onOpenChange(false); }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Meeting
              </Button>
            )}

            {!readOnly ? (
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => { onDelete(meeting.id); onOpenChange(false); }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Meeting
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
