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
  BookOpen,
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
      <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-muted/40 p-3 sm:p-4 border border-border/60">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={allSelectedOnPage ? clearAll : selectAll}
            className="h-8 rounded-xl text-xs font-semibold shadow-2xs hover:bg-background"
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
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
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
            <div
              key={q.id}
              onClick={() => toggle(q.id)}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault()
                  toggle(q.id)
                }
              }}
              className={cn(
                "group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 sm:p-5 transition-all select-none",
                isChecked
                  ? "border-primary/60 bg-primary/[0.03] ring-1 ring-primary/20 shadow-xs"
                  : "border-border/70 bg-card hover:border-border hover:bg-muted/30 shadow-2xs"
              )}
            >
              <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggle(q.id)}
                  className="rounded-md"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="rounded-lg px-2 py-0.5 text-xs font-semibold bg-muted/60 text-foreground border-border/70"
                  >
                    {q.subject}
                  </Badge>
                  <span className="text-muted-foreground text-xs">/</span>
                  <Badge
                    variant="outline"
                    className="rounded-lg px-2 py-0.5 text-xs font-medium bg-muted/40 text-muted-foreground border-border/60"
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

                <div className="text-sm font-medium text-foreground leading-relaxed line-clamp-3">
                  <LatexText text={q.questionText} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating or Bottom Import Action Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card/95 p-4 sm:p-5 shadow-lg backdrop-blur-md">
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
          className="h-11 rounded-xl px-6 text-sm font-semibold shadow-xs"
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
