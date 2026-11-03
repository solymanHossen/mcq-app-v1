import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface TableSkeletonProps {
  hasFilters?: boolean
  hasSearch?: boolean
  columnCount?: number
  rowCount?: number
  className?: string
}

export function TableSkeleton({
  hasFilters = true,
  hasSearch = true,
  columnCount = 6,
  rowCount = 6,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("w-full max-w-full min-w-0 space-y-4 sm:space-y-6", className)}>
      {/* Controls Bar: Filter Tabs & Search */}
      {(hasFilters || hasSearch) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {hasFilters && (
            <div className="flex items-center gap-1.5 rounded-2xl bg-muted/60 p-1.5 border border-border/40 w-fit">
              <Skeleton className="h-8 w-20 sm:w-24 rounded-xl" />
              <Skeleton className="h-8 w-16 sm:w-20 rounded-xl" />
              <Skeleton className="h-8 w-16 sm:w-20 rounded-xl" />
              <Skeleton className="hidden sm:inline-block h-8 w-16 sm:w-20 rounded-xl" />
            </div>
          )}

          {hasSearch && (
            <div className="w-full sm:max-w-xs">
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          )}
        </div>
      )}

      {/* Table Card Container */}
      <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-2xs">
        {/* Table Header Row */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3.5 sm:px-6">
          <Skeleton className="h-4 w-32 rounded-md" />
          <div className="hidden sm:flex items-center gap-6">
            {Array.from({ length: Math.min(columnCount - 2, 4) }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20 rounded-md" />
            ))}
          </div>
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-border/40">
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center justify-between px-4 py-3.5 sm:px-6 gap-3"
            >
              {/* Primary Col (Title / User) */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="space-y-1.5 min-w-0 flex-1">
                  <Skeleton className="h-4 w-36 sm:w-48 rounded-md" />
                  <Skeleton className="h-3 w-24 sm:w-32 rounded-md" />
                </div>
              </div>

              {/* Middle Columns (Desktop only) */}
              <div className="hidden sm:flex items-center gap-6">
                <Skeleton className="h-5 w-18 sm:w-20 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>

              {/* Action Column */}
              <div className="flex items-center justify-end gap-2 shrink-0">
                <Skeleton className="h-8 w-16 sm:w-20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-3 sm:px-6">
          <Skeleton className="h-4 w-36 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

