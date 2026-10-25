"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
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
    () => Object.values(answers).filter((a) => a.selectedOption !== null).length,
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
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div>
          <h1 className="font-semibold">{examTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {answeredCount} of {questions.length} answered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={remainingMs < 60_000 ? "destructive" : "secondary"}
            className="font-mono text-sm"
          >
            {formatRemaining(remainingMs)}
          </Badge>
          <Button onClick={submit} disabled={submitting || disabled} size="sm">
            {submitting && <Spinner data-icon="inline-start" />}
            Submit
          </Button>
        </div>
      </header>

      <nav
        aria-label="Question navigator"
        className="flex flex-wrap gap-2"
      >
        {questions.map((q, i) => {
          const a = answers[q.examQuestionId]
          const isAnswered = (a?.selectedOption ?? q.selectedOption) !== null
          const isMarked = a?.isMarkedForReview ?? q.isMarkedForReview
          return (
            <button
              key={q.examQuestionId}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index}
              aria-label={`Question ${i + 1}${isAnswered ? ", answered" : ", unanswered"}${isMarked ? ", marked for review" : ""}`}
              className={cn(
                "flex size-9 items-center justify-center rounded-md border text-sm font-medium",
                i === index && "ring-2 ring-primary ring-offset-1",
                isMarked
                  ? "border-amber-500 bg-amber-100 dark:bg-amber-950"
                  : isAnswered
                    ? "border-primary bg-primary/10"
                    : "bg-muted"
              )}
            >
              {i + 1}
            </button>
          )
        })}
      </nav>

      <section className="space-y-4 rounded-md border p-4" aria-live="polite">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Question {index + 1} of {questions.length} · {current.marks} mark
            {current.marks === 1 ? "" : "s"}
          </p>
          <Button
            type="button"
            size="sm"
            variant={currentAnswer.isMarkedForReview ? "default" : "outline"}
            onClick={toggleReview}
            disabled={disabled}
          >
            {currentAnswer.isMarkedForReview ? "Marked for review" : "Mark for review"}
          </Button>
        </div>

        <LatexText text={current.questionText} className="font-medium" />

        <div
          role="radiogroup"
          aria-label={`Options for question ${index + 1}`}
          className="grid gap-2 sm:grid-cols-2"
        >
          {current.optionOrder.map((option, slot) => {
            const selected = currentAnswer.selectedOption === option
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => selectOption(option)}
                className={cn(
                  "flex items-start gap-2 rounded-md border p-3 text-left text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary/5 font-medium"
                    : "hover:bg-muted",
                  disabled && "opacity-60"
                )}
              >
                <span className="text-muted-foreground">
                  {String.fromCharCode(65 + slot)}.
                </span>
                <LatexText text={current.optionText[option]} />
              </button>
            )
          })}
        </div>

        {currentAnswer.syncStatus === "error" && (
          <p className="text-xs text-destructive">
            Couldn&apos;t save — retrying automatically. Your answer is kept on
            this device meanwhile.
          </p>
        )}
        {currentAnswer.syncStatus === "ended" && (
          <p className="text-xs text-destructive">
            This attempt has ended — further changes can&apos;t be saved.
          </p>
        )}
      </section>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Shortcuts: A–D select an option, R marks for review, N/P moves next/previous.
      </p>
    </div>
  )
}
