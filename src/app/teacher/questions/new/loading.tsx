import { PageHeaderSkeleton, FormSkeleton } from "@/components/shared/skeletons"

export default function NewQuestionLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      <PageHeaderSkeleton hasBackButton={true} hasActions={false} />
      <FormSkeleton twoColumn={false} />
    </div>
  )
}

