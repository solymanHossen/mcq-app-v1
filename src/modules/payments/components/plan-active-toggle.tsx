"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Power, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { setPlanActiveAction } from "@/modules/payments/admin-actions"
import { cn } from "@/lib/utils"

export function PlanActiveToggle({
  planId,
  isActive,
}: {
  planId: string
  isActive: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const result = await setPlanActiveAction(planId, !isActive)
      if (result && "error" in result) {
        toast.error(result.error)
      } else {
        toast.success(isActive ? "Plan tier deactivated" : "Plan tier activated")
      }
    })
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "h-8 rounded-xl border px-3 text-xs font-semibold shadow-2xs transition-all gap-1.5 cursor-pointer",
        isActive
          ? "border-border/70 bg-card text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
          : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-500/50"
      )}
    >
      {isPending ? (
        <Spinner data-icon="inline-start" />
      ) : isActive ? (
        <PowerOff className="size-3" />
      ) : (
        <Power className="size-3" />
      )}
      <span>{isActive ? "Deactivate" : "Activate"}</span>
    </Button>
  )
}
