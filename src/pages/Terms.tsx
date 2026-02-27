export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-medium mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">Last updated: January 2026</p>
      
      <div className="space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-foreground font-medium mb-2">Acceptance of Terms</h2>
          <p>By accessing or using The ACQ Dashboard, you agree to be bound by these Terms of Service.</p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">Use of Service</h2>
          <p>You agree to use our service only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account.</p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">User Content</h2>
          <p>You retain ownership of content you create. By using our service, you grant us a license to host and display your content as necessary to provide the service.</p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">Third-Party Integrations</h2>
          <p>Our service may integrate with third-party platforms. Your use of these integrations is subject to their terms of service.</p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">Limitation of Liability</h2>
          <p>We provide our service "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages.</p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:support@theacq.app" className="text-primary hover:underline">support@theacq.app</a></p>
        </section>
      </div>
    </div>
  );
}
