import Link from "next/link"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import {
  Trophy,
  Zap,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Clock,
  Flame,
  Target,
  ChevronRight,
  FileText,
} from "lucide-react"
import { requireUser, isAdminTier } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { getLearningSummary } from "@/modules/learning/queries"
import { getPracticeRecommendations } from "@/modules/learning/recommendations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const instant = false

export const metadata = {
  title: "Student Dashboard | MCQ Platform",
  description: "Track your exam progress, review mistakes, and test your knowledge.",
}

export default async function DashboardPage() {
  const user = await requireUser()

  if (isAdminTier(user.role)) redirect("/admin")
  if (user.role === "TEACHER" && user.teacherVerificationStatus === "VERIFIED") redirect("/teacher")
  if (user.isGuest) redirect("/exams")

  await connection()

  const [dbUser, summary, recommendations, recentAttempts, attemptCount] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          institution: true,
          department: true,
          teacherVerificationStatus: true,
        },
      }),
      getLearningSummary(user.id),
      getPracticeRecommendations(user.id),
      prisma.examAttempt.findMany({
        where: {
          studentId: user.id,
        },
        take: 5,
        orderBy: { startedAt: "desc" },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              durationMinutes: true,
            },
          },
          result: {
            select: {
              obtainedMarks: true,
              totalMarks: true,
              isPassed: true,
              status: true,
            },
          },
        },
      }),
      prisma.examAttempt.count({ where: { studentId: user.id } }),
    ])

  const dueCount = recommendations.dueReviews.length

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 font-sans">
      {/* ── 1. MINIMAL CLEAN PAGE HEADER (No profile/email clutter, matching /teacher/exams/new) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-border/60">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Student Dashboard
          </h1>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-primary/20 bg-primary/10 text-primary shadow-2xs"
          >
            <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Candidate</span>
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground border-border/70"
          >
            Level {summary.level}
          </Badge>
        </div>

        <Button
          asChild
          size="sm"
          className="h-9.5 sm:h-10 px-4 sm:px-5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs active:scale-95 transition-all text-xs sm:text-sm gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Link href="/exams">
            <BookOpen className="size-4" />
            <span>Browse All Exams</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      {/* Faculty Application Pending Banner (Only if student applied) */}
      {dbUser.institution && dbUser.teacherVerificationStatus === "PENDING" && (
        <Alert className="rounded-2xl border-amber-500/30 bg-amber-500/10 text-foreground shadow-2xs">
          <Clock className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-bold text-amber-800 dark:text-amber-300">
            Faculty Instructor Application Under Review
          </AlertTitle>
          <AlertDescription className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
            Your application to become a Faculty Instructor ({dbUser.institution}
            {dbUser.department ? ` • ${dbUser.department}` : ""}) is under review.
            Your student workspace, tests, and learning metrics remain fully active.
          </AlertDescription>
        </Alert>
      )}

      {/* ── 2. ESSENTIAL STUDENT METRIC CARDS (Matching /teacher/exams/new cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
        {/* Metric 1: Exams Completed */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Exams Taken
            </span>
            <div className="size-8.5 sm:size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div>
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {attemptCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Completed sessions</p>
          </div>
        </div>

        {/* Metric 2: Study Streak */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-2xs hover:shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Study Streak
            </span>
            <div className="size-8.5 sm:size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 ring-1 ring-amber-500/20">
              <Flame className="size-4" />
            </div>
          </div>
          <div>
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-baseline gap-1.5">
              <span>{summary.currentStreak}</span>
              <span className="text-sm font-semibold text-muted-foreground">
                {summary.currentStreak === 1 ? "Day" : "Days"}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Best: {summary.longestStreak} days</p>
          </div>
        </div>

        {/* Metric 3: Total Experience */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-2xs hover:shadow-xs hover:border-violet-500/40 transition-all flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Experience
            </span>
            <div className="size-8.5 sm:size-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 ring-1 ring-violet-500/20">
              <Zap className="size-4" />
            </div>
          </div>
          <div>
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-baseline gap-1.5">
              <span>{summary.totalXP}</span>
              <span className="text-sm font-semibold text-muted-foreground">XP</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Academic Level {summary.level}</p>
          </div>
        </div>

        {/* Metric 4: Mistake Reviews */}
        <div className={cn(
          "p-4 sm:p-5 rounded-2xl border bg-card shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3",
          dueCount > 0 ? "border-amber-500/40 ring-1 ring-amber-500/25" : "border-border/70"
        )}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mistake Reviews
            </span>
            <div className={cn(
              "size-8.5 sm:size-9 rounded-xl flex items-center justify-center shrink-0 ring-1",
              dueCount > 0
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30"
                : "bg-muted text-muted-foreground ring-border/50"
            )}>
              <RotateCcw className="size-4" />
            </div>
          </div>
          <div>
            <p className={cn(
              "font-heading text-2xl sm:text-3xl font-extrabold tracking-tight",
              dueCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
            )}>
              {dueCount > 0 ? `${dueCount} Due` : "All Clear"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {dueCount > 0 ? "Questions pending recall" : "No overdue questions"}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN INTERACTIVE ACTION PORTALS (3 Clean Cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Gateway 1: Take Exams */}
        <Link
          href="/exams"
          className="group block min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="h-full rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="size-11 sm:size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <BookOpen className="size-5.5 sm:size-6" />
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <h2 className="font-heading text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Take Exams
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Browse available examinations, subject mock tests, and timed assessments.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center text-xs sm:text-sm font-semibold text-primary gap-1">
              <span>Explore Assessments</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>
        </Link>

        {/* Gateway 2: Mistake Notebook */}
        <Link
          href="/mistakes"
          className="group block min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="h-full rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-xs hover:border-amber-500/50 transition-all flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="size-11 sm:size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 ring-1 ring-amber-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <RotateCcw className="size-5.5 sm:size-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  {dueCount > 0 && (
                    <Badge variant="destructive" className="rounded-full text-[11px] font-bold px-2 py-0.5">
                      {dueCount} Due
                    </Badge>
                  )}
                  <ChevronRight className="size-5 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="font-heading text-base sm:text-lg font-bold text-foreground group-hover:text-amber-600 transition-colors">
                  Mistake Notebook
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Review questions you answered incorrectly using spaced repetition recall.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 gap-1">
              <span>{dueCount > 0 ? "Review Pending Questions" : "Open Notebook"}</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>
        </Link>

        {/* Gateway 3: Leaderboard */}
        <Link
          href="/leaderboard"
          className="group block min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="h-full rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="size-11 sm:size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <Trophy className="size-5.5 sm:size-6" />
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <h2 className="font-heading text-base sm:text-lg font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                  Leaderboard
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Check platform standings, accuracy percentiles, and compare your ranks with peers.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
              <span>View Standings</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>
        </Link>
      </div>

      {/* ── 4. RECENT EXAM ACTIVITY (Master card styling matching /teacher/exams/new) ── */}
      <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
              <FileText className="size-4.5 sm:size-5.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                Recent Exam Activity
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                Your latest assessment submissions, scores, and evaluation records
              </p>
            </div>
          </div>

          {attemptCount > 0 && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 sm:h-8.5 px-3 rounded-xl border-border/70 text-xs font-semibold shadow-2xs hover:border-primary/40 hover:text-primary gap-1.5 shrink-0 cursor-pointer"
            >
              <Link href="/exams">
                <span>View All ({attemptCount})</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
        </div>

        <div className="p-0">
          {recentAttempts.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3.5">
              <div className="size-13 rounded-2xl bg-muted/70 text-muted-foreground mx-auto flex items-center justify-center ring-1 ring-border/60 shadow-2xs">
                <BookOpen className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No assessments taken yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Start your examination journey by exploring available tests and practicing your skills.
                </p>
              </div>
              <Button asChild className="rounded-xl h-9.5 px-5 font-bold bg-primary text-primary-foreground shadow-2xs cursor-pointer">
                <Link href="/exams">
                  <span>Browse Examinations</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentAttempts.map((attempt) => {
                const isCompleted = attempt.status === "COMPLETED" || attempt.status === "TIMEOUT"
                const hasPublishedResult = attempt.result?.status === "PUBLISHED"

                return (
                  <div
                    key={attempt.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:bg-muted/15 transition-colors group"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading text-sm sm:text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {attempt.exam.title}
                        </h3>

                        {/* Status Badge */}
                        {hasPublishedResult ? (
                          <Badge className="bg-primary/10 text-primary border-primary/25 rounded-full text-[11px] font-semibold px-2.5 py-0.5 shadow-2xs">
                            Score: {attempt.result?.obtainedMarks} / {attempt.result?.totalMarks}
                          </Badge>
                        ) : isCompleted ? (
                          <Badge variant="secondary" className="rounded-full text-[11px] font-semibold px-2.5 py-0.5 border border-border/60">
                            Results Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-full text-[11px] font-semibold px-2.5 py-0.5">
                            In Progress
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="size-3 text-muted-foreground" />
                          <span>{attempt.exam.durationMinutes} mins</span>
                        </span>
                        <span>•</span>
                        <span>Attempt #{attempt.attemptNumber}</span>
                        <span>•</span>
                        <span>
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(attempt.startedAt))}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-auto">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8.5 rounded-xl border-border/70 text-xs font-semibold shadow-2xs hover:border-primary/40 hover:text-primary gap-1.5 cursor-pointer"
                      >
                        <Link
                          href={
                            isCompleted
                              ? `/exams/${attempt.examId}/attempt/${attempt.id}`
                              : `/exams/${attempt.examId}`
                          }
                        >
                          <span>{isCompleted ? "View Result" : "Continue Exam"}</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* ── 5. TARGETED IMPROVEMENT TOPICS (Only if student has practice data) ── */}
      {recommendations.weakestTopics.length > 0 && (
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                <Target className="size-4" />
              </div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
                Targeted Improvement Topics
              </h3>
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold border-border/60">
              Recommended Focus
            </Badge>
          </div>
          <div className="p-4 sm:p-5 sm:p-6 space-y-3">
            <p className="text-xs text-muted-foreground">
              Practicing questions on these topics will produce the highest score improvements:
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {recommendations.weakestTopics.slice(0, 4).map((topic) => (
                <Badge
                  key={`${topic.subject}-${topic.topic}`}
                  variant="outline"
                  className="rounded-xl px-3 py-1.5 text-xs font-medium border-border/70 bg-muted/20 gap-2"
                >
                  <span className="font-bold text-foreground">{topic.subject}</span>
                  <span className="text-muted-foreground">• {topic.topic}</span>
                  <span className="text-primary font-bold">({Math.round(topic.accuracy * 100)}%)</span>
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
