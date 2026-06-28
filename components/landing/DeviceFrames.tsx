import type { ReactNode } from "react";

/* Shared CSS device mockups (MacBook + iPhone) used by the hero showcase and
   the /download/ios page so the framing is identical everywhere.

   Both frames are their own `container-type: inline-size`, so every internal
   dimension is expressed in `cqw` (% of the frame's own width) and the mockup
   scales pixel-perfectly at any size — big on desktop, small on mobile, with no
   per-breakpoint tweaks. Body/bezel colour comes from the --device-body token
   (black in light, dark grey in dark so the edges stay visible on #0e0e0e). */

/* MacBook — bezel lid + camera notch, a wider brushed-aluminium base/deck, soft
   nothing (no shadow). translateZ(0) keeps the rounded video edges crisp. */
export function MacBookFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full [container-type:inline-size]">
      {/* Lid — rounded top, square bottom so it meets the base cleanly. */}
      <div className="relative z-10 rounded-t-[1.9cqw] bg-[rgb(var(--device-body))] p-[0.85cqw]">
        <div className="relative aspect-[1724/1080] overflow-hidden rounded-[1.1cqw] bg-black [transform:translateZ(0)]">
          {children}
        </div>
        {/* camera notch */}
        <div className="absolute left-1/2 top-[0.85cqw] z-20 h-[1.5cqw] w-[9cqw] -translate-x-1/2 rounded-b-[0.8cqw] bg-[rgb(var(--device-body))]" />
      </div>
      {/* Base / keyboard deck — WIDER than the lid and centred (equal overhang
          left + right), brushed aluminium, with the centred opening groove. */}
      <div className="relative -mx-[3%] h-[2cqw] w-[106%] rounded-b-[1.3cqw] bg-[linear-gradient(180deg,#d6d7da_0%,#aaabb1_55%,#8d8e94_100%)]">
        <div className="absolute left-1/2 top-0 h-[42%] w-[12%] -translate-x-1/2 rounded-b-[0.9cqw] bg-[rgb(var(--bg))]" />
      </div>
    </div>
  );
}

/* iPhone — body + side buttons (--device-body), rounded screen, and a black
   dynamic island (always black — it's the camera cutout). translateZ(0) keeps
   the video corners crisp. Sizing comes from `className` (width on mobile,
   height on desktop). */
export function IPhoneFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative aspect-[1206/2500] [container-type:inline-size] ${className}`}>
      <span className="absolute left-[-0.9cqw] top-[19%] h-[7cqw] w-[1cqw] rounded-l-[2px] bg-[rgb(var(--device-body))]" />
      <span className="absolute left-[-0.9cqw] top-[28.5%] h-[12cqw] w-[1cqw] rounded-l-[2px] bg-[rgb(var(--device-body))]" />
      <span className="absolute left-[-0.9cqw] top-[40%] h-[12cqw] w-[1cqw] rounded-l-[2px] bg-[rgb(var(--device-body))]" />
      <span className="absolute right-[-0.9cqw] top-[27%] h-[17cqw] w-[1cqw] rounded-r-[2px] bg-[rgb(var(--device-body))]" />
      <div className="relative h-full w-full rounded-[15cqw] bg-[rgb(var(--device-body))] p-[2.2cqw]">
        <div className="relative h-full w-full overflow-hidden rounded-[13cqw] bg-black [transform:translateZ(0)]">
          {children}
          {/* dynamic island — always black */}
          <div className="absolute left-1/2 top-[3cqw] z-10 h-[8.5cqw] w-[30cqw] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}
