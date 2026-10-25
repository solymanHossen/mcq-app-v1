"use client"

import { useActionState, useState } from "react"
import { disqualifyAttemptAction } from "@/modules/grading/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

export function DisqualifyButton({ attemptId }: { attemptId: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    disqualifyAttemptAction.bind(null, attemptId),
    undefined
  )

  if (!open) {
    return (
      <Button size="sm" variant="destructive" onClick={() => setOpen(true)}>
        Disqualify
      </Button>
    )
  }

  return (
    <form action={formAction} className="space-y-2">
      <Textarea name="reason" placeholder="Reason (required)" rows={2} required />
      {state && "error" in state && <FieldError>{state.error}</FieldError>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          Confirm
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
