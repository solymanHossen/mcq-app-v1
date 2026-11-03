import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-4">
      <div className="relative flex items-center justify-center">
        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xs">
          <Spinner className="size-6 text-primary" />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-primary/10 blur-sm animate-pulse -z-10" />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-3 w-40 rounded-md opacity-60" />
      </div>
    </div>
  )
}

