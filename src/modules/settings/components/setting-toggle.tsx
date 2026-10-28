"use client"

import * as React from "react"
import { useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowUpRight } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export interface SettingToggleProps {
  id?: string
  title: string
  description: string
  enabled: boolean
  action: (enabled: boolean) => Promise<{ success: true } | { error: string }>
  icon?: React.ReactNode
  iconColor?: "blue" | "purple" | "emerald" | "amber"
  extraLink?: {
    label: string
    href: string
  }
}

const iconVariants = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20",
}

export function SettingToggle({
  id,
  title,
  description,
  enabled,
  action,
  icon,
  iconColor = "blue",
  extraLink,
}: SettingToggleProps) {
  const [isPending, startTransition] = useTransition()
  const iconClass = iconVariants[iconColor] ?? iconVariants.blue

  function handleChange(next: boolean) {
    startTransition(async () => {
      const result = await action(next)
      if ("error" in result) {
        toast.error(result.error)
      } else {
        toast.success(`${title} ${next ? "enabled" : "disabled"}`)
      }
    })
  }

  return (
    <div
      id={id}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 sm:p-6 transition-colors duration-150 hover:bg-muted/30 w-full",
        isPending && "opacity-70 pointer-events-none"
      )}
    >
      <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
        {icon && (
          <div
            className={cn(
              "size-12 sm:size-13 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200",
              iconClass
            )}
          >
            {icon}
          </div>
        )}

        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground tracking-tight">
            {title}
          </h3>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
            {extraLink && (
              <>
                {" · "}
                <Link
                  href={extraLink.href}
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>{extraLink.label}</span>
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 sm:pl-4">
        {isPending && <Spinner className="size-4 text-muted-foreground" />}
        <Switch
          checked={enabled}
          onCheckedChange={handleChange}
          disabled={isPending}
          aria-label={title}
          className="data-[state=checked]:bg-primary scale-110 sm:scale-115 origin-right"
        />
      </div>
    </div>
  )
}



