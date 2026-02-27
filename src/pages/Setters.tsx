import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type WorkspaceMemberRow = {
  id: string;
  user_id: string;
  role: 'owner' | 'setter';
  display_name: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type SetterRow = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  joinedAt: string;
};

export default function Setters() {
  const { workspace, userRole } = useWorkspace();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [setters, setSetters] = useState<SetterRow[]>([]);

  const canUsePage = userRole === 'setter' || userRole === 'owner';

  const fetchSetters = useCallback(async () => {
    if (!workspace?.id) return;

    setLoading(true);
    try {
      const { data: memberRows, error: memberError } = await supabase
        .from('workspace_members')
        .select('id,user_id,role,display_name,created_at')
        .eq('workspace_id', workspace.id)
        .eq('role', 'setter')
        .order('created_at', { ascending: true });

      if (memberError) throw memberError;

      const members = (memberRows || []) as WorkspaceMemberRow[];
      const userIds = members.map((m) => String(m.user_id)).filter(Boolean);

      const profilesById: Record<string, ProfileRow> = {};
      if (userIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id,full_name,display_name,avatar_url')
          .in('id', userIds);
        if (profileError) {
          // Non-fatal; fall back to workspace_members.display_name.
          console.warn('Failed to load setter profiles:', profileError);
        } else {
          for (const p of (profileRows || []) as ProfileRow[]) {
            profilesById[String(p.id)] = p;
          }
        }
      }

      const rows: SetterRow[] = members.map((m) => {
        const uid = String(m.user_id || '');
        const p = profilesById[uid] || null;

        const explicit = String(m.display_name || '').trim();
        const profileFullName = String(p?.full_name || '').trim();
        const profileDisplayName = String(p?.display_name || '').trim();
        const preferredName = profileFullName || profileDisplayName || explicit || 'Appointment Setter';

        // If this is the signed-in user, prefer their local profile name (keeps it consistent everywhere).
        let name = preferredName;
        if (uid && uid === String(user?.id || '')) {
          const selfName = String(profile?.full_name || profile?.display_name || '').trim();
          if (selfName) name = selfName;
        }

        return {
          userId: uid,
          name,
          avatarUrl: p?.avatar_url ? String(p.avatar_url) : null,
          joinedAt: String(m.created_at || ''),
        };
      });

      setSetters(rows);
    } catch (err: any) {
      console.error('Failed to load setters:', err);
      toast.error(err?.message || 'Failed to load setters');
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, user?.id, profile?.full_name, profile?.display_name]);

  useEffect(() => {
    void fetchSetters();
  }, [fetchSetters]);

  const rows = useMemo(() => setters, [setters]);

  if (!canUsePage) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="rounded-3xl border border-white/10 bg-black p-6 text-sm text-white/70">
            This page is only available to workspace owners and setters.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[36px] font-medium">Setters</h1>
            <p className="text-sm text-white/45 mt-1">Your team roster</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="p-6">
              <Skeleton className="h-5 w-40 rounded-xl bg-white/[0.08]" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full bg-white/[0.08]" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-56 rounded-xl bg-white/[0.06]" />
                      <Skeleton className="h-3 w-32 rounded-xl bg-white/[0.05] mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="p-10 text-center">
              <div className="text-sm text-white/75">No setters yet.</div>
              <div className="text-xs text-white/35 mt-2">Invite a setter from the Team page.</div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-black/40">
                  <TableRow className="border-white/8">
                    <TableHead className="text-white/55">Setter</TableHead>
                    <TableHead className="text-white/55">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => {
                    const initial = (s.name || 'S').slice(0, 1).toUpperCase();
                    const joined = s.joinedAt ? format(new Date(s.joinedAt), 'MMM d, yyyy') : '—';
                    const isMe = String(s.userId) === String(user?.id || '');
                    return (
                      <TableRow key={s.userId} className="border-white/8 hover:bg-white/[0.02]">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9 border border-white/10 bg-black/40">
                              <AvatarImage src={s.avatarUrl || undefined} alt={s.name} />
                              <AvatarFallback className="bg-black text-white/70 text-sm">
                                {initial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-white/90 truncate">
                                {s.name}
                                {isMe ? <span className="text-white/40 font-normal"> (You)</span> : null}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-white/55">{joined}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

