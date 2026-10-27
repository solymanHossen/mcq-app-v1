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
          "size-10 rounded-2xl bg-muted/40 animate-pulse",
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
        "group relative flex size-10 items-center justify-center rounded-2xl border-none bg-muted/40 text-muted-foreground shadow-2xs transition-all duration-200 hover:bg-muted/80 hover:text-foreground hover:scale-105 active:scale-95 cursor-pointer",
        className
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="size-4.5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="size-4.5 text-indigo-500 transition-transform duration-300 group-hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
