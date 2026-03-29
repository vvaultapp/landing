"use client";

import type { Locale } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

type ContactSectionProps = {
  locale: Locale;
};

export function ContactSection({ locale }: ContactSectionProps) {
  return (
    <section id="contact" className="pt-36 sm:pt-52">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal className="relative mx-auto max-w-[980px] px-6 text-center sm:px-10">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-[86%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_35%,rgba(255,255,255,0)_72%)] blur-2xl" />
          <div className="relative">
            <h2 className="font-display text-3xl leading-tight text-white sm:text-5xl">
              {locale === "fr" ? "Contact" : "Contact"}
            </h2>
            <p className="mx-auto mt-4 max-w-[760px] text-sm leading-7 text-white/62 sm:text-base">
              {locale === "fr"
                ? "Join Discord server, DM us on Instagram @vvault.app, or send us an email at contact@vvault.app."
                : "Join Discord server, DM us on Instagram @vvault.app, or send us an email at contact@vvault.app."}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href="https://discord.gg/QGGEZR5KhB"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                Join Discord server
              </a>
              <a
                href="https://instagram.com/vvault.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-2xl border border-white/18 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                DM us on Instagram
              </a>
              <a
                href="mailto:contact@vvault.app"
                className="inline-flex items-center rounded-2xl border border-white/18 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                contact@vvault.app
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
