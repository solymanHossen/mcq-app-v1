import Link from "next/link"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import {
  Trophy,
  Zap,
  Flame,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
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
import { generateDashboardChartData } from "@/lib/chart-data-utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export const metadata = {
  title: "Student Dashboard",
  description: "Track your exam preparation progress, review spaced mistakes, and accelerate your mastery.",
}

export default async function DashboardPage() {
  const user = await requireUser()

  if (isAdminTier(user.role)) redirect("/admin")
  if (user.role === "TEACHER") redirect("/teacher")

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
          createdAt: true,
          lastLoginAt: true,
          isEmailVerified: true,
        },
      }),
      getLearningSummary(user.id),
      getPracticeRecommendations(user.id),
      prisma.examAttempt.findMany({
        where: { studentId: user.id },
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
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* ================= COMPACT PROFILE HERO ================= */}
      <ProfileHero user={heroUser} />

      {/* ================= 4-TILE KPI METRICS ROW (MATCHING REFERENCE SCREENSHOT) ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Level */}
        <DashboardKpiCard
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
          title="Spaced Review"
          value={`${dueCount} Item${dueCount === 1 ? "" : "s"}`}
          badgeText={dueCount > 0 ? "Due Now" : "All Clear"}
          trend={dueCount > 0 ? "down" : "neutral"}
          trendLabel={dueCount > 0 ? "Recall items pending" : "No overdue questions"}
          subtext={dueCount > 0 ? "Boost retention memory" : "Up-to-date with notebook"}
          highlight={dueCount > 0}
          href="/mistakes"
        />
      </div>

      {/* ================= INTERACTIVE STUDY & XP CHART ================= */}
      <DashboardAreaChart
        title="Learning Velocity & Study Activity"
        description="Daily XP earnings and practice assessment volume for the last 3 months"
        data90d={data90d}
        data30d={data30d}
        data7d={data7d}
        primaryLabel="Experience XP"
        secondaryLabel="Practice Focus"
      />

      {/* ================= SUB-NAVIGATION TABS & DATA SECTIONS (MATCHING REFERENCE SCREENSHOT) ================= */}
      <Tabs defaultValue="attempts" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-10 rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="attempts" className="rounded-lg text-xs font-semibold sm:text-sm">
              Recent Attempts ({recentAttempts.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg text-xs font-semibold sm:text-sm">
              Due Reviews ({dueCount})
            </TabsTrigger>
            <TabsTrigger value="topics" className="rounded-lg text-xs font-semibold sm:text-sm">
              Focus Topics ({recommendations.weakestTopics.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button asChild variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold">
              <Link href="/exams">
                <span>Browse All Exams</span>
                <ChevronRight className="ml-1 size-3.5" />
              </Link>
            </Button>
            <Button asChild size="sm" className="h-9 rounded-xl text-xs font-semibold shadow-xs">
              <Link href="/exams">
                <Sparkles className="mr-1 size-3.5" />
                <span>Start Practice</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab 1: Recent Exam Attempts */}
        <TabsContent value="attempts" className="mt-0">
          <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex flex-col gap-1">
                <CardTitle className="font-heading text-lg font-bold text-foreground">
                  Exam Session History
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                  Your recent assessment submissions, timestamps, and active attempt tracks.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {recentAttempts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <BookOpen className="size-6" />
                  </div>
                  <p className="text-base font-bold text-foreground">
                    No assessments taken yet
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Explore published examinations and start your first test to track performance.
                  </p>
                  <Button asChild size="sm" className="mt-5 rounded-xl px-5 text-xs font-semibold shadow-xs">
                    <Link href="/exams">Browse Exams</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {recentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="group flex flex-col justify-between gap-3.5 rounded-xl border border-border/60 bg-muted/20 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 sm:p-5"
                    >
                      <div className="min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-heading text-sm font-bold text-foreground transition-colors group-hover:text-primary line-clamp-1 sm:text-base">
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
                            className="shrink-0 rounded-md text-[10px] font-semibold"
                          >
                            {attempt.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Clock className="size-3 text-primary" />
                            <span>{attempt.exam.durationMinutes} min test</span>
                          </span>
                          <span>•</span>
                          <span className="font-medium">
                            Attempt #{attempt.attemptNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-3">
                        <span className="text-[11px] text-muted-foreground">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                          }).format(new Date(attempt.startedAt))}
                        </span>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-7 rounded-lg text-xs font-semibold shadow-2xs hover:border-primary/40"
                        >
                          <Link href={`/exams/${attempt.examId}`}>
                            <span>View</span>
                            <ArrowRight className="ml-1 size-3" />
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
          <Card className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="font-heading text-lg font-bold text-foreground">
                Spaced Repetition Due Reviews
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Questions flagged for recall based on spaced repetition intervals.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {dueCount === 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-700 dark:text-emerald-400">
                  <Zap className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold sm:text-sm">You&apos;re completely caught up!</p>
                    <p className="text-xs text-muted-foreground">
                      No questions currently due for review. Take more exams to identify focus areas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    You have <span className="font-bold text-foreground">{dueCount} question{dueCount === 1 ? "" : "s"}</span> ready to review right now.
                  </p>
                  <Button asChild className="self-start rounded-xl px-5 text-xs font-semibold shadow-xs">
                    <Link href="/mistakes">
                      <RotateCcw className="mr-1.5 size-3.5" />
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
          <Card className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="font-heading text-lg font-bold text-foreground">
                Topic Mastery Recommendations
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Academic subjects that have lower accuracy and benefit from targeted practice.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recommendations.weakestTopics.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Complete more test sessions to calculate your topic mastery profile.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {recommendations.weakestTopics.map((item) => (
                    <span
                      key={`${item.subject}-${item.topic}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground"
                    >
                      <Target className="size-3.5 text-primary" />
                      <span>
                        {item.subject} • {item.topic} ({Math.round(item.accuracy * 100)}%)
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
