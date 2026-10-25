"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  publishExamAction,
  archiveExamAction,
  deleteExamAction,
} from "@/modules/exams/actions"

export function ExamStatusActions({
  examId,
  status,
}: {
  examId: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function publish() {
    startTransition(async () => {
      const result = await publishExamAction(examId)
      if (result?.error) toast.error(result.error)
      else toast.success("Exam published")
    })
  }

  function archive() {
    startTransition(async () => {
      const result = await archiveExamAction(examId)
      if (result?.error) toast.error(result.error)
      else toast.success("Exam archived")
    })
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteExamAction(examId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      router.push("/teacher/exams")
    })
  }

  return (
    <div className="flex gap-2">
      {isPending && <Spinner />}
      {status === "DRAFT" && (
        <>
          <Button size="sm" disabled={isPending} onClick={publish}>
            Publish
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={remove}
          >
            Delete draft
          </Button>
        </>
      )}
      {status === "PUBLISHED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={archive}
        >
          Archive
        </Button>
      )}
    </div>
  )
}
