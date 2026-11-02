"use client"

import { useId, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { createCheckoutSessionAction } from "@/modules/payments/actions"

export function SubscribeButton({ planKey }: { planKey: string }) {
  const couponId = useId()
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
    <FieldGroup
      className="flex-row flex-wrap items-end gap-3"
      aria-busy={isPending}
    >
      <Field className="min-w-0 flex-1 basis-48">
        <FieldLabel htmlFor={couponId} className="sr-only">
          Coupon code (optional)
        </FieldLabel>
        <Input
          id={couponId}
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Coupon code (optional)"
        />
      </Field>
      <Button
        type="button"
        size="lg"
        className="h-10 sm:h-11 w-full sm:w-auto rounded-xl font-bold shadow-2xs active:scale-95 transition-all text-xs sm:text-sm"
        onClick={subscribe}
        disabled={isPending}
      >
        {isPending && <Spinner data-icon="inline-start" />}
        Subscribe
      </Button>
    </FieldGroup>
  )
}
