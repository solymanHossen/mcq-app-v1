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
import { LatexText } from "@/components/shared/latex-text"
import { submitAttemptAction } from "@/modules/attempts/actions"
import {
  useAttemptSync,
  type OptionChoice,
} from "@/modules/attempts/use-attempt-sync"
import { useCountdown, formatRemaining } from "@/modules/attempts/use-countdown"
import { useViolationReporting } from "@/modules/proctoring/use-violation-reporting"
import { cn } from "@/lib/utils"
import { Clock, ArrowLeft, ArrowRight, Flag } from "lucide-react"

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
    // A debounced autosave (see use-attempt-sync.ts) could still be
    // waiting to send the student's last click — grading reads whatever is
    // currently stored, so that save must land before submitAttemptAction.
    await flushPending()
    // Best-effort, client-reported, and only ever used for the daily-streak
    // day boundary — never a security- or grading-relevant value. Falls
    // back to the server's own UTC default if unavailable.
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const result = await submitAttemptAction(attemptId, { clientTimezone })
    setSubmitting(false)
    if (result?.status) {
      toast.success(
        result.status === "TIMEOUT" ? "Time's up — submitted" : "Exam submitted"
      )
      setEnded(true)
      // The server component for this same route renders the terminal
      // ("already submitted") view once it sees the attempt is no longer
      // IN_PROGRESS — no separate route needed.
      router.refresh()
    } else if (result && "error" in result) {
      toast.error(result.error)
    }
  }, [attemptId, router, flushPending])

  const remainingMs = useCountdown(deadline, () => {
    if (!ended) submit()
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

  function selectOption(option: OptionChoice) {
    if (disabled) return
    update(current.examQuestionId, { selectedOption: option })
  }

  function toggleReview() {
    if (disabled) return
    update(current.examQuestionId, {
      isMarkedForReview: !currentAnswer.isMarkedForReview,
    })
  }

  // Letter/number shortcuts only — arrow keys are left to the browser/radio
  // controls so the two navigation schemes never fight over the same key.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (disabled) return
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
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground wrap-anywhere">
              {examTitle}
            </h1>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
            >
              {answeredCount} of {questions.length} answered
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {/* Live Countdown Badge */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border font-mono text-xs sm:text-sm font-bold shadow-2xs transition-colors",
              remainingMs < 60_000
                ? "border-destructive/40 bg-destructive/10 text-destructive animate-pulse"
                : "border-border/70 bg-card text-foreground"
            )}
          >
            <Clock className={cn("size-4 shrink-0", remainingMs < 60_000 ? "text-destructive" : "text-blue-500")} />
            <span>{formatRemaining(remainingMs)}</span>
          </div>

          <Button
            onClick={submit}
            disabled={submitting || disabled}
            size="lg"
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
          >
            {submitting && <Spinner className="mr-2" />}
            <span>Finish &amp; Submit</span>
          </Button>
        </div>
      </header>

      {/* Question Number Navigation Strip */}
      <nav
        aria-label="Question navigator"
        className="rounded-2xl border border-border/70 bg-card p-3 sm:p-4 shadow-xs overflow-hidden"
      >
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/50 text-xs font-medium text-muted-foreground">
          <span>Question Navigation</span>
          <span className="text-[11px]">Click any number to jump</span>
        </div>
        <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
          {questions.map((q, i) => {
            const a = answers[q.examQuestionId]
            const isAnswered = (a?.selectedOption ?? q.selectedOption) !== null
            const isMarked = a?.isMarkedForReview ?? q.isMarkedForReview
            return (
              <Button
                key={q.examQuestionId}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIndex(i)}
                aria-current={i === index}
                aria-label={`Question ${i + 1}${isAnswered ? ", answered" : ", unanswered"}${isMarked ? ", marked for review" : ""}`}
                className={cn(
                  "size-8.5 sm:size-9.5 p-0 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95",
                  i === index && "border-primary ring-2 ring-primary/20 bg-primary/10 text-primary font-extrabold",
                  isMarked
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : isAnswered
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground"
                )}
              >
                {i + 1}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Main Active Question Card */}
      <Card
        className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden"
        aria-live="polite"
      >
        <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="size-8 sm:size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-2xs ring-1 ring-primary/20 shrink-0">
              {index + 1}
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              Question {index + 1} of {questions.length} · {current.marks} mark{current.marks === 1 ? "" : "s"}
            </span>
          </div>

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
            <Flag className="size-3.5" />
            <span>{currentAnswer.isMarkedForReview ? "Marked for Review" : "Mark for Review"}</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 lg:p-7 space-y-6">
          <div className="text-sm sm:text-base leading-relaxed font-semibold text-foreground wrap-anywhere">
            <LatexText
              text={current.questionText}
              className="min-w-0 [&_.katex-display]:overflow-x-auto"
            />
          </div>

          <RadioGroup
            key={current.examQuestionId}
            value={currentAnswer.selectedOption ?? ""}
            onValueChange={(value) => selectOption(value as OptionChoice)}
            disabled={disabled}
            aria-label={`Options for question ${index + 1}`}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
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
                      "flex min-h-12 sm:min-h-14 w-full cursor-pointer items-start gap-3 rounded-xl border p-3.5 sm:p-4 text-left text-xs sm:text-sm leading-relaxed transition-all select-none shadow-2xs active:scale-[0.99]",
                      selected
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary font-semibold"
                        : "border-border/70 bg-card hover:bg-muted/30 text-foreground",
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <span
                      className={cn(
                        "size-6 sm:size-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                        selected
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {String.fromCharCode(65 + slot)}
                    </span>
                    <span className="min-w-0 flex-1 overflow-x-auto wrap-anywhere pt-0.5">
                      <LatexText
                        text={current.optionText[option]}
                        className="min-w-0 [&_.katex-display]:overflow-x-auto"
                      />
                    </span>
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

      {/* Prev / Next Bottom Action Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm shadow-2xs active:scale-95 transition-all gap-1.5"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          <ArrowLeft className="size-4" />
          <span>Previous</span>
        </Button>

        <p className="hidden sm:block text-center text-xs text-muted-foreground font-medium">
          Shortcuts: A–D select option, R marks review, N/P changes question
        </p>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm shadow-2xs active:scale-95 transition-all gap-1.5"
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          <span>Next</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
