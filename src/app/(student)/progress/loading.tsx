import { PageHeaderSkeleton, KpiGridSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProgressLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      <PageHeaderSkeleton hasBackButton={false} hasActions={false} />

      {/* Level XP Banner Skeleton */}
      <Card className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full rounded-full" />
      </Card>

      <KpiGridSkeleton count={4} columns={4} />
      <TableSkeleton hasFilters={false} hasSearch={true} columnCount={4} rowCount={5} />
    </div>
  )
}

