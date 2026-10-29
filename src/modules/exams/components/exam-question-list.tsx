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
  EmptyContent,
} from "@/components/ui/empty"
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  FileQuestion,
  Plus,
  GripVertical,
  Award,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Question removed from exam")
      }
    })
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion className="size-8 text-primary" />
            </EmptyMedia>
            <EmptyTitle className="font-heading text-lg sm:text-xl font-bold">
              No questions added yet
            </EmptyTitle>
            <EmptyDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
              Select and import questions from your question bank vault to populate this assessment.
            </EmptyDescription>
          </EmptyHeader>
          {editable && (
            <EmptyContent>
              <Button
                asChild
                size="lg"
                className="h-11 rounded-xl px-5 text-sm font-semibold shadow-xs"
              >
                <Link href={`/teacher/exams/${examId}/add-questions`}>
                  <Plus className="mr-2 size-4" />
                  <span>Add Questions from Bank</span>
                </Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      </div>
    )
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)

  return (
    <div className="space-y-4">
      {/* List Header Summary */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            {questions.length} question{questions.length === 1 ? "" : "s"} ordered
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-xs sm:text-sm font-semibold text-primary">
            {totalMarks} total mark{totalMarks === 1 ? "" : "s"}
          </span>
        </div>
        {editable && (
          <span className="text-xs text-muted-foreground">
            Use arrows to adjust presentation order
          </span>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {questions.map((q, index) => {
          const isFirst = index === 0
          const isLast = index === questions.length - 1

          return (
            <div
              key={q.id}
              className={cn(
                "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-border hover:shadow-xs",
                isPending && "opacity-70 pointer-events-none"
              )}
            >
              {/* Question Index and Content */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                  {index + 1}
                </span>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="text-sm font-medium text-foreground leading-relaxed line-clamp-3">
                    <LatexText text={q.questionTextSnapshot} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-lg px-2 py-0.5 text-xs font-semibold bg-muted/50 border-border/70 text-muted-foreground"
                    >
                      <Award className="mr-1 size-3 text-primary" />
                      {q.marks} mark{q.marks === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Reordering and Removal */}
              {editable && (
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isPending || isFirst}
                    onClick={() => move(index, -1)}
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    aria-label="Move question up"
                    title="Move up"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isPending || isLast}
                    onClick={() => move(index, 1)}
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    aria-label="Move question down"
                    title="Move down"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => remove(q.id)}
                    className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Remove question from exam"
                    title="Remove from exam"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
