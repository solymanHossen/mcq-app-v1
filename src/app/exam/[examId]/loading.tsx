import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExamLandingLoading() {
  return (
    <div className="min-h-screen bg-muted/20 py-8 sm:py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Top Branding / Breadcrumb */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="size-9 rounded-xl" />
        </div>

        {/* Main Entry Card */}
        <Card className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-7 sm:h-9 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-border/50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 space-y-1.5 text-center">
                <Skeleton className="h-3 w-16 mx-auto rounded-md" />
                <Skeleton className="h-5 w-12 mx-auto rounded-md" />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-5/6 rounded-md" />
              <Skeleton className="h-3.5 w-4/6 rounded-md" />
            </div>
          </div>

          <div className="pt-2">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </Card>
      </div>
    </div>
  )
}

