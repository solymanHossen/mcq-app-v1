import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="text-base" variant="default">
          {r.obtainedMarks} / {r.totalMarks}
        </Badge>
        {r.isPassed !== null && (
          <Badge variant={r.isPassed ? "default" : "destructive"}>
            {r.isPassed ? "Passed" : "Not passed"}
          </Badge>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
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
          {r.cancelledCount} question{r.cancelledCount === 1 ? " was" : "s were"}{" "}
          cancelled and credited to everyone.
        </p>
      )}

      {result.questions && (
        <>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-medium">Answer key</p>
            {result.questions.map((q, i) => (
              <div key={i} className="rounded-md border p-3 text-sm">
                <LatexText text={q.questionText} className="font-medium" />
                <p className="mt-1 text-xs text-muted-foreground">
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
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
