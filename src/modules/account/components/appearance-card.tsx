"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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
    subtitle: "Bright clarity interface",
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
    subtitle: "Sync with OS preferences",
    icon: Monitor,
  },
]

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <div className="rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all sm:p-8 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <div className="pb-6">
        <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
          Theme & Appearance
        </h3>
      </div>

      <div className="space-y-6">
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
                    "group flex items-center justify-between rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer sm:p-5",
                    active
                      ? "bg-primary/10 text-primary ring-2 ring-primary/30 shadow-xs"
                      : "bg-muted/30 text-foreground hover:bg-muted/60"
                  )}
                  aria-pressed={active}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                        active
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-background/80 text-foreground"
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-heading text-sm font-bold text-foreground sm:text-base">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full transition-all",
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
          <div className="h-20 w-full animate-pulse rounded-2xl bg-muted/30" />
        )}

        {/* Minimal 1-Line Shortcut */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <span>Quick theme toggle</span>
          <div className="inline-flex items-center gap-1.5">
            <kbd className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
              D
            </kbd>
            <span>on keyboard</span>
          </div>
        </div>
      </div>
    </div>
  )
}
