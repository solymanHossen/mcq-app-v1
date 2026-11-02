"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  publishExamResultsAction,
  releaseAnswerKeyAction,
} from "@/modules/grading/actions"

export function ResultDisclosureActions({
  examId,
  answerKeyReleased,
}: {
  examId: string
  answerKeyReleased: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function publish() {
    startTransition(async () => {
      const result = await publishExamResultsAction(examId)
      if (result && "error" in result) {
        toast.error(result.error)
        return
      }
      toast.success(`Published ${result.published} result(s)`)
      router.refresh()
    })
  }

  function releaseKey() {
    startTransition(async () => {
      const result = await releaseAnswerKeyAction(examId)
      if (result && "error" in result) {
        toast.error(result.error)
        return
      }
      toast.success("Answer key released to students")
      router.refresh()
    })
  }

  return (
    <div
      aria-busy={isPending}
      className="grid min-w-0 grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2 sm:gap-2.5 xl:flex xl:flex-wrap"
    >
      <Button
        size="sm"
        disabled={isPending}
        onClick={publish}
        className="h-10 gap-2 rounded-xl px-4 text-sm font-semibold shadow-xs"
      >
        Publish results
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending || answerKeyReleased}
        onClick={releaseKey}
        className="h-10 rounded-xl border-border/70 px-4 text-sm font-semibold shadow-2xs"
      >
        {answerKeyReleased ? "Answer key released" : "Release answer key"}
      </Button>
    </div>
  )
}
