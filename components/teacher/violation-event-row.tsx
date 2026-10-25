"use client"

import { useActionState, useState } from "react"
import { reviewViolationEventAction } from "@/actions/anti-cheat.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

type ViolationEvent = {
  id: string
  type: string
  source: "CLIENT_REPORTED" | "SERVER_DETECTED"
  severity: "LOW" | "MEDIUM" | "HIGH"
  occurredAt: Date
  reviewStatus: "OPEN" | "REVIEWED_NO_ACTION" | "REVIEWED_WARNING_ISSUED" | "REVIEWED_DISQUALIFIED"
  reviewNote: string | null
}

export function ViolationEventRow({ event }: { event: ViolationEvent }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    reviewViolationEventAction.bind(null, event.id),
    undefined
  )

  return (
    <li className="space-y-2 rounded-md border p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{event.type.replaceAll("_", " ")}</span>
        <Badge variant={event.severity === "HIGH" ? "destructive" : "outline"}>
          {event.severity}
        </Badge>
        <Badge variant="secondary">
          {event.source === "SERVER_DETECTED" ? "Server-detected" : "Self-reported"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {event.occurredAt.toLocaleString()}
        </span>
        {event.reviewStatus !== "OPEN" && (
          <Badge variant="outline">{event.reviewStatus.replace("REVIEWED_", "")}</Badge>
        )}
      </div>

      {event.reviewStatus === "OPEN" &&
        (open ? (
          <form action={formAction} className="space-y-2 border-t pt-2">
            <Textarea name="reviewNote" placeholder="Note (optional)" rows={2} />
            <div className="flex gap-2">
              <Button
                type="submit"
                name="status"
                value="REVIEWED_WARNING_ISSUED"
                size="sm"
                disabled={isPending}
              >
                {isPending && <Spinner data-icon="inline-start" />}
                Issue warning
              </Button>
              <Button
                type="submit"
                name="status"
                value="REVIEWED_NO_ACTION"
                size="sm"
                variant="outline"
                disabled={isPending}
              >
                No action
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
            {state && "error" in state && (
              <p className="text-xs text-destructive">{state.error}</p>
            )}
          </form>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            Review
          </Button>
        ))}
      {event.reviewNote && (
        <p className="text-xs text-muted-foreground">Note: {event.reviewNote}</p>
      )}
    </li>
  )
}
