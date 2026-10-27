"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  Command,
  Sparkles,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/lib/config"

interface ThemeOption {
  value: "light" | "dark" | "system"
  label: string
  description: string
  icon: typeof Sun
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Light Mode",
    description:
      "Pristine, high-clarity daylight aesthetic with crisp contrast.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark Mode",
    description: "Deep, sleek radiant palette engineered for low eye-strain.",
    icon: Moon,
  },
  {
    value: "system",
    label: "System Sync",
    description:
      "Automatically synchronizes with your device operating system.",
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
    <Card className="rounded-[24px] border border-border/80 shadow-xs transition-all duration-300 hover:shadow-md">
      <CardHeader className="space-y-1.5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-lg font-bold text-foreground sm:text-xl">
              Interface Appearance & Theme
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground sm:text-[13px]">
              Customize the visual palette and lighting theme of {APP_NAME} on
              this device.
            </CardDescription>
          </div>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-4.5" />
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {mounted ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
              const active = theme === value

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-300",
                    active
                      ? "border-primary bg-primary/[0.04] shadow-sm ring-2 ring-primary/25"
                      : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs"
                  )}
                  aria-pressed={active}
                >
                  {/* Visual Theme Mockup */}
                  <div
                    className={cn(
                      "mb-4 flex h-20 w-full flex-col justify-between overflow-hidden rounded-xl border p-2.5 transition-all",
                      value === "light" &&
                        "border-slate-200 bg-white text-slate-900",
                      value === "dark" &&
                        "border-slate-800 bg-slate-950 text-slate-100",
                      value === "system" &&
                        "border-border bg-gradient-to-r from-white to-slate-950 p-0"
                    )}
                  >
                    {value === "system" ? (
                      <div className="grid size-full grid-cols-2">
                        <div className="flex flex-col justify-between bg-white p-2 text-slate-900">
                          <div className="h-1.5 w-6 rounded bg-slate-200" />
                          <div className="space-y-1">
                            <div className="h-2 w-10 rounded bg-blue-500/80" />
                            <div className="h-1.5 w-8 rounded bg-slate-200" />
                          </div>
                        </div>
                        <div className="flex flex-col justify-between bg-slate-950 p-2 text-slate-100">
                          <div className="h-1.5 w-6 rounded bg-slate-800" />
                          <div className="space-y-1">
                            <div className="h-2 w-10 rounded bg-blue-400" />
                            <div className="h-1.5 w-8 rounded bg-slate-800" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div
                            className={cn(
                              "h-2 w-12 rounded-sm",
                              value === "light"
                                ? "bg-slate-200"
                                : "bg-slate-800"
                            )}
                          />
                          <div
                            className={cn(
                              "size-2 rounded-full",
                              value === "light" ? "bg-primary/80" : "bg-primary"
                            )}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div
                            className={cn(
                              "h-2.5 w-16 rounded",
                              value === "light"
                                ? "bg-slate-800"
                                : "bg-slate-200"
                            )}
                          />
                          <div
                            className={cn(
                              "h-1.5 w-full rounded",
                              value === "light"
                                ? "bg-slate-100"
                                : "bg-slate-900"
                            )}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Header & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                      <Icon className="size-4 text-primary" />
                      <span>{label}</span>
                    </span>
                    {active && <CheckCircle2 className="size-4 text-primary" />}
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        )}

        {/* Global Keyboard Shortcut Pill */}
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground shadow-2xs">
              <Command className="size-4 text-muted-foreground" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground sm:text-sm">
                Rapid Keyboard Shortcut
              </p>
              <p className="text-xs text-muted-foreground">
                Toggle between Light and Dark themes anytime without opening
                menus.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto">
            <kbd className="rounded-lg border border-border/80 bg-card px-2.5 py-1 font-mono text-xs font-bold text-foreground shadow-2xs">
              D
            </kbd>
            <span className="text-xs text-muted-foreground">on keyboard</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
