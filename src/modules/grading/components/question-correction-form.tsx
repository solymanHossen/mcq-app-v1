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
import { Checkbox } from "@/components/ui/checkbox"
import { Wrench, CheckCircle2, AlertCircle } from "lucide-react"

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
    <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-3 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground">
            {order + 1}
          </span>
          <div className="text-sm font-medium text-foreground leading-relaxed line-clamp-2">
            <LatexText text={questionText} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
          {isCancelled ? (
            <Badge variant="secondary" className="rounded-lg text-xs font-semibold">
              Cancelled (Full Credit)
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-lg px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            >
              Key: Option {correctOption}
            </Badge>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen((o) => !o)}
            className="h-8 rounded-xl text-xs font-semibold shadow-2xs"
          >
            <Wrench className="mr-1.5 size-3.5" />
            {open ? "Cancel Edit" : "Change Key / Cancel"}
          </Button>
        </div>
      </div>

      {open && (
        <form action={formAction} className="mt-3 space-y-4 border-t border-border/50 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label
                htmlFor={`correct-${examQuestionId}`}
                className="text-xs font-semibold text-foreground"
              >
                Correct Option Key
              </label>
              <Select name="correctOption" defaultValue={correctOption}>
                <SelectTrigger id={`correct-${examQuestionId}`} className="h-10 rounded-xl bg-background">
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
            </div>

            <div className="flex items-center gap-2.5 pb-2">
              <Checkbox
                id={`cancel-${examQuestionId}`}
                name="isCancelled"
                checked={cancelledChecked}
                onCheckedChange={(checked) => setCancelledChecked(Boolean(checked))}
                className="rounded-md"
              />
              <label
                htmlFor={`cancel-${examQuestionId}`}
                className="text-xs font-medium text-foreground cursor-pointer select-none"
              >
                Cancel question (grant full points to all students)
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`reason-${examQuestionId}`}
              className="text-xs font-semibold text-foreground"
            >
              Correction Justification (Audit Log) <span className="text-destructive">*</span>
            </label>
            <Textarea
              id={`reason-${examQuestionId}`}
              name="reason"
              placeholder="e.g. Typo in question prompt; Option B accepted as valid answer..."
              rows={2}
              required
              className="rounded-xl text-xs bg-background resize-none"
            />
          </div>

          {state && "error" in state && <FieldError>{state.error}</FieldError>}
          {state && "regradedCount" in state && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Successfully regraded {state.regradedCount} attempt{state.regradedCount === 1 ? "" : "s"}.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-9 rounded-xl text-xs"
            >
              Dismiss
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="h-9 rounded-xl text-xs font-semibold shadow-xs">
              {isPending && <Spinner className="mr-1.5" />}
              Apply Correction & Regrade
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
