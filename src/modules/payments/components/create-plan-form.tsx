"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { createPlanAction } from "@/modules/payments/admin-actions"

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"

export function CreatePlanForm() {
  const [state, formAction, isPending] = useActionState(createPlanAction, undefined)

  return (
    <form action={formAction} className="space-y-3 rounded-md border p-4">
      <h2 className="font-medium">New plan</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="key">Key</FieldLabel>
          <Input id="key" name="key" placeholder="pro-monthly" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" placeholder="Pro" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="priceCents">Price (cents)</FieldLabel>
          <Input id="priceCents" name="priceCents" type="number" min={0} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="currency">Currency</FieldLabel>
          <Input id="currency" name="currency" defaultValue="usd" maxLength={3} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="billingInterval">Billing interval</FieldLabel>
          <select id="billingInterval" name="billingInterval" className={selectClassName} defaultValue="MONTH">
            <option value="MONTH">Monthly</option>
            <option value="YEAR">Yearly</option>
          </select>
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea id="description" name="description" rows={2} />
      </Field>
      <Field>
        <FieldLabel htmlFor="entitlements">Entitlements (JSON)</FieldLabel>
        <Textarea
          id="entitlements"
          name="entitlements"
          rows={3}
          defaultValue={'{\n  "maxActiveExams": 20,\n  "aiExplanationsEnabled": true\n}'}
          required
        />
      </Field>
      {state && "error" in state && <FieldError>{state.error}</FieldError>}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending && <Spinner data-icon="inline-start" />}
        Create plan
      </Button>
    </form>
  )
}
