import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | vvault",
  description: "Terms of Use for vvault.",
};

const LAST_UPDATED = "February 26, 2026";
const APPLE_EULA = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

const termsSections: Array<{ title: string; paragraphs: string[]; link?: { href: string; label: string } }> = [
  {
    title: "1. Accounts",
    paragraphs: [
      "You are responsible for your credentials and for activity that occurs under your account.",
    ],
  },
  {
    title: "2. Content and License",
    paragraphs: [
      "You must have the rights to upload, share, and distribute any content you use on vvault.",
      "You grant vvault a worldwide, non-exclusive license to host, process, distribute, and display your content only as needed to operate and improve the service.",
    ],
  },
  {
    title: "3. Acceptable Use",
    paragraphs: [
      "You may not use vvault for unlawful conduct, infringement, spam, malware, abusive activity, or behavior that compromises the service or other users.",
    ],
  },
  {
    title: "4. Sharing and Access",
    paragraphs: [
      "You control visibility and sharing settings. If you create public or tokenized links, you are responsible for who receives access.",
      "We may remove content or revoke access to protect the service, users, rights holders, or to comply with law.",
    ],
  },
  {
    title: "5. Email Campaigns",
    paragraphs: [
      "You are responsible for recipient consent and compliance with applicable anti-spam and marketing laws. We may throttle, limit, or disable sending to prevent abuse.",
    ],
  },
  {
    title: "6. Marketplace and Licenses",
    paragraphs: [
      "Sellers set pricing and license terms. Buyers must comply with license terms. vvault may generate license PDFs and grant downloads based on payment status.",
      "Disputes between buyers and sellers are primarily between those parties, except where applicable law requires platform intervention.",
    ],
  },
  {
    title: "7. Payments and Billing",
    paragraphs: [
      "Subscriptions, purchases, and payouts are processed by Stripe or by in-app purchase providers where applicable. Prices may change. Refund handling follows our policies and provider rules.",
    ],
  },
  {
    title: "8. Availability and Warranty Disclaimer",
    paragraphs: [
      "vvault is provided \"as is\" and \"as available\" without warranties of any kind, to the maximum extent permitted by law. We do not guarantee uninterrupted or error-free service.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, vvault is not liable for indirect, incidental, special, or consequential damages. Our aggregate liability is limited to amounts paid for the service during the previous 12 months.",
    ],
  },
  {
    title: "10. Termination",
    paragraphs: [
      "We may suspend or terminate access when accounts violate these terms or create risk to the service or other users.",
    ],
  },
  {
    title: "11. Changes to These Terms",
    paragraphs: [
      "We may update these Terms of Use from time to time with reasonable notice. Continued use after updates means you accept the revised terms.",
    ],
  },
  {
    title: "12. Apple EULA",
    paragraphs: [
      "For iOS app usage, the Apple Standard Licensed Application End User License Agreement (EULA) may also apply where required:",
    ],
    link: { href: APPLE_EULA, label: "Apple Standard EULA" },
  },
  {
    title: "13. Contact",
    paragraphs: [
      "For legal questions, contact us via the in-app Support page or email vvaultapp@gmail.com.",
    ],
  },
];

export default function TermsPage() {
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
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>

        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Terms of Use</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
            By using vvault, you agree to these Terms of Use. If you do not agree, do not use the service.
          </p>
          <p className="mt-4 text-xs text-white/50">Last updated: {LAST_UPDATED}</p>
        </header>

        <section className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {termsSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <div className="mt-2 space-y-2">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-white/70 sm:text-[15px]">
                    {paragraph}
                  </p>
                ))}
                {section.link ? (
                  <p className="text-sm leading-relaxed text-white/80 sm:text-[15px]">
                    <a
                      href={section.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-white/35 underline-offset-4 hover:text-white"
                    >
                      {section.link.label}
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
