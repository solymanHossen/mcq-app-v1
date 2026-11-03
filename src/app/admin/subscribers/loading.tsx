import { PageHeaderSkeleton, KpiGridSkeleton, TableSkeleton } from "@/components/shared/skeletons"

export default function AdminSubscribersLoading() {
  return (
    <div className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      <PageHeaderSkeleton hasBackButton={true} hasActions={true} hasBadge={true} />
      <KpiGridSkeleton count={3} columns={3} />
      <TableSkeleton hasFilters={true} hasSearch={true} columnCount={5} rowCount={8} />
    </div>
  )
}
