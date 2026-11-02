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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
        className="rounded-2xl border border-solid border-border/70 p-4 shadow-xs backdrop-blur-none sm:p-6 lg:p-7 dark:shadow-xs [&_button]:max-w-full [&_button_span]:break-all [&_h1]:text-2xl [&_h1]:break-words sm:[&_h1]:text-3xl lg:[&_h1]:text-4xl [&>div:last-child]:min-w-0 lg:[&>div:last-child]:flex-col lg:[&>div:last-child]:items-stretch xl:[&>div:last-child]:flex-row xl:[&>div:last-child]:items-center [&>div:last-child>div:first-child]:min-w-0 [&>div[aria-hidden]]:hidden"
      />

      {/* ================= QUICK LEARNER ACTION HUB ================= */}
      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <Link
          href="/exams"
          className="group min-w-0 rounded-2xl focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
        >
          <Card className="h-full min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm sm:p-6 lg:p-7">
            <CardContent className="flex min-w-0 items-center justify-between gap-3 p-0">
              <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20 sm:size-11 sm:rounded-2xl">
                  <BookOpen className="size-4 sm:size-5" />
                </span>
                <div className="min-w-0">
                  <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                    Take Exams
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    Explore active assessments
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground sm:size-5" />
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/mistakes"
          className="group min-w-0 rounded-2xl focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
        >
          <Card className="h-full min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm sm:p-6 lg:p-7">
            <CardContent className="flex min-w-0 items-center justify-between gap-3 p-0">
              <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shadow-2xs ring-1 ring-amber-500/20 sm:size-11 sm:rounded-2xl dark:bg-amber-500/15 dark:text-amber-400">
                  <RotateCcw className="size-4 sm:size-5" />
                </span>
                <div className="min-w-0">
                  <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                    Mistake Notebook
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    Spaced repetition reviews ({dueCount})
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground sm:size-5" />
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/leaderboard"
          className="group min-w-0 rounded-2xl focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
        >
          <Card className="h-full min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm sm:p-6 lg:p-7">
            <CardContent className="flex min-w-0 items-center justify-between gap-3 p-0">
              <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shadow-2xs ring-1 ring-emerald-500/20 sm:size-11 sm:rounded-2xl dark:bg-emerald-500/15 dark:text-emerald-400">
                  <Trophy className="size-4 sm:size-5" />
                </span>
                <div className="min-w-0">
                  <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                    Leaderboard
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    Rank among platform peers
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground sm:size-5" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ================= 4-TILE GRAND KPI METRICS ROW ================= */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {/* KPI 1: Level */}
        <DashboardKpiCard
          className="h-full min-w-0 rounded-2xl border-border/70 p-4 shadow-xs hover:translate-y-0 hover:shadow-sm sm:p-6 lg:p-7 [&_.truncate]:overflow-visible [&_.truncate]:whitespace-normal"
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
          className="h-full min-w-0 rounded-2xl border-border/70 p-4 shadow-xs hover:translate-y-0 hover:shadow-sm sm:p-6 lg:p-7 [&_.truncate]:overflow-visible [&_.truncate]:whitespace-normal"
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
          className="h-full min-w-0 rounded-2xl border-border/70 p-4 shadow-xs hover:translate-y-0 hover:shadow-sm sm:p-6 lg:p-7 [&_.truncate]:overflow-visible [&_.truncate]:whitespace-normal"
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
          className="h-full min-w-0 rounded-2xl border-border/70 p-4 shadow-xs hover:translate-y-0 hover:shadow-sm sm:p-6 lg:p-7 [&_.truncate]:overflow-visible [&_.truncate]:whitespace-normal"
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
                className="min-h-10 rounded-xl px-4 text-xs font-bold sm:text-sm"
              >
                Session History ({recentAttempts.length})
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="min-h-10 rounded-xl px-4 text-xs font-bold sm:text-sm"
              >
                Due Reviews ({dueCount})
              </TabsTrigger>
              <TabsTrigger
                value="topics"
                className="min-h-10 rounded-xl px-4 text-xs font-bold sm:text-sm"
              >
                Focus Topics ({recommendations.weakestTopics.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Quick Search & Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <DebouncedSearchInput
              placeholder="Filter exam attempts..."
              size="default"
              className="w-full min-w-0 flex-1 basis-full sm:w-64 sm:min-w-48 sm:basis-auto"
              inputClassName="h-11 rounded-xl bg-muted/20 text-base shadow-2xs focus-visible:ring-4 focus-visible:ring-primary/15 sm:h-12 sm:rounded-2xl md:text-sm"
            />
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl border-border/70 px-4 text-xs font-semibold shadow-2xs sm:text-sm"
            >
              <Link href="/exams">
                <span>Browse All</span>
                <ChevronRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="rounded-xl px-4 text-xs font-semibold shadow-xs sm:text-sm"
            >
              <Link href="/exams">
                <Play data-icon="inline-start" />
                <span>Practice Now</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab 1: Recent Exam Attempts */}
        <TabsContent value="attempts" className="mt-0">
          <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs transition-shadow hover:shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
              <div className="flex flex-col gap-1">
                <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                  <h2>Exam Session History</h2>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                  Your recent assessment submissions, timestamps, and active
                  attempt tracks.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-7">
              {recentAttempts.length === 0 ? (
                <Empty className="px-0 py-8 sm:py-12">
                  <EmptyHeader>
                    <EmptyMedia
                      variant="icon"
                      className="size-9 rounded-xl sm:size-11 sm:rounded-2xl"
                    >
                      <BookOpen />
                    </EmptyMedia>
                    <EmptyTitle className="text-base font-bold text-foreground sm:text-xl">
                      No assessments taken yet
                    </EmptyTitle>
                    <EmptyDescription className="text-xs sm:text-sm">
                      Explore published examinations and start your first test
                      to track performance.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      asChild
                      size="lg"
                      className="w-full rounded-xl px-6 font-bold shadow-sm sm:w-auto"
                    >
                      <Link href="/exams">Browse Exams</Link>
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                  {recentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="group flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 sm:p-6"
                    >
                      <div className="flex min-w-0 flex-col gap-2.5">
                        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2.5">
                          <h3 className="min-w-0 flex-1 basis-40 font-heading text-sm font-bold wrap-anywhere text-foreground transition-colors group-hover:text-primary sm:text-base">
                            {attempt.exam.title}
                          </h3>
                          <Badge
                            variant={
                              attempt.status === "COMPLETED"
                                ? "default"
                                : attempt.status === "IN_PROGRESS"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="shrink-0 rounded-full border border-border/60 px-2.5 py-0.5 text-[11px] font-semibold sm:text-xs"
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

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
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
                          className="h-10 rounded-xl border-border/70 px-3 text-xs font-semibold shadow-2xs hover:border-primary/40 sm:text-sm cursor-pointer"
                        >
                          <Link
                            href={
                              attempt.status === "COMPLETED" || attempt.status === "TIMEOUT"
                                ? `/exams/${attempt.examId}/attempt/${attempt.id}`
                                : `/exams/${attempt.examId}`
                            }
                          >
                            <span>
                              {attempt.status === "COMPLETED" || attempt.status === "TIMEOUT"
                                ? "View Result"
                                : "View Test"}
                            </span>
                            <ArrowRight data-icon="inline-end" />
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
          <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs transition-shadow hover:shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
              <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                <h2>Spaced Repetition Due Reviews</h2>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                Questions flagged for recall based on spaced repetition
                intervals.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-7">
              {dueCount === 0 ? (
                <Alert className="rounded-2xl border-border/70 bg-muted/20 p-4 shadow-xs sm:p-6">
                  <Zap />
                  <AlertTitle className="text-sm font-bold sm:text-base">
                    You&apos;re completely caught up!
                  </AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground sm:text-sm">
                    No questions currently due for review. Take more exams to
                    identify focus areas.
                  </AlertDescription>
                </Alert>
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
                    size="lg"
                    className="h-10 sm:h-11 w-full sm:w-auto self-start rounded-xl px-5 font-bold shadow-2xs active:scale-95 transition-all text-xs sm:text-sm"
                  >
                    <Link href="/mistakes">
                      <RotateCcw data-icon="inline-start" />
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
          <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs transition-shadow hover:shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
              <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                <h2>Topic Mastery Recommendations</h2>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                Academic subjects that have lower accuracy and benefit from
                targeted practice.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-7">
              {recommendations.weakestTopics.length === 0 ? (
                <Empty className="p-4 sm:p-6">
                  <EmptyDescription className="text-xs sm:text-sm">
                    Complete more test sessions to calculate your topic mastery
                    profile.
                  </EmptyDescription>
                </Empty>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5">
                  {recommendations.weakestTopics.map((item) => (
                    <Badge
                      key={`${item.subject}-${item.topic}`}
                      variant="outline"
                      className="max-w-full gap-2 rounded-xl border-border/60 bg-muted/20 px-3 py-2 text-xs font-semibold whitespace-normal sm:rounded-2xl sm:px-4 sm:text-sm"
                    >
                      <Target className="size-4 text-primary" />
                      <span className="min-w-0 wrap-anywhere">
                        {item.subject} • {item.topic} (
                        {Math.round(item.accuracy * 100)}%)
                      </span>
                    </Badge>
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
