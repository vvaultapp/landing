import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  Flame,
  Globe,
  Handshake,
  Heart,
  Link2,
  MapPin,
  Megaphone,
  MessageCircle,
  Mic,
  PhoneCall,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  Tag as TagIcon,
  Trash2,
  Trophy,
  User,
  UserPlus,
  UserRoundX,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProfileAvatar } from '@/components/layout/AppSidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from '@/components/ui/icons';
import { supabase } from '@/integrations/supabase/client';
import { authedInvoke } from '@/integrations/supabase/authedInvoke';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { orbCssVars } from '@/lib/colors';
import { cn } from '@/lib/utils';

type PhaseRow = {
  id: string;
  name: string;
  color: string;
  icon: string;
  prompt: string | null;
  leadCount: number;
};

type BillingIntegrationRow = {
  workspace_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_status: string | null;
  stripe_current_period_end: string | null;
  whop_membership_id: string | null;
  whop_product_id: string | null;
  whop_plan_id: string | null;
  whop_status: string | null;
  whop_expires_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
};

const PHASE_COLORS = [
  '#ec4899',
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#f97316',
  '#3b82f6',
  '#8b5cf6',
  '#9ca3af',
] as const;

const ICON_OPTIONS = [
  { value: 'user-plus', icon: UserPlus },
  { value: 'message-circle', icon: MessageCircle },
  { value: 'star', icon: Star },
  { value: 'x-circle', icon: XCircle },
  { value: 'phone-call', icon: PhoneCall },
  { value: 'trophy', icon: Trophy },
  { value: 'user-round-x', icon: UserRoundX },
  { value: 'tag', icon: TagIcon },
  { value: 'check-circle-2', icon: CheckCircle2 },
  { value: 'badge-check', icon: BadgeCheck },
  { value: 'flame', icon: Flame },
  { value: 'sun', icon: Sun },
  { value: 'snowflake', icon: Snowflake },
  { value: 'link', icon: Link2 },
  { value: 'send', icon: Send },
  { value: 'bell', icon: Bell },
  { value: 'bookmark', icon: Bookmark },
  { value: 'briefcase', icon: Briefcase },
  { value: 'dollar', icon: DollarSign },
  { value: 'zap', icon: Zap },
  { value: 'heart', icon: Heart },
  { value: 'sparkles', icon: Sparkles },
  { value: 'shield-check', icon: ShieldCheck },
  { value: 'shield-alert', icon: ShieldAlert },
  { value: 'megaphone', icon: Megaphone },
  { value: 'clipboard-list', icon: ClipboardList },
  { value: 'file-text', icon: FileText },
  { value: 'camera', icon: Camera },
  { value: 'video', icon: Camera },
  { value: 'mic', icon: Mic },
  { value: 'globe', icon: Globe },
  { value: 'map-pin', icon: MapPin },
  { value: 'building-2', icon: Building2 },
  { value: 'handshake', icon: Handshake },
  { value: 'users', icon: Users },
  { value: 'user', icon: User },
] as const;

const ICON_BY_NAME = new Map<string, (typeof ICON_OPTIONS)[number]['icon']>(
  ICON_OPTIONS.map((item) => [item.value, item.icon])
);

function normalizeName(value: string | null | undefined) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function isTemperatureTagName(value: string | null | undefined) {
  const n = normalizeName(value);
  return (
    n === 'hot' ||
    n === 'warm' ||
    n === 'cold' ||
    n === 'hot lead' ||
    n === 'warm lead' ||
    n === 'cold lead'
  );
}

function PhaseOrb(props: { color: string; icon: string; label: string; sizeClassName?: string }) {
  const { color, icon, label, sizeClassName = 'w-10 h-10' } = props;
  const IconCmp = ICON_BY_NAME.get(String(icon || '').trim().toLowerCase()) || TagIcon;
  return (
    <div
      className={cn(sizeClassName, 'acq-orb flex items-center justify-center shrink-0')}
      style={orbCssVars(color) as any}
      aria-label={label}
      title={label}
    >
      <IconCmp className="h-5 w-5" style={{ color }} />
    </div>
  );
}

type SettingsTab = 'team' | 'phases' | 'socials' | 'integrations';

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { profile, updateProfile, signOut, user, loading: authLoading } = useAuth();
  const { workspace, userRole, updateWorkspace } = useWorkspace();

  const tabParam = String(searchParams.get('tab') || '').trim() as SettingsTab;
  const activeTab: SettingsTab = (['team', 'phases', 'socials', 'integrations'] as const).includes(tabParam as any)
    ? tabParam
    : 'team';
  const isOwner = userRole === 'owner';

  const setActiveTab = useCallback(
    (tab: SettingsTab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        return next;
      });
    },
    [setSearchParams]
  );

  // Profile form state
  const [name, setName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'photo' | 'letter'>('photo');
  const [avatarColor, setAvatarColor] = useState('#2A2A2A');

  // Workspace form state
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  // Integrations state
  const [bookingUrl, setBookingUrl] = useState('');
  const [bookingUrlLoading, setBookingUrlLoading] = useState(false);
  const [bookingUrlSaving, setBookingUrlSaving] = useState(false);
  const [billingStatus, setBillingStatus] = useState<BillingIntegrationRow | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [stripeBusyAction, setStripeBusyAction] = useState<'checkout' | 'portal' | 'sync' | null>(null);
  const [whopMembershipIdInput, setWhopMembershipIdInput] = useState('');
  const [whopBusyAction, setWhopBusyAction] = useState<'link' | 'sync' | null>(null);

  // Phases state
  const [phases, setPhases] = useState<PhaseRow[]>([]);
  const [phasesLoading, setPhasesLoading] = useState(false);
  const [phaseSearch, setPhaseSearch] = useState('');
  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [phaseSaving, setPhaseSaving] = useState(false);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [phaseName, setPhaseName] = useState('');
  const [phaseColor, setPhaseColor] = useState<string>(PHASE_COLORS[0]);
  const [phaseIcon, setPhaseIcon] = useState<string>('tag');
  const [phasePrompt, setPhasePrompt] = useState('');
  const [phaseToDelete, setPhaseToDelete] = useState<PhaseRow | null>(null);

  const navItems = useMemo(
    () =>
      [
        { id: 'team' as const, label: 'Team', icon: Users },
        { id: 'phases' as const, label: 'Phases', icon: TagIcon },
        { id: 'socials' as const, label: 'Socials', icon: Globe },
        { id: 'integrations' as const, label: 'Integrations', icon: Plug },
      ] as const,
    []
  );

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || profile.display_name || '');
      setAvatarMode((profile.avatar_mode as 'photo' | 'letter' | null) || 'photo');
      setAvatarColor(profile.avatar_color || '#2A2A2A');
    }
  }, [profile]);

  useEffect(() => {
    if (workspace) setWorkspaceName(workspace.name || '');
  }, [workspace]);

  useEffect(() => {
    if (!workspace?.id) return;
    let cancelled = false;
    const run = async () => {
      setBookingUrlLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from('workspaces')
          .select('booking_url')
          .eq('id', workspace.id)
          .maybeSingle();

        if (error) throw error;
        if (!cancelled) {
          setBookingUrl(data?.booking_url ? String(data.booking_url) : '');
        }
      } catch (e) {
        console.warn('Failed to load booking URL:', e);
        if (!cancelled) setBookingUrl('');
      } finally {
        if (!cancelled) setBookingUrlLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [workspace?.id]);

  const saveBookingUrl = useCallback(async () => {
    if (!workspace?.id) return;
    if (userRole !== 'owner') return;
    if (bookingUrlSaving) return;
    setBookingUrlSaving(true);
    try {
      const cleaned = bookingUrl.trim();
      const { error } = await (supabase as any)
        .from('workspaces')
        .update({ booking_url: cleaned ? cleaned : null })
        .eq('id', workspace.id);

      if (error) throw error;
      toast.success('Booking link saved');
    } catch (e: any) {
      console.error('Save booking URL error:', e);
      toast.error(e?.message || 'Failed to save booking link');
    } finally {
      setBookingUrlSaving(false);
    }
  }, [workspace?.id, userRole, bookingUrl, bookingUrlSaving]);

  const loadBillingStatus = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!workspace?.id) {
        setBillingStatus(null);
        setWhopMembershipIdInput('');
        return;
      }

      setBillingLoading(true);
      try {
        let row: BillingIntegrationRow | null = null;

        if (isOwner) {
          const { data, error } = await authedInvoke<any>('billing-api', {
            body: { action: 'status', workspaceId: workspace.id },
          });
          if (error) throw error;
          if (data?.error) throw new Error(String(data.error));
          row = (data?.billing || null) as BillingIntegrationRow | null;
        } else {
          const { data, error } = await (supabase as any)
            .from('workspace_billing_integrations')
            .select('*')
            .eq('workspace_id', workspace.id)
            .maybeSingle();
          if (error) throw error;
          row = (data || null) as BillingIntegrationRow | null;
        }

        setBillingStatus(row);
        setWhopMembershipIdInput(String(row?.whop_membership_id || ''));
      } catch (e: any) {
        console.error('Load billing status error:', e);
        setBillingStatus(null);
        if (!options?.silent) {
          toast.error(e?.message || 'Failed to load billing status');
        }
      } finally {
        setBillingLoading(false);
      }
    },
    [workspace?.id, isOwner]
  );

  const runOwnerBillingAction = useCallback(
    async (action: string, payload?: Record<string, unknown>) => {
      if (!workspace?.id) throw new Error('No workspace selected');
      if (!isOwner) throw new Error('Only workspace owners can manage billing');

      const { data, error } = await authedInvoke<any>('billing-api', {
        body: {
          action,
          workspaceId: workspace.id,
          ...(payload || {}),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(String(data.error));
      return data;
    },
    [workspace?.id, isOwner]
  );

  const startStripeCheckout = useCallback(async () => {
    if (stripeBusyAction) return;
    setStripeBusyAction('checkout');
    try {
      const data = await runOwnerBillingAction('stripe_create_checkout');
      const url = String(data?.url || '').trim();
      if (!url) throw new Error('Stripe checkout URL not returned');
      window.location.assign(url);
    } catch (e: any) {
      console.error('Stripe checkout error:', e);
      toast.error(e?.message || 'Failed to open Stripe checkout');
    } finally {
      setStripeBusyAction(null);
    }
  }, [stripeBusyAction, runOwnerBillingAction]);

  const openStripePortal = useCallback(async () => {
    if (stripeBusyAction) return;
    setStripeBusyAction('portal');
    try {
      const data = await runOwnerBillingAction('stripe_create_portal');
      const url = String(data?.url || '').trim();
      if (!url) throw new Error('Stripe portal URL not returned');
      window.location.assign(url);
    } catch (e: any) {
      console.error('Stripe portal error:', e);
      toast.error(e?.message || 'Failed to open Stripe portal');
    } finally {
      setStripeBusyAction(null);
    }
  }, [stripeBusyAction, runOwnerBillingAction]);

  const syncStripeStatus = useCallback(async () => {
    if (stripeBusyAction) return;
    setStripeBusyAction('sync');
    try {
      const data = await runOwnerBillingAction('stripe_sync_subscription');
      if (data?.billing) {
        const row = data.billing as BillingIntegrationRow;
        setBillingStatus(row);
      } else {
        await loadBillingStatus({ silent: true });
      }
      toast.success('Stripe status synced');
    } catch (e: any) {
      console.error('Stripe sync error:', e);
      toast.error(e?.message || 'Failed to sync Stripe status');
    } finally {
      setStripeBusyAction(null);
    }
  }, [stripeBusyAction, runOwnerBillingAction, loadBillingStatus]);

  const linkWhopMembership = useCallback(async () => {
    if (whopBusyAction) return;
    const membershipId = whopMembershipIdInput.trim();
    if (!membershipId) {
      toast.error('Enter a Whop membership ID first');
      return;
    }

    setWhopBusyAction('link');
    try {
      const data = await runOwnerBillingAction('whop_link_membership', { membershipId });
      if (data?.billing) {
        const row = data.billing as BillingIntegrationRow;
        setBillingStatus(row);
        setWhopMembershipIdInput(String(row.whop_membership_id || membershipId));
      } else {
        await loadBillingStatus({ silent: true });
      }
      toast.success('Whop membership linked');
    } catch (e: any) {
      console.error('Whop link error:', e);
      toast.error(e?.message || 'Failed to link Whop membership');
    } finally {
      setWhopBusyAction(null);
    }
  }, [whopBusyAction, whopMembershipIdInput, runOwnerBillingAction, loadBillingStatus]);

  const syncWhopMembership = useCallback(async () => {
    if (whopBusyAction) return;
    const membershipId = whopMembershipIdInput.trim();

    setWhopBusyAction('sync');
    try {
      const data = await runOwnerBillingAction('whop_sync_membership', membershipId ? { membershipId } : undefined);
      if (data?.billing) {
        const row = data.billing as BillingIntegrationRow;
        setBillingStatus(row);
        setWhopMembershipIdInput(String(row.whop_membership_id || membershipId));
      } else {
        await loadBillingStatus({ silent: true });
      }
      toast.success('Whop membership synced');
    } catch (e: any) {
      console.error('Whop sync error:', e);
      toast.error(e?.message || 'Failed to sync Whop membership');
    } finally {
      setWhopBusyAction(null);
    }
  }, [whopBusyAction, whopMembershipIdInput, runOwnerBillingAction, loadBillingStatus]);

  const resetPhaseForm = useCallback(() => {
    setEditingPhaseId(null);
    setPhaseName('');
    setPhaseColor(PHASE_COLORS[0]);
    setPhaseIcon('tag');
    setPhasePrompt('');
  }, []);

  const loadPhases = useCallback(async () => {
    if (!workspace?.id) return;
    setPhasesLoading(true);
    try {
      const { data: tagRows, error: tagError } = await (supabase as any)
        .from('instagram_tags')
        .select('id,name,color,icon,prompt')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: true });
      if (tagError) throw tagError;

      const rows = Array.isArray(tagRows) ? tagRows : [];
      const base = rows
        .map((r: any) => ({
          id: String(r.id),
          name: String(r.name || 'Phase'),
          color: String(r.color || '#8A8A8A'),
          icon: String(r.icon || 'tag'),
          prompt: r.prompt ? String(r.prompt) : null,
        }))
        .filter((r) => !isTemperatureTagName(r.name))
        .filter((r) => {
          const n = normalizeName(r.name);
          return n !== 'priority' && n !== 'spam';
        });

      const { data: links, error: linksError } = await (supabase as any)
        .from('instagram_conversation_tags')
        .select('tag_id')
        .eq('workspace_id', workspace.id);
      if (linksError) throw linksError;

      const counts: Record<string, number> = {};
      for (const link of Array.isArray(links) ? links : []) {
        const tagId = String((link as any).tag_id || '');
        if (!tagId) continue;
        counts[tagId] = (counts[tagId] || 0) + 1;
      }

      setPhases(
        base.map((p) => ({
          ...p,
          leadCount: counts[p.id] || 0,
        }))
      );
    } catch (error: any) {
      console.warn('Failed to load phases:', error);
      setPhases([]);
    } finally {
      setPhasesLoading(false);
    }
  }, [workspace?.id]);

  useEffect(() => {
    if (activeTab !== 'integrations') return;
    loadBillingStatus({ silent: true });
  }, [activeTab, loadBillingStatus]);

  useEffect(() => {
    if (activeTab !== 'phases' || authLoading || !user || !workspace?.id) return;
    loadPhases();
  }, [activeTab, authLoading, user?.id, workspace?.id, loadPhases]);

  const handleSaveProfile = useCallback(async () => {
    setProfileLoading(true);
    const updates: any = {};

    const currentName = String(profile?.full_name || profile?.display_name || '').trim();
    const nextName = String(name || '').trim();

    if (currentName !== nextName) {
      // Persist same value to both name fields so all app surfaces stay consistent.
      updates.display_name = nextName || null;
      updates.full_name = nextName || null;
    }
    if (((profile?.avatar_mode as any) || 'photo') !== avatarMode) updates.avatar_mode = avatarMode;
    if ((profile?.avatar_color || '#2A2A2A') !== avatarColor) updates.avatar_color = avatarColor;

    if (Object.keys(updates).length === 0) {
      setProfileLoading(false);
      toast.success('Profile updated');
      return;
    }

    const { error } = await updateProfile(updates);
    setProfileLoading(false);

    if (error) {
      const message = String((error as any)?.message || 'Failed to update profile');
      toast.error(message);
      return;
    }

    toast.success('Profile updated');
  }, [profile, name, avatarMode, avatarColor, updateProfile]);

  const handleSaveWorkspace = useCallback(async () => {
    setWorkspaceLoading(true);
    const { error } = await updateWorkspace({ name: workspaceName });
    setWorkspaceLoading(false);
    if (error) toast.error('Failed to update workspace');
    else toast.success('Workspace updated');
  }, [updateWorkspace, workspaceName]);

  const openCreatePhaseModal = useCallback(() => {
    resetPhaseForm();
    setPhaseModalOpen(true);
  }, [resetPhaseForm]);

  const openEditPhaseModal = useCallback(
    (phase: PhaseRow) => {
      setEditingPhaseId(phase.id);
      setPhaseName(phase.name);
      setPhaseColor(phase.color || PHASE_COLORS[0]);
      setPhaseIcon(phase.icon || 'tag');
      setPhasePrompt(phase.prompt || '');
      setPhaseModalOpen(true);
    },
    []
  );

  const handleSavePhase = useCallback(async () => {
    if (!workspace?.id) return;
    const name = phaseName.trim();
    if (!name) {
      toast.error('Phase name is required');
      return;
    }

    setPhaseSaving(true);
    try {
      if (editingPhaseId) {
        const { error } = await (supabase as any)
          .from('instagram_tags')
          .update({
            name,
            color: phaseColor || '#8A8A8A',
            icon: phaseIcon || 'tag',
            prompt: phasePrompt.trim() || null,
          })
          .eq('workspace_id', workspace.id)
          .eq('id', editingPhaseId);
        if (error) throw error;
        toast.success('Phase updated');
      } else {
        const { error } = await (supabase as any)
          .from('instagram_tags')
          .insert({
            workspace_id: workspace.id,
            name,
            color: phaseColor || '#8A8A8A',
            icon: phaseIcon || 'tag',
            prompt: phasePrompt.trim() || null,
            created_by: user?.id || null,
          });
        if (error) throw error;
        toast.success('Phase created');
      }

      setPhaseModalOpen(false);
      resetPhaseForm();
      await loadPhases();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save phase');
    } finally {
      setPhaseSaving(false);
    }
  }, [
    workspace?.id,
    user?.id,
    editingPhaseId,
    phaseName,
    phaseColor,
    phaseIcon,
    phasePrompt,
    loadPhases,
    resetPhaseForm,
  ]);

  const handleDeletePhase = useCallback(async () => {
    if (!workspace?.id || !phaseToDelete) return;
    const phase = phaseToDelete;
    try {
      const { error } = await (supabase as any)
        .from('instagram_tags')
        .delete()
        .eq('workspace_id', workspace.id)
        .eq('id', phase.id);
      if (error) throw error;
      toast.success('Phase deleted');
      await loadPhases();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete phase');
    } finally {
      setPhaseToDelete(null);
    }
  }, [workspace?.id, phaseToDelete, loadPhases]);

  const filteredPhases = useMemo(() => {
    const q = phaseSearch.trim().toLowerCase();
    if (!q) return phases;
    return phases.filter((p) => p.name.toLowerCase().includes(q));
  }, [phases, phaseSearch]);

  const stripeStatusLabel = String(billingStatus?.stripe_status || '')
    .trim()
    .replace(/_/g, ' ');
  const whopStatusLabel = String(billingStatus?.whop_status || '')
    .trim()
    .replace(/_/g, ' ');
  const stripeHasCustomer = Boolean(String(billingStatus?.stripe_customer_id || '').trim());
  const stripeHasSubscription = Boolean(String(billingStatus?.stripe_subscription_id || '').trim());
  const hasWorkspace = Boolean(workspace?.id);

  const formatDateTime = useCallback((value: string | null | undefined) => {
    const raw = String(value || '').trim();
    if (!raw) return '—';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleString();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div>
          <div className="headline-domaine text-3xl font-semibold text-white">Settings</div>
          <p className="text-sm text-white/45 mt-1">Manage your workspace, team, and integrations</p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-8">
          <nav className="md:w-[240px] flex md:flex-col gap-2 overflow-auto hide-scrollbar">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              const IconCmp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'h-11 px-4 rounded-2xl border text-sm inline-flex items-center gap-3 transition-colors whitespace-nowrap',
                    active
                      ? 'border-white/20 bg-white/[0.05] text-white'
                      : 'border-white/10 bg-black text-white/65 hover:text-white hover:bg-white/[0.03]'
                  )}
                >
                  <IconCmp className="h-4 w-4 text-white/70" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1">
            {activeTab === 'profile' ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-black p-6">
                  <div className="text-lg font-semibold text-white">Profile</div>
                  <div className="mt-1 text-sm text-white/45">Update your personal info.</div>

                  <div className="mt-6 space-y-5">
                    <div>
                      <div className="text-sm text-white/60">Avatar</div>
                      <div className="mt-3 flex items-center gap-4">
                        <ProfileAvatar
                          name={name || 'User'}
                          size="md"
                          bgColor={avatarColor}
                          imageUrl={profile?.avatar_url || (user?.user_metadata?.avatar_url as string | undefined)}
                          mode={avatarMode}
                        />
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className={cn(
                                'h-9 px-3 rounded-xl border text-[13px] transition-colors',
                                avatarMode === 'photo'
                                  ? 'border-white/20 bg-white/[0.06] text-white'
                                  : 'border-white/10 text-white/70 hover:text-white hover:bg-white/[0.03]'
                              )}
                              onClick={() => setAvatarMode('photo')}
                            >
                              Photo
                            </button>
                            <button
                              type="button"
                              className={cn(
                                'h-9 px-3 rounded-xl border text-[13px] transition-colors',
                                avatarMode === 'letter'
                                  ? 'border-white/20 bg-white/[0.06] text-white'
                                  : 'border-white/10 text-white/70 hover:text-white hover:bg-white/[0.03]'
                              )}
                              onClick={() => setAvatarMode('letter')}
                            >
                              Letter
                            </button>
                          </div>

                          {avatarMode === 'letter' ? (
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-white/45">Color</div>
                              <input
                                type="color"
                                value={avatarColor}
                                onChange={(e) => setAvatarColor(e.target.value)}
                                className="h-8 w-12 rounded-lg border border-white/10 bg-transparent"
                              />
                              <input
                                value={avatarColor}
                                onChange={(e) => setAvatarColor(e.target.value)}
                                className="h-8 w-28 rounded-lg border border-white/10 bg-transparent px-2 text-xs text-white/75"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <div className="text-sm text-white/60">Name</div>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="mt-2 h-10 w-full rounded-2xl border border-white/10 bg-transparent px-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-8 px-3.5 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90 disabled:opacity-60"
                        disabled={profileLoading}
                        onClick={handleSaveProfile}
                      >
                        {profileLoading ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                          </span>
                        ) : (
                          'Save changes'
                        )}
                      </button>

                      <button
                        type="button"
                        className="h-10 px-4 rounded-2xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/[0.03]"
                        onClick={() => signOut()}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>

                {userRole === 'owner' ? (
                  null
                ) : null}
              </div>
            ) : null}

            {activeTab === 'team' ? (
              <div className="rounded-2xl border border-white/10 bg-black p-6">
                <div className="text-lg font-semibold text-white">Team</div>
                <div className="mt-1 text-sm text-white/45">Manage team members and roles.</div>

                <div className="mt-6 flex items-center gap-2">
                  <button
                    type="button"
                    className="h-8 px-3.5 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90"
                    onClick={() => navigate('/team')}
                  >
                    Open Team
                  </button>
                </div>
              </div>
            ) : null}

            {activeTab === 'socials' ? (
              <div className="rounded-2xl border border-white/10 bg-black p-6">
                <div className="text-lg font-semibold text-white">Socials</div>
                <div className="mt-1 text-sm text-white/45">Connect your social accounts.</div>

                <div className="mt-6 flex items-center gap-2">
                  <button
                    type="button"
                    className="h-8 px-3.5 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90"
                    onClick={() => navigate('/messages')}
                  >
                    Manage Instagram in Inbox
                  </button>
                </div>
              </div>
            ) : null}

            {activeTab === 'integrations' ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-black p-6">
                  <div className="text-lg font-semibold text-white">Integrations</div>
                  <div className="mt-1 text-sm text-white/45">
                    Configure the links and tools used across your workspace.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-6">
                  <div className="text-sm font-medium text-white/90">Booking link</div>
                  <div className="mt-1 text-xs text-white/45">
                    Used by the Inbox “Book call” button. Paste any booking URL (Calendly recommended).
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-white/60 uppercase tracking-wider">Booking URL</div>
                      <input
                        value={bookingUrl}
                        onChange={(e) => setBookingUrl(e.target.value)}
                        placeholder="https://calendly.com/..."
                        disabled={bookingUrlLoading || userRole !== 'owner'}
                        className="mt-2 w-full h-10 px-3 rounded-2xl bg-transparent border border-white/10 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 disabled:opacity-60"
                      />
                    </div>

                    {userRole === 'owner' ? (
                      <button
                        type="button"
                        className="h-10 px-4 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
                        disabled={bookingUrlLoading || bookingUrlSaving}
                        onClick={saveBookingUrl}
                      >
                        {bookingUrlSaving ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                          </span>
                        ) : (
                          'Save'
                        )}
                      </button>
                    ) : null}
                  </div>

                  {userRole !== 'owner' ? (
                    <div className="mt-3 text-xs text-white/35">Only workspace owners can edit this.</div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white/90">Billing integrations</div>
                      <div className="mt-1 text-xs text-white/45">Stripe subscriptions and Whop membership sync.</div>
                    </div>
                    <button
                      type="button"
                      className="h-8 px-3 rounded-xl border border-white/10 text-xs text-white/70 hover:text-white hover:bg-white/[0.03] disabled:opacity-60 inline-flex items-center gap-1.5"
                      onClick={() => loadBillingStatus()}
                      disabled={billingLoading || !hasWorkspace}
                    >
                      <RefreshCw className={cn('h-3.5 w-3.5', billingLoading ? 'animate-spin' : '')} />
                      Refresh
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4">
                      <div className="text-xs uppercase tracking-[0.12em] text-white/45">Stripe</div>
                      <div className="mt-2 text-sm text-white/85">
                        Status:{' '}
                        <span className="text-white/65">
                          {stripeStatusLabel ? stripeStatusLabel : 'not connected'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        Customer:{' '}
                        <span className="text-white/65">
                          {stripeHasCustomer ? String(billingStatus?.stripe_customer_id) : '—'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        Subscription:{' '}
                        <span className="text-white/65">
                          {stripeHasSubscription ? String(billingStatus?.stripe_subscription_id) : '—'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        Current period end:{' '}
                        <span className="text-white/65">{formatDateTime(billingStatus?.stripe_current_period_end)}</span>
                      </div>

                      {isOwner ? (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="h-9 px-3.5 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90 disabled:opacity-60"
                            onClick={startStripeCheckout}
                            disabled={stripeBusyAction !== null || !hasWorkspace}
                          >
                            {stripeBusyAction === 'checkout' ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Opening…
                              </span>
                            ) : (
                              'Start checkout'
                            )}
                          </button>

                          <button
                            type="button"
                            className="h-9 px-3.5 rounded-xl border border-white/10 text-[13px] text-white/80 hover:bg-white/[0.04] disabled:opacity-60"
                            onClick={openStripePortal}
                            disabled={stripeBusyAction !== null || !stripeHasCustomer}
                          >
                            {stripeBusyAction === 'portal' ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Opening…
                              </span>
                            ) : (
                              'Open portal'
                            )}
                          </button>

                          <button
                            type="button"
                            className="h-9 px-3.5 rounded-xl border border-white/10 text-[13px] text-white/80 hover:bg-white/[0.04] disabled:opacity-60"
                            onClick={syncStripeStatus}
                            disabled={stripeBusyAction !== null || !stripeHasSubscription}
                          >
                            {stripeBusyAction === 'sync' ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Syncing…
                              </span>
                            ) : (
                              'Sync status'
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 text-xs text-white/40">Only workspace owners can manage Stripe actions.</div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4">
                      <div className="text-xs uppercase tracking-[0.12em] text-white/45">Whop</div>
                      <div className="mt-2 text-sm text-white/85">
                        Status:{' '}
                        <span className="text-white/65">
                          {whopStatusLabel ? whopStatusLabel : 'not connected'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        Membership ID:{' '}
                        <span className="text-white/65">
                          {billingStatus?.whop_membership_id ? String(billingStatus.whop_membership_id) : '—'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        Expires:{' '}
                        <span className="text-white/65">{formatDateTime(billingStatus?.whop_expires_at)}</span>
                      </div>

                      <div className="mt-4">
                        <div className="text-[11px] text-white/60 uppercase tracking-wider">Membership ID</div>
                        <input
                          value={whopMembershipIdInput}
                          onChange={(e) => setWhopMembershipIdInput(e.target.value)}
                          placeholder="whop_membership_..."
                          disabled={!isOwner || whopBusyAction !== null}
                          className="mt-2 w-full h-10 px-3 rounded-2xl bg-transparent border border-white/10 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 disabled:opacity-60"
                        />
                      </div>

                      {isOwner ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="h-9 px-3.5 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90 disabled:opacity-60"
                            onClick={linkWhopMembership}
                            disabled={whopBusyAction !== null || !whopMembershipIdInput.trim()}
                          >
                            {whopBusyAction === 'link' ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Linking…
                              </span>
                            ) : (
                              'Link membership'
                            )}
                          </button>

                          <button
                            type="button"
                            className="h-9 px-3.5 rounded-xl border border-white/10 text-[13px] text-white/80 hover:bg-white/[0.04] disabled:opacity-60"
                            onClick={syncWhopMembership}
                            disabled={whopBusyAction !== null}
                          >
                            {whopBusyAction === 'sync' ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Syncing…
                              </span>
                            ) : (
                              'Sync membership'
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-white/40">Only workspace owners can manage Whop actions.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'phases' ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <div>
                    <div className="text-sm font-medium text-white/90">Auto-Phasing</div>
                    <div className="mt-1 text-xs text-white/45">
                      This feature is currently disabled.
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white/60">
                    Coming soon.
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">Phases</div>
                    <div className="mt-1 text-sm text-white/45">Manage phases for your leads.</div>
                  </div>
                  <button
                    type="button"
                    className="h-10 px-4 rounded-2xl border border-white/15 text-sm text-white/85 hover:bg-white/[0.04] inline-flex items-center gap-2"
                    onClick={openCreatePhaseModal}
                  >
                    <Plus className="h-4 w-4" />
                    New Phase
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1 min-w-0">
                    <Search className="h-4 w-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={phaseSearch}
                      onChange={(e) => setPhaseSearch(e.target.value)}
                      placeholder="Search for phases"
                      className="w-full h-10 pl-9 pr-3 rounded-2xl bg-transparent border border-white/10 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  {phasesLoading ? (
                    <div className="p-5 text-sm text-white/50">Loading phases…</div>
                  ) : filteredPhases.length === 0 ? (
                    <div className="p-5 text-sm text-white/50">No phases yet.</div>
                  ) : (
                    filteredPhases.map((phase) => (
                      <div
                        key={phase.id}
                        className="px-4 py-3 border-b-[0.5px] border-white/10 last:border-b-0 hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <PhaseOrb color={phase.color} icon={phase.icon} label={phase.name} />

                          <button
                            type="button"
                            className="flex-1 min-w-0 text-left"
                            onClick={() => openEditPhaseModal(phase)}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm text-white/90 truncate">{phase.name}</div>
                                <div className="mt-0.5 text-xs text-white/45 truncate">
                                  {phase.prompt ? phase.prompt : 'No AI prompt'}
                                </div>
                              </div>
                              <div className="text-xs text-white/45 whitespace-nowrap">
                                {phase.leadCount} lead{phase.leadCount === 1 ? '' : 's'}
                              </div>
                            </div>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="h-9 w-9 rounded-xl border border-white/10 text-white/65 hover:text-white hover:bg-white/[0.04] grid place-items-center"
                              aria-label={`Delete ${phase.name}`}
                              title="Delete"
                              onClick={() => setPhaseToDelete(phase)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <ChevronRight className="h-4 w-4 text-white/20" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog
        open={phaseModalOpen}
        onOpenChange={(open) => {
          setPhaseModalOpen(open);
          if (!open) resetPhaseForm();
        }}
      >
        <DialogContent className="max-w-[560px] rounded-2xl border border-white/10 bg-black p-0 text-white">
          <div className="p-5">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                {editingPhaseId ? 'Edit Phase' : 'New Phase'}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm text-white/60">Pick a color</div>
                <div className="mt-2 flex items-center gap-2">
                  {PHASE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        'h-7 w-7 rounded-full border transition-colors',
                        phaseColor === c ? 'border-white/60' : 'border-white/10 hover:border-white/25'
                      )}
                      style={{ backgroundColor: c }}
                      aria-label={`Select ${c}`}
                      onClick={() => setPhaseColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-white/60">Pick an icon</div>
                <div className="mt-2 rounded-2xl border border-white/10 bg-black/40 p-2">
                  <ScrollArea className="h-[190px]">
                    <div className="grid grid-cols-8 gap-2">
                      {ICON_OPTIONS.map((opt) => {
                        const IconCmp = opt.icon;
                        const selected = phaseIcon === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            className={cn(
                              'h-10 w-10 rounded-xl border grid place-items-center transition-colors',
                              selected
                                ? 'border-white/45 bg-white/[0.06]'
                                : 'border-white/10 bg-transparent hover:bg-white/[0.04]'
                            )}
                            onClick={() => setPhaseIcon(opt.value)}
                            aria-label={`Select ${opt.value}`}
                            title={opt.value}
                          >
                            <IconCmp className="h-4 w-4" style={{ color: phaseColor }} />
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div>
                <div className="text-sm text-white/60">Phase name</div>
                <input
                  value={phaseName}
                  onChange={(e) => setPhaseName(e.target.value)}
                  placeholder="Hot Lead"
                  className="mt-2 h-10 w-full rounded-2xl border border-white/10 bg-transparent px-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/60">Requirements (Optional)</div>
                </div>
                <div className="mt-1 text-xs text-white/40">
                  We analyze entire lead conversations using these requirements to decide when to apply the phase.
                </div>
                <textarea
                  value={phasePrompt}
                  onChange={(e) => setPhasePrompt(e.target.value)}
                  placeholder="If lead asks for a call or demo, apply Hot Lead."
                  className="mt-2 w-full min-h-[110px] rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="h-10 px-4 rounded-2xl border border-white/10 text-sm text-white/65 hover:text-white hover:bg-white/[0.03]"
                  onClick={() => setPhaseModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="h-10 px-4 rounded-2xl border border-white/15 text-sm text-white/85 hover:bg-white/[0.04] disabled:opacity-60"
                  onClick={handleSavePhase}
                  disabled={phaseSaving}
                >
                  {phaseSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </span>
                  ) : editingPhaseId ? (
                    'Update Phase'
                  ) : (
                    'Create Phase'
                  )}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(phaseToDelete)} onOpenChange={(open) => (!open ? setPhaseToDelete(null) : null)}>
        <AlertDialogContent className="rounded-2xl border border-white/10 bg-black text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete phase?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete this phase? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border border-white/15 bg-transparent text-white/75 hover:bg-white/[0.04]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-white text-black hover:bg-white/90"
              onClick={(e) => {
                e.preventDefault();
                handleDeletePhase();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
