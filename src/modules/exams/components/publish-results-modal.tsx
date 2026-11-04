"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Sparkles,
  Check,
  Loader2,
  FileCheck2,
  CheckCircle2,
  HelpCircle,
  Eye,
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
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function PublishResultsModal({
  examId,
  examTitle,
  answerKeyReleased = false,
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

  // Sync internal open state
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

      <DialogContent className="rounded-3xl sm:max-w-lg p-5 sm:p-6 gap-5 bg-card border border-border/80 shadow-xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="size-11 sm:size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20">
              <Sparkles className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <Badge
                variant="outline"
                className="mb-1 text-[10px] font-bold text-primary border-primary/30 uppercase tracking-wide"
              >
                Result & Answer Disclosure
              </Badge>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                Publish Results & Solutions
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
            Choose what information to disclose to students for{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{examTitle}&rdquo;
            </span>
            . You can release results now or keep them pending until review is
            complete.
          </DialogDescription>
        </DialogHeader>

        {/* Option Selection Cards */}
        <div className="space-y-3 pt-1">
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
              "w-full text-left p-4 rounded-2xl border transition-all cursor-pointer select-none",
              publishScores
                ? "border-primary/50 bg-primary/5 shadow-2xs ring-1 ring-primary/20"
                : "border-border/70 hover:border-border hover:bg-muted/40"
            )}
          >
            <div className="flex items-start gap-3.5">
              <div className="pt-0.5">
                <Checkbox
                  id="publish-scores-checkbox"
                  checked={publishScores}
                  onCheckedChange={(checked) => setPublishScores(!!checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-md"
                />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <Label
                    htmlFor="publish-scores-checkbox"
                    className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Publish Student Scores (ফলাফল প্রকাশ)
                  </Label>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold text-primary border-primary/25 bg-primary/5"
                  >
                    Marks & Metrics
                  </Badge>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  Students can view their obtained marks, accuracy percentage,
                  and pass/fail status immediately.
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
              "w-full text-left p-4 rounded-2xl border transition-all select-none",
              isAnswerKeyAlreadyReleased
                ? "border-emerald-500/30 bg-emerald-500/5 cursor-default"
                : releaseAnswerKey
                ? "border-primary/50 bg-primary/5 shadow-2xs ring-1 ring-primary/20 cursor-pointer"
                : "border-border/70 hover:border-border hover:bg-muted/40 cursor-pointer"
            )}
          >
            <div className="flex items-start gap-3.5">
              <div className="pt-0.5">
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
                  className="rounded-md"
                />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <Label
                    htmlFor="release-answer-key-checkbox"
                    className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Release Official Answer Key (সঠিক উত্তর ও সমাধান)
                  </Label>
                  {isAnswerKeyAlreadyReleased ? (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30"
                    >
                      Already Released
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold text-muted-foreground border-border"
                    >
                      Solutions & Hints
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  Students can verify their chosen options against correct
                  answers with detailed teacher explanations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="rounded-xl h-10 text-xs sm:text-sm font-semibold border-border/70 hover:bg-muted"
          >
            Skip for now
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || !hasSelectionToPublish}
            className="rounded-xl h-10 text-xs sm:text-sm font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            <span>Confirm & Publish</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

