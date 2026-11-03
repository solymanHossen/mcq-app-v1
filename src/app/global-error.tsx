"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [isReloading, setIsReloading] = useState(false)

  useEffect(() => {
    console.error("Global crash captured by global-error boundary:", error)
  }, [error])

  function handleReload() {
    setIsReloading(true)
    try {
      reset()
    } catch {
      // Ignored
    }
    window.location.reload()
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center shadow-lg space-y-5">
          <div className="size-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto ring-1 ring-red-500/20">
            <AlertTriangle className="size-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Critical Application Error
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              A critical error occurred while loading the application. Performing a full reload will refresh application assets and recover your session.
            </p>
            {error?.digest && (
              <p className="text-[11px] font-mono text-slate-400 pt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReload}
              disabled={isReloading}
              className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all w-full sm:w-auto"
            >
              <RotateCcw className={`size-4 ${isReloading ? "animate-spin" : ""}`} />
              <span>{isReloading ? "Reloading..." : "Reload Application"}</span>
            </button>
            <Link
              href="/"
              className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all w-full sm:w-auto"
            >
              <Home className="size-4" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
