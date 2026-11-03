import { PageHeaderSkeleton } from "@/components/shared/skeletons"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MistakesLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      <PageHeaderSkeleton hasBackButton={false} hasActions={true} hasBadge={true} />

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="size-8 rounded-lg" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-4/5 rounded-md" />
            </div>

            <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 space-y-1.5">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-48 rounded-md" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

