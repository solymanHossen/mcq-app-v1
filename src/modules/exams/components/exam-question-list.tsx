"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import {
  reorderExamQuestionsAction,
  removeQuestionFromExamAction,
} from "@/modules/exams/exam-question-actions"
import { Button } from "@/components/ui/button"
import { LatexText } from "@/components/shared/latex-text"
import { ArrowUpIcon, ArrowDownIcon, XIcon } from "lucide-react"

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
    })
  }

  if (questions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No questions added yet.
      </p>
    )
  }

  return (
    <ol className="divide-y rounded-md border">
      {questions.map((q, index) => (
        <li key={q.id} className="flex items-start gap-3 p-3">
          <span className="mt-0.5 text-sm text-muted-foreground">
            {index + 1}.
          </span>
          <div className="flex-1 text-sm">
            <LatexText text={q.questionTextSnapshot} />
            <div className="mt-1 text-xs text-muted-foreground">
              {q.marks} mark{q.marks === 1 ? "" : "s"}
            </div>
          </div>
          {editable && (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                disabled={isPending || index === 0}
                onClick={() => move(index, -1)}
                aria-label="Move up"
              >
                <ArrowUpIcon />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                disabled={isPending || index === questions.length - 1}
                onClick={() => move(index, 1)}
                aria-label="Move down"
              >
                <ArrowDownIcon />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                disabled={isPending}
                onClick={() => remove(q.id)}
                aria-label="Remove"
              >
                <XIcon />
              </Button>
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
