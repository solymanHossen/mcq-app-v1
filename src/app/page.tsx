import Link from "next/link"
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const FEATURES = [
  {
    icon: BookOpen,
    title: "Question bank & exam builder",
    description:
      "Build a reusable question bank and assemble timed exams from it in minutes.",
  },
  {
    icon: CheckCircle2,
    title: "Instant auto-grading",
    description:
      "MCQ and numeric answers are graded the moment an exam ends — no manual marking.",
  },
  {
    icon: Trophy,
    title: "Live leaderboards",
    description:
      "Students see a fair, real-time ranking for every exam as soon as results are published.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-cheat proctoring",
    description:
      "Tab switches and timing anomalies are detected, rate-limited, and reviewable by teachers.",
  },
  {
    icon: Sparkles,
    title: "AI-powered explanations",
    description:
      "Students get an instant explanation for every mistake, with a path to appeal disputed answers.",
  },
  {
    icon: Flame,
    title: "Gamified learning",
    description:
      "XP, streaks, spaced repetition, and badges turn exam prep into a habit students keep up.",
  },
] as const

const TEACHER_POINTS = [
  "Create and tag questions once, reuse them across many exams",
  "Set time limits, shuffle order, and schedule availability",
  "Review flagged questions and resolve proctoring appeals",
  "Track class performance with built-in analytics",
] as const

const STUDENT_POINTS = [
  "Take exams on a clean, distraction-free timed interface",
  "See results and leaderboard rank the moment they're published",
  "Review mistakes with AI explanations and spaced-repetition practice",
  "Build streaks and earn badges for consistent study",
] as const

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="font-heading text-sm font-semibold tracking-tight">
            ExamHub
          </span>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
          <Badge variant="secondary">AI-powered &bull; Proctored &bull; Gamified</Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Run fair, auto-graded exams your students actually enjoy
          </h1>
          <p className="max-w-xl text-pretty text-muted-foreground">
            ExamHub gives teachers a question bank, timed exams, and
            proctoring in one place, and gives students instant grading,
            leaderboards, and AI explanations the moment an exam ends.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">Create your first exam</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="mb-2 size-5 text-primary" />
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="mx-auto max-w-6xl" />

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-10 sm:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="font-heading text-xl font-semibold">
                For teachers
              </h2>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                {TEACHER_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="font-heading text-xl font-semibold">
                For students
              </h2>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                {STUDENT_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <BarChart3 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <Card className="items-center gap-4 bg-muted/40 py-12 text-center ring-0">
            <CardHeader className="items-center gap-2 text-center">
              <CardTitle className="text-2xl">
                Ready to run your first exam?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Free to start. No credit card required.
            </CardContent>
            <Button size="lg" asChild>
              <Link href="/register">Get started for free</Link>
            </Button>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>&copy; 2026 ExamHub</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
