import { notFound } from "next/navigation"
import Link from "next/link"
import { requireRole } from "@/lib/auth/guards"
import { getAttemptForStudent } from "@/lib/attempts/queries"
import { finalizeIfExpired } from "@/lib/attempts/expire"
import { getResultForStudent } from "@/lib/grading/queries"
import { getPendingAppeal } from "@/lib/anti-cheat/queries"
import { prisma } from "@/lib/db"
import { ExamAttemptClient } from "@/components/student/exam-attempt-client"
import { ResultSummary } from "@/components/student/result-summary"
import { AppealForm } from "@/components/student/appeal-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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
    const titles: Record<typeof current.status, string> = {
      COMPLETED: "Exam submitted",
      TIMEOUT: "Time's up",
      DISQUALIFIED: "Attempt disqualified",
    }

    if (current.status === "DISQUALIFIED") {
      const [fullAttempt, existingAppeal] = await Promise.all([
        prisma.examAttempt.findUniqueOrThrow({
          where: { id: attemptId },
          select: { disqualifiedReason: true },
        }),
        getPendingAppeal(attemptId),
      ])
      const resolvedAppeal = existingAppeal
        ? null
        : await prisma.violationAppeal.findFirst({
            where: { attemptId },
            orderBy: { createdAt: "desc" },
          })

      return (
        <div className="mx-auto max-w-2xl space-y-4 p-6">
          <Card>
            <CardHeader>
              <CardTitle>{titles.DISQUALIFIED}</CardTitle>
              <CardDescription>{fullAttempt.disqualifiedReason}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <AppealForm
                attemptId={attemptId}
                existingAppeal={existingAppeal ?? resolvedAppeal}
              />
              <Button asChild size="sm">
                <Link href={`/exams/${examId}`}>Back to exam</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    const result = await getResultForStudent(attemptId)
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>{titles[current.status]}</CardTitle>
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
