import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface KpiGridSkeletonProps {
  count?: number
  columns?: 2 | 3 | 4
  className?: string
}

export function KpiGridSkeleton({
  count = 4,
  columns = 4,
  className,
}: KpiGridSkeletonProps) {
  const gridColsClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

  return (
    <div className={cn("grid gap-4 sm:gap-5", gridColsClass, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs"
        >
          {/* Top Bar: Icon box + Badge */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="size-9 rounded-xl border border-border/70 shrink-0" />
            <Skeleton className="h-5 w-16 sm:w-20 rounded-full" />
          </div>

          {/* Metric Content */}
          <div className="flex flex-col gap-2 pt-3.5">
            {/* Title */}
            <Skeleton className="h-3.5 w-24 sm:w-28 rounded-md" />

            <div className="flex items-baseline justify-between gap-2">
              {/* Big Value */}
              <Skeleton className="h-7 sm:h-8 w-20 sm:w-24 rounded-lg" />
              {/* Sparkline placeholder */}
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>

            {/* Subtext */}
            <Skeleton className="h-3 w-32 rounded-md mt-1" />
          </div>
        </Card>
      ))}
    </div>
  )
}

