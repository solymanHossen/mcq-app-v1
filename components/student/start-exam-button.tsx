"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { startAttemptAction } from "@/actions/attempt.actions"

export function StartExamButton({
  examId,
  label,
}: {
  examId: string
  label: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function start() {
    startTransition(async () => {
      const result = await startAttemptAction(examId)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      router.push(`/exams/${examId}/attempt/${result.attemptId}`)
    })
  }

  return (
    <Button onClick={start} disabled={isPending}>
      {isPending && <Spinner data-icon="inline-start" />}
      {label}
    </Button>
  )
}
