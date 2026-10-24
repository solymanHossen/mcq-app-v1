import { notFound } from "next/navigation"
import { requireUser, assertOwner } from "@/lib/auth/guards"
import { prisma } from "@/lib/db"
import { listExamResults, getExamQuestionsForCorrection } from "@/lib/grading/queries"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ResultDisclosureActions } from "@/components/teacher/result-disclosure-actions"
import { QuestionCorrectionForm } from "@/components/teacher/question-correction-form"

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

  const [results, questions] = await Promise.all([
    listExamResults(examId),
    getExamQuestionsForCorrection(examId),
  ])

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{exam.title} — Results</h1>
        {exam.status === "PUBLISHED" && (
          <ResultDisclosureActions
            examId={examId}
            answerKeyReleased={exam.answerKeyReleased}
          />
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
                  <Badge variant={r.status === "TIMEOUT" ? "secondary" : "default"}>
                    {r.status}
                  </Badge>
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
