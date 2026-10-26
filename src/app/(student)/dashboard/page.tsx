import Link from "next/link"
import { redirect } from "next/navigation"
import { Trophy, Zap, Flame, RotateCcw } from "lucide-react"
import { requireUser } from "@/lib/authorization"
import { getLearningSummary } from "@/modules/learning/queries"
import { getPracticeRecommendations } from "@/modules/learning/recommendations"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function DashboardPage() {
  const user = await requireUser()

  // /dashboard is the generic post-login landing spot (login's callbackUrl,
  // and the public-route redirect in proxy.ts both send everyone here
  // regardless of role) — admins and teachers have their own dashboards
  // with real content, so send them there instead of showing this bare page.
  if (user.role === "ADMIN") redirect("/admin")
  if (user.role === "TEACHER") redirect("/teacher")

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s where your studying stands today.
        </p>
      </div>

      <StudentLearningWidget studentId={user.id} />
    </div>
  )
}

async function StudentLearningWidget({ studentId }: { studentId: string }) {
  const [summary, recommendations] = await Promise.all([
    getLearningSummary(studentId),
    getPracticeRecommendations(studentId),
  ])

  const dueCount = recommendations.dueReviews.length

  const stats = [
    { label: "Level", value: summary.level, icon: Trophy, highlight: false, href: undefined },
    { label: "Total XP", value: summary.totalXP, icon: Zap, highlight: false, href: undefined },
    {
      label: "Current streak",
      value: `${summary.currentStreak}d`,
      icon: Flame,
      highlight: false,
      href: undefined,
    },
    {
      label: "Due for review",
      value: dueCount,
      icon: RotateCcw,
      highlight: dueCount > 0,
      href: "/mistakes",
    },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, highlight, href }) => {
        const content = (
          <Card className="h-full gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30">
            <CardHeader>
              <span
                className={`mb-2 flex size-9 items-center justify-center rounded-lg ${
                  highlight ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                }`}
              >
                <Icon className="size-4.5" />
              </span>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        )

        return href ? (
          <Link key={label} href={href}>
            {content}
          </Link>
        ) : (
          <div key={label}>{content}</div>
        )
      })}
    </div>
  )
}
