import { DetailHeaderSkeleton, KpiGridSkeleton, TableSkeleton } from "@/components/shared/skeletons"

export default function ExamViolationsLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-16 min-w-0">
      <DetailHeaderSkeleton hasChips={true} />
      <KpiGridSkeleton count={3} columns={3} />
      <TableSkeleton hasFilters={true} hasSearch={true} columnCount={5} rowCount={5} />
    </div>
  )
}

