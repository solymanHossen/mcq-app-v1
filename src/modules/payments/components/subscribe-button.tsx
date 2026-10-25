"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { createCheckoutSessionAction } from "@/modules/payments/actions"

export function SubscribeButton({ planKey }: { planKey: string }) {
  const [couponCode, setCouponCode] = useState("")
  const [isPending, startTransition] = useTransition()

  function subscribe() {
    startTransition(async () => {
      const result = await createCheckoutSessionAction({
        planKey,
        couponCode: couponCode.trim() || undefined,
      })
      if (result && "error" in result) {
        toast.error(result.error)
        return
      }
      if (result && "url" in result) {
        window.location.href = result.url
      }
    })
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        placeholder="Coupon code (optional)"
        className="sm:w-40"
      />
      <Button type="button" size="sm" onClick={subscribe} disabled={isPending}>
        {isPending && <Spinner data-icon="inline-start" />}
        Subscribe
      </Button>
    </div>
  )
}
