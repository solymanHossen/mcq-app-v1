"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cancelSubscriptionAction } from "@/modules/payments/actions"

export function CancelSubscriptionButton({
  subscriptionId,
}: {
  subscriptionId: string
}) {
  const [isPending, startTransition] = useTransition()

  function cancel() {
    startTransition(async () => {
      const result = await cancelSubscriptionAction(subscriptionId)
      if (result && "error" in result) toast.error(result.error)
      else
        toast.success(
          "Cancellation scheduled for the end of your current period"
        )
    })
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="h-9 sm:h-10 w-full sm:w-auto rounded-xl font-semibold border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-2xs active:scale-95 transition-all text-xs sm:text-sm"
      onClick={cancel}
      disabled={isPending}
    >
      {isPending && <Spinner data-icon="inline-start" />}
      Cancel at period end
    </Button>
  )
}
