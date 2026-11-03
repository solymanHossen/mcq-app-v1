import { DetailHeaderSkeleton, TableSkeleton } from "@/components/shared/skeletons"

export default function ExamLeaderboardLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      <DetailHeaderSkeleton hasChips={true} />
      <TableSkeleton hasFilters={false} hasSearch={true} columnCount={5} rowCount={8} />
    </div>
  )
}

