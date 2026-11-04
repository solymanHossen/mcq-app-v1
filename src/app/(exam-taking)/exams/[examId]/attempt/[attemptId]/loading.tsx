import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExamAttemptLoading() {
  return (
    <div className="min-h-screen bg-[#F7FAFA] dark:bg-background flex flex-col">
      {/* Top Sticky Header Skeleton */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-card/95 border-b border-border/70 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Skeleton className="size-8 sm:size-9 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-4 sm:h-5 w-36 sm:w-52 rounded-md" />
              <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-28 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Skeleton className="h-8 w-24 sm:w-28 rounded-xl" />
            <Skeleton className="h-8.5 w-24 sm:w-28 rounded-xl" />
          </div>
        </div>
        {/* Progress line skeleton */}
        <div className="w-full border-t border-border/40 bg-muted/20 px-4 sm:px-6 py-1.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-40 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
          <Skeleton className="max-w-4xl mx-auto h-1 w-full rounded-full mt-1" />
        </div>
      </header>

      {/* Main Continuous Question Cards Skeleton */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {Array.from({ length: 3 }).map((_, qIdx) => (
          <Card
            key={qIdx}
            className="rounded-2xl border border-border/70 bg-card p-0 gap-0 shadow-2xs overflow-hidden"
          >
            {/* Card Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>

            {/* Question Text & Options */}
            <div className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-full rounded-md" />
                <Skeleton className="h-5 w-3/4 rounded-md" />
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {Array.from({ length: 4 }).map((_, optIdx) => (
                  <div
                    key={optIdx}
                    className="flex items-center gap-3 p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-border/60 bg-muted/10"
                  >
                    <Skeleton className="size-5 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <Skeleton className="h-8 w-28 rounded-xl" />
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            </div>
          </Card>
        ))}
      </main>
    </div>
  )
}
