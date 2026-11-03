import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared/skeletons"

export default function TeacherExamsLoading() {
  return (
    <div className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8 pb-10">
      <PageHeaderSkeleton hasBackButton={false} hasActions={true} />
      <TableSkeleton hasFilters={true} hasSearch={true} columnCount={6} rowCount={6} />
    </div>
  )
}

