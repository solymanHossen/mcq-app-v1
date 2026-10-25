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
    <div className="flex gap-2">
      <Button size="sm" disabled={isPending} onClick={publish}>
        Publish results
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending || answerKeyReleased}
        onClick={releaseKey}
      >
        {answerKeyReleased ? "Answer key released" : "Release answer key"}
      </Button>
    </div>
  )
}
