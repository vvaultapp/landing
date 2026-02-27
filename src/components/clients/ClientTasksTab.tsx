import { useState } from 'react';
import { Client, ClientTask, TaskStatus } from '@/types/client-portal';
import { CheckSquare, Plus, MoreHorizontal, Trash2, Check, Clock, Circle } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AddTaskDialog } from './AddTaskDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface ClientTasksTabProps {
  client: Client;
  tasks: ClientTask[];
  onRefresh: () => void;
}

export function ClientTasksTab({ client, tasks, onRefresh }: ClientTasksTabProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState<ClientTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-success/20 text-success border-0">
            <Check className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-0">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
            <Circle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const handleStatusChange = async (task: ClientTask, newStatus: TaskStatus) => {
    try {
      const updates: Record<string, any> = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { error } = await supabase
        .from('client_tasks')
        .update(updates)
        .eq('id', task.id);

      if (error) throw error;

      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
      onRefresh();
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!deleteTask) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('client_tasks')
        .delete()
        .eq('id', deleteTask.id);

      if (error) throw error;

      toast.success('Task deleted');
      setDeleteTask(null);
      onRefresh();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  // Sort tasks: pending first, then in_progress, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    const order = { pending: 0, in_progress: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="border border-border rounded-3xl p-8 text-center">
          <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No tasks created yet</p>
          <p className="text-sm text-muted-foreground">
            Create tasks for {client.name} to complete
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`border border-border rounded-3xl p-4 hover:bg-sidebar-accent transition-colors ${
                task.status === 'completed' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    {getStatusBadge(task.status)}
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.dueDate && (
                      <span>Due: {format(task.dueDate, 'MMM d, yyyy')}</span>
                    )}
                    {task.completedAt && (
                      <span>Completed: {format(task.completedAt, 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    {task.status !== 'pending' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(task, 'pending')}>
                        <Circle className="w-4 h-4 mr-2" />
                        Mark as Pending
                      </DropdownMenuItem>
                    )}
                    {task.status !== 'in_progress' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(task, 'in_progress')}>
                        <Clock className="w-4 h-4 mr-2" />
                        Mark as In Progress
                      </DropdownMenuItem>
                    )}
                    {task.status !== 'completed' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(task, 'completed')}>
                        <Check className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteTask(task)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTaskDialog
        client={client}
        open={addOpen}
        onOpenChange={setAddOpen}
        onTaskAdded={onRefresh}
      />

      <AlertDialog open={!!deleteTask} onOpenChange={() => setDeleteTask(null)}>
        <AlertDialogContent className="bg-card border-border rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTask?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
