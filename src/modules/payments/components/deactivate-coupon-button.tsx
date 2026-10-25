"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { deactivateCouponAction } from "@/modules/payments/admin-actions"

export function DeactivateCouponButton({ couponId }: { couponId: string }) {
  const [isPending, startTransition] = useTransition()

  function deactivate() {
    startTransition(async () => {
      const result = await deactivateCouponAction(couponId)
      if (result && "error" in result) toast.error(result.error)
    })
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={deactivate} disabled={isPending}>
      {isPending && <Spinner data-icon="inline-start" />}
      Deactivate
    </Button>
  )
}
