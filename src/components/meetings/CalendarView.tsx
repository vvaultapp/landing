import { useState, useMemo } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  parseISO
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Video,
  User,
  Clock
} from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { Meeting } from '@/hooks/useMeetings';
import { CalendarTodo } from '@/hooks/useCalendarTodos';

interface CalendarViewProps {
  meetings: Meeting[];
  todos: CalendarTodo[];
  view: 'week' | 'month';
  onDateSelect: (date: Date) => void;
  onMeetingClick: (meeting: Meeting) => void;
  onTodoClick: (todo: CalendarTodo) => void;
  selectedDate: Date;
}

export function CalendarView({ 
  meetings, 
  todos,
  view, 
  onDateSelect, 
  onMeetingClick,
  onTodoClick,
  selectedDate 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = useMemo(() => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }
  }, [currentDate, view]);

  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    onDateSelect(new Date());
  };

  const getMeetingsForDay = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = parseISO(meeting.start_time);
      return isSameDay(meetingDate, date);
    });
  };

  const getTodosForDay = (date: Date) => {
    return todos.filter(todo => {
      const todoDate = parseISO(todo.due_date);
      return isSameDay(todoDate, date);
    });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-[0.5px] border-border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold ml-2">
            {view === 'week' 
              ? `${format(days[0], 'MMM d')} - ${format(days[6], 'MMM d, yyyy')}`
              : format(currentDate, 'MMMM yyyy')
            }
          </h2>
        </div>
      </div>

      {/* Calendar Grid */}
      {view === 'month' ? (
        <div className="flex-1 overflow-auto">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b-[0.5px] border-border bg-muted/30">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 flex-1">
            {days.map((day, idx) => {
              const dayMeetings = getMeetingsForDay(day);
              const dayTodos = getTodosForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = isSameDay(day, selectedDate);
              
              return (
                <div
                  key={idx}
                  onClick={() => onDateSelect(day)}
                  className={cn(
                    "min-h-[100px] p-2 border-b-[0.5px] border-r-[0.5px] border-border cursor-pointer transition-colors hover:bg-muted/50",
                    !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                    isSelected && "bg-primary/10 ring-2 ring-primary ring-inset",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                    isToday(day) && "bg-primary text-primary-foreground"
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 2).map(meeting => (
                      <div
                        key={meeting.id}
                        onClick={(e) => { e.stopPropagation(); onMeetingClick(meeting); }}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer transition-colors",
                          meeting.status === 'cancelled' 
                            ? "bg-destructive/10 text-destructive line-through"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                      >
                        {meeting.meeting_link && <Video className="w-3 h-3 inline mr-1" />}
                        {format(parseISO(meeting.start_time), 'h:mm a')} {meeting.title}
                      </div>
                    ))}
                    {dayTodos.slice(0, 1).map(todo => (
                      <div
                        key={todo.id}
                        onClick={(e) => { e.stopPropagation(); onTodoClick(todo); }}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer transition-colors",
                          todo.is_completed 
                            ? "bg-muted text-muted-foreground line-through"
                            : todo.priority === 'high' 
                              ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                              : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {todo.title}
                      </div>
                    ))}
                    {(dayMeetings.length > 2 || dayTodos.length > 1) && (
                      <div className="text-xs text-muted-foreground pl-1">
                        +{dayMeetings.length - 2 + Math.max(0, dayTodos.length - 1)} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Week View */
        <div className="flex-1 flex overflow-hidden">
          {/* Time column */}
          <div className="w-16 flex-shrink-0 border-r-[0.5px] border-border">
            <div className="h-12 border-b-[0.5px] border-border"></div>
            {hours.map(hour => (
              <div key={hour} className="h-12 text-xs text-muted-foreground pr-2 text-right pt-0">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
            ))}
          </div>

          {/* Days columns */}
          <div className="flex-1 flex overflow-x-auto">
            {days.map((day, dayIdx) => {
              const dayMeetings = getMeetingsForDay(day);
              const dayTodos = getTodosForDay(day);
              
              return (
                <div 
                  key={dayIdx} 
                  className={cn(
                    "flex-1 min-w-[120px] border-r-[0.5px] border-border",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  {/* Day header */}
                  <div 
                    className="h-12 border-b-[0.5px] border-border p-2 text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onDateSelect(day)}
                  >
                    <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                    <div className={cn(
                      "text-sm font-medium w-6 h-6 mx-auto flex items-center justify-center rounded-full",
                      isToday(day) && "bg-primary text-primary-foreground"
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  {/* Hour slots */}
                  <div className="relative">
                    {hours.map(hour => (
                      <div 
                        key={hour} 
                        className="h-12 border-b-[0.5px] border-border hover:bg-muted/30 cursor-pointer"
                        onClick={() => {
                          const date = new Date(day);
                          date.setHours(hour);
                          onDateSelect(date);
                        }}
                      />
                    ))}
                    
                    {/* Meetings overlay */}
                    {dayMeetings.map(meeting => {
                      const start = parseISO(meeting.start_time);
                      const end = parseISO(meeting.end_time);
                      const startHour = start.getHours() + start.getMinutes() / 60;
                      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                      
                      return (
                        <div
                          key={meeting.id}
                          onClick={() => onMeetingClick(meeting)}
                          className={cn(
                            "absolute left-1 right-1 rounded p-1 text-xs cursor-pointer overflow-hidden",
                            meeting.status === 'cancelled'
                              ? "bg-destructive/20 text-destructive border border-border"
                              : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                          )}
                          style={{
                            top: `${startHour * 48}px`,
                            height: `${Math.max(duration * 48, 24)}px`
                          }}
                        >
                          <div className="font-medium truncate">{meeting.title}</div>
                          <div className="flex items-center gap-1 text-[10px] opacity-80">
                            <Clock className="w-3 h-3" />
                            {format(start, 'h:mm a')}
                          </div>
                          {meeting.client && (
                            <div className="flex items-center gap-1 text-[10px] opacity-80">
                              <User className="w-3 h-3" />
                              {meeting.client.name}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
