import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { LatexText } from "@/components/shared/latex-text"
import { cn } from "@/lib/utils"
import type { ResultForStudent } from "@/modules/grading/queries"

export function ResultSummary({ result }: { result: ResultForStudent }) {
  if (!result.result || result.result.status !== "PUBLISHED") {
    return (
      <p className="text-sm text-muted-foreground">
        Your exam has been submitted. Results will be available once your
        teacher publishes them.
      </p>
    )
  }

  const r = result.result

  return (
    <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className="rounded-full px-3 py-1 text-sm font-bold sm:text-base"
          variant="default"
        >
          {r.obtainedMarks} / {r.totalMarks}
        </Badge>
        {r.isPassed !== null && (
          <Badge
            className="rounded-full px-2.5 py-1 text-xs font-semibold"
            variant={r.isPassed ? "default" : "destructive"}
          >
            {r.isPassed ? "Passed" : "Not passed"}
          </Badge>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 sm:gap-4 sm:text-sm [&>div]:flex [&>div]:min-w-0 [&>div]:flex-col [&>div]:gap-1 [&>div]:rounded-xl [&>div]:border [&>div]:border-border/60 [&>div]:bg-muted/20 [&>div]:p-3 sm:[&>div]:p-4">
        <div>
          <dt className="text-muted-foreground">Correct</dt>
          <dd className="font-medium">{r.correctCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Incorrect</dt>
          <dd className="font-medium">{r.incorrectCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Skipped</dt>
          <dd className="font-medium">{r.skippedCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Accuracy</dt>
          <dd className="font-medium">{Math.round(r.accuracy * 100)}%</dd>
        </div>
      </dl>
      {r.cancelledCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {r.cancelledCount} question
          {r.cancelledCount === 1 ? " was" : "s were"} cancelled and credited to
          everyone.
        </p>
      )}

      {result.questions && (
        <>
          <Separator />
          <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
            <h2 className="font-heading text-base font-bold tracking-tight sm:text-xl">
              Answer key
            </h2>
            {result.questions.map((q, i) => (
              <Card
                key={i}
                className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs"
              >
                <CardContent className="flex min-w-0 flex-col gap-3 p-4 text-sm wrap-anywhere sm:p-6">
                  <LatexText
                    text={q.questionText}
                    className="min-w-0 text-sm font-medium sm:text-base [&_.katex-display]:overflow-x-auto"
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Your answer:{" "}
                    <span
                      className={cn(
                        "font-medium",
                        q.isCancelled
                          ? "text-muted-foreground"
                          : q.selectedOption === q.correctOption
                            ? "text-primary"
                            : "text-destructive"
                      )}
                    >
                      {q.selectedOption ?? "Not answered"}
                    </span>
                    {" · "}
                    {q.isCancelled ? (
                      "Cancelled (credited)"
                    ) : (
                      <>Correct answer: {q.correctOption}</>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
