import { PageHeaderSkeleton, CardGridSkeleton } from "@/components/shared/skeletons"

export default function StudentExamsLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      <PageHeaderSkeleton hasBackButton={false} hasActions={false} />
      <CardGridSkeleton count={6} columns={3} hasFilters={true} />
    </div>
  )
}

