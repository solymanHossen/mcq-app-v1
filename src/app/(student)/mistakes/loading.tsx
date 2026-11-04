import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MistakesLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0 font-sans">
      {/* ── 1. Header Skeleton ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-border/60">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <Skeleton className="h-8 sm:h-10 w-52 sm:w-64 rounded-xl" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Skeleton className="h-9.5 w-28 rounded-xl" />
          <Skeleton className="h-9.5 w-32 rounded-xl" />
        </div>
      </div>

      {/* ── 2. Metric Strip Skeleton ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="size-10 rounded-2xl" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Question Cards Skeleton ── */}
      <div className="space-y-6 sm:space-y-8 min-w-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-2xl border border-border/70 bg-card p-0 gap-0 shadow-xs overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 sm:size-10 rounded-xl" />
                <Skeleton className="h-4.5 w-48 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>

            <div className="p-4 sm:p-6 lg:p-7 space-y-5">
              <div className="space-y-2">
                <Skeleton className="h-5 w-full rounded-md" />
                <Skeleton className="h-5 w-3/4 rounded-md" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-14 w-full rounded-xl" />
                ))}
              </div>

              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
