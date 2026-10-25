import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { requireRole } from "@/lib/auth/guards"
import { prisma } from "@/lib/db"
import { finalizeIfExpired } from "@/lib/attempts/expire"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StartExamButton } from "@/components/student/start-exam-button"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ExamInfoPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const user = await requireRole("STUDENT")

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam || exam.status !== "PUBLISHED") notFound()

  const attempts = await prisma.examAttempt.findMany({
    where: { studentId: user.id, examId },
    orderBy: { attemptNumber: "desc" },
  })

  const latest = attempts[0]
  if (latest) {
    const current = await finalizeIfExpired(latest)
    if (current.status === "IN_PROGRESS") {
      redirect(`/exams/${examId}/attempt/${current.id}`)
    }
  }

  const now = new Date()
  const notYetOpen = exam.startTime && now < exam.startTime
  const closed = exam.endTime && now > exam.endTime
  const attemptsLeft = exam.maxAttempts - attempts.length

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{exam.title}</CardTitle>
          {exam.description && (
            <CardDescription>{exam.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">{exam.durationMinutes} minutes</Badge>
            <Badge variant="outline">
              {attemptsLeft > 0 ? attemptsLeft : 0} of {exam.maxAttempts} attempt
              {exam.maxAttempts === 1 ? "" : "s"} left
            </Badge>
          </div>

          {notYetOpen ? (
            <p className="text-sm text-muted-foreground">
              Opens {exam.startTime!.toLocaleString()}.
            </p>
          ) : closed ? (
            <p className="text-sm text-muted-foreground">
              This exam closed {exam.endTime!.toLocaleString()}.
            </p>
          ) : attemptsLeft <= 0 ? (
            <p className="text-sm text-muted-foreground">
              You&apos;ve used all your attempts for this exam.
            </p>
          ) : (
            <StartExamButton
              examId={examId}
              label={attempts.length > 0 ? "Start next attempt" : "Start exam"}
            />
          )}
        </CardContent>
      </Card>

      {attempts.length > 0 && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Your attempts</CardTitle>
            {exam.leaderboardEnabled && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/exams/${examId}/leaderboard`}>Leaderboard</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {attempts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between text-sm"
              >
                <span>Attempt {a.attemptNumber}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={a.status === "IN_PROGRESS" ? "default" : "secondary"}>
                    {a.status}
                  </Badge>
                  {a.submittedAt && (
                    <span className="text-xs text-muted-foreground">
                      {a.submittedAt.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
