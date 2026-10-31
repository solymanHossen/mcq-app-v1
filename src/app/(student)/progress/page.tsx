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
    <div className="w-full min-w-0 space-y-6 pb-12 sm:space-y-8 sm:pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 sm:pb-4">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Your progress
        </h1>
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-xl text-sm font-semibold shadow-2xs"
        >
          <Link href="/mistakes">Mistake notebook</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs ring-0 transition-shadow hover:shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
            <CardDescription>Level {summary.level}</CardDescription>
            <CardTitle className="text-base font-bold tracking-tight sm:text-xl">
              {summary.totalXP} XP
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-7">
            <div
              role="progressbar"
              aria-label="Progress to next level"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={levelProgressPct}
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.xpIntoLevel} / {summary.xpForNextLevel} XP to level{" "}
              {summary.level + 1}
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs ring-0 transition-shadow hover:shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
            <CardDescription>Current streak</CardDescription>
            <CardTitle className="text-base font-bold tracking-tight sm:text-xl">
              {summary.currentStreak} day
              {summary.currentStreak === 1 ? "" : "s"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-7">
            <p className="text-xs text-muted-foreground">
              Longest: {summary.longestStreak} day
              {summary.longestStreak === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs ring-0 transition-shadow hover:shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
            <CardDescription>Overall accuracy</CardDescription>
            <CardTitle className="text-base font-bold tracking-tight sm:text-xl">
              {Math.round(overall.accuracy * 100)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-7">
            <p className="text-xs text-muted-foreground">
              {overall.totalCorrect} / {overall.totalAnswered} answered
              correctly across {overall.examsCompleted} exam
              {overall.examsCompleted === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="min-w-0 space-y-5 rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-6 lg:p-7">
        <h2 className="font-heading text-base font-bold tracking-tight sm:text-xl">
          Badges
        </h2>
        <div className="flex flex-wrap gap-2">
          {summary.badges.map((badge) => (
            <Badge
              key={badge.key}
              variant={badge.earned ? "default" : "outline"}
              className={cn(
                !badge.earned && "text-muted-foreground opacity-60"
              )}
              title={badge.description}
            >
              {badge.name}
            </Badge>
          ))}
        </div>
      </section>

      <section className="min-w-0 space-y-5 rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-6 lg:p-7">
        <h2 className="font-heading text-base font-bold tracking-tight sm:text-xl">
          Recommended practice
        </h2>
        {recommendations.dueReviews.length === 0 &&
        recommendations.weakestTopics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing due right now — keep taking exams to build up your practice
            history.
          </p>
        ) : (
          <div className="space-y-3">
            {recommendations.dueReviews.length > 0 && (
              <p className="text-sm">
                <Link href="/mistakes" className="font-medium hover:underline">
                  {recommendations.dueReviews.length} question
                  {recommendations.dueReviews.length === 1 ? "" : "s"}
                </Link>{" "}
                due for review in your mistake notebook.
              </p>
            )}
            {recommendations.weakestTopics.map((topic) => (
              <div
                key={`${topic.subject}-${topic.topic}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-2 text-sm"
              >
                <span>
                  {topic.subject} · {topic.topic}
                </span>
                <Badge variant="outline">
                  {Math.round(topic.accuracy * 100)}% accuracy
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="min-w-0 space-y-5 rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-6 lg:p-7">
        <h2 className="font-heading text-base font-bold tracking-tight sm:text-xl">
          Performance by subject &amp; topic
        </h2>
        {topicPerformance.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Complete an exam to see your subject and topic breakdown here.
          </p>
        ) : (
          <div className="min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead className="text-right">Answered</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topicPerformance.map((t) => (
                  <TableRow key={`${t.subject}-${t.topic}`}>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell>{t.topic}</TableCell>
                    <TableCell className="text-right">
                      {t.totalAnswered}
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(t.accuracy * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
