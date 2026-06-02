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
  rootMargin = "500px 0px",
  forceNear = false,
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
  /** IntersectionObserver rootMargin — how early to start loading. Default
      ~1400px ahead (feature clips); the hero clips pass a small margin so they
      load on-view instead of eagerly (keeps the mobile initial load instant). */
  rootMargin?: string;
  /** Arm loading (poster + playback) immediately, even if this clip's own
      observer hasn't fired — used by the hero clips, which sit off-screen
      during the scroll-scrub so their observer wouldn't trigger until they
      slide in. The parent arms them on first scroll (or at mount on desktop). */
  forceNear?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  // Default false ⇒ centered fit, so nothing flashes the bigger framing.
  const [isTall, setIsTall] = useState(false);
  // When fading in, stay hidden until the first frame is ready.
  const [ready, setReady] = useState(!fadeIn);
  // Attach the poster only once the clip nears the viewport, so the
  // (collectively heavy ~400KB) poster images don't all download on initial
  // paint — they're part of the lazy load instead.
  const [near, setNear] = useState(false);
  // Let a parent arm the load explicitly (the hero clips are scroll-scrubbed
  // off-screen, so their own observer won't fire until they slide in).
  useEffect(() => {
    if (forceNear) setNear(true);
  }, [forceNear]);

  // Measure orientation from the poster (same aspect as the video, a tiny
  // webp). Deferred until the clip nears the viewport so the poster fetch is
  // part of the lazy load, not the initial paint.
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
    if (reduce) {
      // No autoplay for reduced-motion users — reveal the poster instead.
      setNear(true);
      setReady(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setNear(true);
            void v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      // How early to start loading before the clip enters view — set by the
      // rootMargin prop (default ~1400px ahead for feature clips; hero clips
      // pass a small margin so they load on-view, not eagerly on mobile).
      { rootMargin, threshold: 0.01 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

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
