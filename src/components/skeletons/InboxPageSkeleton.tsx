import { Skeleton } from '@/components/ui/skeleton';

export function InboxPageSkeleton() {
  return (
    <div className="h-full flex bg-black overflow-hidden">
      {/* Conversation List */}
      <div className="w-[360px] border-r-[0.5px] border-white/10 flex flex-col min-w-0">
        {/* Header / search */}
        <div className="p-5 pb-4 border-b-[0.5px] border-white/8">
          <Skeleton className="h-7 w-32 rounded-xl bg-white/10" />
          <Skeleton className="h-10 w-full rounded-2xl bg-white/[0.06] mt-4" />
          <div className="flex items-center gap-2 mt-4">
            <Skeleton className="h-8 w-24 rounded-xl bg-white/[0.06]" />
            <Skeleton className="h-8 w-24 rounded-xl bg-white/[0.06]" />
            <Skeleton className="h-8 w-24 rounded-xl bg-white/[0.06]" />
          </div>
        </div>

        {/* Thread rows */}
        <div className="flex-1 overflow-hidden">
          <div className="py-2">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={idx} className="w-full px-5 py-4 border-b-[0.5px] border-white/8 flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-4 w-40 rounded-xl bg-white/10" />
                    <Skeleton className="h-3 w-12 rounded-xl bg-white/[0.06]" />
                  </div>
                  <Skeleton className="h-3 w-64 rounded-xl bg-white/[0.06] mt-2" />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Skeleton className="h-6 w-24 rounded-full bg-white/[0.06]" />
                    <Skeleton className="h-6 w-24 rounded-full bg-white/[0.06]" />
                    <Skeleton className="h-6 w-20 rounded-full bg-white/[0.06]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation panel */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="h-[88px] border-b-[0.5px] border-white/10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            <div className="min-w-0">
              <Skeleton className="h-4 w-40 rounded-xl bg-white/10" />
              <Skeleton className="h-3 w-28 rounded-xl bg-white/[0.06] mt-2" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-xl bg-white/[0.06]" />
            <Skeleton className="h-9 w-9 rounded-xl bg-white/[0.06]" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="space-y-4">
            {/* inbound */}
            <div className="flex justify-start">
              <Skeleton className="h-12 w-[60%] max-w-[420px] rounded-2xl bg-white/[0.06]" />
            </div>
            {/* outbound */}
            <div className="flex justify-end">
              <Skeleton className="h-10 w-[52%] max-w-[360px] rounded-2xl bg-white/[0.08]" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-16 w-[68%] max-w-[520px] rounded-2xl bg-white/[0.06]" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-12 w-[58%] max-w-[420px] rounded-2xl bg-white/[0.08]" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-10 w-[40%] max-w-[280px] rounded-2xl bg-white/[0.06]" />
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="border-t-[0.5px] border-white/10 p-4">
          <Skeleton className="h-12 w-full rounded-2xl bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

