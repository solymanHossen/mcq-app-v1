"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  ArrowLeft,
  ArrowRight,
  Flag,
  Check,
  RotateCcw,
  AlertTriangle,
  Send,
  HelpCircle,
  Cloud,
  CloudOff,
  RefreshCw,
  Maximize2,
  Minimize2,
} from "lucide-react"

type AttemptQuestion = {
  examQuestionId: string
  questionText: string
  marks: number
  optionOrder: OptionChoice[]
  optionText: Record<OptionChoice, string>
  selectedOption: OptionChoice | null
  isMarkedForReview: boolean
}

export function ExamAttemptClient({
  attemptId,
  examTitle,
  deadline,
  questions,
}: {
  attemptId: string
  examTitle: string
  deadline: string
  questions: AttemptQuestion[]
}) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [ended, setEnded] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [navFilter, setNavFilter] = useState<"all" | "unanswered" | "marked">("all")
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
    // A debounced autosave could still be waiting to send the student's last click
    await flushPending()
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const result = await submitAttemptAction(attemptId, { clientTimezone })
    setSubmitting(false)
    if (result?.status) {
      toast.success(
        result.status === "TIMEOUT" ? "Time's up — submitted" : "Exam submitted successfully"
      )
      setEnded(true)
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

  const current = questions[index]
  const currentAnswer = answers[current.examQuestionId] ?? {
    selectedOption: current.selectedOption,
    isMarkedForReview: current.isMarkedForReview,
    syncStatus: "synced" as const,
  }
  const disabled = ended || currentAnswer.syncStatus === "ended"

  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter((a) => a.selectedOption !== null).length,
    [answers]
  )

  const markedCount = useMemo(
    () =>
      Object.values(answers).filter((a) => a.isMarkedForReview).length,
    [answers]
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

  function selectOption(option: OptionChoice) {
    if (disabled) return
    // Allow toggle to deselect if user clicks the currently selected option
    if (currentAnswer.selectedOption === option) {
      update(current.examQuestionId, { selectedOption: null })
    } else {
      update(current.examQuestionId, { selectedOption: option })
    }
  }

  function clearSelection() {
    if (disabled) return
    update(current.examQuestionId, { selectedOption: null })
  }

  function toggleReview() {
    if (disabled) return
    update(current.examQuestionId, {
      isMarkedForReview: !currentAnswer.isMarkedForReview,
    })
  }

  // Keyboard navigation shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (disabled) return
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return
      const key = e.key.toUpperCase()
      // A-D or 1-4 selection
      if (["A", "B", "C", "D"].includes(key)) {
        const slot = ["A", "B", "C", "D"].indexOf(key)
        const option = current.optionOrder[slot]
        if (option) selectOption(option)
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const slot = parseInt(e.key, 10) - 1
        const option = current.optionOrder[slot]
        if (option) selectOption(option)
      } else if (key === "R") {
        toggleReview()
      } else if ((key === "N" || e.key === "ArrowRight") && index < questions.length - 1) {
        setIndex((i) => i + 1)
      } else if ((key === "P" || e.key === "ArrowLeft") && index > 0) {
        setIndex((i) => i - 1)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, disabled, index, questions.length])

  return (
    <div className="relative w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      {/* Ambient background bloom matching platform visual standard */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 right-8 size-80 rounded-full bg-primary/[0.04] blur-3xl dark:bg-primary/[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-48 -left-12 size-72 rounded-full bg-primary/[0.025] blur-3xl dark:bg-primary/[0.05]"
      />

      {/* ================= TOP STICKY HEADER HUD ================= */}
      <header className="sticky top-0 z-30 space-y-3 pb-3.5 pt-1 bg-background/90 backdrop-blur-md border-b border-border/60 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground wrap-anywhere">
                {examTitle}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-semibold border border-primary/20 bg-primary/5 text-primary flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  <span>{answeredCount} of {questions.length} answered ({progressPercent}%)</span>
                </Badge>

                {/* Real-time Cloud Autosave Sync Status */}
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold shadow-2xs transition-all",
                    syncState === "pending"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : syncState === "error"
                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  )}
                  title={
                    syncState === "pending"
                      ? "Autosaving answer to cloud database..."
                      : syncState === "error"
                      ? "Offline mode: answer stored locally, retrying sync..."
                      : "All answers securely saved in real-time"
                  }
                >
                  {syncState === "pending" ? (
                    <>
                      <RefreshCw className="size-3 text-primary animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : syncState === "error" ? (
                    <>
                      <CloudOff className="size-3 text-destructive" />
                      <span>Offline sync</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="size-3 text-emerald-600 dark:text-emerald-400" />
                      <span>All saved</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-auto">
            {/* Fullscreen Zen Mode Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (Zen Focus Mode)"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (Zen Focus Mode)"}
              className="size-9 sm:size-10 rounded-xl sm:rounded-2xl border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-2xs cursor-pointer shrink-0"
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>

            {/* Live Countdown Badge */}
            <div
              className={cn(
                "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-bold shadow-2xs transition-all",
                remainingMs < 60_000
                  ? "border-destructive/40 bg-destructive/10 text-destructive animate-pulse"
                  : remainingMs < 300_000
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-primary/25 bg-primary/5 text-primary dark:bg-primary/10"
              )}
            >
              <Clock
                className={cn(
                  "size-4 shrink-0",
                  remainingMs < 60_000
                    ? "text-destructive"
                    : remainingMs < 300_000
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-primary"
                )}
              />
              <span className="font-mono tracking-tight font-extrabold">{formatRemaining(remainingMs)}</span>
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

            {/* Finish & Submit with Confirmation Dialog */}
            <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={submitting || disabled}
                  size="lg"
                  className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl font-bold shadow-sm hover:shadow-md active:scale-95 transition-all text-xs sm:text-sm cursor-pointer gap-2"
                >
                  {submitting ? (
                    <Spinner className="mr-1.5" />
                  ) : (
                    <Send className="mr-1.5 size-4" />
                  )}
                  <span>Finish &amp; Submit</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-7 border-border/60">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight">
                    Ready to Submit Your Exam?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Please review your answered status before final submission. Once submitted, your answers cannot be altered and will be graded immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid grid-cols-3 gap-2.5 my-3 p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border/60 text-center">
                  <div className="space-y-0.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-foreground">{questions.length}</span>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Total</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{answeredCount}</span>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Answered</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                      {questions.length - answeredCount}
                    </span>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Unanswered</p>
                  </div>
                </div>

                {questions.length - answeredCount > 0 && (
                  <Alert className="rounded-xl border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                    <AlertDescription className="text-xs leading-relaxed font-medium">
                      You have <strong>{questions.length - answeredCount} unanswered</strong> question(s). Unanswered questions receive zero marks.
                    </AlertDescription>
                  </Alert>
                )}

                <AlertDialogFooter className="gap-2 sm:gap-2.5 pt-2">
                  <AlertDialogCancel className="h-10 sm:h-11 rounded-xl cursor-pointer font-semibold border-border/70">
                    Continue Exam
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setSubmitDialogOpen(false)
                      submit()
                    }}
                    disabled={submitting}
                    className="h-10 sm:h-11 rounded-xl bg-primary text-primary-foreground font-bold cursor-pointer shadow-xs hover:shadow-sm"
                  >
                    {submitting ? "Submitting..." : "Yes, Submit Exam"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Live Animated Progress Bar */}
        <div className="w-full space-y-1 pt-1">
          <div className="h-2 sm:h-2.5 w-full rounded-full bg-muted/60 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/85 transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* ================= QUESTION NUMBER NAVIGATION STRIP ================= */}
      <nav
        aria-label="Question navigator"
        className="relative rounded-2xl sm:rounded-3xl border border-border/60 bg-card/90 backdrop-blur-xs p-4 sm:p-5 shadow-xs overflow-hidden transition-all"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/[0.04] blur-2xl dark:bg-primary/[0.07]"
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 mb-3.5 border-b border-border/50 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-foreground font-bold text-xs sm:text-sm">Question Navigator</span>
            {/* Interactive Filter Pills */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setNavFilter("all")}
                className={cn(
                  "px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                  navFilter === "all"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setNavFilter("unanswered")}
                className={cn(
                  "px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                  navFilter === "unanswered"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Unanswered ({questions.length - answeredCount})
              </button>
              {markedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setNavFilter("marked")}
                  className={cn(
                    "px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    navFilter === "marked"
                      ? "bg-background text-amber-700 dark:text-amber-400 shadow-2xs"
                      : "text-muted-foreground hover:text-amber-600"
                  )}
                >
                  Flagged ({markedCount})
                </button>
              )}
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:inline-block">Click any number to jump</span>
        </div>

        <div className="relative flex min-w-0 flex-wrap gap-2 sm:gap-2.5">
          {questions.map((q, i) => {
            const a = answers[q.examQuestionId]
            const isAnswered = (a?.selectedOption ?? q.selectedOption) !== null
            const isMarked = a?.isMarkedForReview ?? q.isMarkedForReview
            const isCurrent = i === index

            // Highlight & Dim logic according to active filter
            const isDimmed =
              (navFilter === "unanswered" && isAnswered) ||
              (navFilter === "marked" && !isMarked)

            return (
              <Button
                key={q.examQuestionId}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIndex(i)}
                aria-current={isCurrent}
                aria-label={`Question ${i + 1}${isAnswered ? ", answered" : ", unanswered"}${isMarked ? ", marked for review" : ""}`}
                className={cn(
                  "relative size-9 sm:size-10 p-0 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95",
                  isDimmed && "opacity-35 hover:opacity-100 scale-95",
                  // Current Question Focus
                  isCurrent && "ring-2 ring-offset-2 ring-offset-background ring-primary scale-105 font-black z-10 shadow-xs",
                  // Marked for Review State
                  isMarked
                    ? "border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-300 font-extrabold"
                    : isAnswered
                    // Answered State (Solid filled primary badge!)
                    ? "border-primary bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground"
                    // Unanswered State
                    : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span>{i + 1}</span>
                {isMarked && (
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-background shadow-xs" />
                )}
              </Button>
            )
          })}
        </div>

        {/* Navigator Status Legend */}
        <div className="relative flex flex-wrap items-center gap-3 sm:gap-5 pt-3.5 mt-3.5 border-t border-border/50 text-[11px] sm:text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-[9px] font-bold shadow-2xs">
              ✓
            </span>
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-md border-2 border-primary bg-primary/20 shadow-2xs" />
            <span>Current Question</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-md border border-amber-500 bg-amber-500/30 shadow-2xs" />
            <span>Review Flagged ({markedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-md border border-border/80 bg-card shadow-2xs" />
            <span>Unanswered ({questions.length - answeredCount})</span>
          </div>
        </div>
      </nav>

      {/* ================= MAIN ACTIVE QUESTION CARD ================= */}
      <Card
        className={cn(
          "relative rounded-2xl sm:rounded-3xl border bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden",
          currentAnswer.isMarkedForReview
            ? "border-amber-500/50 dark:border-amber-500/40 shadow-[0_0_24px_-8px_rgba(245,158,11,0.22)]"
            : "border-border/60"
        )}
        aria-live="polite"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/[0.04] blur-3xl dark:bg-primary/[0.08]"
        />
        <CardHeader className="relative px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 backdrop-blur-xs flex flex-row items-center justify-between gap-3 space-y-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="size-8.5 sm:size-9.5 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-2xs ring-1 ring-primary/20 shrink-0">
              {index + 1}
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              Question {index + 1} of {questions.length}
            </span>
            <Badge
              variant="outline"
              className="rounded-full text-[11px] font-semibold border-border/70 bg-card px-2.5 py-0.5 shadow-2xs"
            >
              {current.marks} {current.marks === 1 ? "Mark" : "Marks"}
            </Badge>
            {currentAnswer.selectedOption ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 rounded-full text-[11px] font-semibold px-2.5 py-0.5 shadow-2xs">
                <Check className="size-3 stroke-[2.5]" />
                <span>Answered</span>
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="rounded-full text-[11px] font-medium text-muted-foreground border-border/70 px-2.5 py-0.5 shadow-2xs"
              >
                Unanswered
              </Badge>
            )}
            {currentAnswer.isMarkedForReview && (
              <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 gap-1 rounded-full text-[11px] font-semibold px-2.5 py-0.5 shadow-2xs">
                <Flag className="size-3 fill-amber-500 text-amber-500" />
                <span>Marked for Review</span>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentAnswer.selectedOption && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                disabled={disabled}
                className="h-8.5 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer gap-1.5"
              >
                <RotateCcw className="size-3" />
                <span>Clear choice</span>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              variant={currentAnswer.isMarkedForReview ? "default" : "outline"}
              onClick={toggleReview}
              disabled={disabled}
              className={cn(
                "h-8.5 px-3 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer",
                currentAnswer.isMarkedForReview
                  ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                  : "border-border/70 text-muted-foreground hover:text-foreground hover:border-amber-500/40 hover:bg-amber-500/5"
              )}
            >
              <Flag
                className={cn(
                  "size-3.5",
                  currentAnswer.isMarkedForReview ? "fill-white" : ""
                )}
              />
              <span>
                {currentAnswer.isMarkedForReview ? "Marked for Review" : "Mark for Review"}
              </span>
            </Button>
          </div>
        </CardHeader>

        <CardContent key={current.examQuestionId} className="relative p-5 sm:p-7 lg:p-8 space-y-6 sm:space-y-7 animate-in fade-in-50 duration-150 ease-out">
          {/* Question Text */}
          <div className="text-base sm:text-lg lg:text-xl leading-relaxed font-bold text-foreground tracking-tight wrap-anywhere">
            <LatexText
              text={current.questionText}
              className="min-w-0 [&_.katex-display]:overflow-x-auto"
            />
          </div>

          {/* Options Grid */}
          <RadioGroup
            key={current.examQuestionId}
            value={currentAnswer.selectedOption ?? ""}
            onValueChange={(value) => selectOption(value as OptionChoice)}
            disabled={disabled}
            aria-label={`Options for question ${index + 1}`}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4.5"
          >
            {current.optionOrder.map((option, slot) => {
              const selected = currentAnswer.selectedOption === option
              return (
                <div key={option} className="relative min-w-0">
                  <RadioGroupItem
                    id={`${current.examQuestionId}-${option}`}
                    value={option}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`${current.examQuestionId}-${option}`}
                    className={cn(
                      "group relative flex min-h-[4.25rem] sm:min-h-[4.75rem] w-full cursor-pointer items-center justify-between gap-3.5 rounded-2xl border p-4 sm:p-5 text-left text-xs sm:text-sm leading-relaxed transition-all duration-200 select-none shadow-2xs active:scale-[0.99]",
                      // Solid, vibrant, unmistakable selected state with color fill!
                      selected
                        ? "border-primary bg-primary/[0.08] dark:bg-primary/[0.16] text-foreground ring-2 ring-primary/30 shadow-xs font-semibold"
                        : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs text-foreground",
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Option Letter Pill */}
                      <span
                        className={cn(
                          "size-8 sm:size-9 rounded-xl sm:rounded-2xl flex items-center justify-center font-extrabold text-xs sm:text-sm shrink-0 transition-all duration-200",
                          selected
                            ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/25 scale-105"
                            : "bg-muted/70 text-muted-foreground border border-border/70 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30"
                        )}
                      >
                        {String.fromCharCode(65 + slot)}
                      </span>

                      {/* Option Text */}
                      <span className="min-w-0 flex-1 overflow-x-auto wrap-anywhere font-medium text-xs sm:text-sm sm:text-base leading-relaxed">
                        <LatexText
                          text={current.optionText[option]}
                          className="min-w-0 [&_.katex-display]:overflow-x-auto"
                        />
                      </span>
                    </div>

                    {/* Visible Radio / Check Indicator Pill */}
                    <div className="shrink-0 pl-2">
                      <div
                        className={cn(
                          "size-5 sm:size-5.5 rounded-full flex items-center justify-center transition-all duration-200",
                          selected
                            ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/25"
                            : "border-2 border-border/80 group-hover:border-primary/60 bg-background/60"
                        )}
                      >
                        {selected && (
                          <Check className="size-3 sm:size-3.5 stroke-[3] animate-in zoom-in-75 duration-150" />
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>

          {currentAnswer.syncStatus === "error" && (
            <Alert
              variant="destructive"
              className="rounded-2xl border-destructive/30 shadow-xs"
            >
              <AlertDescription className="text-xs sm:text-sm">
                Couldn&apos;t save — retrying automatically. Your answer is kept on this device meanwhile.
              </AlertDescription>
            </Alert>
          )}
          {currentAnswer.syncStatus === "ended" && (
            <Alert
              variant="destructive"
              className="rounded-2xl border-destructive/30 shadow-xs"
            >
              <AlertDescription className="text-xs sm:text-sm">
                This attempt has ended — further changes can&apos;t be saved.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ================= BOTTOM PREV / NEXT ACTION CONTROLS ================= */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm shadow-2xs active:scale-95 transition-all gap-2 cursor-pointer border-border/70 bg-card hover:bg-muted"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          <ArrowLeft className="size-4" />
          <span>Previous</span>
        </Button>

        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground font-medium shadow-2xs">
          <HelpCircle className="size-3.5 text-muted-foreground/70 shrink-0" />
          <span>
            Shortcuts: <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border/80 font-mono text-[10px] font-bold text-foreground shadow-2xs">1–4</kbd> / <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border/80 font-mono text-[10px] font-bold text-foreground shadow-2xs">A–D</kbd> select · <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border/80 font-mono text-[10px] font-bold text-foreground shadow-2xs">←</kbd> <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border/80 font-mono text-[10px] font-bold text-foreground shadow-2xs">→</kbd> navigate · <kbd className="px-1.5 py-0.5 rounded-md bg-card border border-border/80 font-mono text-[10px] font-bold text-foreground shadow-2xs">R</kbd> review
          </span>
        </div>

        {index < questions.length - 1 ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm shadow-2xs active:scale-95 transition-all gap-2 cursor-pointer border-border/70 bg-card hover:bg-muted"
            onClick={() => setIndex((i) => i + 1)}
          >
            <span>Next</span>
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={() => setSubmitDialogOpen(true)}
            className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all gap-2 cursor-pointer bg-primary text-primary-foreground"
          >
            <span>Review &amp; Finish</span>
            <Send className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
