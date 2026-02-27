import { useMemo } from 'react';
import { format, parseISO, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';
import { CalendarTodo } from '@/hooks/useCalendarTodos';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, 
  Calendar,
  Clock,
  AlertCircle
} from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface TodosListProps {
  todos: CalendarTodo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodosList({ todos, onToggle, onDelete }: TodosListProps) {
  const groupedTodos = useMemo(() => {
    // Sort by completion status, then by date
    const sorted = [...todos].sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    // Group by date
    const groups: { [key: string]: CalendarTodo[] } = {};
    
    sorted.forEach(todo => {
      const date = startOfDay(parseISO(todo.due_date));
      const key = date.toISOString();
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(todo);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([dateKey, todos]) => ({
        date: new Date(dateKey),
        todos,
      }));
  }, [todos]);

  const getDateHeader = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  const isOverdue = (date: Date, isCompleted: boolean) => {
    return !isCompleted && isPast(date) && !isToday(date);
  };

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-1">No to-dos</h3>
        <p className="text-muted-foreground text-sm">
          Add your first to-do to start organizing your tasks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedTodos.map(({ date, todos }) => (
        <div key={date.toISOString()}>
          <h3 className={cn(
            "text-sm font-medium mb-3",
            isOverdue(date, false) ? "text-destructive" : "text-muted-foreground"
          )}>
            {getDateHeader(date)}
            {isOverdue(date, false) && (
              <span className="ml-2 inline-flex items-center gap-1 text-destructive">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {todos.map(todo => (
              <Card 
                key={todo.id} 
                className={cn(
                  "transition-all hover:shadow-md",
                  todo.is_completed && "opacity-60"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={todo.is_completed}
                      onCheckedChange={() => onToggle(todo.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "font-medium",
                          todo.is_completed && "line-through text-muted-foreground"
                        )}>
                          {todo.title}
                        </span>
                        {getPriorityBadge(todo.priority)}
                        {isOverdue(parseISO(todo.due_date), todo.is_completed) && (
                          <Badge variant="destructive" className="text-xs">Overdue</Badge>
                        )}
                      </div>
                      
                      {todo.due_time && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {todo.due_time}
                        </div>
                      )}
                      
                      {todo.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {todo.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(todo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}