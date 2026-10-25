"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { createCouponAction } from "@/actions/admin-billing.actions"

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"

export function CreateCouponForm() {
  const [state, formAction, isPending] = useActionState(createCouponAction, undefined)

  return (
    <form action={formAction} className="space-y-3 rounded-md border p-4">
      <h2 className="font-medium">New coupon</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="code">Code</FieldLabel>
          <Input id="code" name="code" placeholder="WELCOME20" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="discountType">Discount type</FieldLabel>
          <select id="discountType" name="discountType" className={selectClassName} defaultValue="PERCENT">
            <option value="PERCENT">Percent off</option>
            <option value="FIXED_AMOUNT">Fixed amount off (cents)</option>
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="discountValue">Discount value</FieldLabel>
          <Input id="discountValue" name="discountValue" type="number" min={0} step="any" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="maxRedemptions">Max redemptions (optional)</FieldLabel>
          <Input id="maxRedemptions" name="maxRedemptions" type="number" min={1} />
        </Field>
        <Field>
          <FieldLabel htmlFor="expiresAt">Expires at (optional)</FieldLabel>
          <Input id="expiresAt" name="expiresAt" type="date" />
        </Field>
      </div>
      {state && "error" in state && <FieldError>{state.error}</FieldError>}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending && <Spinner data-icon="inline-start" />}
        Create coupon
      </Button>
    </form>
  )
}
