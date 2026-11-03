import { DetailHeaderSkeleton } from "@/components/shared/skeletons"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExamPreviewLoading() {
  return (
    <div className="w-full space-y-8 pb-16 min-w-0">
      <DetailHeaderSkeleton hasChips={true} />

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {Array.from({ length: 4 }).map((_, optIndex) => (
                <div
                  key={optIndex}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20"
                >
                  <Skeleton className="size-5 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

