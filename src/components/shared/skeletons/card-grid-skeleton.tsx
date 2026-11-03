import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface CardGridSkeletonProps {
  count?: number
  columns?: 2 | 3 | 4
  hasFilters?: boolean
  className?: string
}

export function CardGridSkeleton({
  count = 6,
  columns = 3,
  hasFilters = false,
  className,
}: CardGridSkeletonProps) {
  const gridColsClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

  return (
    <div className={cn("space-y-6 sm:space-y-8", className)}>
      {hasFilters && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 rounded-2xl bg-muted/60 p-1.5 border border-border/40 w-fit">
            <Skeleton className="h-8 w-20 sm:w-24 rounded-xl" />
            <Skeleton className="h-8 w-20 sm:w-24 rounded-xl" />
            <Skeleton className="h-8 w-20 sm:w-24 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
        </div>
      )}

      <div className={cn("grid gap-5 sm:gap-6", gridColsClass)}>
        {Array.from({ length: count }).map((_, index) => (
          <Card
            key={index}
            className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs"
          >
            {/* Card Header: Icon tag + Status badge */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-6 w-20 sm:w-24 rounded-full" />
                <Skeleton className="h-6 w-16 sm:w-20 rounded-full" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <Skeleton className="h-5 sm:h-6 w-full rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
                <Skeleton className="h-3.5 w-3/5 rounded-md" />
              </div>

              {/* Meta Chips (Duration, Questions, Passing) */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-6 w-18 rounded-lg" />
              </div>
            </div>

            {/* Card Footer: Action button */}
            <div className="pt-5 mt-4 border-t border-border/50">
              <Skeleton className="h-10 sm:h-11 w-full rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

