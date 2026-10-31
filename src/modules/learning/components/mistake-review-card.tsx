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
    <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden min-w-0">
      <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-8.5 sm:size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-amber-500/20">
            <Brain className="size-4 sm:size-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Assessment Review
            </span>
            <CardDescription className="text-xs sm:text-sm font-bold text-foreground truncate mt-0.5">
              {examTitle}
            </CardDescription>
          </div>
        </div>
        <BookmarkButton
          examQuestionId={examQuestionId}
          initialBookmarked={bookmarked}
        />
      </CardHeader>

      <CardContent className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
        <FieldSet className="min-w-0 gap-5 sm:gap-6" aria-busy={isPending}>
          <FieldLegend className="mb-0 max-w-full text-sm sm:text-base leading-relaxed font-semibold text-foreground wrap-anywhere [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto">
            <LatexText text={questionText} />
          </FieldLegend>

          {!answerKeyReleased ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Your teacher hasn&apos;t released the answer key for this exam yet — check back once results are finalized to review this question.
            </div>
          ) : (
            <RadioGroup
              value={selected ?? ""}
              onValueChange={(option) => setSelected(option as OptionChoice)}
              disabled={!!outcome || isPending}
              aria-label="Select an answer"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
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
                      "flex h-full w-full min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed transition-all select-none shadow-2xs active:scale-[0.99]",
                      isSelected &&
                        !outcome &&
                        "border-primary bg-primary/5 ring-1 ring-primary font-semibold text-foreground",
                      isCorrectChoice &&
                        "border-emerald-500/60 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500/40",
                      isWrongChoice && "border-destructive/60 bg-destructive/10 text-destructive font-semibold ring-1 ring-destructive/40",
                      !outcome &&
                        !isSelected &&
                        "border-border/70 bg-card hover:bg-muted/30 text-foreground",
                      outcome && "cursor-default",
                      isPending && "cursor-wait"
                    )}
                  >
                    <RadioGroupItem
                      id={optionId}
                      value={option}
                      className="mt-0.5"
                    />
                    <span className="font-bold text-muted-foreground">{option}.</span>
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
            <div className="pt-1">
              <Button
                type="button"
                size="lg"
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
                onClick={submit}
                disabled={!selected || isPending}
              >
                {isPending && <Spinner className="mr-2" />}
                <span>Check Answer</span>
              </Button>
            </div>
          ) : (
            <div
              className="flex min-w-0 flex-col items-start gap-3 sm:gap-4 pt-1"
              aria-live="polite"
            >
              <Badge
                variant={outcome.correct ? "default" : "destructive"}
                className="h-auto min-h-7 max-w-full px-3 py-1 text-left leading-relaxed whitespace-normal rounded-full font-bold text-xs sm:text-sm"
              >
                {outcome.correct
                  ? "✓ Correct Answer! Well done."
                  : `✕ Incorrect — The correct answer is option ${outcome.correctOption}`}
              </Badge>

              {!explanation && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 sm:h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs active:scale-95 transition-all gap-2 cursor-pointer"
                  onClick={explain}
                  disabled={isExplaining}
                >
                  {isExplaining ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Brain className="size-3.5 text-primary" />
                  )}
                  <span>Explain with AI</span>
                </Button>
              )}
              {explanation && (
                <Alert className="rounded-xl border-border/60 bg-muted/20 p-4 leading-relaxed">
                  <AlertDescription className="text-xs sm:text-sm text-foreground whitespace-pre-line">
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
