import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeaderboardLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      <PageHeaderSkeleton hasBackButton={false} hasActions={false} />

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex flex-col items-center text-center space-y-3"
          >
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-full mt-2" />
          </Card>
        ))}
      </div>

      <TableSkeleton hasFilters={false} hasSearch={false} columnCount={5} rowCount={8} />
    </div>
  )
}

