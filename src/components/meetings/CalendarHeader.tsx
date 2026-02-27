import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Calendar, RefreshCw } from '@/components/ui/icons';
import googleCalendarLogo from '@/assets/google-calendar-logo.png';

interface ConnectedCalendar {
  id: string;
  calendar_id: string;
  summary: string | null;
  time_zone: string | null;
}

interface CalendarHeaderProps {
  connectedCalendar: ConnectedCalendar | null;
  onDisconnect: () => void;
  onConnect: () => void;
  isConnecting: boolean;
}

export function CalendarHeader({ 
  connectedCalendar, 
  onDisconnect, 
  onConnect, 
  isConnecting 
}: CalendarHeaderProps) {
  if (!connectedCalendar) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onConnect}
        disabled={isConnecting}
        className="gap-2"
      >
        <img 
          src={googleCalendarLogo} 
          alt="Google Calendar" 
          className="w-4 h-4 object-contain"
        />
        {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <img 
          src={googleCalendarLogo} 
          alt="Google Calendar" 
          className="w-5 h-5 object-contain"
        />
        <div className="text-sm">
          <span className="font-medium">{connectedCalendar.summary || 'Calendar'}</span>
          {connectedCalendar.time_zone && (
            <span className="text-muted-foreground ml-2 text-xs">
              {connectedCalendar.time_zone}
            </span>
          )}
        </div>
        <Badge variant="secondary" className="text-xs">Connected</Badge>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onDisconnect}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
