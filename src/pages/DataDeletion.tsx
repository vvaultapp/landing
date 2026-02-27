export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-medium mb-6">Data Deletion Instructions</h1>
      <p className="text-muted-foreground mb-4">Last updated: February 2026</p>

      <div className="space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-foreground font-medium mb-2">How to Request Deletion</h2>
          <p>
            Email us at{' '}
            <a href="mailto:support@theacq.app" className="text-primary hover:underline">
              support@theacq.app
            </a>{' '}
            with the subject line <strong>Data Deletion Request</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">What to Include</h2>
          <p>Please include the following to help us verify your account:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Your account email address</li>
            <li>Your workspace name</li>
            <li>Any connected Instagram username(s)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">What We Delete</h2>
          <p>
            We will remove your account data, connected integrations, and stored messages associated
            with your workspace, subject to legal and billing obligations.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">Timeline</h2>
          <p>
            We typically process deletion requests within 30 days. We will confirm by email once the
            request is completed.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">Contact</h2>
          <p>
            Questions? Email{' '}
            <a href="mailto:support@theacq.app" className="text-primary hover:underline">
              support@theacq.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
