import { DetailHeaderSkeleton, TableSkeleton } from "@/components/shared/skeletons"

export default function AddQuestionsLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-16 min-w-0">
      <DetailHeaderSkeleton hasChips={false} />
      <TableSkeleton hasFilters={true} hasSearch={true} columnCount={5} rowCount={6} />
    </div>
  )
}

