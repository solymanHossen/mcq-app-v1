"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { LatexText } from "@/components/shared/latex-text"
import { BookmarkButton } from "@/modules/learning/components/bookmark-button"
import { submitMistakeReviewAction } from "@/modules/learning/actions"
import { getExplanationAction } from "@/modules/learning/ai-actions"
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
  const [outcome, setOutcome] = useState<{
    correct: boolean
    correctOption: OptionChoice
  } | null>(null)
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
        setOutcome({
          correct: result.correct,
          correctOption: result.correctOption,
        })
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
    <Card className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5 [&_[data-slot=button]]:h-10 [&_[data-slot=button]]:rounded-xl [&_[data-slot=button]]:font-semibold [&_[data-slot=button]]:shadow-2xs">
        <CardDescription className="min-w-0 flex-1 text-xs font-medium wrap-anywhere sm:text-sm">
          {examTitle}
        </CardDescription>
        <BookmarkButton
          examQuestionId={examQuestionId}
          initialBookmarked={bookmarked}
        />
      </CardHeader>

      <CardContent className="flex min-w-0 flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-7">
        <FieldSet className="min-w-0 gap-5 sm:gap-6" aria-busy={isPending}>
          <FieldLegend className="mb-0 max-w-full text-sm leading-relaxed font-semibold wrap-anywhere sm:text-base [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto">
            <LatexText text={questionText} />
          </FieldLegend>

          {!answerKeyReleased ? (
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Your teacher hasn&apos;t released the answer key for this exam yet
              — check back once results are finalized to review this question.
            </p>
          ) : (
            <RadioGroup
              value={selected ?? ""}
              onValueChange={(option) => setSelected(option as OptionChoice)}
              disabled={!!outcome || isPending}
              aria-label="Select an answer"
              className="gap-3 sm:grid-cols-2"
            >
              {(Object.keys(options) as OptionChoice[]).map((option) => {
                const isSelected = selected === option
                const isCorrectChoice =
                  outcome && option === outcome.correctOption
                const isWrongChoice = outcome && isSelected && !outcome.correct
                const optionId = `${examQuestionId}-${option}`

                return (
                  <FieldLabel
                    key={option}
                    htmlFor={optionId}
                    className={cn(
                      "flex h-full w-full min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5 text-sm leading-relaxed font-medium transition-colors sm:p-4",
                      isSelected &&
                        !outcome &&
                        "border-primary/50 bg-primary/5",
                      isCorrectChoice &&
                        "border-emerald-500/40 bg-emerald-500/5",
                      isWrongChoice && "border-destructive/40 bg-destructive/5",
                      !outcome &&
                        !isSelected &&
                        "hover:border-input hover:bg-muted/30",
                      outcome && "cursor-default",
                      isPending && "cursor-wait"
                    )}
                  >
                    <RadioGroupItem
                      id={optionId}
                      value={option}
                      className="mt-1"
                    />
                    <span className="text-muted-foreground">{option}.</span>
                    <span className="min-w-0 flex-1 overflow-x-auto wrap-anywhere">
                      <LatexText text={options[option]} />
                    </span>
                  </FieldLabel>
                )
              })}
            </RadioGroup>
          )}
        </FieldSet>

        {answerKeyReleased &&
          (!outcome ? (
            <Button
              type="button"
              size="lg"
              className="h-12 w-full rounded-xl font-bold shadow-md sm:h-13 sm:w-auto sm:self-start sm:text-lg"
              onClick={submit}
              disabled={!selected || isPending}
            >
              {isPending && <Spinner data-icon="inline-start" />}
              Check answer
            </Button>
          ) : (
            <div
              className="flex min-w-0 flex-col items-start gap-3 sm:gap-4"
              aria-live="polite"
            >
              <Badge
                variant={outcome.correct ? "default" : "destructive"}
                className="h-auto min-h-6 max-w-full px-3 py-1 text-left leading-relaxed whitespace-normal"
              >
                {outcome.correct
                  ? "Correct"
                  : `Incorrect — correct answer is ${outcome.correctOption}`}
              </Badge>

              {!explanation && (
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="w-full font-semibold shadow-2xs sm:w-auto"
                  onClick={explain}
                  disabled={isExplaining}
                >
                  {isExplaining ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <Brain data-icon="inline-start" />
                  )}
                  Explain with AI
                </Button>
              )}
              {explanation && (
                <Alert className="rounded-xl border-border/60 bg-muted/20 p-3.5 sm:p-4">
                  <AlertDescription className="text-xs leading-relaxed wrap-anywhere sm:text-sm">
                    {explanation}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
