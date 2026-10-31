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
  Play,
  ChevronRight,
  Target,
} from "lucide-react"
import { requireUser, isAdminTier } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { getLearningSummary } from "@/modules/learning/queries"
import { getPracticeRecommendations } from "@/modules/learning/recommendations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileHero } from "@/modules/account/components/profile-hero"
import { DashboardKpiCard } from "@/components/shared/dashboard-kpi-card"
import { DashboardAreaChart } from "@/components/shared/dashboard-area-chart"
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input"
import { generateDashboardChartData } from "@/lib/chart-data-utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export const metadata = {
  title: "Student Dashboard",
  description:
    "Track your exam preparation progress, review spaced mistakes, and accelerate your mastery.",
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>
}) {
  const user = await requireUser()

  if (isAdminTier(user.role)) redirect("/admin")
  if (user.role === "TEACHER") redirect("/teacher")
  if (user.isGuest) redirect("/exams")

  await connection()

  const sp = (await searchParams) ?? {}
  const search = sp.q?.trim()

  const [dbUser, summary, recommendations, recentAttempts, attemptCount] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          isEmailVerified: true,
        },
      }),
      getLearningSummary(user.id),
      getPracticeRecommendations(user.id),
      prisma.examAttempt.findMany({
        where: {
          studentId: user.id,
          ...(search
            ? {
                exam: {
                  title: { contains: search, mode: "insensitive" },
                },
              }
            : {}),
        },
        take: 6,
        orderBy: { startedAt: "desc" },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              durationMinutes: true,
            },
          },
        },
      }),
      prisma.examAttempt.count({ where: { studentId: user.id } }),
    ])

  const dueCount = recommendations.dueReviews.length
  const earnedBadgesCount = summary.badges.filter((b) => b.earned).length

  const heroUser = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    isEmailVerified: dbUser.isEmailVerified,
    createdAt: dbUser.createdAt,
    lastLoginAt: dbUser.lastLoginAt,
    streak: {
      currentStreak: summary.currentStreak,
      longestStreak: summary.longestStreak,
    },
    xpTotal: summary.totalXP,
    _count: {
      examAttempts: attemptCount,
      badges: earnedBadgesCount,
    },
  }

  // Pre-calculate chart points
  const { data90d, data30d, data7d } = generateDashboardChartData(
    summary.totalXP,
    attemptCount * 15
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      {/* ================= GRAND PROFILE HERO ================= */}
      <ProfileHero
        user={heroUser}
        className="rounded-2xl border border-border/70 p-4 shadow-xs backdrop-blur-none sm:p-6 dark:shadow-xs [&_button]:max-w-full [&_button_span]:break-all [&_h1]:text-2xl [&_h1]:break-words sm:[&_h1]:text-3xl lg:[&_h1]:text-4xl [&>div[aria-hidden]]:hidden"
      />

      {/* ================= QUICK LEARNER ACTION HUB ================= */}
      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <Link
          href="/exams"
          className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none sm:p-6"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs sm:size-11">
              <BookOpen className="size-4 sm:size-5" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Take Exams
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Explore active assessments
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>

        <Link
          href="/mistakes"
          className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none sm:p-6"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-2xs sm:size-11 dark:bg-amber-500/15 dark:text-amber-400">
              <RotateCcw className="size-4 sm:size-5" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Mistake Notebook
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Spaced repetition reviews ({dueCount})
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>

        <Link
          href="/leaderboard"
          className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none sm:p-6"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-2xs sm:size-11 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Trophy className="size-4 sm:size-5" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Leaderboard
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Rank among platform peers
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>
      </div>

      {/* ================= 4-TILE GRAND KPI METRICS ROW ================= */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {/* KPI 1: Level */}
        <DashboardKpiCard
          className="min-w-0 rounded-2xl border-border/70 shadow-xs ring-0 hover:translate-y-0 hover:shadow-sm [&_.truncate]:overflow-visible [&_.truncate]:whitespace-normal"
          title="Academic Rank"
          value={`Level ${summary.level}`}
          badgeText="+Rank"
          trend="up"
          trendLabel="Mastery rank accelerating"
          subtext={`${summary.totalXP} XP accumulated`}
          href="/progress"
        />

        {/* KPI 2: Total XP */}
        <DashboardKpiCard
          className="min-w-0 rounded-2xl border-border/70 shadow-xs ring-0 hover:translate-y-0 hover:shadow-sm [&_.truncate]:overflow-visible [&_.truncate]:whitespace-normal"
          title="Total Experience"
          value={`${summary.totalXP} XP`}
          badgeText="+XP"
          trend="up"
          trendLabel="Steady performance"
          subtext="Gained across timed exams"
          href="/progress"
        />

        {/* KPI 3: Daily Streak */}
        <DashboardKpiCard
          className="min-w-0 rounded-2xl border-border/70 shadow-xs ring-0 hover:translate-y-0 hover:shadow-sm [&_.truncate]:overflow-visible [&_.truncate]:whitespace-normal"
          title="Study Streak"
          value={`${summary.currentStreak} Days`}
          badgeText="+Streak"
          trend="up"
          trendLabel="Active habit retention"
          subtext={`Personal best: ${summary.longestStreak} days`}
          href="/progress"
        />

        {/* KPI 4: Due for Review */}
        <DashboardKpiCard
          className="min-w-0 rounded-2xl border-border/70 shadow-xs ring-0 hover:translate-y-0 hover:shadow-sm [&_.truncate]:overflow-visible [&_.truncate]:whitespace-normal"
          title="Spaced Review"
          value={`${dueCount} Item${dueCount === 1 ? "" : "s"}`}
          badgeText={dueCount > 0 ? "Due Now" : "All Clear"}
          trend={dueCount > 0 ? "down" : "neutral"}
          trendLabel={
            dueCount > 0 ? "Recall items pending" : "No overdue questions"
          }
          subtext={
            dueCount > 0 ? "Boost retention memory" : "Up-to-date with notebook"
          }
          highlight={dueCount > 0}
          href="/mistakes"
        />
      </div>

      {/* ================= GRAND DUAL-WAVE INTERACTIVE CHART ================= */}
      <DashboardAreaChart
        className="min-w-0 rounded-2xl border-border/70 shadow-xs ring-0 [&_[data-slot=card-header]]:border-b [&_[data-slot=card-header]]:border-border/50 [&_[data-slot=card-header]]:bg-muted/20 [&_[data-slot=card-header]]:p-4 sm:[&_[data-slot=card-header]]:px-6 [&_[data-slot=card-title]]:text-base sm:[&_[data-slot=card-title]]:text-xl"
        title="Learning Velocity & Study Activity"
        description="Daily XP earnings and practice assessment volume for the last 3 months"
        data90d={data90d}
        data30d={data30d}
        data7d={data7d}
        primaryLabel="Experience XP"
        secondaryLabel="Practice Focus"
      />

      {/* ================= SUB-NAVIGATION TABS & SEARCH DATA SECTIONS ================= */}
      <Tabs defaultValue="attempts" className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="max-w-full min-w-0 overflow-x-auto pb-1">
            <TabsList className="min-h-11 w-max rounded-xl border border-border/60 bg-muted/20 p-1 group-data-horizontal/tabs:h-auto">
              <TabsTrigger
                value="attempts"
                className="rounded-xl px-4 text-xs font-bold sm:text-sm"
              >
                Session History ({recentAttempts.length})
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-xl px-4 text-xs font-bold sm:text-sm"
              >
                Due Reviews ({dueCount})
              </TabsTrigger>
              <TabsTrigger
                value="topics"
                className="rounded-xl px-4 text-xs font-bold sm:text-sm"
              >
                Focus Topics ({recommendations.weakestTopics.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Quick Search & Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <DebouncedSearchInput
              placeholder="Filter exam attempts..."
              size="sm"
              className="w-full min-w-0 flex-1 sm:w-64 sm:min-w-48"
            />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 rounded-xl px-4 text-xs font-semibold shadow-2xs"
            >
              <Link href="/exams">
                <span>Browse All</span>
                <ChevronRight className="ml-1 size-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-10 rounded-xl px-4 text-xs font-semibold shadow-xs"
            >
              <Link href="/exams">
                <Play className="mr-1 size-3.5" />
                <span>Practice Now</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab 1: Recent Exam Attempts */}
        <TabsContent value="attempts" className="mt-0">
          <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs ring-0 transition-shadow hover:shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
              <div className="flex flex-col gap-1">
                <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                  Exam Session History
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                  Your recent assessment submissions, timestamps, and active
                  attempt tracks.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-7">
              {recentAttempts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="mb-4 flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <BookOpen className="size-7" />
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    No assessments taken yet
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Explore published examinations and start your first test to
                    track performance.
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="mt-6 rounded-xl px-6 text-xs font-semibold shadow-xs"
                  >
                    <Link href="/exams">Browse Exams</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                  {recentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="group flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm sm:p-6"
                    >
                      <div className="min-w-0 space-y-2.5">
                        <div className="flex items-start justify-between gap-2.5">
                          <h4 className="line-clamp-1 font-heading text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                            {attempt.exam.title}
                          </h4>
                          <Badge
                            variant={
                              attempt.status === "COMPLETED"
                                ? "default"
                                : attempt.status === "IN_PROGRESS"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="shrink-0 rounded-lg text-[11px] font-semibold"
                          >
                            {attempt.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <Clock className="size-3.5 text-primary" />
                            <span>{attempt.exam.durationMinutes} min test</span>
                          </span>
                          <span>•</span>
                          <span className="font-medium">
                            Attempt #{attempt.attemptNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-3.5">
                        <span className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                          }).format(new Date(attempt.startedAt))}
                        </span>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl text-xs font-semibold shadow-2xs hover:border-primary/40"
                        >
                          <Link href={`/exams/${attempt.examId}`}>
                            <span>View Test</span>
                            <ArrowRight className="ml-1 size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Due Reviews */}
        <TabsContent value="reviews" className="mt-0">
          <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs ring-0 transition-shadow hover:shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
              <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                Spaced Repetition Due Reviews
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                Questions flagged for recall based on spaced repetition
                intervals.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-7">
              {dueCount === 0 ? (
                <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-emerald-700 dark:text-emerald-400">
                  <Zap className="size-6 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold sm:text-base">
                      You&apos;re completely caught up!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No questions currently due for review. Take more exams to
                      identify focus areas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    You have{" "}
                    <span className="font-bold text-foreground">
                      {dueCount} question{dueCount === 1 ? "" : "s"}
                    </span>{" "}
                    ready to review right now.
                  </p>
                  <Button
                    asChild
                    className="self-start rounded-xl px-5 text-xs font-semibold shadow-xs"
                  >
                    <Link href="/mistakes">
                      <RotateCcw className="mr-1.5 size-4" />
                      <span>Open Mistake Notebook</span>
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Weak Topics */}
        <TabsContent value="topics" className="mt-0">
          <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs ring-0 transition-shadow hover:shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
              <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                Topic Mastery Recommendations
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                Academic subjects that have lower accuracy and benefit from
                targeted practice.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-7">
              {recommendations.weakestTopics.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Complete more test sessions to calculate your topic mastery
                  profile.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5">
                  {recommendations.weakestTopics.map((item) => (
                    <span
                      key={`${item.subject}-${item.topic}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-4 py-2 text-xs font-semibold text-foreground sm:text-sm"
                    >
                      <Target className="size-4 text-primary" />
                      <span>
                        {item.subject} • {item.topic} (
                        {Math.round(item.accuracy * 100)}%)
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
