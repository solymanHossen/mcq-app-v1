"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Check, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ThemeOption {
  value: "light" | "dark" | "system"
  label: string
  subtitle: string
  icon: typeof Sun
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Light Mode",
    subtitle: "Clean, high-clarity daylight theme",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark Mode",
    subtitle: "Low eye-strain dark theme",
    icon: Moon,
  },
  {
    value: "system",
    label: "System Sync",
    subtitle: "Matches your operating system settings",
    icon: Monitor,
  },
]

export function AppearanceCard({ className }: { className?: string } = {}) {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden",
        className
      )}
    >
      {/* Master Reference Card Header */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
            <Palette className="size-4.5 sm:size-5.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
              Theme &amp; Appearance
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
              Customize interface color theme and display modes
            </p>
          </div>
        </div>

        {mounted && (
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold capitalize self-start sm:self-auto border border-border/60"
          >
            {theme ?? "system"} active
          </Badge>
        )}
      </div>

      <div className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
        {mounted ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {THEME_OPTIONS.map(({ value, label, subtitle, icon: Icon }) => {
              const active = theme === value

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={cn(
                    "group flex cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 sm:p-5",
                    active
                      ? "border-primary/50 bg-primary/10 text-primary shadow-xs ring-2 ring-primary/20"
                      : "border-border/70 bg-muted/15 text-foreground hover:bg-muted/30 hover:border-border"
                  )}
                  aria-pressed={active}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={cn(
                        "flex size-10 sm:size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shadow-2xs",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground group-hover:text-foreground ring-1 ring-border/50"
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-heading text-sm font-bold text-foreground sm:text-base">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full transition-all ml-2 shrink-0",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "border border-muted-foreground/30"
                    )}
                  >
                    {active && <Check className="size-3 stroke-[3]" />}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="h-24 w-full animate-pulse rounded-xl bg-muted/30" />
        )}

        {/* Informational Footer Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/15 p-3.5 sm:p-4 text-xs sm:text-sm text-muted-foreground">
          <span>Preferences are automatically stored and synchronized across all sessions on this device.</span>
          <div className="inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
            <span>Quick shortcut:</span>
            <kbd className="rounded-md border border-border/60 bg-muted px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
              D
            </kbd>
            <span>key</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
