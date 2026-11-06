"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LatexText } from "@/components/shared/latex-text"
import { submitAttemptAction } from "@/modules/attempts/actions"
import {
  useAttemptSync,
  type OptionChoice,
} from "@/modules/attempts/use-attempt-sync"
import { useCountdown, formatRemaining } from "@/modules/attempts/use-countdown"
import { useViolationReporting } from "@/modules/proctoring/use-violation-reporting"
import { cn } from "@/lib/utils"
import {
  Clock,
  Flag,
  Check,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Send,
  Cloud,
  CloudOff,
  RefreshCw,
  Maximize2,
  Minimize2,
  ChevronDown,
  CheckCircle2,
  X,
} from "lucide-react"

export type AttemptQuestion = {
  examQuestionId: string
  questionText: string
  marks: number
  negativeMarks?: number
  optionOrder: OptionChoice[]
  optionText: Record<OptionChoice, string>
  selectedOption: OptionChoice | null
  isMarkedForReview: boolean
}

function formatQuestionIndex(i: number): string {
  return String(i + 1).padStart(2, "0")
}

export function ExamAttemptClient({
  attemptId,
  examTitle,
  deadline,
  questions,
  logoUrl,
  negativeMarks = 0,
}: {
  attemptId: string
  examTitle: string
  deadline: string
  questions: AttemptQuestion[]
  logoUrl?: string | null
  negativeMarks?: number
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [ended, setEnded] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fullscreen event listener
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  const { answers, update, flushPending } = useAttemptSync(
    attemptId,
    questions.map((q) => ({
      examQuestionId: q.examQuestionId,
      selectedOption: q.selectedOption,
      isMarkedForReview: q.isMarkedForReview,
    }))
  )

  useViolationReporting(attemptId, !ended)

  const submit = useCallback(async () => {
    setSubmitting(true)
    await flushPending()
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const result = await submitAttemptAction(attemptId, { clientTimezone })
    setSubmitting(false)
    if (result?.status) {
      toast.success(
        result.status === "TIMEOUT"
          ? "Time's up — exam submitted"
          : "Exam submitted successfully"
      )
      setEnded(true)
      setSubmitDialogOpen(false)
      try {
        sessionStorage.removeItem(`result_modal_closed_${attemptId}`)
      } catch {
        // ignore
      }
      router.refresh()
    } else if (result && "error" in result) {
      toast.error(result.error)
    }
  }, [attemptId, router, flushPending])

  const remainingMs = useCountdown(deadline, () => {
    if (!ended) {
      setSubmitDialogOpen(false)
      submit()
    }
  })

  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter((a) => a.selectedOption !== null).length,
    [answers]
  )

  const markedCount = useMemo(
    () => Object.values(answers).filter((a) => a.isMarkedForReview).length,
    [answers]
  )

  const unansweredCount = useMemo(
    () => Math.max(0, questions.length - answeredCount),
    [questions.length, answeredCount]
  )

  const progressPercent = useMemo(
    () =>
      questions.length > 0
        ? Math.round((answeredCount / questions.length) * 100)
        : 0,
    [answeredCount, questions.length]
  )

  const syncState = useMemo(() => {
    const list = Object.values(answers)
    if (list.some((a) => a.syncStatus === "error")) return "error"
    if (list.some((a) => a.syncStatus === "pending")) return "pending"
    return "synced"
  }, [answers])

  const disabled = ended

  function selectOption(examQuestionId: string, option: OptionChoice) {
    if (disabled) return
    const current = answers[examQuestionId]
    if (current?.selectedOption === option) {
      update(examQuestionId, { selectedOption: null })
    } else {
      update(examQuestionId, { selectedOption: option })
    }
  }

  function clearSelection(examQuestionId: string) {
    if (disabled) return
    update(examQuestionId, { selectedOption: null })
  }

  function toggleReview(examQuestionId: string) {
    if (disabled) return
    const current = answers[examQuestionId]
    update(examQuestionId, {
      isMarkedForReview: !current?.isMarkedForReview,
    })
  }

  const jumpToNextUnanswered = useCallback(() => {
    for (const q of questions) {
      const a = answers[q.examQuestionId]
      const isAnswered = (a?.selectedOption ?? q.selectedOption) !== null
      if (!isAnswered) {
        const el = document.getElementById(`question-card-${q.examQuestionId}`)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          el.classList.add("ring-2", "ring-primary")
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-primary")
          }, 1200)
          return
        }
      }
    }
    toast.info("All questions are answered! You can review and submit.")
  }, [answers, questions])

  return (
    <div className="relative min-h-screen bg-[#F7FAFA] dark:bg-background text-[#172B2B] dark:text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-foreground">
      {/* ================= COMPACT STICKY EXAM HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border/70 shadow-2xs transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Left: Official Brand Emblem & Exam Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative size-8.5 sm:size-9.5 rounded-full shrink-0 ring-1.5 ring-primary/25 dark:ring-primary/40 shadow-2xs overflow-hidden bg-white dark:bg-card flex items-center justify-center p-0.5">
              <Image
                src={logoUrl || "/images/bcs-bank-logo-512.png"}
                alt="BCS & Bank Aspirants"
                width={38}
                height={38}
                priority
                className="size-full object-contain rounded-full"
              />
            </div>
            <div className="min-w-0">
              <h1
                className="font-heading text-base sm:text-base font-bold tracking-tight text-[#172B2B] dark:text-foreground truncate"
                title={examTitle}
              >
                {examTitle}
              </h1>
              <p className="text-[11px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Assessment</span>
                <span className="text-border/80 hidden xs:inline">•</span>
                <span className="hidden xs:inline text-primary font-bold tracking-tight">BCS &amp; Bank Aspirants</span>
              </p>
            </div>
          </div>

          {/* Right: Autosave Status, Timer & Finish Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Real-time Cloud Autosave Status Pill */}
            <div
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all shadow-2xs",
                syncState === "pending"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : syncState === "error"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              )}
              title={
                syncState === "pending"
                  ? "Autosaving answers in real time..."
                  : syncState === "error"
                  ? "Answers cached locally on device — retrying cloud sync..."
                  : "All answers securely saved in real time"
              }
            >
              {syncState === "pending" ? (
                <>
                  <RefreshCw className="size-3 text-primary animate-spin" />
                  <span>Saving</span>
                </>
              ) : syncState === "error" ? (
                <>
                  <CloudOff className="size-3 text-destructive" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <Cloud className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Saved</span>
                </>
              )}
            </div>

            {/* Zen Fullscreen Mode Toggle */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Zen Mode" : "Zen Focus Mode (Fullscreen)"}
              aria-label={isFullscreen ? "Exit Zen Mode" : "Zen Focus Mode (Fullscreen)"}
              className="size-8.5 sm:size-9 rounded-xl border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-2xs cursor-pointer shrink-0 hidden sm:inline-flex"
            >
              {isFullscreen ? (
                <Minimize2 className="size-3.5" />
              ) : (
                <Maximize2 className="size-3.5" />
              )}
            </Button>

            {/* Live Countdown Timer Badge */}
            <div
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border text-xs sm:text-sm font-bold shadow-2xs transition-all shrink-0",
                remainingMs < 60_000
                  ? "border-destructive/40 bg-destructive/10 text-destructive animate-pulse"
                  : remainingMs < 300_000
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-primary/25 bg-primary/5 text-primary dark:bg-primary/10"
              )}
            >
              <Clock
                className={cn(
                  "size-3.5 sm:size-4 shrink-0",
                  remainingMs < 60_000
                    ? "text-destructive"
                    : remainingMs < 300_000
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-primary"
                )}
              />
              <span className="font-mono tracking-tight font-extrabold">
                {formatRemaining(remainingMs)}
              </span>
              <span
                className={cn(
                  "size-1.5 rounded-full shrink-0",
                  remainingMs < 60_000
                    ? "bg-destructive animate-ping"
                    : remainingMs < 300_000
                    ? "bg-amber-500 animate-pulse"
                    : "bg-emerald-500 animate-pulse"
                )}
              />
            </div>

            {/* Finish & Submit Action Button */}
            <Button
              type="button"
              disabled={submitting || disabled}
              onClick={() => setSubmitDialogOpen(true)}
              size="sm"
              className="h-8.5 sm:h-9 px-3.5 sm:px-4 rounded-xl font-bold shadow-xs hover:shadow-sm active:scale-95 transition-all text-xs sm:text-sm cursor-pointer gap-1.5 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? (
                <Spinner className="size-3.5" />
              ) : (
                <Send className="size-3.5" />
              )}
              <span className="hidden xs:inline">Finish &amp; Submit</span>
              <span className="xs:hidden">Submit</span>
            </Button>
          </div>
        </div>

        {/* ================= COMPACT EXAM PROGRESS ================= */}
        <div className="w-full border-t border-border/40 bg-muted/20 px-4 sm:px-6 py-2 sm:py-1.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#172B2B] dark:text-foreground text-[13px] sm:text-xs">
                {answeredCount} of {questions.length} questions completed
              </span>
              <span className="text-muted-foreground font-medium hidden sm:inline">
                ({progressPercent}%)
              </span>
            </div>

            {markedCount > 0 && (
              <span className="text-xs sm:text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Flag className="size-3 fill-amber-500 text-amber-500" />
                <span>{markedCount} marked for review</span>
              </span>
            )}
          </div>

          {/* Thin Progress Line */}
          <div className="max-w-4xl mx-auto h-1 w-full rounded-full bg-muted/70 overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* ================= MAIN EXAMINATION QUESTION LIST ================= */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Official Institutional Assessment Session Card - Profile style gradient */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs transition-all">
          {/* Soft subtle ambient bloom */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 size-60 rounded-full bg-primary/[0.08] blur-3xl dark:bg-primary/[0.12]"
          />
          {/* Subtle Radiant Top Accent Hairline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />

          <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
            <div className="relative size-12 sm:size-14 rounded-full shrink-0 ring-2 ring-primary/25 dark:ring-primary/35 p-0.5 bg-white dark:bg-card shadow-2xs">
              <Image
                src={logoUrl || "/images/bcs-bank-logo-512.png"}
                alt="BCS & Bank Aspirants"
                width={52}
                height={52}
                priority
                className="size-full object-contain rounded-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                  BCS &amp; Bank Aspirants Examination Hall
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border-0 uppercase tracking-wide">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Assessment
                </span>
                {typeof negativeMarks === "number" && negativeMarks > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    Negative Marking: -{negativeMarks} / wrong
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted/60 text-muted-foreground border border-border/60">
                    No Negative Marking
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium line-clamp-1">
                Answer all {questions.length} questions carefully.
              </p>
            </div>
          </div>
        </div>

        {questions.map((q, i) => {
          const a = answers[q.examQuestionId]
          const selectedOption = a?.selectedOption ?? q.selectedOption
          const isMarked = a?.isMarkedForReview ?? q.isMarkedForReview
          const isAnswered = selectedOption !== null

          return (
            <Card
              key={q.examQuestionId}
              id={`question-card-${q.examQuestionId}`}
              className={cn(
                "relative rounded-2xl border bg-card p-0 gap-0 shadow-2xs hover:shadow-xs transition-all overflow-hidden scroll-mt-24",
                isMarked
                  ? "border-amber-500/50 dark:border-amber-500/40 ring-1 ring-amber-500/25"
                  : isAnswered
                  ? "border-primary/40 dark:border-primary/30"
                  : "border-border/70"
              )}
            >
              {/* Card Header: QUESTION NUMBER + MARKS + STATUS */}
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="font-mono text-[13px] sm:text-sm font-extrabold tracking-wider text-muted-foreground uppercase">
                    QUESTION {formatQuestionIndex(i)}
                  </span>
                  <Badge
                    variant="outline"
                    className="rounded-full text-[11px] sm:text-[11px] font-semibold border-border/70 bg-card px-2 py-0.5 shadow-2xs text-muted-foreground"
                  >
                    {q.marks} {q.marks === 1 ? "MARK" : "MARKS"}
                  </Badge>
                  {typeof q.negativeMarks === "number" && q.negativeMarks > 0 ? (
                    <Badge
                      variant="outline"
                      className="rounded-full text-[11px] sm:text-[11px] font-semibold border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 shadow-2xs"
                    >
                      -{q.negativeMarks} neg.
                    </Badge>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isMarked ? (
                    <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 gap-1 rounded-full text-xs sm:text-[11px] font-semibold px-2.5 py-0.5 shadow-2xs">
                      <Flag className="size-3 fill-amber-500 text-amber-500" />
                      <span>Review</span>
                    </Badge>
                  ) : isAnswered ? (
                    <Badge className="bg-primary/10 text-primary border-primary/25 gap-1 rounded-full text-xs sm:text-[11px] font-semibold px-2.5 py-0.5 shadow-2xs">
                      <Check className="size-3 stroke-[2.5]" />
                      <span>Answered</span>
                    </Badge>
                  ) : (
                    <span className="text-xs sm:text-[11px] font-medium text-muted-foreground/70">
                      Unanswered
                    </span>
                  )}
                </div>
              </div>

              {/* Card Content: Question Text & Answer Options */}
              <div className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
                {/* Question Statement */}
                <div className="text-[17.5px] sm:text-lg font-bold text-[#172B2B] dark:text-foreground leading-relaxed tracking-tight wrap-anywhere font-bengali">
                  <LatexText
                    text={q.questionText}
                    className="min-w-0 [&_.katex-display]:overflow-x-auto"
                  />
                </div>

                {/* Single-Column Answer Options */}
                <div
                  role="radiogroup"
                  aria-label={`Options for Question ${i + 1}`}
                  className="space-y-2.5 sm:space-y-3"
                >
                  {q.optionOrder.map((option, slot) => {
                    const selected = selectedOption === option
                    const optionLabel = `Option ${String.fromCharCode(65 + slot)}`

                    return (
                      <div
                        key={option}
                        role="radio"
                        aria-checked={selected}
                        tabIndex={0}
                        onClick={() => selectOption(q.examQuestionId, option)}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.preventDefault()
                            selectOption(q.examQuestionId, option)
                          }
                        }}
                        className={cn(
                          "group relative flex min-h-[3.5rem] sm:min-h-[4rem] w-full cursor-pointer items-center justify-between gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border p-3.5 sm:p-4.5 text-left transition-all duration-150 select-none shadow-2xs active:scale-[0.995]",
                          selected
                            ? "border-primary bg-primary/[0.08] dark:bg-primary/[0.16] text-[#172B2B] dark:text-foreground ring-1 ring-primary/30 shadow-xs font-semibold"
                            : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30 text-[#172B2B] dark:text-foreground",
                          disabled && "cursor-not-allowed opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                          {/* Circular Radio Indicator */}
                          <div
                            className={cn(
                              "size-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-150",
                              selected
                                ? "border-2 border-primary bg-primary text-primary-foreground shadow-2xs"
                                : "border-2 border-border/80 group-hover:border-primary/60 bg-background"
                            )}
                          >
                            {selected ? (
                              <span className="size-2 rounded-full bg-white shadow-2xs" />
                            ) : null}
                          </div>

                          {/* Option Prefix & Text */}
                          <div className="min-w-0 flex-1 flex items-baseline gap-2 text-[15px] sm:text-base leading-relaxed font-bengali wrap-anywhere">
                            <span className="font-bold text-muted-foreground shrink-0 select-none hidden sm:inline">
                              {optionLabel} —
                            </span>
                            <span className="font-bold text-muted-foreground shrink-0 select-none sm:hidden text-[15px]">
                              {String.fromCharCode(65 + slot)}.
                            </span>
                            <span className="font-normal text-[#172B2B] dark:text-foreground text-[15px] sm:text-base">
                              <LatexText
                                text={q.optionText[option]}
                                className="min-w-0 [&_.katex-display]:overflow-x-auto"
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Question Card Footer: Mark for Review & Clear selection */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                  <Button
                    type="button"
                    size="sm"
                    variant={isMarked ? "default" : "outline"}
                    onClick={() => toggleReview(q.examQuestionId)}
                    disabled={disabled}
                    className={cn(
                      "h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0",
                      isMarked
                        ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                        : "border-border/70 text-muted-foreground hover:text-foreground hover:border-amber-500/40 hover:bg-amber-500/5"
                    )}
                  >
                    <Flag className={cn("size-3.5 shrink-0", isMarked ? "fill-white" : "")} />
                    <span className="hidden xs:inline">{isMarked ? "Marked for Review" : "Mark for Review"}</span>
                    <span className="xs:hidden">{isMarked ? "Marked" : "Review"}</span>
                  </Button>

                  {isAnswered && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => clearSelection(q.examQuestionId)}
                      disabled={disabled}
                      className="h-8 px-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer gap-1.5"
                    >
                      <RotateCcw className="size-3" />
                      <span>Clear choice</span>
                    </Button>
                  )}
                </div>

                {/* Offline autosave notice if specific question failed */}
                {a?.syncStatus === "error" && (
                  <Alert variant="destructive" className="rounded-xl border-destructive/30 p-2.5 mt-2">
                    <AlertDescription className="text-xs">
                      Answer cached locally. Network retry in progress...
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
          )
        })}

        {/* Bottom spacing for floating progress bar */}
        <div className="pb-20 sm:pb-24" />
      </main>

      {/* ================= FLOATING SUBTLE EXAM PROGRESS ================= */}
      <div className="fixed bottom-4 sm:bottom-6 inset-x-0 mx-auto w-fit z-30 pointer-events-none px-4">
        <div className="pointer-events-auto rounded-full border border-border/80 bg-white/95 dark:bg-card/95 backdrop-blur-md px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-lg flex items-center gap-2.5 sm:gap-3.5 text-xs text-foreground transition-all duration-200">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span>
              {answeredCount}/{questions.length} answered
            </span>
            <span className="text-muted-foreground font-medium hidden xs:inline">
              ({progressPercent}%)
            </span>
          </div>

          {unansweredCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={jumpToNextUnanswered}
              className="h-7 px-2.5 rounded-full text-xs font-semibold text-primary hover:bg-primary/10 gap-1 cursor-pointer"
              title="Jump to next unanswered question"
            >
              <span>Next Unanswered</span>
              <ChevronDown className="size-3.5" />
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => setSubmitDialogOpen(true)}
            disabled={submitting || disabled}
            className="h-7.5 px-3.5 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs cursor-pointer gap-1"
          >
            <span>Submit</span>
            <Send className="size-3" />
          </Button>
        </div>
      </div>

      {/* ================= FINISH & SUBMIT CONFIRMATION MODAL ================= */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-lg md:max-w-xl max-h-[90dvh] flex flex-col p-0 gap-0 rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-2xl overflow-hidden focus:outline-none"
        >
          {/* Soft Ambient System Gradient Bloom - Light & Clean (following profile-hero design) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/[0.08] blur-3xl dark:bg-primary/[0.12]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 inset-x-0 h-44 bg-gradient-to-b from-primary/[0.08] via-emerald-500/[0.03] to-transparent blur-2xl"
          />

          {/* Subtle Radiant Top Accent Hairline (replaces harsh solid border) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent z-20"
          />

          {/* Modal Header */}
          <DialogHeader className="relative z-10 p-4.5 sm:p-6 pb-3.5 sm:pb-4 border-b border-border/50 bg-gradient-to-b from-primary/[0.06] via-muted/15 to-transparent shrink-0 text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="relative size-13 sm:size-15 shrink-0 select-none flex items-center justify-center">
                  <Image
                    src={logoUrl || "/images/bcs-bank-logo-512.png"}
                    alt="BCS & Bank Aspirants"
                    width={60}
                    height={60}
                    className="size-full object-contain drop-shadow-2xs"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="font-heading text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground leading-snug">
                      Finish &amp; Submit Examination
                    </DialogTitle>
                    <Badge
                      variant="outline"
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase border-0 bg-primary/10 text-primary shrink-0"
                    >
                      Final Step
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-1 truncate" title={examTitle}>
                    <span className="text-primary font-bold">BCS &amp; Bank Aspirants</span>
                    <span className="text-muted-foreground/40 mx-1.5">•</span>
                    <span>{examTitle}</span>
                  </p>
                </div>
              </div>

              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer shrink-0 transition-all active:scale-95"
                >
                  <X className="size-4.5" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
            <DialogDescription className="sr-only">
              Please review your completion status before final confirmation. Once submitted, your answers cannot be altered and will be graded immediately.
            </DialogDescription>
          </DialogHeader>

          {/* Modal Content Body */}
          <div className="relative z-10 p-4.5 sm:p-6 space-y-4 sm:space-y-4.5 overflow-y-auto flex-1 text-left min-h-0">
            {/* Instruction description card - Larger text on mobile for clarity */}
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 sm:p-4 text-sm sm:text-base text-foreground/85 leading-relaxed">
              <p className="font-medium">
                Please review your question completion summary before confirming. Once submitted, your answers cannot be altered and will be graded immediately.
              </p>
            </div>

            {/* Metric Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
              {/* Total Questions */}
              <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card text-center shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Total
                </span>
                <span className="font-heading text-2xl sm:text-3xl font-black text-foreground">
                  {questions.length}
                </span>
              </div>

              {/* Answered */}
              <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-500/10 text-center shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Answered</span>
                </div>
                <span className="font-heading text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {answeredCount}
                </span>
              </div>

              {/* Unanswered */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border text-center shadow-2xs transition-all",
                  unansweredCount > 0
                    ? "border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15"
                    : "border-border/70 bg-card"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1",
                    unansweredCount > 0
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-muted-foreground"
                  )}
                >
                  <HelpCircle className="size-3.5" />
                  <span>Unanswered</span>
                </div>
                <span
                  className={cn(
                    "font-heading text-2xl sm:text-3xl font-black",
                    unansweredCount > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-foreground"
                  )}
                >
                  {unansweredCount}
                </span>
              </div>

              {/* Marked for Review */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border text-center shadow-2xs transition-all",
                  markedCount > 0
                    ? "border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15"
                    : "border-border/70 bg-card"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1",
                    markedCount > 0
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-muted-foreground"
                  )}
                >
                  <Flag className="size-3.5" />
                  <span>Review</span>
                </div>
                <span
                  className={cn(
                    "font-heading text-2xl sm:text-3xl font-black",
                    markedCount > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground"
                  )}
                >
                  {markedCount}
                </span>
              </div>
            </div>

            {/* Negative Marking Active Notice */}
            {typeof negativeMarks === "number" && negativeMarks > 0 && (
              <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border border-destructive/25 bg-destructive/5 dark:bg-destructive/10 text-foreground shadow-2xs">
                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm sm:text-base font-bold text-destructive">
                    Negative Marking Policy Active
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                    Each incorrect answer deducts <strong>{negativeMarks} mark{negativeMarks === 1 ? "" : "s"}</strong>. Unanswered questions receive 0 marks.
                  </p>
                </div>
              </div>
            )}

            {/* Unanswered Questions Warning Callout */}
            {unansweredCount > 0 && (
              <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 text-foreground shadow-2xs">
                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm sm:text-base font-bold text-amber-800 dark:text-amber-300">
                    You have {unansweredCount} unanswered {unansweredCount === 1 ? "question" : "questions"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                    Unanswered questions receive zero marks. You can continue the examination to answer them before submitting.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Action Footer */}
          <DialogFooter className="relative z-10 p-4 sm:p-5 bg-muted/20 border-t border-border/60 flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-2.5 sm:gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => setSubmitDialogOpen(false)}
              className="w-full sm:w-auto h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl font-semibold border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all active:scale-98 text-sm sm:text-base"
            >
              Continue Examination
            </Button>
            <Button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-7 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-2xs hover:shadow-xs active:scale-98 transition-all text-sm sm:text-base gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Spinner className="size-4" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4.5" />
                  <span>Confirm &amp; Submit</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
