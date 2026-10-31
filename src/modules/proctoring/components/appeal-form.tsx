"use client"

import { useActionState } from "react"
import { fileAppealAction } from "@/modules/proctoring/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
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
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 text-xs sm:p-4 sm:text-sm">
        <div className="flex flex-wrap items-center gap-2">
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
          <p className="text-muted-foreground">
            {existingAppeal.resolutionNote}
          </p>
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
    <form action={formAction} aria-busy={isPending}>
      <FieldGroup className="gap-5 sm:gap-6">
        <Field>
          <FieldLabel
            htmlFor="explanation"
            className="text-sm leading-relaxed font-semibold sm:text-base"
          >
            This attempt was disqualified. If you believe this was a mistake,
            explain why below.
          </FieldLabel>
          <Textarea id="explanation" name="explanation" rows={4} required />
        </Field>
        {state && "error" in state && <FieldError>{state.error}</FieldError>}
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl font-bold shadow-md sm:h-13 sm:text-lg"
          disabled={isPending}
        >
          {isPending && <Spinner data-icon="inline-start" />}
          Submit appeal
        </Button>
      </FieldGroup>
    </form>
  )
}
