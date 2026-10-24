"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addQuestionsToExamAction } from "@/actions/exam-question.actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LatexText } from "@/components/latex-text"

type PickerQuestion = {
  id: string
  questionText: string
  subject: string
  topic: string
  difficulty: string
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

  function submit() {
    if (selected.size === 0) return
    startTransition(async () => {
      const result = await addQuestionsToExamAction(examId, [...selected])
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Added ${result?.added ?? 0} question(s)`)
      router.push(`/teacher/exams/${examId}`)
    })
  }

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No eligible questions match these filters — questions must be
          Active and not already in this exam.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {questions.map((q) => (
            <li key={q.id} className="flex items-start gap-3 p-3">
              <Checkbox
                checked={selected.has(q.id)}
                onCheckedChange={() => toggle(q.id)}
                className="mt-1"
              />
              <button
                type="button"
                className="flex-1 text-left text-sm"
                onClick={() => toggle(q.id)}
              >
                <LatexText text={q.questionText} />
                <div className="mt-1 text-xs text-muted-foreground">
                  {q.subject} / {q.topic} · {q.difficulty}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button onClick={submit} disabled={isPending || selected.size === 0}>
        {isPending && <Spinner data-icon="inline-start" />}
        Add {selected.size > 0 ? selected.size : ""} question
        {selected.size === 1 ? "" : "s"}
      </Button>
    </div>
  )
}
