"use client"

import { useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  reorderExamQuestionsAction,
  removeQuestionFromExamAction,
} from "@/modules/exams/exam-question-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LatexText } from "@/components/shared/latex-text"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  HelpCircle,
  Plus,
  Award,
  Loader2,
} from "lucide-react"

type ListedQuestion = {
  id: string
  questionTextSnapshot: string
  marks: number
}

export function ExamQuestionList({
  examId,
  questions,
  editable,
}: {
  examId: string
  questions: ListedQuestion[]
  editable: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= questions.length) return
    const reordered = [...questions]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)

    startTransition(async () => {
      const result = await reorderExamQuestionsAction(
        examId,
        reordered.map((q) => q.id)
      )
      if (result?.error) toast.error(result.error)
    })
  }

  function remove(examQuestionId: string) {
    startTransition(async () => {
      const result = await removeQuestionFromExamAction(examId, examQuestionId)
      if (result?.error) toast.error(result.error)
      else toast.success("Question removed from exam")
    })
  }

  if (questions.length === 0) {
    return (
      <Empty className="rounded-2xl border border-dashed border-border/80 bg-card/50 p-8 sm:p-12 text-center">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-primary/10 text-primary mb-3">
            <HelpCircle className="size-6 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="text-lg font-bold text-foreground">
            No Questions Added Yet
          </EmptyTitle>
          <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm">
            This exam is currently empty. Browse and select questions from your personal question bank to build this assessment.
          </EmptyDescription>
        </EmptyHeader>
        {editable && (
          <div className="mt-4">
            <Button asChild className="gap-2 shadow-sm font-semibold rounded-xl text-xs sm:text-sm h-10 px-5">
              <Link href={`/teacher/exams/${examId}/add-questions`}>
                <Plus className="size-4" />
                <span>Add Questions from Bank</span>
              </Link>
            </Button>
          </div>
        )}
      </Empty>
    )
  }

  return (
    <div className="space-y-3">
      {questions.map((q, index) => (
        <div
          key={q.id}
          className="group relative flex items-start gap-3.5 rounded-2xl border border-border/70 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
        >
          {/* Order Badge */}
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {index + 1}
          </div>

          {/* Question Text & Marks */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-sm font-medium text-foreground leading-relaxed">
              <LatexText text={q.questionTextSnapshot} />
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] gap-1 px-2 py-0.5 rounded-md font-medium text-muted-foreground border-border/80">
                <Award className="size-3 text-primary" />
                <span>
                  {q.marks} mark{q.marks === 1 ? "" : "s"}
                </span>
              </Badge>
            </div>
          </div>

          {/* Action buttons (Reorder & Remove) */}
          {editable && (
            <div className="flex items-center gap-1 shrink-0 pt-0.5">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                disabled={isPending || index === 0}
                onClick={() => move(index, -1)}
                title="Move up"
                aria-label="Move up"
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                disabled={isPending || index === questions.length - 1}
                onClick={() => move(index, 1)}
                title="Move down"
                aria-label="Move down"
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                disabled={isPending}
                onClick={() => remove(q.id)}
                title="Remove question"
                aria-label="Remove"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
