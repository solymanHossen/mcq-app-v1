"use client"

import { useActionState } from "react"
import {
  createQuestionReportAction,
  resolveQuestionReportAction,
} from "@/modules/question-bank/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

type Report = {
  id: string
  reason: string
  status: "OPEN" | "RESOLVED" | "DISMISSED"
  resolutionNote: string | null
  createdAt: Date
}

export function QuestionReports({
  questionId,
  reports,
}: {
  questionId: string
  reports: Report[]
}) {
  const [state, formAction, isPending] = useActionState(
    createQuestionReportAction.bind(null, questionId),
    undefined
  )

  return (
    <div className="space-y-4">
      <h2 className="font-medium">Reports & corrections</h2>

      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reports filed.</p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li key={report.id} className="rounded-md border p-3 text-sm">
              <div className="mb-1 flex items-center gap-2">
                <Badge
                  variant={report.status === "OPEN" ? "destructive" : "secondary"}
                >
                  {report.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {report.createdAt.toLocaleDateString()}
                </span>
              </div>
              <p>{report.reason}</p>
              {report.resolutionNote && (
                <p className="mt-1 text-muted-foreground">
                  Resolution: {report.resolutionNote}
                </p>
              )}
              {report.status === "OPEN" && (
                <ResolveReportForm reportId={report.id} />
              )}
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="space-y-2">
        <Field>
          <FieldLabel htmlFor="reason">Flag this question for review</FieldLabel>
          <Textarea
            id="reason"
            name="reason"
            rows={2}
            placeholder="What's wrong with this question?"
            required
          />
        </Field>
        {state && "error" in state && <FieldError>{state.error}</FieldError>}
        <Button type="submit" size="sm" variant="outline" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          File report
        </Button>
      </form>
    </div>
  )
}

function ResolveReportForm({ reportId }: { reportId: string }) {
  const [state, formAction, isPending] = useActionState(
    resolveQuestionReportAction.bind(null, reportId),
    undefined
  )

  return (
    <form action={formAction} className="mt-2 space-y-2 border-t pt-2">
      <Textarea
        name="resolutionNote"
        rows={2}
        placeholder="Resolution note (optional)"
      />
      {state && "error" in state && <FieldError>{state.error}</FieldError>}
      <div className="flex gap-2">
        <Button
          type="submit"
          name="status"
          value="RESOLVED"
          size="sm"
          disabled={isPending}
        >
          {isPending && <Spinner data-icon="inline-start" />}
          Mark corrected
        </Button>
        <Button
          type="submit"
          name="status"
          value="DISMISSED"
          size="sm"
          variant="ghost"
          disabled={isPending}
        >
          Dismiss
        </Button>
      </div>
    </form>
  )
}
