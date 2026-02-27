import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Send } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';

type SetterMessageRow = {
  id: string;
  workspace_id?: string;
  setter_id: string;
  sender_id?: string;
  sender_type: 'coach' | 'setter';
  content: string;
  read_at?: string | null;
  created_at: string;
};

function missingColumnFromPostgrestError(error: any): string | null {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`;
  const m1 = text.match(/Could not find the '([^']+)' column/i);
  if (m1?.[1]) return m1[1];
  const m2 = text.match(/column\s+[a-z_]+\.(\w+)\s+does not exist/i);
  if (m2?.[1]) return m2[1];
  return null;
}

function normalizeSetterMessageRow(row: any, workspaceId: string): SetterMessageRow {
  const senderTypeRaw = String(row?.sender_type || '').toLowerCase();
  const senderType: 'coach' | 'setter' = senderTypeRaw === 'setter' ? 'setter' : 'coach';
  const content =
    row?.content ??
    row?.message ??
    row?.text ??
    row?.body ??
    row?.message_text ??
    row?.message_body ??
    '';

  return {
    id: String(row?.id || ''),
    workspace_id: row?.workspace_id ? String(row.workspace_id) : workspaceId,
    setter_id: String(row?.setter_id || ''),
    sender_id: row?.sender_id ? String(row.sender_id) : undefined,
    sender_type: senderType,
    content: String(content || ''),
    read_at: row?.read_at ? String(row.read_at) : null,
    created_at: String(row?.created_at || new Date().toISOString()),
  };
}

function formatTimeLabel(value: string) {
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function CoachChat() {
  const { user } = useAuth();
  const { workspace, userRole, members } = useWorkspace();

  const [messages, setMessages] = useState<SetterMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canUsePage = userRole === 'setter';

  const ownerMember = useMemo(() => members.find((m) => m.role === 'owner') || null, [members]);
  const [ownerLabel, setOwnerLabel] = useState<string>('');

  useEffect(() => {
    const initial = String(ownerMember?.displayName || '').trim();
    if (initial) {
      setOwnerLabel(initial);
      return;
    }
    const uid = ownerMember?.userId;
    if (!uid) {
      setOwnerLabel('Team member');
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name,display_name')
        .eq('id', uid)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setOwnerLabel('Team member');
        return;
      }
      const name = String(data?.full_name || data?.display_name || '').trim();
      setOwnerLabel(name || 'Team member');
    })();
    return () => {
      cancelled = true;
    };
  }, [ownerMember?.userId, ownerMember?.displayName]);

  const loadMessages = useCallback(async () => {
    if (!workspace?.id || !user?.id || !canUsePage) return;
    setLoading(true);
    try {
      const withWorkspace = await (supabase as any)
        .from('setter_messages')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('setter_id', user.id)
        .order('created_at', { ascending: true });

      if (withWorkspace.error) {
        const missing = missingColumnFromPostgrestError(withWorkspace.error);
        if (missing === 'workspace_id') {
          const retry = await (supabase as any)
            .from('setter_messages')
            .select('*')
            .eq('setter_id', user.id)
            .order('created_at', { ascending: true });
          if (retry.error) throw retry.error;
          setMessages(
            (Array.isArray(retry.data) ? retry.data : []).map((r: any) => normalizeSetterMessageRow(r, workspace.id)),
          );
          return;
        }
        throw withWorkspace.error;
      }

      setMessages(
        (Array.isArray(withWorkspace.data) ? withWorkspace.data : []).map((r: any) =>
          normalizeSetterMessageRow(r, workspace.id),
        ),
      );
    } catch (err: any) {
      console.error('Error loading setter messages:', err);
      toast.error(err?.message || 'Failed to load coach chat');
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, user?.id, canUsePage]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!workspace?.id || !user?.id || !canUsePage) return;

    const channel = supabase
      .channel(`setter_messages:${workspace.id}:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'setter_messages', filter: `setter_id=eq.${user.id}` },
        (payload) => {
          const row = payload?.new as any;
          if (!row) return;
          if (String(row.setter_id) !== String(user.id)) return;
          const normalized = normalizeSetterMessageRow(row, workspace.id);
          setMessages((prev) => {
            const id = String(normalized.id || '');
            if (id && prev.some((m) => String(m.id) === id)) return prev;
            return [...prev, normalized];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace?.id, user?.id, canUsePage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const coachLabel = useMemo(() => ownerLabel || 'Team member', [ownerLabel]);

  const sendMessage = useCallback(async () => {
    if (!workspace?.id || !user?.id) return;
    if (!draft.trim()) return;
    if (!canUsePage) return;

    const content = draft.trim();
    setSending(true);
    try {
      const payloadBase: Record<string, any> = {
        setter_id: user.id,
        sender_id: user.id,
        sender_type: 'setter',
      };

      const contentKeys = ['content', 'message', 'text', 'body', 'message_text', 'message_body'] as const;
      let inserted: any | null = null;
      let lastError: any = null;

      for (const contentKey of contentKeys) {
        const payload: Record<string, any> = { ...payloadBase, [contentKey]: content, workspace_id: workspace.id };
        for (let i = 0; i < 6; i += 1) {
          const { data, error } = await (supabase as any)
            .from('setter_messages')
            .insert(payload)
            .select('*')
            .single();
          if (!error) {
            inserted = data;
            lastError = null;
            break;
          }
          lastError = error;
          const missing = missingColumnFromPostgrestError(error);
          if (missing === contentKey) break; // try next content key
          if (missing && Object.prototype.hasOwnProperty.call(payload, missing)) {
            delete payload[missing];
            continue;
          }
          break;
        }
        if (inserted) break;
      }

      if (!inserted) throw lastError || new Error('Failed to send message');

      setDraft('');
      const normalized = normalizeSetterMessageRow(inserted, workspace.id);
      if (normalized?.id) {
        setMessages((prev) => {
          const id = String(normalized.id);
          if (prev.some((m) => String(m.id) === id)) return prev;
          return [...prev, normalized];
        });
      }
    } catch (err: any) {
      console.error('Error sending setter message:', err);
      toast.error(err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [workspace?.id, user?.id, draft, canUsePage]);

  if (!canUsePage) {
    return (
      <DashboardLayout>
        <div className="p-8 text-sm text-white/60">Coach chat is only available for setter accounts.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout fullWidth scrollable={false}>
      <div className="h-full flex bg-black overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 pt-5 pb-4 border-b-[0.5px] border-white/10">
            <div className="text-[22px] font-semibold tracking-tight text-white/90">{coachLabel}</div>
            <div className="text-xs text-white/40 mt-1">Direct messages</div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            {loading ? (
              <div className="space-y-4">
                <div className="flex justify-start">
                  <Skeleton className="h-12 w-[62%] max-w-[520px] rounded-2xl bg-white/[0.06]" />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-10 w-[52%] max-w-[420px] rounded-2xl bg-white/[0.08]" />
                </div>
                <div className="flex justify-start">
                  <Skeleton className="h-16 w-[70%] max-w-[560px] rounded-2xl bg-white/[0.06]" />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-12 w-[58%] max-w-[460px] rounded-2xl bg-white/[0.08]" />
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-white/40">No messages yet.</div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender_type === 'setter';
                const time = formatTimeLabel(m.created_at);
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                        isMe ? 'bg-white text-black' : 'bg-white/[0.06] text-white/90 border border-white/10'
                      }`}
                    >
                      <div>{m.content}</div>
                      {time ? (
                        <div className={`mt-1 text-[10px] ${isMe ? 'text-black/50' : 'text-white/35'}`}>{time}</div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-6 py-4 border-t-[0.5px] border-white/10">
            <div className="flex items-end gap-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 min-w-0 max-h-32 resize-none rounded-2xl bg-black border border-white/10 px-4 py-3 text-[13px] text-white/85 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={sending || !draft.trim()}
                className="h-11 w-11 rounded-2xl bg-white text-black grid place-items-center disabled:opacity-50"
                aria-label="Send"
                title="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
