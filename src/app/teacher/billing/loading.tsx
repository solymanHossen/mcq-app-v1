import { PageHeaderSkeleton, KpiGridSkeleton, TableSkeleton } from "@/components/shared/skeletons"

export default function TeacherBillingLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      <PageHeaderSkeleton hasBackButton={false} hasActions={false} />
      <KpiGridSkeleton count={3} columns={3} />
      <TableSkeleton hasFilters={false} hasSearch={false} columnCount={5} rowCount={4} />
    </div>
  )
}

