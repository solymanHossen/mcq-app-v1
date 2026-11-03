"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isReloading, setIsReloading] = useState(false)

  useEffect(() => {
    // Log runtime crash details
    console.error("Runtime crash captured by error boundary:", error)
  }, [error])

  function handleReload() {
    setIsReloading(true)
    // 1. Attempt Next.js client error boundary reset & router refresh
    try {
      startTransition(() => {
        router.refresh()
        reset()
      })
    } catch {
      // Handled by window.location.reload()
    }

    // 2. Perform a hard browser reload to ensure fresh chunks, clear broken state, and re-fetch server components
    window.location.reload()
  }

  return (
    <div className="relative min-h-svh w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      {/* Ambient background bloom matching platform visual standard */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 right-8 size-80 rounded-full bg-destructive/[0.04] blur-3xl dark:bg-destructive/[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 -left-12 size-72 rounded-full bg-primary/[0.03] blur-3xl dark:bg-primary/[0.05]"
      />

      <Card className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-lg overflow-hidden">
        {/* Card Header with Alert Icon and Status */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-border/50 bg-muted/20 backdrop-blur-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-destructive/20">
              <AlertTriangle className="size-5 sm:size-6" />
            </div>
            <div>
              <h1 className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                Application Error
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                An unexpected runtime interruption occurred
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold border-destructive/30 text-destructive bg-destructive/5 shrink-0 hidden sm:inline-flex"
          >
            Crash Detected
          </Badge>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2 text-left">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We encountered an unexpected error while loading this page. This could be due to a temporary network issue, an updated application version, or an unhandled server response.
            </p>
            {error?.digest && (
              <div className="pt-1">
                <span className="text-[11px] font-mono text-muted-foreground/80 bg-muted/50 border border-border/60 px-2.5 py-1 rounded-lg inline-block">
                  Error Code: <span className="font-semibold text-foreground">{error.digest}</span>
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Button
              type="button"
              size="lg"
              onClick={handleReload}
              disabled={isPending || isReloading}
              className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl sm:rounded-2xl font-bold shadow-xs hover:shadow-sm active:scale-95 transition-all text-xs sm:text-sm cursor-pointer gap-2 group flex-1"
            >
              <RotateCcw
                className={`size-4 transition-transform ${isPending || isReloading ? "animate-spin" : "group-hover:-rotate-45"}`}
              />
              <span>{isPending || isReloading ? "Reloading Page..." : "Reload Page"}</span>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl sm:rounded-2xl font-semibold border-border/70 hover:bg-muted text-xs sm:text-sm active:scale-95 transition-all cursor-pointer gap-2 flex-1 sm:flex-initial"
            >
              <Link href="/dashboard">
                <Home className="size-4 text-muted-foreground" />
                <span>Go to Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
