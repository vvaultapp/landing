import { Skeleton } from '@/components/ui/skeleton';

export function TasksPageSkeleton() {
  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <Skeleton className="h-9 w-40 rounded-2xl bg-white/10" />
          <Skeleton className="h-4 w-72 rounded-xl bg-white/[0.06] mt-3" />
        </div>
        <Skeleton className="h-10 w-36 rounded-2xl bg-white/10" />
      </div>

      <div className="flex gap-6">
        {/* Filters */}
        <div className="w-[260px] shrink-0 hidden md:block">
          <div className="border border-white/10 rounded-3xl p-4 bg-black">
            <Skeleton className="h-9 w-full rounded-2xl bg-white/[0.06]" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                  <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                  <Skeleton className="h-4 w-32 rounded-xl bg-white/[0.08]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="border border-white/10 rounded-2xl p-4 bg-black">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-5 w-5 rounded-full bg-white/10 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-64 rounded-xl bg-white/[0.08]" />
                    <Skeleton className="h-3 w-80 rounded-xl bg-white/[0.06] mt-2" />
                    <Skeleton className="h-3 w-40 rounded-xl bg-white/[0.06] mt-3" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-full bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

