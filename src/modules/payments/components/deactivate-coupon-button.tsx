"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { deactivateCouponAction } from "@/modules/payments/admin-actions"

export function DeactivateCouponButton({ couponId, couponCode }: { couponId: string; couponCode?: string }) {
  const [isPending, startTransition] = useTransition()

  function deactivate() {
    startTransition(async () => {
      const result = await deactivateCouponAction(couponId)
      if (result && "error" in result) {
        toast.error(result.error)
      } else {
        toast.success(couponCode ? `Coupon "${couponCode}" deactivated` : "Coupon deactivated")
      }
    })
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={deactivate}
      disabled={isPending}
      className="h-8 rounded-lg px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 shadow-2xs gap-1.5 cursor-pointer transition-all active:scale-95"
    >
      {isPending ? <Spinner className="size-3.5" /> : <Ban className="size-3.5 shrink-0" />}
      <span>Deactivate</span>
    </Button>
  )
}
