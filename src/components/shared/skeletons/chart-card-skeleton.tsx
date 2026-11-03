import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ChartCardSkeletonProps {
  type?: "area" | "bar" | "donut"
  hasToggles?: boolean
  className?: string
  height?: string
}

export function ChartCardSkeleton({
  type = "area",
  hasToggles = true,
  className,
  height = "h-[280px] sm:h-[320px]",
}: ChartCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden",
        className
      )}
    >
      <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-5 w-36 sm:w-48 rounded-md" />
          <Skeleton className="h-3.5 w-48 sm:w-64 rounded-md" />
        </div>

        {hasToggles && (
          <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex flex-col justify-end">
        {type === "donut" ? (
          <div className={cn("w-full flex items-center justify-center", height)}>
            <div className="relative flex items-center justify-center">
              <Skeleton className="size-48 sm:size-56 rounded-full" />
              <div className="absolute size-24 sm:size-28 rounded-full bg-card" />
            </div>
          </div>
        ) : (
          <div className={cn("w-full flex items-end gap-2 sm:gap-3 pt-6 pb-2", height)}>
            {Array.from({ length: 12 }).map((_, i) => {
              // Simulated varied chart column heights
              const heights = [
                "h-[35%]",
                "h-[50%]",
                "h-[75%]",
                "h-[40%]",
                "h-[65%]",
                "h-[85%]",
                "h-[55%]",
                "h-[90%]",
                "h-[60%]",
                "h-[45%]",
                "h-[70%]",
                "h-[80%]",
              ]
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <Skeleton className={cn("w-full rounded-t-md", heights[i % heights.length])} />
                  <Skeleton className="h-2.5 w-6 rounded-xs" />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

