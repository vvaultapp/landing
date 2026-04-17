"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  /**
   * Fraction of the element that must be visible before the reveal
   * fires. Default 0.18. For very tall elements (e.g. a full comparison
   * table) pass a low value like 0 or 0.01 — otherwise 18% of a
   * multi-thousand-pixel element means the user has to scroll way
   * past the top before the animation kicks in.
   */
  threshold?: number;
};

export function Reveal({ children, className, delayMs = 0, threshold = 0.18 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(node);

    /* Safety fallback: some environments throttle or never fire
       IntersectionObserver and rAF (we've hit this in a preview
       runner, and it also affects backgrounded tabs). After a
       short delay we force `visible` to true unconditionally so
       the content can't stay stuck at opacity 0. On a healthy
       browser the observer fires long before this timer; on a
       stuck environment the content still appears. */
    const fallback = window.setTimeout(() => {
      setVisible(true);
      observer.disconnect();
    }, 800);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [threshold]);

  /* Belt-and-braces: even after `visible` is true, if the CSS
     transition stalls (frame throttling) the element can sit at
     opacity ~0 indefinitely. Cancel the transition and write the
     final values inline so the element is definitively visible. */
  useEffect(() => {
    if (!visible) return;
    const node = ref.current;
    if (!node) return;
    const timer = window.setTimeout(() => {
      if (!node) return;
      const op = parseFloat(getComputedStyle(node).opacity || "1");
      if (op < 0.95) {
        node.style.transition = "none";
        node.style.opacity = "1";
        node.style.transform = "translateY(0)";
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <div
      ref={ref}
      className={cn('landing-reveal', visible && 'is-visible', className)}
      style={{ transitionDelay: `${Math.max(0, delayMs)}ms` }}
    >
      {children}
    </div>
  );
}
