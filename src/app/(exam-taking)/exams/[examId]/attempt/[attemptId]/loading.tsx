import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExamAttemptLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4 sm:py-8 px-4">
      {/* Top Exam Header with Timer & Progress */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/70 bg-card shadow-xs">
        <div className="space-y-1">
          <Skeleton className="h-5 w-40 sm:w-56 rounded-md" />
          <Skeleton className="h-3.5 w-24 sm:w-32 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Main Question Card Skeleton */}
      <Card className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>

        {/* Question Text */}
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-4/5 rounded-md" />
          <Skeleton className="h-5 w-2/3 rounded-md" />
        </div>

        {/* Options */}
        <div className="space-y-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-muted/10"
            >
              <Skeleton className="size-5 rounded-full shrink-0" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
          ))}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      </Card>
    </div>
  )
}

