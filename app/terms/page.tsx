import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingContent } from "@/components/landing/content";

export const metadata: Metadata = {
  title: "Terms of Service | vvault",
  description: "Read vvault's terms of service. Understand the rules and guidelines for using the beat selling platform for producers and beatmakers.",
  alternates: { canonical: "https://get.vvault.app/terms" },

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
  const content = getLandingContent("en");

  return (
    <div className="landing-root min-h-screen bg-[rgb(var(--bg))] font-sans text-[rgb(var(--fg))]">
      <LandingNav locale="en" content={content} showPrimaryLinks={true} />

      <main className="mx-auto w-full max-w-[760px] px-5 pb-32 pt-36 sm:px-8 sm:pt-44">
        <h1 className="text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[rgb(var(--fg))] sm:text-[4.25rem]">
          Terms of Use
        </h1>
        <p className="mt-5 text-[14px] font-medium text-[rgb(var(--fg)_/_0.45)]">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-[rgb(var(--fg)_/_0.55)]">
          By using vvault, you agree to these Terms of Use. If you do not agree, do not use the service.
        </p>

        {termsSections.map((section) => (
          <section key={section.title}>
            <h2 className="mt-16 text-2xl font-semibold tracking-[-0.015em] text-[rgb(var(--fg))] sm:text-3xl">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[rgb(var(--fg)_/_0.55)]">
                {paragraph}
              </p>
            ))}
            {section.link ? (
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[rgb(var(--fg)_/_0.55)]">
                <a
                  href={section.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-[rgb(var(--fg))]"
                >
                  {section.link.label}
                </a>
              </p>
            ) : null}
          </section>
        ))}

        <Link
          href="/privacy"
          className="mt-20 inline-block text-[14px] font-medium text-[rgb(var(--fg)_/_0.55)] underline underline-offset-4 hover:text-[rgb(var(--fg))]"
        >
          Privacy Policy &rarr;
        </Link>
      </main>

      <LandingFooter locale="en" content={content} />
    </div>
  );
}
