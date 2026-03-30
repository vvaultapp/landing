"use client";

import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Feature card data                                                  */
/* ------------------------------------------------------------------ */

const features = [
  { name: "Library", description: "Upload and organize your tracks, packs, and sound kits", href: "/docs/library" },
  { name: "Campaigns", description: "Send music via email, Instagram, or messages", href: "/docs/campaigns" },
  { name: "Analytics", description: "Track opens, clicks, plays, downloads, and saves", href: "/docs/analytics" },
  { name: "Contacts", description: "CRM with engagement scoring and contact management", href: "/docs/contacts" },
  { name: "Sales", description: "Sell beats and packs with Stripe-powered checkout", href: "/docs/sales" },
  { name: "Opportunities", description: "Browse and submit to artist requests", href: "/docs/opportunities" },
  { name: "Profile", description: "Your public page with custom branding", href: "/docs/profile" },
  { name: "Link in Bio", description: "One smart link for all your content", href: "/docs/link-in-bio" },
  { name: "Studio", description: "Automated video posting to social platforms", href: "/docs/studio" },
  { name: "Certificate", description: "Protect ownership of your music", href: "/docs/certificate" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DocsIntroductionPage() {
  return (
    <>
      {/* Breadcrumb */}
      <p className="text-[12px] tracking-wider text-[#999]">
        Getting Started
      </p>

      {/* Title */}
      <h1 className="mt-3 text-[1.75rem] font-semibold text-[#111]">
        Introduction
      </h1>

      {/* Intro paragraph */}
      <p className="mt-4 text-[15px] leading-relaxed text-[#777]">
        vvault is a platform built for music producers and beatmakers to
        upload, send, track, and sell their music. It combines a private
        library, email campaigns with analytics, a CRM, a marketplace, and
        automated social posting — all in one app.
      </p>

      {/* ------------------------------------------------------------ */}
      {/*  What is vvault?                                              */}
      {/* ------------------------------------------------------------ */}
      <section className="mt-14">
        <h2 id="what-is-vvault" className="text-lg font-semibold text-[#111]">
          What is vvault?
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          vvault is the all-in-one platform for music producers. Upload
          tracks, organize them into packs, send music to your contacts,
          track engagement, and sell through a built-in marketplace —
          everything you need in a single workspace.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          Available as a web app, vvault gives producers a professional
          toolkit to manage their catalog, grow their audience, and monetize
          their beats without juggling multiple services.
        </p>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Key features                                                 */}
      {/* ------------------------------------------------------------ */}
      <section className="mt-14">
        <h2 id="key-features" className="text-lg font-semibold text-[#111]">
          Key features
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          Explore each feature in detail by clicking a card below.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <Link
              key={f.name}
              href={f.href}
              className="group flex flex-col justify-between rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4 transition hover:bg-[#f5f5f5]"
            >
              <div>
                <p className="text-[14px] font-medium text-[#222] group-hover:text-[#111]">
                  {f.name}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-[#999]">
                  {f.description}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[12px] text-[#bbb] group-hover:text-[#666]">
                <span>Read docs</span>
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 6h7M6.5 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Plans                                                        */}
      {/* ------------------------------------------------------------ */}
      <section className="mt-14">
        <h2 id="plans" className="text-lg font-semibold text-[#111]">
          Plans
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          vvault offers three plans so you can start free and scale as you grow.
        </p>

        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
            <p className="text-[14px] font-medium text-[#222]">Free</p>
            <p className="mt-1 text-[13px] leading-snug text-[#999]">
              100 MB storage, 1 campaign per day (5 recipients), and basic
              analytics. Everything you need to get started.
            </p>
          </div>

          <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
            <div className="flex items-baseline gap-2">
              <p className="text-[14px] font-medium text-[#222]">Pro</p>
              <span className="text-[12px] text-[#999]">&euro;8.99/mo</span>
            </div>
            <p className="mt-1 text-[13px] leading-snug text-[#999]">
              Unlimited storage and campaigns, full analytics, CRM, and
              marketplace access with a 5% transaction fee.
            </p>
          </div>

          <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
            <div className="flex items-baseline gap-2">
              <p className="text-[14px] font-medium text-[#222]">Ultra</p>
              <span className="text-[12px] text-[#999]">&euro;24.99/mo</span>
            </div>
            <p className="mt-1 text-[13px] leading-snug text-[#999]">
              Everything in Pro plus custom themes, Studio for automated
              social posting, advanced analytics, and 0% marketplace fees.
            </p>
          </div>
        </div>

        <p className="mt-4 text-[13px] text-[#999]">
          See{" "}
          <Link
            href="/docs/plans"
            className="text-[#555] underline decoration-[#ccc] underline-offset-2 transition hover:text-[#222]"
          >
            Plans &amp; pricing
          </Link>{" "}
          for a full comparison.
        </p>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Getting help                                                 */}
      {/* ------------------------------------------------------------ */}
      <section className="mt-14">
        <h2 id="getting-help" className="text-lg font-semibold text-[#111]">
          Getting help
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
          If you have questions or run into any issues, we are here to help.
        </p>

        <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-[#666]">
          <li className="flex items-start gap-2">
            <span className="mt-[3px] block h-1.5 w-1.5 shrink-0 rounded-full bg-[#ccc]" />
            <span>
              <a
                href="https://discord.gg/QGGEZR5KhB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#555] underline decoration-[#ccc] underline-offset-2 transition hover:text-[#222]"
              >
                Discord community
              </a>{" "}
              — ask questions, share feedback, and connect with other producers.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[3px] block h-1.5 w-1.5 shrink-0 rounded-full bg-[#ccc]" />
            <span>
              <a
                href="mailto:vvaultapp@gmail.com"
                className="text-[#555] underline decoration-[#ccc] underline-offset-2 transition hover:text-[#222]"
              >
                vvaultapp@gmail.com
              </a>{" "}
              — reach us directly by email.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[3px] block h-1.5 w-1.5 shrink-0 rounded-full bg-[#ccc]" />
            <span>
              <strong className="font-medium text-[#555]">In-app support</strong>{" "}
              — use the help button inside vvault for contextual assistance.
            </span>
          </li>
        </ul>
      </section>
    </>
  );
}
