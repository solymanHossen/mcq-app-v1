import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DetailHeaderSkeletonProps {
  hasChips?: boolean
  className?: string
}

export function DetailHeaderSkeleton({
  hasChips = true,
  className,
}: DetailHeaderSkeletonProps) {
  return (
    <div className={cn("space-y-4 pb-4 border-b border-border/60", className)}>
      <Skeleton className="h-8 w-32 rounded-full border border-border/70" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Skeleton className="h-7 sm:h-9 w-48 sm:w-80 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64 sm:w-96 rounded-md" />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {hasChips && (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-28 rounded-lg" />
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      )}
    </div>
  )
}

