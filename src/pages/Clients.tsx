import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from '@/components/ui/icons';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { orbCssVars } from '@/lib/colors';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalStatus } from '@/types/client-portal';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CLIENT_ONBOARDING_QUESTION_TYPES,
  ClientOnboardingQuestionDraft,
  ClientOnboardingQuestionType,
  DEFAULT_CLIENT_ONBOARDING_QUESTIONS,
  normalizeQuestionOptions,
} from '@/lib/client-onboarding';

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

function toOrderedQuestions(questions: ClientOnboardingQuestionDraft[]): ClientOnboardingQuestionDraft[] {
  return questions.map((question, index) => ({
    ...question,
    question_order: index,
    options: Array.isArray(question.options) ? question.options : [],
  }));
}

export default function Clients() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { workspace } = useWorkspace();
  const { clients, loading, createClient, deleteClient, fetchClients } = useClients();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientPortalStatus>('all');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientQuestions, setNewClientQuestions] = useState<ClientOnboardingQuestionDraft[]>(
    toOrderedQuestions(DEFAULT_CLIENT_ONBOARDING_QUESTIONS)
  );
  const [isCreating, setIsCreating] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || (
      client.name.toLowerCase().includes(query) ||
      (client.email || '').toLowerCase().includes(query)
    );
    const matchesStatus = statusFilter === 'all' || client.portalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateDialog = () => {
    setCreateStep(1);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientQuestions(toOrderedQuestions(DEFAULT_CLIENT_ONBOARDING_QUESTIONS));
    setIsCreateDialogOpen(true);
  };

  const handleNextToQuestions = () => {
    const name = newClientName.trim();
    const email = newClientEmail.trim().toLowerCase();

    if (!name) {
      toast.error('Client name is required');
      return;
    }

    if (!email) {
      toast.error('Client email is required');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Enter a valid email address');
      return;
    }

    setCreateStep(2);
  };

  const addQuestion = () => {
    setNewClientQuestions((prev) =>
      toOrderedQuestions([
        ...prev,
        {
          question_text: '',
          question_type: 'text',
          is_required: true,
          placeholder: '',
          question_order: prev.length,
          options: [],
        },
      ])
    );
  };

  const removeQuestion = (index: number) => {
    if (newClientQuestions.length <= 1) {
      toast.error('You need at least one onboarding question');
      return;
    }

    setNewClientQuestions((prev) => toOrderedQuestions(prev.filter((_, i) => i !== index)));
  };

  const updateQuestion = (index: number, updates: Partial<ClientOnboardingQuestionDraft>) => {
    setNewClientQuestions((prev) =>
      toOrderedQuestions(
        prev.map((question, i) => {
          if (i !== index) return question;
          const next = { ...question, ...updates, is_required: true };
          if (next.question_type === 'yes_no') {
            next.options = ['Yes', 'No'];
          }
          if (next.question_type !== 'select' && next.question_type !== 'yes_no') {
            next.options = [];
          }
          return next;
        })
      )
    );
  };

  const sendClientInviteEmail = async (params: {
    clientId: string;
    clientName: string;
    email: string;
  }) => {
    if (!workspace?.id || !workspace?.name || !user?.id) {
      throw new Error('Workspace context is missing');
    }

    const { data: inviteResult, error: inviteInvokeError } = await supabase.functions.invoke('manage-client', {
      body: {
        action: 'invite',
        workspaceId: workspace.id,
        clientId: params.clientId,
        email: params.email,
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
    const clientName = String(inviteResult.clientName || params.clientName);

    const coachName =
      String(profile?.full_name || '').trim() ||
      String(profile?.display_name || '').trim() ||
      workspaceName;

    const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
      body: {
        email: params.email,
        type: 'client-invite',
        inviteToken,
        workspaceName,
        clientId: params.clientId,
        clientName,
        coachName,
      },
    });

    if (emailError) {
      throw new Error(toErrorMessage(emailError));
    }
  };

  const handleCreateClient = async () => {
    const name = newClientName.trim();
    const email = newClientEmail.trim().toLowerCase();

    if (!name) {
      toast.error('Client name is required');
      return;
    }

    if (!email || !isValidEmail(email)) {
      toast.error('A valid email is required');
      return;
    }

    const invalidQuestion = newClientQuestions.find((question) => !question.question_text.trim());
    if (invalidQuestion) {
      toast.error('Every onboarding question needs text');
      return;
    }

    const invalidSelect = newClientQuestions.find(
      (question) => question.question_type === 'select' && normalizeQuestionOptions(question.options).length < 2
    );
    if (invalidSelect) {
      toast.error('Dropdown questions need at least two options');
      return;
    }

    setIsCreating(true);
    try {
      const { client, error } = await createClient({
        name,
        email,
        questions: toOrderedQuestions(newClientQuestions).map((question, index) => ({
          question_text: question.question_text.trim(),
          question_type: question.question_type,
          placeholder: question.placeholder?.trim() || null,
          question_order: index,
          options: question.options,
        })),
      });
      if (error || !client) {
        throw error || new Error('Failed to create client');
      }

      let inviteErrorMessage: string | null = null;
      try {
        await sendClientInviteEmail({
          clientId: client.id,
          clientName: client.name,
          email,
        });
      } catch (inviteErr) {
        inviteErrorMessage = toErrorMessage(inviteErr);
        console.error('Client invite send failed after client creation:', inviteErr);
      }

      setIsCreateDialogOpen(false);
      setCreateStep(1);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientQuestions(toOrderedQuestions(DEFAULT_CLIENT_ONBOARDING_QUESTIONS));
      await fetchClients();

      if (inviteErrorMessage) {
        toast.error(`Client created, but invite failed: ${inviteErrorMessage}`);
      } else {
        toast.success('Invite sent. Client is now visible as Invitation pending.');
      }
    } catch (err) {
      console.error('Error creating client flow:', err);
      const message = toErrorMessage(err);
      toast.error(`Failed to create client: ${message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    const { error } = await deleteClient(clientToDelete);
    if (error) {
      toast.error('Failed to delete client');
    } else {
      toast.success('Client deleted');
    }

    setIsDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const getOnboardingBadge = (status: ClientPortalStatus) => {
    if (status === 'active') {
      return <Badge className="bg-[#1a3a2a] text-[#4ade80] border-0 rounded-full px-3 py-1 font-medium cursor-default">Active</Badge>;
    }
    if (status === 'onboarding_pending') {
      return <Badge className="bg-[#3d3520] text-[#fbbf24] border-0 rounded-full px-3 py-1 font-medium cursor-default">Onboarding pending</Badge>;
    }
    if (status === 'invite_expired') {
      return <Badge className="bg-[#3d1f1f] text-[#f87171] border-0 rounded-full px-3 py-1 font-medium cursor-default">Invite expired</Badge>;
    }
    return <Badge className="bg-[#1f2b3d] text-[#60a5fa] border-0 rounded-full px-3 py-1 font-medium cursor-default">Invitation pending</Badge>;
  };

  const getEnrolledOn = (client: { latestInviteSentAt: Date | null; createdAt: Date }) => {
    const inviteDate = client.latestInviteSentAt;
    if (inviteDate && !Number.isNaN(inviteDate.getTime())) {
      return format(inviteDate, 'MMM d, yyyy');
    }
    return '—';
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="headline-domaine text-[36px] font-medium">Clients</h1>
            <p className="text-sm text-white/45 mt-1">Manage your clients and onboarding</p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-white text-black hover:bg-white/90 shadow-none"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-11 pr-4 h-10 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
            placeholder="Search..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-3">
          {[
            { value: 'all' as const, label: 'All clients' },
            { value: 'invitation_pending' as const, label: 'Invitation pending' },
            { value: 'onboarding_pending' as const, label: 'Onboarding pending' },
            { value: 'active' as const, label: 'Active' },
            { value: 'invite_expired' as const, label: 'Invite expired' },
          ].map((filterItem) => (
            <button
              key={filterItem.value}
              type="button"
              onClick={() => setStatusFilter(filterItem.value)}
              className={`h-10 px-4 rounded-2xl border text-sm font-light inline-flex items-center gap-2 transition-colors ${
                statusFilter === filterItem.value
                  ? 'border-white/25 bg-white/[0.06] text-white'
                  : 'border-white/10 bg-black text-white/85 hover:bg-white/[0.03]'
              }`}
            >
              <span>{filterItem.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-[1fr_140px_140px_48px] gap-4 px-5 py-4 items-center ${
                  idx !== 6 ? 'border-b-[0.5px] border-border' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-40 rounded-xl bg-white/10" />
                    <Skeleton className="h-3 w-56 rounded-xl bg-white/[0.06] mt-2" />
                  </div>
                </div>
                <Skeleton className="h-7 w-28 rounded-full bg-white/[0.06]" />
                <Skeleton className="h-4 w-24 rounded-xl bg-white/[0.06]" />
                <Skeleton className="h-8 w-8 rounded-xl bg-white/[0.06]" />
              </div>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Users className="w-16 h-16 text-muted-foreground/30 mb-6" />
            <p className="text-muted-foreground mb-8 text-lg">
              {searchQuery || statusFilter !== 'all' ? 'No clients match your filters' : 'No clients yet'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <PremiumButton size="sm" onClick={openCreateDialog}>
                <UserPlus className="w-4 h-4" />
                Add your first client
              </PremiumButton>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              {filteredClients.map((client, index) => (
                <div
                  key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className={`grid grid-cols-[1fr_140px_140px_48px] gap-4 px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors items-center ${
                    index !== filteredClients.length - 1 ? 'border-b-[0.5px] border-border' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 acq-orb flex items-center justify-center shrink-0" style={orbCssVars('#4ade80') as any}>
                      <Users className="w-4 h-4" style={{ color: '#4ade80' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{client.name}</div>
                      {client.email && (
                        <div className="text-sm text-muted-foreground/50 truncate">
                          {client.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>{getOnboardingBadge(client.portalStatus)}</div>

                  <div className="text-sm text-muted-foreground/50">
                    {getEnrolledOn(client)}
                  </div>

                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-foreground rounded-xl">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#141414] border-border">
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            setClientToDelete(client.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-[#f87171] focus:text-[#f87171] focus:bg-[#3d2626]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className={`bg-black border-border rounded-3xl ${createStep === 2 ? 'max-w-3xl' : 'max-w-xl'}`}>
            <DialogHeader>
              <DialogTitle>
                {createStep === 1 ? 'Add New Client' : 'Customize Client Onboarding'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Step {createStep} of 2</p>
            </DialogHeader>

            {createStep === 1 ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <input
                    id="client-name"
                    placeholder="John Doe"
                    value={newClientName}
                    onChange={(event) => setNewClientName(event.target.value)}
                    className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-email">Client Email</Label>
                  <input
                    id="client-email"
                    type="email"
                    placeholder="john@example.com"
                    value={newClientEmail}
                    onChange={(event) => setNewClientEmail(event.target.value)}
                    className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4 max-h-[52vh] overflow-y-auto pr-1">
                {newClientQuestions.map((question, index) => (
                  <div key={index} className="border border-border rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground mt-2.5 shrink-0" />

                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Question {index + 1}</Label>
                          <input
                            value={question.question_text}
                            onChange={(event) => updateQuestion(index, { question_text: event.target.value })}
                            placeholder="Enter your question..."
                            className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Input type</Label>
                            <Select
                              value={question.question_type}
                              onValueChange={(value) => updateQuestion(index, { question_type: value as ClientOnboardingQuestionType })}
                            >
                              <SelectTrigger className="bg-black border-border rounded-2xl h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-border">
                                {CLIENT_ONBOARDING_QUESTION_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Placeholder</Label>
                            <input
                              value={question.placeholder}
                              onChange={(event) => updateQuestion(index, { placeholder: event.target.value })}
                              placeholder="Placeholder text..."
                              className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
                            />
                          </div>
                        </div>

                        {question.question_type === 'select' && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Dropdown options (comma separated)</Label>
                            <input
                              value={question.options.join(', ')}
                              onChange={(event) =>
                                updateQuestion(index, {
                                  options: event.target.value
                                    .split(',')
                                    .map((value) => value.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="Option 1, Option 2, Option 3"
                              className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
                            />
                          </div>
                        )}

                        {question.question_type === 'yes_no' && (
                          <p className="text-xs text-muted-foreground">This question uses Yes / No automatically.</p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(index)}
                        className="shrink-0 text-muted-foreground hover:text-red-400 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addQuestion} className="w-full border-dashed border-border rounded-2xl bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            )}

            <DialogFooter>
              {createStep === 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-border rounded-xl bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleNextToQuestions}
                    className="bg-white text-black hover:bg-white/90 shadow-none rounded-xl"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setCreateStep(1)}
                    className="border-border rounded-xl bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateClient}
                    disabled={isCreating}
                    className="bg-white text-black hover:bg-white/90 shadow-none rounded-xl"
                  >
                    {isCreating ? 'Creating...' : 'Create Client & Send Invite'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-[#0a0a0a] border-border rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this client? This will also delete all their files and tasks. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border hover:bg-[#1a1a1a] rounded-2xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteClient} className="bg-[#dc2626] hover:bg-[#b91c1c] border-0 rounded-2xl">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
