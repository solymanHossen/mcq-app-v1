import Link from "next/link"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { ClipboardListIcon, Clock, Award, CheckCircle2, AlertCircle, ArrowRight, BookOpen } from "lucide-react"
import { GuestBanner } from "@/modules/account/components/guest-banner"
import { UpgradeGuestModal } from "@/modules/account/components/upgrade-guest-modal"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AvailableExamsPage() {
  const user = await requireRole("STUDENT")

  // Isolated Guest Candidate Mode: Guest students only see the exams they were invited to take
  if (user.isGuest) {
    const attempts = await prisma.examAttempt.findMany({
      where: { studentId: user.id },
      include: {
        exam: true,
        result: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <GuestBanner name={user.name} email={user.email} />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">My Assessment Exams</h1>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs">
              Candidate Restricted
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            You are in isolated candidate mode. Only exams shared directly with you via private link appear here.
          </p>
        </div>

        {attempts.length === 0 ? (
          <Empty className="border border-dashed rounded-2xl p-8 bg-muted/10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardListIcon className="size-10 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No Shared Exams Found</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t started any exams yet. Please use the direct exam link shared by your teacher.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4">
            {attempts.map((attempt) => {
              const exam = attempt.exam
              const isCompleted = attempt.status === "COMPLETED" || attempt.status === "TIMEOUT"
              const isInProgress = attempt.status === "IN_PROGRESS"

              return (
                <Card key={attempt.id} className="relative overflow-hidden border-border/60 hover:border-primary/40 transition-colors shadow-sm">
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-1 ${
                      isInProgress ? "bg-amber-500" : isCompleted ? "bg-emerald-500" : "bg-muted"
                    }`}
                  />
                  <CardHeader className="pl-6">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">{exam.title}</CardTitle>
                        {exam.description && (
                          <CardDescription className="line-clamp-2">{exam.description}</CardDescription>
                        )}
                      </div>
                      <Badge
                        variant={isInProgress ? "default" : isCompleted ? "secondary" : "outline"}
                        className={
                          isInProgress
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : isCompleted
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : ""
                        }
                      >
                        {isInProgress ? "In Progress" : isCompleted ? "Completed" : attempt.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pl-6 pt-0 pb-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        <span>{exam.durationMinutes} minutes duration</span>
                      </div>
                      {attempt.result && (
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Award className="size-3.5 text-primary" />
                          <span>
                            Score: {attempt.result.obtainedMarks} / {attempt.result.totalMarks} (
                            {Math.round(attempt.result.accuracy)}% accuracy)
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pl-6 pt-0 pb-5 border-t border-border/40 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      Started: {new Date(attempt.startedAt).toLocaleDateString()}
                    </span>
                    {isInProgress ? (
                      <Button asChild size="sm" className="gap-1.5 shadow-sm">
                        <Link href={`/exams/${exam.id}/attempt/${attempt.id}`}>
                          <span>Resume Attempt</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="sm" className="gap-1.5">
                        <Link href={`/exam/${exam.id}`}>
                          <span>Exam Details</span>
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {/* Upgrade Card to discover other exams */}
        <Card className="border-dashed border-primary/30 bg-primary/5 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                Want to access other public practice exams?
              </h3>
              <p className="text-xs text-muted-foreground">
                Set a password to upgrade your guest session into a permanent student account with full access to mistake reviews and open contests.
              </p>
            </div>
            <UpgradeGuestModal
              name={user.name}
              email={user.email}
              trigger={
                <Button size="sm" className="shrink-0 font-semibold text-xs">
                  Upgrade Account
                </Button>
              }
            />
          </div>
        </Card>
      </div>
    )
  }

  // Regular Registered Students see all available platform exams
  const now = new Date()
  const exams = await prisma.exam.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ startTime: null }, { startTime: { lte: now } }],
      AND: [{ OR: [{ endTime: null }, { endTime: { gte: now } }] }],
    },
    orderBy: { publishedAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Available exams</h1>

      {exams.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle>No exams open right now</EmptyTitle>
            <EmptyDescription>Check back later.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <CardTitle>{exam.title}</CardTitle>
                <CardDescription>
                  {exam.durationMinutes} minutes · {exam.maxAttempts} attempt
                  {exam.maxAttempts === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild size="sm">
                  <Link href={`/exams/${exam.id}`}>View</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
