import Link from "next/link"
import { requireRole } from "@/lib/auth/guards"
import { getLearningSummary } from "@/lib/learning/queries"
import { getPracticeRecommendations } from "@/lib/learning/recommendations"
import { getSubjectTopicPerformance, getOverallStats } from "@/lib/analytics/engine"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ProgressPage() {
  const user = await requireRole("STUDENT")

  const [summary, recommendations, topicPerformance, overall] = await Promise.all([
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
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your progress</h1>
        <Link href="/mistakes" className="text-sm hover:underline">
          Mistake notebook
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Level {summary.level}</CardDescription>
            <CardTitle>{summary.totalXP} XP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.xpIntoLevel} / {summary.xpForNextLevel} XP to level {summary.level + 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Current streak</CardDescription>
            <CardTitle>
              {summary.currentStreak} day{summary.currentStreak === 1 ? "" : "s"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Longest: {summary.longestStreak} day{summary.longestStreak === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Overall accuracy</CardDescription>
            <CardTitle>{Math.round(overall.accuracy * 100)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {overall.totalCorrect} / {overall.totalAnswered} answered correctly across{" "}
              {overall.examsCompleted} exam{overall.examsCompleted === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {summary.badges.map((badge) => (
            <Badge
              key={badge.key}
              variant={badge.earned ? "default" : "outline"}
              className={cn(!badge.earned && "text-muted-foreground opacity-60")}
              title={badge.description}
            >
              {badge.name}
            </Badge>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Recommended practice</h2>
        {recommendations.dueReviews.length === 0 && recommendations.weakestTopics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing due right now — keep taking exams to build up your practice history.
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
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <span>
                  {topic.subject} · {topic.topic}
                </span>
                <Badge variant="outline">{Math.round(topic.accuracy * 100)}% accuracy</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Performance by subject &amp; topic</h2>
        {topicPerformance.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Complete an exam to see your subject and topic breakdown here.
          </p>
        ) : (
          <Table>
            <TableHeader>
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
                  <TableCell className="text-right">{t.totalAnswered}</TableCell>
                  <TableCell className="text-right">{Math.round(t.accuracy * 100)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
