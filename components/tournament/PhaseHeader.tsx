"use client";

import { AuthHeaderButton } from "./AuthHeaderButton";
import { CountdownTimer } from "./CountdownTimer";
import type { TournamentPhase } from "@/lib/tournament/types";
import { phaseLabel } from "@/lib/tournament/types";
import type { Locale } from "@/lib/useLocale";
import type { TournamentCopy } from "./copy";

type Props = {
  title: string;
  phase: TournamentPhase | null;
  copy: TournamentCopy;
  locale: Locale;
};

export function PhaseHeader({ title, phase, copy, locale }: Props) {
  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-zinc-900 bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-zinc-800"
      />
      <div className="mx-auto flex w-full max-w-[1200px] items-center gap-3 px-5 py-3.5 sm:gap-5 sm:px-8 sm:py-4">
        <a
          href="/"
          aria-label="VVault home"
          className="flex shrink-0 items-center gap-2 text-[13.5px] font-medium text-white"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[13px] font-bold text-black">
            V
          </span>
          <span className="hidden tracking-tight sm:inline">{title}</span>
        </a>

        {phase ? (
          <span className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-[11.5px] font-semibold tracking-[0.12em] text-zinc-200 sm:inline-flex">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-sky-400" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-sky-400" />
            </span>
            {phaseLabel(phase, locale).toUpperCase()}
          </span>
        ) : null}

        <span className="ml-auto" />

        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {copy.countdownLabel}
          </span>
          <CountdownTimer
            endsAt={phase?.ends_at ?? null}
            closedLabel={copy.closedLabel}
            notStartedLabel={copy.notStartedLabel}
          />
        </div>

        <div className="sm:hidden">
          <CountdownTimer
            endsAt={phase?.ends_at ?? null}
            closedLabel={copy.closedLabel}
            notStartedLabel={copy.notStartedLabel}
          />
        </div>

        <AuthHeaderButton locale={locale} />
      </div>
    </div>
  );
}
