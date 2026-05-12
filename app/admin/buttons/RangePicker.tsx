"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function RangePicker({
  current,
  ranges,
}: {
  current: string;
  ranges: readonly string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setRange = (next: string) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("range", next);
    startTransition(() => router.push(`?${sp.toString()}`));
  };

  const refresh = () => {
    startTransition(() => router.refresh());
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ranges.map((r) => {
        const active = r === current;
        return (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium transition-colors ${
              active
                ? "bg-black text-white"
                : "bg-white text-[#101112]/70 hover:bg-black/[0.05] hover:text-[#101112]"
            } ${pending ? "opacity-60" : ""}`}
          >
            {r}
          </button>
        );
      })}
      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="inline-flex h-9 items-center rounded-full bg-white px-4 text-[13px] font-medium text-[#101112]/70 transition-colors hover:bg-black/[0.05] hover:text-[#101112] disabled:opacity-60"
      >
        Refresh
      </button>
    </div>
  );
}
