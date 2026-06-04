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
  /** Above-the-fold clips (the hero): show the poster immediately so the card
      is never grey, and start the video right after the page's load event
      (off the critical path). Leave false for scroll-down feature clips, which
      reveal their poster + load their video only once scrolled near. */
  eager?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  // Default false ⇒ centered fit, so nothing flashes the bigger framing.
  const [isTall, setIsTall] = useState(false);
  // The video has a real frame ⇒ fade it in OVER the always-visible poster.
  const [videoReady, setVideoReady] = useState(false);
  // Reveal the clip (load the video) once it nears the viewport. Eager (hero)
  // clips show their poster immediately and load the video right after the
  // page's load event, so the hero is never grey yet the clip stays off the
  // critical path.
  const [near, setNear] = useState(false);
  const posterRef = useRef<HTMLImageElement>(null);

  // The poster is rendered at full opacity (it just appears once decoded), so
  // there's no load race to handle for visibility. We only read its orientation
  // here in case it was served from cache and mounted already-complete (no
  // onLoad), so the framing is right from the first frame.
  useEffect(() => {
    if (!(eager || near)) return;
    const img = posterRef.current;
    if (img && img.complete && img.naturalHeight > 0) {
      setIsTall(img.naturalWidth / img.naturalHeight < TALL_RATIO);
    }
  }, [eager, near]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveal (poster already visible) and, unless reduced motion, start
    // streaming + playing — this only swaps the still frame for the moving one.
    const activate = () => {
      setNear(true);
      if (!reduce) void v.play().catch(() => {});
    };

    // Eager (hero, in view from the start): the poster renders immediately (see
    // the markup below), and we start the video right AFTER the page finishes
    // loading — off the critical path / load event, but WITHOUT the long idle
    // wait that used to leave the hero grey for seconds.
    if (eager) {
      // The load event has already fired (or we wait for it), so starting the
      // video here is off the critical path. A 0ms timeout yields once so we
      // don't contend with hydration, and (unlike rAF) still fires in a
      // background tab.
      const start = () => setTimeout(activate, 0);
      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
      return;
    }

    // Non-eager (feature / mobile hero, below the fold): reveal + load when it
    // scrolls near, so nothing streams on the first paint.
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
  // Show the poster as soon as the clip is active — immediately for eager/hero
  // clips, on scroll-near for feature clips. The poster sits UNDER the video;
  // when the video has a real frame it fades in and covers the poster, so the
  // card goes grey → poster (fast, tiny webp) → moving video, never grey-for-long.
  const showPoster = eager || near;

  return (
    <>
      {showPoster && poster ? (
        <img
          ref={posterRef}
          src={poster}
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          className={`${className} ${fit} pointer-events-none select-none`.trim()}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalHeight > 0) {
              setIsTall(img.naturalWidth / img.naturalHeight < TALL_RATIO);
            }
          }}
        />
      ) : null}
      <video
        ref={ref}
        className={`${className} ${fit} transition-opacity duration-500 ease-out ${
          videoReady ? "opacity-100" : "opacity-0"
        }`.trim()}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
        onLoadedData={() => setVideoReady(true)}
        onCanPlay={() => setVideoReady(true)}
      >
        <source src={`${src}.webm`} type="video/webm" />
        <source src={`${src}.mp4`} type="video/mp4" />
      </video>
    </>
  );
}
