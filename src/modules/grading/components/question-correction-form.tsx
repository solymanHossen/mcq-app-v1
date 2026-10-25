"use client"

import { useActionState, useState } from "react"
import { correctExamQuestionAction } from "@/modules/grading/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LatexText } from "@/components/shared/latex-text"

type Props = {
  examId: string
  examQuestionId: string
  order: number
  questionText: string
  correctOption: "A" | "B" | "C" | "D"
  isCancelled: boolean
}

export function QuestionCorrectionForm({
  examId,
  examQuestionId,
  order,
  questionText,
  correctOption,
  isCancelled,
}: Props) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    correctExamQuestionAction.bind(null, examId, examQuestionId),
    undefined
  )

  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-muted-foreground">Q{order + 1}.</span>{" "}
          <LatexText text={questionText} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isCancelled ? (
            <Badge variant="secondary">Cancelled</Badge>
          ) : (
            <Badge variant="outline">Key: {correctOption}</Badge>
          )}
          <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Correct"}
          </Button>
        </div>
      </div>

      {open && (
        <form action={formAction} className="mt-3 space-y-2 border-t pt-3">
          <div className="flex items-end gap-2">
            <Field className="flex-1">
              <FieldLabel htmlFor={`correct-${examQuestionId}`}>
                Corrected answer
              </FieldLabel>
              <Select name="correctOption" defaultValue={correctOption}>
                <SelectTrigger id={`correct-${examQuestionId}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                name="isCancelled"
                defaultChecked={isCancelled}
              />
              Cancel this question (full credit to everyone)
            </label>
          </div>

          <Field>
            <FieldLabel htmlFor={`reason-${examQuestionId}`}>
              Reason (required, kept in the audit trail)
            </FieldLabel>
            <Textarea
              id={`reason-${examQuestionId}`}
              name="reason"
              rows={2}
              required
            />
          </Field>

          {state && "error" in state && <FieldError>{state.error}</FieldError>}
          {state && "regradedCount" in state && (
            <p className="text-xs text-muted-foreground">
              Regraded {state.regradedCount} attempt
              {state.regradedCount === 1 ? "" : "s"}.
            </p>
          )}

          <Button type="submit" size="sm" disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            Apply correction
          </Button>
        </form>
      )}
    </div>
  )
}
