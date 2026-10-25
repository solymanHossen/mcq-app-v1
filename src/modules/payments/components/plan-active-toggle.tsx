"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { setPlanActiveAction } from "@/modules/payments/admin-actions"

export function PlanActiveToggle({ planId, isActive }: { planId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const result = await setPlanActiveAction(planId, !isActive)
      if (result && "error" in result) toast.error(result.error)
    })
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={toggle} disabled={isPending}>
      {isPending && <Spinner data-icon="inline-start" />}
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  )
}
