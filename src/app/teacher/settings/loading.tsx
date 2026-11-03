import { PageHeaderSkeleton, FormSkeleton } from "@/components/shared/skeletons"

export default function TeacherSettingsLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      <PageHeaderSkeleton hasBackButton={false} hasActions={false} />
      <FormSkeleton twoColumn={false} />
    </div>
  )
}

