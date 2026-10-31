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
      <div className="mx-auto max-w-3xl space-y-6">
        <GuestBanner name={user.name} email={user.email} />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              My Assessment Exams
            </h1>
            <Badge
              variant="secondary"
              className="border-amber-500/30 bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400"
            >
              Candidate Restricted
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            You are in isolated candidate mode. Only exams shared directly with
            you via private link appear here.
          </p>
        </div>

        {attempts.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed bg-muted/10 p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardListIcon className="size-10 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No Shared Exams Found</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t started any exams yet. Please use the direct
                exam link shared by your teacher.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4">
            {attempts.map((attempt) => {
              const exam = attempt.exam
              const isCompleted =
                attempt.status === "COMPLETED" || attempt.status === "TIMEOUT"
              const isInProgress = attempt.status === "IN_PROGRESS"

              return (
                <Card
                  key={attempt.id}
                  className="relative overflow-hidden border-border/60 shadow-sm transition-colors hover:border-primary/40"
                >
                  <div
                    className={`absolute top-0 bottom-0 left-0 w-1 ${
                      isInProgress
                        ? "bg-amber-500"
                        : isCompleted
                          ? "bg-emerald-500"
                          : "bg-muted"
                    }`}
                  />
                  <CardHeader className="pl-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">
                          {exam.title}
                        </CardTitle>
                        {exam.description && (
                          <CardDescription className="line-clamp-2">
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
                        className={
                          isInProgress
                            ? "bg-amber-500 text-white hover:bg-amber-600"
                            : isCompleted
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : ""
                        }
                      >
                        {isInProgress
                          ? "In Progress"
                          : isCompleted
                            ? "Completed"
                            : attempt.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4 pl-6">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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

                  <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-0 pb-5 pl-6">
                    <span className="text-xs text-muted-foreground">
                      Started:{" "}
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </span>
                    {isInProgress ? (
                      <Button asChild size="sm" className="gap-1.5 shadow-sm">
                        <Link href={`/exams/${exam.id}/attempt/${attempt.id}`}>
                          <span>Resume Attempt</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
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
        <Card className="rounded-2xl border-dashed border-primary/30 bg-primary/5 p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BookOpen className="size-4 text-primary" />
                Want to access other public practice exams?
              </h3>
              <p className="text-xs text-muted-foreground">
                Set a password to upgrade your guest session into a permanent
                student account with full access to mistake reviews and open
                contests.
              </p>
            </div>
            <UpgradeGuestModal
              name={user.name}
              email={user.email}
              trigger={
                <Button size="sm" className="shrink-0 text-xs font-semibold">
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
    <div className="w-full min-w-0 space-y-6 pb-12 sm:space-y-8 sm:pb-16">
      <h1 className="border-b border-border/60 pb-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:pb-4 sm:text-3xl lg:text-4xl">
        Available exams
      </h1>

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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs ring-0 transition-shadow hover:shadow-sm"
            >
              <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
                <CardTitle className="text-base font-bold tracking-tight sm:text-xl">
                  {exam.title}
                </CardTitle>
                <CardDescription>
                  {exam.durationMinutes} minutes · {exam.maxAttempts} attempt
                  {exam.maxAttempts === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto border-border/50 bg-muted/20 p-4 sm:px-6">
                <Button
                  asChild
                  size="sm"
                  className="h-10 rounded-xl text-sm font-semibold shadow-2xs"
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
