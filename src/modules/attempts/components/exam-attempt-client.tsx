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
      if (["A", "B", "C", "D"].includes(key)) {
        const slot = ["A", "B", "C", "D"].indexOf(key)
        const option = current.optionOrder[slot]
        if (option) selectOption(option)
      } else if (key === "R") {
        toggleReview()
      } else if (key === "N" && index < questions.length - 1) {
        setIndex((i) => i + 1)
      } else if (key === "P" && index > 0) {
        setIndex((i) => i - 1)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, disabled, index, questions.length])

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      {/* ================= TOP HEADER STRIP ================= */}
      <header className="space-y-4 pb-4 sm:pb-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground wrap-anywhere">
                {examTitle}
              </h1>
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground border-border/70 bg-card"
              >
                {answeredCount} of {questions.length} answered ({progressPercent}%)
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-auto">
            {/* Live Countdown Badge */}
            <div
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border font-mono text-xs sm:text-sm font-bold shadow-2xs transition-colors",
                remainingMs < 60_000
                  ? "border-destructive/40 bg-destructive/10 text-destructive animate-pulse"
                  : remainingMs < 300_000
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-border/70 bg-card text-foreground"
              )}
            >
              <Clock
                className={cn(
                  "size-4 shrink-0",
                  remainingMs < 60_000
                    ? "text-destructive"
                    : remainingMs < 300_000
                    ? "text-amber-600"
                    : "text-primary"
                )}
              />
              <span>{formatRemaining(remainingMs)}</span>
            </div>

            {/* Finish & Submit with Confirmation Dialog */}
            <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={submitting || disabled}
                  size="lg"
                  className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
                >
                  {submitting ? (
                    <Spinner className="mr-2" />
                  ) : (
                    <Send className="mr-2 size-4" />
                  )}
                  <span>Finish &amp; Submit</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading text-lg sm:text-xl font-bold">
                    Ready to Submit Your Exam?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground">
                    Please review your answered status before final submission. Once submitted, your answers cannot be altered and will be graded immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid grid-cols-3 gap-2.5 my-2 p-3.5 rounded-xl bg-muted/40 border border-border/60 text-center">
                  <div className="space-y-0.5">
                    <span className="text-xl font-extrabold text-foreground">{questions.length}</span>
                    <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{answeredCount}</span>
                    <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Answered</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                      {questions.length - answeredCount}
                    </span>
                    <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Unanswered</p>
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

                <AlertDialogFooter className="gap-2 sm:gap-2">
                  <AlertDialogCancel className="rounded-xl cursor-pointer">
                    Continue Exam
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setSubmitDialogOpen(false)
                      submit()
                    }}
                    disabled={submitting}
                    className="rounded-xl bg-primary text-primary-foreground font-bold cursor-pointer"
                  >
                    {submitting ? "Submitting..." : "Yes, Submit Exam"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Live Animated Progress Bar */}
        <div className="w-full space-y-1">
          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* ================= QUESTION NUMBER NAVIGATION STRIP ================= */}
      <nav
        aria-label="Question navigator"
        className="rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4.5 shadow-xs overflow-hidden"
      >
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/50 text-xs font-semibold text-muted-foreground">
          <span className="text-foreground font-bold">Question Navigator</span>
          <span className="text-[11px] text-muted-foreground">Click any number to jump</span>
        </div>

        <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
          {questions.map((q, i) => {
            const a = answers[q.examQuestionId]
            const isAnswered = (a?.selectedOption ?? q.selectedOption) !== null
            const isMarked = a?.isMarkedForReview ?? q.isMarkedForReview
            const isCurrent = i === index

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
                  "relative size-9 sm:size-10 p-0 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95",
                  // Current Question Focus
                  isCurrent && "ring-2 ring-offset-2 ring-offset-background ring-primary scale-105 font-black z-10",
                  // Marked for Review State
                  isMarked
                    ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-300"
                    : isAnswered
                    // Answered State (Solid filled primary badge!)
                    ? "border-primary bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground"
                    // Unanswered State
                    : "border-border/70 bg-card text-muted-foreground hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span>{i + 1}</span>
                {isMarked && (
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-background" />
                )}
              </Button>
            )
          })}
        </div>

        {/* Navigator Status Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-3 mt-3 border-t border-border/50 text-[11px] sm:text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-md border-2 border-primary bg-primary/20" />
            <span>Current Question</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-md border border-amber-500 bg-amber-500/30" />
            <span>Review Flagged ({markedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-md border border-border/80 bg-card" />
            <span>Unanswered ({questions.length - answeredCount})</span>
          </div>
        </div>
      </nav>

      {/* ================= MAIN ACTIVE QUESTION CARD ================= */}
      <Card
        className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden"
        aria-live="polite"
      >
        <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="size-8 sm:size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-2xs ring-1 ring-primary/20 shrink-0">
              {index + 1}
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              Question {index + 1} of {questions.length}
            </span>
            <Badge
              variant="outline"
              className="rounded-full text-[11px] font-semibold border-border/70 bg-card px-2.5 py-0.5"
            >
              {current.marks} {current.marks === 1 ? "Mark" : "Marks"}
            </Badge>
            {currentAnswer.selectedOption ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 rounded-full text-[11px] font-semibold px-2.5 py-0.5">
                <Check className="size-3" />
                <span>Answered</span>
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="rounded-full text-[11px] font-medium text-muted-foreground border-border/70 px-2.5 py-0.5"
              >
                Unanswered
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
                className="h-8 px-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
              >
                <RotateCcw className="size-3 mr-1" />
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
                "h-8 sm:h-8.5 px-3 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer",
                currentAnswer.isMarkedForReview
                  ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                  : "border-border/70 text-muted-foreground hover:text-foreground"
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

        <CardContent className="p-4 sm:p-6 lg:p-7 space-y-6">
          {/* Question Text */}
          <div className="text-base sm:text-lg lg:text-xl leading-relaxed font-bold text-foreground wrap-anywhere">
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
                      "group relative flex min-h-14 sm:min-h-16 w-full cursor-pointer items-center justify-between gap-3.5 rounded-2xl border p-4 sm:p-5 text-left text-xs sm:text-sm leading-relaxed transition-all duration-150 select-none shadow-2xs active:scale-[0.99]",
                      // Solid, vibrant, unmistakable selected state with color fill!
                      selected
                        ? "border-primary bg-primary/10 dark:bg-primary/20 text-foreground ring-2 ring-primary/30 shadow-xs font-semibold"
                        : "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/40 hover:shadow-xs text-foreground",
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Option Letter Pill */}
                      <span
                        className={cn(
                          "size-7 sm:size-8.5 rounded-xl flex items-center justify-center font-extrabold text-xs sm:text-sm shrink-0 transition-all duration-150",
                          selected
                            ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30 scale-105"
                            : "bg-muted/80 text-muted-foreground border border-border/80 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30"
                        )}
                      >
                        {String.fromCharCode(65 + slot)}
                      </span>

                      {/* Option Text */}
                      <span className="min-w-0 flex-1 overflow-x-auto wrap-anywhere font-medium text-xs sm:text-sm leading-relaxed">
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
                          "size-5 sm:size-5.5 rounded-full flex items-center justify-center transition-all duration-150",
                          selected
                            ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30"
                            : "border-2 border-border/80 group-hover:border-primary/60 bg-card"
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
          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm shadow-2xs active:scale-95 transition-all gap-1.5 cursor-pointer"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          <ArrowLeft className="size-4" />
          <span>Previous</span>
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <HelpCircle className="size-3.5 text-muted-foreground/70" />
          <span>
            Shortcuts: <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/80 font-mono text-[10px] font-semibold text-foreground">A–D</kbd> select option · <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/80 font-mono text-[10px] font-semibold text-foreground">R</kbd> review · <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/80 font-mono text-[10px] font-semibold text-foreground">N</kbd>/<kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/80 font-mono text-[10px] font-semibold text-foreground">P</kbd> navigate
          </span>
        </div>

        {index < questions.length - 1 ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm shadow-2xs active:scale-95 transition-all gap-1.5 cursor-pointer"
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
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all gap-1.5 cursor-pointer"
          >
            <span>Review &amp; Finish</span>
            <Send className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
