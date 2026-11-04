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
  Info,
  FileCheck2,
} from "lucide-react"

export function ResultSummary({ result }: { result: ResultForStudent }) {
  // =========================================================================
  // STATE 1: RESULTS NOT YET PUBLISHED BY TEACHER / INSTITUTION
  // =========================================================================
  if (!result.result || result.result.status !== "PUBLISHED") {
    return (
      <div className="flex min-w-0 flex-col gap-6">
        {/* Prominent Pending Notice Banner */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] dark:bg-amber-500/15 p-5 sm:p-6 space-y-3">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="size-10 sm:size-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 ring-1 ring-amber-500/30 shadow-2xs">
              <Clock className="size-5 sm:size-6" />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">
                  Results Not Published Yet
                </h3>
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs"
                >
                  Pending Instructor Evaluation
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-foreground/80 dark:text-muted-foreground leading-relaxed">
                Your examination has been submitted successfully and all your answers are safely recorded. Your teacher or faculty instructor has not released the official scores for this assessment yet.
              </p>
            </div>
          </div>
        </div>

        {/* Submission Details Overview Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-2xs flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/25">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Attempt Status</p>
              <p className="text-sm font-extrabold text-foreground truncate">Saved &amp; Completed</p>
            </div>
          </div>

          <div className="p-4 rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-2xs flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/25">
              <FileCheck2 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Responses</p>
              <p className="text-sm font-extrabold text-foreground truncate">
                {result.answeredCount ?? 0} of {result.totalQuestions ?? 0} Answered
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-2xs flex items-center gap-3.5 xs:col-span-2 sm:col-span-1">
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 ring-1 ring-amber-500/25">
              <Clock className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Score Release</p>
              <p className="text-sm font-extrabold text-amber-700 dark:text-amber-400 truncate">Pending Publication</p>
            </div>
          </div>
        </div>

        {/* Reassurance Guidance Box (Clean on mobile, detailed on desktop) */}
        <div className="rounded-xl sm:rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 space-y-3 hidden sm:block">
          <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <Info className="size-4 text-primary" />
            <span>Important Information for Candidates</span>
          </h4>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-2 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-500 font-bold shrink-0">✓</span>
              <span><strong>Answers Permanently Saved:</strong> Every answer you selected has been finalized and secured in the platform database.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-500 font-bold shrink-0">✓</span>
              <span><strong>No Action Required:</strong> You do not need to re-enter, edit, or resubmit this assessment.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-500 font-bold shrink-0">✓</span>
              <span><strong>Automatic Score Display:</strong> Once your teacher reviews and publishes the results, your score, accuracy breakdown, and answer analysis will appear right here automatically.</span>
            </li>
          </ul>
        </div>

        {/* Clear Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            asChild
            className="h-10 sm:h-11 px-5 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs active:scale-95 transition-all gap-2"
          >
            <Link href={`/exams/${result.examId}`}>
              <ArrowLeft className="size-4" />
              <span>Back to assessment overview</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-10 sm:h-11 px-5 rounded-xl text-xs sm:text-sm font-semibold border-border/70 bg-card hover:bg-muted shadow-2xs active:scale-95 transition-all gap-2"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="size-4 text-muted-foreground" />
              <span>Go to Student Dashboard</span>
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
    <div className="flex min-w-0 flex-col gap-6">
      {/* Official Results Score Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-primary/25 bg-primary/5 dark:bg-primary/10 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="size-11 sm:size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/30 shadow-2xs">
            <Award className="size-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
              Official Assessment Score
            </span>
            <h3 className="font-heading text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Score: {r.obtainedMarks} / {r.totalMarks}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {r.isPassed !== null && (
            <Badge
              className={cn(
                "rounded-full px-3.5 py-1 text-xs sm:text-sm font-bold shadow-2xs gap-1.5",
                r.isPassed
                  ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "border-destructive/30 bg-destructive/15 text-destructive"
              )}
              variant="outline"
            >
              {r.isPassed ? (
                <>
                  <Check className="size-3.5 stroke-[3]" />
                  <span>Passed</span>
                </>
              ) : (
                <>
                  <X className="size-3.5 stroke-[3]" />
                  <span>Not passed</span>
                </>
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Metric Breakdown Cards (Correct, Incorrect, Skipped, Accuracy) */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col gap-1">
          <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Correct</span>
          </dt>
          <dd className="font-heading text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {r.correctCount}
          </dd>
        </div>

        <div className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col gap-1">
          <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-destructive" />
            <span>Incorrect</span>
          </dt>
          <dd className="font-heading text-xl sm:text-2xl font-extrabold text-destructive">
            {r.incorrectCount}
          </dd>
        </div>

        <div className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col gap-1">
          <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/60" />
            <span>Skipped</span>
          </dt>
          <dd className="font-heading text-xl sm:text-2xl font-extrabold text-muted-foreground">
            {r.skippedCount}
          </dd>
        </div>

        <div className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col gap-1">
          <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            <span>Accuracy</span>
          </dt>
          <dd className="font-heading text-xl sm:text-2xl font-extrabold text-primary">
            {Math.round(r.accuracy * 100)}%
          </dd>
        </div>
      </dl>

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
                          <span>Incorrect (0)</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="text-sm sm:text-base font-semibold text-foreground leading-relaxed font-bengali">
                      <LatexText text={q.questionText} className="min-w-0 [&_.katex-display]:overflow-x-auto" />
                    </div>

                    {/* Options Review Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm">
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
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
        <Button
          asChild
          className="h-10 sm:h-11 px-5 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs active:scale-95 transition-all gap-2"
        >
          <Link href={`/exams/${result.examId}`}>
            <ArrowLeft className="size-4" />
            <span>Back to assessment overview</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-10 sm:h-11 px-5 rounded-xl text-xs sm:text-sm font-semibold border-border/70 bg-card hover:bg-muted shadow-2xs active:scale-95 transition-all gap-2"
        >
          <Link href="/dashboard">
            <LayoutDashboard className="size-4 text-muted-foreground" />
            <span>Go to Student Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
