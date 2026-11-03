import { PageHeaderSkeleton } from "./page-header-skeleton"
import { KpiGridSkeleton } from "./kpi-grid-skeleton"
import { ChartCardSkeleton } from "./chart-card-skeleton"
import { TableSkeleton } from "./table-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DashboardSkeletonProps {
  hasHeroBanner?: boolean
  hasPageHeader?: boolean
  headerTitleWidth?: string
  kpiCount?: number
  kpiColumns?: 2 | 3 | 4
  chartCount?: 1 | 2 | 3
  hasTable?: boolean
  className?: string
}

export function DashboardSkeleton({
  hasHeroBanner = false,
  hasPageHeader = true,
  kpiCount = 4,
  kpiColumns = 4,
  chartCount = 2,
  hasTable = true,
  className,
}: DashboardSkeletonProps) {
  return (
    <div className={cn("w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0", className)}>
      {/* Optional Hero Banner (e.g. Student Dashboard / Profile) */}
      {hasHeroBanner && (
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 sm:size-20 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-6 sm:h-7 w-40 sm:w-56 rounded-md" />
                <Skeleton className="h-4 w-52 sm:w-72 rounded-md" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Page Header (Teacher & Admin Dashboards) */}
      {hasPageHeader && !hasHeroBanner && (
        <PageHeaderSkeleton hasBackButton={false} />
      )}

      {/* KPI Cards Grid */}
      <KpiGridSkeleton count={kpiCount} columns={kpiColumns} />

      {/* Analytics Charts Grid */}
      {chartCount > 0 && (
        <div
          className={cn(
            "grid gap-6 sm:gap-8 items-start w-full",
            chartCount === 1
              ? "grid-cols-1"
              : chartCount === 2
              ? "grid-cols-1 lg:grid-cols-12"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {chartCount === 2 ? (
            <>
              <div className="lg:col-span-8 min-w-0">
                <ChartCardSkeleton type="area" />
              </div>
              <div className="lg:col-span-4 min-w-0">
                <ChartCardSkeleton type="donut" hasToggles={false} />
              </div>
            </>
          ) : (
            Array.from({ length: chartCount }).map((_, i) => (
              <div key={i} className="min-w-0">
                <ChartCardSkeleton type={i === 2 ? "donut" : "bar"} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Activity / Management Table */}
      {hasTable && <TableSkeleton rowCount={5} columnCount={5} />}
    </div>
  )
}

