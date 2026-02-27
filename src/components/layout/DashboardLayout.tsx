import { Component, ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { AppSidebar } from './AppSidebar';
import { AppMainSkeleton } from '@/components/skeletons/AppFrameSkeleton';
import { hasSetterMetadataHint, hasSetterRoleHint } from '@/lib/setterRoleHint';

interface DashboardLayoutProps {
  children: ReactNode;
  requireOwner?: boolean;
  fullWidth?: boolean;
  scrollable?: boolean;
}

class DashboardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error?.message || 'Unexpected rendering error',
    };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Dashboard render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="max-w-lg text-center space-y-3">
            <div className="text-white/90 text-lg font-medium">Page failed to load</div>
            <div className="text-sm text-white/55">
              {this.state.message || 'Unexpected rendering error'}
            </div>
            <button
              type="button"
              className="h-10 px-4 rounded-xl border border-white/15 text-sm text-white/80 hover:text-white hover:bg-white/[0.03]"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function DashboardLayout({
  children,
  requireOwner = false,
  fullWidth = false,
  scrollable = true,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { workspace, userRole, loading: workspaceLoading } = useWorkspace();
  const { portalRole, loading: portalLoading } = usePortalAuth();
  const signInIntentSetter =
    typeof window !== 'undefined' && window.sessionStorage.getItem('acq_signin_intent') === 'setter';
  const setterHintActive = Boolean(user?.id) && hasSetterRoleHint(user.id);
  const setterMetadataActive = hasSetterMetadataHint(user?.user_metadata);
  const dashboardShellOuterClass = 'relative flex-1 min-w-0 h-screen overflow-hidden pt-2 bg-[#080808]';
  const dashboardMainCanvasClass =
    'h-full min-h-0 overflow-hidden bg-[#0e0e0e] rounded-tl-[16px] border-[0.5px] border-white/8 border-r-transparent border-b-transparent';

  useEffect(() => {
    if (authLoading || portalLoading) return;
    const isSetterMode =
      signInIntentSetter ||
      setterHintActive ||
      setterMetadataActive ||
      userRole === 'setter' ||
      portalRole === 'setter';
    const pathname = location.pathname || '';
    const setterHomePath = '/setter-portal/messages';
    const setterAllowedPrefixes = ['/setter-portal/messages', '/setter-portal/outreach', '/setter-portal/setters'];
    const legacySetterPrefixMap: Array<{ from: string; to: string }> = [
      { from: '/messages', to: '/setter-portal/messages' },
      { from: '/outreach', to: '/setter-portal/outreach' },
      { from: '/setters', to: '/setter-portal/setters' },
    ];

    // Not authenticated
    if (!user) {
      navigate('/auth');
      return;
    }

    if (portalRole === 'client') {
      navigate('/portal/meetings', { replace: true });
      return;
    }

    // Still loading workspace - wait before redirecting
    if (workspaceLoading) return;

    // No workspace - onboarding removed, allow access

    // Requires owner but user is setter
    if (requireOwner && userRole !== 'owner') {
      navigate(isSetterMode ? setterHomePath : '/dashboard', { replace: true });
      return;
    }

    // Global setter mode guard:
    // Setters have a limited dashboard (Inbox, Leads, Setters).
    if (isSetterMode) {
      for (const { from, to } of legacySetterPrefixMap) {
        if (pathname === from || pathname.startsWith(`${from}/`)) {
          const suffix = pathname.slice(from.length);
          navigate(`${to}${suffix}`, { replace: true });
          return;
        }
      }

      const isAllowed = setterAllowedPrefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
      );
      if (!isAllowed) {
        navigate(setterHomePath, { replace: true });
        return;
      }
    }
  }, [
    user,
    workspace,
    userRole,
    portalRole,
    authLoading,
    portalLoading,
    workspaceLoading,
    navigate,
    requireOwner,
    location.pathname,
    signInIntentSetter,
    setterHintActive,
    setterMetadataActive,
  ]);

  // Show loading while auth or workspace is loading
  if (authLoading || workspaceLoading || portalLoading) {
    return (
      <DashboardErrorBoundary>
        <div className="h-screen bg-background flex overflow-hidden">
          <AppSidebar />
          <div className={dashboardShellOuterClass}>
            <div className={dashboardMainCanvasClass}>
              <main className={`h-full bg-[#0e0e0e] ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}>
                <div className={`${fullWidth ? 'w-full h-full' : 'max-w-6xl mx-auto pt-16'} h-full`}>
                  <div className="p-8">
                    <AppMainSkeleton />
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </DashboardErrorBoundary>
    );
  }

  // Guard: must be authenticated (route guard should handle this, but keep a safe fallback)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-3">
          <div className="text-white/90 text-lg font-medium">Session unavailable</div>
          <div className="text-sm text-white/55">
            Your auth session is not ready. Please sign in again.
          </div>
          <button
            type="button"
            className="h-10 px-4 rounded-xl border border-white/15 text-sm text-white/80 hover:text-white hover:bg-white/[0.03]"
            onClick={() => navigate('/auth')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <div className="h-screen bg-background flex overflow-hidden">
        <AppSidebar />
        <div className={dashboardShellOuterClass}>
          <div className={dashboardMainCanvasClass}>
            {/* Main Content - centered with max width for breathing room */}
            <main className={`h-full bg-[#0e0e0e] ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}>
              <div className={`${fullWidth ? 'w-full h-full' : 'max-w-6xl mx-auto pt-16'} h-full`}>
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </DashboardErrorBoundary>
  );
}
