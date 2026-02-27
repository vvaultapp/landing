import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | vvault",
  description: "Privacy Policy for vvault.",
};

const LAST_UPDATED = "February 26, 2026";

const privacySections: Array<{ title: string; paragraphs: string[] }> = [
  {
    title: "1. Information We Collect",
    paragraphs: [
      "We collect information you provide directly, including account details (name, email, handle, avatar), uploaded content (files, covers, metadata), contacts, campaign details, preferences, support messages, and marketplace or billing-related information.",
      "We also collect technical and usage information needed to run and protect the service, such as IP address, device and browser data, logs, cookies, and identifiers.",
    ],
  },
  {
    title: "2. How We Use Data",
    paragraphs: [
      "We use data to create and manage accounts, process and deliver files, power sharing and collaboration features, send emails on your instruction, provide analytics dashboards, prevent abuse and fraud, enforce safety limits, improve product quality, and provide customer support.",
    ],
  },
  {
    title: "3. Tracking and Analytics",
    paragraphs: [
      "We record activity such as opens, clicks, plays, downloads, and favorites to provide engagement analytics. We may also apply protections to reduce automated scans and improve metric quality.",
    ],
  },
  {
    title: "4. Email Delivery",
    paragraphs: [
      "If you connect Gmail, we store and use the required tokens to send emails on your behalf. You control recipients and message content. Based on your settings, we may attach files or combine items in outgoing campaigns.",
    ],
  },
  {
    title: "5. Payments",
    paragraphs: [
      "Purchases, subscriptions, marketplace payouts, and related payment operations are processed by Stripe. We receive payment status, amount, and related metadata, but we do not store full payment card details.",
    ],
  },
  {
    title: "6. Sharing and Public Pages",
    paragraphs: [
      "When you publish or share packs, tracks, folders, or series, they may be available through public or tokenized links according to your access settings. Anyone with access can view, stream, or download based on your configuration and licensing rules.",
    ],
  },
  {
    title: "7. Service Providers",
    paragraphs: [
      "We use third-party providers for hosting, storage, analytics, messaging, and payments. These providers may process data only as needed to provide services to vvault under contractual protections.",
    ],
  },
  {
    title: "8. Data Retention",
    paragraphs: [
      "We keep data for as long as reasonably necessary to provide the service, comply with legal obligations, resolve disputes, and enforce agreements.",
    ],
  },
  {
    title: "9. Security",
    paragraphs: [
      "We implement reasonable technical and organizational safeguards, but no system can guarantee absolute security.",
    ],
  },
  {
    title: "10. Your Rights",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your data. To make a request, contact us at vvaultapp@gmail.com.",
    ],
  },
  {
    title: "11. Contact",
    paragraphs: [
      "For privacy requests or questions, contact us via the in-app Support page or email vvaultapp@gmail.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white">
      <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:py-18">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="rounded-xl text-[13px] font-semibold tracking-[0.18em] uppercase text-white/90 hover:text-white"
          >
            vvault
          </Link>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <Link href="/terms" className="hover:text-white">
              Terms of Use
            </Link>
          </div>
        </div>

        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
            vvault provides a workspace to upload and manage audio files, create packs and series, share links, send campaigns, track engagement, sell licenses, and manage billing. This policy explains what data we collect and how we use it to operate and secure the service.
          </p>
          <p className="mt-4 text-xs text-white/50">Last updated: {LAST_UPDATED}</p>
        </header>

        <section className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {privacySections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <div className="mt-2 space-y-2">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-white/70 sm:text-[15px]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
