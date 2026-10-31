"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addQuestionsToExamAction } from "@/modules/exams/exam-question-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { LatexText } from "@/components/shared/latex-text"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import {
  CheckSquare,
  Square,
  Plus,
  SearchX,
} from "lucide-react"
import { cn } from "@/lib/utils"

type PickerQuestion = {
  id: string
  questionText: string
  subject: string
  topic: string
  difficulty: string
}

const DIFFICULTY_VARIANTS: Record<
  string,
  { label: string; className: string }
> = {
  EASY: {
    label: "Easy",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  HARD: {
    label: "Hard",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
}

export function AddQuestionsForm({
  examId,
  questions,
}: {
  examId: string
  questions: PickerQuestion[]
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(questions.map((q) => q.id)))
  }

  function clearAll() {
    setSelected(new Set())
  }

  function submit() {
    if (selected.size === 0) return
    startTransition(async () => {
      const result = await addQuestionsToExamAction(examId, [...selected])
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Successfully added ${result?.added ?? 0} question(s) to exam`)
      router.push(`/teacher/exams/${examId}`)
    })
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX className="size-8 text-primary" />
            </EmptyMedia>
            <EmptyTitle className="font-heading text-lg sm:text-xl font-bold">
              No eligible questions found
            </EmptyTitle>
            <EmptyDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
              No questions match these filters, or all matching questions are already
              part of this assessment.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const allSelectedOnPage =
    questions.length > 0 && questions.every((q) => selected.has(q.id))

  return (
    <div className="space-y-4">
      {/* Selection Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:px-6 sm:py-4.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={allSelectedOnPage ? clearAll : selectAll}
            className="h-10 max-w-full rounded-xl text-xs font-semibold shadow-2xs hover:bg-background sm:text-sm"
          >
            {allSelectedOnPage ? (
              <>
                <Square className="mr-1.5 size-3.5" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="mr-1.5 size-3.5" />
                Select All on Page ({questions.length})
              </>
            )}
          </Button>

          {selected.size > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-10 rounded-xl text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            {selected.size} of {questions.length} selected
          </span>
        </div>
      </div>

      {/* Questions Card Grid */}
      <div className="space-y-3">
        {questions.map((q) => {
          const isChecked = selected.has(q.id)
          const diffBadge = DIFFICULTY_VARIANTS[q.difficulty] ?? {
            label: q.difficulty,
            className: "bg-muted text-muted-foreground",
          }

          return (
            <label
              key={q.id}
              htmlFor={`vault-question-${q.id}`}
              className={cn(
                "group relative flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 shadow-xs transition-colors select-none focus-within:ring-4 focus-within:ring-primary/15 sm:gap-4 sm:p-6",
                isChecked
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/70 bg-card hover:border-primary/30 hover:bg-muted/20"
              )}
            >
              <div className="shrink-0 pt-0.5">
                <Checkbox
                  id={`vault-question-${q.id}`}
                  aria-label={`Select question: ${q.questionText}`}
                  checked={isChecked}
                  onCheckedChange={() => toggle(q.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      toggle(q.id)
                    }
                  }}
                  className="rounded-md"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="max-w-full whitespace-normal break-words rounded-lg px-2 py-0.5 text-xs font-semibold bg-muted/60 text-foreground border-border/70"
                  >
                    {q.subject}
                  </Badge>
                  <span className="text-muted-foreground text-xs">/</span>
                  <Badge
                    variant="outline"
                    className="max-w-full whitespace-normal break-words rounded-lg px-2 py-0.5 text-xs font-medium bg-muted/40 text-muted-foreground border-border/60"
                  >
                    {q.topic}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-lg px-2 py-0.5 text-xs font-semibold ml-auto",
                      diffBadge.className
                    )}
                  >
                    {diffBadge.label}
                  </Badge>
                </div>

                <div className="text-sm font-medium leading-relaxed break-words text-foreground sm:text-base">
                  <LatexText text={q.questionText} />
                </div>
              </div>
            </label>
          )
        })}
      </div>

      {/* Import action stays in the document flow so every question remains visible. */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
            {selected.size}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            {selected.size === 1 ? "1 question" : `${selected.size} questions`} chosen
          </span>
        </div>

        <Button
          onClick={submit}
          disabled={isPending || selected.size === 0}
          size="lg"
          className="h-11 w-full rounded-xl px-4 text-sm font-semibold shadow-2xs sm:h-10 sm:w-auto sm:px-6"
        >
          {isPending && <Spinner className="mr-2" />}
          <Plus className="mr-1.5 size-4" />
          <span>
            Add {selected.size > 0 ? selected.size : ""} Question{selected.size === 1 ? "" : "s"}
          </span>
        </Button>
      </div>
    </div>
  )
}
