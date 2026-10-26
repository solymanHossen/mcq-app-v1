"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  // next-themes can't know the persisted theme until after hydration —
  // rendering the real control before then would flash the wrong selection
  // (or mismatch the server-rendered markup). useSyncExternalStore flips
  // this to true right after hydration without a setState-in-effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose how ExamHub looks on this device. Tip: press <kbd className="rounded border px-1 py-0.5 text-xs">D</kbd> anywhere to toggle light/dark.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mounted ? (
          <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
            {OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  theme === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        ) : (
          <Skeleton className="h-9 w-56" />
        )}
      </CardContent>
    </Card>
  )
}
