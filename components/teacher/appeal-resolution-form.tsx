"use client"

import { useActionState } from "react"
import { resolveAppealAction } from "@/actions/anti-cheat.actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

type Appeal = {
  id: string
  explanation: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  resolutionNote: string | null
  createdAt: Date
}

export function AppealResolutionForm({ appeal }: { appeal: Appeal }) {
  const [state, formAction, isPending] = useActionState(
    resolveAppealAction.bind(null, appeal.id),
    undefined
  )

  return (
    <div className="space-y-2 rounded-md border p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium">Appeal</span>
        <Badge
          variant={
            appeal.status === "ACCEPTED"
              ? "default"
              : appeal.status === "REJECTED"
                ? "destructive"
                : "secondary"
          }
        >
          {appeal.status}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {appeal.createdAt.toLocaleString()}
        </span>
      </div>
      <p>{appeal.explanation}</p>

      {appeal.status === "PENDING" ? (
        <form action={formAction} className="space-y-2 border-t pt-2">
          <Textarea
            name="resolutionNote"
            placeholder="Explain the decision (required)"
            rows={2}
            required
          />
          {state && "error" in state && <FieldError>{state.error}</FieldError>}
          <div className="flex gap-2">
            <Button
              type="submit"
              name="decision"
              value="ACCEPTED"
              size="sm"
              disabled={isPending}
            >
              {isPending && <Spinner data-icon="inline-start" />}
              Accept (reinstate attempt)
            </Button>
            <Button
              type="submit"
              name="decision"
              value="REJECTED"
              size="sm"
              variant="outline"
              disabled={isPending}
            >
              Reject
            </Button>
          </div>
        </form>
      ) : (
        appeal.resolutionNote && (
          <p className="text-muted-foreground">{appeal.resolutionNote}</p>
        )
      )}
    </div>
  )
}
