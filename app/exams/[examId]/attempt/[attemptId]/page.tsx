import { notFound } from "next/navigation"
import Link from "next/link"
import { requireRole } from "@/lib/auth/guards"
import { getAttemptForStudent } from "@/lib/attempts/queries"
import { finalizeIfExpired } from "@/lib/attempts/expire"
import { getResultForStudent } from "@/lib/grading/queries"
import { ExamAttemptClient } from "@/components/student/exam-attempt-client"
import { ResultSummary } from "@/components/student/result-summary"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ examId: string; attemptId: string }>
}) {
  const { examId, attemptId } = await params
  const user = await requireRole("STUDENT")

  const attempt = await getAttemptForStudent(attemptId)
  // Strict ownership, no ADMIN bypass — nobody but the student themself
  // should ever be able to open this exam-taking view.
  if (!attempt || attempt.studentId !== user.id || attempt.examId !== examId) {
    notFound()
  }

  const current = await finalizeIfExpired(attempt)

  if (current.status !== "IN_PROGRESS") {
    const result = await getResultForStudent(attemptId)
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {current.status === "COMPLETED" ? "Exam submitted" : "Time's up"}
            </CardTitle>
            <CardDescription>
              This attempt has ended and can no longer be changed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result && <ResultSummary result={result} />}
            <Button asChild size="sm">
              <Link href={`/exams/${examId}`}>Back to exam</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ExamAttemptClient
      attemptId={attempt.id}
      examTitle={attempt.exam.title}
      deadline={attempt.deadline.toISOString()}
      questions={attempt.answers.map((a) => ({
        examQuestionId: a.examQuestionId,
        questionText: a.questionText,
        marks: a.marks,
        optionOrder: a.optionOrder,
        optionText: a.optionText,
        selectedOption: a.selectedOption,
        isMarkedForReview: a.isMarkedForReview,
      }))}
    />
  )
}
