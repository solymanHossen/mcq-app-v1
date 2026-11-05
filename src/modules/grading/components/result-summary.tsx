import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LatexText } from "@/components/shared/latex-text"
import { cn } from "@/lib/utils"
import type { ResultForStudent } from "@/modules/grading/queries"
import {
  CheckCircle2,
  Clock,
  Check,
  X,
  Lock,
  ArrowLeft,
  LayoutDashboard,
  Award,
  FileCheck2,
  Target,
} from "lucide-react"

export function ResultSummary({ result }: { result: ResultForStudent }) {
  // =========================================================================
  // STATE 1: RESULTS NOT YET PUBLISHED BY TEACHER / INSTITUTION
  // =========================================================================
  if (!result.result || result.result.status !== "PUBLISHED") {
    return (
      <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
        {/* Simple Minimal Notice Banner */}
        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <Clock className="size-4.5 sm:size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs sm:text-sm font-medium">
            Results will appear here automatically once your teacher publishes scores.
          </p>
        </div>

        {/* 2 Essential Metric Tiles (Full Width - Matching Master Tokens) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3.5 shadow-2xs">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
              <FileCheck2 className="size-5" />
            </span>
            <div className="min-w-0">
              <span className="block font-heading text-lg sm:text-xl font-black text-foreground">
                {result.answeredCount ?? 0} of {result.totalQuestions ?? 0}
              </span>
              <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Questions Answered
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3.5 shadow-2xs">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs ring-1 ring-emerald-500/20">
              <CheckCircle2 className="size-5" />
            </span>
            <div className="min-w-0">
              <span className="block font-heading text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                Saved &amp; Completed
              </span>
              <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Attempt Status
              </span>
            </div>
          </div>
        </div>

        {/* Clear Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-2 sm:pt-3">
          <Button
            asChild
            className="group h-11 w-full sm:w-auto px-5 sm:px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs hover:shadow-sm active:scale-[0.99] transition-all gap-2.5 justify-center"
          >
            <Link href={`/exams/${result.examId}`}>
              <ArrowLeft className="size-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to assessment</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="group h-11 w-full sm:w-auto px-5 sm:px-6 rounded-xl text-sm font-semibold border-border/70 hover:border-border/90 bg-card hover:bg-muted/70 text-foreground shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all gap-2.5 justify-center"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
              <span>Student Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // =========================================================================
  // STATE 2: RESULTS PUBLISHED BY TEACHER
  // =========================================================================
  const r = result.result

  return (
    <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
      {/* Modern Hero Score (Full Width of Parent Card, Zero Inner Card Borders) */}
      <div className="w-full flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-6 text-center sm:text-left py-1">
        {/* Total Obtained Score */}
        <div className="space-y-1.5 w-full sm:w-auto">
          <span className="block text-xs font-extrabold uppercase tracking-widest text-muted-foreground text-center sm:text-left">
            Total Obtained Score
          </span>
          <div className="flex items-baseline justify-center sm:justify-start gap-2">
            <span className="font-heading text-5xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
              {r.obtainedMarks}
            </span>
            <span className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-muted-foreground/60">
              / {r.totalMarks}
            </span>
          </div>
        </div>

        {/* Status & Accuracy Badges */}
        <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 flex-wrap w-full sm:w-auto pt-1 sm:pt-0">
          {r.isPassed !== null && (
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold shadow-2xs gap-2 border-0",
                r.isPassed
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {r.isPassed ? (
                <>
                  <CheckCircle2 className="size-4 sm:size-4.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Passed</span>
                </>
              ) : (
                <>
                  <X className="size-4 sm:size-4.5 text-destructive" />
                  <span>Not Passed</span>
                </>
              )}
            </Badge>
          )}

          <Badge
            variant="outline"
            className="rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold border-0 bg-primary/10 text-primary gap-2 shadow-2xs"
          >
            <Target className="size-4 sm:size-4.5 text-primary" />
            <span>{Math.round(r.accuracy * 100)}% Accuracy</span>
          </Badge>
        </div>
      </div>

      {/* 4 Metric Breakdown Cards (Mobile: 2x2 grid, Desktop: 4 columns - Soft Gradients) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Correct */}
        <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 p-3.5 sm:p-4 shadow-2xs transition-all hover:bg-emerald-500/10 min-w-0">
          <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <CheckCircle2 className="size-4.5 sm:size-5" />
          </span>
          <div className="min-w-0">
            <span className="block font-heading text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">
              {r.correctCount}
            </span>
            <span className="block text-xs font-bold tracking-wider text-muted-foreground uppercase truncate">
              Correct
            </span>
          </div>
        </div>

        {/* Incorrect */}
        <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-destructive/20 bg-gradient-to-b from-destructive/10 to-destructive/5 p-3.5 sm:p-4 shadow-2xs transition-all hover:bg-destructive/10 min-w-0">
          <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive shadow-2xs">
            <X className="size-4.5 sm:size-5 stroke-[2.5]" />
          </span>
          <div className="min-w-0">
            <span className="block font-heading text-lg sm:text-2xl font-black text-destructive truncate">
              {r.incorrectCount}
            </span>
            <span className="block text-xs font-bold tracking-wider text-muted-foreground uppercase truncate">
              Incorrect
            </span>
          </div>
        </div>

        {/* Skipped */}
        <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-border/50 bg-gradient-to-b from-muted/30 to-muted/15 p-3.5 sm:p-4 shadow-2xs transition-all hover:bg-muted/40 min-w-0">
          <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-muted-foreground/15 text-muted-foreground shadow-2xs">
            <Clock className="size-4.5 sm:size-5" />
          </span>
          <div className="min-w-0">
            <span className="block font-heading text-lg sm:text-2xl font-black text-muted-foreground truncate">
              {r.skippedCount}
            </span>
            <span className="block text-xs font-bold tracking-wider text-muted-foreground uppercase truncate">
              Skipped
            </span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-primary/5 p-3.5 sm:p-4 shadow-2xs transition-all hover:bg-primary/10 min-w-0">
          <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-2xs">
            <Target className="size-4.5 sm:size-5" />
          </span>
          <div className="min-w-0">
            <span className="block font-heading text-lg sm:text-2xl font-black text-primary truncate">
              {Math.round(r.accuracy * 100)}%
            </span>
            <span className="block text-xs font-bold tracking-wider text-muted-foreground uppercase truncate">
              Accuracy
            </span>
          </div>
        </div>
      </div>

      {r.cancelledCount > 0 && (
        <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/60">
          ℹ️ {r.cancelledCount} question
          {r.cancelledCount === 1 ? " was" : "s were"} cancelled during grading and awarded full marks to all candidates.
        </p>
      )}

      {/* Answer Key Breakdown (if released) */}
      {result.answerKeyReleased && result.questions ? (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">
                Detailed Question Breakdown &amp; Answer Key
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                Verify your chosen answers against the official correct solutions below.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold rounded-full border-border/70">
              {result.questions.length} Questions
            </Badge>
          </div>

          <div className="space-y-4">
            {result.questions.map((q, i) => {
              const isCorrect = !q.isCancelled && q.selectedOption === q.correctOption
              const isSkipped = q.selectedOption === null

              return (
                <Card
                  key={i}
                  className={cn(
                    "rounded-2xl border bg-card p-0 gap-0 shadow-2xs overflow-hidden transition-all",
                    q.isCancelled
                      ? "border-muted-foreground/30"
                      : isCorrect
                      ? "border-emerald-500/40"
                      : isSkipped
                      ? "border-border/70"
                      : "border-destructive/40"
                  )}
                >
                  {/* Question Header */}
                  <div className="px-4 sm:px-6 py-3 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-muted-foreground">
                        QUESTION {String(i + 1).padStart(2, "0")}
                      </span>
                      <Badge variant="outline" className="text-[10px] sm:text-[11px] font-semibold border-border/70">
                        {q.marks} {q.marks === 1 ? "MARK" : "MARKS"}
                      </Badge>
                      {typeof q.negativeMarks === "number" && q.negativeMarks > 0 ? (
                        <Badge variant="outline" className="text-[10px] sm:text-[11px] font-semibold border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          -{q.negativeMarks} neg.
                        </Badge>
                      ) : null}
                    </div>

                    <div>
                      {q.isCancelled ? (
                        <Badge variant="secondary" className="text-xs font-semibold rounded-full">
                          Cancelled (Credit)
                        </Badge>
                      ) : isCorrect ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold rounded-full gap-1">
                          <Check className="size-3 stroke-[3]" />
                          <span>Correct (+{q.marks})</span>
                        </Badge>
                      ) : isSkipped ? (
                        <Badge variant="outline" className="text-xs font-medium text-muted-foreground rounded-full">
                          Not answered (0)
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs font-semibold rounded-full gap-1">
                          <X className="size-3 stroke-[3]" />
                          <span>Incorrect {typeof q.negativeMarks === "number" && q.negativeMarks > 0 ? `(-${q.negativeMarks})` : "(0)"}</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="text-base sm:text-base font-semibold text-foreground leading-relaxed font-bengali">
                      <LatexText text={q.questionText} className="min-w-0 [&_.katex-display]:overflow-x-auto" />
                    </div>

                    {/* Options Review Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-sm sm:text-sm font-bengali">
                      {(["A", "B", "C", "D"] as const).map((opt) => {
                        const optText = q[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"]
                        const isThisCorrect = q.correctOption === opt
                        const isThisSelected = q.selectedOption === opt

                        return (
                          <div
                            key={opt}
                            className={cn(
                              "p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all",
                              isThisCorrect
                                ? "border-emerald-500/60 bg-emerald-500/[0.08] dark:bg-emerald-500/15 font-semibold text-foreground"
                                : isThisSelected && !isThisCorrect
                                ? "border-destructive/60 bg-destructive/[0.08] dark:bg-destructive/15 text-foreground"
                                : "border-border/60 bg-card/60 text-muted-foreground"
                            )}
                          >
                            <div className="flex items-baseline gap-2 min-w-0">
                              <span className="font-bold shrink-0">{opt} —</span>
                              <span className="wrap-anywhere">
                                <LatexText text={optText} />
                              </span>
                            </div>

                            <div className="shrink-0 text-[11px] font-bold">
                              {isThisCorrect && (
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Check className="size-3.5 stroke-[3]" />
                                  <span className="hidden xs:inline">Correct</span>
                                </span>
                              )}
                              {isThisSelected && !isThisCorrect && (
                                <span className="text-destructive flex items-center gap-1">
                                  <X className="size-3.5 stroke-[3]" />
                                  <span className="hidden xs:inline">Your choice</span>
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 sm:p-5 flex items-start gap-3.5">
          <div className="size-9 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
            <Lock className="size-4.5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              Answer Key Withheld by Instructor
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your overall score and performance metrics are shown above. The detailed question-by-question answer key has not been published yet by your instructor.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons for Published Results */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-5 sm:pt-6 border-t border-border/60">
        <Button
          asChild
          className="group h-11 w-full sm:w-auto px-5 sm:px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs hover:shadow-sm active:scale-[0.99] transition-all gap-2.5 justify-center"
        >
          <Link href={`/exams/${result.examId}`}>
            <ArrowLeft className="size-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Back to assessment overview</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="group h-11 w-full sm:w-auto px-5 sm:px-6 rounded-xl text-sm font-semibold border-border/70 hover:border-border/90 bg-card hover:bg-muted/70 text-foreground shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all gap-2.5 justify-center"
        >
          <Link href="/dashboard">
            <LayoutDashboard className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
            <span>Go to Student Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
