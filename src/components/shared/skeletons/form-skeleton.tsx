import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface FormSkeletonProps {
  twoColumn?: boolean
  className?: string
}

export function FormSkeleton({
  twoColumn = true,
  className,
}: FormSkeletonProps) {
  return (
    <div
      className={cn(
        twoColumn
          ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full"
          : "max-w-4xl space-y-8 w-full",
        className
      )}
    >
      {/* Main Canvas */}
      <div
        className={cn(
          "space-y-8 min-w-0",
          twoColumn ? "lg:col-span-8" : "w-full"
        )}
      >
        {/* CARD 1: Primary Details */}
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
          {/* Card Header matching /teacher/exams/new */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <Skeleton className="size-9 sm:size-11 rounded-xl sm:rounded-2xl shrink-0" />
              <div className="space-y-1 min-w-0">
                <Skeleton className="h-5 sm:h-6 w-36 sm:w-48 rounded-md" />
                <Skeleton className="h-3.5 w-48 sm:w-64 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>

          {/* Card Content Form Fields */}
          <div className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
            {/* Field 1: Title Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3.5 w-12 rounded-md" />
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>

            {/* Field 2: Description Textarea */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>

            {/* Field 3: 2-Column Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </Card>

        {/* CARD 2: Additional Settings / Timing */}
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <Skeleton className="size-9 sm:size-11 rounded-xl sm:rounded-2xl shrink-0" />
              <div className="space-y-1 min-w-0">
                <Skeleton className="h-5 sm:h-6 w-40 sm:w-52 rounded-md" />
                <Skeleton className="h-3.5 w-44 sm:w-56 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="p-4 sm:p-6 lg:p-7 space-y-4">
            {/* Toggle Rows */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/10 gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <Skeleton className="h-4 w-36 sm:w-44 rounded-md" />
                  <Skeleton className="h-3 w-56 sm:w-72 rounded-md" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right Sidebar (Matching /teacher/exams/new summary card) */}
      {twoColumn && (
        <div className="space-y-6 lg:col-span-4 min-w-0">
          <Card className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-3.5 w-16 rounded-md" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/50 space-y-2.5">
              <Skeleton className="h-11 sm:h-12 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

