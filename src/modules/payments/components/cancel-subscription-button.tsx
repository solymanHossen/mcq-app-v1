"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cancelSubscriptionAction } from "@/modules/payments/actions"

export function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
  const [isPending, startTransition] = useTransition()

  function cancel() {
    startTransition(async () => {
      const result = await cancelSubscriptionAction(subscriptionId)
      if (result && "error" in result) toast.error(result.error)
      else toast.success("Cancellation scheduled for the end of your current period")
    })
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={cancel} disabled={isPending}>
      {isPending && <Spinner data-icon="inline-start" />}
      Cancel at period end
    </Button>
  )
}
