import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Inbox, Settings, LogOut, HelpCircle, Shield2, HorizontalMenuSquare, LayoutDashboard, PlayList1, SignalFull, UserWorkLaptopWifi, Script1 } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { orbCssVars } from '@/lib/colors';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { hasSetterMetadataHint, hasSetterRoleHint } from '@/lib/setterRoleHint';
import { supabase } from '@/integrations/supabase/client';
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  badgeCount?: number;
}
function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
  badgeCount = 0,
}: NavItemProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const safeBadge = Math.max(0, Number(badgeCount) || 0);
  const badgeLabel = safeBadge > 9 ? '9+' : String(safeBadge);

  return <button onClick={() => {
    setTooltipVisible(false);
    onClick();
  }} onMouseEnter={() => setTooltipVisible(true)} onMouseLeave={() => setTooltipVisible(false)} data-sidebar-nav="true" className={cn('sidebar-nav-item group relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-150', active ? 'bg-[#1a1a1a]' : 'bg-transparent hover:bg-[#1a1a1a]')} aria-label={label}>
      <Icon className="w-[20px] h-[20px] shrink-0 text-white" strokeWidth={1.5} />
      {safeBadge > 0 ? <span className="absolute right-[8px] top-[8px] min-w-[17px] h-[17px] rounded-full bg-[#2d5bff] px-[4px] text-[11px] font-medium text-white leading-[17px] text-center ring-[1.5px] ring-[#0a0a0a]">
          {badgeLabel}
        </span> : null}
      <div
        className={cn(
          'pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-[#1a1a1a] px-4 py-2 text-[14px] font-normal text-white/95 shadow-[0_0_24px_rgba(0,0,0,0.17)] transition-all duration-180 ease-out',
          tooltipVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1',
        )}
      >
        {label}
      </div>
      <span className="sr-only">{label}</span>
    </button>;
}

// Profile avatar with radial gradient and inset shadows - aligned with nav icons
export function ProfileAvatar({
  name,
  size = 'md',
  bgColor,
  imageUrl,
  mode = 'photo'
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'nav';
  bgColor?: string;
  imageUrl?: string | null;
  mode?: 'photo' | 'letter';
}) {
  const firstLetter = name.charAt(0).toUpperCase();
  const sizeClasses = {
    nav: 'w-4 h-4 text-[10px]',
    // Match nav icon size
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl'
  };
  const baseColor = bgColor || '#2A2A2A';
  const usePhoto = mode === 'photo' && imageUrl;
  return (
    <div
      className={cn(
        sizeClasses[size],
        'acq-orb flex items-center justify-center shrink-0 font-medium text-[#d5d9df]'
      )}
      style={orbCssVars(baseColor) as any}
    >
      {usePhoto ? (
        <img
          src={imageUrl || undefined}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        firstLetter
      )}
    </div>
  );
}

// Premium glass icon with embedded letter
export function PremiumGlassAvatar({
  name,
  size = 128
}: {
  name: string;
  size?: number;
}) {
  const firstLetter = name.charAt(0).toUpperCase();
  return <div className="relative flex items-center justify-center" style={{
    width: size,
    height: size,
    borderRadius: size * 0.22,
    background: `
          radial-gradient(ellipse 120% 80% at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, #0a0f1a 0%, #050810 100%)
        `,
    boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.1),
          inset 0 -1px 0 rgba(0,0,0,0.3),
          0 25px 50px -12px rgba(0,0,0,0.8),
          0 0 0 1px rgba(255,255,255,0.05)
        `
  }}>
      {/* Top highlight edge */}
      <div className="absolute inset-0 pointer-events-none" style={{
      borderRadius: size * 0.22,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 30%)'
    }} />
      
      {/* The embedded letter */}
      <span className="relative z-10 font-medium select-none" style={{
      fontSize: size * 0.45,
      fontFamily: 'DM Sans, system-ui, sans-serif',
      fontWeight: 500,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(180deg, #d4d4d4 0%, #a3a3a3 50%, #9a9a9a 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
    }}>
        {firstLetter}
      </span>
      
      {/* Bottom blue glow line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{
      width: size * 0.6,
      height: 2,
      background: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.6) 50%, transparent 100%)',
      filter: 'blur(1px)',
      borderRadius: 1
    }} />
      
      {/* Bottom glow spread */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2" style={{
      width: size * 0.8,
      height: 8,
      background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.15) 0%, transparent 70%)',
      filter: 'blur(4px)'
    }} />
    </div>;
}
export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { userRole, workspace } = useWorkspace();
  const { portalRole } = usePortalAuth();
  const signInIntentSetter =
    typeof window !== 'undefined' && window.sessionStorage.getItem('acq_signin_intent') === 'setter';
  const setterHintActive = Boolean(user?.id) && hasSetterRoleHint(user.id);
  const setterMetadataActive = hasSetterMetadataHint(user?.user_metadata);
  const isSetterMode =
    signInIntentSetter || setterHintActive || setterMetadataActive || userRole === 'setter' || portalRole === 'setter';
  const [profileColor, setProfileColor] = useState('#2A2A2A');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileTooltipVisible, setProfileTooltipVisible] = useState(false);
  const [menuTooltipVisible, setMenuTooltipVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const avatarMode = (profile?.avatar_mode as 'photo' | 'letter' | null) || 'photo';
  const avatarImageUrl =
    profile?.avatar_url ||
    (user?.user_metadata?.avatar_url as string | undefined) ||
    null;
  const displayName = profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || 'User';
  const profilePath = isSetterMode ? '/setter-portal/messages' : '/profile';

  useEffect(() => {
    if (profile?.avatar_color) {
      setProfileColor(profile.avatar_color);
    }
  }, [profile?.avatar_color]);

  useEffect(() => {
    const workspaceId = String(workspace?.id || '').trim();
    if (!workspaceId) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    const parseMs = (value: unknown) => {
      if (!value) return 0;
      const ms = Date.parse(String(value));
      return Number.isFinite(ms) ? ms : 0;
    };

    const loadUnreadCount = async () => {
      try {
        let threadsQuery = (supabase as any)
          .from('instagram_threads')
          .select('conversation_id,last_inbound_at,last_outbound_at,last_message_at,last_message_direction,shared_last_read_at,assigned_user_id,hidden_from_setters,shared_with_setters,lead_status')
          .eq('workspace_id', workspaceId);

        if (isSetterMode) {
          threadsQuery = threadsQuery.eq('hidden_from_setters', false).eq('shared_with_setters', true);
        }

        const readsQuery = (supabase as any)
          .from('instagram_thread_reads')
          .select('conversation_id,last_read_at')
          .eq('workspace_id', workspaceId);

        const [{ data: threadsData, error: threadsError }, { data: readsData, error: readsError }] = await Promise.all([
          threadsQuery,
          readsQuery,
        ]);

        if (threadsError) throw threadsError;
        if (readsError) throw readsError;
        if (cancelled) return;

        const currentUserId = String(user?.id || '');
        const readMsByConversationId: Record<string, number> = {};
        for (const row of Array.isArray(readsData) ? readsData : []) {
          const conversationId = String((row as any)?.conversation_id || '');
          if (!conversationId) continue;
          const readMs = parseMs((row as any)?.last_read_at);
          if (!readMs) continue;
          readMsByConversationId[conversationId] = Math.max(readMsByConversationId[conversationId] || 0, readMs);
        }

        const rows = Array.isArray(threadsData) ? threadsData : [];
        const total = rows.reduce((count: number, row: any) => {
          const leadStatus = String(row?.lead_status || 'open').toLowerCase();
          if (leadStatus === 'removed') return count;

          if (isSetterMode) {
            const assignedUserId = String(row?.assigned_user_id || '');
            if (assignedUserId && currentUserId && assignedUserId !== currentUserId) {
              return count;
            }
          }

          const conversationId = String(row?.conversation_id || '');
          if (!conversationId) return count;

          const lastMessageMs = parseMs(row?.last_message_at);
          const lastMessageDirection = String(row?.last_message_direction || '').toLowerCase();
          const inboundMs = Math.max(
            parseMs(row?.last_inbound_at),
            lastMessageDirection === 'inbound' ? lastMessageMs : 0,
          );
          if (!inboundMs) return count;

          const outboundMs = Math.max(
            parseMs(row?.last_outbound_at),
            lastMessageDirection === 'outbound' ? lastMessageMs : 0,
          );
          const readMs = Math.max(
            readMsByConversationId[conversationId] || 0,
            parseMs(row?.shared_last_read_at),
            outboundMs,
          );
          return inboundMs > readMs ? count + 1 : count;
        }, 0);

        setUnreadCount(total);
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    };

    loadUnreadCount();
    const intervalId = window.setInterval(loadUnreadCount, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [workspace?.id, isSetterMode, user?.id, location.pathname]);

  // Navigation items configuration.
  const ownerTopNavItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/dashboard'
  }, {
    icon: Inbox,
    label: 'Inbox',
    path: '/messages'
  }, {
    icon: Users,
    label: 'Clients',
    path: '/clients'
  }, {
    icon: PlayList1,
    label: 'Content',
    path: '/content'
  }];
  const ownerBottomNavItems = [{
    icon: SignalFull,
    label: 'Leads',
    path: '/outreach'
  }, {
    icon: UserWorkLaptopWifi,
    label: 'Team',
    path: '/team'
  }];
  const setterPathPrefix = '/setter-portal';
  const setterNavItems = [{
    icon: Inbox,
    label: 'Inbox',
    path: `${setterPathPrefix}/messages`
  }, {
    icon: SignalFull,
    label: 'Leads',
    path: `${setterPathPrefix}/outreach`
  }, {
    icon: UserWorkLaptopWifi,
    label: 'Setters',
    path: `${setterPathPrefix}/setters`
  }];

  const navItems = isSetterMode ? setterNavItems : [...ownerTopNavItems, ...ownerBottomNavItems];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const handleNavigation = (path: string) => {
    if (path === '/analytics') {
      toast.info('Week analytics is coming soon.');
      return;
    }
    navigate(path);
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  return <div className="h-screen w-[86px] bg-[#0a0a0a] flex flex-col py-4 flex-shrink-0 overflow-visible">
      <div className="mb-2 flex justify-center px-2">
        <div className="flex h-10 w-10 items-center justify-center">
          <img
            src="/Integrity%20logo.png"
            alt="Integrity"
            className="h-7 w-7 object-contain"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      <nav className="flex-1 flex flex-col items-center justify-center gap-3 overflow-visible px-2">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={isActive(item.path)}
            onClick={() => handleNavigation(item.path)}
            badgeCount={item.label === 'Inbox' ? unreadCount : 0}
          />
        ))}

        {!isSetterMode ? (
          <button
            type="button"
            onClick={() => {
              setProfileTooltipVisible(false);
              handleNavigation(profilePath);
            }}
            onMouseEnter={() => setProfileTooltipVisible(true)}
            onMouseLeave={() => setProfileTooltipVisible(false)}
            data-sidebar-nav="true"
            className={cn(
              'sidebar-nav-item group relative flex h-9 w-9 items-center justify-center rounded-2xl transition-colors duration-150',
              isActive('/profile') ? 'bg-[#1a1a1a]' : 'bg-transparent hover:bg-[#1a1a1a]',
            )}
            aria-label="Profile"
          >
            <ProfileAvatar
              name={displayName}
              size="sm"
              bgColor={profileColor}
              imageUrl={avatarImageUrl}
              mode={avatarMode}
            />
            <div
              className={cn(
                'pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-[#1a1a1a] px-4 py-2 text-[14px] font-normal text-white/95 shadow-[0_0_24px_rgba(0,0,0,0.17)] transition-all duration-180 ease-out',
                profileTooltipVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1',
              )}
            >
              Profile
            </div>
          </button>
        ) : null}
      </nav>

      <div className="mt-3 flex flex-col items-center gap-3 px-2">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onMouseEnter={() => setMenuTooltipVisible(true)}
              onMouseLeave={() => setMenuTooltipVisible(false)}
              data-sidebar-nav="true"
              className={cn(
                'sidebar-nav-item group relative flex h-10 w-10 items-center justify-center rounded-2xl transition-colors duration-150',
                menuOpen ? 'bg-[#1a1a1a]' : 'bg-transparent hover:bg-[#1a1a1a]',
              )}
              aria-label="Menu"
            >
              <HorizontalMenuSquare className="w-[20px] h-[20px] text-white" strokeWidth={1.5} />
              <div
                className={cn(
                  'pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-[#1a1a1a] px-4 py-2 text-[14px] font-normal text-white/95 shadow-[0_0_24px_rgba(0,0,0,0.17)] transition-all duration-180 ease-out',
                  menuTooltipVisible && !menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1',
                )}
              >
                Menu
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" sideOffset={10} className="w-48 bg-popover rounded-xl">
            {!isSetterMode ? (
              <DropdownMenuItem onClick={() => handleNavigation('/settings')} className="rounded-lg">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => window.open('mailto:support@theacq.app', '_blank')} className="rounded-lg">
              <HelpCircle className="w-4 h-4 mr-2" />
              Contact ACQ Team
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open('/privacy', '_blank')} className="rounded-lg">
              <Shield2 className="w-4 h-4 mr-2" />
              Privacy Policy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open('/terms', '_blank')} className="rounded-lg">
              <Script1 className="w-4 h-4 mr-2" />
              Terms of Service
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-400 focus:text-red-400 rounded-lg hover:bg-red-500/20 data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>;
}
