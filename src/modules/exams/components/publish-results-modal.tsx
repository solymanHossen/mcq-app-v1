"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  FileCheck,
  Check,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { publishResultsAndAnswerKeyAction } from "@/modules/grading/actions"

export interface PublishResultsModalProps {
  examId: string
  examTitle: string
  answerKeyReleased?: boolean
  isResultsPublished?: boolean
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function PublishResultsModal({
  examId,
  examTitle,
  answerKeyReleased = false,
  isResultsPublished = false,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: PublishResultsModalProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const [publishScores, setPublishScores] = React.useState(true)
  const [releaseAnswerKey, setReleaseAnswerKey] = React.useState(false)

  // Sync open state
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (isControlled) {
        setControlledOpen?.(newOpen)
      } else {
        setInternalOpen(newOpen)
      }
    },
    [isControlled, setControlledOpen]
  )

  const isAnswerKeyAlreadyReleased = Boolean(answerKeyReleased)

  function handleConfirm() {
    startTransition(async () => {
      const result = await publishResultsAndAnswerKeyAction(examId, {
        publishScores,
        releaseAnswerKey: releaseAnswerKey && !isAnswerKeyAlreadyReleased,
      })

      if (result && "error" in result) {
        toast.error(result.error)
        return
      }

      if (publishScores && releaseAnswerKey && !isAnswerKeyAlreadyReleased) {
        toast.success("Results published and answer key released to students!")
      } else if (publishScores) {
        if (result.publishedCount && result.publishedCount > 0) {
          toast.success(
            `Published scores for ${result.publishedCount} student submission(s)!`
          )
        } else {
          toast.success("Results published! Candidate scores are now visible.")
        }
      } else if (releaseAnswerKey && !isAnswerKeyAlreadyReleased) {
        toast.success("Official answer key & solutions released to students!")
      } else {
        toast.info("No disclosure changes were requested.")
      }

      router.refresh()
      onSuccess?.()
      handleOpenChange(false)
    })
  }

  const hasSelectionToPublish =
    publishScores || (releaseAnswerKey && !isAnswerKeyAlreadyReleased)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="rounded-2xl sm:max-w-md p-5 sm:p-6 gap-4 bg-card border border-border/70 shadow-lg">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <FileCheck className="size-5" />
            </div>
            <div className="space-y-1 min-w-0 flex-1 pr-6">
              <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Publish Results & Solutions
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Choose what to reveal to candidates for{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{examTitle}&rdquo;
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Minimal Selection Cards */}
        <div className="space-y-2.5 pt-1">
          {/* Option 1: Student Scores / Results */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setPublishScores((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setPublishScores((prev) => !prev)
              }
            }}
            className={cn(
              "w-full text-left p-3.5 sm:p-4 rounded-xl border transition-colors cursor-pointer select-none",
              publishScores
                ? "border-primary/40 bg-primary/5"
                : "border-border/70 hover:border-border hover:bg-muted/30"
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="publish-scores-checkbox"
                checked={publishScores}
                onCheckedChange={(checked) => setPublishScores(!!checked)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5"
              />
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor="publish-scores-checkbox"
                    className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Publish Student Scores (ফলাফল প্রকাশ)
                  </Label>
                  {isResultsPublished && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30 h-5 px-1.5"
                    >
                      Already Published
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  {isResultsPublished
                    ? "Scores are live for candidates. Confirming will update and release scores for any newly completed submissions."
                    : "Students can view their obtained marks, accuracy percentage, and pass/fail status."}
                </p>
              </div>
            </div>
          </div>

          {/* Option 2: Answer Key & Explanations */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!isAnswerKeyAlreadyReleased) {
                setReleaseAnswerKey((prev) => !prev)
              }
            }}
            onKeyDown={(e) => {
              if (
                !isAnswerKeyAlreadyReleased &&
                (e.key === "Enter" || e.key === " ")
              ) {
                e.preventDefault()
                setReleaseAnswerKey((prev) => !prev)
              }
            }}
            className={cn(
              "w-full text-left p-3.5 sm:p-4 rounded-xl border transition-colors select-none",
              isAnswerKeyAlreadyReleased
                ? "border-border/50 bg-muted/20 cursor-default"
                : releaseAnswerKey
                ? "border-primary/40 bg-primary/5 cursor-pointer"
                : "border-border/70 hover:border-border hover:bg-muted/30 cursor-pointer"
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="release-answer-key-checkbox"
                checked={isAnswerKeyAlreadyReleased || releaseAnswerKey}
                disabled={isAnswerKeyAlreadyReleased}
                onCheckedChange={(checked) => {
                  if (!isAnswerKeyAlreadyReleased) {
                    setReleaseAnswerKey(!!checked)
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5"
              />
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor="release-answer-key-checkbox"
                    className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Release Official Answer Key (সঠিক উত্তর ও সমাধান)
                  </Label>
                  {isAnswerKeyAlreadyReleased && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium text-muted-foreground h-5 px-1.5"
                    >
                      Already Released
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  Students can review correct answers and detailed question
                  explanations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer Actions */}
        <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="rounded-xl h-10 px-4 text-xs sm:text-sm font-semibold border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || !hasSelectionToPublish}
            className="rounded-xl h-10 px-4 text-xs sm:text-sm font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            <span>
              {isResultsPublished || isAnswerKeyAlreadyReleased
                ? "Confirm & Update"
                : "Confirm & Publish"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
