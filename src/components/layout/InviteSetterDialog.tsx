import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, UserPlus, Loader2 } from '@/components/ui/icons';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface InviteSetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteSetterDialog({ open, onOpenChange }: InviteSetterDialogProps) {
  const [email, setEmail] = useState('');
  const teamRole = 'setter' as const;
  const [isLoading, setIsLoading] = useState(false);
  const { workspace } = useWorkspace();
  const { user } = useAuth();

  const extractEdgeErrorMessage = async (error: unknown) => {
    const typedError = error as { message?: string; context?: Response };
    const fallback = String(typedError?.message || '').trim();
    const ctx = typedError?.context;
    if (!ctx) return fallback || 'Failed to send invitation';

    try {
      const clone = ctx.clone();
      const body = await clone.json();
      const detail = String(body?.error || body?.message || '').trim();
      if (detail) return detail;
    } catch {
      // Ignore JSON parse failures and continue to text fallback.
    }

    try {
      const clone = ctx.clone();
      const text = String(await clone.text()).trim();
      if (text) return text;
    } catch {
      // Ignore text read failures.
    }

    return fallback || 'Failed to send invitation';
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!workspace || !user) {
      toast.error('Unable to send invite. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        throw new Error('Session expired. Please sign in again.');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.functions.invoke('send-setter-invite', {
        body: {
          email: normalizedEmail,
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          invitedBy: user.id,
          role: teamRole,
        },
      });

      if (error) {
        const edgeMessage = await extractEdgeErrorMessage(error);
        throw new Error(edgeMessage || 'Failed to send invitation');
      }

      if (!data.success) {
        const edgeMessage = String(data.error || 'Failed to send invitation').trim();
        throw new Error(edgeMessage || 'Failed to send invitation');
      }

      if (data.emailDelivered === false && data.inviteUrl) {
        try {
          await navigator.clipboard.writeText(data.inviteUrl);
          toast.warning('Email delivery failed. Invite link copied to clipboard.');
        } catch {
          toast.warning(`Email delivery failed. Share this invite link manually: ${data.inviteUrl}`);
        }
      } else {
        toast.success(`Setter invite sent to ${email}`);
      }
      setEmail('');
      onOpenChange(false);
    } catch (err) {
      console.error('Error sending invite:', err);
      const message = err instanceof Error && err.message
        ? err.message
        : 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Invite a setter to this workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="member-role">Role</Label>
            <select
              id="member-role"
              value={teamRole}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm"
              disabled
            >
              <option value="setter">Setter</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="setter-email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="setter-email"
                type="email"
                placeholder="setter@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">What they'll get access to:</p>
            <ul className="space-y-1">
              <li>• Instagram DMs & Lead Filtering</li>
              <li>• Task Management</li>
              <li>• Workspace inbox assignment</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="flex-1 bg-blue-500 text-white hover:bg-blue-600 rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
