import { useState } from 'react';
import { Client } from '@/types/client-portal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Calendar as CalendarIcon } from '@/components/ui/icons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddTaskDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
}

export function AddTaskDialog({ client, open, onOpenChange, onTaskAdded }: AddTaskDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const handleSubmit = async () => {
    if (!title.trim() || !user) {
      toast.error('Please enter a task title');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('client_tasks').insert({
        id: crypto.randomUUID(),
        client_id: client.id,
        workspace_id: client.workspaceId,
        created_by: user.id,
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Task created!');
      setTitle('');
      setDescription('');
      setDueDate(undefined);
      onTaskAdded();
      onOpenChange(false);
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0a0a0a] border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Task for {client.name}
          </DialogTitle>
          <DialogDescription>
            Create a task that {client.name} will see in their portal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="taskTitle">Task Title</Label>
            <input
              id="taskTitle"
              placeholder="e.g., Complete onboarding questionnaire"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskDescription">Description (optional)</Label>
            <textarea
              id="taskDescription"
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors min-h-[96px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Due Date (optional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-black border-border hover:bg-white/[0.04] rounded-2xl',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'No due date set'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#0a0a0a] border-border rounded-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
                {dueDate && (
                  <div className="p-2 border-t-[0.5px] border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full rounded-xl"
                      onClick={() => setDueDate(undefined)}
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="border-border rounded-xl bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-xl"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
