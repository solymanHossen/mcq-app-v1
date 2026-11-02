"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn(
          "size-8.5 sm:size-9 rounded-xl bg-muted/40 animate-pulse border border-border/60",
          className
        )}
      />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group relative flex size-8.5 sm:size-9 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground shadow-2xs transition-all duration-150 hover:bg-muted/70 hover:text-foreground cursor-pointer",
        className
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="size-4 text-amber-400 transition-transform duration-200 group-hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-indigo-500 transition-transform duration-200 group-hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
