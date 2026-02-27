import { useState, type CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Script1, Like1, ZipFile, CleanBroomWipe } from '@/components/ui/icons';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClient } from '@/hooks/useClients';
import { ClientOverviewTab } from '@/components/clients/ClientOverviewTab';
import { ClientOnboardingTab } from '@/components/clients/ClientOnboardingTab';
import { ClientFilesTab } from '@/components/clients/ClientFilesTab';
import { ClientTasksTab } from '@/components/clients/ClientTasksTab';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { orbCssVars } from '@/lib/colors';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { client, tasks, files, loading, error, updateClient, fetchClient } = useClient(id);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-32 rounded-2xl bg-white/[0.06]" />
          </div>

          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full bg-white/[0.06]" />
              <div>
                <Skeleton className="h-8 w-56 rounded-2xl bg-white/10" />
                <Skeleton className="h-4 w-72 rounded-xl bg-white/[0.06] mt-2" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-2xl bg-white/[0.06]" />
          </div>

          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-9 w-28 rounded-2xl bg-white/[0.06]" />
            ))}
          </div>

          <Skeleton className="h-[420px] w-full rounded-3xl bg-white/[0.04]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/clients')}
            className="mb-4 rounded-2xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
          <div className="text-muted-foreground">Client not found</div>
        </div>
      </DashboardLayout>
    );
  }

  // Profile avatar with radial gradient and inset shadows
  const getProfileAvatar = () => {
    const firstLetter = client.name.charAt(0).toUpperCase();
    return (
      <div 
        className="w-16 h-16 acq-orb flex items-center justify-center text-2xl font-medium text-[#9a9a9a]"
        style={orbCssVars('#9ca3af') as CSSProperties}
      >
        {firstLetter}
      </div>
    );
  };

  const getStatusBadge = () => {
    const now = new Date();
    const isPaused = client.subscriptionStatus === 'paused';
    const isExpired = client.accessUntil && client.accessUntil < now;

    if (isPaused || isExpired) {
      return (
        <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-0 rounded-full">
          {isPaused ? 'Paused' : 'Expired'}
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-success/20 text-success border-0 rounded-full">
        Active
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/clients')}
            className="mb-4 -ml-2 rounded-2xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {getProfileAvatar()}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="headline-domaine text-[36px] font-normal">{client.name}</h1>
                  {getStatusBadge()}
                </div>
                {client.email && (
                  <p className="text-muted-foreground">{client.email}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Added {format(client.latestInviteSentAt || client.createdAt, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {client.userId && (
              <Badge variant="secondary" className="bg-success/20 text-success border-0 rounded-full">
                Portal Access Enabled
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b-[0.5px] border-border rounded-none w-full justify-start gap-0 h-auto p-0 mb-8">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-border data-[state=active]:bg-transparent data-[state=active]:translate-y-[2px] px-4 py-3"
            >
              <Script1 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="onboarding"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-border data-[state=active]:bg-transparent data-[state=active]:translate-y-[2px] px-4 py-3"
            >
              <Like1 className="w-4 h-4 mr-2" />
              Onboarding
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-border data-[state=active]:bg-transparent data-[state=active]:translate-y-[2px] px-4 py-3"
            >
              <ZipFile className="w-4 h-4 mr-2" />
              Files
              {files.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
                  {files.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-border data-[state=active]:bg-transparent data-[state=active]:translate-y-[2px] px-4 py-3"
            >
              <CleanBroomWipe className="w-4 h-4 mr-2" />
              Tasks
              {tasks.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
                  {tasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <ClientOverviewTab client={client} onUpdate={updateClient} />
          </TabsContent>

          <TabsContent value="onboarding" className="mt-0">
            <ClientOnboardingTab client={client} />
          </TabsContent>

          <TabsContent value="files" className="mt-0">
            <ClientFilesTab client={client} files={files} onRefresh={fetchClient} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <ClientTasksTab client={client} tasks={tasks} onRefresh={fetchClient} />
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  );
}
