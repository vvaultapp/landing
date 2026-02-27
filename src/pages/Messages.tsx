import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InboxPageSkeleton } from '@/components/skeletons/InboxPageSkeleton';
import { PremiumButton } from '@/components/ui/premium-button';
import { Inbox } from '@/components/ui/icons';
import { supabase } from '@/integrations/supabase/client';
import { authedInvoke, getEdgeInvokeErrorMessage, invokeInboxAi } from '@/integrations/supabase/authedInvoke';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';
import instagramLogo from '@/assets/instagram-logo.png';
import {
  Search,
  SlidersHorizontal,
  Star,
  Flame,
  Sun,
  Snowflake,
  User,
  Tag as TagIcon,
  Send,
  X,
  Reply,
  Heart,
  Ban,
  Check,
  XCircle,
  CheckCircle2,
  UserRoundCheck,
  UserRoundX,
  ChevronDown,
  ShieldAlert,
  MessageCircle,
  Briefcase,
  DollarSign,
  Zap,
  Palette,
  Mail,
  Phone,
  PhoneCall,
  Calendar,
  Clock,
  Target,
  Lightbulb,
  Rocket,
  Gem,
  Coins,
  CreditCard,
  Wallet,
  ShoppingBag,
  Store,
  BadgeCheck,
  ShieldCheck,
  Bell,
  BellRing,
  ThumbsUp,
  Sparkles,
  Trophy,
  Users,
  UserCheck,
  UserPlus,
  Handshake,
  Building2,
  Globe,
  MapPin,
  Camera,
  Video,
  Mic,
  BookOpen,
  NotebookPen,
  FileText,
  ClipboardList,
  Bookmark,
  BookmarkCheck,
  Paperclip,
  Image,
  Link2,
  Megaphone,
  CircleHelp,
  Trash2,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type InboxTab = 'all' | 'priority' | 'unread';
type TemperatureLevel = 'hot' | 'warm' | 'cold';

const AUTO_SYNC_INTERVAL_MS = 10_000;
const FAST_THREADS_POLL_INTERVAL_MS = 2_500;
const SHARED_READS_POLL_INTERVAL_MS = 2_000;

const TEMPERATURE_TAG_PRESETS: Record<TemperatureLevel, { name: string; color: string; icon: string; prompt: string }> = {
  hot: {
    name: 'Hot Lead',
    color: '#F97316',
    icon: 'flame',
    prompt: 'High-intent lead. Asking for pricing, timeline, booking, or immediate next steps.',
  },
  warm: {
    name: 'Warm Lead',
    color: '#FACC15',
    icon: 'sun',
    prompt: 'Interested lead. Engaged in conversation, but not yet asking for immediate commitment.',
  },
  cold: {
    name: 'Cold Lead',
    color: '#60A5FA',
    icon: 'snowflake',
    prompt: 'Low-intent lead. Non-committal responses, low engagement, or no clear buying signals yet.',
  },
};

const normalizeTagName = (value: string | null | undefined) => String(value || '').trim().toLowerCase();
const matchesTemperatureTag = (name: string, level: TemperatureLevel) => {
  const normalized = normalizeTagName(name);
  if (level === 'hot') return normalized === 'hot lead' || normalized === 'hot';
  if (level === 'warm') return normalized === 'warm lead' || normalized === 'warm';
  return normalized === 'cold lead' || normalized === 'cold';
};

const TAG_COLOR_OPTIONS = [
  { name: 'Gray', value: '#9ca3af' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Teal', value: '#14b8a6' },
];

const ICON_PICKER_OPTIONS = [
  { value: 'tag', icon: TagIcon },
  { value: 'star', icon: Star },
  { value: 'flame', icon: Flame },
  { value: 'sun', icon: Sun },
  { value: 'snowflake', icon: Snowflake },
  { value: 'briefcase', icon: Briefcase },
  { value: 'message-circle', icon: MessageCircle },
  { value: 'mail', icon: Mail },
  { value: 'phone', icon: Phone },
  { value: 'phone-call', icon: PhoneCall },
  { value: 'calendar', icon: Calendar },
  { value: 'clock', icon: Clock },
  { value: 'target', icon: Target },
  { value: 'zap', icon: Zap },
  { value: 'lightbulb', icon: Lightbulb },
  { value: 'rocket', icon: Rocket },
  { value: 'gem', icon: Gem },
  { value: 'dollar-sign', icon: DollarSign },
  { value: 'coins', icon: Coins },
  { value: 'credit-card', icon: CreditCard },
  { value: 'wallet', icon: Wallet },
  { value: 'shopping-bag', icon: ShoppingBag },
  { value: 'store', icon: Store },
  { value: 'badge-check', icon: BadgeCheck },
  { value: 'check-circle-2', icon: CheckCircle2 },
  { value: 'x-circle', icon: XCircle },
  { value: 'shield-check', icon: ShieldCheck },
  { value: 'shield-alert', icon: ShieldAlert },
  { value: 'bell', icon: Bell },
  { value: 'bell-ring', icon: BellRing },
  { value: 'thumbs-up', icon: ThumbsUp },
  { value: 'heart', icon: Heart },
  { value: 'sparkles', icon: Sparkles },
  { value: 'trophy', icon: Trophy },
  { value: 'user', icon: User },
  { value: 'users', icon: Users },
  { value: 'user-check', icon: UserCheck },
  { value: 'user-round-check', icon: UserRoundCheck },
  { value: 'user-round-x', icon: UserRoundX },
  { value: 'user-plus', icon: UserPlus },
  { value: 'handshake', icon: Handshake },
  { value: 'building-2', icon: Building2 },
  { value: 'globe', icon: Globe },
  { value: 'map-pin', icon: MapPin },
  { value: 'camera', icon: Camera },
  { value: 'video', icon: Video },
  { value: 'mic', icon: Mic },
  { value: 'book-open', icon: BookOpen },
  { value: 'notebook-pen', icon: NotebookPen },
  { value: 'file-text', icon: FileText },
  { value: 'clipboard-list', icon: ClipboardList },
  { value: 'bookmark', icon: Bookmark },
  { value: 'bookmark-check', icon: BookmarkCheck },
  { value: 'paperclip', icon: Paperclip },
  { value: 'link', icon: Link2 },
  { value: 'megaphone', icon: Megaphone },
  { value: 'send', icon: Send },
  { value: 'circle-help', icon: CircleHelp },
] as const;

type IconPickerName = (typeof ICON_PICKER_OPTIONS)[number]['value'];
const ICON_PICKER_ICON_BY_NAME = new Map<IconPickerName, (typeof ICON_PICKER_OPTIONS)[number]['icon']>(
  ICON_PICKER_OPTIONS.map((item) => [item.value, item.icon])
);
const ICON_PICKER_ICONS: IconPickerName[] = ICON_PICKER_OPTIONS.map((item) => item.value);

type FunnelStage =
  | 'new_lead'
  | 'in_contact'
  | 'qualified'
  | 'unqualified'
  | 'call_booked'
  | 'won'
  | 'no_show';

const FUNNEL_STAGE_ORDER: FunnelStage[] = [
  'new_lead',
  'in_contact',
  'qualified',
  'unqualified',
  'call_booked',
  'won',
  'no_show',
];

const FUNNEL_STAGE_TAG_PRESETS: Record<
  FunnelStage,
  { name: string; color: string; icon: IconPickerName; prompt: string }
> = {
  new_lead: {
    name: 'New lead',
    color: '#ec4899',
    icon: 'user-plus',
    prompt: 'Brand new inbound lead that has not been worked yet.',
  },
  in_contact: {
    name: 'In contact',
    color: '#6366f1',
    icon: 'message-circle',
    prompt: 'You have started a conversation with this lead.',
  },
  qualified: {
    name: 'Qualified',
    color: '#f59e0b',
    icon: 'star',
    prompt: 'Lead is a fit and has buying intent.',
  },
  unqualified: {
    name: 'Unqualified',
    color: '#ef4444',
    icon: 'x-circle',
    prompt: 'Lead is not a fit or has been disqualified.',
  },
  call_booked: {
    name: 'Call booked',
    color: '#9ca3af',
    icon: 'phone-call',
    prompt: 'A call has been booked with this lead.',
  },
  won: {
    name: 'Won',
    color: '#10b981',
    icon: 'trophy',
    prompt: 'Lead converted successfully.',
  },
  no_show: {
    name: 'No show',
    color: '#f97316',
    icon: 'user-round-x',
    prompt: 'Lead did not show up to the scheduled call.',
  },
};

function funnelStageKeyFromTagName(value: string | null | undefined): FunnelStage | null {
  const n = normalizeTagName(value);
  if (!n) return null;
  if (n === 'new lead' || n === 'new') return 'new_lead';
  if (n === 'in contact' || n === 'contacted') return 'in_contact';
  if (n === 'qualified') return 'qualified';
  if (n === 'unqualified' || n === 'disqualified') return 'unqualified';
  if (n === 'call booked' || n === 'booked call' || n === 'call') return 'call_booked';
  if (n === 'won' || n === 'closed won') return 'won';
  if (n === 'no show' || n === 'noshow') return 'no_show';
  return null;
}

const ICON_INITIAL_CHARGE = 20 * 5;
const ICONS_BY_CHARGE = 6 * 3;
const SCROLL_THRESHOLD = 100;

function IconPicker(props: {
  icons: IconPickerName[];
  onIconSelect: (iconName: IconPickerName) => void;
  selectedIcon?: IconPickerName;
  heightClassName?: string;
}) {
  const { icons, onIconSelect, selectedIcon, heightClassName = 'h-[220px]' } = props;
  const [visibleCount, setVisibleCount] = useState(ICON_INITIAL_CHARGE);
  const rootScrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportScrollElementRef = useRef<HTMLElement | null>(null);

  const currentIcons = icons.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(ICON_INITIAL_CHARGE);
    if (viewportScrollElementRef.current) {
      viewportScrollElementRef.current.scrollTop = 0;
    }
  }, [icons]);

  const loadMoreIcons = useCallback(() => {
    setVisibleCount((prevCount) => {
      if (prevCount >= icons.length) return prevCount;
      return Math.min(prevCount + ICONS_BY_CHARGE, icons.length);
    });
  }, [icons.length]);

  useEffect(() => {
    const rootElement = rootScrollAreaRef.current;
    if (rootElement && !viewportScrollElementRef.current) {
      const viewport = rootElement.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]');
      viewportScrollElementRef.current = viewport;
    }

    const currentViewport = viewportScrollElementRef.current;
    if (!currentViewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = currentViewport;
      if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
        if (visibleCount < icons.length) loadMoreIcons();
      }
    };

    currentViewport.addEventListener('scroll', handleScroll);
    return () => currentViewport.removeEventListener('scroll', handleScroll);
  }, [icons.length, loadMoreIcons, visibleCount]);

  return (
    <ScrollArea ref={rootScrollAreaRef} className={cn('w-full', heightClassName)}>
      <div className="p-2 grid grid-cols-6 sm:grid-cols-8 gap-1">
        {currentIcons.map((iconName) => {
          const IconCmp = ICON_PICKER_ICON_BY_NAME.get(iconName) || TagIcon;
          return (
            <button
              key={iconName}
              type="button"
              className={cn(
                'flex items-center justify-center p-2 rounded-sm hover:bg-white/[0.06] transition-colors',
                selectedIcon === iconName && 'bg-white/[0.08] ring-1 ring-white/25'
              )}
              title={iconName}
              onClick={() => onIconSelect(iconName)}
            >
              <IconCmp className={cn('h-[15px] w-[15px]', selectedIcon === iconName ? 'text-white' : 'text-white/75')} />
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}

function pickTagIcon(iconName: string | null | undefined, tagName?: string | null) {
  const name = normalizeTagName(iconName);
  if (name === 'star') return Star;
  if (name === 'message') return MessageCircle;
  if (name === 'briefcase') return Briefcase;
  if (name === 'dollar') return DollarSign;
  if (name === 'zap') return Zap;
  const label = normalizeTagName(tagName);
  if (label === 'priority') return Star;
  if (label === 'qualified') return CheckCircle2;
  if (label === 'disqualified') return XCircle;
  if (label === 'spam') return Ban;
  return TagIcon;
}

function colorWithAlpha(color: string | null | undefined, alpha = 0.22): string {
  const value = String(color || '').trim();
  if (!value) return `rgba(255, 255, 255, ${alpha})`;

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const hex = value.slice(1).split('').map((ch) => ch + ch).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (/^#[0-9a-f]{6}$/i.test(value)) {
    const hex = value.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return value;
}

function TagGlyph(props: { iconName?: string | null; tagName?: string | null; color?: string | null; className?: string }) {
  const { iconName, tagName, color, className } = props;
  const normalizedIcon = normalizeTagName(iconName) as IconPickerName;

  if (matchesTemperatureTag(String(tagName || ''), 'hot')) {
    return <Flame className={cn('fill-current', className)} style={{ color }} />;
  }
  if (matchesTemperatureTag(String(tagName || ''), 'warm')) {
    return <Sun className={cn('fill-current', className)} style={{ color }} />;
  }
  if (matchesTemperatureTag(String(tagName || ''), 'cold')) {
    return <Snowflake className={cn('fill-current', className)} style={{ color }} />;
  }

  const DynamicIconCmp = ICON_PICKER_ICON_BY_NAME.get(normalizedIcon);
  if (DynamicIconCmp) {
    return <DynamicIconCmp className={className} style={{ color }} />;
  }

  const FallbackIcon = pickTagIcon(iconName, tagName);
  return <FallbackIcon className={className} style={{ color }} />;
}

function formatRelativeTime(d?: Date | null) {
  if (!d) return '';
  const ms = Date.now() - d.getTime();
  if (!Number.isFinite(ms)) return '';

  const s = Math.floor(ms / 1000);
  if (s < 0) return '';
  if (s < 60) return `${Math.max(1, s)}s`;

  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;

  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;

  const w = Math.floor(days / 7);
  if (w < 5) return `${w}w`;

  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo}mo`;

  const y = Math.floor(days / 365);
  return `${Math.max(1, y)}y`;
}

function formatRelativeTimeAgo(d?: Date | null) {
  const base = formatRelativeTime(d);
  if (!base) return '';
  return base === 'now' ? 'now' : `${base} ago`;
}

type InstagramConnectionStatus = {
  connected: boolean;
  connection?: {
    instagram_account_id?: string | number | null;
    facebook_user_id?: string | number | null;
    page_id?: string | number | null;
    instagram_username?: string | null;
    profile_picture_url?: string | null;
    token_expires_at?: string | null;
  } | null;
};

type Thread = {
  conversationId: string;
  instagramAccountId: string;
  peerId: string;
  peerUsername: string | null;
  peerName: string | null;
  peerPicture: string | null;
  priority: boolean;
  isSpam: boolean;
  hiddenFromSetters: boolean;
  sharedWithSetters: boolean;
  leadStatus: 'open' | 'qualified' | 'disqualified' | 'removed';
  assignedUserId: string | null;
  prioritySnoozedUntil: Date | null;
  priorityFollowedUpAt: Date | null;
  summaryText: string | null;
  summaryUpdatedAt: Date | null;
  sharedLastReadAt: Date | null;
  lastInboundAt: Date | null;
  lastOutboundAt: Date | null;
  lastMessageId: string | null;
  lastText: string | null;
  lastDirection: 'inbound' | 'outbound' | null;
  lastAt: Date | null;
  aiPhaseUpdatedAt: Date | null;
  aiPhaseConfidence: number | null;
  aiTemperatureConfidence: number | null;
  aiPhaseReason: string | null;
  aiPhaseMode: 'shadow' | 'enforce' | null;
  aiPhaseLastRunSource: 'incremental' | 'catchup' | 'backfill' | 'manual_rephase' | null;
};

type LeadTeamMessage = {
  id: string;
  workspaceId: string;
  conversationId: string;
  authorUserId: string;
  body: string;
  createdAt: Date;
};

type TagItem = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  prompt: string | null;
};

type ThreadAlert = {
  id: string;
  conversationId: string;
  type: 'hot_lead_unreplied' | 'qualified_inactive' | 'no_show_followup';
  assignedUserId: string | null;
  overdueMinutes: number;
  recommendedAction: string | null;
};

function pickPeerLabel(t: Thread): string {
  const name = t.peerName ? String(t.peerName).trim() : '';
  const username = t.peerUsername ? String(t.peerUsername).trim() : '';

  // Avoid showing numeric-only placeholders as "names".
  if (name && !/^\d+$/.test(name)) return name;
  if (username && !/^\d+$/.test(username)) return username;

  // Keep the UI clean: never show raw IG scoped IDs in the inbox list.
  return 'Instagram User';
}

function inferDirectionFromMessageRow(
  row: any,
  opts?: {
    instagramAccountId?: string | null;
    peerId?: string | null;
    selfIds?: Array<string | null | undefined>;
  }
): 'inbound' | 'outbound' | null {
  if (!row) return null;

  const explicit = row?.direction === 'inbound' || row?.direction === 'outbound' ? row.direction : null;
  if (explicit) return explicit;

  const selfIds = new Set<string>();
  const accId = opts?.instagramAccountId != null ? String(opts.instagramAccountId).trim() : '';
  if (accId) selfIds.add(accId);
  for (const candidate of opts?.selfIds || []) {
    const v = candidate != null ? String(candidate).trim() : '';
    if (v) selfIds.add(v);
  }
  const peerId = opts?.peerId != null ? String(opts.peerId).trim() : '';
  if (selfIds.size === 0 && !peerId) return null;

  const sender = row?.sender_id != null ? String(row.sender_id).trim() : '';
  const recipient = row?.recipient_id != null ? String(row.recipient_id).trim() : '';

  if (sender && selfIds.has(sender)) return 'outbound';
  if (recipient && selfIds.has(recipient)) return 'inbound';
  if (peerId && sender && sender === peerId) return 'inbound';
  if (peerId && recipient && recipient === peerId) return 'outbound';

  const rawSender = row?.raw_payload?.from?.id != null
    ? String(row.raw_payload.from.id).trim()
    : row?.raw_payload?.sender?.id != null
      ? String(row.raw_payload.sender.id).trim()
      : '';
  const rawRecipient = row?.raw_payload?.recipient?.id != null
    ? String(row.raw_payload.recipient.id).trim()
    : row?.raw_payload?.to?.id != null
      ? String(row.raw_payload.to.id).trim()
      : '';

  if (rawSender && selfIds.has(rawSender)) return 'outbound';
  if (rawRecipient && selfIds.has(rawRecipient)) return 'inbound';
  if (peerId && rawSender && rawSender === peerId) return 'inbound';
  if (peerId && rawRecipient && rawRecipient === peerId) return 'outbound';

  const toDataIds = Array.isArray(row?.raw_payload?.to?.data)
    ? row.raw_payload.to.data
        .map((it: any) => (it?.id != null ? String(it.id).trim() : ''))
        .filter(Boolean)
    : [];
  if (toDataIds.some((id: string) => selfIds.has(id))) return 'inbound';
  if (peerId && toDataIds.includes(peerId) && rawSender) return 'outbound';

  return null;
}

function isRenderableIgMessageRow(row: any): boolean {
  if (!row) return false;
  const mid = row?.message_id != null ? String(row.message_id).trim() : '';
  if (mid) return true;

  // Local optimistic/API-sent rows can briefly lack a Meta message id.
  const sentVia = row?.raw_payload?.sent_via != null ? String(row.raw_payload.sent_via) : '';
  if (sentVia === 'api') return true;

  const rawId = row?.raw_payload?.id != null ? String(row.raw_payload.id).trim() : '';
  if (rawId) return true;

  const rawMid = row?.raw_payload?.message?.mid != null ? String(row.raw_payload.message.mid).trim() : '';
  if (rawMid) return true;

  const direction = row?.direction === 'inbound' || row?.direction === 'outbound' ? row.direction : null;
  if (direction) {
    const text = row?.message_text != null ? String(row.message_text).trim() : '';
    const rawText =
      row?.raw_payload?.message?.text != null
        ? String(row.raw_payload.message.text).trim()
        : row?.raw_payload?.text != null
          ? String(row.raw_payload.text).trim()
          : '';
    const hasAttachments = Array.isArray(row?.raw_payload?.stored_attachments) && row.raw_payload.stored_attachments.length > 0;
    const hasTimestamp = Boolean(parseTimestampMsLoose(row?.message_timestamp) || parseTimestampMsLoose(row?.created_at));
    if (text || rawText || hasAttachments || hasTimestamp) return true;
  }

  return false;
}

function messageBelongsToThread(row: any, t: Thread): boolean {
  if (!row || !t?.conversationId) return false;

  const convKey = row?.raw_payload?.conversation_key != null ? String(row.raw_payload.conversation_key) : null;
  if (convKey && convKey === t.conversationId) return true;

  const accId = row?.instagram_account_id != null ? String(row.instagram_account_id) : null;
  if (accId && t.instagramAccountId && accId !== String(t.instagramAccountId)) return false;

  const peerId = t.peerId ? String(t.peerId) : '';
  const igUserId = row?.instagram_user_id != null ? String(row.instagram_user_id) : '';
  if (peerId && igUserId && igUserId === peerId) return true;

  const sender = row?.sender_id != null ? String(row.sender_id) : '';
  const recipient = row?.recipient_id != null ? String(row.recipient_id) : '';
  if (peerId && (sender === peerId || recipient === peerId)) return true;

  return false;
}

function ThreadAvatar(props: { src: string | null; label: string; size?: 'sm' | 'lg' }) {
  const { src, label, size = 'sm' } = props;
  const [broken, setBroken] = useState(false);
  const outerSizeClass = size === 'lg' ? 'w-28 h-28' : 'w-11 h-11';
  const placeholderInnerClass = size === 'lg' ? 'w-20 h-20' : 'w-8 h-8';

  const showImage = Boolean(src) && !broken;

  if (!showImage) {
    return (
      <div className={`${outerSizeClass} acq-orb flex items-center justify-center flex-shrink-0`}>
        {/* Instagram-like anonymous avatar silhouette */}
        <svg viewBox="0 0 64 64" className={placeholderInnerClass} aria-hidden="true">
          <circle cx="32" cy="24" r="11" fill="rgba(255,255,255,0.18)" />
          <path
            d="M10 58c2.4-14.3 12.3-21 22-21s19.6 6.7 22 21"
            fill="rgba(255,255,255,0.18)"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${outerSizeClass} acq-orb flex-shrink-0`}>
      <img
        src={String(src)}
        alt={label || 'avatar'}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setBroken(true)}
      />
    </div>
  );
}

function ChatAvatar(props: { src: string | null; label: string }) {
  const { src } = props;
  const [broken, setBroken] = useState(false);

  const showImage = Boolean(src) && !broken;
  if (!showImage) {
    return (
      <div className="w-7 h-7 acq-orb flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 64 64" className="w-5 h-5" aria-hidden="true">
          <circle cx="32" cy="24" r="11" fill="rgba(255,255,255,0.18)" />
          <path
            d="M10 58c2.4-14.3 12.3-21 22-21s19.6 6.7 22 21"
            fill="rgba(255,255,255,0.18)"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-7 h-7 acq-orb flex-shrink-0">
      <img
        src={String(src)}
        alt="avatar"
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setBroken(true)}
      />
    </div>
  );
}

function renderTextWithLinks(text: string, opts: { theme: 'inbound' | 'outbound' }) {
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+[^\s<\.)\],:;"']?)/gi;
  const parts: Array<string | { url: string; href: string }> = [];

  let lastIndex = 0;
  for (const match of text.matchAll(urlRegex)) {
    const url = match[0];
    const idx = match.index ?? -1;
    if (idx < 0) continue;

    if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));
    const href = url.toLowerCase().startsWith('http') ? url : `https://${url}`;
    parts.push({ url, href });
    lastIndex = idx + url.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  if (parts.length === 0) return text;

  const linkClass =
    opts.theme === 'outbound'
      ? 'underline decoration-black/30 hover:decoration-black/60'
      : 'underline decoration-white/30 hover:decoration-white/60';

  return (
    <>
      {parts.map((p, i) => {
        if (typeof p === 'string') return <span key={i}>{p}</span>;
        return (
          <a
            key={i}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            {p.url}
          </a>
        );
      })}
    </>
  );
}

function inferShareKindFromUrl(url: string | null): 'reel' | 'post' | 'story' | null {
  if (!url) return null;
  const u = unwrapMetaRedirectUrl(String(url)).toLowerCase();
  if (u.includes('/reel/')) return 'reel';
  if (u.includes('/stories/')) return 'story';
  if (u.includes('/p/') || u.includes('/tv/')) return 'post';
  return null;
}

function inferShareKind(typeHint: any, url: string | null): 'reel' | 'post' | 'story' | null {
  const t = typeHint != null ? String(typeHint).toLowerCase() : '';
  if (t.includes('reel')) return 'reel';
  if (t.includes('story')) return 'story';
  if (t.includes('post')) return 'post';
  const byUrl = inferShareKindFromUrl(url);
  if (byUrl) return byUrl;
  if (t === 'share') return 'post';
  return null;
}

function extractAttachmentUrlForUi(att: any): string | null {
  const candidates = [
    att?.payload?.url,
    att?.payload?.link,
    att?.payload?.href,
    att?.payload?.permalink_url,
    att?.payload?.permalink,
    att?.image_data?.url,
    att?.video_data?.url,
    att?.file_url,
    att?.url,
    att?.link,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && /^https?:\/\//i.test(c.trim())) return unwrapMetaRedirectUrl(c.trim());
  }
  return null;
}

function unwrapMetaRedirectUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host === 'l.instagram.com' || host === 'l.facebook.com') {
      const target = u.searchParams.get('u');
      if (target) {
        const decoded = decodeURIComponent(target);
        if (/^https?:\/\//i.test(decoded)) return decoded;
      }
    }
  } catch {
    // ignore
  }
  return url;
}

function normalizeAttachmentCandidates(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [raw];
}

function extractFallbackAttachmentsFromRawPayload(rawPayload: any): any[] {
  const raw = rawPayload?.message?.attachments ?? rawPayload?.attachments ?? null;
  const candidates = normalizeAttachmentCandidates(raw);
  const out: any[] = [];
  for (const att of candidates) {
    const typeHint = att?.type != null ? String(att.type) : null;
    const url = extractAttachmentUrlForUi(att);
    const shareKind = inferShareKind(typeHint, url);
    if (!url && shareKind) {
      // Some share attachments don't include a URL (or it's not exposed). Still render a placeholder.
      out.push({ type: shareKind, share_kind: shareKind, is_share: true, source_url: null, public_url: null });
      continue;
    }
    if (!url) continue;
    if (shareKind) {
      out.push({ type: shareKind, share_kind: shareKind, is_share: true, source_url: url, public_url: url });
    } else {
      out.push({ type: typeHint, source_url: url, public_url: null });
    }
  }

  // Last resort: scan the raw payload for any Instagram permalink-like URLs.
  if (out.length === 0 && rawPayload) {
    const urls = collectHttpUrlsDeep(rawPayload);
    const best = pickBestShareUrl(urls);
    if (best) {
      const kind = inferShareKindFromUrl(best);
      if (kind) out.push({ type: kind, share_kind: kind, is_share: true, source_url: best, public_url: best });
    }
  }

  return out;
}

function collectHttpUrlsDeep(root: any): string[] {
  const out: string[] = [];
  const visited = new Set<any>();
  const walk = (value: any, depth: number) => {
    if (out.length >= 30) return;
    if (depth > 5) return;
    if (!value) return;
    if (typeof value === 'string') {
      const s = value.trim();
      if (/^https?:\/\//i.test(s)) out.push(unwrapMetaRedirectUrl(s));
      return;
    }
    if (typeof value !== 'object') return;
    if (visited.has(value)) return;
    visited.add(value);
    if (Array.isArray(value)) {
      for (const item of value) walk(item, depth + 1);
      return;
    }
    for (const k of Object.keys(value)) {
      walk((value as any)[k], depth + 1);
      if (out.length >= 30) return;
    }
  };
  walk(root, 0);
  return out;
}

function scoreShareUrl(url: string): number {
  const u = url.toLowerCase();
  if (u.includes('/reel/')) return 100;
  if (u.includes('/stories/')) return 90;
  if (u.includes('/p/') || u.includes('/tv/')) return 80;
  if (u.includes('instagram.com')) return 60;
  if (u.includes('fb.watch')) return 40;
  return 10;
}

function pickBestShareUrl(urls: string[]): string | null {
  let best: string | null = null;
  let bestScore = 0;
  for (const url of Array.isArray(urls) ? urls : []) {
    if (!url || typeof url !== 'string') continue;
    const score = scoreShareUrl(url);
    if (score > bestScore) {
      bestScore = score;
      best = url;
    }
  }
  return best;
}

function isPlaceholderMessageText(text: string): boolean {
  const t = text.trim().toLowerCase();
  return t === '[attachment]' || t === '[reel]' || t === '[post]' || t === '[story]';
}

function parseTimestampMsLoose(v: any): number {
  if (v == null) return 0;
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isFinite(t) ? t : 0;
  }
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return 0;
    // Meta can surface unix seconds or unix ms depending on endpoint.
    return v < 1e12 ? Math.round(v * 1000) : Math.round(v);
  }

  const s = String(v).trim();
  if (!s) return 0;

  if (/^\d{10,13}(\.\d+)?$/.test(s)) {
    const num = Number(s);
    if (!Number.isFinite(num)) return 0;
    const digits = s.split('.')[0].length;
    const ms = digits >= 13 ? num : num * 1000;
    const d = new Date(ms);
    const t = d.getTime();
    return Number.isFinite(t) ? t : 0;
  }

  // Normalize timezone offsets like +0000 to +00:00 so Date parsing is consistent.
  const normalized = s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  const t1 = Date.parse(normalized);
  if (Number.isFinite(t1)) return t1;
  const t2 = Date.parse(s);
  return Number.isFinite(t2) ? t2 : 0;
}

function getMessageTimestampMs(m: any): number {
  const primary = parseTimestampMsLoose(m?.message_timestamp);
  const raw = parseTimestampMsLoose(m?.raw_payload?.created_time ?? m?.raw_payload?.timestamp);
  const created = parseTimestampMsLoose(m?.created_at);

  // If we accidentally stored unix-seconds as ms, it shows up as 1970.
  if (raw && (primary === 0 || primary < 1104537600000) && raw > primary) return raw;
  if (primary) return primary;
  if (raw) return raw;
  if (created) return created;
  return 0;
}

function pickLatestIsoTimestamp(a: string | null | undefined, b: string | null | undefined): string | null {
  const left = a ? String(a) : '';
  const right = b ? String(b) : '';
  if (!left && !right) return null;
  if (!left) return right || null;
  if (!right) return left || null;

  const leftMs = parseTimestampMsLoose(left);
  const rightMs = parseTimestampMsLoose(right);
  if (leftMs && rightMs) return rightMs >= leftMs ? right : left;
  if (rightMs) return right;
  return left;
}

function aggregateSharedThreadReads(
  rows: any[]
): { map: Record<string, string>; conversationIds: Set<string> } {
  const map: Record<string, string> = {};
  const conversationIds = new Set<string>();
  for (const row of Array.isArray(rows) ? rows : []) {
    const convId = row?.conversation_id ? String(row.conversation_id) : null;
    const lastReadAt = row?.last_read_at ? String(row.last_read_at) : null;
    if (!convId) continue;
    conversationIds.add(convId);
    const nextIso = pickLatestIsoTimestamp(map[convId], lastReadAt);
    if (nextIso) map[convId] = nextIso;
  }
  return { map, conversationIds };
}

function deriveMessagePreviewText(row: any): string {
  const payloadMessage = row?.raw_payload?.message;
  const payloadTextCandidate =
    typeof payloadMessage === 'string'
      ? payloadMessage
      : (payloadMessage && typeof payloadMessage === 'object' && payloadMessage?.text != null
          ? String(payloadMessage.text)
          : '');
  const payloadText = payloadTextCandidate || (row?.raw_payload?.text != null ? String(row.raw_payload.text) : '');
  const text = row?.message_text != null ? String(row.message_text) : payloadText;
  const trimmedText = text.trim();

  const storedAttachments: any[] = Array.isArray(row?.raw_payload?.stored_attachments) ? row.raw_payload.stored_attachments : [];
  const fallbackAttachments: any[] =
    storedAttachments.length === 0 ? extractFallbackAttachmentsFromRawPayload(row?.raw_payload) : [];
  const attachmentsForPreview = storedAttachments.length > 0 ? storedAttachments : fallbackAttachments;
  const attachmentPreviewText = previewTextFromAttachments(attachmentsForPreview);

  // Mirrors the in-chat behavior: if the "text" is just a placeholder and attachments exist, prefer the attachment preview.
  if (trimmedText && !(isPlaceholderMessageText(trimmedText) && attachmentsForPreview.length > 0)) return trimmedText;
  if (attachmentPreviewText) return attachmentPreviewText;
  return 'Content not available';
}

	function coerceThreadPreviewText(text: string | null | undefined, opts?: { allowEmpty?: boolean }): string {
	  const s = String(text || '').trim();
	  if (!s) return opts?.allowEmpty ? '' : 'Content not available';
	  const lower = s.toLowerCase();
	  if (lower === 'notification') return 'Content not available';
	  if (lower === '[attachment]') return 'Attachment';
	  if (isPlaceholderMessageText(s)) return 'Content not available';
	  return s;
	}

	function previewTextFromAttachments(atts: any[]): string | null {
	  for (const att of Array.isArray(atts) ? atts : []) {
	    const shareUrlCandidate = att?.public_url || att?.source_url || null;
	    const hasShareUrl =
	      typeof shareUrlCandidate === 'string' && String(shareUrlCandidate).trim().length > 0;
	    const kind = att?.share_kind ? String(att.share_kind).toLowerCase() : null;
	    if (kind === 'reel' || kind === 'post' || kind === 'story') {
	      if (hasShareUrl) return `See ${kind}`;
	      continue;
	    }
	    const t = att?.type ? String(att.type).toLowerCase() : '';
	    if (t === 'reel' || t === 'post' || t === 'story') {
	      if (hasShareUrl) return `See ${t}`;
	      continue;
	    }
	    const ct = att?.content_type ? String(att.content_type).toLowerCase() : '';
	    if (t.includes('image') || ct.startsWith('image/')) return 'Photo';
	    if (t.includes('video') || ct.startsWith('video/')) return 'Video';
	    if (t.includes('audio') || ct.startsWith('audio/')) return 'Audio';
	    if (t) return 'Attachment';
	  }
	  return null;
	}

function SeeOnInstagramFallback(props: { theme: 'inbound' | 'outbound' }) {
  const theme = props.theme;
  const textClass = theme === 'outbound' ? 'text-black/65' : 'text-white/65';
  const btnClass =
    theme === 'outbound'
      ? 'border-black/15 text-black/80 hover:bg-black/[0.03]'
      : 'border-white/15 text-white/80 hover:bg-white/[0.03]';

  return (
    <div className="space-y-2">
      <div className={`text-xs leading-relaxed ${textClass}`}>Content not available.</div>
      <a
        href="https://www.instagram.com/direct/inbox/"
        target="_blank"
        rel="noreferrer"
        className={`inline-flex h-7 items-center px-2 rounded-lg text-[11px] border ${btnClass}`}
      >
        See on Instagram
      </a>
    </div>
  );
}

function isEmojiOnlyMessageText(text: string): boolean {
  const t = String(text || '').trim();
  if (!t) return false;

  // Keycap emojis like "1️⃣", "#️⃣", "*️⃣"
  let s = t.replace(/[0-9#*]\uFE0F?\u20E3/gu, '');

  // Most emojis fall under Extended_Pictographic (including multi-codepoint sequences).
  s = s.replace(/\p{Extended_Pictographic}/gu, '');

  // Flags are pairs of regional indicator symbols.
  s = s.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '');

  // Emoji modifiers / joiners / variation selectors.
  s = s.replace(/[\u200D\uFE0E\uFE0F]/gu, '');
  s = s.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');

  // If anything non-whitespace remains, it's not emoji-only.
  s = s.replace(/\s+/g, '');
  return s.length === 0;
}

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspace, members, userRole } = useWorkspace();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [connection, setConnection] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [supportsSpam, setSupportsSpam] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  type MessagePreview = {
    atMs: number;
    messageId: string | null;
    text: string;
    direction: 'inbound' | 'outbound' | null;
  };
  const [messagePreviewByConversationId, setMessagePreviewByConversationId] = useState<Record<string, MessagePreview>>({});
  const [tags, setTags] = useState<TagItem[]>([]);
  const [conversationTagIds, setConversationTagIds] = useState<Record<string, string[]>>({});
  const [alerts, setAlerts] = useState<ThreadAlert[]>([]);
  const [isScanningAlerts, setIsScanningAlerts] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isRetagRunning, setIsRetagRunning] = useState(false);
  const [retagJob, setRetagJob] = useState<any | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'summary' | 'team' | 'calls'>('summary');
  const [leadTeamMessagesByConversationId, setLeadTeamMessagesByConversationId] = useState<Record<string, LeadTeamMessage[]>>({});
  const [isLeadTeamLoading, setIsLeadTeamLoading] = useState(false);
  const [leadTeamDraft, setLeadTeamDraft] = useState('');
  const [isSendingLeadTeamMessage, setIsSendingLeadTeamMessage] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<any[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncMeta, setSyncMeta] = useState<{
    conversationsFetched?: number;
    conversationsWithMessages?: number;
    messagesUpserted?: number;
    warnings?: string[];
    errors?: any[];
    lastError?: string | null;
  } | null>(null);
  const syncInFlightRef = useRef(false);
  const backfillInFlightRef = useRef(false);
  const autoBackfillWorkspaceRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<InboxTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterAssigned, setFilterAssigned] = useState<string>('all');
  const [filterTemperature, setFilterTemperature] = useState<'all' | TemperatureLevel>('all');
  const [filterFunnelStages, setFilterFunnelStages] = useState<FunnelStage[]>([]);
  const [filterPhaseTagIds, setFilterPhaseTagIds] = useState<string[]>([]);
  const [filterSpamMode, setFilterSpamMode] = useState<'exclude' | 'include' | 'only'>('exclude');
  const [filterPrivateMode, setFilterPrivateMode] = useState<'exclude' | 'include' | 'only'>('include');
  const [filterPriorityOnly, setFilterPriorityOnly] = useState(false);
  const [bulkAssignUserId, setBulkAssignUserId] = useState<string>('__none__');
  const [isBulkMutating, setIsBulkMutating] = useState(false);
  // Null means "not loaded yet" so we don't incorrectly flash everything as unread on first paint.
  const [readAtByConversationId, setReadAtByConversationId] = useState<Record<string, string> | null>(null);
  const [newCustomTagName, setNewCustomTagName] = useState('');
  const [newCustomTagIcon, setNewCustomTagIcon] = useState<IconPickerName>('tag');
  const [newCustomTagColor, setNewCustomTagColor] = useState('#3b82f6');
  const [isCreatingCustomTag, setIsCreatingCustomTag] = useState(false);
  const [deletingCustomTagId, setDeletingCustomTagId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreviewUrl, setPendingImagePreviewUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [bookCallPopoverOpen, setBookCallPopoverOpen] = useState(false);
  const [isBookingLinkBusy, setIsBookingLinkBusy] = useState(false);
  const [pendingReminderStamp, setPendingReminderStamp] = useState<{ meetingId: string; kind: '24h' | '1h' } | null>(null);
  const [replyTo, setReplyTo] = useState<{ messageId: string | null; preview: string } | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const threadListScrollRef = useRef<HTMLDivElement>(null);
  const [threadRenderLimit, setThreadRenderLimit] = useState(250);
  const isPinnedToBottomRef = useRef(true);
	  const pendingScrollToBottomConversationIdRef = useRef<string | null>(null);
	  const lastKnownThreadMessageKeyRef = useRef<string>('');
	  const lastPreviewBackfillAtRef = useRef<number>(0);
	  const fixedLastAtByMessageIdRef = useRef<Record<string, number>>({});
	  const selectedConversationIdRef = useRef<string | null>(null);
	  const messagesLoadSeqRef = useRef(0);
  const initializedFiltersRef = useRef(false);
  const seededHotLeadTagRef = useRef(false);
  const alertScanInFlightRef = useRef(false);
  const setterFastThreadsInFlightRef = useRef(false);
  const setterFastThreadsSinceMsRef = useRef<number>(Date.now());
  const setterFastThreadsWorkspaceRef = useRef<string | null>(null);
  type ThreadOverride = Partial<Thread> & { __expiresAt: number };
  const threadOverridesRef = useRef<Record<string, ThreadOverride>>({});

  const setThreadOverride = useCallback((conversationId: string, patch: Partial<Thread>, ttlMs = 8000) => {
    const now = Date.now();
    const prev = threadOverridesRef.current[conversationId];
    threadOverridesRef.current = {
      ...threadOverridesRef.current,
      [conversationId]: {
        ...(prev || ({} as any)),
        ...patch,
        __expiresAt: now + ttlMs,
      } as ThreadOverride,
    };
  }, []);

  const clearThreadOverride = useCallback((conversationId: string) => {
    if (!threadOverridesRef.current[conversationId]) return;
    const next = { ...threadOverridesRef.current };
    delete next[conversationId];
    threadOverridesRef.current = next;
  }, []);

  const applyThreadOverrides = useCallback((items: Thread[]): Thread[] => {
    const overrides = threadOverridesRef.current;
    const keys = overrides ? Object.keys(overrides) : [];
    if (keys.length === 0) return items;

    const now = Date.now();
    let touched = false;
    const out = items.map((t) => {
      const o = overrides[t.conversationId];
      if (!o) return t;
      if (o.__expiresAt && o.__expiresAt < now) {
        touched = true;
        return t;
      }
      touched = true;
      const { __expiresAt, ...patch } = o;
      return { ...t, ...patch };
    });

    if (touched) {
      const cleaned: Record<string, ThreadOverride> = {};
      for (const id of keys) {
        const o = overrides[id];
        if (!o) continue;
        if (o.__expiresAt && o.__expiresAt < now) continue;
        cleaned[id] = o;
      }
      threadOverridesRef.current = cleaned;
    }

    return out;
  }, []);

  const loadSharedThreadReads = useCallback(
    async (opts?: { applyToState?: boolean }) => {
      if (!workspace?.id || !isInstagramConnected) return null;
      const { data: readsData, error: readsError } = await (supabase as any)
        .from('instagram_thread_reads')
        .select('conversation_id,last_read_at')
        .eq('workspace_id', workspace.id);

      if (readsError) {
        console.warn('Load thread reads error:', readsError);
        return null;
      }

      const aggregated = aggregateSharedThreadReads(Array.isArray(readsData) ? readsData : []);
      if (opts?.applyToState !== false) {
        setReadAtByConversationId((prev) => {
          if (prev === null) return aggregated.map;
          const prevKeys = Object.keys(prev);
          const nextKeys = Object.keys(aggregated.map);
          if (prevKeys.length !== nextKeys.length) return aggregated.map;
          for (const key of nextKeys) {
            if (prev[key] !== aggregated.map[key]) return aggregated.map;
          }
          return prev;
        });
      }

      return aggregated;
    },
    [workspace?.id, isInstagramConnected]
  );

  const refreshSetterThreadsFast = useCallback(
    async (opts?: { forceFull?: boolean }) => {
      if (!workspace?.id || !user?.id || !isInstagramConnected) return;
      if (setterFastThreadsInFlightRef.current) return;

      if (setterFastThreadsWorkspaceRef.current !== workspace.id) {
        setterFastThreadsWorkspaceRef.current = workspace.id;
        setterFastThreadsSinceMsRef.current = Date.now();
      }

      setterFastThreadsInFlightRef.current = true;
      try {
        const parseIsoDate = (v: any): Date | null => {
          if (!v) return null;
          const d = new Date(String(v));
          return Number.isFinite(d.getTime()) ? d : null;
        };

        const sinceIso = opts?.forceFull
          ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          : new Date(setterFastThreadsSinceMsRef.current).toISOString();

        // Lightweight DB poll fallback when Realtime misses updates.
        const selectWithSpam =
          'conversation_id,instagram_account_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,priority,is_spam,hidden_from_setters,shared_with_setters,assigned_user_id,lead_status,priority_snoozed_until,priority_followed_up_at,summary_text,summary_updated_at,shared_last_read_at,last_inbound_at,last_outbound_at,last_message_id,last_message_text,last_message_direction,last_message_at,ai_phase_updated_at,ai_phase_confidence,ai_temperature_confidence,ai_phase_reason,ai_phase_mode,ai_phase_last_run_source,updated_at';
        const selectNoSpam =
          'conversation_id,instagram_account_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,priority,hidden_from_setters,shared_with_setters,assigned_user_id,lead_status,priority_snoozed_until,priority_followed_up_at,summary_text,summary_updated_at,shared_last_read_at,last_inbound_at,last_outbound_at,last_message_id,last_message_text,last_message_direction,last_message_at,ai_phase_updated_at,ai_phase_confidence,ai_temperature_confidence,ai_phase_reason,ai_phase_mode,ai_phase_last_run_source,updated_at';

        const tryQuery = async (select: string) =>
          await (supabase as any)
            .from('instagram_threads')
            .select(select)
            .eq('workspace_id', workspace.id)
            .gt('updated_at', sinceIso)
            .order('updated_at', { ascending: false, nullsFirst: false })
            .limit(250);

        let res = await tryQuery(supportsSpam ? selectWithSpam : selectNoSpam);
        if (res.error && supportsSpam) {
          const msg = `${String(res.error?.message || '')} ${String(res.error?.details || '')}`.toLowerCase();
          if (msg.includes('is_spam') || msg.includes('does not exist') || msg.includes('column')) {
            setSupportsSpam(false);
            res = await tryQuery(selectNoSpam);
          }
        }

        if (res.error) return;

        const rows = Array.isArray(res.data) ? res.data : [];
        if (rows.length === 0) return;

        let maxUpdatedMs = setterFastThreadsSinceMsRef.current;
        const incoming: Thread[] = [];
        for (const r of rows) {
          const updatedAt = r?.updated_at ? String(r.updated_at) : '';
          if (updatedAt) {
            const ms = Date.parse(updatedAt);
            if (Number.isFinite(ms) && ms > maxUpdatedMs) maxUpdatedMs = ms;
          }

          const conversationId = String(r?.conversation_id || '');
          const instagramAccountId = String(r?.instagram_account_id || '');
          const rawPeerId = r?.instagram_user_id ? String(r.instagram_user_id) : '';
          if (!conversationId || !instagramAccountId) continue;

          const prefix = `${instagramAccountId}:`;
          const candidateFromConversation = conversationId.startsWith(prefix) ? conversationId.slice(prefix.length).trim() : '';
          const shouldReplacePeerId =
            !rawPeerId || rawPeerId === 'unknown' || rawPeerId === instagramAccountId || rawPeerId.startsWith('unknown:');
          const peerId = shouldReplacePeerId && candidateFromConversation ? candidateFromConversation : rawPeerId;
          if (!peerId || peerId === instagramAccountId) continue;

          const leadStatusRaw = String((r as any)?.lead_status || 'open');
          const leadStatus =
            leadStatusRaw === 'qualified' ||
            leadStatusRaw === 'disqualified' ||
            leadStatusRaw === 'removed'
              ? leadStatusRaw
              : 'open';

          const t: Thread = {
            conversationId,
            instagramAccountId,
            peerId,
            peerUsername: r?.peer_username ? String(r.peer_username) : null,
            peerName: r?.peer_name ? String(r.peer_name) : null,
            peerPicture: r?.peer_profile_picture_url ? String(r.peer_profile_picture_url) : null,
            priority: Boolean((r as any)?.priority),
            isSpam: Boolean((r as any)?.is_spam),
            hiddenFromSetters: Boolean((r as any)?.hidden_from_setters),
            sharedWithSetters: Boolean((r as any)?.shared_with_setters),
            leadStatus: leadStatus as any,
            assignedUserId: (r as any)?.assigned_user_id ? String((r as any).assigned_user_id) : null,
            prioritySnoozedUntil: parseIsoDate((r as any)?.priority_snoozed_until),
            priorityFollowedUpAt: parseIsoDate((r as any)?.priority_followed_up_at),
            summaryText: (r as any)?.summary_text ? String((r as any).summary_text) : null,
            summaryUpdatedAt: parseIsoDate((r as any)?.summary_updated_at),
            sharedLastReadAt: parseIsoDate((r as any)?.shared_last_read_at),
            lastInboundAt: parseIsoDate((r as any)?.last_inbound_at),
            lastOutboundAt: parseIsoDate((r as any)?.last_outbound_at),
            lastMessageId: (r as any)?.last_message_id ? String((r as any).last_message_id) : null,
            lastText: (r as any)?.last_message_text ? String((r as any).last_message_text) : null,
            lastDirection:
              (r as any)?.last_message_direction === 'inbound' || (r as any)?.last_message_direction === 'outbound'
                ? (r as any).last_message_direction
                : null,
            lastAt: parseIsoDate((r as any)?.last_message_at),
            aiPhaseUpdatedAt: parseIsoDate((r as any)?.ai_phase_updated_at),
            aiPhaseConfidence:
              (r as any)?.ai_phase_confidence != null && Number.isFinite(Number((r as any).ai_phase_confidence))
                ? Number((r as any).ai_phase_confidence)
                : null,
            aiTemperatureConfidence:
              (r as any)?.ai_temperature_confidence != null &&
              Number.isFinite(Number((r as any).ai_temperature_confidence))
                ? Number((r as any).ai_temperature_confidence)
                : null,
            aiPhaseReason: (r as any)?.ai_phase_reason ? String((r as any).ai_phase_reason) : null,
            aiPhaseMode:
              (r as any)?.ai_phase_mode === 'shadow' || (r as any)?.ai_phase_mode === 'enforce'
                ? (r as any).ai_phase_mode
                : null,
            aiPhaseLastRunSource:
              (r as any)?.ai_phase_last_run_source === 'incremental' ||
              (r as any)?.ai_phase_last_run_source === 'catchup' ||
              (r as any)?.ai_phase_last_run_source === 'backfill' ||
              (r as any)?.ai_phase_last_run_source === 'manual_rephase'
                ? (r as any).ai_phase_last_run_source
                : null,
          };
          incoming.push(t);
        }

        if (incoming.length === 0) return;
        setterFastThreadsSinceMsRef.current = maxUpdatedMs;

        setThreads((prev) => {
          const byId = new Map<string, Thread>();
          for (const t of prev) byId.set(t.conversationId, t);
          for (const t of incoming) {
            const existing = byId.get(t.conversationId);
            byId.set(t.conversationId, existing ? { ...existing, ...t } : t);
          }
          const next = Array.from(byId.values());
          next.sort((a, b) => (b.lastAt?.getTime() || 0) - (a.lastAt?.getTime() || 0));
          return next;
        });
      } finally {
        setterFastThreadsInFlightRef.current = false;
      }
    },
    [workspace?.id, user?.id, isInstagramConnected, supportsSpam]
  );

  const upsertMessagePreview = useCallback((conversationId: string, next: MessagePreview) => {
    if (!conversationId) return;
    const atMs = Number(next?.atMs || 0) || Date.now();
    setMessagePreviewByConversationId((prev) => {
      const cur = prev[conversationId];
      if (cur && Number(cur.atMs || 0) >= atMs) return prev;
      return {
        ...prev,
        [conversationId]: {
          atMs,
          messageId: next?.messageId || null,
          text: coerceThreadPreviewText(next?.text || ''),
          direction: next?.direction === 'inbound' || next?.direction === 'outbound' ? next.direction : null,
        },
      };
    });
  }, []);

  // Avoid async race conditions swapping the visible thread/messages.
  selectedConversationIdRef.current = selectedConversationId;

  useEffect(() => {
    if (!lightboxUrl) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxUrl]);

  useEffect(() => {
    if (!pendingImageFile) {
      setPendingImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingImageFile);
    setPendingImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingImageFile]);

  useEffect(() => {
    if (initializedFiltersRef.current) return;
    initializedFiltersRef.current = true;

    const assigned = urlSearchParams.get('assigned');
    const temperature = urlSearchParams.get('temperature') || urlSearchParams.get('status');
    const funnel = urlSearchParams.get('funnel');
    const phases = urlSearchParams.get('phases');
    const spam = urlSearchParams.get('spam');
    const initialConversationId = urlSearchParams.get('conversation') || urlSearchParams.get('c');
    const prefillMessage = urlSearchParams.get('msg');
    const reminderMeetingId = urlSearchParams.get('reminderMeeting');
    const reminderKind = urlSearchParams.get('reminderKind');

    if (assigned) setFilterAssigned(assigned);
    if (
      temperature === 'all' ||
      temperature === 'hot' ||
      temperature === 'warm' ||
      temperature === 'cold'
    ) {
      setFilterTemperature(temperature as any);
    }
    if (funnel) {
      const keys = funnel
        .split(',')
        .map((x) => x.trim())
        .filter((x): x is FunnelStage =>
          x === 'new_lead' ||
          x === 'in_contact' ||
          x === 'qualified' ||
          x === 'unqualified' ||
          x === 'call_booked' ||
          x === 'won' ||
          x === 'no_show'
        );
      setFilterFunnelStages(Array.from(new Set(keys)));
    }
    if (phases) {
      const ids = phases
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      setFilterPhaseTagIds(Array.from(new Set(ids)));
    }
    if (spam === 'exclude' || spam === 'include' || spam === 'only') {
      setFilterSpamMode(spam);
    }
    setFilterPriorityOnly(false);
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
    }
    if (prefillMessage) {
      setDraftMessage(prefillMessage);
    }
    if (reminderMeetingId && (reminderKind === '24h' || reminderKind === '1h')) {
      setPendingReminderStamp({ meetingId: reminderMeetingId, kind: reminderKind });
    }
  }, [urlSearchParams]);

  useEffect(() => {
    if (!initializedFiltersRef.current) return;
    const next = new URLSearchParams();

    if (filterAssigned !== 'all') next.set('assigned', filterAssigned);
    if (filterTemperature !== 'all') next.set('temperature', filterTemperature);
    if (filterSpamMode !== 'exclude') next.set('spam', filterSpamMode);
    if (filterPriorityOnly) next.set('priorityOnly', '1');
    if (filterFunnelStages.length > 0) next.set('funnel', filterFunnelStages.join(','));
    if (filterPhaseTagIds.length > 0) next.set('phases', filterPhaseTagIds.join(','));

    setUrlSearchParams(next, { replace: true });
  }, [
    filterAssigned,
    filterTemperature,
    filterSpamMode,
    filterPriorityOnly,
    filterFunnelStages,
    filterPhaseTagIds,
    setUrlSearchParams,
  ]);

  const meLabel = connection?.instagram_username ? `@${connection.instagram_username}` : 'Instagram';
  const selectedThread = useMemo(() => {
    if (!selectedConversationId) return null;
    return threads.find((t) => t.conversationId === selectedConversationId) || null;
  }, [threads, selectedConversationId]);

  const displayedMessages = useMemo(() => {
    if (!selectedThread) return [] as any[];
    const rows = Array.isArray(selectedMessages) ? selectedMessages : [];
    return rows
      .filter((m) => messageBelongsToThread(m, selectedThread))
      .filter((m) => isRenderableIgMessageRow(m));
  }, [selectedThread?.conversationId, selectedThread?.peerId, selectedThread?.instagramAccountId, selectedMessages]);

  const memberNameById = useMemo(() => {
    const out: Record<string, string> = {};
    for (const m of members || []) {
      if (!m?.userId) continue;
      out[String(m.userId)] = String(m.displayName || 'Team member');
    }
    return out;
  }, [members]);

  const setterMembers = useMemo(() => {
    return (members || []).filter((m) => m.role === 'setter');
  }, [members]);

  const tagById = useMemo(() => {
    const out: Record<string, TagItem> = {};
    for (const t of tags) out[t.id] = t;
    return out;
  }, [tags]);

  const hotLeadTag = useMemo(
    () => tags.find((t) => t.name.toLowerCase() === 'hot lead') || null,
    [tags]
  );

  const temperatureTagByLevel = useMemo(() => {
    const out: Record<TemperatureLevel, TagItem | null> = {
      hot: null,
      warm: null,
      cold: null,
    };
    for (const tag of tags) {
      const name = normalizeTagName(tag.name);
      if (!out.hot && (name === 'hot lead' || name === 'hot')) out.hot = tag;
      if (!out.warm && (name === 'warm lead' || name === 'warm')) out.warm = tag;
      if (!out.cold && (name === 'cold lead' || name === 'cold')) out.cold = tag;
    }
    return out;
  }, [tags]);

  const funnelStageTagByKey = useMemo(() => {
    const out: Record<FunnelStage, TagItem | null> = {
      new_lead: null,
      in_contact: null,
      qualified: null,
      unqualified: null,
      call_booked: null,
      won: null,
      no_show: null,
    };
    for (const tag of tags) {
      const key = funnelStageKeyFromTagName(tag?.name);
      if (!key) continue;
      if (!out[key]) out[key] = tag;
    }
    return out;
  }, [tags]);

  const selectedConversationTagIds = useMemo(() => {
    if (!selectedThread) return [] as string[];
    return conversationTagIds[selectedThread.conversationId] || [];
  }, [selectedThread, conversationTagIds]);

  const selectedConversationTags = useMemo(() => {
    return selectedConversationTagIds.map((id) => tagById[id]).filter(Boolean);
  }, [selectedConversationTagIds, tagById]);

  const selectedLeadTeamMessages = useMemo(() => {
    if (!selectedThread) return [] as LeadTeamMessage[];
    return leadTeamMessagesByConversationId[selectedThread.conversationId] || [];
  }, [selectedThread, leadTeamMessagesByConversationId]);

  const selectedTemperature = useMemo<TemperatureLevel | null>(() => {
    if (!selectedThread) return null;
    const hasHot =
      (temperatureTagByLevel.hot?.id && selectedConversationTagIds.includes(temperatureTagByLevel.hot.id)) ||
      selectedConversationTags.some((tag) => matchesTemperatureTag(tag.name, 'hot'));
    const hasWarm =
      (temperatureTagByLevel.warm?.id && selectedConversationTagIds.includes(temperatureTagByLevel.warm.id)) ||
      selectedConversationTags.some((tag) => matchesTemperatureTag(tag.name, 'warm'));
    const hasCold =
      (temperatureTagByLevel.cold?.id && selectedConversationTagIds.includes(temperatureTagByLevel.cold.id)) ||
      selectedConversationTags.some((tag) => matchesTemperatureTag(tag.name, 'cold'));
    if (hasHot) return 'hot';
    if (hasWarm) return 'warm';
    if (hasCold) return 'cold';
    return null;
  }, [selectedThread, selectedConversationTagIds, selectedConversationTags, temperatureTagByLevel]);

  const selectedFunnelStage = useMemo<FunnelStage | null>(() => {
    if (!selectedThread) return null;
    // Keep the UI consistent with legacy `lead_status`.
    if (selectedThread.leadStatus === 'qualified') return 'qualified';
    if (selectedThread.leadStatus === 'disqualified') return 'unqualified';
    for (const key of FUNNEL_STAGE_ORDER) {
      const tag = funnelStageTagByKey[key];
      if (tag?.id && selectedConversationTagIds.includes(tag.id)) return key;
      if (selectedConversationTags.some((t) => funnelStageKeyFromTagName(t?.name) === key)) return key;
    }
    return 'new_lead';
  }, [selectedThread, selectedConversationTagIds, selectedConversationTags, funnelStageTagByKey]);

  const customTagOptions = useMemo(() => {
    return tags.filter((tag) => {
      if (matchesTemperatureTag(tag.name, 'hot')) return false;
      if (matchesTemperatureTag(tag.name, 'warm')) return false;
      if (matchesTemperatureTag(tag.name, 'cold')) return false;
      if (funnelStageKeyFromTagName(tag.name)) return false;
      const n = normalizeTagName(tag.name);
      if (n === 'priority' || n === 'qualified' || n === 'disqualified' || n === 'spam') return false;
      return true;
    });
  }, [tags]);

  const selectedCustomTags = useMemo(() => {
    return selectedConversationTags.filter((tag) => {
      if (matchesTemperatureTag(tag.name, 'hot')) return false;
      if (matchesTemperatureTag(tag.name, 'warm')) return false;
      if (matchesTemperatureTag(tag.name, 'cold')) return false;
      if (funnelStageKeyFromTagName(tag.name)) return false;
      const n = normalizeTagName(tag.name);
      return n !== 'priority' && n !== 'qualified' && n !== 'disqualified' && n !== 'spam';
    });
  }, [selectedConversationTags]);

  useEffect(() => {
    // Never carry reply state across threads.
    setReplyTo(null);
  }, [selectedThread?.conversationId]);

  useEffect(() => {
    setRightPanelTab('summary');
  }, [selectedThread?.conversationId]);

  // Instagram opens threads scrolled to the newest messages.
  useEffect(() => {
    pendingScrollToBottomConversationIdRef.current = selectedThread?.conversationId || null;
    isPinnedToBottomRef.current = true;
  }, [selectedThread?.conversationId]);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;

    const updatePinned = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      isPinnedToBottomRef.current = distanceFromBottom < 120;
    };

    updatePinned();
    el.addEventListener('scroll', updatePinned, { passive: true });
    return () => el.removeEventListener('scroll', updatePinned);
  }, [selectedThread?.conversationId]);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;

    const convId = selectedThread?.conversationId || null;
    const pendingFor = pendingScrollToBottomConversationIdRef.current;
    if (convId && pendingFor === convId) {
      // Best-effort: scroll to bottom after the messages render (and again after images/layout settle).
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
        isPinnedToBottomRef.current = true;
        setTimeout(() => {
          const current = messagesScrollRef.current;
          if (!current) return;
          current.scrollTop = current.scrollHeight;
          isPinnedToBottomRef.current = true;
        }, 60);
      });
      pendingScrollToBottomConversationIdRef.current = null;
      return;
    }

    // Keep the user pinned to the bottom only if they are already near the bottom.
    if (isPinnedToBottomRef.current) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
        isPinnedToBottomRef.current = true;
      });
    }
  }, [selectedThread?.conversationId, displayedMessages.length]);

  useEffect(() => {
    if (!selectedThread) {
      lastKnownThreadMessageKeyRef.current = '';
      return;
    }
    const rows = displayedMessages;
    if (rows.length === 0) {
      lastKnownThreadMessageKeyRef.current = '';
      return;
    }
    let bestKey = '';
    let bestMs = -1;
    for (const row of rows) {
      const key = row?.message_id ? String(row.message_id) : row?.id ? String(row.id) : '';
      if (!key) continue;
      const ms = getMessageTimestampMs(row);
      if (ms >= bestMs) {
        bestMs = ms;
        bestKey = key;
      }
    }
    if (bestKey) lastKnownThreadMessageKeyRef.current = bestKey;
  }, [selectedThread?.conversationId, displayedMessages]);

  useEffect(() => {
    if (!selectedThread) return;
    const rows = displayedMessages;
    if (rows.length === 0) return;

    let bestRow: any = null;
    let bestMs = -1;
    for (const row of rows) {
      const ms = getMessageTimestampMs(row);
      if (ms >= bestMs) {
        bestMs = ms;
        bestRow = row;
      }
    }
    if (!bestRow) return;

	    const atMs = bestMs > 0 ? bestMs : Date.now();
	    const messageId = bestRow?.message_id ? String(bestRow.message_id) : bestRow?.id ? String(bestRow.id) : null;
	    const direction = inferDirectionFromMessageRow(bestRow, {
	      instagramAccountId: selectedThread?.instagramAccountId ? String(selectedThread.instagramAccountId) : null,
	      peerId: selectedThread?.peerId ? String(selectedThread.peerId) : null,
	    });
	    const text = deriveMessagePreviewText(bestRow);

	    upsertMessagePreview(selectedThread.conversationId, { atMs, messageId, direction, text });
	  }, [selectedThread?.conversationId, selectedThread?.instagramAccountId, displayedMessages, upsertMessagePreview]);

  // IMPORTANT: Hooks must run on every render. Keep this above any early returns.
		  const threadsWithFlags = useMemo(() => {
		    const readsLoaded = readAtByConversationId !== null;
		    return threads.map((t) => {
		      const preview = messagePreviewByConversationId[t.conversationId] || null;
		      const threadLastAtMs = t?.lastAt ? t.lastAt.getTime() : 0;
		      const previewLastAtMs = preview ? Number(preview.atMs || 0) : 0;
	      // Prefer message-derived previews when:
	      // 1) they are newer than the thread cache, or
	      // 2) the thread cache looks polluted (e.g. webhook read/delivery events that set last_message_id=NULL).
	      const hasPreview = Boolean(
	        preview &&
	          previewLastAtMs &&
	          (previewLastAtMs >= threadLastAtMs || !t.lastMessageId || !t.lastAt)
	      );

	      const lastAt = hasPreview ? new Date(previewLastAtMs) : t.lastAt;
	      const lastAtMs = lastAt ? lastAt.getTime() : 0;
		      const lastText = hasPreview ? preview?.text || null : t.lastText;
		      const lastDirection = hasPreview ? preview?.direction || null : t.lastDirection;
		      const lastMessageId = hasPreview ? preview?.messageId || null : t.lastMessageId;

		      const readIso = readsLoaded ? (readAtByConversationId?.[t.conversationId] || null) : null;
		      const readMsFromMap = readIso ? parseTimestampMsLoose(readIso) : 0;
		      const sharedReadMs = t?.sharedLastReadAt ? t.sharedLastReadAt.getTime() : 0;
		      const previewInboundMs = hasPreview && preview?.direction === 'inbound' ? previewLastAtMs : 0;
		      const previewOutboundMs = hasPreview && preview?.direction === 'outbound' ? previewLastAtMs : 0;
		      const latestInboundMs = Math.max(
		        t?.lastInboundAt ? t.lastInboundAt.getTime() : 0,
		        previewInboundMs,
		        String(lastDirection || '') === 'inbound' ? lastAtMs : 0
		      );
		      const latestOutboundMs = Math.max(
		        t?.lastOutboundAt ? t.lastOutboundAt.getTime() : 0,
		        previewOutboundMs,
		        String(lastDirection || '') === 'outbound' ? lastAtMs : 0
		      );
		      const readMs = Math.max(readMsFromMap, sharedReadMs, latestOutboundMs);
		      const hasReadSignal = readsLoaded || sharedReadMs > 0 || latestOutboundMs > 0;
		      const unread =
		        hasReadSignal &&
		        latestInboundMs > readMs;
		      return { ...t, lastAt, lastText, lastDirection, lastMessageId, unread };
		    });
		  }, [threads, readAtByConversationId, messagePreviewByConversationId]);

	  const visibleThreads = useMemo(() => {
	    const q = searchQuery.trim().toLowerCase();
	    const now = Date.now();

	    const applyFunnelStageFilter = (t: any) => {
	      if (filterFunnelStages.length === 0) return true;

      // Keep funnel stage filters consistent with legacy `lead_status`.
      // (qualified/disqualified are treated as funnel-stage tags)
      const leadStatus = String(t.leadStatus || 'open');
      if (leadStatus === 'qualified') return filterFunnelStages.includes('qualified');
      if (leadStatus === 'disqualified') return filterFunnelStages.includes('unqualified');

      const ids = conversationTagIds[String(t.conversationId)] || [];
      const stages = new Set<FunnelStage>();
      for (const id of ids) {
        const name = tagById[String(id)]?.name || null;
        const key = funnelStageKeyFromTagName(name);
        if (key) stages.add(key);
      }
      // No funnel-stage tag present.
      if (stages.size === 0) return filterFunnelStages.includes('new_lead');
      return filterFunnelStages.some((k) => stages.has(k));
    };

    const applyTemperatureFilter = (t: any) => {
      if (filterTemperature === 'all') return true;
      const ids = conversationTagIds[String(t.conversationId)] || [];
      const tempTag = temperatureTagByLevel[filterTemperature];
      if (tempTag?.id && ids.includes(tempTag.id)) return true;
      return ids.some((id) => matchesTemperatureTag(tagById[String(id)]?.name || '', filterTemperature));
    };

    const applyPhaseTagFilter = (t: any) => {
      if (filterPhaseTagIds.length === 0) return true;
      const ids = conversationTagIds[String(t.conversationId)] || [];
      return filterPhaseTagIds.some((id) => ids.includes(id));
    };

    const applySpamFilter = (t: any) => {
      if (filterSpamMode === 'only') return Boolean(t.isSpam);
      if (filterSpamMode === 'exclude') return !Boolean(t.isSpam);
      return true;
    };

    const applyPrivateFilter = (t: any) => {
      // "Private lead" is owner-only and maps to `hidden_from_setters`.
      const isPrivate = Boolean(t.hiddenFromSetters);
      if (filterPrivateMode === 'only') return isPrivate;
      if (filterPrivateMode === 'exclude') return !isPrivate;
      return true;
    };

    const applyAssignedFilter = (t: any) => {
      if (filterAssigned === 'all') return true;
      if (filterAssigned === 'me') return String(t.assignedUserId || '') === String(user?.id || '');
      if (filterAssigned === 'unassigned') return !t.assignedUserId;
      return String(t.assignedUserId || '') === filterAssigned;
    };

    const applyLeadGate = (t: any) => String(t.leadStatus || 'open') !== 'removed';

    const base = threadsWithFlags.filter((t: any) => {
      if (!applyLeadGate(t)) return false;
		      if (!applySpamFilter(t)) return false;
		      if (!applyPrivateFilter(t)) return false;
		      if (!applyAssignedFilter(t)) return false;
		      if (!applyTemperatureFilter(t)) return false;
		      if (!applyPhaseTagFilter(t)) return false;
		      if (!applyFunnelStageFilter(t)) return false;
		      if (filterPriorityOnly && !t.priority) return false;

      if (activeTab === 'priority') {
        if (!t.priority) return false;
        const snoozedUntilMs = t.prioritySnoozedUntil ? t.prioritySnoozedUntil.getTime() : 0;
        if (snoozedUntilMs && snoozedUntilMs > now) return false;
      } else if (activeTab === 'unread') {
        if (!Boolean(t.unread)) return false;
      }

      return true;
    });

    const sortByLastAtDesc = (items: any[]) => {
      return items
        .map((t, idx) => ({ t, idx }))
        .sort((a, b) => {
          const ta = a.t?.lastAt ? a.t.lastAt.getTime() : 0;
          const tb = b.t?.lastAt ? b.t.lastAt.getTime() : 0;
          if (tb !== ta) return tb - ta;
          return a.idx - b.idx;
        })
        .map((x) => x.t);
    };

    if (!q) return sortByLastAtDesc(base);
    return sortByLastAtDesc(base.filter((t) => {
      const name = String((t as any).peerUsername || (t as any).peerName || (t as any).peerId || '').toLowerCase();
      const snippet = String((t as any).lastText || '').toLowerCase();
      return name.includes(q) || snippet.includes(q);
    }));
	  }, [
	    threadsWithFlags,
	    activeTab,
	    searchQuery,
	    filterAssigned,
	    filterTemperature,
	    filterFunnelStages,
	    filterPhaseTagIds,
		    filterSpamMode,
		    filterPrivateMode,
	    filterPriorityOnly,
	    conversationTagIds,
    tagById,
    temperatureTagByLevel,
    user?.id,
  ]);

  const threadListKey = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
	    return [
	      activeTab,
	      q,
	      filterAssigned,
	      filterTemperature,
	      filterSpamMode,
	      filterPrivateMode,
	      filterPriorityOnly ? '1' : '0',
	      filterFunnelStages.join(','),
	      filterPhaseTagIds.join(','),
	    ].join('|');
	  }, [
	    activeTab,
	    searchQuery,
	    filterAssigned,
	    filterTemperature,
	    filterSpamMode,
	    filterPrivateMode,
	    filterPriorityOnly,
	    filterFunnelStages,
	    filterPhaseTagIds,
	  ]);

  useEffect(() => {
    setThreadRenderLimit(250);
  }, [threadListKey]);

  const renderedThreads = useMemo(
    () => visibleThreads.slice(0, Math.max(50, threadRenderLimit)),
    [visibleThreads, threadRenderLimit]
  );

  const handleThreadListScroll = useCallback(() => {
    const el = threadListScrollRef.current;
    if (!el) return;
    const remaining = el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (remaining > 420) return;

    setThreadRenderLimit((prev) => {
      const max = visibleThreads.length;
      if (prev >= max) return prev;
      return Math.min(prev + 250, max);
    });
  }, [visibleThreads.length]);

  const operationsMetrics = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startMs = startOfToday.getTime();

    let todaysNewLeads = 0;
    let hotLeadsWaiting = 0;
    let qualifiedWaiting = 0;

    const hotLeadId = hotLeadTag?.id || null;
    for (const t of threads) {
      if (t.leadStatus === 'removed') continue;
      if (t.isSpam) continue;
      if (!t.isSpam && t.lastDirection === 'inbound' && t.lastAt && t.lastAt.getTime() >= startMs) {
        todaysNewLeads += 1;
      }

      if (hotLeadId && (conversationTagIds[t.conversationId] || []).includes(hotLeadId)) {
        const inbound = t.lastInboundAt ? t.lastInboundAt.getTime() : 0;
        const outbound = t.lastOutboundAt ? t.lastOutboundAt.getTime() : 0;
        if (inbound && inbound > outbound && (now - inbound) > 4 * 60 * 60 * 1000) {
          hotLeadsWaiting += 1;
        }
      }

      if (t.leadStatus === 'qualified') {
        const inbound = t.lastInboundAt ? t.lastInboundAt.getTime() : 0;
        const outbound = t.lastOutboundAt ? t.lastOutboundAt.getTime() : 0;
        if (inbound && inbound > outbound) qualifiedWaiting += 1;
      }
    }

    const noShows = alerts.filter((a) => a.type === 'no_show_followup').length;
    return { todaysNewLeads, hotLeadsWaiting, qualifiedWaiting, noShows };
  }, [threads, conversationTagIds, hotLeadTag?.id, alerts]);

  // If the user has no active workspace, don't hang on a blank loading screen.
  useEffect(() => {
    if (workspace?.id) return;
    setIsLoading(false);
    setIsInstagramConnected(false);
    setConnection(null);
  }, [workspace?.id]);

  useEffect(() => {
    setMessagePreviewByConversationId({});
  }, [workspace?.id]);

  const checkConnection = useCallback(async () => {
    if (!workspace?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Prevent an indefinite loading state if the edge function hangs.
      const timeoutMs = 12000;
      const invokePromise = supabase.functions.invoke('instagram-connect', {
        body: {
          action: 'status',
          workspaceId: workspace.id,
        },
      });
      const timeoutPromise = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('Instagram status request timed out'));
        }, timeoutMs);
      });

      const { data, error } = (await Promise.race([invokePromise, timeoutPromise])) as {
        data: unknown;
        error: any;
      };

      if (error) {
        console.error('Instagram status error:', error);
        setIsInstagramConnected(false);
        setConnection(null);
      } else {
        const status = (data || {}) as InstagramConnectionStatus;
        setIsInstagramConnected(Boolean(status?.connected));
        setConnection(status?.connection || null);
      }
    } catch (error) {
      console.error('Instagram status request failed:', error);
      setIsInstagramConnected(false);
      setConnection(null);
    } finally {
      setIsLoading(false);
    }
  }, [workspace?.id]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsInstagramConnected(false);
      setConnection(null);
    }, 15000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const loadTags = useCallback(async () => {
    if (!workspace?.id) return;
    try {
      const { data, error } = await (supabase as any)
        .from('instagram_tags')
        .select('id,name,color,icon,prompt')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      const nextTags = rows.map((r: any) => {
        const name = String(r.name || 'Tag');
        const normalized = normalizeTagName(name);
        let color = String(r.color || '#8A8A8A');

        // Keep core/system tags looking consistent (avoid legacy pastel colors).
        if (normalized === 'spam') color = '#dc2626';
        if (normalized === 'qualified') color = '#22c55e';
        if (normalized === 'disqualified') color = '#b91c1c';
        if (normalized === 'priority') color = '#eab308';

        return {
          id: String(r.id),
          name,
          color,
          icon: r.icon ? String(r.icon) : null,
          prompt: r.prompt ? String(r.prompt) : null,
        };
      });
      setTags(nextTags);

      const hasHotLead = nextTags.some((x) => x.name.toLowerCase() === 'hot lead');
      if (
        !hasHotLead &&
        userRole === 'owner' &&
        user?.id &&
        !seededHotLeadTagRef.current
      ) {
        seededHotLeadTagRef.current = true;
        const { error: seedError } = await (supabase as any)
          .from('instagram_tags')
          .insert({
            workspace_id: workspace.id,
            name: 'Hot Lead',
            color: '#F59E0B',
            icon: 'star',
            prompt:
              'Tag this conversation when lead intent is high: asks about pricing, availability, booking, next steps, or sounds ready to buy.',
            created_by: user.id,
          });
        if (!seedError) {
          await loadTags();
        } else {
          seededHotLeadTagRef.current = false;
        }
      }
    } catch (error) {
      setTags([]);
    }
  }, [workspace?.id, user?.id, userRole]);

  const loadAlerts = useCallback(async () => {
    if (!workspace?.id) return;
    try {
      const { data, error } = await (supabase as any)
        .from('instagram_alerts')
        .select('id,conversation_id,alert_type,assigned_user_id,overdue_minutes,recommended_action,status')
        .eq('workspace_id', workspace.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      setAlerts(
        rows.map((r: any) => ({
          id: String(r.id),
          conversationId: String(r.conversation_id),
          type: String(r.alert_type) as ThreadAlert['type'],
          assignedUserId: r.assigned_user_id ? String(r.assigned_user_id) : null,
          overdueMinutes: Number(r.overdue_minutes || 0),
          recommendedAction: r.recommended_action ? String(r.recommended_action) : null,
        }))
      );
    } catch {
      setAlerts([]);
    }
  }, [workspace?.id]);

  const upsertLeadTeamMessageInState = useCallback((message: LeadTeamMessage) => {
    setLeadTeamMessagesByConversationId((prev) => {
      const key = message.conversationId;
      const current = prev[key] || [];
      const existingIndex = current.findIndex((m) => m.id === message.id);
      if (existingIndex >= 0) {
        const next = current.slice();
        next[existingIndex] = message;
        return { ...prev, [key]: next.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) };
      }
      return {
        ...prev,
        [key]: [...current, message].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
      };
    });
  }, []);

  const loadLeadTeamMessages = useCallback(
    async (conversationId: string) => {
      if (!workspace?.id || !conversationId) return;
      setIsLeadTeamLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from('lead_team_messages')
          .select('id,workspace_id,conversation_id,author_user_id,body,created_at')
          .eq('workspace_id', workspace.id)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .limit(400);

        if (error) throw error;
        const rows = Array.isArray(data) ? data : [];
        setLeadTeamMessagesByConversationId((prev) => ({
          ...prev,
          [conversationId]: rows.map((row: any) => ({
            id: String(row.id),
            workspaceId: String(row.workspace_id),
            conversationId: String(row.conversation_id),
            authorUserId: String(row.author_user_id),
            body: String(row.body || ''),
            createdAt: new Date(String(row.created_at)),
          })),
        }));
      } catch (error) {
        console.warn('Failed to load internal team chat:', error);
        setLeadTeamMessagesByConversationId((prev) => ({ ...prev, [conversationId]: [] }));
      } finally {
        setIsLeadTeamLoading(false);
      }
    },
    [workspace?.id]
  );

  const sendLeadTeamMessage = useCallback(async () => {
    if (!workspace?.id || !user?.id || !selectedThread) return;
    const body = leadTeamDraft.trim();
    if (!body) return;

    setIsSendingLeadTeamMessage(true);
    try {
      const { data, error } = await (supabase as any)
        .from('lead_team_messages')
        .insert({
          workspace_id: workspace.id,
          conversation_id: selectedThread.conversationId,
          author_user_id: user.id,
          body,
        })
        .select('id,workspace_id,conversation_id,author_user_id,body,created_at')
        .single();

      if (error) throw error;

      const row = data;
      upsertLeadTeamMessageInState({
        id: String(row.id),
        workspaceId: String(row.workspace_id),
        conversationId: String(row.conversation_id),
        authorUserId: String(row.author_user_id),
        body: String(row.body || ''),
        createdAt: new Date(String(row.created_at)),
      });
      setLeadTeamDraft('');
    } catch (error: any) {
      const rawMessage = String(error?.message || error?.details || '').trim();
      toast.error(rawMessage || 'Failed to post internal message');
    } finally {
      setIsSendingLeadTeamMessage(false);
    }
  }, [
    workspace?.id,
    user?.id,
    selectedThread,
    leadTeamDraft,
    upsertLeadTeamMessageInState,
  ]);

  useEffect(() => {
    setLeadTeamDraft('');
    if (!selectedThread?.conversationId) return;
    loadLeadTeamMessages(selectedThread.conversationId);
  }, [selectedThread?.conversationId, loadLeadTeamMessages]);

  const reloadInbox = useCallback(async (opts?: { baselineReads?: boolean }) => {
    if (!workspace?.id || !user?.id || !isInstagramConnected) return;

    const parseIsoDate = (v: any): Date | null => {
      if (!v) return null;
      const d = new Date(String(v));
      return Number.isFinite(d.getTime()) ? d : null;
    };

    // Threads
    const threadsSelectCandidates = [
      // Prefer the full schema so assignment/privacy/snooze/summary don't flicker (and don't regress to null).
      {
        select:
          'conversation_id,instagram_account_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,priority,is_spam,hidden_from_setters,shared_with_setters,assigned_user_id,lead_status,priority_snoozed_until,priority_followed_up_at,summary_text,summary_updated_at,shared_last_read_at,last_inbound_at,last_outbound_at,last_message_id,last_message_text,last_message_direction,last_message_at,ai_phase_updated_at,ai_phase_confidence,ai_temperature_confidence,ai_phase_reason,ai_phase_mode,ai_phase_last_run_source',
        supportsSpam: true,
      },
      {
        select:
          'conversation_id,instagram_account_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,priority,is_spam,hidden_from_setters,shared_with_setters,assigned_user_id,lead_status,last_inbound_at,last_outbound_at,last_message_id,last_message_text,last_message_direction,last_message_at,ai_phase_updated_at,ai_phase_confidence,ai_temperature_confidence,ai_phase_reason,ai_phase_mode,ai_phase_last_run_source',
        supportsSpam: true,
      },
      {
        select:
          'conversation_id,instagram_account_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,priority,is_spam,hidden_from_setters,shared_with_setters,assigned_user_id,lead_status,last_message_id,last_message_text,last_message_direction,last_message_at,ai_phase_updated_at,ai_phase_confidence,ai_temperature_confidence,ai_phase_reason,ai_phase_mode,ai_phase_last_run_source',
        supportsSpam: true,
      },
      {
        select:
          'conversation_id,instagram_account_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,priority,is_spam,assigned_user_id,lead_status,last_message_id,last_message_text,last_message_direction,last_message_at,ai_phase_updated_at,ai_phase_confidence,ai_temperature_confidence,ai_phase_reason,ai_phase_mode,ai_phase_last_run_source',
        supportsSpam: true,
      },
      {
        select:
          'conversation_id,instagram_account_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,priority,hidden_from_setters,shared_with_setters,assigned_user_id,lead_status,last_message_id,last_message_text,last_message_direction,last_message_at',
        supportsSpam: false,
      },
      {
        select:
          'conversation_id,instagram_account_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,priority,last_message_id,last_message_text,last_message_direction,last_message_at',
        supportsSpam: false,
      },
      {
        select:
          'conversation_id,instagram_account_id,instagram_user_id,peer_username,peer_name,peer_profile_picture_url,last_message_id,last_message_text,last_message_at',
        supportsSpam: false,
      },
      {
        select:
          'conversation_id,instagram_account_id,instagram_user_id,last_message_id,last_message_text,last_message_at',
        supportsSpam: false,
      },
    ] as const;

    const errorLooksLikeMissingColumn = (error: any) => {
      if (!error) return false;
      const text = `${String(error?.message || '')} ${String(error?.details || '')} ${String(error?.hint || '')}`.toLowerCase();
      return (
        text.includes('column') ||
        text.includes('does not exist') ||
        text.includes('is_spam') ||
        text.includes('last_message_direction') ||
        text.includes('priority') ||
        text.includes('ai_phase_') ||
        text.includes('hidden_from_setters') ||
        text.includes('shared_with_setters')
      );
    };

    let threadsData: any[] | null = [];
    let threadsError: any = null;

    for (let i = 0; i < threadsSelectCandidates.length; i += 1) {
      const candidate = threadsSelectCandidates[i];
      const PAGE_SIZE = 1000;
      // We need to support workspaces with thousands of DMs. Keep a hard cap as a safety valve.
      const MAX_ROWS = 50_000;

      const allRows: any[] = [];
      let pageOk = true;

      for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
        const res = await (supabase as any)
          .from('instagram_threads')
          .select(candidate.select)
          .eq('workspace_id', workspace.id)
          .order('last_message_at', { ascending: false, nullsFirst: false })
          .order('conversation_id', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (res.error) {
          threadsError = res.error;
          pageOk = false;
          break;
        }

        const rows = Array.isArray(res.data) ? res.data : [];
        if (rows.length > 0) allRows.push(...rows);
        if (rows.length < PAGE_SIZE) break;
      }

      if (pageOk) {
        threadsData = allRows;
        threadsError = null;
        setSupportsSpam(candidate.supportsSpam);
        break;
      }

      if (!errorLooksLikeMissingColumn(threadsError)) {
        break;
      }
    }

    if (threadsError) {
      // Keep rendering by falling back to message-derived conversations.
      console.warn('Load threads error (falling back to messages):', threadsError);
      threadsData = [];
      setSupportsSpam(false);
    }

    let parsedThreads: Thread[] = (Array.isArray(threadsData) ? threadsData : []).map((r: any) => {
      const conversationId = String(r.conversation_id || '');
      const instagramAccountId = String(r.instagram_account_id || '');
      const rawPeerId = r.instagram_user_id ? String(r.instagram_user_id) : '';
      const prefix = `${instagramAccountId}:`;
      const candidateFromConversation =
        conversationId.startsWith(prefix) ? conversationId.slice(prefix.length).trim() : '';
      const shouldReplacePeerId =
        !rawPeerId ||
        rawPeerId === 'unknown' ||
        rawPeerId === instagramAccountId ||
        rawPeerId.startsWith('unknown:');
      const peerId = shouldReplacePeerId && candidateFromConversation
        ? candidateFromConversation
        : rawPeerId;

      const leadStatusRaw = String((r as any).lead_status || 'open');
      const leadStatus =
        leadStatusRaw === 'qualified' ||
        leadStatusRaw === 'disqualified' ||
        leadStatusRaw === 'removed'
          ? leadStatusRaw
          : 'open';

      return {
        conversationId,
        instagramAccountId,
        peerId,
        peerUsername: r.peer_username ? String(r.peer_username) : null,
        peerName: r.peer_name ? String(r.peer_name) : null,
        peerPicture: r.peer_profile_picture_url ? String(r.peer_profile_picture_url) : null,
        priority: Boolean(r.priority),
        isSpam: Boolean((r as any).is_spam),
        hiddenFromSetters: Boolean((r as any).hidden_from_setters),
        sharedWithSetters: Boolean((r as any).shared_with_setters),
        leadStatus,
        assignedUserId: (r as any).assigned_user_id ? String((r as any).assigned_user_id) : null,
        prioritySnoozedUntil: parseIsoDate((r as any).priority_snoozed_until),
        priorityFollowedUpAt: parseIsoDate((r as any).priority_followed_up_at),
        summaryText: (r as any).summary_text ? String((r as any).summary_text) : null,
        summaryUpdatedAt: parseIsoDate((r as any).summary_updated_at),
        sharedLastReadAt: parseIsoDate((r as any).shared_last_read_at),
        lastInboundAt: parseIsoDate((r as any).last_inbound_at),
        lastOutboundAt: parseIsoDate((r as any).last_outbound_at),
        lastMessageId: r.last_message_id ? String(r.last_message_id) : null,
        lastText: r.last_message_text ? String(r.last_message_text) : null,
        lastDirection: r.last_message_direction === 'inbound' || r.last_message_direction === 'outbound' ? r.last_message_direction : null,
        lastAt: (() => {
          if (!r.last_message_at) return null;
          const d = new Date(String(r.last_message_at));
          return Number.isFinite(d.getTime()) ? d : null;
        })(),
        aiPhaseUpdatedAt: parseIsoDate((r as any).ai_phase_updated_at),
        aiPhaseConfidence:
          (r as any).ai_phase_confidence != null && Number.isFinite(Number((r as any).ai_phase_confidence))
            ? Number((r as any).ai_phase_confidence)
            : null,
        aiTemperatureConfidence:
          (r as any).ai_temperature_confidence != null &&
          Number.isFinite(Number((r as any).ai_temperature_confidence))
            ? Number((r as any).ai_temperature_confidence)
            : null,
        aiPhaseReason: (r as any).ai_phase_reason ? String((r as any).ai_phase_reason) : null,
        aiPhaseMode:
          (r as any).ai_phase_mode === 'shadow' || (r as any).ai_phase_mode === 'enforce'
            ? (r as any).ai_phase_mode
            : null,
        aiPhaseLastRunSource:
          (r as any).ai_phase_last_run_source === 'incremental' ||
          (r as any).ai_phase_last_run_source === 'catchup' ||
          (r as any).ai_phase_last_run_source === 'backfill' ||
          (r as any).ai_phase_last_run_source === 'manual_rephase'
            ? (r as any).ai_phase_last_run_source
            : null,
      };
    });

    // If unix-seconds get parsed as unix-ms, timestamps show up as 1970 and the inbox ordering looks wrong.
	    // We can correct lastAt by looking up the referenced last_message_id in instagram_messages.
	    const lastAtFixCache = fixedLastAtByMessageIdRef.current;
	    const needsLastAtFixIds = parsedThreads
	      .filter((t) => {
	        if (!t.lastMessageId || !t.lastAt) return false;
	        const ts = t.lastAt.getTime();
	        return !Number.isFinite(ts) || ts < 1104537600000;
	      })
	      .map((t) => String(t.lastMessageId));

    if (needsLastAtFixIds.length > 0) {
      const uniqueIds = Array.from(new Set(needsLastAtFixIds)).slice(0, 500);
      const idsToQuery = uniqueIds.filter((id) => !lastAtFixCache[id]);

      if (idsToQuery.length > 0) {
        const { data: lastMsgRows, error: lastMsgError } = await (supabase as any)
          .from('instagram_messages')
          .select('message_id,message_timestamp,created_at,raw_payload')
          .eq('workspace_id', workspace.id)
          .in('message_id', idsToQuery);

        if (!lastMsgError && Array.isArray(lastMsgRows) && lastMsgRows.length > 0) {
          const parseTimestampMs = (v: any): number => {
            if (v == null) return 0;
            if (v instanceof Date) {
              const t = v.getTime();
              return Number.isFinite(t) ? t : 0;
            }
            if (typeof v === 'number') {
              if (!Number.isFinite(v)) return 0;
              return v < 1e12 ? Math.round(v * 1000) : Math.round(v);
            }
            const s = String(v).trim();
            if (!s) return 0;
            if (/^\d{10,13}(\.\d+)?$/.test(s)) {
              const num = Number(s);
              if (!Number.isFinite(num)) return 0;
              const digits = s.split('.')[0].length;
              const ms = digits >= 13 ? num : num * 1000;
              const d = new Date(ms);
              const t = d.getTime();
              return Number.isFinite(t) ? t : 0;
            }
            const normalized = s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
            const t1 = Date.parse(normalized);
            if (Number.isFinite(t1)) return t1;
            const t2 = Date.parse(s);
            return Number.isFinite(t2) ? t2 : 0;
          };

          const getMs = (m: any): number => {
            const primary = parseTimestampMs(m?.message_timestamp);
            const raw = parseTimestampMs(m?.raw_payload?.created_time ?? m?.raw_payload?.timestamp);
            const created = parseTimestampMs(m?.created_at);
            if (raw && (primary === 0 || primary < 1104537600000) && raw > primary) return raw;
            if (primary) return primary;
            if (raw) return raw;
            if (created) return created;
            return 0;
          };

          for (const row of lastMsgRows) {
            const id = row?.message_id ? String(row.message_id) : null;
            if (!id) continue;
            const ms = getMs(row);
            if (ms) lastAtFixCache[id] = ms;
          }
        }
      }

      parsedThreads = parsedThreads.map((t) => {
        if (!t.lastMessageId) return t;
        const ms = lastAtFixCache[String(t.lastMessageId)] || 0;
        if (!ms) return t;
        return { ...t, lastAt: new Date(ms) };
      });
    }

    // NOTE: Extended metadata is now loaded in the main thread query above (with graceful fallbacks),
    // which avoids "assignment snaps back to unassigned" when a secondary metadata query fails.

    let cleanedThreads = parsedThreads
      .filter(
        (t) =>
          t.conversationId &&
          t.instagramAccountId &&
          t.peerId &&
          t.peerId !== t.instagramAccountId
      )
      .slice();

    // Resilience: if metadata rows are missing/empty, derive a thread list directly from messages.
    if (cleanedThreads.length === 0) {
      try {
        const fallbackSelectCandidates = [
          'instagram_account_id,instagram_user_id,sender_id,recipient_id,message_text,direction,message_id,message_timestamp,created_at,raw_payload',
          'instagram_account_id,instagram_user_id,sender_id,recipient_id,message_text,message_id,message_timestamp,created_at,raw_payload',
          'instagram_account_id,sender_id,recipient_id,message_text,message_id,created_at,raw_payload',
        ] as const;

        let fallbackMessages: any[] | null = [];
        let fallbackMessagesError: any = null;
        for (let i = 0; i < fallbackSelectCandidates.length; i += 1) {
          const select = fallbackSelectCandidates[i];
          const res = await (supabase as any)
            .from('instagram_messages')
            .select(select)
            .eq('workspace_id', workspace.id)
            .order('message_timestamp', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })
            .limit(2500);

          if (!res.error) {
            fallbackMessages = res.data;
            fallbackMessagesError = null;
            break;
          }

          fallbackMessagesError = res.error;
          const text = `${String(res.error?.message || '')} ${String(res.error?.details || '')}`.toLowerCase();
          if (!text.includes('column') && !text.includes('does not exist')) {
            break;
          }
        }

        if (!fallbackMessagesError && Array.isArray(fallbackMessages) && fallbackMessages.length > 0) {
          const parseTimestampMs = (v: any): number => {
            if (v == null) return 0;
            if (v instanceof Date) {
              const t = v.getTime();
              return Number.isFinite(t) ? t : 0;
            }
            if (typeof v === 'number') {
              if (!Number.isFinite(v)) return 0;
              return v < 1e12 ? Math.round(v * 1000) : Math.round(v);
            }
            const s = String(v).trim();
            if (!s) return 0;
            if (/^\d{10,13}(\.\d+)?$/.test(s)) {
              const num = Number(s);
              if (!Number.isFinite(num)) return 0;
              const digits = s.split('.')[0].length;
              const ms = digits >= 13 ? num : num * 1000;
              const d = new Date(ms);
              const t = d.getTime();
              return Number.isFinite(t) ? t : 0;
            }
            const normalized = s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
            const t1 = Date.parse(normalized);
            if (Number.isFinite(t1)) return t1;
            const t2 = Date.parse(s);
            return Number.isFinite(t2) ? t2 : 0;
          };

          const byConversation: Record<string, Thread> = {};

          for (const row of fallbackMessages) {
            const accountId = row?.instagram_account_id ? String(row.instagram_account_id) : '';
            const senderId = row?.sender_id ? String(row.sender_id) : '';
            const recipientId = row?.recipient_id ? String(row.recipient_id) : '';
            const sourceConversationId = row?.raw_payload?.conversation_id
              ? String(row.raw_payload.conversation_id)
              : null;
            let conversationId = row?.raw_payload?.conversation_key
              ? String(row.raw_payload.conversation_key)
              : (sourceConversationId ? `${accountId}:${sourceConversationId}` : '');
            let peerId = row?.instagram_user_id ? String(row.instagram_user_id) : '';

            if (
              !peerId ||
              peerId === accountId ||
              peerId === 'unknown' ||
              peerId.startsWith('unknown:')
            ) {
              if (senderId && senderId !== accountId) peerId = senderId;
              else if (recipientId && recipientId !== accountId) peerId = recipientId;
            }

            if (
              (!peerId || peerId === accountId || peerId === 'unknown' || peerId.startsWith('unknown:')) &&
              conversationId &&
              accountId &&
              conversationId.startsWith(`${accountId}:`)
            ) {
              const candidate = conversationId.slice(`${accountId}:`.length).trim();
              if (candidate && candidate !== accountId) peerId = candidate;
            }

            if (!peerId && sourceConversationId) {
              peerId = `unknown:${sourceConversationId}`;
            }

            if (!conversationId && accountId && peerId) {
              conversationId = `${accountId}:${peerId}`;
            }

            if (!accountId || !peerId || !conversationId || peerId === accountId) continue;

            const ts = (() => {
              const messageTs = parseTimestampMs(row?.message_timestamp);
              const rawTs = parseTimestampMs(row?.raw_payload?.created_time ?? row?.raw_payload?.timestamp);
              const createdTs = parseTimestampMs(row?.created_at);
              if (rawTs && (!messageTs || messageTs < 1104537600000) && rawTs > messageTs) return rawTs;
              if (messageTs) return messageTs;
              if (rawTs) return rawTs;
              if (createdTs) return createdTs;
              return 0;
            })();
            if (!ts) continue;

            const existing = byConversation[conversationId];
            if (existing && existing.lastAt && existing.lastAt.getTime() >= ts) continue;

            const direction = inferDirectionFromMessageRow(row, {
              instagramAccountId: accountId,
              peerId,
            });

            byConversation[conversationId] = {
              conversationId,
              instagramAccountId: accountId,
              peerId,
              peerUsername: null,
              peerName: null,
              peerPicture: null,
              priority: false,
              isSpam: false,
              hiddenFromSetters: false,
              sharedWithSetters: false,
              leadStatus: 'open',
              assignedUserId: null,
              prioritySnoozedUntil: null,
              priorityFollowedUpAt: null,
              summaryText: null,
              summaryUpdatedAt: null,
              sharedLastReadAt: null,
              lastInboundAt: direction === 'inbound' ? new Date(ts) : null,
              lastOutboundAt: direction === 'outbound' ? new Date(ts) : null,
              lastMessageId: row?.message_id ? String(row.message_id) : null,
              lastText: row?.message_text ? String(row.message_text) : null,
              lastDirection: direction,
              lastAt: new Date(ts),
              aiPhaseUpdatedAt: null,
              aiPhaseConfidence: null,
              aiTemperatureConfidence: null,
              aiPhaseReason: null,
              aiPhaseMode: null,
              aiPhaseLastRunSource: null,
            };
          }

          cleanedThreads = Object.values(byConversation);
          cleanedThreads.sort((a, b) => {
            const ta = a.lastAt ? a.lastAt.getTime() : -1;
            const tb = b.lastAt ? b.lastAt.getTime() : -1;
            return tb - ta;
          });
        }
      } catch {
        // ignore
      }
    }

    cleanedThreads.sort((a, b) => {
      const ta = a.lastAt ? a.lastAt.getTime() : -1;
      const tb = b.lastAt ? b.lastAt.getTime() : -1;
      return tb - ta;
    });

    const dedupedThreads: Thread[] = [];
    const seenConversationIds = new Set<string>();
    for (const t of cleanedThreads) {
      if (seenConversationIds.has(t.conversationId)) continue;
      seenConversationIds.add(t.conversationId);
      dedupedThreads.push(t);
    }
    cleanedThreads = dedupedThreads;

	    cleanedThreads = applyThreadOverrides(cleanedThreads);
	    setThreads(cleanedThreads);

	    // Backfill thread previews from the messages table so lead cards reflect the true latest DM
	    // (including outbound messages sent directly from the Instagram app).
	    try {
	      const nowMs = Date.now();
	      const lastRun = Number(lastPreviewBackfillAtRef.current || 0);
	      if (nowMs - lastRun > 8000) {
	        lastPreviewBackfillAtRef.current = nowMs;

	        const convIds = cleanedThreads.map((t) => String(t.conversationId)).filter(Boolean).slice(0, 500);
	        const convSet = new Set(convIds);

	        if (convSet.size > 0) {
		          const { data: rows, error } = await (supabase as any)
		            .from('instagram_messages')
		            .select(
		              'id,message_id,instagram_account_id,instagram_user_id,sender_id,recipient_id,message_text,direction,message_timestamp,created_at,raw_payload'
		            )
		            .eq('workspace_id', workspace.id)
		            .order('message_timestamp', { ascending: false, nullsFirst: false })
		            .order('created_at', { ascending: false })
		            .limit(1500);

	          if (!error && Array.isArray(rows) && rows.length > 0) {
	            const patch: Record<string, MessagePreview> = {};
	            const seen = new Set<string>();

	            for (const row of rows) {
	              const convKey = row?.raw_payload?.conversation_key ? String(row.raw_payload.conversation_key) : null;
	              const accId = row?.instagram_account_id ? String(row.instagram_account_id) : null;
	              const peerId = row?.instagram_user_id ? String(row.instagram_user_id) : null;
	              const conversationId = convKey || (accId && peerId ? `${accId}:${peerId}` : null);
	              if (!conversationId || !convSet.has(conversationId) || seen.has(conversationId)) continue;
	              if (!isRenderableIgMessageRow(row)) continue;

	              const atMs = getMessageTimestampMs(row) || 0;
	              if (!atMs) continue;
	              const messageId = row?.message_id ? String(row.message_id) : row?.id ? String(row.id) : null;

		              const direction = inferDirectionFromMessageRow(row, {
		                instagramAccountId: accId,
		                peerId,
		              });

	              patch[conversationId] = {
	                atMs,
	                messageId,
	                text: deriveMessagePreviewText(row),
	                direction,
	              };
	              seen.add(conversationId);
	              if (seen.size >= convSet.size) break;
	            }

	            const patchKeys = Object.keys(patch);
	            if (patchKeys.length > 0) {
	              setMessagePreviewByConversationId((prev) => {
	                let changed = false;
	                const out = { ...prev };
	                for (const conversationId of patchKeys) {
	                  const next = patch[conversationId];
	                  const nextAtMs = Number(next?.atMs || 0) || 0;
	                  if (!nextAtMs) continue;
	                  const cur = prev[conversationId];
	                  if (cur && Number(cur.atMs || 0) >= nextAtMs) continue;
	                  out[conversationId] = {
	                    atMs: nextAtMs,
	                    messageId: next?.messageId || null,
	                    text: coerceThreadPreviewText(next?.text || ''),
	                    direction: next?.direction === 'inbound' || next?.direction === 'outbound' ? next.direction : null,
	                  };
	                  changed = true;
	                }
	                return changed ? out : prev;
	              });
	            }
	          }
	        }
	      }
	    } catch {
	      // ignore preview backfill failures
	    }

	    // Conversation tags map.
	    try {
	      const convIdsAll = cleanedThreads.map((t) => String(t.conversationId || '')).filter(Boolean);
        if (convIdsAll.length === 0) {
          setConversationTagIds({});
        } else {
          const map: Record<string, string[]> = {};
          const CHUNK = 1000;
          for (let i = 0; i < convIdsAll.length; i += CHUNK) {
            const chunk = convIdsAll.slice(i, i + CHUNK);
            const { data: links, error: linksError } = await (supabase as any)
              .from('instagram_conversation_tags')
              .select('conversation_id,tag_id')
              .eq('workspace_id', workspace.id)
              .in('conversation_id', chunk);
            if (linksError) continue;
            for (const row of Array.isArray(links) ? links : []) {
              const conversationId = row?.conversation_id ? String(row.conversation_id) : null;
              const tagId = row?.tag_id ? String(row.tag_id) : null;
              if (!conversationId || !tagId) continue;
              if (!map[conversationId]) map[conversationId] = [];
              if (!map[conversationId].includes(tagId)) map[conversationId].push(tagId);
            }
          }
          setConversationTagIds(map);
        }
    } catch {
      setConversationTagIds({});
    }

    // Shared reads (latest marker across visible owner/setter users).
    const readsSnapshot = await loadSharedThreadReads({ applyToState: false });
    if (!readsSnapshot) return;

    const map: Record<string, string> = { ...readsSnapshot.map };
    const existingReadConversationIds = new Set(readsSnapshot.conversationIds);

    // Baseline reads only for conversations that have no read marker at all yet.
    if (opts?.baselineReads) {
      const missingAll = cleanedThreads
        .filter((t) => !existingReadConversationIds.has(t.conversationId))
        .map((t) => ({
          workspace_id: workspace.id,
          conversation_id: t.conversationId,
          user_id: user.id,
          last_read_at: (t.lastAt ? t.lastAt.toISOString() : new Date().toISOString()),
        }));

      const CHUNK = 1000;
      for (let i = 0; i < missingAll.length; i += CHUNK) {
        const batch = missingAll.slice(i, i + CHUNK);
        if (batch.length === 0) continue;
        const { error: upsertError } = await (supabase as any)
          .from('instagram_thread_reads')
          .upsert(batch, { onConflict: 'workspace_id,conversation_id,user_id' });
        if (upsertError) {
          console.warn('Baseline reads upsert failed:', upsertError);
          break;
        }
        for (const row of batch) {
          const convId = row?.conversation_id ? String(row.conversation_id) : null;
          const lastReadAt = row?.last_read_at ? String(row.last_read_at) : null;
          if (!convId) continue;
          existingReadConversationIds.add(convId);
          const nextIso = pickLatestIsoTimestamp(map[convId], lastReadAt);
          if (nextIso) map[convId] = nextIso;
        }
      }
    }

    setReadAtByConversationId(map);
  }, [workspace?.id, user?.id, isInstagramConnected, applyThreadOverrides, loadSharedThreadReads]);

	  const loadMessagesForThread = useCallback(async (t: Thread) => {
	    if (!workspace?.id) return;
	    const workspaceId = workspace.id;
	    const convId = t.conversationId;
	    const peerIdFromConversation =
	      t.instagramAccountId && convId && convId.startsWith(`${String(t.instagramAccountId)}:`)
	        ? convId.slice(`${String(t.instagramAccountId)}:`.length).trim()
	        : '';
	    const effectivePeerId = (() => {
	      const direct = t.peerId ? String(t.peerId) : '';
	      if (direct && !direct.startsWith('unknown:') && direct !== String(t.instagramAccountId || '')) return direct;
	      if (
	        peerIdFromConversation &&
	        !peerIdFromConversation.startsWith('unknown:') &&
	        peerIdFromConversation !== String(t.instagramAccountId || '')
	      ) {
	        return peerIdFromConversation;
	      }
	      return direct;
	    })();
	    const seq = ++messagesLoadSeqRef.current;

    const isStale = () => selectedConversationIdRef.current !== convId || seq !== messagesLoadSeqRef.current;
    setIsMessagesLoading(true);

    try {
      const safeArr = (v: any): any[] => (Array.isArray(v) ? v : []);
      const mergeUnique = (groups: any[][]): any[] => {
        const seen = new Set<string>();
        const out: any[] = [];
        for (const group of groups) {
          for (const m of safeArr(group)) {
            const k = m?.message_id ? String(m.message_id) : (m?.id ? String(m.id) : '');
            if (k) {
              if (seen.has(k)) continue;
              seen.add(k);
            }
            out.push(m);
          }
        }
        return out;
      };

	      const shouldQueryPeer =
	        Boolean(effectivePeerId) &&
	        !String(effectivePeerId).startsWith('unknown:') &&
	        Boolean(t.instagramAccountId) &&
	        String(effectivePeerId) !== String(t.instagramAccountId);

      // Load by conversation_key (precise) and by instagram_user_id (stable across legacy data),
      // then merge. This prevents "chat vanishes" when some rows have inconsistent conversation_key values.
      const byKeyPromise = (supabase as any)
        .from('instagram_messages')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('instagram_account_id', t.instagramAccountId)
        .eq('raw_payload->>conversation_key', convId)
        .order('message_timestamp', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true })
        .limit(2000);

	      const byPeerPromise = shouldQueryPeer
	        ? (supabase as any)
	            .from('instagram_messages')
	            .select('*')
	            .eq('workspace_id', workspaceId)
	            .eq('instagram_account_id', t.instagramAccountId)
	            .eq('instagram_user_id', effectivePeerId)
	            .order('message_timestamp', { ascending: true, nullsFirst: false })
	            .order('created_at', { ascending: true })
	            .limit(2000)
	        : Promise.resolve({ data: [], error: null });

	      const legacyPromise = shouldQueryPeer
	        ? (supabase as any)
	            .from('instagram_messages')
	            .select('*')
	            .eq('workspace_id', workspaceId)
	            .eq('instagram_account_id', t.instagramAccountId)
	            .is('raw_payload->>conversation_key', null)
	            .or(`sender_id.eq.${effectivePeerId},recipient_id.eq.${effectivePeerId},instagram_user_id.eq.${effectivePeerId}`)
	            .order('message_timestamp', { ascending: true, nullsFirst: false })
	            .order('created_at', { ascending: true })
	            .limit(2000)
	        : Promise.resolve({ data: [], error: null });

	      const byParticipantPromise = shouldQueryPeer
	        ? (supabase as any)
	            .from('instagram_messages')
	            .select('*')
	            .eq('workspace_id', workspaceId)
	            .eq('instagram_account_id', t.instagramAccountId)
	            .or(`sender_id.eq.${effectivePeerId},recipient_id.eq.${effectivePeerId}`)
	            .order('message_timestamp', { ascending: true, nullsFirst: false })
	            .order('created_at', { ascending: true })
	            .limit(2000)
	        : Promise.resolve({ data: [], error: null });

      const [byKeyRes, byPeerRes, legacyRes, byParticipantRes] = await Promise.all([
        byKeyPromise,
        byPeerPromise,
        legacyPromise,
        byParticipantPromise,
      ]);
      if (byKeyRes?.error) throw byKeyRes.error;

      const merged = mergeUnique([
        safeArr(byKeyRes?.data),
        safeArr(byPeerRes?.data),
        safeArr(legacyRes?.data),
        safeArr(byParticipantRes?.data),
      ]);
      const renderableMerged = merged.filter((row) => isRenderableIgMessageRow(row));
      if (renderableMerged.length > 0) {
        if (!isStale()) setSelectedMessages(renderableMerged);
        return;
      }

      // Secondary fallback: if thread has a known last message, load by the source conversation_id
      // seen on that message payload (covers legacy/misaligned conversation_key rows).
      if (t.lastMessageId) {
        const { data: anchorRow } = await (supabase as any)
          .from('instagram_messages')
          .select('raw_payload,instagram_account_id')
          .eq('workspace_id', workspaceId)
          .eq('message_id', String(t.lastMessageId))
          .maybeSingle();

        const sourceConversationId = anchorRow?.raw_payload?.conversation_id
          ? String(anchorRow.raw_payload.conversation_id)
          : null;

        if (sourceConversationId) {
          const { data: bySource, error: bySourceError } = await (supabase as any)
            .from('instagram_messages')
            .select('*')
            .eq('workspace_id', workspaceId)
            .eq('instagram_account_id', t.instagramAccountId)
            .eq('raw_payload->>conversation_id', sourceConversationId)
            .order('message_timestamp', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: true })
            .limit(2000);

          if (!bySourceError && Array.isArray(bySource) && bySource.length > 0) {
            if (!isStale()) setSelectedMessages(bySource);
            return;
          }
        }
      }

	      // Fallback: best-effort peer matching (covers older rows without `conversation_key`).
	      if (!effectivePeerId || String(effectivePeerId).startsWith('unknown:')) {
	        const { data: recentRows, error: recentError } = await (supabase as any)
	          .from('instagram_messages')
	          .select('*')
	          .eq('workspace_id', workspaceId)
	          .eq('instagram_account_id', t.instagramAccountId)
          .order('message_timestamp', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true })
          .limit(120);

        if (!recentError && Array.isArray(recentRows) && recentRows.length > 0) {
          if (!isStale()) setSelectedMessages(recentRows);
          return;
        }

        if (!isStale()) setSelectedMessages([]);
        return;
      }

	      const { data: fallback, error: fallbackError } = await (supabase as any)
	        .from('instagram_messages')
	        .select('*')
	        .eq('workspace_id', workspaceId)
	        .eq('instagram_account_id', t.instagramAccountId)
	        .or(`sender_id.eq.${effectivePeerId},recipient_id.eq.${effectivePeerId},instagram_user_id.eq.${effectivePeerId}`)
	        .order('message_timestamp', { ascending: true, nullsFirst: false })
	        .order('created_at', { ascending: true })
	        .limit(2000);

      if (fallbackError) throw fallbackError;
      const fallbackRows = Array.isArray(fallback) ? fallback : [];
      if (!isStale()) setSelectedMessages(fallbackRows);
    } catch (error: any) {
      if (isStale()) return;
      console.error('Load messages error:', error);
      setSelectedMessages([]);
    } finally {
      if (!isStale()) setIsMessagesLoading(false);
    }
  }, [workspace?.id]);

  // Keep the currently open thread feeling "instant", even if realtime isn't enabled.
  // This checks for a new latest message in Postgres and only reloads the full thread when it changes.
  useEffect(() => {
    if (!workspace?.id || !isInstagramConnected || !selectedThread) return;
    const workspaceId = workspace.id;
    const convId = selectedThread.conversationId;
    const accId = selectedThread.instagramAccountId;
    const peerId = selectedThread.peerId;

    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      try {
        let query = (supabase as any)
          .from('instagram_messages')
          .select('id,message_id,message_timestamp,created_at,raw_payload')
          .eq('workspace_id', workspaceId)
          .eq('instagram_account_id', accId)
          .not('message_id', 'is', null);

        // Prefer the stable peer column (prevents flicker when legacy rows have inconsistent conversation_key values).
        if (peerId) query = query.eq('instagram_user_id', peerId);
        else query = query.eq('raw_payload->>conversation_key', convId);

        const { data, error } = await query
          .order('message_timestamp', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(1);
        if (error) return;
        const row = Array.isArray(data) ? data[0] : null;
        const key = row?.message_id ? String(row.message_id) : row?.id ? String(row.id) : '';
        if (!key) return;
        if (key === lastKnownThreadMessageKeyRef.current) return;
        lastKnownThreadMessageKeyRef.current = key;
        loadMessagesForThread(selectedThread);
      } catch {
        // ignore
      }
    };

    const t = setTimeout(run, 900);
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      run();
    }, 1800);

    return () => {
      cancelled = true;
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [workspace?.id, isInstagramConnected, selectedThread?.conversationId, selectedThread?.instagramAccountId, selectedThread?.peerId, loadMessagesForThread]);

  const reactToMessage = useCallback(async (msg: any) => {
    if (!workspace?.id || !selectedThread) return;
    const peerId = selectedThread.peerId;
    if (!peerId || String(peerId).startsWith('unknown:')) {
      toast.error('Cannot react to messages in this thread yet.');
      return;
    }

    const targetMessageId = msg?.message_id ? String(msg.message_id) : '';
    if (!targetMessageId) {
      toast.error('This message cannot be reacted to.');
      return;
    }

    // Instagram does not allow reacting to your own outgoing message in this UI flow.
    if (String(msg?.direction || '') === 'outbound') {
      toast.error('You can only react to inbound messages.');
      return;
    }

    const cur = msg?.raw_payload?.my_reaction ? String(msg.raw_payload.my_reaction) : null;
    const mode = cur ? 'unreact' : 'react';

    setIsReacting(true);
    try {
      const { data, error } = await supabase.functions.invoke('instagram-connect', {
        body: {
          action: 'react-message',
          workspaceId: workspace.id,
          recipientId: peerId,
          messageId: targetMessageId,
          mode,
          reaction: 'love',
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to react');

      setSelectedMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((m) => {
          const mid = m?.message_id ? String(m.message_id) : '';
          if (mid !== targetMessageId) return m;
          const raw = m?.raw_payload && typeof m.raw_payload === 'object' ? m.raw_payload : {};
          return {
            ...m,
            raw_payload: {
              ...raw,
              my_reaction: mode === 'react' ? 'love' : null,
            },
          };
        })
      );
    } catch (e: any) {
      console.error('React error:', e);
      toast.error(e?.message || 'Failed to react');
    } finally {
      setIsReacting(false);
    }
  }, [workspace?.id, selectedThread]);

  const sendTextMessage = useCallback(async (rawText: string): Promise<boolean> => {
    if (!workspace?.id || !selectedThread) return false;
    const text = String(rawText || '').replace(/\s+/g, ' ').trim();
    if (!text) return false;
    if (!selectedThread.peerId || String(selectedThread.peerId).startsWith('unknown:')) {
      toast.error('This thread is read-only until Instagram resolves the lead ID. Ask the lead to send a fresh DM, then sync inbox.');
      return false;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('instagram-connect', {
        body: {
          action: 'send-message',
          workspaceId: workspace.id,
          recipientId: selectedThread.peerId,
          text,
          replyToMessageId: replyTo?.messageId || null,
          replyToText: replyTo?.preview || null,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to send message');

      setDraftMessage('');
      setReplyTo(null);

      const sentAt = data?.sentAt || new Date().toISOString();
      const messageId = data?.messageId || null;

      // Optimistic append (then reload to reconcile IDs/order).
      setSelectedMessages((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        {
          id: messageId || `local-${Date.now()}`,
          message_id: messageId,
          direction: 'outbound',
          message_text: text,
          message_timestamp: sentAt,
          raw_payload: {
            conversation_key: selectedThread.conversationId,
            sent_via: 'api',
            reply_to_message_id: replyTo?.messageId || null,
            reply_to_text: replyTo?.preview || null,
          },
        },
      ]);

      const atMs = parseTimestampMsLoose(sentAt) || Date.now();
      upsertMessagePreview(selectedThread.conversationId, { atMs, messageId, direction: 'outbound', text });
      setThreadOverride(
        selectedThread.conversationId,
        {
          lastAt: new Date(atMs),
          lastText: text,
          lastDirection: 'outbound',
          lastMessageId: messageId,
        },
        12_000
      );

      // Refresh thread list + messages.
      await reloadInbox();
      await loadMessagesForThread(selectedThread);

      if (pendingReminderStamp?.meetingId && workspace?.id) {
        const stampField =
          pendingReminderStamp.kind === '24h' ? 'reminder_24h_sent_at' : 'reminder_1h_sent_at';
        const { error: stampError } = await (supabase as any)
          .from('meetings')
          .update({ [stampField]: new Date().toISOString() })
          .eq('workspace_id', workspace.id)
          .eq('id', pendingReminderStamp.meetingId);

        if (stampError) {
          console.warn('Failed to stamp meeting reminder send:', stampError);
        } else {
          setPendingReminderStamp(null);
          const next = new URLSearchParams(urlSearchParams);
          next.delete('msg');
          next.delete('reminderMeeting');
          next.delete('reminderKind');
          setUrlSearchParams(next, { replace: true });
        }
      }

      return true;
    } catch (e: any) {
      console.error('Send message error:', e);
      toast.error(e?.message || 'Failed to send message');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [
    workspace?.id,
    selectedThread,
    replyTo,
    reloadInbox,
    loadMessagesForThread,
    upsertMessagePreview,
    setThreadOverride,
    pendingReminderStamp,
    urlSearchParams,
    setUrlSearchParams,
  ]);

			  const sendImageAttachment = useCallback(async (file: File): Promise<boolean> => {
			    if (!workspace?.id || !selectedThread) return false;
			    if (!file) return false;
			    if (!selectedThread.peerId || String(selectedThread.peerId).startsWith('unknown:')) {
			      toast.error('This thread is read-only until Instagram resolves the lead ID. Ask the lead to send a fresh DM, then sync inbox.');
		      return false;
		    }

	    const MAX_BYTES = 10 * 1024 * 1024;
	    if (!String(file.type || '').toLowerCase().startsWith('image/')) {
	      toast.error('Only image attachments are supported for now.');
	      return false;
	    }
	    const rawType = String(file.type || '').toLowerCase();
	    if (rawType.includes('heic') || rawType.includes('heif')) {
	      // Many browsers and the Meta API are flaky with HEIC/HEIF. We can only support it if the browser
	      // can decode and we re-encode. If decoding fails below, we show a helpful message.
	    }

			    setIsSending(true);
			    try {
			      // Meta is most reliable with JPG/PNG. If the user selects something else (webp/gif/heic),
			      // we try to re-encode to JPEG client-side to avoid "media fetch / unsupported" errors.
			      const normalizeForMeta = async (input: File): Promise<File> => {
			        const t = String(input.type || '').toLowerCase();
			        if (t === 'image/jpeg' || t === 'image/png') return input;

			        // If the browser can't decode it (common for HEIC), bail with a clear error.
			        let bmp: ImageBitmap | null = null;
			        try {
			          bmp = await createImageBitmap(input);
			        } catch {
			          if (t.includes('heic') || t.includes('heif')) {
			            throw new Error('HEIC images are not supported yet. Please upload a JPG or PNG.');
			          }
			          return input;
			        }

			        try {
			          const canvas = document.createElement('canvas');
			          canvas.width = bmp.width;
			          canvas.height = bmp.height;
			          const ctx = canvas.getContext('2d');
			          if (!ctx) return input;
			          ctx.drawImage(bmp, 0, 0);

			          const blob = await new Promise<Blob>((resolve, reject) => {
			            canvas.toBlob(
			              (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
			              'image/jpeg',
			              0.92
			            );
			          });

			          const base = (input.name || 'image').replace(/\.[^/.]+$/, '') || 'image';
			          return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
			        } finally {
			          try {
			            (bmp as any)?.close?.();
			          } catch {
			            // ignore
			          }
			        }
			      };

			      const normalizedFile = await normalizeForMeta(file);
			      if (normalizedFile.size > MAX_BYTES) {
			        toast.error('Image must be 10MB or smaller.');
			        return false;
			      }

			      const form = new FormData();
			      form.append('action', 'send-image-multipart');
			      form.append('workspaceId', workspace.id);
			      form.append('recipientId', String(selectedThread.peerId));
			      form.append('file', normalizedFile, normalizedFile.name || 'image.jpg');

			      const { data, error } = await authedInvoke('instagram-connect', { body: form });
		
		      if (error) throw error;
		      if (!data?.success) throw new Error(data?.error || 'Failed to send image');

      const messageId = data?.messageId ? String(data.messageId) : null;
      const sentAt = data?.sentAt ? String(data.sentAt) : new Date().toISOString();
      const imageUrl = data?.imageUrl ? String(data.imageUrl) : null;

      setPendingImageFile(null);
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
      setReplyTo(null);

      const storedAttachments = imageUrl
        ? [
            {
              type: 'image',
              source_url: imageUrl,
              public_url: imageUrl,
              content_type: file.type || null,
              size: file.size,
            },
          ]
        : [];

      // Optimistic append (then reload to reconcile IDs/order).
      setSelectedMessages((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        {
          id: messageId || `local-${Date.now()}`,
          message_id: messageId,
          direction: 'outbound',
          message_text: null,
          message_timestamp: sentAt,
          raw_payload: {
            conversation_key: selectedThread.conversationId,
            sent_via: 'api',
            stored_attachments: storedAttachments,
          },
        },
      ]);

      const atMs = parseTimestampMsLoose(sentAt) || Date.now();
      upsertMessagePreview(selectedThread.conversationId, { atMs, messageId, direction: 'outbound', text: 'Photo' });
      setThreadOverride(
        selectedThread.conversationId,
        {
          lastAt: new Date(atMs),
          lastText: 'Photo',
          lastDirection: 'outbound',
          lastMessageId: messageId,
        },
        12_000
      );

      await reloadInbox();
      await loadMessagesForThread(selectedThread);
      return true;
	    } catch (e: any) {
	      console.error('Send image error:', e);
	      let pretty = '';
	      const ctx = (e as any)?.context as Response | undefined;
	      if (ctx) {
	        try {
	          const payload = await ctx.clone().json();
	          const top = String((payload as any)?.error || (payload as any)?.message || '').trim();
	          const details = (payload as any)?.details;
	          const metaMsg =
	            String(
	              details?.message ||
	                details?.error?.message ||
	                details?.error?.error_user_msg ||
	                details?.error_user_msg ||
	                ''
	            ).trim();
	          if (top && metaMsg) pretty = `${top}: ${metaMsg}`;
	          else if (top) pretty = top;
	          else if (metaMsg) pretty = metaMsg;
	        } catch {
	          // ignore
	        }
	        if (!pretty) {
	          try {
	            const text = String(await ctx.clone().text()).trim();
	            if (text) pretty = text;
	          } catch {
	            // ignore
	          }
	        }
	        if (!pretty && Number.isFinite((ctx as any)?.status)) {
	          pretty = `Failed to send image (HTTP ${(ctx as any).status})`;
	        }
	      }
	      toast.error(pretty || e?.message || 'Failed to send image');
	      return false;
		    } finally {
		      setIsSending(false);
		    }
		  }, [workspace?.id, user?.id, selectedThread, reloadInbox, loadMessagesForThread, upsertMessagePreview, setThreadOverride]);

  const sendFromComposer = useCallback(async () => {
    const text = draftMessage.replace(/\s+/g, ' ').trim();
    const file = pendingImageFile;
    if (!text && !file) return;
    if (isSending) return;

    const ok = file ? await sendImageAttachment(file) : true;
    if (ok && text) {
      await sendTextMessage(text);
    }
  }, [draftMessage, pendingImageFile, isSending, sendImageAttachment, sendTextMessage]);

  const loadWorkspaceBookingUrl = useCallback(async (): Promise<string | null> => {
    if (!workspace?.id) return null;
    if (isBookingLinkBusy) return null;
    setIsBookingLinkBusy(true);
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('booking_url')
        .eq('id', workspace.id)
        .maybeSingle();

      if (error) throw error;

      const url = data?.booking_url ? String((data as any).booking_url).trim() : '';
      if (!url) {
        toast.error('Set your booking URL in Settings → Integrations.');
        return null;
      }

      return url;
    } catch (e: any) {
      console.error('Load booking URL error:', e);
      const raw = String(e?.message || '').toLowerCase();
      if (raw.includes('booking_url') && raw.includes('column')) {
        toast.error('Missing DB column `booking_url`. Run migration `20260217213000_booking_links_inbox.sql`.');
      } else {
        toast.error(e?.message || 'Failed to load booking URL');
      }
      return null;
    } finally {
      setIsBookingLinkBusy(false);
    }
  }, [workspace?.id, isBookingLinkBusy]);

  const copyBookingLink = useCallback(async () => {
    const url = await loadWorkspaceBookingUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Booking link copied');
      setBookCallPopoverOpen(false);
    } catch {
      toast.error('Copy failed');
    }
  }, [loadWorkspaceBookingUrl]);

  const sendBookingLink = useCallback(async () => {
    const url = await loadWorkspaceBookingUrl();
    if (!url) return;
    setBookCallPopoverOpen(false);
    // Send the direct booking URL (no ACQ redirect page) for the smoothest lead experience.
    await sendTextMessage(url);
  }, [loadWorkspaceBookingUrl, sendTextMessage]);

  const scheduleCallFromInbox = useCallback(() => {
    if (!selectedThread?.conversationId) return;
    const next = new URLSearchParams();
    next.set('create', '1');
    next.set('conversation', selectedThread.conversationId);
    navigate(`/meetings?${next.toString()}`);
    setBookCallPopoverOpen(false);
  }, [navigate, selectedThread?.conversationId]);

	  const markThreadRead = useCallback(async (conversationId: string, at?: Date | null) => {
	    if (!workspace?.id || !user?.id) return;
	    const iso = (at ? at.toISOString() : new Date().toISOString());
	    setReadAtByConversationId((prev) => {
	      const base = prev || {};
	      const nextIso = pickLatestIsoTimestamp(base[conversationId], iso);
	      if (!nextIso) return prev;
	      if (prev && base[conversationId] === nextIso) return prev;
	      return { ...base, [conversationId]: nextIso };
	    });
	    setThreads((prev) =>
	      prev.map((t) =>
	        t.conversationId === conversationId
	          ? {
	              ...t,
	              sharedLastReadAt: (() => {
	                const nextIso = pickLatestIsoTimestamp(t.sharedLastReadAt ? t.sharedLastReadAt.toISOString() : null, iso);
	                return nextIso ? new Date(nextIso) : t.sharedLastReadAt;
	              })(),
	            }
	          : t
	      )
	    );

	    const [{ error: readError }, { error: threadError }] = await Promise.all([
	      (supabase as any)
	        .from('instagram_thread_reads')
	        .upsert(
	          {
	            workspace_id: workspace.id,
	            conversation_id: conversationId,
	            user_id: user.id,
	            last_read_at: iso,
	          },
	          { onConflict: 'workspace_id,conversation_id,user_id' }
	        ),
	      (supabase as any)
	        .from('instagram_threads')
	        .update({ shared_last_read_at: iso })
	        .eq('workspace_id', workspace.id)
	        .eq('conversation_id', conversationId),
	    ]);

	    if (readError) console.warn('Mark read failed:', readError);
	    if (threadError) {
	      const msg = `${String(threadError?.message || '')} ${String(threadError?.details || '')}`.toLowerCase();
	      // Backward compatibility while migration is rolling out.
	      if (!(msg.includes('shared_last_read_at') && (msg.includes('column') || msg.includes('does not exist')))) {
	        console.warn('Update shared thread read marker failed:', threadError);
	      }
	    }
	  }, [workspace?.id, user?.id]);

  const getThreadMutationErrorMessage = useCallback((error: any, fallback: string) => {
    const rawMessage = String(error?.message || error?.details || '').trim();
    const haystack = `${rawMessage} ${String(error?.hint || '')}`.toLowerCase();

    if (haystack.includes('failed to send a request to the edge function')) {
      return `Edge Function unreachable for project ${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'unknown'}. Deploy functions to this exact project and retry.`;
    }
    if (haystack.includes('lead_status')) {
      return 'Missing DB column `lead_status`. Run migration `20260211100000_mochi_inbox_features.sql` on the same Supabase project used by this app.';
    }
    if (haystack.includes('assigned_user_id')) {
      return 'Missing DB column `assigned_user_id`. Run migration `20260211100000_mochi_inbox_features.sql` on the same Supabase project used by this app.';
    }
    if (haystack.includes('is_spam')) {
      return 'Missing DB column `is_spam`. Run migration `20260210153000_instagram_threads_spam.sql` on the same Supabase project used by this app.';
    }
    if (haystack.includes('priority_snoozed_until') || haystack.includes('priority_followed_up_at')) {
      return 'Missing priority workflow columns. Run migration `20260211100000_mochi_inbox_features.sql` on the same Supabase project used by this app.';
    }
    if (haystack.includes('hidden_from_setters') || haystack.includes('shared_with_setters')) {
      return 'Missing privacy columns for setter mode. Run migration `20260212201000_setter_workspace_enforcement.sql` on the same Supabase project used by this app.';
    }
    if (haystack.includes('row-level security') || haystack.includes('permission denied')) {
      return 'RLS blocked this action. Ensure your user is a member of the current workspace in `workspace_members` and thread policies are applied.';
    }
    if (haystack.includes('instagram_threads') && haystack.includes('does not exist')) {
      return 'Table `instagram_threads` does not exist in this project. Run migration `20260210120000_instagram_threads_users_reads.sql`.';
    }

    return rawMessage || fallback;
  }, []);

  const ensureThreadRow = useCallback(async (t: Thread) => {
    if (!workspace?.id) return { error: new Error('Workspace missing') };
    const { error } = await (supabase as any)
      .from('instagram_threads')
      .upsert(
        {
          workspace_id: workspace.id,
          instagram_account_id: t.instagramAccountId,
          conversation_id: t.conversationId,
          instagram_user_id: t.peerId,
          peer_username: t.peerUsername,
          peer_name: t.peerName,
          peer_profile_picture_url: t.peerPicture,
          priority: Boolean(t.priority),
          hidden_from_setters: Boolean(t.hiddenFromSetters),
          shared_with_setters: Boolean(t.sharedWithSetters),
          assigned_user_id: t.assignedUserId,
          last_message_id: t.lastMessageId,
          last_message_text: t.lastText,
          last_message_direction: t.lastDirection,
          last_message_at: t.lastAt ? t.lastAt.toISOString() : null,
        },
        { onConflict: 'workspace_id,conversation_id' }
      );

    return { error };
  }, [workspace?.id]);

  const updateThreadWithFallback = useCallback(async (t: Thread, payload: Record<string, any>) => {
    if (!workspace?.id) return { error: new Error('Workspace missing') };

    const runUpdate = async () =>
      await (supabase as any)
        .from('instagram_threads')
        .update(payload)
        .eq('workspace_id', workspace.id)
        .eq('conversation_id', t.conversationId)
        .select('conversation_id')
        .maybeSingle();

    let result = await runUpdate();
    if (result.error) return { error: result.error };
    if (result.data) return { error: null };

    // Conversation visible from fallback messages but missing in instagram_threads.
    const ensured = await ensureThreadRow(t);
    if (ensured.error) return { error: ensured.error };

    result = await runUpdate();
    if (result.error) return { error: result.error };
    if (!result.data) return { error: new Error('Conversation row not found in instagram_threads') };

    return { error: null };
  }, [workspace?.id, ensureThreadRow]);

  const logAudit = useCallback(async (
    conversationId: string,
    action: string,
    details?: Record<string, unknown>
  ) => {
    if (!workspace?.id || !user?.id) return;
    try {
      await (supabase as any).from('instagram_thread_audit_log').insert({
        workspace_id: workspace.id,
        conversation_id: conversationId,
        action,
        actor_user_id: user.id,
        details: details || {},
      });
    } catch {
      // ignore
    }
  }, [workspace?.id, user?.id]);

  const logBulkAudit = useCallback(async (
    conversationIds: string[],
    action: string,
    details?: Record<string, unknown>
  ) => {
    if (!workspace?.id || !user?.id || conversationIds.length === 0) return;
    try {
      await (supabase as any).from('instagram_thread_audit_log').insert(
        conversationIds.map((conversationId) => ({
          workspace_id: workspace.id,
          conversation_id: conversationId,
          action,
          actor_user_id: user.id,
          details: details || {},
        }))
      );
    } catch {
      // ignore
    }
  }, [workspace?.id, user?.id]);

  const bulkAssignVisible = useCallback(async (assignedUserId: string | null) => {
    if (!workspace?.id) return;
    const targets = (visibleThreads as any[])
      .map((t) => t as Thread)
      .filter((t) => String(t.leadStatus || 'open') !== 'removed')
      .slice(0, 200);
    const conversationIds = targets.map((t) => t.conversationId);
    if (conversationIds.length === 0) {
      toast.message('No conversations available for bulk assign.');
      return;
    }

    const prevStateById: Record<
      string,
      { assignedUserId: string | null; hiddenFromSetters: boolean; sharedWithSetters: boolean }
    > = {};
    for (const t of targets) {
      prevStateById[t.conversationId] = {
        assignedUserId: t.assignedUserId || null,
        hiddenFromSetters: Boolean(t.hiddenFromSetters),
        sharedWithSetters: Boolean(t.sharedWithSetters),
      };
    }

    setIsBulkMutating(true);
    const patch: Partial<Thread> = { assignedUserId };
    // If you're assigning a conversation to a setter, it can't remain private; the DB trigger will
    // null `assigned_user_id` when `hidden_from_setters = true`.
    if (assignedUserId) {
      patch.hiddenFromSetters = false;
      patch.sharedWithSetters = true;
    }
    setThreads((prev) =>
      prev.map((t) =>
        conversationIds.includes(t.conversationId) ? { ...t, ...patch } : t
      )
    );

    try {
      const updatePayload: Record<string, any> = { assigned_user_id: assignedUserId };
      if (assignedUserId) {
        updatePayload.hidden_from_setters = false;
        updatePayload.shared_with_setters = true;
      }
      const { error } = await (supabase as any)
        .from('instagram_threads')
        .update(updatePayload)
        .eq('workspace_id', workspace.id)
        .in('conversation_id', conversationIds);
      if (error) throw error;

      await logBulkAudit(conversationIds, 'bulk_assign', {
        next_assigned_user_id: assignedUserId,
      });
      toast.success(`Assigned ${conversationIds.length} conversations`);
    } catch (error: any) {
      setThreads((prev) =>
        prev.map((t) =>
          conversationIds.includes(t.conversationId)
            ? {
                ...t,
                assignedUserId: prevStateById[t.conversationId]?.assignedUserId ?? null,
                hiddenFromSetters: prevStateById[t.conversationId]?.hiddenFromSetters ?? Boolean(t.hiddenFromSetters),
                sharedWithSetters: prevStateById[t.conversationId]?.sharedWithSetters ?? Boolean(t.sharedWithSetters),
              }
            : t
        )
      );
      toast.error(getThreadMutationErrorMessage(error, 'Failed bulk assign'));
    } finally {
      setIsBulkMutating(false);
    }
  }, [workspace?.id, visibleThreads, logBulkAudit, getThreadMutationErrorMessage]);

  const bulkSetSpamVisible = useCallback(async (nextSpam: boolean) => {
    if (!workspace?.id) return;
    if (!supportsSpam) {
      toast.error('Spam filter is not enabled yet (run the is_spam migration).');
      return;
    }
    const targets = (visibleThreads as any[])
      .map((t) => t as Thread)
      .filter((t) => String(t.leadStatus || 'open') !== 'removed')
      .slice(0, 200);
    const conversationIds = targets.map((t) => t.conversationId);
    if (conversationIds.length === 0) {
      toast.message('No conversations available for bulk spam update.');
      return;
    }

    const prevSpamById: Record<string, boolean> = {};
    for (const t of targets) prevSpamById[t.conversationId] = Boolean(t.isSpam);

    setIsBulkMutating(true);
    setThreads((prev) =>
      prev.map((t) =>
        conversationIds.includes(t.conversationId) ? { ...t, isSpam: nextSpam } : t
      )
    );

    try {
      const { error } = await (supabase as any)
        .from('instagram_threads')
        .update({ is_spam: nextSpam })
        .eq('workspace_id', workspace.id)
        .in('conversation_id', conversationIds);
      if (error) throw error;

      await logBulkAudit(conversationIds, nextSpam ? 'bulk_mark_spam' : 'bulk_unspam', {
        is_spam: nextSpam,
      });
      toast.success(`${nextSpam ? 'Marked spam' : 'Unspammed'} ${conversationIds.length} conversations`);
    } catch (error: any) {
      setThreads((prev) =>
        prev.map((t) =>
          conversationIds.includes(t.conversationId)
            ? { ...t, isSpam: prevSpamById[t.conversationId] }
            : t
        )
      );
      toast.error(getThreadMutationErrorMessage(error, 'Failed bulk spam update'));
    } finally {
      setIsBulkMutating(false);
    }
  }, [workspace?.id, supportsSpam, visibleThreads, logBulkAudit, getThreadMutationErrorMessage]);

  const bulkSetPriorityVisible = useCallback(async (nextPriority: boolean) => {
    if (!workspace?.id) return;
    const targets = (visibleThreads as any[])
      .map((t) => t as Thread)
      .filter((t) => String(t.leadStatus || 'open') !== 'removed')
      .slice(0, 200);
    const conversationIds = targets.map((t) => t.conversationId);
    if (conversationIds.length === 0) {
      toast.message('No conversations available for bulk priority update.');
      return;
    }

    const prevPriorityById: Record<string, { priority: boolean; prioritySnoozedUntil: Date | null }> = {};
    for (const t of targets) {
      prevPriorityById[t.conversationId] = {
        priority: Boolean(t.priority),
        prioritySnoozedUntil: t.prioritySnoozedUntil || null,
      };
    }

    setIsBulkMutating(true);
    setThreads((prev) =>
      prev.map((t) =>
        conversationIds.includes(t.conversationId)
          ? { ...t, priority: nextPriority, ...(nextPriority ? {} : { prioritySnoozedUntil: null }) }
          : t
      )
    );

    try {
      const payload: Record<string, any> = { priority: nextPriority };
      if (!nextPriority) payload.priority_snoozed_until = null;
      const { error } = await (supabase as any)
        .from('instagram_threads')
        .update(payload)
        .eq('workspace_id', workspace.id)
        .in('conversation_id', conversationIds);
      if (error) throw error;

      await logBulkAudit(conversationIds, nextPriority ? 'bulk_pin' : 'bulk_unpin', {
        priority: nextPriority,
      });
      toast.success(`${nextPriority ? 'Pinned' : 'Unpinned'} ${conversationIds.length} conversations`);
    } catch (error: any) {
      setThreads((prev) =>
        prev.map((t) =>
          conversationIds.includes(t.conversationId)
            ? {
                ...t,
                priority: prevPriorityById[t.conversationId]?.priority ?? false,
                prioritySnoozedUntil: prevPriorityById[t.conversationId]?.prioritySnoozedUntil ?? null,
              }
            : t
        )
      );
      toast.error(getThreadMutationErrorMessage(error, 'Failed bulk priority update'));
    } finally {
      setIsBulkMutating(false);
    }
  }, [workspace?.id, visibleThreads, logBulkAudit, getThreadMutationErrorMessage]);

  const togglePriority = useCallback(async (t: Thread) => {
    if (!workspace?.id) return;
    const next = !t.priority;

    setThreads((prev) =>
      prev.map((x) =>
        x.conversationId === t.conversationId
          ? {
              ...x,
              priority: next,
              ...(next ? {} : { prioritySnoozedUntil: null }),
            }
          : x
      )
    );
    setThreadOverride(t.conversationId, {
      priority: next,
      ...(next ? {} : { prioritySnoozedUntil: null }),
    });

    const updateResult = await updateThreadWithFallback(t, {
      priority: next,
      ...(next ? {} : { priority_snoozed_until: null }),
    });

    if (updateResult.error) {
      console.warn('Priority update failed:', updateResult.error);
      // revert
      setThreads((prev) =>
        prev.map((x) => (x.conversationId === t.conversationId ? { ...x, priority: !next } : x))
      );
      clearThreadOverride(t.conversationId);
      toast.error(getThreadMutationErrorMessage(updateResult.error, 'Failed to update Priority'));
      return;
    }
    clearThreadOverride(t.conversationId);
    logAudit(t.conversationId, next ? 'pin' : 'unpin', { priority: next });
  }, [workspace?.id, setThreadOverride, clearThreadOverride, updateThreadWithFallback, getThreadMutationErrorMessage, logAudit]);

  const toggleSpam = useCallback(async (t: Thread) => {
    if (!workspace?.id) return;
    if (!supportsSpam) {
      toast.error('Spam filter is not enabled yet (run the is_spam migration).');
      return;
    }
    const next = !t.isSpam;

    setThreads((prev) =>
      prev.map((x) => (x.conversationId === t.conversationId ? { ...x, isSpam: next } : x))
    );
    setThreadOverride(t.conversationId, { isSpam: next });

    const updateResult = await updateThreadWithFallback(t, { is_spam: next });

    if (updateResult.error) {
      console.warn('Spam update failed:', updateResult.error);
      setThreads((prev) =>
        prev.map((x) => (x.conversationId === t.conversationId ? { ...x, isSpam: !next } : x))
      );
      clearThreadOverride(t.conversationId);
      toast.error(getThreadMutationErrorMessage(updateResult.error, 'Failed to update Spam'));
      return;
    }
    clearThreadOverride(t.conversationId);
    logAudit(t.conversationId, next ? 'mark_spam' : 'unspam', { is_spam: next });
  }, [workspace?.id, supportsSpam, setThreadOverride, clearThreadOverride, updateThreadWithFallback, getThreadMutationErrorMessage, logAudit]);

  const setLeadStatus = useCallback(async (t: Thread, nextStatus: Thread['leadStatus']) => {
    if (!workspace?.id) return;
    const prevStatus = t.leadStatus;

    setThreads((prev) =>
      prev.map((x) =>
        x.conversationId === t.conversationId
          ? {
              ...x,
              leadStatus: nextStatus,
            }
          : x
      )
    );

    const payload: Record<string, any> = { lead_status: nextStatus };
    if (nextStatus === 'qualified') {
      payload.qualified_at = new Date().toISOString();
      payload.removed_at = null;
    }
    if (nextStatus === 'removed') {
      payload.removed_at = new Date().toISOString();
      payload.qualified_at = null;
    }
    if (nextStatus === 'open') {
      payload.qualified_at = null;
      payload.removed_at = null;
    }

    const updateResult = await updateThreadWithFallback(t, payload);

    if (updateResult.error) {
      setThreads((prev) =>
        prev.map((x) => (x.conversationId === t.conversationId ? { ...x, leadStatus: prevStatus } : x))
      );
      toast.error(getThreadMutationErrorMessage(updateResult.error, 'Failed to update lead status'));
      return;
    }

    logAudit(t.conversationId, `status_${nextStatus}`, {
      previous_status: prevStatus,
      next_status: nextStatus,
    });
  }, [workspace?.id, updateThreadWithFallback, getThreadMutationErrorMessage, logAudit]);

  const assignThread = useCallback(async (t: Thread, assignedUserId: string | null) => {
    if (userRole !== 'owner') {
      toast.error('Only workspace owners can assign conversations.');
      return;
    }
    if (!workspace?.id) return;
    const prevState = {
      assignedUserId: t.assignedUserId,
      hiddenFromSetters: t.hiddenFromSetters,
      sharedWithSetters: t.sharedWithSetters,
    };

    const nextHidden = assignedUserId ? false : t.hiddenFromSetters;
    const nextShared = assignedUserId ? true : t.sharedWithSetters;

    setThreads((prev) =>
      prev.map((x) =>
        x.conversationId === t.conversationId
          ? {
              ...x,
              assignedUserId,
              ...(assignedUserId
                ? {
                    hiddenFromSetters: nextHidden,
                    sharedWithSetters: nextShared,
                  }
                : {}),
            }
          : x
      )
    );

    setThreadOverride(
      t.conversationId,
      {
        assignedUserId,
        ...(assignedUserId
          ? {
              hiddenFromSetters: nextHidden,
              sharedWithSetters: nextShared,
            }
          : {}),
      },
      12000
    );

    const payload: Record<string, any> = { assigned_user_id: assignedUserId };
    if (assignedUserId) {
      payload.hidden_from_setters = false;
      payload.shared_with_setters = true;
    }

    const updateResult = await updateThreadWithFallback(t, payload);

    if (updateResult.error) {
      setThreads((prev) =>
        prev.map((x) =>
          x.conversationId === t.conversationId
            ? {
                ...x,
                assignedUserId: prevState.assignedUserId,
                hiddenFromSetters: prevState.hiddenFromSetters,
                sharedWithSetters: prevState.sharedWithSetters,
              }
            : x
        )
      );
      clearThreadOverride(t.conversationId);
      toast.error(getThreadMutationErrorMessage(updateResult.error, 'Failed to assign conversation'));
      return;
    }

    clearThreadOverride(t.conversationId);
    logAudit(t.conversationId, 'assign', {
      previous_assigned_user_id: prevState.assignedUserId,
      next_assigned_user_id: assignedUserId,
    });
  }, [workspace?.id, userRole, setThreadOverride, clearThreadOverride, updateThreadWithFallback, getThreadMutationErrorMessage, logAudit]);

  const setThreadSetterVisibility = useCallback(
    async (
      t: Thread,
      updates: {
        hiddenFromSetters?: boolean;
        sharedWithSetters?: boolean;
      }
    ) => {
      if (userRole !== 'owner') {
        toast.error('Only workspace owners can change lead privacy.');
        return;
      }
      if (!workspace?.id) return;

      const nextHidden =
        typeof updates.hiddenFromSetters === 'boolean'
          ? updates.hiddenFromSetters
          : t.hiddenFromSetters;
      // Product decision: setters can see all leads by default. "Private lead" is the only control,
      // so whenever a lead is NOT private we force `shared_with_setters = true`.
      const nextSharedRaw =
        typeof updates.hiddenFromSetters === 'boolean'
          ? !updates.hiddenFromSetters
          : typeof updates.sharedWithSetters === 'boolean'
            ? updates.sharedWithSetters
            : t.sharedWithSetters;
      const nextShared = nextHidden ? false : Boolean(nextSharedRaw);

      const prevState = {
        hiddenFromSetters: t.hiddenFromSetters,
        sharedWithSetters: t.sharedWithSetters,
        assignedUserId: t.assignedUserId,
      };

      setThreads((prev) =>
        prev.map((x) =>
          x.conversationId === t.conversationId
            ? {
                ...x,
                hiddenFromSetters: nextHidden,
                sharedWithSetters: nextShared,
                assignedUserId: nextHidden ? null : x.assignedUserId,
              }
            : x
        )
      );

      const payload: Record<string, any> = {
        hidden_from_setters: nextHidden,
        shared_with_setters: nextShared,
      };
      if (nextHidden) {
        payload.assigned_user_id = null;
      }

      const updateResult = await updateThreadWithFallback(t, payload);
      if (updateResult.error) {
        setThreads((prev) =>
          prev.map((x) =>
            x.conversationId === t.conversationId
              ? {
                  ...x,
                  hiddenFromSetters: prevState.hiddenFromSetters,
                  sharedWithSetters: prevState.sharedWithSetters,
                  assignedUserId: prevState.assignedUserId,
                }
              : x
          )
        );
        toast.error(getThreadMutationErrorMessage(updateResult.error, 'Failed to update lead privacy'));
        return;
      }

      await logAudit(t.conversationId, 'visibility_update', {
        previous_hidden_from_setters: prevState.hiddenFromSetters,
        next_hidden_from_setters: nextHidden,
        previous_shared_with_setters: prevState.sharedWithSetters,
        next_shared_with_setters: nextShared,
      });
    },
    [workspace?.id, userRole, updateThreadWithFallback, getThreadMutationErrorMessage, logAudit]
  );

  const snoozePriority24h = useCallback(async (t: Thread) => {
    if (!workspace?.id) return;
    const snoozedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

    setThreads((prev) =>
      prev.map((x) =>
        x.conversationId === t.conversationId ? { ...x, prioritySnoozedUntil: snoozedUntil } : x
      )
    );

    const updateResult = await updateThreadWithFallback(t, { priority_snoozed_until: snoozedUntil.toISOString() });

    if (updateResult.error) {
      setThreads((prev) =>
        prev.map((x) =>
          x.conversationId === t.conversationId ? { ...x, prioritySnoozedUntil: t.prioritySnoozedUntil } : x
        )
      );
      toast.error(getThreadMutationErrorMessage(updateResult.error, 'Failed to snooze'));
      return;
    }

    logAudit(t.conversationId, 'priority_snooze_24h', {
      snoozed_until: snoozedUntil.toISOString(),
    });
  }, [workspace?.id, updateThreadWithFallback, getThreadMutationErrorMessage, logAudit]);

  const markPriorityFollowedUp = useCallback(async (t: Thread) => {
    if (!workspace?.id) return;
    const nowIso = new Date().toISOString();

    setThreads((prev) =>
      prev.map((x) =>
        x.conversationId === t.conversationId
          ? { ...x, priorityFollowedUpAt: new Date(nowIso), prioritySnoozedUntil: null }
          : x
      )
    );

    const updateResult = await updateThreadWithFallback(t, {
      priority_followed_up_at: nowIso,
      priority_snoozed_until: null,
    });

    if (updateResult.error) {
      setThreads((prev) =>
        prev.map((x) =>
          x.conversationId === t.conversationId
            ? { ...x, priorityFollowedUpAt: t.priorityFollowedUpAt, prioritySnoozedUntil: t.prioritySnoozedUntil }
            : x
        )
      );
      toast.error(getThreadMutationErrorMessage(updateResult.error, 'Failed to mark followed up'));
      return;
    }

    logAudit(t.conversationId, 'priority_followed_up', { at: nowIso });
  }, [workspace?.id, updateThreadWithFallback, getThreadMutationErrorMessage, logAudit]);

  const toggleTagOnThread = useCallback(async (conversationId: string, tagId: string) => {
    if (!workspace?.id || !user?.id) return;
    const current = new Set(conversationTagIds[conversationId] || []);
    const hasTag = current.has(tagId);
    const prevIds = conversationTagIds[conversationId] || [];

    setConversationTagIds((prev) => {
      const next = { ...prev };
      const items = new Set(next[conversationId] || []);
      if (hasTag) items.delete(tagId);
      else items.add(tagId);
      next[conversationId] = Array.from(items);
      return next;
    });

    if (hasTag) {
      const { error } = await (supabase as any)
        .from('instagram_conversation_tags')
        .delete()
        .eq('workspace_id', workspace.id)
        .eq('conversation_id', conversationId)
        .eq('tag_id', tagId);
      if (error) {
        setConversationTagIds((prev) => ({ ...prev, [conversationId]: prevIds }));
        toast.error(error?.message || 'Failed to remove tag');
        return;
      }
      logAudit(conversationId, 'remove_tag', { tag_id: tagId });
      return;
    }

    const { error } = await (supabase as any)
      .from('instagram_conversation_tags')
      .insert({
        workspace_id: workspace.id,
        conversation_id: conversationId,
        tag_id: tagId,
        source: 'manual',
        created_by: user.id,
      });
    if (error && String(error?.code || '') !== '23505') {
      setConversationTagIds((prev) => ({ ...prev, [conversationId]: prevIds }));
      toast.error(error?.message || 'Failed to apply tag');
      return;
    }
    logAudit(conversationId, 'apply_tag', { tag_id: tagId });
  }, [workspace?.id, user?.id, conversationTagIds, logAudit]);

  const createCustomTag = useCallback(async () => {
    if (!workspace?.id || !user?.id || !selectedThread) return;
    const name = newCustomTagName.trim();
    if (!name) {
      toast.error('Tag name is required');
      return;
    }

    setIsCreatingCustomTag(true);
    try {
      const existing = tags.find((t) => normalizeTagName(t.name) === normalizeTagName(name));
      const tagIdToUse = existing?.id || null;

      let createdTag: TagItem | null = existing || null;
      if (!createdTag) {
        const { data, error } = await (supabase as any)
          .from('instagram_tags')
          .insert({
            workspace_id: workspace.id,
            name,
            color: newCustomTagColor || '#3b82f6',
            icon: newCustomTagIcon || 'tag',
            prompt: null,
            created_by: user.id,
          })
          .select('id,name,color,icon,prompt')
          .maybeSingle();
        if (error) throw error;
        if (!data?.id) throw new Error('Failed to create custom tag');

        createdTag = {
          id: String(data.id),
          name: String(data.name || name),
          color: String(data.color || newCustomTagColor || '#3b82f6'),
          icon: data.icon ? String(data.icon) : String(newCustomTagIcon || 'tag'),
          prompt: data.prompt ? String(data.prompt) : null,
        };

        setTags((prev) => (prev.some((t) => t.id === createdTag!.id) ? prev : [...prev, createdTag!]));
      }

      const targetTagId = tagIdToUse || createdTag!.id;
      const { error: linkError } = await (supabase as any)
        .from('instagram_conversation_tags')
        .insert({
          workspace_id: workspace.id,
          conversation_id: selectedThread.conversationId,
          tag_id: targetTagId,
          source: 'manual',
          created_by: user.id,
        });
      if (linkError && String(linkError?.code || '') !== '23505') throw linkError;

      setConversationTagIds((prev) => {
        const cur = new Set(prev[selectedThread.conversationId] || []);
        cur.add(targetTagId);
        return { ...prev, [selectedThread.conversationId]: Array.from(cur) };
      });
      logAudit(selectedThread.conversationId, 'apply_tag', { tag_id: targetTagId });

      setNewCustomTagName('');
      setNewCustomTagIcon('tag');
      setNewCustomTagColor('#3b82f6');
      toast.success(existing ? 'Custom tag applied' : 'Custom tag created');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create custom tag');
    } finally {
      setIsCreatingCustomTag(false);
    }
  }, [
    workspace?.id,
    user?.id,
    selectedThread,
    newCustomTagName,
    newCustomTagColor,
    newCustomTagIcon,
    tags,
    logAudit,
  ]);

  const deleteCustomTag = useCallback(async (tag: TagItem) => {
    if (!workspace?.id) return;

    const normalized = normalizeTagName(tag.name);
    const isTemperature =
      matchesTemperatureTag(normalized, 'hot') ||
      matchesTemperatureTag(normalized, 'warm') ||
      matchesTemperatureTag(normalized, 'cold');
    if (
      normalized === 'priority' ||
      normalized === 'qualified' ||
      normalized === 'disqualified' ||
      normalized === 'spam' ||
      isTemperature
    ) {
      toast.error('Default tags cannot be deleted');
      return;
    }

	    const prevTags = tags;
	    const prevConversationTagIds = conversationTagIds;

	    setDeletingCustomTagId(tag.id);
	    setTags((prev) => prev.filter((t) => t.id !== tag.id));
	    setConversationTagIds((prev) => {
      const next: Record<string, string[]> = {};
      for (const key of Object.keys(prev)) {
        next[key] = (prev[key] || []).filter((id) => id !== tag.id);
      }
	      return next;
	    });

	    try {
      const { error: unlinkError } = await (supabase as any)
        .from('instagram_conversation_tags')
        .delete()
        .eq('workspace_id', workspace.id)
        .eq('tag_id', tag.id);
      if (unlinkError) throw unlinkError;

      const { error: deleteError } = await (supabase as any)
        .from('instagram_tags')
        .delete()
        .eq('workspace_id', workspace.id)
        .eq('id', tag.id);
      if (deleteError) throw deleteError;

      toast.success('Custom tag deleted');
	    } catch (error: any) {
	      setTags(prevTags);
	      setConversationTagIds(prevConversationTagIds);
	      toast.error(error?.message || 'Failed to delete custom tag');
	    } finally {
	      setDeletingCustomTagId(null);
	    }
	  }, [workspace?.id, tags, conversationTagIds]);

  const ensureTemperatureTag = useCallback(async (level: TemperatureLevel): Promise<TagItem | null> => {
    const current = temperatureTagByLevel[level];
    if (current) return current;
    if (!workspace?.id || !user?.id) return null;

    const preset = TEMPERATURE_TAG_PRESETS[level];
    const toTagItem = (row: any): TagItem => ({
      id: String(row.id),
      name: String(row.name || preset.name),
      color: String(row.color || preset.color),
      icon: row.icon ? String(row.icon) : null,
      prompt: row.prompt ? String(row.prompt) : null,
    });

    let created: any = null;
    const { data: insertRow, error: insertError } = await (supabase as any)
      .from('instagram_tags')
      .insert({
        workspace_id: workspace.id,
        name: preset.name,
        color: preset.color,
        icon: preset.icon,
        prompt: preset.prompt,
        created_by: user.id,
      })
      .select('id,name,color,icon,prompt')
      .maybeSingle();

    if (!insertError && insertRow) {
      created = insertRow;
    } else {
      const { data: rows } = await (supabase as any)
        .from('instagram_tags')
        .select('id,name,color,icon,prompt')
        .eq('workspace_id', workspace.id);
      const fallback = (Array.isArray(rows) ? rows : []).find((r: any) =>
        matchesTemperatureTag(String(r?.name || ''), level)
      );
      if (!fallback) {
        toast.error(`Create "${preset.name}" in Settings to use this action.`);
        return null;
      }
      created = fallback;
    }

    const tag = toTagItem(created);
    setTags((prev) => {
      if (prev.some((x) => x.id === tag.id)) return prev;
      return [...prev, tag];
    });
    return tag;
  }, [temperatureTagByLevel, workspace?.id, user?.id]);

  const setThreadTemperature = useCallback(async (t: Thread, level: TemperatureLevel) => {
    if (!workspace?.id || !user?.id) return;

    const targetTag = await ensureTemperatureTag(level);
    if (!targetTag) return;

    const tempIds = new Set(
      (['hot', 'warm', 'cold'] as TemperatureLevel[])
        .map((k) => temperatureTagByLevel[k]?.id)
        .filter(Boolean) as string[]
    );
    tempIds.add(targetTag.id);

    const conversationId = t.conversationId;
    const currentIds = new Set(conversationTagIds[conversationId] || []);
    const nextIds = new Set(currentIds);

    for (const id of Array.from(nextIds)) {
      if (tempIds.has(id) && id !== targetTag.id) nextIds.delete(id);
    }
    nextIds.add(targetTag.id);

    setConversationTagIds((prev) => ({
      ...prev,
      [conversationId]: Array.from(nextIds),
    }));

    try {
      const toRemove = Array.from(currentIds).filter((id) => tempIds.has(id) && id !== targetTag.id);
      for (const tagId of toRemove) {
        const { error } = await (supabase as any)
          .from('instagram_conversation_tags')
          .delete()
          .eq('workspace_id', workspace.id)
          .eq('conversation_id', conversationId)
          .eq('tag_id', tagId);
        if (error) throw error;
      }

      if (!currentIds.has(targetTag.id)) {
        const { error } = await (supabase as any)
          .from('instagram_conversation_tags')
          .insert({
            workspace_id: workspace.id,
            conversation_id: conversationId,
            tag_id: targetTag.id,
            source: 'manual',
            created_by: user.id,
          });
        if (error) throw error;
      }

      logAudit(conversationId, 'set_temperature', { level, tag_id: targetTag.id });
    } catch {
      setConversationTagIds((prev) => ({
        ...prev,
        [conversationId]: Array.from(currentIds),
      }));
      toast.error('Failed to update lead temperature');
    }
  }, [
    workspace?.id,
    user?.id,
    conversationTagIds,
    ensureTemperatureTag,
    temperatureTagByLevel,
    logAudit,
  ]);

  const ensureFunnelStageTag = useCallback(async (key: FunnelStage): Promise<TagItem | null> => {
    const existing = funnelStageTagByKey[key];
    if (existing) return existing;
    if (!workspace?.id || !user?.id) return null;
    if (userRole === 'setter') return null;

    const preset = FUNNEL_STAGE_TAG_PRESETS[key];
    const toTagItem = (row: any): TagItem => ({
      id: String(row.id),
      name: String(row.name || preset.name),
      color: String(row.color || preset.color),
      icon: row.icon ? String(row.icon) : preset.icon,
      prompt: row.prompt ? String(row.prompt) : preset.prompt,
    });

    let created: any = null;
    const { data: insertRow, error: insertError } = await (supabase as any)
      .from('instagram_tags')
      .insert({
        workspace_id: workspace.id,
        name: preset.name,
        color: preset.color,
        icon: preset.icon,
        prompt: preset.prompt,
        created_by: user.id,
      })
      .select('id,name,color,icon,prompt')
      .maybeSingle();

    if (!insertError && insertRow) {
      created = insertRow;
    } else {
      const { data: rows } = await (supabase as any)
        .from('instagram_tags')
        .select('id,name,color,icon,prompt')
        .eq('workspace_id', workspace.id);
      const fallback = (Array.isArray(rows) ? rows : []).find((r: any) => funnelStageKeyFromTagName(String(r?.name || '')) === key);
      if (!fallback) {
        toast.error(`Create "${preset.name}" in Settings to use this action.`);
        return null;
      }
      created = fallback;
    }

    const tag = toTagItem(created);
    setTags((prev) => {
      if (prev.some((x) => x.id === tag.id)) return prev;
      return [...prev, tag];
    });
    return tag;
  }, [funnelStageTagByKey, workspace?.id, user?.id, userRole]);

  const setThreadFunnelStage = useCallback(async (t: Thread, next: FunnelStage) => {
    if (!workspace?.id) return;

    const conversationId = t.conversationId;
    if (!conversationId) return;

    const prevIds = conversationTagIds[conversationId] || [];
    const current = new Set(prevIds);

    const stageTagIds = new Set<string>();
    for (const tag of tags) {
      if (funnelStageKeyFromTagName(tag?.name)) stageTagIds.add(tag.id);
    }

    const prevLeadStatus = t.leadStatus;
    const nextLeadStatus =
      next === 'qualified' ? 'qualified' : next === 'unqualified' ? 'disqualified' : 'open';

    const targetTag = funnelStageTagByKey[next] || (await ensureFunnelStageTag(next));
    if (!targetTag?.id) {
      toast.error('Phase tags are missing. Run migrations or connect Instagram to seed them.');
      return;
    }
    stageTagIds.add(targetTag.id);

    const nextIds = new Set(current);
    for (const id of Array.from(nextIds)) {
      if (stageTagIds.has(id)) nextIds.delete(id);
    }
    nextIds.add(targetTag.id);

    setConversationTagIds((prev) => ({ ...prev, [conversationId]: Array.from(nextIds) }));
    setThreads((prev) =>
      prev.map((x) => (x.conversationId === conversationId ? { ...x, leadStatus: nextLeadStatus } : x))
    );

    try {
      const toRemove = Array.from(current).filter((id) => stageTagIds.has(id) && id !== targetTag.id);
      if (toRemove.length > 0) {
        const { error } = await (supabase as any)
          .from('instagram_conversation_tags')
          .delete()
          .eq('workspace_id', workspace.id)
          .eq('conversation_id', conversationId)
          .in('tag_id', toRemove);
        if (error) throw error;
      }

      if (!current.has(targetTag.id)) {
        const { error } = await (supabase as any)
          .from('instagram_conversation_tags')
          .insert({
            workspace_id: workspace.id,
            conversation_id: conversationId,
            tag_id: targetTag.id,
            source: 'manual',
            created_by: user?.id || null,
          });
        if (error && String(error?.code || '') !== '23505') throw error;
      }

      const updateResult = await updateThreadWithFallback(t, { lead_status: nextLeadStatus });
      if (updateResult.error) throw updateResult.error;

      logAudit(conversationId, 'set_phase', { phase: next, lead_status: nextLeadStatus, tag_id: targetTag.id });
    } catch (error: any) {
      setConversationTagIds((prev) => ({ ...prev, [conversationId]: prevIds }));
      setThreads((prev) =>
        prev.map((x) => (x.conversationId === conversationId ? { ...x, leadStatus: prevLeadStatus } : x))
      );
      toast.error(getThreadMutationErrorMessage(error, 'Failed to update phase'));
    }
  }, [
    workspace?.id,
    user?.id,
    tags,
    funnelStageTagByKey,
    ensureFunnelStageTag,
    conversationTagIds,
    updateThreadWithFallback,
    getThreadMutationErrorMessage,
    logAudit,
  ]);

  const buildLocalConversationSummary = useCallback((thread: Thread, messages: any[]) => {
    const parseMs = (v: any): number => {
      if (!v) return 0;
      const n = typeof v === 'number' ? v : Number(v);
      if (Number.isFinite(n) && String(v).trim().match(/^\d{10,13}$/)) {
        return n < 1e12 ? n * 1000 : n;
      }
      const ms = Date.parse(String(v));
      return Number.isFinite(ms) ? ms : 0;
    };

    const getMs = (m: any) =>
      parseMs(m?.message_timestamp) ||
      parseMs(m?.raw_payload?.created_time) ||
      parseMs(m?.raw_payload?.timestamp) ||
      parseMs(m?.created_at);

    const isOutbound = (m: any) => {
      const peerId = String(thread.peerId || '');
      const sender = m?.sender_id != null ? String(m.sender_id) : '';
      const recipient = m?.recipient_id != null ? String(m.recipient_id) : '';
      if (sender && peerId && sender === peerId) return false;
      if (recipient && peerId && recipient === peerId) return true;

      const myId = String(thread.instagramAccountId || '');
      if (sender && myId && sender === myId) return true;
      if (recipient && myId && recipient === myId) return false;

      const dir = m?.direction ? String(m.direction) : '';
      if (dir === 'outbound') return true;
      if (dir === 'inbound') return false;
      return false;
    };

    const textOf = (m: any) => {
      const raw = m?.message_text ?? m?.raw_payload?.message ?? m?.raw_payload?.text ?? '';
      const text = typeof raw === 'string' ? raw.trim() : String(raw || '').trim();
      if (text) return text;
      const attachments = Array.isArray(m?.raw_payload?.stored_attachments) ? m.raw_payload.stored_attachments : [];
      if (attachments.length > 0) return '[attachment]';
      return '';
    };

    const sorted = (Array.isArray(messages) ? messages : [])
      .map((m, index) => ({ m, index }))
      .sort((a, b) => {
        const ta = getMs(a.m);
        const tb = getMs(b.m);
        if (ta !== tb) return ta - tb;
        return a.index - b.index;
      })
      .map((x) => x.m);

    if (sorted.length === 0) {
      return 'No messages available yet. Send a message to start this conversation and generate a richer summary.';
    }

    let inboundCount = 0;
    let outboundCount = 0;
    let lastInboundText = '';
    let lastOutboundText = '';
    let lastInboundMs = 0;
    let lastOutboundMs = 0;

    for (const msg of sorted) {
      const outbound = isOutbound(msg);
      const ts = getMs(msg);
      const text = textOf(msg);
      if (outbound) {
        outboundCount += 1;
        if (ts >= lastOutboundMs && text) {
          lastOutboundMs = ts;
          lastOutboundText = text;
        }
      } else {
        inboundCount += 1;
        if (ts >= lastInboundMs && text) {
          lastInboundMs = ts;
          lastInboundText = text;
        }
      }
    }

    const latest = sorted[sorted.length - 1];
    const latestText = textOf(latest);
    const latestOutbound = isOutbound(latest);
    const peerLabel = pickPeerLabel(thread);
    const nextAction =
      lastInboundMs > lastOutboundMs
        ? 'Lead spoke last. Follow up quickly with a concrete next step.'
        : 'You spoke last. If no response soon, send a short bump message.';

    return [
      `${peerLabel} thread: ${sorted.length} messages (${inboundCount} inbound, ${outboundCount} outbound).`,
      latestText ? `Latest message (${latestOutbound ? 'you' : 'lead'}): ${latestText.slice(0, 220)}` : null,
      lastInboundText ? `Lead context: ${lastInboundText.slice(0, 180)}` : null,
      lastOutboundText ? `Your last reply: ${lastOutboundText.slice(0, 180)}` : null,
      `Recommended action: ${nextAction}`,
    ]
      .filter(Boolean)
      .join('\n');
  }, []);

  const summarizeSelectedConversation = useCallback(async (forceRefresh = false) => {
    if (!workspace?.id || !selectedThread) return;
    setIsSummarizing(true);
    try {
      const invokeSummary = async (refreshFlag: boolean) => {
        const { data, error } = await invokeInboxAi<any>({
          action: 'summarize-conversation',
          workspaceId: workspace.id,
          conversationId: selectedThread.conversationId,
          forceRefresh: refreshFlag,
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Failed to summarize');
        return data;
      };

      let data: any = null;
      try {
        data = await invokeSummary(forceRefresh);
      } catch (firstError) {
        // Retry once with force-refresh to bypass stale cache/network hiccups.
        data = await invokeSummary(true);
      }

      const nextSummary = data?.summary ? String(data.summary) : null;
      const updatedAt = data?.updatedAt ? new Date(String(data.updatedAt)) : new Date();

      setThreads((prev) =>
        prev.map((x) =>
          x.conversationId === selectedThread.conversationId
            ? { ...x, summaryText: nextSummary, summaryUpdatedAt: updatedAt }
            : x
        )
      );
    } catch (e: any) {
      const fallbackSummary = buildLocalConversationSummary(selectedThread, displayedMessages);
      const updatedAt = new Date();
      setThreads((prev) =>
        prev.map((x) =>
          x.conversationId === selectedThread.conversationId
            ? { ...x, summaryText: fallbackSummary, summaryUpdatedAt: updatedAt }
            : x
        )
      );
      const persistResult = await updateThreadWithFallback(selectedThread, {
        summary_text: fallbackSummary,
        summary_updated_at: updatedAt.toISOString(),
      });
      if (persistResult.error) {
        console.warn('Local summary persist failed:', persistResult.error);
      }
    } finally {
      setIsSummarizing(false);
    }
  }, [workspace?.id, selectedThread, displayedMessages, buildLocalConversationSummary, updateThreadWithFallback]);

  const scanAlerts = useCallback(async (opts?: { silent?: boolean }) => {
    if (!workspace?.id) return;
    if (alertScanInFlightRef.current) return;
    alertScanInFlightRef.current = true;
    if (!opts?.silent) setIsScanningAlerts(true);
    try {
      const { data, error } = await invokeInboxAi<any>({
        action: 'scan-alerts',
        workspaceId: workspace.id,
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Alert scan failed');
      await loadAlerts();
      if (!opts?.silent) toast.success(`Alerts scanned (${Number(data?.opened || 0)} opened)`);
    } catch (e: any) {
      if (!opts?.silent) {
        const message = await getEdgeInvokeErrorMessage(e, 'Failed to scan alerts', 'inbox-ai');
        toast.error(message);
      }
      else console.warn('Silent alert scan failed:', e?.message || e);
    } finally {
      if (!opts?.silent) setIsScanningAlerts(false);
      alertScanInFlightRef.current = false;
    }
  }, [workspace?.id, loadAlerts]);

  const resolveAlert = useCallback(async (alertId: string) => {
    if (!workspace?.id) return;
    try {
      const { data, error } = await invokeInboxAi<any>({
        action: 'resolve-alert',
        workspaceId: workspace.id,
        alertId,
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Resolve failed');
      setAlerts((prev) => prev.filter((x) => x.id !== alertId));
    } catch (e: any) {
      const message = await getEdgeInvokeErrorMessage(e, 'Failed to resolve alert', 'inbox-ai');
      toast.error(message);
    }
  }, [workspace?.id]);

  const startRetagJob = useCallback(async (tagId: string | null, onlyLast30Days: boolean) => {
    if (!workspace?.id) return;
    setIsRetagRunning(true);
    try {
      const { data, error } = await invokeInboxAi<any>({
        action: 'retag-start',
        workspaceId: workspace.id,
        tagId,
        onlyLast30Days,
      });
      if (error) throw error;
      if (!data?.success || !data?.job?.id) throw new Error(data?.error || 'Failed to start retag');
      setRetagJob(data.job);
      toast.success('Retag job started');
    } catch (e: any) {
      setIsRetagRunning(false);
      const message = await getEdgeInvokeErrorMessage(e, 'Failed to start retag', 'inbox-ai');
      toast.error(message);
    }
  }, [workspace?.id]);

  const handleSyncMessages = useCallback(async (opts?: { silent?: boolean; fast?: boolean }) => {
    if (!workspace?.id) return;
    if (syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('instagram-connect', {
        body: {
          action: 'sync-messages',
          workspaceId: workspace.id,
          ...(opts?.fast
            ? {
                maxConversations: 20,
                maxPages: 1,
                messagesLimit: 25,
              }
            : {}),
        },
      });

      if (error) {
        console.error('Sync error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Sync failed');
      }

      setLastSyncedAt(new Date());
      setSyncMeta({
        conversationsFetched: Number(data?.conversationsFetched || 0),
        conversationsWithMessages: Number(data?.conversationsWithMessages || 0),
        messagesUpserted: Number(data?.messagesUpserted || 0),
        warnings: Array.isArray(data?.warnings) ? data.warnings : [],
        errors: Array.isArray(data?.errors) ? data.errors : [],
        lastError: null,
      });
      const upserted = Number(data?.messagesUpserted || 0);
      const convs = Number(data?.conversationsFetched || 0);
      if (!opts?.silent) {
        if (upserted > 0) toast.success(`Updated inbox (${upserted} messages)`);
        else toast.message(`Inbox updated (${convs} conversations checked)`);
      }

      await reloadInbox({ baselineReads: true });
      if (selectedThread) {
        await loadMessagesForThread(selectedThread);
      }
      if (userRole === 'owner') {
        scanAlerts({ silent: true });
      }
    } catch (e: any) {
      const prettyError = await getEdgeInvokeErrorMessage(e, 'Failed to sync messages', 'instagram-connect');
      setSyncMeta((prev) => ({
        ...prev,
        lastError: prettyError || 'Sync failed',
      }));
      if (!opts?.silent) toast.error(prettyError || 'Failed to sync messages');
    } finally {
      setIsSyncing(false);
      syncInFlightRef.current = false;
    }
  }, [workspace?.id, reloadInbox, selectedThread, loadMessagesForThread, userRole, scanAlerts]);

  const runAutomaticConversationBackfill = useCallback(async () => {
    if (!workspace?.id) return;
    if (backfillInFlightRef.current) return;

    backfillInFlightRef.current = true;

    try {
      let pageUrl: string | null = null;
      let done = false;
      let safety = 0;

      // Fetch conversation pages in batches until we exhaust Meta paging.
      // Keep this lightweight so thousands of threads can appear without pulling full message history.
      while (!done && safety < 200) {
        safety += 1;
        const { data, error } = await supabase.functions.invoke('instagram-connect', {
          body: {
            action: 'sync-conversations',
            workspaceId: workspace.id,
            pageUrl,
            maxPages: 10,
          },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Backfill failed');

        pageUrl = data?.nextPageUrl ? String(data.nextPageUrl) : null;
        done = Boolean(data?.done) || !pageUrl;

        // Refresh periodically while backfill is running.
        if (safety % 3 === 0) {
          await reloadInbox();
        }
      }

      await reloadInbox({ baselineReads: true });
    } catch (e: any) {
      const prettyError = await getEdgeInvokeErrorMessage(e, 'Failed to backfill conversations', 'instagram-connect');
      const lower = String(prettyError || e?.message || '').toLowerCase();

      // Backward compatibility: if the deployed function doesn't support sync-conversations yet,
      // fall back to a wider sync-messages run automatically (no user action needed).
      if (lower.includes('invalid action')) {
        try {
          const { data, error } = await supabase.functions.invoke('instagram-connect', {
            body: {
              action: 'sync-messages',
              workspaceId: workspace.id,
              maxConversations: 250,
              maxPages: 50,
              messagesLimit: 25,
            },
          });
          if (error) throw error;
          if (!data?.success) throw new Error(data?.error || 'Sync failed');
          await reloadInbox({ baselineReads: true });
        } catch (fallbackError) {
          console.warn('Automatic full sync fallback failed:', fallbackError);
        }
      } else {
        console.warn('Automatic conversation backfill failed:', prettyError || e?.message || e);
      }
    } finally {
      backfillInFlightRef.current = false;
    }
  }, [workspace?.id, reloadInbox]);

  // Keep accountability alerts fresh while users work in the inbox.
  useEffect(() => {
    if (!workspace?.id || !isInstagramConnected || userRole !== 'owner') return;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      scanAlerts({ silent: true });
    };
    const t = setTimeout(run, 2000);
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      run();
    }, 5 * 60_000);
    return () => {
      cancelled = true;
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [workspace?.id, isInstagramConnected, userRole, scanAlerts]);

  // Auto-sync: one initial refresh + light background refresh.
  useEffect(() => {
    if (!workspace?.id || !isInstagramConnected) return;

    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await handleSyncMessages({ silent: true, fast: true });
    };

    // Initial sync shortly after mount.
    const t = setTimeout(run, 250);

    // Keep a background sync so new inbound DMs appear even if webhook delivery is delayed.
    // Do NOT hammer the Meta API; it will rate-limit and break inbox loading.
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      run();
    }, AUTO_SYNC_INTERVAL_MS);

    // Also sync when the tab regains focus.
    const onFocus = () => run();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      clearTimeout(t);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [workspace?.id, isInstagramConnected, handleSyncMessages]);

  // Automatic deep backfill for large inboxes (no manual button required).
  useEffect(() => {
    if (!workspace?.id || !isInstagramConnected) return;
    if (autoBackfillWorkspaceRef.current === workspace.id) return;
    autoBackfillWorkspaceRef.current = workspace.id;

    const t = setTimeout(() => {
      runAutomaticConversationBackfill();
    }, 250);

    return () => clearTimeout(t);
  }, [workspace?.id, isInstagramConnected, runAutomaticConversationBackfill]);

  // Realtime updates (if enabled in Supabase).
  useEffect(() => {
    if (!workspace?.id || !isInstagramConnected) return;
    const channel = supabase
      .channel(`ig_messages:${workspace.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'instagram_threads', filter: `workspace_id=eq.${workspace.id}` },
        (payload) => {
          // Avoid full inbox reloads on small updates (priority/spam/assignment), which can feel laggy.
          // Keep list order stable by patching the thread row in-state.
          try {
            const eventType = String((payload as any)?.eventType || '');
            const raw = eventType === 'DELETE' ? (payload as any)?.old : (payload as any)?.new;
            const convId = raw?.conversation_id ? String(raw.conversation_id) : '';
            if (!convId) return;

            if (eventType === 'DELETE') {
              setThreads((prev) => prev.filter((t) => t.conversationId !== convId));
              return;
            }

            const parseIsoDate = (v: any): Date | null => {
              if (!v) return null;
              const d = new Date(String(v));
              return Number.isFinite(d.getTime()) ? d : null;
            };

            const leadStatusRaw = raw?.lead_status != null ? String(raw.lead_status) : '';
            const leadStatus =
              leadStatusRaw === 'qualified' ||
              leadStatusRaw === 'disqualified' ||
              leadStatusRaw === 'removed'
                ? leadStatusRaw
                : leadStatusRaw
                  ? 'open'
                  : null;

            const patch: Partial<Thread> = {};
            if (raw?.priority !== undefined) patch.priority = Boolean(raw.priority);
            if ((raw as any)?.is_spam !== undefined) patch.isSpam = Boolean((raw as any).is_spam);
            if ((raw as any)?.hidden_from_setters !== undefined) patch.hiddenFromSetters = Boolean((raw as any).hidden_from_setters);
            if ((raw as any)?.shared_with_setters !== undefined) patch.sharedWithSetters = Boolean((raw as any).shared_with_setters);
            if (raw?.assigned_user_id !== undefined) patch.assignedUserId = raw.assigned_user_id ? String(raw.assigned_user_id) : null;
            if (leadStatus) patch.leadStatus = leadStatus as any;

            if (raw?.priority_snoozed_until !== undefined) patch.prioritySnoozedUntil = parseIsoDate(raw.priority_snoozed_until);
            if (raw?.priority_followed_up_at !== undefined) patch.priorityFollowedUpAt = parseIsoDate(raw.priority_followed_up_at);
            if (raw?.summary_text !== undefined) patch.summaryText = raw.summary_text ? String(raw.summary_text) : null;
            if (raw?.summary_updated_at !== undefined) patch.summaryUpdatedAt = parseIsoDate(raw.summary_updated_at);
            if ((raw as any)?.ai_phase_updated_at !== undefined) patch.aiPhaseUpdatedAt = parseIsoDate((raw as any).ai_phase_updated_at);
            if ((raw as any)?.ai_phase_confidence !== undefined) {
              patch.aiPhaseConfidence =
                (raw as any)?.ai_phase_confidence != null && Number.isFinite(Number((raw as any).ai_phase_confidence))
                  ? Number((raw as any).ai_phase_confidence)
                  : null;
            }
            if ((raw as any)?.ai_temperature_confidence !== undefined) {
              patch.aiTemperatureConfidence =
                (raw as any)?.ai_temperature_confidence != null &&
                Number.isFinite(Number((raw as any).ai_temperature_confidence))
                  ? Number((raw as any).ai_temperature_confidence)
                  : null;
            }
            if ((raw as any)?.ai_phase_reason !== undefined) patch.aiPhaseReason = (raw as any).ai_phase_reason ? String((raw as any).ai_phase_reason) : null;
            if ((raw as any)?.ai_phase_mode !== undefined) {
              patch.aiPhaseMode =
                (raw as any).ai_phase_mode === 'shadow' || (raw as any).ai_phase_mode === 'enforce'
                  ? (raw as any).ai_phase_mode
                  : null;
            }
            if ((raw as any)?.ai_phase_last_run_source !== undefined) {
              patch.aiPhaseLastRunSource =
                (raw as any).ai_phase_last_run_source === 'incremental' ||
                (raw as any).ai_phase_last_run_source === 'catchup' ||
                (raw as any).ai_phase_last_run_source === 'backfill' ||
                (raw as any).ai_phase_last_run_source === 'manual_rephase'
                  ? (raw as any).ai_phase_last_run_source
                  : null;
            }
            if ((raw as any)?.shared_last_read_at !== undefined) patch.sharedLastReadAt = parseIsoDate((raw as any).shared_last_read_at);
            if (raw?.last_inbound_at !== undefined) patch.lastInboundAt = parseIsoDate(raw.last_inbound_at);
            if (raw?.last_outbound_at !== undefined) patch.lastOutboundAt = parseIsoDate(raw.last_outbound_at);

            if (raw?.last_message_id !== undefined) patch.lastMessageId = raw.last_message_id ? String(raw.last_message_id) : null;
            if (raw?.last_message_text !== undefined) patch.lastText = raw.last_message_text ? String(raw.last_message_text) : null;
            if (raw?.last_message_at !== undefined) patch.lastAt = parseIsoDate(raw.last_message_at);
            if (raw?.last_message_direction !== undefined) {
              patch.lastDirection =
                raw.last_message_direction === 'inbound' || raw.last_message_direction === 'outbound'
                  ? raw.last_message_direction
                  : null;
            }

            let needsReload = false;
              setThreads((prev) => {
                const idx = prev.findIndex((t) => t.conversationId === convId);
                if (idx < 0) {
                  needsReload = true;
                  return prev;
                }
                const updated = { ...prev[idx], ...patch };
                const next = [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
                next.sort((a, b) => (b.lastAt?.getTime() || 0) - (a.lastAt?.getTime() || 0));
                return next;
              });
            if (needsReload) {
              // Realtime can miss rows becoming visible in some edge cases; fallback to a cheap DB poll.
              refreshSetterThreadsFast({ forceFull: true });
            }
          } catch {
            reloadInbox();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'instagram_thread_reads', filter: `workspace_id=eq.${workspace.id}` },
        (payload) => {
          try {
            const eventType = String((payload as any)?.eventType || '');
            if (eventType === 'DELETE') return;
            const row = (payload as any)?.new;
            const convId = row?.conversation_id ? String(row.conversation_id) : null;
            const lastReadAt = row?.last_read_at ? String(row.last_read_at) : null;
            if (!convId || !lastReadAt) return;
            setReadAtByConversationId((prev) => {
              const base = prev || {};
              const nextIso = pickLatestIsoTimestamp(base[convId], lastReadAt);
              if (!nextIso) return prev;
              if (prev && base[convId] === nextIso) return prev;
              return { ...base, [convId]: nextIso };
            });
          } catch {
            // ignore realtime payload parse errors
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'instagram_messages', filter: `workspace_id=eq.${workspace.id}` },
        (payload) => {
          reloadInbox();
          // If the selected thread received a message, refresh its messages.
          try {
            const row = (payload as any)?.new;
            const convKey = row?.raw_payload?.conversation_key ? String(row.raw_payload.conversation_key) : null;
            const peerId = row?.instagram_user_id ? String(row.instagram_user_id) : null;
            const accId = row?.instagram_account_id ? String(row.instagram_account_id) : null;
            const conversationIdForPreview = convKey || (accId && peerId ? `${accId}:${peerId}` : null);
	            if (conversationIdForPreview && isRenderableIgMessageRow(row)) {
	              const atMs = getMessageTimestampMs(row) || Date.now();
	              const messageId = row?.message_id ? String(row.message_id) : row?.id ? String(row.id) : null;
	              const direction = inferDirectionFromMessageRow(row, {
	                instagramAccountId: accId,
	                peerId,
	              });
	              const text = deriveMessagePreviewText(row);
	              upsertMessagePreview(conversationIdForPreview, { atMs, messageId, direction, text });
	              if (direction === 'outbound') {
	                markThreadRead(conversationIdForPreview, new Date(atMs));
	              }
	            }
            if (!selectedThread) return;

            // Prefer the explicit conversation_key when present (most precise).
            if (convKey && convKey === selectedThread.conversationId) {
              const key = row?.message_id ? String(row.message_id) : row?.id ? String(row.id) : '';
              if (key) lastKnownThreadMessageKeyRef.current = key;
              setSelectedMessages((prev) => {
                const arr = Array.isArray(prev) ? prev : [];
                if (!key) return arr;
                const exists = arr.some((m: any) => String(m?.message_id || m?.id || '') === key);
                if (exists) return arr;
                return [...arr, row];
              });
              return;
            }

            // Fallback for legacy rows without conversation_key.
            if (peerId && accId && selectedThread.peerId === peerId && selectedThread.instagramAccountId === accId) {
              const key = row?.message_id ? String(row.message_id) : row?.id ? String(row.id) : '';
              if (key) lastKnownThreadMessageKeyRef.current = key;
              setSelectedMessages((prev) => {
                const arr = Array.isArray(prev) ? prev : [];
                if (!key) return arr;
                const exists = arr.some((m: any) => String(m?.message_id || m?.id || '') === key);
                if (exists) return arr;
                return [...arr, row];
              });
            }

          } catch {
            // ignore
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'instagram_conversation_tags', filter: `workspace_id=eq.${workspace.id}` },
        () => reloadInbox()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'instagram_tags', filter: `workspace_id=eq.${workspace.id}` },
        () => loadTags()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'instagram_alerts', filter: `workspace_id=eq.${workspace.id}` },
        () => loadAlerts()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lead_team_messages', filter: `workspace_id=eq.${workspace.id}` },
        (payload) => {
          try {
            const row = (payload as any)?.new;
            if (!row?.id || !row?.conversation_id || !row?.author_user_id) return;
            upsertLeadTeamMessageInState({
              id: String(row.id),
              workspaceId: String(row.workspace_id || workspace.id),
              conversationId: String(row.conversation_id),
              authorUserId: String(row.author_user_id),
              body: String(row.body || ''),
              createdAt: new Date(String(row.created_at || new Date().toISOString())),
            });
          } catch {
            // ignore realtime payload parse errors
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace?.id, isInstagramConnected, reloadInbox, selectedThread, loadMessagesForThread, loadTags, loadAlerts, upsertLeadTeamMessageInState, upsertMessagePreview, refreshSetterThreadsFast, markThreadRead]);

  // Fast DB poll to reflect thread updates quickly when Realtime misses events.
  useEffect(() => {
    if (!workspace?.id || !isInstagramConnected) return;

    // Give ourselves a small overlap to avoid missing updates that land during mount.
    setterFastThreadsWorkspaceRef.current = workspace.id;
    setterFastThreadsSinceMsRef.current = Date.now() - 10_000;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      if (document.visibilityState !== 'visible') return;
      refreshSetterThreadsFast();
    };

    const t = setTimeout(run, 1200);
    const interval = setInterval(run, FAST_THREADS_POLL_INTERVAL_MS);
    const onFocus = () => run();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      clearTimeout(t);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [workspace?.id, isInstagramConnected, refreshSetterThreadsFast]);

  // Keep read markers in sync across owner + setters even if Realtime for reads is delayed/missed.
  useEffect(() => {
    if (!workspace?.id || !isInstagramConnected) return;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      if (document.visibilityState !== 'visible') return;
      loadSharedThreadReads();
    };

    const t = setTimeout(run, 900);
    const interval = setInterval(run, SHARED_READS_POLL_INTERVAL_MS);
    const onFocus = () => run();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      clearTimeout(t);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [workspace?.id, isInstagramConnected, loadSharedThreadReads]);

  // Load inbox state when connected.
  useEffect(() => {
    if (!workspace?.id || !user?.id || !isInstagramConnected) return;
    reloadInbox({ baselineReads: true });
  }, [workspace?.id, user?.id, isInstagramConnected, reloadInbox]);

  useEffect(() => {
    if (!workspace?.id || !isInstagramConnected) return;
    loadTags();
    loadAlerts();
  }, [workspace?.id, isInstagramConnected, loadTags, loadAlerts]);

  useEffect(() => {
    if (!workspace?.id || !retagJob?.id || !isRetagRunning) return;

    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      try {
        const { data, error } = await invokeInboxAi<any>({
          action: 'retag-step',
          workspaceId: workspace.id,
          jobId: retagJob.id,
        });
        if (error) throw error;
        if (!data?.success || !data?.job) throw new Error(data?.error || 'Retag step failed');
        setRetagJob(data.job);
        const status = String(data.job.status || '');
        if (status === 'completed' || status === 'failed') {
          setIsRetagRunning(false);
          await reloadInbox();
          await loadTags();
          if (status === 'completed') toast.success('Retag complete');
          else toast.error(data.job.error || 'Retag failed');
        }
      } catch (e: any) {
        setIsRetagRunning(false);
        const message = await getEdgeInvokeErrorMessage(e, 'Retag step failed', 'inbox-ai');
        toast.error(message);
      }
    };

    const interval = setInterval(run, 1200);
    run();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [workspace?.id, retagJob?.id, isRetagRunning, reloadInbox, loadTags]);

  // Load messages whenever the selected thread changes.
  useEffect(() => {
    if (!selectedThread) {
      setIsMessagesLoading(false);
      setSelectedMessages([]);
      return;
    }
    setIsMessagesLoading(true);
    setSelectedMessages([]);
    loadMessagesForThread(selectedThread);
    handleSyncMessages({ silent: true, fast: true });
    if (!selectedThread.summaryText) {
      summarizeSelectedConversation(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThread?.conversationId]);

  const handleConnectInstagram = async () => {
    setIsConnecting(true);
    try {
      if (!workspace?.id) {
        throw new Error('No workspace selected. Please refresh and try again.');
      }

      // Persist as fallback if state gets stripped by the provider/UA.
      sessionStorage.setItem('ig_connect_workspace_id', workspace.id);

      const { data, error } = await supabase.functions.invoke('instagram-connect', {
        body: { action: 'get-auth-url', workspaceId: workspace.id },
      });

      if (error) {
        console.error('Instagram get-auth-url error:', error);
        throw new Error(error.message || 'Failed to start Instagram connection.');
      }

      const authUrl = data?.authUrl as string | undefined;
      if (!authUrl) {
        throw new Error('No auth URL returned from server.');
      }

      // Redirect to Instagram OAuth.
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('Instagram connect error:', error);
      toast.error(error.message || 'Failed to connect Instagram');
    } finally {
      setIsConnecting(false);
    }
  };

  // Workspace missing state (avoid the "all black" feeling).
  if (!workspace?.id && !isLoading) {
    return (
      <DashboardLayout>
        <div className="h-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-black px-4">
          <div className="text-center max-w-md">
            <p className="text-white/70 text-sm mb-2 leading-relaxed">
              No workspace selected.
            </p>
            <p className="text-white/40 text-xs leading-relaxed">
              Refresh the page. If this keeps happening, sign out and sign back in so we can reattach you to a workspace.
            </p>
            <div className="mt-6">
              <PremiumButton size="sm" onClick={() => window.location.reload()} className="gap-2">
                Reload
              </PremiumButton>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout fullWidth scrollable={false}>
        <InboxPageSkeleton />
      </DashboardLayout>
    );
  }

  // Empty state when Instagram is not connected
  if (!isInstagramConnected) {
    return (
      <DashboardLayout>
        <div className="h-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-black px-4">
          <div className="text-center max-w-md">
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              Connect your Instagram account to manage DMs,<br />
              respond to leads, and track conversations
            </p>
            
            <PremiumButton 
              size="sm"
              onClick={handleConnectInstagram}
              disabled={isConnecting}
              className="gap-3"
            >
              <img 
                src={instagramLogo} 
                alt="Instagram" 
                className="w-5 h-5 object-contain"
              />
              {isConnecting ? 'Connecting...' : 'Connect Instagram'}
            </PremiumButton>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Connected state - show DMs interface
  return (
    <DashboardLayout fullWidth scrollable={false}>
        <div className="h-full flex bg-black overflow-hidden">
        {/* Conversation List */}
        <div className="w-[360px] border-r-[0.5px] border-white/10 flex flex-col min-w-0">
          {/* Header */}
	          <div className="px-5 pt-5">
	            <div className="flex items-start justify-between gap-4">
	              <div className="min-w-0">
		                <div className="headline-domaine text-[26px] font-normal tracking-tight text-white/90">Inbox</div>
                  {userRole === 'setter' ? (
                    <button
                      type="button"
                      onClick={() => setFilterAssigned((prev) => (prev === 'me' ? 'all' : 'me'))}
                      className={`mt-2 inline-flex items-center h-8 px-3 rounded-full border border-white/10 text-[12px] font-semibold transition-colors ${
                        filterAssigned === 'me'
                          ? 'bg-white/[0.08] text-white'
                          : 'bg-black text-white/55 hover:text-white/80 hover:bg-white/[0.03]'
                      }`}
                    >
                      Only show my leads
                    </button>
	                  ) : null}
		              </div>
	            </div>

            {/* Tabs (Mochi-like spacing) */}
            <div className="mt-4 -mx-5 px-5 border-b-[0.5px] border-white/10">
              <div className="grid grid-cols-3 items-end">
                {(['all', 'priority', 'unread'] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  const label = tab === 'all' ? 'All' : tab === 'priority' ? 'Priority' : 'Unread';
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative -mb-px py-3 text-[13px] font-semibold text-center transition-colors ${
                        isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      {label}
                      {isActive ? (
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[2px] w-12 bg-white rounded-full" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search + Filters */}
            <div className="mt-4 flex items-center gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="h-4 w-4 text-[#6b6f75] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full h-10 pl-9 pr-3 rounded-2xl bg-black border border-white/10 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>
              <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="h-10 w-10 rounded-2xl border border-white/10 bg-black text-[#8d9198] hover:text-[#d6d9de] hover:bg-white/[0.03] transition-colors grid place-items-center flex-shrink-0"
                    aria-label="Filters"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
	                <PopoverContent align="end" side="bottom" sideOffset={8} className="w-[320px] rounded-2xl border border-white/10 bg-black p-3">
	                  <div className="space-y-3">
	                    <div className="inbox-filter-title text-sm font-light text-white/60">Filters</div>
	                    <div className="grid grid-cols-2 gap-2">
	                      <DropdownMenu>
	                        <DropdownMenuTrigger asChild>
	                          <button
	                            type="button"
	                            className="inbox-filter-select h-9 w-full rounded-xl bg-black border border-white/10 px-3 text-sm font-light text-white/80 focus:outline-none hover:bg-white/[0.03] transition-colors inline-flex items-center justify-between gap-2"
	                          >
	                            <span className="truncate">
	                              {filterAssigned === 'all'
	                                ? 'Assigned: All'
	                                : filterAssigned === 'me'
	                                  ? 'Assigned: Me'
	                                  : filterAssigned === 'unassigned'
	                                    ? 'Assigned: Unassigned'
	                                    : `Assigned: ${setterMembers.find((m) => String(m.userId) === String(filterAssigned))?.displayName || 'Team member'}`}
	                            </span>
	                            <ChevronDown className="h-4 w-4 text-white/60" />
	                          </button>
	                        </DropdownMenuTrigger>
	                        <DropdownMenuContent align="start" className="min-w-[220px] rounded-2xl border border-white/10 bg-black p-1">
	                          <DropdownMenuRadioGroup value={filterAssigned} onValueChange={setFilterAssigned}>
	                            <DropdownMenuRadioItem value="all" className="rounded-xl text-[13px]">
	                              Assigned: All
	                            </DropdownMenuRadioItem>
	                            <DropdownMenuRadioItem value="me" className="rounded-xl text-[13px]">
	                              Assigned: Me
	                            </DropdownMenuRadioItem>
	                            <DropdownMenuRadioItem value="unassigned" className="rounded-xl text-[13px]">
	                              Assigned: Unassigned
	                            </DropdownMenuRadioItem>
	                            <DropdownMenuSeparator className="bg-white/10" />
	                            {setterMembers.map((m) => (
	                              <DropdownMenuRadioItem key={m.id} value={m.userId} className="rounded-xl text-[13px]">
	                                Assigned: {m.displayName || 'Team member'}
	                              </DropdownMenuRadioItem>
	                            ))}
	                          </DropdownMenuRadioGroup>
	                        </DropdownMenuContent>
	                      </DropdownMenu>

	                      <DropdownMenu>
	                        <DropdownMenuTrigger asChild>
	                          <button
	                            type="button"
	                            className="inbox-filter-select h-9 w-full rounded-xl bg-black border border-white/10 px-3 text-sm font-light text-white/80 focus:outline-none hover:bg-white/[0.03] transition-colors inline-flex items-center justify-between gap-2"
	                          >
	                            <span className="inline-flex items-center gap-2 min-w-0">
	                              {filterTemperature === 'hot' ? (
	                                <Flame className="h-3.5 w-3.5 text-[#ff8b4a] fill-current" />
	                              ) : filterTemperature === 'warm' ? (
	                                <Sun className="h-3.5 w-3.5 text-[#facc15] fill-current" />
	                              ) : filterTemperature === 'cold' ? (
	                                <Snowflake className="h-3.5 w-3.5 text-[#93c5fd] fill-current" />
	                              ) : (
	                                <span className="h-2 w-2 rounded-full bg-[#9ca3af]" />
	                              )}
	                              <span className="truncate">
	                                {filterTemperature === 'all'
	                                  ? 'Temperature: All'
	                                  : filterTemperature === 'hot'
	                                    ? 'Temperature: Hot'
	                                    : filterTemperature === 'warm'
	                                      ? 'Temperature: Warm'
	                                      : 'Temperature: Cold'}
	                              </span>
	                            </span>
	                            <ChevronDown className="h-4 w-4 text-white/60" />
	                          </button>
	                        </DropdownMenuTrigger>
	                        <DropdownMenuContent align="start" className="min-w-[220px] rounded-2xl border border-white/10 bg-black p-1">
	                          <DropdownMenuRadioGroup value={filterTemperature} onValueChange={(value) => setFilterTemperature(value as any)}>
	                            <DropdownMenuRadioItem value="all" className="rounded-xl text-[13px]">
	                              <span className="inline-flex items-center gap-2">
	                                <span className="h-2 w-2 rounded-full bg-[#9ca3af]" />
	                                Temperature: All
	                              </span>
	                            </DropdownMenuRadioItem>
	                            <DropdownMenuSeparator className="bg-white/10" />
	                            <DropdownMenuRadioItem value="hot" className="rounded-xl text-[13px]">
	                              <span className="inline-flex items-center gap-2">
	                                <Flame className="h-3.5 w-3.5 text-[#ff8b4a] fill-current" />
	                                Temperature: Hot
	                              </span>
	                            </DropdownMenuRadioItem>
	                            <DropdownMenuRadioItem value="warm" className="rounded-xl text-[13px]">
	                              <span className="inline-flex items-center gap-2">
	                                <Sun className="h-3.5 w-3.5 text-[#facc15] fill-current" />
	                                Temperature: Warm
	                              </span>
	                            </DropdownMenuRadioItem>
	                            <DropdownMenuRadioItem value="cold" className="rounded-xl text-[13px]">
	                              <span className="inline-flex items-center gap-2">
	                                <Snowflake className="h-3.5 w-3.5 text-[#93c5fd] fill-current" />
	                                Temperature: Cold
	                              </span>
	                            </DropdownMenuRadioItem>
	                          </DropdownMenuRadioGroup>
	                        </DropdownMenuContent>
	                      </DropdownMenu>

		                      <div className="col-span-2">
		                        <DropdownMenu>
		                          <DropdownMenuTrigger asChild>
		                            <button
		                              type="button"
	                              className="inbox-filter-select h-9 w-full rounded-xl bg-black border border-white/10 px-3 text-sm font-light text-white/80 focus:outline-none hover:bg-white/[0.03] transition-colors inline-flex items-center justify-between gap-2"
	                            >
	                              <span className="truncate">
	                                {filterSpamMode === 'exclude' ? 'Spam: Exclude' : filterSpamMode === 'include' ? 'Spam: Include' : 'Spam: Only'}
	                              </span>
	                              <ChevronDown className="h-4 w-4 text-white/60" />
	                            </button>
	                          </DropdownMenuTrigger>
	                          <DropdownMenuContent align="start" className="min-w-[220px] rounded-2xl border border-white/10 bg-black p-1">
	                            <DropdownMenuRadioGroup value={filterSpamMode} onValueChange={(value) => setFilterSpamMode(value as any)}>
	                              <DropdownMenuRadioItem value="exclude" className="rounded-xl text-[13px]">
	                                Spam: Exclude
	                              </DropdownMenuRadioItem>
	                              <DropdownMenuRadioItem value="include" className="rounded-xl text-[13px]">
	                                Spam: Include
	                              </DropdownMenuRadioItem>
	                              <DropdownMenuRadioItem value="only" className="rounded-xl text-[13px]">
	                                Spam: Only
	                              </DropdownMenuRadioItem>
	                            </DropdownMenuRadioGroup>
		                          </DropdownMenuContent>
		                        </DropdownMenu>
		                      </div>

                          {userRole !== 'setter' ? (
                            <div className="col-span-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="inbox-filter-select h-9 w-full rounded-xl bg-black border border-white/10 px-3 text-sm font-light text-white/80 focus:outline-none hover:bg-white/[0.03] transition-colors inline-flex items-center justify-between gap-2"
                                  >
                                    <span className="truncate">
                                      {filterPrivateMode === 'exclude'
                                        ? 'Private leads: Exclude'
                                        : filterPrivateMode === 'include'
                                          ? 'Private leads: Include'
                                          : 'Private leads: Only'}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-white/60" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="min-w-[220px] rounded-2xl border border-white/10 bg-black p-1">
                                  <DropdownMenuRadioGroup value={filterPrivateMode} onValueChange={(value) => setFilterPrivateMode(value as any)}>
                                    <DropdownMenuRadioItem value="exclude" className="rounded-xl text-[13px]">
                                      Private leads: Exclude
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="include" className="rounded-xl text-[13px]">
                                      Private leads: Include
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="only" className="rounded-xl text-[13px]">
                                      Private leads: Only
                                    </DropdownMenuRadioItem>
                                  </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ) : null}
		                    </div>
		                    <div>
			                      <div className="inbox-filter-title text-sm font-light text-white/50 mb-2">Phase</div>
		                      <div className="grid grid-cols-2 gap-2">
	                        {FUNNEL_STAGE_ORDER.map((key) => {
	                          const preset = FUNNEL_STAGE_TAG_PRESETS[key];
                            const tag = funnelStageTagByKey[key];
                            const display = {
                              name: tag?.name || preset.name,
                              color: tag?.color || preset.color,
                              icon: tag?.icon || preset.icon,
                            };
	                          const active = filterFunnelStages.includes(key);
	                          return (
	                            <button
	                              key={key}
	                              type="button"
	                              className={cn(
	                                'h-10 rounded-xl border px-3 text-left text-[12px] inline-flex items-center gap-2 transition-colors',
	                                active
	                                  ? 'border-white/30 bg-white/[0.04] text-white'
	                                  : 'border-white/10 text-white/70 hover:text-white hover:bg-white/[0.03]'
	                              )}
	                              onClick={() => {
	                                setFilterFunnelStages((prev) =>
	                                  prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
	                                );
	                              }}
	                            >
	                              <span
	                                className={cn(
	                                  'h-4 w-4 rounded-[5px] border inline-flex items-center justify-center flex-shrink-0',
	                                  active ? 'border-white/30 bg-white text-black' : 'border-white/20 bg-transparent'
	                                )}
	                              >
	                                {active ? <Check className="h-3 w-3" /> : null}
	                              </span>
	                              <TagGlyph
	                                iconName={display.icon}
	                                tagName={display.name}
	                                color={display.color}
	                                className="h-3.5 w-3.5 fill-current"
	                              />
	                              <span className="truncate">{display.name}</span>
	                            </button>
	                          );
	                        })}
	                      </div>
	                    </div>

                      {customTagOptions.length > 0 ? (
                        <div>
                          <div className="inbox-filter-title text-sm font-light text-white/50 mb-2">Phases</div>
                          <div className="grid grid-cols-2 gap-2">
                            {customTagOptions.map((tag) => {
                              const active = filterPhaseTagIds.includes(tag.id);
                              return (
                                <button
                                  key={tag.id}
                                  type="button"
                                  className={cn(
                                    'h-10 rounded-xl border px-3 text-left text-[12px] inline-flex items-center gap-2 transition-colors',
                                    active
                                      ? 'border-white/30 bg-white/[0.04] text-white'
                                      : 'border-white/10 text-white/70 hover:text-white hover:bg-white/[0.03]'
                                  )}
                                  onClick={() => {
                                    setFilterPhaseTagIds((prev) =>
                                      prev.includes(tag.id) ? prev.filter((x) => x !== tag.id) : [...prev, tag.id]
                                    );
                                  }}
                                >
                                  <span
                                    className={cn(
                                      'h-4 w-4 rounded-[5px] border inline-flex items-center justify-center flex-shrink-0',
                                      active ? 'border-white/30 bg-white text-black' : 'border-white/20 bg-transparent'
                                    )}
                                  >
                                    {active ? <Check className="h-3 w-3" /> : null}
                                  </span>
                                  <TagGlyph
                                    iconName={tag.icon}
                                    tagName={tag.name}
                                    color={tag.color}
                                    className="h-3.5 w-3.5 fill-current"
                                  />
                                  <span className="truncate">{tag.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

		                    <div className="flex items-center justify-end gap-2 pt-1">
		                      <button
		                        type="button"
	                        className="h-8 px-2 rounded-lg text-[11px] border border-white/15 text-white/60 hover:text-white"
	                        onClick={() => {
		                          setFilterAssigned('all');
		                          setFilterTemperature('all');
		                          setFilterFunnelStages([]);
                              setFilterPhaseTagIds([]);
		                          setFilterSpamMode('exclude');
		                          setFilterPriorityOnly(false);
	                        }}
		                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        className="h-8 px-2 rounded-lg text-[11px] border border-white/15 text-white/70 hover:text-white"
                        onClick={() => setShowFilterPanel(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={threadListScrollRef}
              onScroll={handleThreadListScroll}
              className="absolute inset-0 overflow-auto hide-scrollbar"
            >
              {visibleThreads.length === 0 ? (
                <div className="p-5 text-xs text-white/40">
                  <div className="font-medium text-white/60">No conversations yet.</div>
                  <div className="mt-2 leading-relaxed">
                    If you already have DMs in Instagram, Meta’s API may not backfill older chats (especially Requests that are inactive). Send a fresh DM to <span className="text-white/70">{meLabel}</span> from another IG account and it should appear here automatically.
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 px-3 rounded-lg border border-white/15 text-[11px] text-white/75 hover:text-white hover:bg-white/[0.04] disabled:opacity-50"
                      onClick={() => handleSyncMessages({ silent: false, fast: true })}
                      disabled={isSyncing}
                    >
                      {isSyncing ? 'Refreshing…' : 'Refresh Inbox'}
                    </button>
                    <a
                      href="https://www.instagram.com/direct/inbox/"
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-3 rounded-lg border border-white/15 text-[11px] text-white/60 hover:text-white hover:bg-white/[0.04] inline-flex items-center"
                    >
                      Open Instagram
                    </a>
                  </div>
                  {syncMeta?.lastError ? (
                    <div className="mt-3 text-xs text-red-400/90">
                      Last update error: {syncMeta.lastError}
                    </div>
                  ) : null}
                  {syncMeta?.warnings?.length ? (
                    <div className="mt-3 text-[11px] text-white/40">
                      {syncMeta.warnings[0]}
                    </div>
                  ) : null}
                  {syncMeta ? (
                    <div className="mt-3 text-[11px] text-white/35">
                      Last sync: {syncMeta.conversationsFetched ?? 0} convs checked, {syncMeta.conversationsWithMessages ?? 0} with messages, {syncMeta.messagesUpserted ?? 0} messages saved.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="py-2">
                  {renderedThreads.map((t) => {
                    const isActive = selectedThread?.conversationId === (t as any).conversationId;
                    const lastAt = (t as any).lastAt as Date | null;
                    const timeLabel = formatRelativeTime(lastAt);
                    const displayName = pickPeerLabel(t as any);
                    const hasAnyMessage = Boolean((t as any).lastMessageId || lastAt);
                    const snippet = coerceThreadPreviewText((t as any).lastText, { allowEmpty: !hasAnyMessage });
                    const isUnread = Boolean((t as any).unread);
                    const conversationId = String((t as any).conversationId);
                    const isPriority = Boolean((t as any).priority);
                    const isSpam = Boolean((t as any).isSpam);
                    const leadStatus = String((t as any).leadStatus || 'open');
                    const assignedLabel = (t as any).assignedUserId
                      ? (memberNameById[String((t as any).assignedUserId)] || 'Assigned')
                      : 'Unassigned';
                    const rowTagIds = conversationTagIds[conversationId] || [];
                    const rowAllTags = rowTagIds.map((id) => tagById[id]).filter(Boolean);
                    const stageKey: FunnelStage =
                      leadStatus === 'qualified'
                        ? 'qualified'
                        : leadStatus === 'disqualified'
                          ? 'unqualified'
                          : (() => {
                              const stages = new Set<FunnelStage>();
                              for (const tag of rowAllTags) {
                                const key = funnelStageKeyFromTagName(tag?.name);
                                if (key) stages.add(key);
                              }
                              for (const key of FUNNEL_STAGE_ORDER) {
                                if (stages.has(key)) return key;
                              }
                              return 'new_lead';
                            })();
                    const stagePreset = FUNNEL_STAGE_TAG_PRESETS[stageKey];
                    const stageTag = funnelStageTagByKey[stageKey];
                    const stageDisplay = {
                      name: stageTag?.name || stagePreset.name,
                      color: stageTag?.color || stagePreset.color,
                      icon: stageTag?.icon || stagePreset.icon,
                    };
                    const rowTags = rowAllTags
                      .filter((tag) => !funnelStageKeyFromTagName(tag?.name))
                      .slice(0, 4);
                    const snoozedUntilMs = (t as any).prioritySnoozedUntil ? (t as any).prioritySnoozedUntil.getTime() : 0;
                    const isSnoozed = Boolean(snoozedUntilMs && snoozedUntilMs > Date.now());
                    return (
                      <div
                        key={conversationId}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedConversationId(conversationId);
                          const markAt = lastAt && lastAt.getTime() > Date.now() ? lastAt : new Date();
                          markThreadRead(conversationId, markAt);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedConversationId(conversationId);
                            const markAt = lastAt && lastAt.getTime() > Date.now() ? lastAt : new Date();
                            markThreadRead(conversationId, markAt);
                          }
                        }}
                        className={`inbox-thread-row group relative w-full px-5 py-4 min-h-[126px] flex items-start gap-3 text-left border-b-[0.5px] border-white/8 hover:bg-white/5 transition-colors ${
                          isActive ? 'bg-white/5' : 'bg-transparent'
                        }`}
                      >
                        <div className="absolute right-5 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="h-8 w-8 rounded-lg border border-white/10 bg-black hover:border-white/20 hover:bg-black text-white grid place-items-center"
                            title={isPriority ? 'Unpin from Priority' : 'Pin user to Priority'}
                            aria-label={isPriority ? 'Unpin from Priority' : 'Pin user to Priority'}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              togglePriority(t as any);
                            }}
                          >
                            <Star className={`h-4 w-4 text-white ${isPriority ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            className="h-8 w-8 rounded-lg border border-white/10 bg-black hover:border-white/20 hover:bg-black text-white grid place-items-center disabled:opacity-40"
                            title={isSpam ? 'Unspam' : 'Mark spam'}
                            aria-label={isSpam ? 'Unspam' : 'Mark spam'}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSpam(t as any);
                            }}
                            disabled={!supportsSpam}
                          >
                            <Ban className="h-4 w-4 text-white" />
                          </button>
                        </div>
                        <div className="relative flex-shrink-0">
                          <ThreadAvatar src={(t as any).peerPicture || null} label={displayName} />
                        </div>
                        <div className="min-w-0 flex-1 -mt-[1px]">
                          <div className="flex items-start justify-between gap-3">
                            <div className={`inbox-thread-name text-sm font-normal truncate mt-0 ${isUnread ? 'text-white' : 'text-white/90'}`}>
                              {displayName}
                            </div>
                            {isUnread ? (
                              <span className="h-3 w-3 rounded-full bg-[#3b82f6] border border-black/80 mt-[11px] mr-[2px] flex-shrink-0" aria-hidden="true" />
                            ) : (
                              <span className="h-3 w-3 mt-[11px] mr-[2px] flex-shrink-0" aria-hidden="true" />
                            )}
                          </div>
	                          <div
	                            className={cn(
	                              'inbox-thread-desc text-[13px] mt-2 leading-[1.25] flex items-center min-w-0',
	                              isUnread ? 'inbox-thread-desc-unread text-white' : 'text-white/45'
	                            )}
	                          >
	                            <span className="min-w-0 flex-initial truncate">{snippet || ' '}</span>
	                            {timeLabel ? (
	                              <span className={cn('shrink-0 whitespace-nowrap', isUnread ? 'inbox-thread-desc-unread text-white' : 'text-white/45')}>
	                                {' · '}{timeLabel}
	                              </span>
	                            ) : null}
	                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <span className="inbox-thread-chip px-2 py-[1px] rounded-full text-[13px] font-normal border border-white/15 bg-transparent text-white/75 inline-flex items-center gap-1">
                              <TagGlyph iconName={stageDisplay.icon} tagName={stageDisplay.name} color={stageDisplay.color} className="h-3 w-3 fill-current" />
                              {stageDisplay.name}
                            </span>
                            <span className="inbox-thread-chip px-2 py-[1px] rounded-full text-[13px] font-normal border border-white/15 bg-transparent text-white/75 inline-flex items-center gap-1">
                              {Boolean((t as any).assignedUserId) ? (
                                <UserRoundCheck className="h-3 w-3 text-[#e5e7eb]" />
                              ) : (
                                <UserRoundX className="h-3 w-3 text-[#e5e7eb]" />
                              )}
                              {assignedLabel}
                            </span>
                            {isSnoozed ? (
                              <span className="inbox-thread-chip px-2 py-[1px] rounded-full text-[13px] font-normal border border-white/15 bg-transparent text-white/75 inline-flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-[#62a8ff]" />
                                Snoozed
                              </span>
                            ) : null}
                            {rowTags.map((tag) => (
                              <span
                                key={`${conversationId}-${tag.id}`}
                                className="inbox-thread-chip px-2 py-[1px] rounded-full text-[13px] font-normal border border-white/15 bg-transparent text-white/75 inline-flex items-center gap-1"
                              >
                                <TagGlyph iconName={tag.icon} tagName={tag.name} color={tag.color} className="h-3 w-3 fill-current" />
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {renderedThreads.length < visibleThreads.length ? (
                    <div className="px-5 py-3 text-[11px] text-white/35">
                      Showing {renderedThreads.length} of {visibleThreads.length}. Scroll to load more.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            {/* Bottom fade (like Mochi) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-32 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/92 to-transparent" />
          </div>
        </div>

        {/* Thread Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedThread ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Inbox className="w-12 h-12 text-[#4b4f55] mx-auto mb-4" />
                <p className="text-white/40 text-sm">Select a conversation</p>
                <p className="text-xs text-white/20 mt-1">to view messages</p>
              </div>
            </div>
          ) : (
              <div className="flex-1 flex flex-col min-h-0">
              <div
                ref={messagesScrollRef}
                className="flex-1 min-h-0 overflow-auto p-4 hide-scrollbar"
                style={{ overflowAnchor: 'none' }}
              >
                {(() => {
                  const parseTimestampMs = (v: any): number => {
                    if (v == null) return 0;
                    if (v instanceof Date) {
                      const t = v.getTime();
                      return Number.isFinite(t) ? t : 0;
                    }
                    if (typeof v === 'number') {
                      if (!Number.isFinite(v)) return 0;
                      // Meta can surface unix seconds or unix ms depending on endpoint.
                      return v < 1e12 ? Math.round(v * 1000) : Math.round(v);
                    }

                    const s = String(v).trim();
                    if (!s) return 0;

                    if (/^\d{10,13}(\.\d+)?$/.test(s)) {
                      const num = Number(s);
                      if (!Number.isFinite(num)) return 0;
                      const digits = s.split('.')[0].length;
                      const ms = digits >= 13 ? num : num * 1000;
                      const d = new Date(ms);
                      const t = d.getTime();
                      return Number.isFinite(t) ? t : 0;
                    }

                    // Normalize timezone offsets like +0000 to +00:00 so Date.parse works consistently.
                    const normalized = s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
                    const t1 = Date.parse(normalized);
                    if (Number.isFinite(t1)) return t1;
                    const t2 = Date.parse(s);
                    return Number.isFinite(t2) ? t2 : 0;
                  };

                  const getMs = (m: any): number => {
                    const primary = parseTimestampMs(m?.message_timestamp);
                    const raw = parseTimestampMs(m?.raw_payload?.created_time ?? m?.raw_payload?.timestamp);
                    const created = parseTimestampMs(m?.created_at);

                    // If we accidentally stored unix-seconds as ms, it shows up as 1970.
                    if (raw && (primary === 0 || primary < 1104537600000) && raw > primary) return raw;
                    if (primary) return primary;
                    if (raw) return raw;
                    if (created) return created;
                    return 0;
                  };

                    const isOutboundMsg = (m: any): boolean => {
                      const peerId = selectedThread.peerId;
                      const sender = m?.sender_id != null ? String(m.sender_id) : '';
                      const recipient = m?.recipient_id != null ? String(m.recipient_id) : '';
                      const selfIds = new Set<string>();
                      if (selectedThread.instagramAccountId) selfIds.add(String(selectedThread.instagramAccountId));
                      if (connection?.facebook_user_id) selfIds.add(String(connection.facebook_user_id));
                      if (connection?.page_id) selfIds.add(String(connection.page_id));

                    if (sender && peerId && sender === peerId) return false;
                    if (recipient && peerId && recipient === peerId) return true;

                      if (sender && selfIds.has(sender)) return true;
                      if (recipient && selfIds.has(recipient)) return false;

                    const rawSender = m?.raw_payload?.from?.id ?? m?.raw_payload?.sender?.id ?? null;
                    const rawRecipient = m?.raw_payload?.recipient?.id ?? null;
                    const rawSenderStr = rawSender != null ? String(rawSender) : '';
                    const rawRecipientStr = rawRecipient != null ? String(rawRecipient) : '';

                    if (rawSenderStr && peerId && rawSenderStr === peerId) return false;
                    if (rawRecipientStr && peerId && rawRecipientStr === peerId) return true;
                      if (rawSenderStr && selfIds.has(rawSenderStr)) return true;
                      if (rawRecipientStr && selfIds.has(rawRecipientStr)) return false;

                    const dir = m?.direction ? String(m.direction) : '';
                    if (dir === 'outbound') return true;
                    if (dir === 'inbound') return false;

                    return false;
                  };

                  const sorted = (Array.isArray(displayedMessages) ? displayedMessages : [])
                    .map((m, idx) => ({ m, idx }))
                    .sort((a, b) => {
                      const ta = getMs(a.m);
                      const tb = getMs(b.m);
                      if (ta !== tb) return ta - tb;
                      return a.idx - b.idx;
                    })
                    .map((x) => x.m);

                  if (sorted.length === 0) {
                    return isMessagesLoading ? null : null;
                  }

                  const formatChatSeparatorLabel = (ms: number) => {
                    const d = new Date(ms);
                    const t = d.getTime();
                    if (!Number.isFinite(t)) return '';
                    const ageDays = Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
                    if (ageDays < 7) return format(d, 'EEE h:mm a');
                    return format(d, 'MMM d, h:mm a');
                  };

                  const needsSeparatorBetween = (prevMs: number, curMs: number) => {
                    if (!curMs) return false;
                    if (!prevMs) return true;
                    const gap = curMs - prevMs;
                    const prev = new Date(prevMs);
                    const cur = new Date(curMs);
                    const dayChanged =
                      prev.getFullYear() !== cur.getFullYear() ||
                      prev.getMonth() !== cur.getMonth() ||
                      prev.getDate() !== cur.getDate();
                    // Instagram-style timestamp: show at least once per hour or when day changes.
                    return dayChanged || gap >= 60 * 60 * 1000;
                  };

                  return sorted.map((msg: any, idx: number) => {
                    const isOutbound = isOutboundMsg(msg);
                    const payloadMessage = msg?.raw_payload?.message;
                    const payloadTextCandidate =
                      typeof payloadMessage === 'string'
                        ? payloadMessage
                        : (payloadMessage && typeof payloadMessage === 'object' && payloadMessage?.text != null
                            ? String(payloadMessage.text)
                            : '');
                    const payloadText = payloadTextCandidate || (msg?.raw_payload?.text != null ? String(msg.raw_payload.text) : '');
                    const text = msg?.message_text != null ? String(msg.message_text) : payloadText;
                    const replyToText = msg?.raw_payload?.reply_to_text ? String(msg.raw_payload.reply_to_text) : '';
                    const storedAttachments: any[] = Array.isArray(msg?.raw_payload?.stored_attachments)
                      ? msg.raw_payload.stored_attachments
                      : [];
                    const fallbackAttachments: any[] =
                      storedAttachments.length === 0 ? extractFallbackAttachmentsFromRawPayload(msg?.raw_payload) : [];
                    const attachmentsForRender = storedAttachments.length > 0 ? storedAttachments : fallbackAttachments;
                    const attachmentPreviewText = previewTextFromAttachments(attachmentsForRender);
                    const trimmedText = text.trim();
                    const showText = Boolean(trimmedText) && !(isPlaceholderMessageText(trimmedText) && attachmentsForRender.length > 0);
                    const isEmojiOnly =
                      showText &&
                      !replyToText &&
                      attachmentsForRender.length === 0 &&
                      isEmojiOnlyMessageText(trimmedText);
                    const myReaction = msg?.raw_payload?.my_reaction ? String(msg.raw_payload.my_reaction) : '';

                    const curMs = getMs(msg);
                    const prev = idx > 0 ? sorted[idx - 1] : null;
                    const prevMs = prev ? getMs(prev) : 0;
                    const showSeparator = idx === 0 ? true : needsSeparatorBetween(prevMs, curMs);

                    const prevIsOutbound = prev ? isOutboundMsg(prev) : null;
                    const senderChanged = idx === 0 ? true : prevIsOutbound !== isOutbound;

                    const next = idx + 1 < sorted.length ? sorted[idx + 1] : null;
                    const nextMs = next ? getMs(next) : 0;
                    const showInboundAvatar =
                      !isOutbound &&
                      (!next || isOutboundMsg(next) || needsSeparatorBetween(curMs, nextMs));

                    return (
                      <div
                        key={msg.id || msg.message_id || `msg-${idx}`}
                        className={`space-y-2 ${idx === 0 || showSeparator ? 'pt-0' : senderChanged ? 'pt-3' : 'pt-1'}`}
                      >
                        {showSeparator ? (
                          <div className="flex justify-center py-2">
                            <div className="text-[11px] text-white/35">{curMs ? formatChatSeparatorLabel(curMs) : ''}</div>
                          </div>
                        ) : null}

                        <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                          {!isOutbound ? (
                            <div className="w-10 flex items-end justify-center mr-2">
                              {showInboundAvatar ? (
                                <ChatAvatar
                                  src={selectedThread.peerPicture || null}
                                  label={pickPeerLabel(selectedThread)}
                                />
                              ) : (
                                <div className="w-7 h-7" />
                              )}
                            </div>
                          ) : null}

                          <div className="relative group max-w-[70%]">
                            <div
                              className={cn(
                                isEmojiOnly
                                  ? 'bg-transparent text-white'
                                  : 'rounded-2xl px-3 py-2',
                                isEmojiOnly
                                  ? null
                                  : isOutbound
                                    ? 'bg-white text-black border-0'
                                    : 'bg-[rgba(58,61,66,0.84)] text-white border-0'
                              )}
                            >
                            {replyToText ? (
                              <div
                                className={`mb-2 px-2 py-1 rounded-xl border-l-2 ${
                                  isOutbound
                                    ? 'bg-black/[0.04] border-black/30 text-black/65'
                                    : 'bg-white/[0.04] border-white/30 text-white/65'
                                }`}
                              >
                                <div className="text-[11px] leading-snug line-clamp-2">{replyToText}</div>
                              </div>
                            ) : null}
                            {attachmentsForRender.length > 0 && (
                              <div className="space-y-2 mb-2">
                                {attachmentsForRender.map((att, idx2) => {
                                  const url = att?.public_url || att?.source_url;
                                  const type = String(att?.type || '');
                                  const explicitKind = att?.share_kind ? String(att.share_kind).toLowerCase() : '';
                                  const shareKind =
                                    explicitKind === 'reel' || explicitKind === 'post' || explicitKind === 'story'
                                      ? (explicitKind as any)
                                      : inferShareKind(type, typeof url === 'string' ? String(url) : null);
                                  if (shareKind && !url) {
                                    const label =
                                      shareKind === 'reel'
                                        ? 'Shared a reel'
                                        : shareKind === 'story'
                                          ? 'Shared a story'
                                          : 'Shared a post';
                                    return (
                                      <span
                                        key={`${msg.id || msg.message_id}-att-${idx2}`}
                                        className={`text-xs ${isOutbound ? 'text-black/70' : 'text-white/60'}`}
                                      >
                                        {label}
                                      </span>
                                    );
                                  }
                                  const isImage =
                                    type === 'image' ||
                                    (typeof url === 'string' && /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url));
                                  if (!url) return null;
                                  if (shareKind) {
                                    const label =
                                      shareKind === 'reel'
                                        ? 'See reel'
                                        : shareKind === 'story'
                                          ? 'See story'
                                          : 'See post';
                                    return (
                                      <a
                                        key={`${msg.id || msg.message_id}-att-${idx2}`}
                                        href={String(url)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`text-xs underline ${isOutbound ? 'text-black/80' : 'text-white/70'}`}
                                      >
                                        {label}
                                      </a>
                                    );
                                  }
                                  if (isImage) {
                                    return (
                                      <img
                                        key={`${msg.id || msg.message_id}-att-${idx2}`}
                                        src={url}
                                        alt="attachment"
                                        className="rounded-xl max-h-64 w-auto border border-white/10 cursor-zoom-in"
                                        loading="lazy"
                                        onClick={() => setLightboxUrl(String(url))}
                                      />
                                    );
                                  }
                                  return (
                                    <a
                                      key={`${msg.id || msg.message_id}-att-${idx2}`}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`text-xs underline ${isOutbound ? 'text-black/80' : 'text-white/70'}`}
                                    >
                                      Open attachment
                                    </a>
                                  );
                                })}
                              </div>
                            )}

                            {showText ? (
                              isEmojiOnly ? (
                                <div className="whitespace-pre-wrap text-[44px] leading-none">{trimmedText}</div>
                              ) : (
                                <div className="text-xs whitespace-pre-wrap leading-relaxed">
                                  {renderTextWithLinks(trimmedText, { theme: isOutbound ? 'outbound' : 'inbound' })}
                                </div>
                              )
                            ) : attachmentsForRender.length === 0 ? (
                              <SeeOnInstagramFallback theme={isOutbound ? 'outbound' : 'inbound'} />
                            ) : null}
                            </div>

                            {/* Hover actions (Instagram-like) */}
                            <div
                              className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 ${
                                isOutbound ? 'right-full mr-2' : 'left-full ml-2'
                              } opacity-0 group-hover:opacity-100`}
                            >
                              <button
                                type="button"
                                className="h-8 w-8 rounded-full border border-white/10 bg-black text-[#aab0b8] hover:text-[#e3e6ea] hover:bg-white/[0.03] grid place-items-center"
                                onClick={() => {
                                  const preview = (
                                    (showText ? trimmedText : '') ||
                                    attachmentPreviewText ||
                                    (attachmentsForRender.length ? '[attachment]' : '(no text)')
                                  ).trim();
                                  setReplyTo({
                                    messageId: msg?.message_id ? String(msg.message_id) : null,
                                    preview: preview.length > 140 ? `${preview.slice(0, 140)}…` : preview,
                                  });
                                }}
                                aria-label="Reply"
                                title="Reply"
                              >
                                <Reply className="h-4 w-4" />
                              </button>
                              {!isOutbound ? (
                                <button
                                  type="button"
                                  className="h-8 w-8 rounded-full border border-white/10 bg-black text-[#aab0b8] hover:text-[#e3e6ea] hover:bg-white/[0.03] grid place-items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={() => reactToMessage(msg)}
                                  disabled={isReacting || !msg?.message_id}
                                  aria-label="React"
                                  title="React"
                                >
                                  <Heart className={`h-4 w-4 ${myReaction ? 'fill-[#ff3040] text-[#ff3040]' : ''}`} />
                                </button>
                              ) : null}
                            </div>

                            {myReaction ? (
                              <div className={`absolute -bottom-3 ${isOutbound ? 'right-2' : 'left-2'}`}>
                                <div className="h-6 w-6 rounded-full border border-white/10 bg-black grid place-items-center">
                                  <span className="text-[12px] leading-none">❤️</span>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

	              {/* Composer */}
	              <div className="p-4">
	                {replyTo ? (
	                  <div className="mb-3 px-3 py-2 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] text-white/50">Replying</div>
                      <div className="text-[12px] text-white/75 truncate">{replyTo.preview}</div>
                    </div>
                    <button
                      type="button"
                      className="h-8 w-8 rounded-xl border border-white/10 bg-black text-[#8d9198] hover:text-[#d6d9de] hover:bg-white/[0.03] grid place-items-center flex-shrink-0"
                      onClick={() => setReplyTo(null)}
                      aria-label="Cancel reply"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
	                  </div>
	                ) : null}
	                {pendingImagePreviewUrl ? (
	                  <div className="mb-3 px-3 py-2 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
	                    <div className="flex items-center gap-3 min-w-0">
	                      <img
	                        src={pendingImagePreviewUrl}
	                        alt="attachment preview"
	                        className="h-10 w-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
	                      />
	                      <div className="min-w-0">
	                        <div className="text-[12px] text-white/75 truncate">
	                          {pendingImageFile?.name ? String(pendingImageFile.name) : 'Image'}
	                        </div>
	                        <div className="text-[11px] text-white/40">Ready to send</div>
	                      </div>
	                    </div>
	                    <button
	                      type="button"
	                      className="h-8 w-8 rounded-xl border border-white/10 bg-black text-[#8d9198] hover:text-[#d6d9de] hover:bg-white/[0.03] grid place-items-center flex-shrink-0"
	                      onClick={() => {
	                        setPendingImageFile(null);
	                        if (attachmentInputRef.current) attachmentInputRef.current.value = '';
	                      }}
	                      aria-label="Remove attachment"
	                      title="Remove"
	                    >
	                      <X className="h-4 w-4" />
	                    </button>
	                  </div>
	                ) : null}
	                <div className="relative">
	                  <input
	                    ref={attachmentInputRef}
	                    type="file"
	                    accept="image/*"
	                    className="hidden"
	                    onChange={(e) => {
	                      const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
	                      if (!file) return;
	                      setPendingImageFile(file);
	                    }}
	                  />
		                  <textarea
		                    value={draftMessage}
		                    onChange={(e) => setDraftMessage(e.target.value)}
		                    placeholder="Message…"
		                    rows={1}
		                    className="w-full min-h-[48px] max-h-32 resize-none rounded-[999px] bg-black border border-white/10 pl-20 pr-14 py-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
		                    onKeyDown={(e) => {
		                      if (e.key === 'Enter' && !e.shiftKey) {
		                        e.preventDefault();
		                        sendFromComposer();
		                      }
		                    }}
		                  />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 -mt-[3px] flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => attachmentInputRef.current?.click()}
                          disabled={isSending}
                          className="h-8 w-8 rounded-full bg-transparent text-white/70 hover:text-white grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Add image"
                          title="Add image"
                        >
                          <Image className="h-4 w-4 -translate-y-[1px]" />
                        </button>

                        <Popover open={bookCallPopoverOpen} onOpenChange={setBookCallPopoverOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              disabled={isSending || !selectedThread}
                              className="h-8 w-8 rounded-full bg-transparent text-white/70 hover:text-white grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Book call"
                              title="Book call"
                            >
                              <Calendar className="h-4 w-4 -translate-y-[1px]" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="start" side="top" sideOffset={10} className="w-[220px] rounded-xl border border-white/10 bg-black p-1.5">
                            <button
                              type="button"
                              onClick={sendBookingLink}
                              disabled={isSending || isBookingLinkBusy || !selectedThread}
                              className="w-full h-9 rounded-lg px-3 text-left text-[13px] text-white/80 hover:text-white hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isBookingLinkBusy ? 'Loading…' : 'Send booking link'}
                            </button>
                            <button
                              type="button"
                              onClick={copyBookingLink}
                              disabled={isSending || isBookingLinkBusy || !selectedThread}
                              className="w-full h-9 rounded-lg px-3 text-left text-[13px] text-white/80 hover:text-white hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Copy booking link
                            </button>
                            {userRole !== 'setter' ? (
                              <button
                                type="button"
                                disabled
                                className="w-full h-9 rounded-lg px-3 text-left text-[13px] text-white/45 bg-white/[0.01] cursor-not-allowed"
                              >
                                Schedule call · Coming soon
                              </button>
                            ) : null}
                          </PopoverContent>
                        </Popover>
                      </div>
		                  <button
		                    type="button"
		                    onClick={sendFromComposer}
		                    disabled={isSending || (!draftMessage.trim() && !pendingImageFile)}
	                    className="absolute right-3 top-1/2 -translate-y-1/2 -mt-[2px] h-8 w-8 rounded-full bg-transparent text-white/85 hover:text-white grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
	                    aria-label="Send"
	                    title="Send"
	                  >
	                    <Send className="h-4 w-4" />
	                  </button>
	                </div>
	              </div>
            </div>
          )}
        </div>

        {/* Lead + Ops Panel */}
        <div className="w-[340px] border-l-[0.5px] border-white/10 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 overflow-auto p-5 hide-scrollbar space-y-4">
            {selectedThread ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center pt-2">
                  <ThreadAvatar src={selectedThread.peerPicture || null} label={pickPeerLabel(selectedThread)} size="lg" />
                  <div className="mt-3 text-[18px] font-semibold text-white/92 text-center">{pickPeerLabel(selectedThread)}</div>
                  <div className="mt-1 text-[14px] text-white/35 text-center">
                    {selectedThread.peerUsername ? `@${selectedThread.peerUsername}` : '@instagram_user'}
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-10 rounded-xl border border-white/10 bg-transparent px-3 text-[13px] text-white/85 hover:bg-white/[0.03] flex items-center justify-between"
                    >
                      <span className="inline-flex items-center gap-2">
                        {selectedTemperature === 'hot' ? (
                          <Flame className="h-3.5 w-3.5 text-[#ff8b4a] fill-current" />
                        ) : selectedTemperature === 'warm' ? (
                          <Sun className="h-3.5 w-3.5 text-[#facc15] fill-current" />
                        ) : selectedTemperature === 'cold' ? (
                          <Snowflake className="h-3.5 w-3.5 text-[#93c5fd] fill-current" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-[#9ca3af]" />
                        )}
                        {selectedTemperature === 'hot'
                          ? 'Hot'
                          : selectedTemperature === 'warm'
                            ? 'Warm'
                          : selectedTemperature === 'cold'
                              ? 'Cold'
                              : 'No temperature'}
                      </span>
                      <span className="text-white/45">›</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="center" side="bottom" sideOffset={6} className="w-[220px] rounded-xl border border-white/10 bg-black p-1.5">
                    <div className="space-y-1">
                      {[
                        { value: 'hot', label: 'Hot', icon: Flame, iconClass: 'text-[#ff8b4a]' },
                        { value: 'warm', label: 'Warm', icon: Sun, iconClass: 'text-[#facc15]' },
                        { value: 'cold', label: 'Cold', icon: Snowflake, iconClass: 'text-[#93c5fd]' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={`w-full h-8 rounded-lg px-2 text-left text-[12px] transition-colors inline-flex items-center gap-2 ${
                            selectedTemperature === item.value
                              ? 'text-white bg-white/[0.06]'
                              : 'text-white/75 hover:text-white hover:bg-white/[0.04]'
                          }`}
                          onClick={() => setThreadTemperature(selectedThread, item.value as TemperatureLevel)}
                        >
                          <item.icon className={`h-3.5 w-3.5 fill-current ${item.iconClass}`} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="rounded-xl border border-white/10 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
	                      <div className="inline-flex items-center gap-2 text-[13px] text-white/78">
	                      <TagIcon className="h-3.5 w-3.5 text-[#58a6ff]" />
	                      Phase
	                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
	                          className="h-8 w-8 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.04] grid place-items-center"
	                          aria-label="Manage phase"
	                          title="Manage phase"
	                        >
                          +
                        </button>
	                      </PopoverTrigger>
	                      <PopoverContent align="end" side="bottom" sideOffset={6} className="w-[280px] rounded-xl border border-white/10 bg-black p-2">
	                        <div className="space-y-1">
	                          {FUNNEL_STAGE_ORDER.map((key) => {
	                            const preset = FUNNEL_STAGE_TAG_PRESETS[key];
                              const tag = funnelStageTagByKey[key];
                              const display = {
                                name: tag?.name || preset.name,
                                color: tag?.color || preset.color,
                                icon: tag?.icon || preset.icon,
                              };
	                            const active = selectedFunnelStage === key;
	                            return (
	                              <button
	                                key={key}
	                                type="button"
	                                className={`w-full h-8 rounded-lg px-2 text-left text-[12px] flex items-center gap-2 transition-colors ${
	                                  active ? 'text-white bg-white/[0.06]' : 'text-white/75 hover:text-white hover:bg-white/[0.04]'
	                                }`}
	                                onClick={() => setThreadFunnelStage(selectedThread, key)}
	                              >
	                                <TagGlyph iconName={display.icon} tagName={display.name} color={display.color} className="h-3.5 w-3.5 fill-current" />
	                                {display.name}
	                              </button>
	                            );
	                          })}
	                        </div>
	                      </PopoverContent>
	                    </Popover>
	                  </div>
	                  <div className="flex flex-wrap gap-1.5">
	                    {selectedFunnelStage ? (
	                      (() => {
	                        const preset = FUNNEL_STAGE_TAG_PRESETS[selectedFunnelStage];
                          const tag = funnelStageTagByKey[selectedFunnelStage];
                          const display = {
                            name: tag?.name || preset.name,
                            color: tag?.color || preset.color,
                            icon: tag?.icon || preset.icon,
                          };
	                        return (
	                          <span
	                            className="px-2 py-[2px] rounded-[10px] text-[10px] border border-transparent text-white inline-flex items-center gap-1.5"
	                            style={{ backgroundColor: colorWithAlpha(display.color, 0.22) }}
	                          >
	                            <TagGlyph iconName={display.icon} tagName={display.name} color={display.color} className="h-3 w-3 fill-current" />
	                            {display.name}
	                          </span>
	                        );
	                      })()
	                    ) : null}
	                  </div>
	                </div>

                {customTagOptions.length > 0 ? (
                  <div className="rounded-xl border border-white/10 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-[13px] text-white/78">
                        <TagIcon className="h-3.5 w-3.5 text-[#58a6ff]" />
                        Phases
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="h-8 w-8 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.04] grid place-items-center"
                            aria-label="Manage phases"
                            title="Manage phases"
                          >
                            +
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" side="bottom" sideOffset={6} className="w-[280px] rounded-xl border border-white/10 bg-black p-2">
                          <div className="space-y-1">
                            {customTagOptions.map((tag) => {
                              const active = selectedConversationTagIds.includes(tag.id);
                              return (
                                <button
                                  key={tag.id}
                                  type="button"
                                  className={`w-full h-8 rounded-lg px-2 text-left text-[12px] flex items-center gap-2 transition-colors ${
                                    active ? 'text-white bg-white/[0.06]' : 'text-white/75 hover:text-white hover:bg-white/[0.04]'
                                  }`}
                                  onClick={() => toggleTagOnThread(selectedThread.conversationId, tag.id)}
                                >
                                  <span className="h-4 w-4 grid place-items-center">
                                    {active ? <Check className="h-3.5 w-3.5" /> : null}
                                  </span>
                                  <TagGlyph
                                    iconName={tag.icon}
                                    tagName={tag.name}
                                    color={tag.color}
                                    className="h-3.5 w-3.5 fill-current"
                                  />
                                  <span className="truncate">{tag.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {selectedCustomTags.length > 0 ? (
                        selectedCustomTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            className="px-2 py-[2px] rounded-[10px] text-[10px] border border-transparent text-white inline-flex items-center gap-1.5 hover:opacity-90"
                            style={{ backgroundColor: colorWithAlpha(tag.color, 0.22) }}
                            onClick={() => toggleTagOnThread(selectedThread.conversationId, tag.id)}
                            title="Click to remove"
                          >
                            <TagGlyph
                              iconName={tag.icon}
                              tagName={tag.name}
                              color={tag.color}
                              className="h-3 w-3 fill-current"
                            />
                            {tag.name}
                          </button>
                        ))
                      ) : (
                        <div className="text-[11px] text-white/40">No phases</div>
                      )}
                    </div>
                  </div>
                ) : null}

	                <div className="grid grid-cols-1 gap-2">
	                  <div className="rounded-xl border border-white/10 p-3">
	                    <div className="text-[11px] text-white/50 mb-1">Setter</div>
	                    <DropdownMenu>
	                      <DropdownMenuTrigger asChild>
	                        <button
	                          type="button"
	                          className="w-full h-8 rounded-lg bg-black border border-white/10 px-2 text-[11px] text-white/80 focus:outline-none hover:bg-white/[0.03] transition-colors inline-flex items-center justify-between gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
	                          disabled={userRole !== 'owner'}
	                        >
	                          <span className="truncate">
	                            {selectedThread.assignedUserId
	                              ? setterMembers.find((m) => String(m.userId) === String(selectedThread.assignedUserId))?.displayName ||
	                                memberNameById[String(selectedThread.assignedUserId)] ||
	                                'Team member'
	                              : 'Unassigned'}
	                          </span>
	                          <ChevronDown className="h-3.5 w-3.5 text-white/55" />
	                        </button>
	                      </DropdownMenuTrigger>
	                      <DropdownMenuContent align="start" className="min-w-[220px] rounded-2xl border border-white/10 bg-black p-1">
	                        <DropdownMenuRadioGroup
	                          value={selectedThread.assignedUserId || '__none__'}
	                          onValueChange={(value) =>
	                            assignThread(selectedThread, value === '__none__' ? null : value)
	                          }
	                        >
	                          <DropdownMenuRadioItem value="__none__" className="rounded-xl text-[13px]">
	                            Unassigned
	                          </DropdownMenuRadioItem>
	                          <DropdownMenuSeparator className="bg-white/10" />
	                          {setterMembers.map((m) => (
	                            <DropdownMenuRadioItem key={m.id} value={m.userId} className="rounded-xl text-[13px]">
	                              {m.displayName || 'Team member'}
	                            </DropdownMenuRadioItem>
	                          ))}
	                        </DropdownMenuRadioGroup>
	                      </DropdownMenuContent>
	                    </DropdownMenu>
	                  </div>
	                </div>

                {userRole === 'owner' ? (
                  <div className="rounded-xl border border-white/10 p-3 space-y-3">
                    <div className="text-[11px] text-white/50">Setter visibility</div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[12px] text-white/85">Private lead</div>
                        <div className="text-[10px] text-white/40">Hide this conversation from setters.</div>
                      </div>
                      <Switch
                        checked={selectedThread.hiddenFromSetters}
                        onCheckedChange={(checked) =>
                          setThreadSetterVisibility(selectedThread, {
                            hiddenFromSetters: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                ) : null}

                <div className="-mx-5 px-5 border-t-[0.5px] border-white/10">
                  <div className="flex items-center justify-between">
                    {([
                      { id: 'summary', label: 'Summary' },
                      { id: 'team', label: 'Team' },
                      { id: 'calls', label: 'Calls' },
                    ] as const).map((tab) => {
                      const active = rightPanelTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          className={`relative py-3 text-[13px] ${active ? 'text-white/90' : 'text-white/45 hover:text-white/75'}`}
                          onClick={() => setRightPanelTab(tab.id)}
                        >
                          {tab.label}
                          {active ? <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-white/85" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {rightPanelTab === 'summary' ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.01] p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/85">AI Summary</div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-8 px-2 rounded-xl border border-white/10 text-[11px] text-[#8d9198] hover:text-[#d6d9de]"
                          onClick={() => summarizeSelectedConversation(false)}
                          disabled={isSummarizing}
                        >
                          {isSummarizing ? 'Summarizing...' : 'Summarize'}
                        </button>
                        <button
                          type="button"
                          className="h-8 px-2 rounded-xl border border-white/10 text-[11px] text-[#8d9198] hover:text-[#d6d9de]"
                          onClick={() => summarizeSelectedConversation(true)}
                          disabled={isSummarizing}
                        >
                          Refresh
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-[12px] text-white/65 whitespace-pre-wrap leading-relaxed">
                      {selectedThread.summaryText || 'No summary yet.'}
                    </div>
                  </div>
                ) : null}

                {rightPanelTab === 'team' ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.01] p-4 space-y-3">
                    <div className="text-sm text-white/85">Internal team chat</div>
                    <div className="text-[12px] text-white/55">
                      {selectedThread.assignedUserId
                        ? `Assigned setter: ${memberNameById[selectedThread.assignedUserId] || 'Team member'}`
                        : selectedThread.sharedWithSetters
                          ? 'Shared with all setters.'
                          : 'No setter assigned yet.'}
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                      <div className="max-h-40 overflow-auto hide-scrollbar space-y-2 pr-1">
                        {isLeadTeamLoading ? (
                          <div className="text-[11px] text-white/45">Loading internal chat…</div>
                        ) : selectedLeadTeamMessages.length === 0 ? (
                          <div className="text-[11px] text-white/45">No internal notes yet.</div>
                        ) : (
                          selectedLeadTeamMessages.map((msg) => (
                            <div key={msg.id} className="rounded-lg border border-white/10 px-2 py-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-[10px] text-white/70 truncate">
                                  {msg.authorUserId === user?.id
                                    ? 'You'
                                    : memberNameById[msg.authorUserId] || 'Team member'}
                                </div>
                                <div className="text-[10px] text-white/40">{formatRelativeTimeAgo(msg.createdAt)}</div>
                              </div>
                              <div className="mt-1 text-[11px] text-white/80 whitespace-pre-wrap break-words">
                                {msg.body}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          value={leadTeamDraft}
                          onChange={(e) => setLeadTeamDraft(e.target.value)}
                          placeholder="Write internal note…"
                          className="flex-1 h-8 rounded-lg border border-white/10 bg-black px-2 text-[11px] text-white/80 placeholder:text-white/35 focus:outline-none"
                          maxLength={4000}
                        />
                        <button
                          type="button"
                          className="h-8 px-2 rounded-lg border border-white/10 text-[11px] text-[#8d9198] hover:text-[#d6d9de] disabled:opacity-50"
                          onClick={sendLeadTeamMessage}
                          disabled={isSendingLeadTeamMessage || leadTeamDraft.trim().length === 0}
                        >
                          {isSendingLeadTeamMessage ? 'Sending…' : 'Send'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] text-white/55">Open alerts</div>
                      {alerts.filter((a) => a.conversationId === selectedThread.conversationId).length === 0 ? (
                        <div className="text-[11px] text-white/45">No open alerts for this lead.</div>
                      ) : (
                        alerts
                          .filter((a) => a.conversationId === selectedThread.conversationId)
                          .map((alert) => (
                            <div key={alert.id} className="rounded-lg border border-white/10 px-2 py-2">
                              <div className="text-[11px] text-white/80">{alert.type.replaceAll('_', ' ')}</div>
                              <div className="text-[10px] text-white/50 mt-1">
                                Overdue {Math.max(1, Math.floor(alert.overdueMinutes / 60))}h
                              </div>
                              <button
                                type="button"
                                className="mt-2 h-7 px-2 rounded-lg border border-white/10 text-[10px] text-[#8d9198] hover:text-[#d6d9de]"
                                onClick={() => resolveAlert(alert.id)}
                              >
                                Mark resolved
                              </button>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                ) : null}

                {rightPanelTab === 'calls' ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.01] p-4">
                    <div className="text-sm text-white/85">Calls</div>
                    <div className="mt-2 text-[12px] text-white/50">No call timeline events yet.</div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                <div className="h-14 w-14 rounded-full border border-white/10 bg-white/[0.03] grid place-items-center">
                  <User className="h-6 w-6 text-white/55" />
                </div>
                <div className="mt-4 text-sm text-white/70">Select a conversation to view details</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl ? (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute top-4 right-4 h-10 w-10 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors grid place-items-center text-white/80"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxUrl(null);
            }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={lightboxUrl}
            alt="attachment"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </DashboardLayout>
  );
}
