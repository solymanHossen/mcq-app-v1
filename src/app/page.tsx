import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/lib/config"

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

const STEPS = [
  {
    step: "01",
    title: "Build your question bank",
    description:
      "Write or import questions once, tag them by topic and difficulty, then reuse them across every exam.",
  },
  {
    step: "02",
    title: "Assemble & schedule an exam",
    description:
      "Set a time limit, shuffle order, pick a window, and publish — students get a clean, distraction-free runner.",
  },
  {
    step: "03",
    title: "Results, instantly",
    description:
      "Auto-grading, leaderboards, and AI explanations land the second the exam closes. No manual marking.",
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
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-heading text-base font-semibold tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#audiences" className="transition-colors hover:text-foreground">
              Teachers & students
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get started
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_10%,transparent_70%)]"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-[-12rem] -z-10 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 pt-24 pb-20 text-center sm:pt-32">
            <Badge variant="secondary" className="gap-1.5 py-1 pl-1.5">
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-2.5" />
              </span>
              AI-powered &bull; Proctored &bull; Gamified
            </Badge>

            <h1 className="text-balance font-heading text-5xl leading-[1.05] font-semibold tracking-tight sm:text-7xl lg:text-8xl">
              Exams that grade{" "}
              <span className="bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                themselves
              </span>
            </h1>

            <p className="max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              {APP_NAME} gives teachers a question bank, timed exams, and
              proctoring in one place — and gives students instant grading,
              leaderboards, and AI explanations the moment an exam ends.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="h-12 px-6 text-base" asChild>
                <Link href="/register">
                  Create your first exam
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>

            {/* Product preview */}
            <div className="mt-8 w-full">
              <ExamPreviewCard />
            </div>
          </div>
        </section>

        {/* Capability strip */}
        <section className="border-y border-border/60 bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-6 text-sm font-medium text-muted-foreground">
            {[
              "Timed & proctored",
              "Auto-graded in real time",
              "Live leaderboards",
              "AI explanations",
              "Streaks & XP",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-28">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge variant="outline">Features</Badge>
            <h2 className="mt-4 text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              Everything an exam needs, nothing it doesn&apos;t
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              One platform for building, running, and grading exams — built
              for classrooms that want speed and fairness.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="group gap-3 border-none p-2 shadow-none ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/30"
              >
                <CardHeader>
                  <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-muted/30 py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge variant="outline">How it works</Badge>
              <h2 className="mt-4 text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                From question bank to results in three steps
              </h2>
            </div>

            <div className="grid gap-10 sm:grid-cols-3">
              {STEPS.map(({ step, title, description }, index) => (
                <div key={step} className="relative flex flex-col gap-3">
                  <span className="font-heading text-5xl font-semibold text-primary/15">
                    {step}
                  </span>
                  <h3 className="font-heading text-xl font-semibold">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="absolute top-2 -right-7 hidden size-5 text-border sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Teachers & students */}
        <section id="audiences" className="mx-auto max-w-6xl px-6 py-28">
          <div className="grid gap-6 lg:grid-cols-2">
            <AudiencePanel
              badge="For teachers"
              title="Spend time teaching, not grading"
              points={TEACHER_POINTS}
              icon={BookOpen}
              accent="from-primary/10 via-primary/5"
            />
            <AudiencePanel
              badge="For students"
              title="Know where you stand, instantly"
              points={STUDENT_POINTS}
              icon={BarChart3}
              accent="from-chart-2/15 via-chart-2/5"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-28">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-foreground px-8 py-20 text-center text-background">
            <div
              aria-hidden
              className="absolute left-1/2 top-0 -z-0 h-[24rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl"
            />
            <div className="relative flex flex-col items-center gap-6">
              <Timer className="size-10 text-background/70" />
              <h2 className="max-w-2xl text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                Ready to run your first exam?
              </h2>
              <p className="max-w-md text-pretty text-background/70">
                Free to start. No credit card required.
              </p>
              <Button
                size="lg"
                className="h-12 bg-background px-6 text-base text-foreground hover:bg-background/90"
                asChild
              >
                <Link href="/register">
                  Get started for free
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>&copy; {new Date().getFullYear()} {APP_NAME}</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register" className="transition-colors hover:text-foreground">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function AudiencePanel({
  badge,
  title,
  points,
  icon: Icon,
  accent,
}: {
  badge: string
  title: string
  points: readonly string[]
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-3xl border border-border/60 bg-gradient-to-b to-transparent p-8 sm:p-10",
        accent
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-background text-primary ring-1 ring-foreground/10">
        <Icon className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit">
          {badge}
        </Badge>
        <h3 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h3>
      </div>
      <ul className="flex flex-col gap-4">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ExamPreviewCard() {
  const options = [
    { label: "A", text: "O(log n)", correct: false },
    { label: "B", text: "O(n)", correct: true },
    { label: "C", text: "O(n²)", correct: false },
    { label: "D", text: "O(1)", correct: false },
  ] as const

  const leaderboard = [
    { name: "AR", score: 98 },
    { name: "MS", score: 95 },
    { name: "JD", score: 91 },
  ] as const

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-2xl shadow-foreground/10 ring-1 ring-foreground/5">
        <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-4 py-3">
          <span className="size-2.5 rounded-full bg-destructive/40" />
          <span className="size-2.5 rounded-full bg-chart-2/40" />
          <span className="size-2.5 rounded-full bg-primary/40" />
          <span className="ml-3 text-xs text-muted-foreground">
            Data Structures &mdash; Mock Test
          </span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Timer className="size-3" />
            18:42
          </span>
        </div>

        <div className="grid gap-0 sm:grid-cols-5">
          <div className="flex flex-col gap-4 p-6 sm:col-span-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Question 7 of 25</span>
              <span>Single choice</span>
            </div>
            <p className="font-heading text-base font-medium sm:text-lg">
              What is the time complexity of binary search on a sorted array
              of size n?
            </p>
            <div className="flex flex-col gap-2">
              {options.map((option) => (
                <div
                  key={option.label}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                    option.correct
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border/60 text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                      option.correct
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    )}
                  >
                    {option.correct ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      option.label
                    )}
                  </span>
                  {option.text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-border/60 bg-muted/30 p-6 sm:col-span-2 sm:border-t-0 sm:border-l">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Trophy className="size-3.5 text-primary" />
              Live leaderboard
            </div>
            <div className="flex flex-col gap-2.5">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-2.5 rounded-lg bg-background px-2.5 py-2 text-xs ring-1 ring-foreground/5"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                    {index + 1}
                  </span>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-medium">
                    {entry.name}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${entry.score}%` }}
                    />
                  </div>
                  <span className="font-medium">{entry.score}%</span>
                </div>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-2 rounded-lg bg-background px-2.5 py-2 text-xs ring-1 ring-foreground/5">
              <Flame className="size-4 text-primary" />
              <span className="text-muted-foreground">7-day streak</span>
              <span className="ml-auto font-medium">+120 XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-5 -left-5 hidden rotate-[-4deg] items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex">
        <CheckCircle2 className="size-4 text-primary" />
        Auto-graded instantly
      </div>
      <div className="absolute -right-5 -bottom-5 hidden rotate-[3deg] items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex">
        <ShieldCheck className="size-4 text-primary" />
        Tab-switch detected & logged
      </div>
    </div>
  )
}
