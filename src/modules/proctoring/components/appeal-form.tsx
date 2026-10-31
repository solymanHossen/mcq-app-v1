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
import { cn } from "@/lib/utils"

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
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:p-5 text-xs sm:text-sm shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">Appeal status:</span>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              existingAppeal.status === "ACCEPTED"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : existingAppeal.status === "REJECTED"
                  ? "border-destructive/20 bg-destructive/10 text-destructive"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            )}
          >
            {existingAppeal.status}
          </Badge>
        </div>
        {existingAppeal.resolutionNote && (
          <p className="text-muted-foreground leading-relaxed">
            {existingAppeal.resolutionNote}
          </p>
        )}
      </div>
    )
  }

  if (state && "success" in state) {
    return (
      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
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
            className="text-sm leading-relaxed font-semibold sm:text-base text-foreground"
          >
            This attempt was disqualified. If you believe this was a mistake,
            explain why below.
          </FieldLabel>
          <Textarea
            id="explanation"
            name="explanation"
            rows={4}
            required
            className="rounded-xl border-border/70 bg-background/50 focus-visible:ring-primary/20 text-xs sm:text-sm"
            placeholder="Provide context or explanation..."
          />
        </Field>
        {state && "error" in state && <FieldError>{state.error}</FieldError>}
        <Button
          type="submit"
          size="lg"
          className="h-10 sm:h-11 w-full sm:w-auto rounded-xl font-bold shadow-2xs active:scale-95 transition-all text-xs sm:text-sm"
          disabled={isPending}
        >
          {isPending && <Spinner data-icon="inline-start" />}
          Submit appeal
        </Button>
      </FieldGroup>
    </form>
  )
}
