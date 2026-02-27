import { Skeleton } from '@/components/ui/skeleton';

export function ListPageSkeleton({
  rows = 8,
  showSearch = true,
  showFilters = true,
}: {
  rows?: number;
  showSearch?: boolean;
  showFilters?: boolean;
}) {
  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <Skeleton className="h-9 w-44 rounded-2xl bg-white/10" />
          <Skeleton className="h-4 w-72 rounded-xl bg-white/[0.06] mt-3" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl bg-white/10" />
      </div>

      {showSearch ? (
        <div className="mb-3">
          <Skeleton className="h-10 w-full rounded-2xl bg-white/[0.06]" />
        </div>
      ) : null}

      {showFilters ? (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-36 rounded-2xl bg-white/[0.06]" />
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="border border-white/8 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-40 rounded-xl bg-white/10" />
                <Skeleton className="h-3 w-64 rounded-xl bg-white/[0.06] mt-2" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

