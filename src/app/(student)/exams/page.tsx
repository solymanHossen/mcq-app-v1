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
  Calendar,
  RefreshCw,
  ShieldCheck,
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
      <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
        <GuestBanner name={user.name} email={user.email} />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              My Assessment Exams
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
            >
              <span className="size-1.5 sm:size-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Candidate Restricted</span>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
            >
              {attempts.length} shared test{attempts.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            You are in isolated candidate mode. Only exams shared directly with you via private link appear here.
          </p>
        </div>

        {attempts.length === 0 ? (
          <Empty className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs">
                <ClipboardListIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground mt-2">
                No Shared Exams Found
              </EmptyTitle>
              <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                You haven&apos;t started any exams yet. Please use the direct exam link shared by your teacher.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {attempts.map((attempt) => {
              const exam = attempt.exam
              const isCompleted =
                attempt.status === "COMPLETED" || attempt.status === "TIMEOUT"
              const isInProgress = attempt.status === "IN_PROGRESS"

              return (
                <Card
                  key={attempt.id}
                  className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                >
                  <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                        <BookOpen className="size-4.5 sm:size-5.5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                          {exam.title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {exam.description || "Assessment Evaluation"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        isInProgress
                          ? "default"
                          : isCompleted
                            ? "secondary"
                            : "outline"
                      }
                      className="rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold shrink-0 uppercase tracking-wider"
                    >
                      {isInProgress
                        ? "In Progress"
                        : isCompleted
                          ? "Completed"
                          : attempt.status}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6 lg:p-7 space-y-3 flex-1">
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="size-4 text-blue-500 shrink-0" />
                        <span>{exam.durationMinutes} mins</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4 text-purple-500 shrink-0" />
                        <span>{new Date(attempt.startedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {attempt.result && (
                      <div className="rounded-xl bg-muted/40 border border-border/50 p-3 flex items-center justify-between text-xs sm:text-sm font-semibold">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Award className="size-4 text-amber-500" />
                          <span>Score: {attempt.result.obtainedMarks} / {attempt.result.totalMarks}</span>
                        </span>
                        <Badge variant="outline" className="text-xs font-bold rounded-full">
                          {Math.round(attempt.result.accuracy)}% accuracy
                        </Badge>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="border-t border-border/50 bg-muted/10 p-4 sm:px-6 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      Attempt #{attempt.attemptNumber}
                    </span>
                    {isInProgress ? (
                      <Button
                        asChild
                        className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all gap-2"
                      >
                        <Link href={`/exams/${exam.id}/attempt/${attempt.id}`}>
                          <span>Resume Attempt</span>
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs active:scale-95 transition-all"
                      >
                        <Link href={`/exams/${exam.id}`}>
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
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 lg:p-7">
            <div className="flex items-start gap-3 sm:gap-3.5">
              <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                <BookOpen className="size-4.5 sm:size-5.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                  Want to access other public practice exams?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Set a password to upgrade your guest session into a permanent student account with full access to mistake reviews and open contests.
                </p>
              </div>
            </div>
            <UpgradeGuestModal
              name={user.name}
              email={user.email}
              trigger={
                <Button
                  size="lg"
                  className="h-11 sm:h-12 px-5 rounded-xl font-bold shadow-sm shrink-0 active:scale-95 transition-all"
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
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Available Assessments
          </h1>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
          >
            <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open for testing</span>
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
          >
            {exams.length} assessment{exams.length === 1 ? "" : "s"}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Explore published examination assessments, timed quizzes, and practice papers.
        </p>
      </div>

      {exams.length === 0 ? (
        <Empty className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs">
              <ClipboardListIcon className="size-6" />
            </EmptyMedia>
            <EmptyTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground mt-2">
              No exams open right now
            </EmptyTitle>
            <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              There are currently no active assessments published for open testing. Please check back later.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                    <BookOpen className="size-4.5 sm:size-5.5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                      {exam.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {exam.description || "Timed multiple-choice assessment"}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 border-border/70">
                  {exam.durationMinutes}m
                </Badge>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 lg:p-7 space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Clock className="size-4 text-blue-500 shrink-0" />
                    <span>{exam.durationMinutes} minutes duration</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <RefreshCw className="size-4 text-amber-500 shrink-0" />
                    <span>{exam.maxAttempts} max attempt{exam.maxAttempts === 1 ? "" : "s"}</span>
                  </div>
                  {exam.webcamMonitoringRequired && (
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                      <span>Webcam proctoring</span>
                    </div>
                  )}
                  {exam.leaderboardEnabled && (
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Award className="size-4 text-yellow-500 shrink-0" />
                      <span>Leaderboard enabled</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/50 bg-muted/10 p-4 sm:px-6 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground font-medium">
                  {exam.passingMarks ? `Pass: ${exam.passingMarks} marks` : "Standard grading"}
                </span>
                <Button
                  asChild
                  className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all gap-2"
                >
                  <Link href={`/exams/${exam.id}`}>
                    <span>View Assessment</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

