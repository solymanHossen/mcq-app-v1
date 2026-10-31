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
import {
  ClipboardListIcon,
  Clock,
  Award,
  ArrowRight,
  BookOpen,
} from "lucide-react"
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
      <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
        <GuestBanner name={user.name} email={user.email} />

        <header className="flex flex-col gap-2 border-b border-border/60 pb-3 sm:pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              My Assessment Exams
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full border border-border/60 px-2.5 py-1 text-xs font-semibold"
            >
              Candidate Restricted
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            You are in isolated candidate mode. Only exams shared directly with
            you via private link appear here.
          </p>
        </header>

        {attempts.length === 0 ? (
          <Empty className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-6 lg:p-7">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardListIcon />
              </EmptyMedia>
              <EmptyTitle className="text-base font-bold sm:text-xl">
                No Shared Exams Found
              </EmptyTitle>
              <EmptyDescription>
                You haven&apos;t started any exams yet. Please use the direct
                exam link shared by your teacher.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid min-w-0 gap-6 sm:gap-8">
            {attempts.map((attempt) => {
              const exam = attempt.exam
              const isCompleted =
                attempt.status === "COMPLETED" || attempt.status === "TIMEOUT"
              const isInProgress = attempt.status === "IN_PROGRESS"

              return (
                <Card
                  key={attempt.id}
                  className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs transition-shadow hover:shadow-sm"
                >
                  <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <CardTitle className="text-base font-bold tracking-tight wrap-anywhere sm:text-xl">
                          {exam.title}
                        </CardTitle>
                        {exam.description && (
                          <CardDescription className="line-clamp-2 text-xs leading-relaxed wrap-anywhere sm:text-sm">
                            {exam.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge
                        variant={
                          isInProgress
                            ? "default"
                            : isCompleted
                              ? "secondary"
                              : "outline"
                        }
                        className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                      >
                        {isInProgress
                          ? "In Progress"
                          : isCompleted
                            ? "Completed"
                            : attempt.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6 lg:p-7">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        <span>{exam.durationMinutes} minutes duration</span>
                      </div>
                      {attempt.result && (
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Award className="size-3.5 text-primary" />
                          <span>
                            Score: {attempt.result.obtainedMarks} /{" "}
                            {attempt.result.totalMarks} (
                            {Math.round(attempt.result.accuracy)}% accuracy)
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col items-stretch justify-between gap-3 border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center sm:px-6">
                    <span className="text-xs text-muted-foreground">
                      Started:{" "}
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </span>
                    {isInProgress ? (
                      <Button
                        asChild
                        size="lg"
                        className="font-semibold shadow-sm sm:w-auto"
                      >
                        <Link href={`/exams/${exam.id}/attempt/${attempt.id}`}>
                          <span>Resume Attempt</span>
                          <ArrowRight data-icon="inline-end" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="font-semibold sm:w-auto"
                      >
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
        <Card className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6 lg:p-7">
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="flex items-start gap-2 text-base font-bold tracking-tight text-foreground sm:text-xl">
                <BookOpen className="size-4 text-primary" />
                Want to access other public practice exams?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Set a password to upgrade your guest session into a permanent
                student account with full access to mistake reviews and open
                contests.
              </p>
            </div>
            <UpgradeGuestModal
              name={user.name}
              email={user.email}
              trigger={
                <Button
                  size="lg"
                  className="w-full shrink-0 font-semibold shadow-sm sm:w-auto"
                >
                  Upgrade Account
                </Button>
              }
            />
          </CardContent>
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
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      <h1 className="border-b border-border/60 pb-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:pb-4 sm:text-3xl lg:text-4xl">
        Available exams
      </h1>

      {exams.length === 0 ? (
        <Empty className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-6 lg:p-7">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle className="text-base font-bold sm:text-xl">
              No exams open right now
            </EmptyTitle>
            <EmptyDescription>Check back later.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs transition-shadow hover:shadow-sm"
            >
              <CardHeader className="min-w-0 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
                <CardTitle className="text-base font-bold tracking-tight wrap-anywhere sm:text-xl">
                  {exam.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed sm:text-sm">
                  {exam.durationMinutes} minutes · {exam.maxAttempts} attempt
                  {exam.maxAttempts === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto border-border/50 bg-muted/20 p-4 sm:px-6">
                <Button
                  asChild
                  size="lg"
                  className="w-full font-semibold shadow-sm sm:w-auto"
                >
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
