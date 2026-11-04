import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function StudentDashboardLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 font-sans">
      {/* ── 1. Minimal Page Header Skeleton ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-border/60">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <Skeleton className="h-8 sm:h-10 w-52 sm:w-64 rounded-xl" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
      </div>

      {/* ── 2. Metric Cards Skeleton ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="size-8.5 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Action Gateways Skeleton ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="size-11 rounded-2xl" />
              <Skeleton className="size-5 rounded-md" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-3/4 rounded-md" />
            </div>
            <div className="pt-3 border-t border-border/40">
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. Recent Exam Activity Skeleton ── */}
      <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 sm:size-11 rounded-xl sm:rounded-2xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-3.5 w-56 rounded-md hidden sm:block" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>

        <div className="divide-y divide-border/50">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4.5 w-48 sm:w-64 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-3 w-36 rounded-md" />
              </div>
              <Skeleton className="h-8.5 w-28 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
