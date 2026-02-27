import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AskAI() {
  return (
    <DashboardLayout requireOwner>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-medium mb-8">Ask AI</h1>
        
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">AI Assistant coming soon</p>
          <p className="text-xs text-muted-foreground mt-2">Get personalized recommendations based on your KPIs</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
