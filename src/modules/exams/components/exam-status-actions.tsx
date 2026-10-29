"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Send, Archive, Trash2, CheckCircle2 } from "lucide-react"
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
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Exam published successfully! Students can now attempt it.")
        router.refresh()
      }
    })
  }

  function archive() {
    startTransition(async () => {
      const result = await archiveExamAction(examId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Exam archived.")
        router.refresh()
      }
    })
  }

  function remove() {
    if (!window.confirm("Are you sure you want to delete this draft exam? This cannot be undone.")) {
      return
    }
    startTransition(async () => {
      const result = await deleteExamAction(examId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Draft exam deleted.")
      router.push("/teacher/exams")
    })
  }

  return (
    <div className="flex items-center gap-2">
      {status === "DRAFT" && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={remove}
            className="h-9 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 text-xs font-semibold shadow-2xs"
          >
            {isPending ? <Spinner className="mr-1.5" /> : <Trash2 className="mr-1.5 size-3.5" />}
            Delete Draft
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={publish}
            className="h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs"
          >
            {isPending ? <Spinner className="mr-1.5" /> : <Send className="mr-1.5 size-3.5" />}
            Publish Exam
          </Button>
        </>
      )}

      {status === "PUBLISHED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={archive}
          className="h-9 rounded-xl text-xs font-semibold shadow-2xs hover:bg-muted"
        >
          {isPending ? <Spinner className="mr-1.5" /> : <Archive className="mr-1.5 size-3.5" />}
          Archive Exam
        </Button>
      )}
    </div>
  )
}
