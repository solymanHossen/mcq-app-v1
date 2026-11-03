import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface PageHeaderSkeletonProps {
  hasBackButton?: boolean
  hasActions?: boolean
  hasBadge?: boolean
  className?: string
}

export function PageHeaderSkeleton({
  hasBackButton = false,
  hasActions = true,
  hasBadge = true,
  className,
}: PageHeaderSkeletonProps) {
  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      {hasBackButton && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 sm:h-8.5 w-28 sm:w-32 rounded-full border border-border/70" />
          <Skeleton className="sm:hidden h-8 w-20 rounded-lg" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Title */}
            <Skeleton className="h-8 sm:h-9 lg:h-10 w-44 sm:w-64 rounded-xl" />
            {hasBadge && (
              <>
                <Skeleton className="h-6 w-16 sm:w-20 rounded-full" />
                <Skeleton className="hidden sm:inline-block h-6 w-16 rounded-full" />
              </>
            )}
          </div>
          {/* Subtitle / Description */}
          <Skeleton className="h-4 w-60 sm:w-96 rounded-md" />
        </div>

        {hasActions && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Skeleton className="h-10 sm:h-11 w-32 sm:w-36 rounded-xl" />
          </div>
        )}
      </div>
    </div>
  )
}

