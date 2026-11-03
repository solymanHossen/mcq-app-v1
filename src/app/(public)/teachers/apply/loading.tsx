import { PageHeaderSkeleton, FormSkeleton } from "@/components/shared/skeletons"

export default function TeacherApplyLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 max-w-4xl">
      <PageHeaderSkeleton hasBackButton={false} hasActions={false} />
      <FormSkeleton twoColumn={false} />
    </div>
  )
}

