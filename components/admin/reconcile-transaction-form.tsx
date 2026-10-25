"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { reconcileTransactionAction } from "@/actions/admin-billing.actions"

export function ReconcileTransactionForm({ transactionId }: { transactionId: string }) {
  const [resolution, setResolution] = useState<"SUCCEEDED" | "FAILED" | null>(null)
  const [state, formAction, isPending] = useActionState(
    reconcileTransactionAction.bind(null, transactionId),
    undefined
  )

  if (!resolution) {
    return (
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => setResolution("SUCCEEDED")}>
          Mark succeeded
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={() => setResolution("FAILED")}>
          Mark failed
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 text-left">
      <input type="hidden" name="resolution" value={resolution} />
      <Field>
        <Textarea
          name="reason"
          rows={2}
          placeholder="How was this confirmed? (e.g. checked the provider dashboard)"
          required
        />
      </Field>
      {state && "error" in state && <FieldError>{state.error}</FieldError>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          Confirm
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setResolution(null)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
