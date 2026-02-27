import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { PortalAccessBlocked } from '@/components/portal/PortalAccessBlocked';
import { CheckSquare, Clock, Circle, Check } from '@/components/ui/icons';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ClientTask, mapDbRowToTask, TaskStatus } from '@/types/client-portal';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PortalFrameSkeleton } from '@/components/skeletons/PortalFrameSkeleton';

export default function PortalTasks() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { portalRole, client, loading, isAccessBlocked, blockReason } = usePortalAuth();
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!client) return;

    try {
      const { data, error } = await supabase
        .from('client_tasks')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []).map(mapDbRowToTask));
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setTasksLoading(false);
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

    fetchTasks();
  }, [user, authLoading, loading, portalRole, client, navigate, fetchTasks]);

  useEffect(() => {
    if (!client?.id) return;

    const channel = supabase
      .channel(`portal-tasks-${client.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_tasks', filter: `client_id=eq.${client.id}` },
        () => {
          void fetchTasks();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [client?.id, fetchTasks]);

  useEffect(() => {
    const refetch = () => {
      if (document.visibilityState === 'visible') {
        void fetchTasks();
      }
    };
    const onOnline = () => void fetchTasks();
    document.addEventListener('visibilitychange', refetch);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', refetch);
      window.removeEventListener('online', onOnline);
    };
  }, [fetchTasks]);

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
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    }
  };

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

  if (authLoading || loading) {
    return <PortalFrameSkeleton />;
  }

  if (isAccessBlocked) {
    return <PortalAccessBlocked reason={blockReason} />;
  }

  if (!client) return null;

  // Sort tasks: pending first, then in_progress, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    const order = { pending: 0, in_progress: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <PortalLayout client={client}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-[36px] font-bold mb-2">Your Tasks</h1>
          <p className="text-muted-foreground">
            {pendingCount > 0 ? `${pendingCount} task${pendingCount !== 1 ? 's' : ''} pending` : 'All caught up!'}
          </p>
        </div>

        {tasksLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-64 rounded-xl bg-white/[0.10]" />
                    <Skeleton className="h-3 w-80 rounded-xl bg-white/[0.06] mt-2" />
                    <Skeleton className="h-3 w-44 rounded-xl bg-white/[0.06] mt-3" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="border border-border rounded-lg p-8 text-center">
            <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tasks assigned yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your coach will add tasks here when ready
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className={`border border-border rounded-lg p-4 hover:bg-sidebar-accent transition-colors ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
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

                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange(task, 'completed')}
                      className="shrink-0 w-8 h-8 rounded-full border-2 border-border hover:border-border hover:bg-success/10 transition-colors flex items-center justify-center"
                      title="Mark as complete"
                    >
                      <Check className="w-4 h-4 text-muted-foreground hover:text-success" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
