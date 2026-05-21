"use client";

import type { TournamentCopy } from "./copy";
import { BracketShowcase } from "./BracketShowcase";

export function ComingSoon({ copy }: { copy: TournamentCopy }) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 pt-[96px] pb-24 sm:px-8 sm:pt-[88px]">
      <BracketShowcase ranked={[]} />

      <div className="mt-12 flex justify-center">
        <a
          href={copy.comingSoonCtaHref}
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-black transition hover:bg-white/90"
        >
          {copy.comingSoonCta}
          <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}
