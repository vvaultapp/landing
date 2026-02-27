import { Skeleton } from '@/components/ui/skeleton';

export function PortalMainSkeleton() {
  return (
    <>
      <Skeleton className="h-9 w-40 rounded-2xl bg-white/10" />
      <Skeleton className="h-4 w-72 rounded-xl bg-white/[0.06] mt-3" />

      <div className="mt-8 space-y-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-16 w-full rounded-2xl bg-white/[0.06]" />
        ))}
      </div>
    </>
  );
}

export function PortalFrameSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <PortalMainSkeleton />
      </div>
    </div>
  );
}
