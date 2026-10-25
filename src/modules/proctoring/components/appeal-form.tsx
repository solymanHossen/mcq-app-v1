"use client"

import { useActionState } from "react"
import { fileAppealAction } from "@/modules/proctoring/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

type ExistingAppeal = {
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  resolutionNote: string | null
} | null

export function AppealForm({
  attemptId,
  existingAppeal,
}: {
  attemptId: string
  existingAppeal: ExistingAppeal
}) {
  const [state, formAction, isPending] = useActionState(
    fileAppealAction.bind(null, attemptId),
    undefined
  )

  if (existingAppeal) {
    return (
      <div className="space-y-2 rounded-md border p-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Appeal status:</span>
          <Badge
            variant={
              existingAppeal.status === "ACCEPTED"
                ? "default"
                : existingAppeal.status === "REJECTED"
                  ? "destructive"
                  : "secondary"
            }
          >
            {existingAppeal.status}
          </Badge>
        </div>
        {existingAppeal.resolutionNote && (
          <p className="text-muted-foreground">{existingAppeal.resolutionNote}</p>
        )}
      </div>
    )
  }

  if (state && "success" in state) {
    return (
      <p className="text-sm text-muted-foreground">
        Your appeal has been submitted and is awaiting review.
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-2">
      <Field>
        <FieldLabel htmlFor="explanation">
          This attempt was disqualified. If you believe this was a mistake,
          explain why below.
        </FieldLabel>
        <Textarea id="explanation" name="explanation" rows={4} required />
      </Field>
      {state && "error" in state && <FieldError>{state.error}</FieldError>}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending && <Spinner data-icon="inline-start" />}
        Submit appeal
      </Button>
    </form>
  )
}
