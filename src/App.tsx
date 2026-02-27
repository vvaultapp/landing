import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { WorkspaceProvider, useWorkspace } from "@/hooks/useWorkspace";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RunDetail from "./pages/RunDetail";
import Dashboard from "./pages/Dashboard";
import DashboardChatLog from "./pages/DashboardChatLog";
import Messages from "./pages/Messages";
import Content from "./pages/Content";
import AskAI from "./pages/AskAI";
import Settings from "./pages/Settings";
import AcceptInvite from "./pages/AcceptInvite";
import Onboarding from "./pages/Onboarding";
import Outreach from "./pages/Outreach";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import SetterPortal from "./pages/SetterPortal";
import SetterPortalLogin from "./pages/SetterPortalLogin";
import SetterOnboarding from "./pages/SetterOnboarding";
import SetterMagicCallback from "./pages/SetterMagicCallback";
import ClientPortalLogin from "./pages/ClientPortalLogin";
import ClientForgotPin from "./pages/ClientForgotPin";
import Portal from "./pages/Portal";
import PortalOnboarding from "./pages/PortalOnboarding";
import PortalTasks from "./pages/PortalTasks";
import PortalFiles from "./pages/PortalFiles";
import PortalMeetings from "./pages/PortalMeetings";
import PortalMagicCallback from "./pages/PortalMagicCallback";
import Meetings from "./pages/Meetings";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Setters from "./pages/Setters";
import Profile from "./pages/Profile";
import CoachChat from "./pages/CoachChat";
import LinkRedirect from "./pages/LinkRedirect";
import BookLink from "./pages/BookLink";
import BookCall from "./pages/BookCall";
import YouTubeCallback from "./pages/YouTubeCallback";
import CalendarCallback from "./pages/CalendarCallback";
import InstagramCallback from "./pages/InstagramCallback";
import EmailVerified from "./pages/EmailVerified";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DataDeletion from "./pages/DataDeletion";
import NotFound from "./pages/NotFound";
import Homepage from "./pages/Homepage";
import { Component } from "react";
import { AppFrameSkeleton } from "@/components/skeletons/AppFrameSkeleton";
import { hasSetterMetadataHint, hasSetterRoleHint } from "@/lib/setterRoleHint";

const queryClient = new QueryClient();

class AppErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error?.message || "Unexpected app error",
    };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("App render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
          <div className="max-w-lg text-center space-y-3">
            <div className="text-lg font-medium">Page failed to load</div>
            <div className="text-sm text-white/60">{this.state.message}</div>
            <button
              type="button"
              className="h-10 px-4 rounded-xl border border-white/20 text-sm text-white/85 hover:bg-white/5"
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

function MainAppRouteGuard() {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { portalRole, loading: portalLoading } = usePortalAuth();
  const { userRole, loading: workspaceLoading } = useWorkspace();
  const signInIntentSetter =
    typeof window !== "undefined" && window.sessionStorage.getItem("acq_signin_intent") === "setter";
  const setterHintActive = Boolean(user?.id) && hasSetterRoleHint(user.id);
  const setterMetadataActive = hasSetterMetadataHint(user?.user_metadata);

  if (authLoading || portalLoading || workspaceLoading) {
    return <AppFrameSkeleton />;
  }

  // Main app routes require an authenticated session.
  // (Client portal and public routes live outside this guard.)
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (portalRole === "client") {
    return <Navigate to="/portal/meetings" replace />;
  }

  // Setter dashboard is intentionally limited (Inbox, Leads, Setters).
  // Enforce at the route guard level so non-DashboardLayout pages stay locked down.
  const isSetterMode =
    signInIntentSetter ||
    setterHintActive ||
    setterMetadataActive ||
    userRole === "setter" ||
    portalRole === "setter";
  const setterAllowedPrefixes = ["/setter-portal/messages", "/setter-portal/outreach", "/setter-portal/setters"];
  const legacySetterPrefixMap: Array<{ from: string; to: string }> = [
    { from: "/messages", to: "/setter-portal/messages" },
    { from: "/outreach", to: "/setter-portal/outreach" },
    { from: "/setters", to: "/setter-portal/setters" },
  ];

  if (isSetterMode) {
    const pathname = location.pathname || "";

    for (const { from, to } of legacySetterPrefixMap) {
      if (pathname === from || pathname.startsWith(`${from}/`)) {
        const suffix = pathname.slice(from.length);
        return <Navigate to={`${to}${suffix}`} replace />;
      }
    }

    const isAllowed = setterAllowedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    if (!isAllowed) {
      return <Navigate to="/setter-portal/messages" replace />;
    }
  } else {
    const pathname = location.pathname || "";
    const inSetterPortalApp = setterAllowedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    if (inSetterPortalApp) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/email-verified" element={<EmailVerified />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      <Route element={<MainAppRouteGuard />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/chat-log" element={<DashboardChatLog />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/outreach" element={<Outreach />} />
        <Route path="/setter-portal/messages" element={<Messages />} />
        <Route path="/setter-portal/outreach" element={<Outreach />} />
        <Route path="/setter-portal/setters" element={<Setters />} />
        <Route path="/content" element={<Content />} />
        <Route path="/youtube-callback" element={<YouTubeCallback />} />
        <Route path="/calendar-callback" element={<CalendarCallback />} />
        <Route path="/instagram-callback" element={<InstagramCallback />} />
        <Route path="/ask-ai" element={<AskAI />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/chat" element={<CoachChat />} />
        <Route path="/team" element={<Team />} />
        <Route path="/setters" element={<Setters />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/run/:runId" element={<RunDetail />} />
      </Route>

      {/* Tracked Links */}
      <Route path="/l/:slug" element={<LinkRedirect />} />
      <Route path="/book/:slug" element={<BookLink />} />
      <Route path="/book-call" element={<BookCall />} />

      {/* Setter Portal Routes */}
      <Route path="/setter-portal" element={<SetterPortal />} />
      <Route path="/setter-portal/login" element={<SetterPortalLogin />} />
      <Route path="/setter-portal/onboarding" element={<SetterOnboarding />} />
      <Route path="/setter-portal/magic-callback" element={<SetterMagicCallback />} />

      {/* Client Portal Routes */}
      <Route path="/portal/login" element={<ClientPortalLogin />} />
      <Route path="/portal/forgot-pin" element={<ClientForgotPin />} />
      <Route path="/portal/magic-callback" element={<PortalMagicCallback />} />
      <Route path="/portal/onboarding" element={<PortalOnboarding />} />
      <Route path="/portal/meetings" element={<PortalMeetings />} />
      <Route path="/portal/tasks" element={<PortalTasks />} />
      <Route path="/portal/files" element={<PortalFiles />} />
      <Route path="/portal" element={<Portal />} />

      {/* Public Pages */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/data-deletion" element={<DataDeletion />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/landing.html" element={<Navigate to="/homepage" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppShell>{children}</AppShell>
            </TooltipProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-content app-content--visible">
        <AppErrorBoundary>{children}</AppErrorBoundary>
      </div>
    </div>
  );
}

const App = () => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
);

export default App;
