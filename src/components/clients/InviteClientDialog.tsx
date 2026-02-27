import { useEffect, useState } from 'react';
import { Client } from '@/types/client-portal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, Mail, Settings2, UserPlus } from '@/components/ui/icons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';
import { CustomizeQuestionsDialog } from './CustomizeQuestionsDialog';

interface InviteClientDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isValidEmail(value: string) {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'object' && err) {
    const maybeErr = err as Record<string, unknown>;
    const msg = String(maybeErr.message || maybeErr.error || maybeErr.details || '').trim();
    if (msg) return msg;
    try {
      return JSON.stringify(maybeErr);
    } catch {
      // ignore
    }
  }
  return 'Unknown error';
}

export function InviteClientDialog({ client, open, onOpenChange }: InviteClientDialogProps) {
  const { user, profile } = useAuth();
  const { workspace } = useWorkspace();

  const [email, setEmail] = useState(client.email || '');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(0);

  useEffect(() => {
    if (!open) return;
    setEmail(client.email || '');
    setInviteSent(false);
    void loadQuestionsCount();
  }, [open, client.id, client.email]);

  const loadQuestionsCount = async () => {
    const { count } = await supabase
      .from('client_onboarding_questions')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);
    setQuestionsCount(count || 0);
  };

  const handleSendInvite = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error('Please enter an email address');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!workspace?.id || !workspace?.name || !user?.id) {
      toast.error('Workspace context is missing');
      return;
    }

    setIsInviting(true);

    try {
      const { data: inviteResult, error: inviteInvokeError } = await supabase.functions.invoke('manage-client', {
        body: {
          action: 'invite',
          workspaceId: workspace.id,
          clientId: client.id,
          email: normalizedEmail,
        },
      });

      if (inviteInvokeError) {
        let detailed = toErrorMessage(inviteInvokeError);
        const typed = inviteInvokeError as { context?: Response };
        if (typed?.context) {
          try {
            const parsed = await typed.context.clone().json();
            const fromJson = String((parsed as { error?: string; message?: string })?.error || (parsed as { error?: string; message?: string })?.message || '').trim();
            if (fromJson) detailed = fromJson;
          } catch {
            // Ignore parse errors.
          }
        }
        throw new Error(detailed || 'Failed to create invite');
      }

      if (!inviteResult?.success || !inviteResult?.inviteToken) {
        throw new Error(String(inviteResult?.error || 'Failed to create invite'));
      }

      const inviteToken = String(inviteResult.inviteToken);
      const workspaceName = String(inviteResult.workspaceName || workspace.name);
      const clientName = String(inviteResult.clientName || client.name);

      const coachName =
        String(profile?.full_name || '').trim() ||
        String(profile?.display_name || '').trim() ||
        workspaceName;

      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: normalizedEmail,
          type: 'client-invite',
          inviteToken,
          workspaceName,
          clientId: client.id,
          clientName,
          coachName,
        },
      });

      if (emailError) throw new Error(toErrorMessage(emailError));

      setInviteSent(true);
      toast.success('Invite email sent');
    } catch (err) {
      console.error('Client invite error:', err);
      toast.error(`Failed to send invite email: ${toErrorMessage(err)}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleClose = () => {
    setInviteSent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite {client.name} to Portal
          </DialogTitle>
          <DialogDescription>
            Send a secure invite. They will set their password and access their client portal.
          </DialogDescription>
        </DialogHeader>

        {!inviteSent ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email Address</Label>
                <input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
                />
                <p className="text-xs text-muted-foreground">
                  They will receive an invite link to create their account.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsCustomizeOpen(true)}
                className="w-full border-border bg-transparent hover:bg-[#1a1a1a] rounded-2xl justify-start"
              >
                <Settings2 className="w-4 h-4 mr-2" />
                Customize Onboarding Questions
                {questionsCount > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {questionsCount} questions
                  </span>
                )}
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="rounded-xl bg-transparent border-border">
                Cancel
              </Button>
              <Button
                onClick={handleSendInvite}
                disabled={isInviting || !email.trim()}
                className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-xl"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isInviting ? 'Sending...' : 'Send Invite'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-success/10 border border-border rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-success" />
                  <p className="text-sm text-success font-medium">Invite sent</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  We sent an invite to <strong>{email}</strong>. The client will set their password, complete onboarding, and access their portal.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-xl">
                Done
              </Button>
            </DialogFooter>
          </>
        )}

        <CustomizeQuestionsDialog
          client={client}
          open={isCustomizeOpen}
          onOpenChange={setIsCustomizeOpen}
          onQuestionsUpdated={loadQuestionsCount}
        />
      </DialogContent>
    </Dialog>
  );
}
