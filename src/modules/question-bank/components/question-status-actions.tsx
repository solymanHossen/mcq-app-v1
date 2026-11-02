"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  setQuestionStatusAction,
  deleteQuestionAction,
} from "@/modules/question-bank/actions"

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
    <div
      aria-busy={isPending}
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5 lg:shrink-0"
    >
      {status === "DRAFT" && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => run("ACTIVE")}
          className="h-10 rounded-xl px-4 text-sm font-semibold shadow-xs"
        >
          Publish to bank
        </Button>
      )}
      {status === "ACTIVE" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run("ARCHIVED")}
          className="h-10 rounded-xl px-4 text-sm font-semibold shadow-2xs"
        >
          Archive
        </Button>
      )}
      {status === "ARCHIVED" && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => run("ACTIVE")}
          className="h-10 rounded-xl px-4 text-sm font-semibold shadow-xs"
        >
          Restore
        </Button>
      )}
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={remove}
        className="h-10 rounded-xl px-4 text-sm font-semibold shadow-2xs"
      >
        Delete
      </Button>
    </div>
  )
}
