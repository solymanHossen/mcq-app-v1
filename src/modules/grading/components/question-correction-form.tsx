"use client"

import { useActionState, useState } from "react"
import { correctExamQuestionAction } from "@/modules/grading/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { LatexText } from "@/components/shared/latex-text"
import { Checkbox } from "@/components/ui/checkbox"
import { Wrench } from "lucide-react"

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
  const [cancelledChecked, setCancelledChecked] = useState(isCancelled)
  const [state, formAction, isPending] = useActionState(
    correctExamQuestionAction.bind(null, examId, examQuestionId),
    undefined
  )

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="min-w-0 rounded-xl border border-border/70 bg-card p-4 shadow-2xs sm:p-5"
    >
      <div className="flex min-w-0 flex-col justify-between gap-3 lg:flex-row lg:items-start lg:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
            {order + 1}
          </span>
          <div className="min-w-0 flex-1 overflow-x-auto pt-0.5 text-sm leading-relaxed font-medium break-words text-foreground">
            <LatexText text={questionText} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
          <Badge variant={isCancelled ? "secondary" : "outline"}>
            {isCancelled
              ? "Cancelled (Full Credit)"
              : `Key: Option ${correctOption}`}
          </Badge>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-10 gap-2 rounded-xl px-3 text-xs font-semibold shadow-2xs sm:text-sm"
            >
              <Wrench data-icon="inline-start" />
              {open ? "Cancel Edit" : "Change Key / Cancel"}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <form
          action={formAction}
          className="mt-4 border-t border-border/50 pt-4 sm:mt-5 sm:pt-5"
        >
          <FieldGroup>
            <FieldGroup className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 sm:gap-5">
              <Field>
                <FieldLabel
                  htmlFor={`correct-${examQuestionId}`}
                  className="text-sm font-semibold"
                >
                  Correct Option Key
                </FieldLabel>
                <Select name="correctOption" defaultValue={correctOption}>
                  <SelectTrigger id={`correct-${examQuestionId}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="A">Option A</SelectItem>
                      <SelectItem value="B">Option B</SelectItem>
                      <SelectItem value="C">Option C</SelectItem>
                      <SelectItem value="D">Option D</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field
                orientation="horizontal"
                className="items-start gap-2.5 py-2 sm:pb-3"
              >
                <Checkbox
                  id={`cancel-${examQuestionId}`}
                  name="isCancelled"
                  checked={cancelledChecked}
                  onCheckedChange={(checked) =>
                    setCancelledChecked(Boolean(checked))
                  }
                />
                <FieldLabel
                  htmlFor={`cancel-${examQuestionId}`}
                  className="text-sm leading-relaxed font-medium"
                >
                  Cancel question (grant full points to all students)
                </FieldLabel>
              </Field>
            </FieldGroup>

            <Field>
              <FieldLabel
                htmlFor={`reason-${examQuestionId}`}
                className="text-sm font-semibold"
              >
                Correction Justification (Audit Log)
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <Textarea
                id={`reason-${examQuestionId}`}
                name="reason"
                placeholder="e.g. Typo in question prompt; Option B accepted as valid answer..."
                rows={2}
                required
                className="resize-y"
              />
            </Field>

            {state && "error" in state && (
              <FieldError>{state.error}</FieldError>
            )}
            {state && "regradedCount" in state && (
              <p role="status" className="text-sm font-semibold text-primary">
                Successfully regraded {state.regradedCount} attempt
                {state.regradedCount === 1 ? "" : "s"}.
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-10 rounded-xl px-4 text-sm font-semibold"
              >
                Dismiss
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="h-10 gap-2 rounded-xl px-4 text-sm font-semibold shadow-xs"
              >
                {isPending && <Spinner data-icon="inline-start" />}
                Apply Correction & Regrade
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CollapsibleContent>
    </Collapsible>
  )
}
