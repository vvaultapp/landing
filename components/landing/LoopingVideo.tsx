"use client";

import { useEffect, useRef, useState } from "react";

/* Auto-looping, muted, inline video — the untitled.stream treatment:
   no controls, no play button. What matters here:

   1. preload="none" + lazy play — nothing downloads until the clip is
      about to scroll into view. An IntersectionObserver play()s it when it
      nears the viewport (with a generous rootMargin so it's loaded BEFORE
      it's on screen, never popping in as you reach it) and pause()s it once
      it leaves, so only the clips near the viewport ever decode.
   2. Fade-in — when the first frame is ready the clip fades in over the
      card's grey placeholder instead of snapping in, so scrolling reads as
      smooth rather than "buggy". Disable with fadeIn={false} (the hero clips
      slide in instead, so they opt out).
   3. <source> order webm → mp4 — the browser picks the smallest format it
      supports, falling back to mp4 on Safari.
   4. Shape-aware fit — a very tall (≈9:16 phone) clip and a normal clip want
      different framing. We read the poster's natural size and apply
      `tallClassName` or `centeredClassName` (the default until measured). */

// Clearly taller than wide (w/h < 0.9) ⇒ phone clip: sits on the bottom.
const TALL_RATIO = 0.9;

export function LoopingVideo({
  src,
  poster,
  className = "",
  tallClassName = "",
  centeredClassName = "",
  fitOverride = "",
  fadeIn = true,
  eager = false,
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
  /** If set, used verbatim instead of the auto tall/centered class. */
  fitOverride?: string;
  /** Fade the clip in when its first frame is ready (default). Set false to
      keep it visible immediately (e.g. when a parent handles the entrance). */
  fadeIn?: boolean;
  /** Above-the-fold clips (the hero): preload eagerly (`preload="auto"`)
      and preload the poster, so the first frame is ready immediately and
      the clip never flashes black while loading. Leave false for the
      scroll-down feature clips, which stay lazy (`preload="none"`). */
  eager?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  // Default false ⇒ centered fit, so nothing flashes the bigger framing.
  const [isTall, setIsTall] = useState(false);
  // When fading in, stay hidden until the first frame is ready.
  const [ready, setReady] = useState(!fadeIn);
  // Only load the poster + clip once it nears the viewport (eager/hero clips
  // load immediately). Keeps below-the-fold feature posters AND clips off the
  // initial page load, so the first paint requests almost nothing.
  const [near, setNear] = useState(false);

  // Measure orientation from the poster (same aspect as the video, but a
  // tiny webp, so it resolves almost immediately).
  useEffect(() => {
    if (!poster || !near) return;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalHeight > 0) {
        setIsTall(img.naturalWidth / img.naturalHeight < TALL_RATIO);
      }
    };
    img.src = poster;
  }, [poster, near]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Start loading the poster + clip. Reduced motion just reveals the poster.
    const activate = () => {
      setNear(true);
      if (reduce) setReady(true);
      else void v.play().catch(() => {});
    };

    // Eager (hero, above the fold): activate once the page has FINISHED loading,
    // so the ~1 MB of video is off the critical path / out of the load event —
    // the loading bar finishes first, then the clip streams in. No IO needed
    // since it's always in view.
    if (eager) {
      // Wait for the page to finish loading, THEN for the browser to go idle,
      // before streaming the ~1 MB clip — so the loading bar always completes
      // first (even on Safari, which tracks network), and the clip fills in.
      const schedule = () => {
        const ric = (window as Window & {
          requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
        }).requestIdleCallback;
        if (ric) ric(() => activate(), { timeout: 1200 });
        else setTimeout(activate, 200);
      };
      if (document.readyState === "complete") schedule();
      else window.addEventListener("load", schedule, { once: true });
      return;
    }

    // Non-eager (feature, below the fold): activate when it scrolls near, so
    // below-the-fold clips/posters never stream on the first paint.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) activate();
          else if (!reduce) v.pause();
        }
      },
      { rootMargin: "250px 0px", threshold: 0.01 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [eager]);

  const fit = fitOverride || (isTall ? tallClassName : centeredClassName);
  const fade = fadeIn
    ? `transition-opacity duration-500 ease-out ${ready ? "opacity-100" : "opacity-0"}`
    : "";

  return (
    <video
      ref={ref}
      className={`${className} ${fit} ${fade}`.trim()}
      poster={near ? poster : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      onLoadedData={() => setReady(true)}
      onCanPlay={() => setReady(true)}
      onError={() => setReady(true)}
    >
      <source src={`${src}.webm`} type="video/webm" />
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
  );
}
