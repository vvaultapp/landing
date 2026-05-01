/* Shared skeleton shown during the brief moment Next.js is fetching
   and parsing a feature page's JS bundle (route transition or first
   paint on a slow network). The shape mirrors the real layout used by
   /features/analytics, /features/campaigns, /features/contacts,
   /features/opportunities — fixed nav strip on top, centered emblem,
   gradient title, two-line subtitle, CTA button, then a section card
   underneath — so when the real page swaps in there's no visual jump.

   Server component (no "use client") so Next.js can stream it from
   loading.tsx without shipping any JS for the skeleton itself. */

const SHIMMER = "animate-pulse rounded-md bg-white/[0.10]";

type FeaturePageSkeletonProps = {
  /* Lets each route tint its emblem with the same accent color the
     real hero uses (blue for analytics, indigo for campaigns, etc.).
     Skipped if omitted — falls back to a neutral white tint. */
  accent?: string;
};

export function FeaturePageSkeleton({ accent = "rgba(255,255,255,0.10)" }: FeaturePageSkeletonProps) {
  return (
    <div
      className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Nav placeholder — same height as the real LandingNav (62px
         on mobile, 56px from sm up) so the page below doesn't shift
         when the real nav swaps in. */}
      <div className="fixed inset-x-0 top-[var(--app-banner-h,0px)] z-50 h-[62px] border-b border-white/[0.06] bg-black/40 backdrop-blur-md sm:h-[56px]">
        <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className={`${SHIMMER} h-5 w-20`} />
          <div className="hidden items-center gap-3 lg:flex">
            <div className={`${SHIMMER} h-4 w-16`} />
            <div className={`${SHIMMER} h-4 w-20`} />
            <div className={`${SHIMMER} h-4 w-16`} />
            <div className={`${SHIMMER} h-4 w-14`} />
          </div>
          <div className={`${SHIMMER} h-8 w-24 rounded-xl`} />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[680px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">
        {/* Emblem */}
        <div className="flex justify-center">
          <div
            className="relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-[26px] sm:h-[120px] sm:w-[120px] sm:rounded-[30px]"
            style={{
              background:
                "linear-gradient(160deg, rgba(30,30,35,0.6) 0%, rgba(8,8,10,0.95) 35%, rgba(0,0,0,1) 100%)",
              boxShadow:
                "inset 0 1px 0 0 rgba(255,255,255,0.07), inset 0 -1px 0 0 rgba(0,0,0,0.4), 0 8px 32px -6px rgba(0,0,0,0.7)",
              border: "0.5px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="h-12 w-12 animate-pulse rounded-2xl sm:h-14 sm:w-14"
              style={{ background: accent }}
            />
          </div>
        </div>

        {/* Title — two stacked bars approximating the gradient h1 */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className={`${SHIMMER} h-8 w-[78%] sm:h-12 sm:w-[60%]`} />
          <div className={`${SHIMMER} h-8 w-[55%] sm:h-12 sm:w-[40%]`} />
        </div>

        {/* Subtitle — three narrower bars */}
        <div className="mx-auto mt-5 flex max-w-lg flex-col items-center gap-2.5">
          <div className={`${SHIMMER} h-3.5 w-[88%]`} />
          <div className={`${SHIMMER} h-3.5 w-[82%]`} />
          <div className={`${SHIMMER} h-3.5 w-[60%]`} />
        </div>

        {/* CTA button */}
        <div className="mt-8 flex justify-center">
          <div className={`${SHIMMER} h-10 w-32 rounded-xl bg-white/[0.10]`} />
        </div>

        {/* Section preview — section title + paragraph + card */}
        <div className="mt-40 sm:mt-52">
          <div className="flex flex-col items-center gap-3">
            <div className={`${SHIMMER} h-6 w-[55%] sm:h-7 sm:w-[42%]`} />
          </div>
          <div className="mx-auto mt-4 flex max-w-lg flex-col items-center gap-2.5">
            <div className={`${SHIMMER} h-3 w-[90%]`} />
            <div className={`${SHIMMER} h-3 w-[85%]`} />
            <div className={`${SHIMMER} h-3 w-[70%]`} />
          </div>
          <div
            className="mt-10 h-[280px] w-full rounded-2xl border border-white/[0.06] sm:h-[340px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(12,12,15,0.98) 0%, rgba(4,4,5,1) 100%)",
            }}
          >
            <div className="flex h-full w-full animate-pulse items-center justify-center">
              <div className="h-full w-full rounded-2xl bg-white/[0.02]" />
            </div>
          </div>
        </div>

        {/* Second section preview, slightly shorter */}
        <div className="mt-24 sm:mt-32">
          <div className="flex flex-col items-center gap-3">
            <div className={`${SHIMMER} h-6 w-[48%] sm:h-7 sm:w-[36%]`} />
          </div>
          <div className="mx-auto mt-4 flex max-w-lg flex-col items-center gap-2.5">
            <div className={`${SHIMMER} h-3 w-[85%]`} />
            <div className={`${SHIMMER} h-3 w-[78%]`} />
          </div>
          <div
            className="mt-10 h-[220px] w-full rounded-2xl border border-white/[0.06] sm:h-[260px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(12,12,15,0.98) 0%, rgba(4,4,5,1) 100%)",
            }}
          >
            <div className="flex h-full w-full animate-pulse items-center justify-center">
              <div className="h-full w-full rounded-2xl bg-white/[0.02]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
