import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared/skeletons"

export default function AdminCouponsLoading() {
  return (
    <div className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      <PageHeaderSkeleton hasBackButton={false} hasActions={true} />
      <TableSkeleton hasFilters={false} hasSearch={true} columnCount={6} rowCount={5} />
    </div>
  )
}

