"use client";

import { useEffect, useRef, useState } from "react";

/* Auto-looping, muted, inline video — the untitled.stream treatment:
   no controls, no play button. Four things matter here:

   1. preload="none" + lazy play — nothing downloads until the clip
      is about to scroll into view. An IntersectionObserver play()s
      it when it nears the viewport and pause()s it once it leaves,
      so only the 1–3 clips you can actually see ever decode. That's
      what keeps scrolling buttery with a dozen videos on the page.
   2. <source> order webm → mp4 — the browser picks the smallest
      format it supports (VP9/AV1 webm is ~30–50% lighter than mp4),
      falling back to mp4 on Safari.
   3. Shape-aware fit — a very tall (≈9:16 phone) clip and a normal
      clip want different framing. We read the poster's natural size
      (it loads fast + shares the clip's aspect) and apply
      `tallClassName` (phone: sits on the bottom, gap on top) or
      `centeredClassName` (everything else: centered). The DEFAULT
      before measuring is the *centered* fit, so a clip never flashes
      the wrong (bigger) framing — that's what kept it looking
      different between screens.
   4. All sizing is a % of the card, so the composition is identical
      at every resolution; only the card's absolute size changes. */

// Clearly taller than wide (w/h < 0.9) ⇒ phone clip: sits on the bottom.
// Square-ish and landscape clips are centered in the middle instead.
const TALL_RATIO = 0.9;

export function LoopingVideo({
  src,
  poster,
  className = "",
  tallClassName = "",
  centeredClassName = "",
  fitOverride = "",
}: {
  /** Base path WITHOUT extension, e.g. "/landing/features/upload".
      Expects `${src}.webm` and `${src}.mp4` in /public. */
  src: string;
  /** Optional first-frame still, e.g. "/landing/features/upload.webp". */
  poster?: string;
  /** Always-applied classes (positioning context, rounding, etc.). */
  className?: string;
  /** Applied when the clip is much taller than wide (≈9:16+). */
  tallClassName?: string;
  /** Applied otherwise — the default until the shape is measured. */
  centeredClassName?: string;
  /** If set, used verbatim instead of the auto tall/centered class —
      lets one card hand-tune its video's size + vertical position. */
  fitOverride?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  // Default false ⇒ centered fit, so nothing flashes the bigger framing.
  const [isTall, setIsTall] = useState(false);

  // Measure orientation from the poster (same aspect as the video, but a
  // tiny webp, so it resolves almost immediately).
  useEffect(() => {
    if (!poster) return;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalHeight > 0) {
        setIsTall(img.naturalWidth / img.naturalHeight < TALL_RATIO);
      }
    };
    img.src = poster;
  }, [poster]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // respect users who don't want motion — poster stays

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) void v.play().catch(() => {});
          else v.pause();
        }
      },
      { rootMargin: "300px 0px", threshold: 0.05 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const fit = fitOverride || (isTall ? tallClassName : centeredClassName);

  return (
    <video
      ref={ref}
      className={`${className} ${fit}`.trim()}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
    >
      <source src={`${src}.webm`} type="video/webm" />
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
  );
}
