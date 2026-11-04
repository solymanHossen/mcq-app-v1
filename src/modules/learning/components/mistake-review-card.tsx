"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  Brain,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  questionNumber,
}: {
  examQuestionId: string
  questionText: string
  options: Record<OptionChoice, string>
  examTitle: string
  answerKeyReleased: boolean
  bookmarked: boolean
  questionNumber?: number
}) {
  const [selected, setSelected] = useState<OptionChoice | null>(null)
  const [outcome, setOutcome] = useState<{
    correct: boolean
    correctOption: OptionChoice
  } | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isExplaining, startExplaining] = useTransition()
  // Stable idempotency key across retries for the review's XP award
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
        if (result.correct) {
          toast.success("Correct Answer! +15 XP earned")
        } else {
          toast.error(`Incorrect. Correct answer is option ${result.correctOption}`)
        }
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
      if (result && "content" in result) {
        setExplanation(result.content)
      }
    })
  }

  return (
    <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden min-w-0">
      {/* ── CARD HEADER (Matching /teacher/exams/new) ── */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="size-9 sm:size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 ring-1 ring-amber-500/20 shadow-2xs">
            <RotateCcw className="size-4 sm:size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Question {questionNumber ? String(questionNumber).padStart(2, "0") : "01"}
              </span>
              <span className="text-muted-foreground/50 hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[180px] sm:max-w-md">
                {examTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <BookmarkButton
            examQuestionId={examQuestionId}
            initialBookmarked={bookmarked}
          />
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <CardContent className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
        {/* Question Text */}
        <div className="text-sm sm:text-base leading-relaxed font-semibold text-foreground wrap-anywhere [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto">
          <LatexText text={questionText} />
        </div>

        {!answerKeyReleased ? (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs sm:text-sm leading-relaxed text-muted-foreground flex items-start gap-2.5">
            <BookOpen className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <span>
              The answer key for this assessment has not been released yet. You will be able to review and re-answer this question once your instructor publishes results.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {(Object.keys(options) as OptionChoice[]).map((option) => {
                const isSelected = selected === option
                const isCorrectChoice = outcome && option === outcome.correctOption
                const isWrongChoice = outcome && isSelected && !outcome.correct

                return (
                  <div
                    key={option}
                    role="button"
                    tabIndex={outcome || isPending ? -1 : 0}
                    onClick={() => {
                      if (!outcome && !isPending) setSelected(option)
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !outcome && !isPending) {
                        e.preventDefault()
                        setSelected(option)
                      }
                    }}
                    className={cn(
                      "group relative flex items-start gap-3.5 rounded-xl border p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed transition-all select-none shadow-2xs",
                      !outcome && !isSelected && "border-border/70 bg-card hover:bg-muted/30 text-foreground cursor-pointer hover:border-border",
                      !outcome && isSelected && "border-primary bg-primary/5 ring-1 ring-primary font-semibold text-foreground cursor-pointer",
                      isCorrectChoice && "border-emerald-500/70 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500/40 cursor-default",
                      isWrongChoice && "border-destructive/60 bg-destructive/10 text-destructive font-semibold ring-1 ring-destructive/40 cursor-default",
                      outcome && !isCorrectChoice && !isWrongChoice && "border-border/40 bg-card/60 opacity-60 text-muted-foreground cursor-default",
                      isPending && "cursor-wait opacity-80"
                    )}
                  >
                    {/* Radio circle indicator */}
                    <div
                      className={cn(
                        "size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        isCorrectChoice
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : isWrongChoice
                          ? "border-destructive bg-destructive text-white"
                          : isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40 bg-background group-hover:border-primary/60"
                      )}
                    >
                      {(isSelected || isCorrectChoice) && (
                        <div className="size-2 rounded-full bg-current" />
                      )}
                    </div>

                    {/* Option letter pill */}
                    <span
                      className={cn(
                        "font-bold text-xs px-2 py-0.5 rounded-md shrink-0 transition-colors",
                        isCorrectChoice
                          ? "bg-emerald-600/20 text-emerald-800 dark:text-emerald-300"
                          : isWrongChoice
                          ? "bg-destructive/20 text-destructive"
                          : isSelected
                          ? "bg-primary/20 text-primary"
                          : "bg-muted/70 text-muted-foreground"
                      )}
                    >
                      {option}
                    </span>

                    {/* Option text */}
                    <div className="min-w-0 flex-1 overflow-x-auto wrap-anywhere font-medium">
                      <LatexText text={options[option]} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action Bar / Outcome */}
            {!outcome ? (
              <div className="pt-2">
                <Button
                  type="button"
                  size="default"
                  className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs active:scale-95 transition-all text-xs sm:text-sm gap-2 cursor-pointer"
                  onClick={submit}
                  disabled={!selected || isPending}
                >
                  {isPending ? (
                    <>
                      <Spinner className="size-4" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      <span>Check Answer</span>
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pt-2" aria-live="polite">
                {/* Result Feedback Banner */}
                {outcome.correct ? (
                  <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        Correct Answer! +15 XP Earned
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                        Well done! You have reviewed this question and reinforced your memory recall.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 sm:p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex items-start gap-3">
                    <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-destructive">
                        Incorrect Answer — The correct choice is Option {outcome.correctOption}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Take a look at the highlighted green option above or generate an AI explanation below to understand the solution.
                      </p>
                    </div>
                  </div>
                )}

                {/* AI Explanation Button / Content */}
                {!explanation ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 sm:h-9.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border-border/70 hover:border-primary/40 hover:text-primary shadow-2xs active:scale-95 transition-all gap-2 cursor-pointer"
                    onClick={explain}
                    disabled={isExplaining}
                  >
                    {isExplaining ? (
                      <>
                        <Spinner className="size-3.5" />
                        <span>Analyzing concept...</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="size-3.5 text-primary" />
                        <span>Explain with AI</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm">
                      <Lightbulb className="size-4" />
                      <span>AI Solution & Concept Breakdown</span>
                    </div>
                    <div className="text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-line">
                      <LatexText text={explanation} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
