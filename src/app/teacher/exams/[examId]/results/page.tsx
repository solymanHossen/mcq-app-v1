import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, assertOwner } from "@/lib/auth/guards"
import { prisma } from "@/lib/db"
import { listExamResults, getExamQuestionsForCorrection } from "@/lib/grading/queries"
import { getLiveContestStats } from "@/lib/leaderboard/stats"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ResultDisclosureActions } from "@/components/teacher/result-disclosure-actions"
import { QuestionCorrectionForm } from "@/components/teacher/question-correction-form"
import { DisqualifyButton } from "@/components/teacher/disqualify-button"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ExamResultsPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const user = await requireUser()

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) notFound()
  assertOwner(user, exam.teacherId)

  const [results, questions, liveStats] = await Promise.all([
    listExamResults(examId),
    getExamQuestionsForCorrection(examId),
    getLiveContestStats(examId),
  ])

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{exam.title} — Results</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/teacher/exams/${examId}/violations`}>
              Flagged attempts
            </Link>
          </Button>
          {exam.leaderboardEnabled && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/exams/${examId}/leaderboard`}>Leaderboard</Link>
            </Button>
          )}
          {exam.status === "PUBLISHED" && (
            <ResultDisclosureActions
              examId={examId}
              answerKeyReleased={exam.answerKeyReleased}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline">{liveStats.totalParticipants} participants</Badge>
        <Badge variant="outline">{liveStats.inProgress} in progress</Badge>
        <Badge variant="outline">{liveStats.completed} completed</Badge>
        <Badge variant="outline">{liveStats.timedOut} timed out</Badge>
        {liveStats.disqualified > 0 && (
          <Badge variant="destructive">{liveStats.disqualified} disqualified</Badge>
        )}
        {liveStats.averageTimeTakenSec !== null && (
          <Badge variant="outline">
            Avg {Math.round(liveStats.averageTimeTakenSec / 60)} min
          </Badge>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No submissions yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Correct / Incorrect / Skipped</TableHead>
              <TableHead>Result</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div>{r.student.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.student.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      r.status === "DISQUALIFIED"
                        ? "destructive"
                        : r.status === "TIMEOUT"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {r.status}
                  </Badge>
                  {r.disqualifiedReason && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.disqualifiedReason}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {r.result ? `${r.result.obtainedMarks} / ${r.result.totalMarks}` : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.result
                    ? `${r.result.correctCount} / ${r.result.incorrectCount} / ${r.result.skippedCount}`
                    : "—"}
                </TableCell>
                <TableCell>
                  {r.result && (
                    <Badge variant={r.result.status === "PUBLISHED" ? "default" : "outline"}>
                      {r.result.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {r.status !== "DISQUALIFIED" && <DisqualifyButton attemptId={r.id} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {exam.status === "PUBLISHED" && (
        <>
          <Separator />
          <div className="space-y-3">
            <h2 className="font-medium">Answer-key corrections</h2>
            <p className="text-sm text-muted-foreground">
              Correcting or cancelling a question here regrades every
              submitted attempt automatically — only the answer key and
              cancellation status can change on a published exam.
            </p>
            {questions.map((q) => (
              <QuestionCorrectionForm
                key={q.id}
                examId={examId}
                examQuestionId={q.id}
                order={q.order}
                questionText={q.questionTextSnapshot}
                correctOption={q.correctOptionSnapshot}
                isCancelled={q.isCancelled}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
