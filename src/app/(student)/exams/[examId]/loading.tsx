import { DetailHeaderSkeleton } from "@/components/shared/skeletons"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function StudentExamDetailLoading() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0 max-w-4xl mx-auto">
      <DetailHeaderSkeleton hasChips={true} />

      <Card className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Skeleton className="h-4 w-48 rounded-md" />
          <Skeleton className="h-11 sm:h-12 w-full sm:w-48 rounded-xl" />
        </div>
      </Card>
    </div>
  )
}

