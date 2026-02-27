import { Skeleton } from '@/components/ui/skeleton';

// Main-area skeleton used while auth/workspace state is loading.
// (We intentionally do not skeletonize the sidebar.)
export function AppMainSkeleton() {
  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <Skeleton className="h-9 w-44 rounded-2xl bg-white/10" />
          <Skeleton className="h-4 w-72 rounded-xl bg-white/[0.06] mt-3" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl bg-white/10" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Skeleton className="h-[260px] rounded-3xl bg-white/[0.06]" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-[140px] rounded-3xl bg-white/[0.06]" />
            <Skeleton className="h-[140px] rounded-3xl bg-white/[0.06]" />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Skeleton className="h-[220px] rounded-3xl bg-white/[0.06]" />
          <Skeleton className="h-[220px] rounded-3xl bg-white/[0.06]" />
        </div>
      </div>
    </>
  );
}

export function AppFrameSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto pt-16 px-8">
        <AppMainSkeleton />
      </div>
    </div>
  );
}
