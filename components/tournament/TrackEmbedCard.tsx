"use client";

/* Renders a VVault track preview: artwork + title + username + "Play
   on VVault" CTA that opens the track page in a new tab.

   We don't inline-iframe the player because vvault.app doesn't publish
   an embed URL pattern (and most pages set X-Frame-Options). If a
   public embed pattern lands, swap in the iframe by computing the
   embed URL from `participant.track_url`. */

import type { ReactNode } from "react";
import type { ParticipantWithVotes } from "@/lib/tournament/types";

type Props = {
  participant: ParticipantWithVotes;
  showVotes?: boolean;
  emphasis?: "neutral" | "a" | "b";
  compact?: boolean;
  actionSlot?: ReactNode;
};

export function TrackEmbedCard({
  participant,
  showVotes = false,
  emphasis = "neutral",
  compact = false,
  actionSlot,
}: Props) {
  const cover = participant.track_artwork_url;
  const accent =
    emphasis === "a"
      ? "from-sky-400/30 via-sky-400/10 to-transparent"
      : emphasis === "b"
        ? "from-fuchsia-400/30 via-fuchsia-400/10 to-transparent"
        : "from-white/10 via-white/5 to-transparent";

  return (
    <div className="group relative isolate flex flex-col overflow-hidden rounded-[22px] border border-white/[0.06] bg-white/[0.025] sm:rounded-[26px]">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${accent} opacity-80`}
        aria-hidden
      />
      <div className="relative aspect-square w-full overflow-hidden bg-black/40">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={participant.track_title ?? ""}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/30">
            <svg viewBox="0 0 24 24" className="h-12 w-12 fill-current">
              <path d="M9 17V7l11-2v10a3 3 0 1 1-2-2.83V7.27L11 8.6V19a3 3 0 1 1-2-2.83V17z" />
            </svg>
          </div>
        )}
        <a
          href={participant.track_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-md transition hover:bg-black/85"
        >
          ▶ Play on VVault
        </a>
      </div>

      <div className="relative flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-white">
            {participant.track_title || "Untitled"}
          </div>
          {participant.vvault_username ? (
            <div className="truncate text-[12.5px] text-white/55">
              @{participant.vvault_username}
            </div>
          ) : null}
        </div>
        {actionSlot ? (
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="flex-1">{actionSlot}</div>
            {showVotes ? (
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11.5px] font-semibold tabular-nums text-white/75">
                {participant.votes}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
