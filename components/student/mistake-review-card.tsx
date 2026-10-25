"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { SparklesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { LatexText } from "@/components/latex-text"
import { BookmarkButton } from "@/components/student/bookmark-button"
import { submitMistakeReviewAction } from "@/actions/learning.actions"
import { getExplanationAction } from "@/actions/ai.actions"
import { cn } from "@/lib/utils"

type OptionChoice = "A" | "B" | "C" | "D"

export function MistakeReviewCard({
  examQuestionId,
  questionText,
  options,
  examTitle,
  answerKeyReleased,
  bookmarked,
}: {
  examQuestionId: string
  questionText: string
  options: Record<OptionChoice, string>
  examTitle: string
  answerKeyReleased: boolean
  bookmarked: boolean
}) {
  const [selected, setSelected] = useState<OptionChoice | null>(null)
  const [outcome, setOutcome] = useState<{ correct: boolean; correctOption: OptionChoice } | null>(
    null
  )
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isExplaining, startExplaining] = useTransition()
  // Stable across retries of this one submission — the idempotency key for
  // the review's XP award (see lib/learning/xp.ts).
  const [reviewEventId] = useState(() => crypto.randomUUID())

  function submit() {
    if (!selected) return
    startTransition(async () => {
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const result = await submitMistakeReviewAction({
        examQuestionId,
        selectedOption: selected,
        reviewEventId,
        clientTimezone,
      })
      if (result && "error" in result) {
        toast.error(result.error)
        return
      }
      if (result?.success) {
        setOutcome({ correct: result.correct, correctOption: result.correctOption })
        if (result.correct) toast.success("Correct! +15 XP")
      }
    })
  }

  function explain() {
    startExplaining(async () => {
      const result = await getExplanationAction({ examQuestionId })
      if (result && "error" in result) {
        toast.error(result.error)
        return
      }
      if (result && "content" in result) setExplanation(result.content)
    })
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{examTitle}</p>
        <BookmarkButton examQuestionId={examQuestionId} initialBookmarked={bookmarked} />
      </div>

      <LatexText text={questionText} className="font-medium" />

      {!answerKeyReleased ? (
        <p className="text-sm text-muted-foreground">
          Your teacher hasn&apos;t released the answer key for this exam yet — check
          back once results are finalized to review this question.
        </p>
      ) : (
        <>
          <div role="radiogroup" aria-label="Select an answer" className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(options) as OptionChoice[]).map((option) => {
              const isSelected = selected === option
              const isCorrectChoice = outcome && option === outcome.correctOption
              const isWrongChoice = outcome && isSelected && !outcome.correct
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!!outcome || isPending}
                  onClick={() => setSelected(option)}
                  className={cn(
                    "flex items-start gap-2 rounded-md border p-3 text-left text-sm transition-colors",
                    isSelected && !outcome && "border-primary bg-primary/5 font-medium",
                    isCorrectChoice && "border-green-600 bg-green-50 dark:bg-green-950",
                    isWrongChoice && "border-destructive bg-destructive/5",
                    !outcome && !isSelected && "hover:bg-muted"
                  )}
                >
                  <span className="text-muted-foreground">{option}.</span>
                  <LatexText text={options[option]} />
                </button>
              )
            })}
          </div>

          {!outcome ? (
            <Button type="button" size="sm" onClick={submit} disabled={!selected || isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              Check answer
            </Button>
          ) : (
            <div className="space-y-2">
              <Badge variant={outcome.correct ? "default" : "destructive"}>
                {outcome.correct ? "Correct" : `Incorrect — correct answer is ${outcome.correctOption}`}
              </Badge>

              {!explanation && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={explain}
                  disabled={isExplaining}
                >
                  {isExplaining ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <SparklesIcon data-icon="inline-start" className="size-3.5" />
                  )}
                  Explain with AI
                </Button>
              )}
              {explanation && (
                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  {explanation}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
