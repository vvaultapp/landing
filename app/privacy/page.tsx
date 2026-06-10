import type { Metadata } from "next";
import Link from "next/link";

import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingContent } from "@/components/landing/content";

export const metadata: Metadata = {
  title: "Privacy Policy | vvault",
  description: "Read vvault's privacy policy. Learn how we protect your data, beats, and personal information on our beat selling platform for producers.",
  alternates: { canonical: "https://get.vvault.app/privacy" },

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
  const content = getLandingContent("en");

  return (
    <div className="landing-root min-h-screen bg-[rgb(var(--bg))] font-sans text-[rgb(var(--fg))]">
      <LandingNav locale="en" content={content} showPrimaryLinks={true} />

      <main className="mx-auto w-full max-w-[760px] px-5 pb-32 pt-36 sm:px-8 sm:pt-44">
        <h1 className="text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[rgb(var(--fg))] sm:text-[4.25rem]">
          Privacy Policy
        </h1>
        <p className="mt-5 text-[14px] font-medium text-[rgb(var(--fg)_/_0.45)]">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-[rgb(var(--fg)_/_0.55)]">
          vvault provides a workspace to upload and manage audio files, create packs and series, share links, send campaigns, track engagement, sell licenses, and manage billing. This policy explains what data we collect and how we use it to operate and secure the service.
        </p>

        {privacySections.map((section) => (
          <section key={section.title}>
            <h2 className="mt-16 text-2xl font-semibold tracking-[-0.015em] text-[rgb(var(--fg))] sm:text-3xl">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[rgb(var(--fg)_/_0.55)]">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <Link
          href="/terms"
          className="mt-20 inline-block text-[14px] font-medium text-[rgb(var(--fg)_/_0.55)] underline underline-offset-4 hover:text-[rgb(var(--fg))]"
        >
          Terms of Use &rarr;
        </Link>
      </main>

      <LandingFooter locale="en" content={content} />
    </div>
  );
}
