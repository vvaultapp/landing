import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Check, Circle, Clock, Trash2, Users, ChevronRight, User } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { TasksPageSkeleton } from '@/components/skeletons/TasksPageSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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

type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface Task {
  id: string;
  client_id: string | null;
  conversation_id: string | null;
  workspace_id: string;
  created_by: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

type FilterType = 'all' | 'my-tasks' | string; // string for client IDs

export default function Tasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspace, userRole } = useWorkspace();
  const { clients } = useClients();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const isSetterMode = userRole === 'setter';

  const fetchTasks = useCallback(async () => {
    if (!workspace?.id) return;

    try {
      if (isSetterMode) {
        if (!user?.id) return;
        const withWorkspace = await (supabase as any)
          .from('setter_tasks')
          .select('*')
          .eq('workspace_id', workspace.id)
          .eq('setter_id', user.id)
          .order('created_at', { ascending: false });

        if (withWorkspace.error) {
          const haystack = `${withWorkspace.error?.message || ''} ${withWorkspace.error?.details || ''} ${withWorkspace.error?.hint || ''}`.toLowerCase();
          if (
            haystack.includes('setter_tasks') &&
            haystack.includes('workspace_id') &&
            (haystack.includes('does not exist') || haystack.includes('schema cache'))
          ) {
            const retry = await (supabase as any)
              .from('setter_tasks')
              .select('*')
              .eq('setter_id', user.id)
              .order('created_at', { ascending: false });
            if (retry.error) throw retry.error;
            const normalized = (Array.isArray(retry.data) ? retry.data : []).map((row: any) => ({
              ...row,
              client_id: null,
            }));
            setTasks(normalized as Task[]);
            return;
          }
          throw withWorkspace.error;
        }

        // Normalize shape to match the rest of this screen.
        const normalized = (Array.isArray(withWorkspace.data) ? withWorkspace.data : []).map((row: any) => ({
          ...row,
          client_id: null,
        }));
        setTasks(normalized as Task[]);
      } else {
        const { data, error } = await supabase
          .from('client_tasks')
          .select('*')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTasks((data || []) as Task[]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, isSetterMode, user?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (isSetterMode && selectedFilter !== 'all') {
      setSelectedFilter('all');
    }
  }, [isSetterMode, selectedFilter]);

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const table = isSetterMode ? 'setter_tasks' : 'client_tasks';
      const first = await (supabase as any).from(table).update(updates).eq('id', task.id);
      if (first.error) {
        // Back-compat: some older schemas don't have `completed_at` yet.
        const haystack = `${first.error?.message || ''} ${first.error?.details || ''} ${first.error?.hint || ''}`.toLowerCase();
        const missingCompletedAt =
          haystack.includes(table) &&
          haystack.includes('completed_at') &&
          (haystack.includes('does not exist') || haystack.includes('schema cache'));
        if (missingCompletedAt) {
          const retry = await (supabase as any).from(table).update({ status: newStatus }).eq('id', task.id);
          if (retry.error) throw retry.error;
        } else {
          throw first.error;
        }
      }

      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (isSetterMode) return;
    if (!taskToDelete) return;

    try {
      const { error } = await supabase
        .from('client_tasks')
        .delete()
        .eq('id', taskToDelete);

      if (error) throw error;

      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task');
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleCreateTask = async () => {
    if (isSetterMode) {
      toast.error('Setters cannot create tasks.');
      return;
    }
    if (!newTaskTitle.trim() || !user || !workspace) {
      toast.error('Please enter a task title');
      return;
    }

    setIsCreating(true);

    try {
      // Build the task data with proper typing
      const clientId = selectedFilter !== 'all' && selectedFilter !== 'my-tasks' ? selectedFilter : null;
      
      const { error } = await supabase.from('client_tasks').insert({
        id: crypto.randomUUID(),
        workspace_id: workspace.id,
        created_by: user.id,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || null,
        due_date: newTaskDueDate || null,
        status: 'pending',
        client_id: clientId,
      });

      if (error) throw error;

      toast.success('Task created!');
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setAddTaskDialogOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-[#1a3a2a] text-[#4ade80] border-0">
            <Check className="w-3 h-3 mr-1" />
            Done
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

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'Personal Task';
    if (isSetterMode) return 'Lead task';
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getTaskSourceLabel = (task: Task): string | null => {
    const title = String(task.title || '').trim().toLowerCase();
    if (title === 'no-show recovery') return 'No-show recovery';
    if (title === 'post-call follow-up' || title === 'reschedule confirmation') return 'Meeting follow-up';
    return null;
  };

  // Filter tasks based on selection
  const filteredTasks = (() => {
    if (selectedFilter === 'all') return tasks;
    if (selectedFilter === 'my-tasks') return tasks.filter(t => t.client_id === null);
    return tasks.filter(t => t.client_id === selectedFilter);
  })();

  // Sort tasks: pending first, then in_progress, then completed
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const order = { pending: 0, in_progress: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  const pendingCount = filteredTasks.filter(t => t.status === 'pending').length;
  const myTasksCount = tasks.filter(t => t.client_id === null && t.status !== 'completed').length;

  // Determine if we can add tasks (always can for personal, or when a client is selected)
  const canAddTask = !isSetterMode && (selectedFilter === 'my-tasks' || (selectedFilter !== 'all' && selectedFilter !== 'my-tasks'));

  // Get the label for the add task dialog
  const getAddTaskLabel = () => {
    if (selectedFilter === 'my-tasks') return 'Add Personal Task';
    const client = clients.find(c => c.id === selectedFilter);
    return client ? `Add Task for ${client.name}` : 'Add Task';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <TasksPageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[36px] font-medium">{isSetterMode ? 'My Tasks' : 'Tasks'}</h1>
            <p className="text-sm text-white/45 mt-1">
              {pendingCount > 0
                ? `${pendingCount} task${pendingCount !== 1 ? 's' : ''} pending • Track tasks and deadlines across your workspace`
                : 'Track tasks and deadlines across your workspace'}
            </p>
          </div>
          {isSetterMode ? (
            <div className="text-xs text-white/45">View-only except completion</div>
          ) : null}
          {canAddTask && (
            <Button 
              onClick={() => setAddTaskDialogOpen(true)} 
              className="bg-white text-black hover:bg-white/90 font-medium border-0 shadow-none rounded-2xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          {!isSetterMode ? <div className="w-64 shrink-0">
            <div className="mb-3">
              <p className="text-sm text-muted-foreground px-1">Filter by</p>
            </div>
            
            {/* All Tasks option */}
            <button
              onClick={() => setSelectedFilter('all')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-1 ${
                selectedFilter === 'all'
                  ? 'bg-white/[0.08] text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span>All Tasks</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
            </button>

            {/* My Tasks option */}
            <button
              onClick={() => setSelectedFilter('my-tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-1 ${
                selectedFilter === 'my-tasks'
                  ? 'bg-white/[0.08] text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              }`}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'radial-gradient(circle at center, #2A2A2A 0%, #1A1A1A 45%, #0F0F0F 100%)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.06), inset 0 -2px 4px rgba(0,0,0,0.6)'
                }}
              >
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <span>My Tasks</span>
              {myTasksCount > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-auto">
                  {myTasksCount}
                </span>
              )}
            </button>

            <div className="space-y-1 mt-2 border-t-[0.5px] border-border pt-2">
              <p className="text-xs text-muted-foreground/60 px-3 py-1">Clients</p>
              {clients.map(client => {
                const clientTaskCount = tasks.filter(t => t.client_id === client.id && t.status !== 'completed').length;
                
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedFilter(client.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      selectedFilter === client.id
                        ? 'bg-white/[0.08] text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: 'radial-gradient(circle at center, #1a3a2a 0%, #152d22 45%, #0d1f17 100%)',
                        boxShadow: 'inset 0 1px 2px rgba(74,222,128,0.08), inset 0 -2px 4px rgba(0,0,0,0.6)'
                      }}
                    >
                      <span className="text-[#4ade80] text-xs font-medium">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="truncate flex-1 text-left">{client.name}</span>
                    {clientTaskCount > 0 && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {clientTaskCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div> : null}

          {/* Task List */}
          <div className="flex-1">
            {loading ? (
              <div className="p-6 space-y-2">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-border">
                    <Skeleton className="h-5 w-5 rounded-full bg-white/[0.06] mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-72 rounded-xl bg-white/[0.10]" />
                      <Skeleton className="h-3 w-96 rounded-xl bg-white/[0.06] mt-2" />
                      <Skeleton className="h-3 w-52 rounded-xl bg-white/[0.06] mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Circle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>{selectedFilter === 'my-tasks' ? 'No personal tasks yet' : selectedFilter === 'all' ? 'No tasks yet' : 'No tasks for this client'}</p>
                {canAddTask && (
                  <Button
                    onClick={() => setAddTaskDialogOpen(true)}
                    variant="outline"
                    className="mt-4 rounded-2xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {getAddTaskLabel()}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Status checkbox */}
                    <button
                      onClick={() => {
                        const next = task.status === 'completed' ? 'pending' : 'completed';
                        handleStatusChange(task, next);
                      }}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        task.status === 'completed'
                          ? 'bg-[#4ade80] border-border'
                          : 'border-border hover:border-border'
                      }`}
                    >
                      {task.status === 'completed' && <Check className="w-3 h-3 text-black" />}
                    </button>

                    {/* Task content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h3>
                          {selectedFilter === 'all' && !isSetterMode && (
                            <button
                              onClick={() => {
                                if (task.client_id) {
                                  navigate(`/clients/${task.client_id}`);
                                }
                              }}
                              className={`text-sm mt-0.5 ${task.client_id ? 'text-muted-foreground hover:text-foreground transition-colors cursor-pointer' : 'text-muted-foreground/60 cursor-default'}`}
                            >
                              {getClientName(task.client_id)}
                            </button>
                          )}
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          {getTaskSourceLabel(task) ? (
                            <div className="mt-2 inline-flex items-center h-6 px-2 rounded-lg bg-white/[0.04] text-[11px] text-white/65">
                              {getTaskSourceLabel(task)}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getStatusBadge(task.status)}
                          {!isSetterMode ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground/50 hover:text-red-400"
                              onClick={() => setTaskToDelete(task.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      {task.due_date && (
                        <p className={`text-xs mt-2 ${
                          new Date(task.due_date) < new Date() && task.status !== 'completed'
                            ? 'text-red-400'
                            : 'text-muted-foreground'
                        }`}>
                          Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Dialog */}
        <Dialog open={addTaskDialogOpen} onOpenChange={setAddTaskDialogOpen}>
          <DialogContent className="bg-[#0a0a0a] border-border rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {getAddTaskLabel()}
              </DialogTitle>
              <DialogDescription>
                {selectedFilter === 'my-tasks' 
                  ? 'Create a personal task for yourself'
                  : `Create a task ${selectedFilter !== 'all' ? `for ${clients.find(c => c.id === selectedFilter)?.name || 'client'}` : ''}`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="taskTitle">Task Title</Label>
                <input
                  id="taskTitle"
                  placeholder="Enter task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDescription">Description (optional)</Label>
                <textarea
                  id="taskDescription"
                  placeholder="Add more details..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors resize-none min-h-[96px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDueDate">Due Date (optional)</Label>
                <input
                  id="taskDueDate"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setAddTaskDialogOpen(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                  setNewTaskDueDate('');
                }}
                className="border-border rounded-xl bg-transparent"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTask} 
                disabled={isCreating || !newTaskTitle.trim()}
                className="bg-white text-black hover:bg-white/90 shadow-none rounded-xl"
              >
                {isCreating ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
          <AlertDialogContent className="bg-[#0a0a0a] border-border rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border hover:bg-[#1a1a1a] rounded-2xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTask}
                className="bg-[#dc2626] hover:bg-[#b91c1c] border-0 rounded-2xl"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
