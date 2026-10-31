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
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      <header className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight wrap-anywhere text-foreground sm:text-3xl lg:text-4xl">
            {examTitle}
          </h1>
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            {answeredCount} of {questions.length} answered
          </p>
        </div>
        <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto">
          <Badge
            variant={remainingMs < 60_000 ? "destructive" : "secondary"}
            className="rounded-full px-3 py-1 font-mono text-sm font-semibold sm:text-base"
          >
            {formatRemaining(remainingMs)}
          </Badge>
          <Button
            onClick={submit}
            disabled={submitting || disabled}
            size="lg"
            className="h-12 rounded-xl font-bold shadow-md sm:h-13 sm:text-lg"
          >
            {submitting && <Spinner data-icon="inline-start" />}
            Submit
          </Button>
        </div>
      </header>

      <nav
        aria-label="Question navigator"
        className="flex min-w-0 flex-wrap gap-2 rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-6"
      >
        {questions.map((q, i) => {
          const a = answers[q.examQuestionId]
          const isAnswered = (a?.selectedOption ?? q.selectedOption) !== null
          const isMarked = a?.isMarkedForReview ?? q.isMarkedForReview
          return (
            <Button
              key={q.examQuestionId}
              type="button"
              variant="outline"
              size="icon-lg"
              onClick={() => setIndex(i)}
              aria-current={i === index}
              aria-label={`Question ${i + 1}${isAnswered ? ", answered" : ", unanswered"}${isMarked ? ", marked for review" : ""}`}
              className={cn(
                "rounded-xl text-sm font-semibold",
                i === index && "border-primary/50 ring-4 ring-primary/15",
                isMarked
                  ? "border-primary/40 bg-secondary text-secondary-foreground"
                  : isAnswered
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/70 bg-muted/20"
              )}
            >
              {i + 1}
            </Button>
          )
        })}
      </nav>

      <Card
        className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs"
        aria-live="polite"
      >
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
          <p className="text-xs font-semibold text-muted-foreground sm:text-sm">
            Question {index + 1} of {questions.length} · {current.marks} mark
            {current.marks === 1 ? "" : "s"}
          </p>
          <Button
            type="button"
            size="sm"
            variant={currentAnswer.isMarkedForReview ? "default" : "outline"}
            onClick={toggleReview}
            disabled={disabled}
            className="h-10 rounded-xl px-3 text-xs font-semibold sm:px-4 sm:text-sm"
          >
            {currentAnswer.isMarkedForReview
              ? "Marked for review"
              : "Mark for review"}
          </Button>
        </CardHeader>

        <CardContent className="flex min-w-0 flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-7">
          <LatexText
            text={current.questionText}
            className="min-w-0 text-sm leading-relaxed font-semibold wrap-anywhere sm:text-base [&_.katex-display]:overflow-x-auto"
          />

          <RadioGroup
            key={current.examQuestionId}
            value={currentAnswer.selectedOption ?? ""}
            onValueChange={(value) => selectOption(value as OptionChoice)}
            disabled={disabled}
            aria-label={`Options for question ${index + 1}`}
            className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4"
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
                      "flex min-h-12 w-full min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 text-left text-sm leading-relaxed transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15 peer-focus-visible:outline-none sm:p-4 sm:text-base",
                      selected
                        ? "border-primary/50 bg-primary/5 font-semibold"
                        : "border-border/70 bg-muted/20 hover:border-input/90 hover:bg-muted/40",
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <span className="shrink-0 font-semibold text-muted-foreground">
                      {String.fromCharCode(65 + slot)}.
                    </span>
                    <LatexText
                      text={current.optionText[option]}
                      className="min-w-0 wrap-anywhere [&_.katex-display]:overflow-x-auto"
                    />
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
              <AlertDescription>
                Couldn&apos;t save — retrying automatically. Your answer is kept
                on this device meanwhile.
              </AlertDescription>
            </Alert>
          )}
          {currentAnswer.syncStatus === "ended" && (
            <Alert
              variant="destructive"
              className="rounded-2xl border-destructive/30 shadow-xs"
            >
              <AlertDescription>
                This attempt has ended — further changes can&apos;t be saved.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1 font-semibold sm:flex-none"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1 font-semibold sm:flex-none"
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Shortcuts: A–D select an option, R marks for review, N/P moves
        next/previous.
      </p>
    </div>
  )
}
