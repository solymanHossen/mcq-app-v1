"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  CheckCircle2,
  Archive,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  RotateCcw,
  Square,
  CheckSquare,
  Clock,
  AlertTriangle,
} from "lucide-react"

import {
  bulkSetQuestionStatusAction,
  bulkPublishFilteredQuestionsAction,
  bulkDeleteQuestionsAction,
  setQuestionStatusAction,
  deleteQuestionAction,
} from "@/modules/question-bank/actions"
import { LatexText } from "@/components/shared/latex-text"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export interface QuestionBankItem {
  id: string
  subject: string
  topic: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: "A" | "B" | "C" | "D"
  createdAt: Date | string
  _count: {
    examQuestions: number
    reports: number
  }
}

interface QuestionBankTableProps {
  questions: QuestionBankItem[]
  total: number
  filters: {
    subject?: string
    topic?: string
    difficulty?: "EASY" | "MEDIUM" | "HARD"
    status?: "DRAFT" | "ACTIVE" | "ARCHIVED"
    search?: string
  }
}

export function QuestionBankTable({
  questions,
  total,
  filters,
}: QuestionBankTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [selectAllMatching, setSelectAllMatching] = React.useState(false)
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const [isBulkPending, startBulkTransition] = React.useTransition()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)

  // Clear selection if question IDs completely change (e.g. page navigation)
  React.useEffect(() => {
    setSelectedIds(new Set())
    setSelectAllMatching(false)
  }, [questions])

  const currentPageIds = React.useMemo(() => questions.map((q) => q.id), [questions])
  const allCurrentPageSelected =
    questions.length > 0 && currentPageIds.every((id) => selectedIds.has(id))
  const someCurrentPageSelected =
    currentPageIds.some((id) => selectedIds.has(id)) && !allCurrentPageSelected

  // Count draft questions on the current page and in current view
  const draftsOnPageCount = questions.filter((q) => q.status === "DRAFT").length

  function toggleSelect(id: string) {
    setSelectAllMatching(false)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllCurrentPage() {
    if (allCurrentPageSelected) {
      setSelectedIds(new Set())
      setSelectAllMatching(false)
    } else {
      setSelectedIds(new Set(currentPageIds))
    }
  }

  function handleSelectAllMatching() {
    setSelectedIds(new Set(currentPageIds))
    setSelectAllMatching(true)
  }

  function clearSelection() {
    setSelectedIds(new Set())
    setSelectAllMatching(false)
  }

  // ─── Single Item Actions ─────────────────────────────────────
  async function handlePublishSingle(id: string) {
    setPendingId(id)
    try {
      const res = await setQuestionStatusAction(id, "ACTIVE")
      if (res && "error" in res && res.error) {
        toast.error(res.error)
      } else {
        toast.success("Question published to active question bank!")
        router.refresh()
      }
    } catch {
      toast.error("Failed to publish question")
    } finally {
      setPendingId(null)
    }
  }

  async function handleStatusChangeSingle(
    id: string,
    status: "DRAFT" | "ACTIVE" | "ARCHIVED"
  ) {
    setPendingId(id)
    try {
      const res = await setQuestionStatusAction(id, status)
      if ("error" in res && res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Question status moved to ${status.toLowerCase()}`)
        router.refresh()
      }
    } catch {
      toast.error("Failed to update status")
    } finally {
      setPendingId(null)
    }
  }

  // ─── Bulk Actions ───────────────────────────────────────────
  function handleBulkPublish() {
    startBulkTransition(async () => {
      try {
        if (selectAllMatching) {
          const res = await bulkPublishFilteredQuestionsAction(filters)
          if ("error" in res && res.error) {
            toast.error(res.error)
          } else if ("count" in res) {
            toast.success(
              `Successfully published all ${res.count} draft questions matching filters!`
            )
            clearSelection()
            router.refresh()
          }
        } else {
          const ids = Array.from(selectedIds)
          const res = await bulkSetQuestionStatusAction(ids, "ACTIVE")
          if ("error" in res && res.error) {
            toast.error(res.error)
          } else if ("count" in res) {
            toast.success(
              `Successfully published ${res.count} question${res.count === 1 ? "" : "s"} to active bank!`
            )
            clearSelection()
            router.refresh()
          }
        }
      } catch {
        toast.error("Bulk publish operation failed")
      }
    })
  }

  function handleBulkArchive() {
    startBulkTransition(async () => {
      try {
        const ids = Array.from(selectedIds)
        const res = await bulkSetQuestionStatusAction(ids, "ARCHIVED")
        if ("error" in res && res.error) {
          toast.error(res.error)
        } else if ("count" in res) {
          toast.success(
            `Successfully archived ${res.count} question${res.count === 1 ? "" : "s"}`
          )
          clearSelection()
          router.refresh()
        }
      } catch {
        toast.error("Bulk archive operation failed")
      }
    })
  }

  function handleBulkDelete() {
    startBulkTransition(async () => {
      try {
        const ids = Array.from(selectedIds)
        const res = await bulkDeleteQuestionsAction(ids)
        if ("error" in res && res.error) {
          toast.error(res.error)
        } else if ("deletedCount" in res) {
          if (res.skippedCount && res.skippedCount > 0) {
            toast.warning(
              `Deleted ${res.deletedCount} question(s). ${res.skippedCount} question(s) were protected because they are linked to exams.`
            )
          } else {
            toast.success(`Deleted ${res.deletedCount} question(s)`)
          }
          clearSelection()
          router.refresh()
        }
      } catch {
        toast.error("Bulk delete operation failed")
      } finally {
        setDeleteConfirmOpen(false)
      }
    })
  }

  const effectiveSelectedCount = selectAllMatching ? total : selectedIds.size

  return (
    <div className="space-y-4">
      {/* ================= BULK ACTIONS FLOATING TOOLBAR ================= */}
      {selectedIds.size > 0 ? (
        <div className="sticky top-20 z-30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-card p-3 sm:px-5 sm:py-3.5 shadow-md animate-in fade-in-50 slide-in-from-top-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge
              variant="outline"
              className="rounded-full bg-primary/10 border-primary/30 text-primary font-bold px-3 py-1 text-xs shadow-2xs"
            >
              {effectiveSelectedCount} selected
            </Badge>
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              {selectAllMatching
                ? `All ${total} questions matching filter selected`
                : `${selectedIds.size} question${selectedIds.size === 1 ? "" : "s"} selected`}
            </span>

            {/* Prompt to select all matching across entire dataset */}
            {!selectAllMatching && total > questions.length && allCurrentPageSelected && (
              <button
                type="button"
                onClick={handleSelectAllMatching}
                className="text-xs font-bold text-primary underline hover:text-primary/80 cursor-pointer ml-1"
              >
                Select all {total} questions matching filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Publish Selected Button */}
            <Button
              type="button"
              size="sm"
              disabled={isBulkPending}
              onClick={handleBulkPublish}
              className="h-9 rounded-xl px-3.5 text-xs sm:text-sm font-bold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              {isBulkPending ? (
                <Spinner data-icon="inline-start" className="size-3.5" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              <span>Publish Selected</span>
            </Button>

            {/* Archive Selected Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBulkPending}
              onClick={handleBulkArchive}
              className="h-9 rounded-xl px-3 text-xs sm:text-sm font-semibold border-border/70 hover:bg-muted gap-1.5 shadow-2xs cursor-pointer"
            >
              <Archive className="size-3.5 text-muted-foreground" />
              <span>Archive</span>
            </Button>

            {/* Delete Selected Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBulkPending}
              onClick={() => setDeleteConfirmOpen(true)}
              className="h-9 rounded-xl px-3 text-xs sm:text-sm font-semibold border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5 shadow-2xs cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Delete</span>
            </Button>

            {/* Deselect Button */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="h-9 rounded-xl px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Clear
            </Button>
          </div>
        </div>
      ) : draftsOnPageCount > 0 ? (
        /* ================= QUICK PUBLISH BANNER FOR DRAFT QUESTIONS ================= */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs sm:text-sm text-foreground shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" />
            </span>
            <span className="font-medium text-foreground">
              You have <strong className="font-bold text-amber-600 dark:text-amber-400">{draftsOnPageCount}</strong> draft question{draftsOnPageCount === 1 ? "" : "s"} on this page awaiting publication.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              disabled={isBulkPending}
              onClick={() => {
                const draftIds = questions
                  .filter((q) => q.status === "DRAFT")
                  .map((q) => q.id)
                setSelectedIds(new Set(draftIds))
                handleBulkPublish()
              }}
              className="h-8 rounded-xl px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Publish All {draftsOnPageCount} Drafts</span>
            </Button>
          </div>
        </div>
      ) : null}

      {/* ================= QUESTIONS DATA TABLE ================= */}
      <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-2xs">
        <Table className="w-full">
          <TableHeader className="bg-muted/30 border-b border-border/70">
            <TableRow className="hover:bg-transparent">
              {/* Select All Checkbox */}
              <TableHead className="h-11 w-11 px-3 sm:px-4 text-center">
                <Checkbox
                  checked={
                    allCurrentPageSelected
                      ? true
                      : someCurrentPageSelected
                      ? "indeterminate"
                      : false
                  }
                  onCheckedChange={toggleSelectAllCurrentPage}
                  aria-label="Select all questions on page"
                />
              </TableHead>

              <TableHead className="h-11 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[220px]">
                Question
              </TableHead>
              <TableHead className="h-11 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Subject / Topic
              </TableHead>
              <TableHead className="h-11 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-28 whitespace-nowrap">
                Difficulty
              </TableHead>
              <TableHead className="h-11 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-32 whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="h-11 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-24 whitespace-nowrap">
                Used In
              </TableHead>
              <TableHead className="h-11 px-3 sm:px-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground w-28 whitespace-nowrap">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {questions.map((q) => {
              const isSelected = selectedIds.has(q.id)
              const isDraft = q.status === "DRAFT"
              const isRowPending = pendingId === q.id || (isBulkPending && isSelected)

              return (
                <TableRow
                  key={q.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    "border-b border-border/40 transition-colors",
                    isSelected
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/30"
                  )}
                >
                  {/* Row Checkbox */}
                  <TableCell className="w-11 px-3 sm:px-4 text-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(q.id)}
                      aria-label={`Select question ${q.id}`}
                    />
                  </TableCell>

                  {/* Question Text */}
                  <TableCell className="max-w-md py-3.5 px-3 sm:px-4">
                    <Link
                      href={`/teacher/questions/${q.id}`}
                      className="font-medium text-foreground transition-colors line-clamp-2 hover:text-primary leading-snug block"
                    >
                      <LatexText text={q.questionText} />
                    </Link>
                  </TableCell>

                  {/* Subject / Topic */}
                  <TableCell className="py-3.5 px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    <span className="font-semibold text-foreground">{q.subject}</span>
                    <span className="mx-1.5 text-muted-foreground/50">/</span>
                    <span>{q.topic}</span>
                  </TableCell>

                  {/* Difficulty */}
                  <TableCell className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                    {q.difficulty === "EASY" ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-semibold">
                        Easy
                      </span>
                    ) : q.difficulty === "HARD" ? (
                      <span className="inline-flex items-center rounded-full border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 text-xs font-semibold">
                        Hard
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-xs font-semibold">
                        Medium
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {q.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : q.status === "DRAFT" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-border/70 bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
                          Archived
                        </span>
                      )}

                      {q._count.reports > 0 && (
                        <span className="inline-flex items-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 px-2 py-0.5 text-[11px] font-bold">
                          {q._count.reports} report
                          {q._count.reports === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Used In */}
                  <TableCell className="py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground tabular-nums whitespace-nowrap">
                    {q._count.examQuestions} exam
                    {q._count.examQuestions === 1 ? "" : "s"}
                  </TableCell>

                  {/* Action Cell */}
                  <TableCell className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Direct Publish Button for Draft Questions */}
                      {isDraft && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isRowPending}
                          onClick={() => handlePublishSingle(q.id)}
                          className="h-8 rounded-xl px-2.5 text-xs font-semibold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/60 dark:text-emerald-400 gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
                          title="Publish question to active question bank"
                        >
                          {pendingId === q.id ? (
                            <Spinner className="size-3" />
                          ) : (
                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                          <span>Publish</span>
                        </Button>
                      )}

                      {/* Dropdown for More Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                            aria-label="More question options"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-border/70 p-1">
                          <DropdownMenuItem asChild className="rounded-lg text-xs font-semibold cursor-pointer">
                            <Link href={`/teacher/questions/${q.id}`} className="flex items-center gap-2">
                              <ExternalLink className="size-3.5" />
                              <span>View & Edit</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {q.status === "DRAFT" && (
                            <DropdownMenuItem
                              onClick={() => handlePublishSingle(q.id)}
                              className="rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer gap-2"
                            >
                              <CheckCircle2 className="size-3.5" />
                              <span>Publish to Bank</span>
                            </DropdownMenuItem>
                          )}

                          {q.status === "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChangeSingle(q.id, "ARCHIVED")}
                              className="rounded-lg text-xs font-semibold cursor-pointer gap-2"
                            >
                              <Archive className="size-3.5" />
                              <span>Archive</span>
                            </DropdownMenuItem>
                          )}

                          {q.status === "ARCHIVED" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChangeSingle(q.id, "ACTIVE")}
                              className="rounded-lg text-xs font-semibold text-primary cursor-pointer gap-2"
                            >
                              <RotateCcw className="size-3.5" />
                              <span>Restore to Active</span>
                            </DropdownMenuItem>
                          )}

                          {q._count.examQuestions === 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={async () => {
                                  if (confirm("Are you sure you want to permanently delete this question?")) {
                                    setPendingId(q.id)
                                    const res = await deleteQuestionAction(q.id)
                                    if (res && "error" in res && res.error) {
                                      toast.error(res.error)
                                    } else {
                                      toast.success("Question deleted")
                                      router.refresh()
                                    }
                                    setPendingId(null)
                                  }
                                }}
                                className="rounded-lg text-xs font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2"
                              >
                                <Trash2 className="size-3.5" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-2xl sm:rounded-3xl border-border/70 p-6 sm:p-7 shadow-xl max-w-md">
          <AlertDialogHeader className="space-y-2">
            <div className="size-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-1">
              <Trash2 className="size-5" />
            </div>
            <AlertDialogTitle className="font-heading text-lg sm:text-xl font-bold text-foreground">
              Delete {selectedIds.size} Question{selectedIds.size === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              This action cannot be undone. Questions that are currently linked to existing exams will be safely skipped to preserve academic test integrity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="h-10 rounded-xl border-border/70 font-semibold text-xs sm:text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkPending}
              className="h-10 rounded-xl font-bold text-xs sm:text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm cursor-pointer"
            >
              {isBulkPending ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
