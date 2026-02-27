import { DashboardClaudeChat } from '@/components/dashboard/DashboardClaudeChat';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWorkspace } from '@/hooks/useWorkspace';

export default function DashboardChatLog() {
  const { workspace } = useWorkspace();

  return (
    <DashboardLayout fullWidth scrollable={false}>
      <DashboardClaudeChat workspaceId={workspace?.id || null} mode="chat-log" />
    </DashboardLayout>
  );
}
