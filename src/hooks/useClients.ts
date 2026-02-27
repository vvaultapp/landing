import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import {
  Client,
  ClientFile,
  ClientPortalStatus,
  ClientTask,
  mapDbRowToClient,
  mapDbRowToFile,
  mapDbRowToTask,
} from '@/types/client-portal';

type CreateClientQuestionInput = {
  question_text: string;
  question_type: string;
  placeholder?: string | null;
  question_order?: number;
  options?: string[];
};

type ClientInviteRow = {
  client_id: string | null;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
};

function applyPortalStatus(client: Client, invite: ClientInviteRow | null): Client {
  const now = Date.now();
  const inviteExpiresAt = invite?.expires_at ? new Date(invite.expires_at) : null;
  const inviteSentAt = invite?.created_at ? new Date(invite.created_at) : null;

  let portalStatus: ClientPortalStatus = 'invitation_pending';

  if (client.onboardingCompleted) {
    portalStatus = 'active';
  } else if (client.userId) {
    portalStatus = 'onboarding_pending';
  } else if (invite) {
    if (invite.accepted_at) {
      portalStatus = 'onboarding_pending';
    } else if (inviteExpiresAt && inviteExpiresAt.getTime() < now) {
      portalStatus = 'invite_expired';
    } else {
      portalStatus = 'invitation_pending';
    }
  }

  return {
    ...client,
    portalStatus,
    latestInviteSentAt: inviteSentAt,
    latestInviteExpiresAt: inviteExpiresAt,
  };
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
  return 'Request failed';
}

export function useClients() {
  const { workspace } = useWorkspace();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClients = useCallback(async () => {
    if (!workspace?.id) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      let latestInviteByClientId = new Map<string, ClientInviteRow>();
      const { data: inviteRows, error: inviteError } = await supabase
        .from('invites')
        .select('client_id,created_at,expires_at,accepted_at')
        .eq('workspace_id', workspace.id)
        .not('client_id', 'is', null)
        .order('created_at', { ascending: false });

      if (inviteError) {
        console.warn('Failed to fetch client invite statuses:', inviteError);
      } else {
        for (const row of (inviteRows || []) as ClientInviteRow[]) {
          if (!row.client_id) continue;
          if (!latestInviteByClientId.has(row.client_id)) {
            latestInviteByClientId.set(row.client_id, row);
          }
        }
      }

      const nextClients = (data || []).map((row) => {
        const mapped = mapDbRowToClient(row);
        const latestInvite = latestInviteByClientId.get(mapped.id) || null;
        return applyPortalStatus(mapped, latestInvite);
      });

      setClients(nextClients);

      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = async (data: { name: string; email?: string; questions?: CreateClientQuestionInput[] }) => {
    if (!workspace?.id) return { client: null, error: new Error('No workspace') };

    try {
      const trimmedName = String(data.name || '').trim();
      if (!trimmedName) return { client: null, error: new Error('Client name is required') };
      const normalizedEmail = data.email?.trim() || null;
      const hasQuestions = Array.isArray(data.questions) && data.questions.length > 0;

      const invokeCreate = async () => {
        const payloadQuestions = (data.questions || [])
          .map((q, index) => ({
            question_text: String(q.question_text || '').trim(),
            question_type: String(q.question_type || 'text').trim() || 'text',
            is_required: true,
            placeholder: String(q.placeholder || '').trim() || null,
            question_order: Number.isFinite(Number(q.question_order)) ? Number(q.question_order) : index,
            options_json: Array.isArray(q.options)
              ? q.options.map((v) => String(v || '').trim()).filter(Boolean)
              : null,
          }))
          .filter((q) => q.question_text.length > 0);

        const { data: result, error: invokeError } = await supabase.functions.invoke('manage-client', {
          body: {
            action: 'create',
            workspaceId: workspace.id,
            name: trimmedName,
            email: normalizedEmail,
            questions: payloadQuestions,
          },
        });

        if (invokeError) {
          const typed = invokeError as { message?: string; context?: Response };
          let detailed = String(typed?.message || '').trim();
          if (typed?.context) {
            try {
              const parsed = await typed.context.clone().json();
              const fromJson = String((parsed as any)?.error || (parsed as any)?.message || '').trim();
              if (fromJson) detailed = fromJson;
            } catch {
              // Ignore JSON parse failures.
            }
          }
          throw new Error(detailed || 'Failed to create client');
        }
        if (!result?.success) {
          throw new Error(String(result?.error || 'Failed to create client'));
        }
        return mapDbRowToClient(result.client);
      };

      // If onboarding questions are provided, always use edge function (service role) for reliable inserts.
      if (hasQuestions) {
        const created = await invokeCreate();
        const client = applyPortalStatus(created, null);
        setClients((prev) => [client, ...prev]);
        return { client, error: null };
      }

      // No questions: try direct insert first, then edge fallback.
      const { data: directRow, error: directError } = await supabase
        .from('clients')
        .insert({
          id: crypto.randomUUID(),
          workspace_id: workspace.id,
          name: trimmedName,
          email: normalizedEmail,
        })
        .select()
        .single();

      if (!directError && directRow) {
        const client = applyPortalStatus(mapDbRowToClient(directRow), null);
        setClients((prev) => [client, ...prev]);
        return { client, error: null };
      }

      console.warn('Direct client insert failed, trying manage-client edge function:', directError);
      const created = await invokeCreate();
      const client = applyPortalStatus(created, null);
      setClients((prev) => [client, ...prev]);
      return { client, error: null };
    } catch (err) {
      console.error('Error creating client:', err);
      return { client: null, error: new Error(toErrorMessage(err)) };
    }
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.instagramHandle !== undefined) dbUpdates.instagram_handle = updates.instagramHandle;
      if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
      if (updates.goals !== undefined) dbUpdates.goals = updates.goals;
      if (updates.subscriptionStatus !== undefined) dbUpdates.subscription_status = updates.subscriptionStatus;
      if (updates.accessUntil !== undefined) dbUpdates.access_until = updates.accessUntil?.toISOString() || null;

      const { error: updateError } = await supabase
        .from('clients')
        .update(dbUpdates)
        .eq('id', clientId);

      if (updateError) throw updateError;

      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, ...updates } : c))
      );
      return { error: null };
    } catch (err) {
      console.error('Error updating client:', err);
      return { error: err as Error };
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!workspace?.id) return { error: new Error('No workspace') };

    try {
      // Use edge function for client deletion (works with or without auth)
      const { data: result, error: invokeError } = await supabase.functions.invoke('manage-client', {
        body: {
          action: 'delete',
          workspaceId: workspace.id,
          clientId,
        },
      });

      if (invokeError) throw invokeError;
      if (!result?.success) throw new Error(result?.error || 'Failed to delete client');

      setClients((prev) => prev.filter((c) => c.id !== clientId));
      return { error: null };
    } catch (err) {
      console.error('Error deleting client:', err);
      return { error: err as Error };
    }
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}

export function useClient(clientId: string | undefined) {
  const [client, setClient] = useState<Client | null>(null);
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClient = useCallback(async () => {
    if (!clientId) {
      setClient(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      if (clientError) throw clientError;
      if (!clientData) {
        setClient(null);
        setError(new Error('Client not found'));
        return;
      }

      // Also fetch the latest invite for this client so "Added/Enrolled" dates are real.
      const { data: inviteRow, error: inviteError } = await supabase
        .from('invites')
        .select('client_id,created_at,expires_at,accepted_at')
        .eq('workspace_id', clientData.workspace_id)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (inviteError) {
        console.warn('Failed to fetch latest invite for client:', inviteError);
      }

      const mappedClient = mapDbRowToClient(clientData);
      setClient(applyPortalStatus(mappedClient, (inviteRow as ClientInviteRow) || null));

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('client_tasks')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks((tasksData || []).map(mapDbRowToTask));

      // Fetch files
      const { data: filesData, error: filesError } = await supabase
        .from('client_files')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;
      setFiles((filesData || []).map(mapDbRowToFile));

      setError(null);
    } catch (err) {
      console.error('Error fetching client:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel(`client-detail-${clientId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_tasks', filter: `client_id=eq.${clientId}` },
        () => {
          void fetchClient();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_files', filter: `client_id=eq.${clientId}` },
        () => {
          void fetchClient();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [clientId, fetchClient]);

  const updateClient = async (updates: Partial<Client>) => {
    if (!clientId) return { error: new Error('No client ID') };

    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.instagramHandle !== undefined) dbUpdates.instagram_handle = updates.instagramHandle;
      if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
      if (updates.goals !== undefined) dbUpdates.goals = updates.goals;
      if (updates.subscriptionStatus !== undefined) dbUpdates.subscription_status = updates.subscriptionStatus;
      if (updates.accessUntil !== undefined) dbUpdates.access_until = updates.accessUntil?.toISOString() || null;

      const { error: updateError } = await supabase
        .from('clients')
        .update(dbUpdates)
        .eq('id', clientId);

      if (updateError) throw updateError;

      setClient((prev) => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (err) {
      console.error('Error updating client:', err);
      return { error: err as Error };
    }
  };

  return {
    client,
    tasks,
    files,
    loading,
    error,
    fetchClient,
    updateClient,
    setTasks,
    setFiles,
  };
}
