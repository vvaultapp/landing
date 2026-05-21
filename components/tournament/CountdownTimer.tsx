"use client";

import { useEffect, useState } from "react";

type Props = {
  endsAt: string | null;
  closedLabel: string;
  notStartedLabel: string;
};

function fmt(ms: number): { d: number; h: number; m: number; s: number } {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { d, h, m, s };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownTimer({ endsAt, closedLabel, notStartedLabel }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!endsAt) {
    return (
      <span className="text-[13px] text-white/85">
        {notStartedLabel}
      </span>
    );
  }

  const target = new Date(endsAt).getTime();
  const remaining = target - now;
  if (remaining <= 0) {
    return (
      <span className="text-[13px] text-white/85">
        {closedLabel}
      </span>
    );
  }

  const { d, h, m, s } = fmt(remaining);
  const isFinalMinute = remaining < 60_000;

  return (
    <span
      className={`inline-flex items-baseline gap-1 tabular-nums font-mono ${
        isFinalMinute ? "text-sky-400 animate-pulse" : "text-white"
      }`}
      aria-live="polite"
    >
      {d > 0 ? (
        <>
          <span className="text-[20px] sm:text-[24px] font-semibold">{d}</span>
          <span className="text-[11px] text-white/85">d</span>
        </>
      ) : null}
      <span className="text-[20px] sm:text-[24px] font-semibold">{pad(h)}</span>
      <span className="text-[11px] text-white/85">h</span>
      <span className="text-[20px] sm:text-[24px] font-semibold">{pad(m)}</span>
      <span className="text-[11px] text-white/85">m</span>
      <span className="text-[20px] sm:text-[24px] font-semibold">{pad(s)}</span>
      <span className="text-[11px] text-white/85">s</span>
    </span>
  );
}
