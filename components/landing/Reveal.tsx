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
    return () => observer.disconnect();
  }, [threshold]);

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
