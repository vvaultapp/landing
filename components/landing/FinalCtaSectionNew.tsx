import type { LandingNewContent } from "@/components/landing/contentNew";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

type FinalCtaSectionNewProps = {
  content: LandingNewContent;
};

/* Simple, small closing line — no glow, no 3D reveal — plus a single
   "Get Started" pill. Matches the minimal feature sections. */
export function FinalCtaSectionNew({ content }: FinalCtaSectionNewProps) {
  const c = content.finalCta;
  return (
    <section
      id="final-cta"
      className="pb-[150px] pt-[80px] sm:pb-[214px] sm:pt-[110px] lg:pb-[278px] lg:pt-[140px]"
    >
      <div className="mx-auto w-full max-w-[min(92vw,1200px)] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="font-display text-[1.25rem] font-medium leading-[1.3] tracking-tight text-[rgb(var(--fg))] sm:text-[1.55rem] lg:text-[1.8rem]">
            {c.title}
          </h2>
          <p className="mx-auto mt-4 max-w-[440px] text-[13px] leading-relaxed text-[rgb(var(--fg)_/_0.4)]">
            {c.sub}
          </p>
          <div className="mt-8 flex justify-center">
            <LandingCtaLink
              loggedInHref={c.ctaHref}
              loggedOutHref={c.ctaHref}
              track={{
                buttonId: "finalCtaNew.get_started",
                surface: "landing.new.final_cta",
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--inv))] px-6 py-3 text-[15px] font-semibold text-[rgb(var(--inv-fg))] hover:bg-[rgb(var(--ov)_/_0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ov)_/_0.45)]"
            >
              {c.ctaLabel}
            </LandingCtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
