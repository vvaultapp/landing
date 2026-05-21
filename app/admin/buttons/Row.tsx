import {
  type Aggregated,
  formatNumber,
  formatRelative,
} from "./lib/buttons-catalog";

/* One line in a ranked list. Used both by the main page Top-5 panel
   and the per-page detail route. */
export function Row({
  row,
  rank,
  isWinner,
  share,
  hideRankBadge = false,
}: {
  row: Aggregated;
  rank: number;
  isWinner: boolean;
  share: number;
  hideRankBadge?: boolean;
}) {
  return (
    <li className="flex items-center gap-4 px-6 py-4 sm:px-8">
      {!hideRankBadge ? (
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums ${
            isWinner
              ? "bg-black text-white"
              : row.clicks === 0
                ? "bg-[#101112]/[0.04] text-[#101112]/35"
                : "bg-[#101112]/[0.06] text-[#101112]/65"
          }`}
        >
          {rank}
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14.5px] font-semibold">
            {row.name}
          </span>
          {row.spot ? (
            <span className="text-[11.5px] text-[#101112]/50">— {row.spot}</span>
          ) : null}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#101112]/[0.05]">
          <div
            className={`h-full rounded-full ${
              row.clicks === 0
                ? "bg-transparent"
                : isWinner
                  ? "bg-black"
                  : "bg-[#101112]/55"
            }`}
            style={{ width: `${share}%` }}
          />
        </div>
        <div className="mt-1.5 text-[11.5px] text-[#101112]/45">
          {row.clicks === 0
            ? "no clicks in this range"
            : `Clicked by ${formatNumber(row.uniqueVisitors)} different visitor${row.uniqueVisitors === 1 ? "" : "s"} · most recent ${formatRelative(row.lastClicked)}`}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="text-[20px] font-semibold leading-none tabular-nums">
          {formatNumber(row.clicks)}
        </div>
        <div className="mt-1 text-[10.5px] uppercase tracking-[0.08em] text-[#101112]/45">
          clicks
        </div>
      </div>
    </li>
  );
}
