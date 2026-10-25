"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { issueRefundAction } from "@/modules/payments/admin-actions"

export function RefundForm({ transactionId }: { transactionId: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    issueRefundAction.bind(null, transactionId),
    undefined
  )

  if (!open) {
    return (
      <Button type="button" size="sm" variant="destructive" onClick={() => setOpen(true)}>
        Refund
      </Button>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 text-left">
      <Field>
        <Input name="amountCents" type="number" min={1} placeholder="Amount in cents (full if blank)" />
      </Field>
      <Field>
        <Textarea name="reason" rows={2} placeholder="Reason for refund (required)" required />
      </Field>
      {state && "error" in state && <FieldError>{state.error}</FieldError>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          Confirm refund
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
