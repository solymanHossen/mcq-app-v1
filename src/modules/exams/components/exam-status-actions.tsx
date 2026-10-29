"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  publishExamAction,
  archiveExamAction,
  deleteExamAction,
} from "@/modules/exams/actions"
import { Send, Trash2, Archive, Loader2 } from "lucide-react"

export function ExamStatusActions({
  examId,
  status,
}: {
  examId: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [publishOpen, setPublishOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  function handlePublish() {
    startTransition(async () => {
      const result = await publishExamAction(examId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Exam published successfully! Students can now access it.")
        setPublishOpen(false)
        router.refresh()
      }
    })
  }

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveExamAction(examId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Exam archived.")
        setArchiveOpen(false)
        router.refresh()
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteExamAction(examId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Exam draft deleted.")
      setDeleteOpen(false)
      router.push("/teacher/exams")
    })
  }

  return (
    <div className="flex items-center gap-2.5">
      {status === "DRAFT" && (
        <>
          {/* Publish Action with Alert Dialog */}
          <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isPending}
                className="gap-2 rounded-xl text-xs sm:text-sm font-semibold h-10 px-4 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                <span>Publish</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl max-w-md p-6">
              <AlertDialogHeader className="space-y-2">
                <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                  <Send className="size-5" />
                </div>
                <AlertDialogTitle className="text-xl font-bold">
                  Publish this Examination?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Publishing locks the question bank snapshots and makes this exam active for student participation according to your configured schedule window.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-3 gap-2">
                <AlertDialogCancel className="rounded-xl h-10 text-xs sm:text-sm" disabled={isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    handlePublish()
                  }}
                  disabled={isPending}
                  className="rounded-xl h-10 text-xs sm:text-sm font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  <span>Confirm & Publish</span>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Draft Action with Alert Dialog */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isPending}
                className="gap-2 rounded-xl text-xs sm:text-sm font-semibold h-10 px-4 border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                <span>Delete draft</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl max-w-md p-6">
              <AlertDialogHeader className="space-y-2">
                <div className="size-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-1">
                  <Trash2 className="size-5" />
                </div>
                <AlertDialogTitle className="text-xl font-bold text-destructive">
                  Delete Exam Draft?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  This action cannot be undone. This exam draft and its question associations will be permanently deleted. Your original questions in the question bank will remain safe.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-3 gap-2">
                <AlertDialogCancel className="rounded-xl h-10 text-xs sm:text-sm" disabled={isPending}>
                  Keep Draft
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete()
                  }}
                  disabled={isPending}
                  className="rounded-xl h-10 text-xs sm:text-sm font-semibold gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  <span>Delete Permanently</span>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {status === "PUBLISHED" && (
        <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              disabled={isPending}
              className="gap-2 rounded-xl text-xs sm:text-sm font-semibold h-10 px-4"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Archive className="size-4" />
              )}
              <span>Archive</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl max-w-md p-6">
            <AlertDialogHeader className="space-y-2">
              <div className="size-11 rounded-2xl bg-muted flex items-center justify-center mb-1">
                <Archive className="size-5 text-foreground" />
              </div>
              <AlertDialogTitle className="text-xl font-bold">
                Archive this Exam?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Archiving closes this exam to all new student attempts. All existing student submissions and results will remain preserved and accessible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-3 gap-2">
              <AlertDialogCancel className="rounded-xl h-10 text-xs sm:text-sm" disabled={isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleArchive()
                }}
                disabled={isPending}
                className="rounded-xl h-10 text-xs sm:text-sm font-semibold gap-2"
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Archive className="size-4" />}
                <span>Confirm Archive</span>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
