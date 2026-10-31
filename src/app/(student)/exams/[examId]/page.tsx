import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { finalizeIfExpired } from "@/modules/attempts/expire"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StartExamButton } from "@/modules/attempts/components/start-exam-button"

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
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      <header className="flex min-w-0 flex-col gap-2 border-b border-border/60 pb-3 sm:pb-4">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight wrap-anywhere text-foreground sm:text-3xl lg:text-4xl">
          {exam.title}
        </h1>
        {exam.description && (
          <p className="text-xs leading-relaxed wrap-anywhere text-muted-foreground sm:text-sm">
            {exam.description}
          </p>
        )}
      </header>
      <Card className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
        <CardContent className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-7">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
            >
              {exam.durationMinutes} minutes
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
            >
              {attemptsLeft > 0 ? attemptsLeft : 0} of {exam.maxAttempts}{" "}
              attempt
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
              webcamMonitoringRequired={exam.webcamMonitoringRequired}
            />
          )}
        </CardContent>
      </Card>

      {attempts.length > 0 && (
        <Card className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
            <CardTitle className="text-base font-bold tracking-tight sm:text-xl">
              <h2>Your attempts</h2>
            </CardTitle>
            {exam.leaderboardEnabled && (
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4 text-sm font-semibold shadow-2xs"
                asChild
              >
                <Link href={`/exams/${examId}/leaderboard`}>Leaderboard</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-6 lg:p-7">
            {attempts.map((a) => (
              <div
                key={a.id}
                className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs sm:p-4 sm:text-sm"
              >
                <span className="font-semibold">Attempt {a.attemptNumber}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      a.status === "IN_PROGRESS" ? "default" : "secondary"
                    }
                  >
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
