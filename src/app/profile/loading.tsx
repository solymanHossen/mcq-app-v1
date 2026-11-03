import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FormSkeleton } from "@/components/shared/skeletons"

export default function ProfileLoading() {
  return (
    <div className="w-full min-w-0 space-y-6 pb-12 sm:space-y-8 sm:pb-16">
      {/* Hero Banner Skeleton */}
      <Card className="rounded-2xl border border-solid border-border/70 p-4 shadow-xs sm:p-6 lg:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <Skeleton className="size-20 sm:size-24 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-7 sm:h-8 w-44 sm:w-60 rounded-md" />
              <Skeleton className="h-4 w-52 sm:w-72 rounded-md" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </Card>

      {/* Tabs Bar Skeleton */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Form Content Skeleton */}
      <FormSkeleton twoColumn={false} />
    </div>
  )
}

