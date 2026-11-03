import { PageHeaderSkeleton, KpiGridSkeleton, TableSkeleton } from "@/components/shared/skeletons"

export default function AdminPaymentsLoading() {
  return (
    <div className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      <PageHeaderSkeleton hasBackButton={false} hasActions={false} />
      <KpiGridSkeleton count={4} columns={4} />
      <TableSkeleton hasFilters={true} hasSearch={true} columnCount={6} rowCount={6} />
    </div>
  )
}

