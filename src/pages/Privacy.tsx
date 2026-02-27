export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-medium mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">Last updated: January 2026</p>
      
      <div className="space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-foreground font-medium mb-2">Information We Collect</h2>
          <p>We collect information you provide directly, including your name, email address, and any content you create within the platform.</p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">How We Use Your Information</h2>
          <p>We use your information to provide and improve our services, communicate with you, and ensure the security of our platform.</p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">Third-Party Services</h2>
          <p>We may integrate with third-party services like YouTube and Google Calendar. Your use of these integrations is subject to their respective privacy policies.</p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.</p>
        </section>

        <section>
          <h2 className="text-foreground font-medium mb-2">Contact</h2>
          <p>For privacy-related questions, contact us at <a href="mailto:support@theacq.app" className="text-primary hover:underline">support@theacq.app</a></p>
        </section>
      </div>
    </div>
  );
}
