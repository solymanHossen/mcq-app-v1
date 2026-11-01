import Link from "next/link"
import { redirect } from "next/navigation"
import { requireRole } from "@/lib/authorization"
import { getLearningSummary } from "@/modules/learning/queries"
import { getPracticeRecommendations } from "@/modules/learning/recommendations"
import {
  getSubjectTopicPerformance,
  getOverallStats,
} from "@/modules/analytics/engine"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription } from "@/components/ui/empty"
import {
  Zap,
  Flame,
  Target,
  Trophy,
  RotateCcw,
  BarChart3,
  BookOpen,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ProgressPage() {
  const user = await requireRole("STUDENT")
  if (user.isGuest) redirect("/exams")

  const [summary, recommendations, topicPerformance, overall] =
    await Promise.all([
      getLearningSummary(user.id),
      getPracticeRecommendations(user.id),
      getSubjectTopicPerformance(user.id),
      getOverallStats(user.id),
    ])

  const levelProgressPct = Math.min(
    100,
    Math.round((summary.xpIntoLevel / summary.xpForNextLevel) * 100)
  )

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Academic Progress
          </h1>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
          >
            <Trophy className="size-3 text-primary" />
            <span>Level {summary.level} Candidate</span>
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
          >
            {summary.totalXP} Total XP
          </Badge>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 sm:h-9.5 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs active:scale-95 transition-all gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Link href="/mistakes">
            <RotateCcw className="size-3.5" />
            <span>Mistake Notebook</span>
          </Link>
        </Button>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed -mt-2">
        Continuous performance analytics across examination attempts, streak momentum, earned achievement badges, and academic topic accuracy.
      </p>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Level Progress */}
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between">
          <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
            <div className="flex items-center gap-3">
              <div className="size-9 sm:size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                <Zap className="size-4.5 sm:size-5" />
              </div>
              <div>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Rank Tier
                </CardDescription>
                <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                  Level {summary.level}
                </CardTitle>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full text-xs font-bold px-2.5 py-0.5 border-border/70">
              {summary.totalXP} XP
            </Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-7 space-y-3">
            <div
              role="progressbar"
              aria-label="Progress to next level"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={levelProgressPct}
              className="h-2.5 overflow-hidden rounded-full bg-muted/60 border border-border/50"
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>{summary.xpIntoLevel} / {summary.xpForNextLevel} XP</span>
              <span>{levelProgressPct}% to Level {summary.level + 1}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Current Streak */}
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between">
          <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
            <div className="flex items-center gap-3">
              <div className="size-9 sm:size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-amber-500/20">
                <Flame className="size-4.5 sm:size-5" />
              </div>
              <div>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Study Habit
                </CardDescription>
                <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                  {summary.currentStreak} Day{summary.currentStreak === 1 ? "" : "s"}
                </CardTitle>
              </div>
            </div>
            <Badge variant="secondary" className="rounded-full text-xs font-bold px-2.5 py-0.5">
              Active Streak
            </Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-7 space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Personal Best: <strong className="text-foreground">{summary.longestStreak} consecutive day{summary.longestStreak === 1 ? "" : "s"}</strong>
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Take an assessment daily to preserve your streak multiplier.
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Overall Accuracy */}
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between">
          <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
            <div className="flex items-center gap-3">
              <div className="size-9 sm:size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-emerald-500/20">
                <Target className="size-4.5 sm:size-5" />
              </div>
              <div>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Platform Accuracy
                </CardDescription>
                <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                  {Math.round(overall.accuracy * 100)}%
                </CardTitle>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full text-xs font-bold px-2.5 py-0.5 border-border/70">
              {overall.examsCompleted} exam{overall.examsCompleted === 1 ? "" : "s"}
            </Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-7 space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              <strong className="text-foreground">{overall.totalCorrect}</strong> / {overall.totalAnswered} questions answered correctly
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Based on official completed exam submissions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Card */}
      <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
        <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-purple-500/20">
              <Trophy className="size-4.5 sm:size-5.5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                Earned Achievement Badges
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Milestones unlocked through continuous assessment activity and test performance
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 border-border/70">
            {summary.badges.filter((b) => b.earned).length} of {summary.badges.length} Unlocked
          </Badge>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <div className="flex flex-wrap gap-2.5">
            {summary.badges.map((badge) => (
              <Badge
                key={badge.key}
                variant={badge.earned ? "default" : "outline"}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all select-none gap-1.5",
                  badge.earned
                    ? "shadow-2xs font-bold border-primary/40"
                    : "text-muted-foreground opacity-50 border-dashed border-border/80"
                )}
                title={badge.description}
              >
                <span>{badge.earned ? "★" : "○"}</span>
                <span>{badge.name}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Practice Card */}
      <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
        <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-blue-500/20">
              <RotateCcw className="size-4.5 sm:size-5.5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                Targeted Practice Recommendations
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Focus areas identified from your incorrect responses and spaced repetition schedule
              </CardDescription>
            </div>
          </div>
          {recommendations.dueReviews.length > 0 && (
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-bold">
              {recommendations.dueReviews.length} Overdue
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6 lg:p-7">
          {recommendations.dueReviews.length === 0 &&
          recommendations.weakestTopics.length === 0 ? (
            <Empty className="p-4 sm:p-6">
              <EmptyDescription className="text-xs sm:text-sm text-muted-foreground">
                Nothing due right now — keep taking exams to build up your practice history and recommendation engine.
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="space-y-4">
              {recommendations.dueReviews.length > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 sm:p-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold">
                    <RotateCcw className="size-4 text-amber-500 shrink-0" />
                    <span>You have {recommendations.dueReviews.length} question{recommendations.dueReviews.length === 1 ? "" : "s"} pending in your notebook</span>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="h-8 rounded-lg font-bold text-xs shadow-2xs active:scale-95 transition-all"
                  >
                    <Link href="/mistakes">
                      <span>Review Now</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              )}

              {recommendations.weakestTopics.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Weakest Subject Topics
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendations.weakestTopics.map((topic) => (
                      <div
                        key={`${topic.subject}-${topic.topic}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-3.5 text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0 font-medium">
                          <BookOpen className="size-4 text-primary shrink-0" />
                          <span className="truncate">{topic.subject} · {topic.topic}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 rounded-full border-border/70 text-xs font-semibold"
                        >
                          {Math.round(topic.accuracy * 100)}% accuracy
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance by Subject & Topic Table Card */}
      <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
        <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-sky-500/20">
              <BarChart3 className="size-4.5 sm:size-5.5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                Performance by Subject &amp; Topic
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Detailed accuracy statistics broken down by individual curricula subjects and chapters
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 border-border/70">
            {topicPerformance.length} topics logged
          </Badge>
        </CardHeader>

        <CardContent className="min-w-0 p-0 overflow-x-auto">
          {topicPerformance.length === 0 ? (
            <div className="p-6 sm:p-10 text-center">
              <Empty className="p-0">
                <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  Complete your first exam to populate the subject and topic performance matrix.
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <Table className="text-xs sm:text-sm">
              <TableHeader className="bg-muted/15">
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="font-bold">Subject</TableHead>
                  <TableHead className="font-bold">Topic</TableHead>
                  <TableHead className="text-right font-bold">Answered</TableHead>
                  <TableHead className="text-right font-bold">Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topicPerformance.map((t) => (
                  <TableRow key={`${t.subject}-${t.topic}`} className="border-border/50 hover:bg-muted/30 transition-colors">
                    <TableCell className="min-w-28 font-semibold text-foreground whitespace-normal py-3 sm:py-4">
                      {t.subject}
                    </TableCell>
                    <TableCell className="min-w-28 text-muted-foreground whitespace-normal py-3 sm:py-4 font-medium">
                      {t.topic}
                    </TableCell>
                    <TableCell className="text-right py-3 sm:py-4 font-medium">
                      {t.totalAnswered}
                    </TableCell>
                    <TableCell className="text-right py-3 sm:py-4">
                      <Badge
                        variant={t.accuracy >= 0.75 ? "default" : t.accuracy >= 0.5 ? "secondary" : "outline"}
                        className="rounded-full font-bold text-xs"
                      >
                        {Math.round(t.accuracy * 100)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

