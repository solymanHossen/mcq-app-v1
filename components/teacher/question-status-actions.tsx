"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { setQuestionStatusAction, deleteQuestionAction } from "@/actions/question.actions"

export function QuestionStatusActions({
  questionId,
  status,
}: {
  questionId: string
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
}) {
  const [isPending, startTransition] = useTransition()

  function run(next: "DRAFT" | "ACTIVE" | "ARCHIVED") {
    startTransition(async () => {
      const result = await setQuestionStatusAction(questionId, next)
      if (result?.error) toast.error(result.error)
      else toast.success(`Question moved to ${next.toLowerCase()}`)
    })
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteQuestionAction(questionId)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <div className="flex gap-2">
      {status === "DRAFT" && (
        <Button size="sm" disabled={isPending} onClick={() => run("ACTIVE")}>
          Publish to bank
        </Button>
      )}
      {status === "ACTIVE" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run("ARCHIVED")}
        >
          Archive
        </Button>
      )}
      {status === "ARCHIVED" && (
        <Button size="sm" disabled={isPending} onClick={() => run("ACTIVE")}>
          Restore
        </Button>
      )}
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={remove}
      >
        Delete
      </Button>
    </div>
  )
}
