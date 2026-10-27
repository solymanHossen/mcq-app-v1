"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"

export function SettingToggle({
  title,
  description,
  enabled,
  action,
}: {
  title: string
  description: string
  enabled: boolean
  action: (enabled: boolean) => Promise<{ success: true } | { error: string }>
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(next: boolean) {
    startTransition(async () => {
      const result = await action(next)
      if ("error" in result) toast.error(result.error)
      else toast.success("Setting updated")
    })
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all hover:shadow-lg">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-heading text-base font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-2 pt-0.5 shrink-0">
          {isPending && <Spinner className="size-4 text-muted-foreground" />}
          <Switch checked={enabled} onCheckedChange={handleChange} disabled={isPending} />
        </div>
      </div>
    </div>
  )
}
