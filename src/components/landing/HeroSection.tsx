import { landingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

function HeroAppMock() {
  return (
    <div className="relative mt-14 sm:mt-16">
      <div
        className="pointer-events-none absolute left-[calc(50%-50vw)] top-[-142px] bottom-[-104px] z-0 w-screen overflow-hidden hero-seq-item"
        style={{ animationDelay: "760ms" }}
      >
        <div className="h-full w-full rounded-b-[18px] bg-[linear-gradient(to_bottom,rgba(160,169,179,0)_0%,rgba(160,169,179,0.012)_16%,rgba(159,168,178,0.05)_33%,rgba(157,166,176,0.14)_52%,rgba(153,162,172,0.27)_72%,rgba(149,159,169,0.40)_88%,rgba(145,155,166,0.50)_100%)]" />
      </div>
      <div
        className="pointer-events-none absolute left-[calc(50%-50vw)] bottom-[-34px] z-[1] w-screen hero-seq-item"
        style={{ animationDelay: "760ms" }}
      >
        <div className="mx-auto h-[clamp(72px,9vw,132px)] w-[clamp(360px,44vw,840px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.08)_42%,rgba(255,255,255,0)_78%)] blur-[10px]" />
      </div>

      <div
        className="relative z-10 -ml-[18px] w-[calc(100%+36px)] sm:-ml-[32px] sm:w-[calc(100%+64px)] lg:-ml-[72px] lg:w-[calc(100%+144px)] hero-seq-item"
        style={{ animationDelay: "1080ms" }}
      >
        <img
          src="/app%20show-off.png"
          alt="Integrity app interface"
          className="block h-auto w-full max-w-none select-none"
          loading="eager"
          decoding="async"
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
        />
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="pb-20 pt-44 sm:pb-28 sm:pt-52 lg:pb-36 lg:pt-58">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="max-w-[1280px] sm:pl-4 lg:pl-8">
          <h1 className="font-display text-[2.35rem] font-normal leading-[0.98] tracking-tight text-white sm:text-[3.35rem] lg:text-[4rem]">
            <span className="hero-line-reveal" style={{ animationDelay: "80ms" }}>
              {landingContent.hero.title[0]}
            </span>
            <span className="hero-line-reveal" style={{ animationDelay: "280ms" }}>
              {landingContent.hero.title[1]}
            </span>
          </h1>

          <div className="mt-7 flex items-end justify-between gap-6">
            <p className="max-w-[980px] text-sm leading-6 text-white/30 sm:text-base sm:leading-7">
              <span className="hero-line-reveal sm:whitespace-nowrap" style={{ animationDelay: "500ms" }}>
                {landingContent.hero.description}
              </span>
            </p>

            <LandingCtaLink
              loggedInHref="#pricing"
              className="hero-seq-item hero-seq-item-late group hidden shrink-0 items-center gap-2 text-base lg:inline-flex"
              style={{ animationDelay: "1760ms" }}
            >
              <span className="font-semibold text-white">New</span>
              <span className="text-white/42"> AI setter</span>
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current text-white/42 stroke-[1.8] transition-transform duration-300 ease-out group-hover:translate-x-1">
                <path d="M4 10h11M11 6l4 4-4 4" />
              </svg>
            </LandingCtaLink>
          </div>
        </div>

        <HeroAppMock />
      </div>
    </section>
  );
}
