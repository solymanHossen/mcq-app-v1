import { PageHeaderSkeleton, CardGridSkeleton } from "@/components/shared/skeletons"

export default function PublicTeachersLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <PageHeaderSkeleton hasBackButton={false} hasActions={false} />
      <CardGridSkeleton count={6} columns={3} hasFilters={true} />
    </div>
  )
}

