import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Brain,
  Timer,
  Trophy,
  Users,
  ClipboardCheck,
  KeyRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { HeroSection } from "@/components/landing/hero-section"
import { getSystemSettings } from "@/modules/settings/queries"

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
    icon: Brain,
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
      "Grade submissions, review outcomes, and publish results with rankings and explanations for your students.",
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

const ASSESSMENT_CONTROLS = [
  {
    icon: ShieldCheck,
    title: "Verified educators",
    description:
      "Teacher verification helps control who can publish assessments on the platform.",
  },
  {
    icon: KeyRound,
    title: "Flexible exam access",
    description:
      "Choose public or shared assessments and configure guest access for your candidates.",
  },
  {
    icon: ClipboardCheck,
    title: "Review and corrections",
    description:
      "Review reported questions, correct answer keys, and update affected results.",
  },
  {
    icon: Users,
    title: "Results on your terms",
    description:
      "Review assessment outcomes and publish results when you are ready to share them.",
  },
] as const

const containerClassName = "container mx-auto px-4 sm:px-6 lg:px-8"
const cardClassName =
  "min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card py-0 shadow-xs ring-0"

export default async function LandingPage() {
  const settings = await getSystemSettings()

  return (
    <main className="min-w-0">
      <HeroSection settings={settings} />

      <section
        id="features"
        className="scroll-mt-28 border-y border-border/60 bg-muted/20 py-8 sm:py-12 lg:py-16"
      >
        <div className={containerClassName}>
          <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-4">
              <SectionHeading
                badge="Features"
                title="Everything your next assessment needs"
              />
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Build, deliver, and review assessments in one place. Give
                teachers clear controls and students a focused way to learn.
              </p>
            </div>
            <Card className={`${cardClassName} lg:col-span-8`}>
              <CardContent className="grid grid-cols-1 p-0 sm:grid-cols-2">
                {FEATURES.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex min-w-0 items-start gap-3 border-b border-border/50 p-4 last:border-b-0 sm:p-6 sm:odd:border-r lg:p-7 sm:[&:nth-last-child(2)]:border-b-0"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 sm:size-11">
                      <Icon className="size-4 sm:size-5" />
                    </span>
                    <div className="min-w-0 space-y-2">
                      <h3 className="font-heading text-base font-bold tracking-tight text-foreground">
                        {title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-28 py-8 sm:py-12 lg:py-16"
      >
        <div className={containerClassName}>
          <SectionHeading
            badge="How it works"
            title="One connected assessment workflow"
          />
          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-3">
            {STEPS.map(({ step, title, description }) => (
              <Card key={step} className={cardClassName}>
                <CardHeader className="flex flex-row items-start gap-3 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-heading text-sm font-bold text-primary ring-1 ring-primary/20">
                    {step}
                  </span>
                  <CardTitle className="self-center text-base font-bold tracking-tight sm:text-xl">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm leading-relaxed text-muted-foreground sm:p-6 lg:p-7">
                  {description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="audiences"
        className="scroll-mt-28 border-y border-border/60 bg-muted/20 py-8 sm:py-12 lg:py-16"
      >
        <div className={containerClassName}>
          <SectionHeading
            badge="Teachers & students"
            title="Two perspectives. One learning experience."
          />
          <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-2">
            <AudiencePanel
              badge="For teachers"
              title="More clarity in every assessment"
              points={TEACHER_POINTS}
              icon={BookOpen}
            />
            <AudiencePanel
              badge="For students"
              title="Turn every attempt into progress"
              points={STUDENT_POINTS}
              icon={BarChart3}
            />
          </div>
        </div>
      </section>

      <section id="enterprise" className="scroll-mt-28 py-8 sm:py-12 lg:py-16">
        <div className={containerClassName}>
          <Card className={cardClassName}>
            <CardHeader className="border-b border-border/50 bg-muted/20 p-4 sm:p-6 lg:p-7">
              <SectionHeading
                badge="For institutions"
                title="A controlled workflow for your classroom"
              />
              <CardDescription className="mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
                From educator verification to publishing results, keep the
                important assessment decisions in your hands.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-4 sm:grid-cols-2 sm:p-6 lg:gap-8 lg:p-7">
              {ASSESSMENT_CONTROLS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex min-w-0 items-start gap-3 sm:gap-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 sm:size-11">
                    <Icon className="size-4 sm:size-5" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-heading text-base font-bold tracking-tight">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-12 sm:pb-16">
        <div className={containerClassName}>
          <div className="flex flex-col gap-6 rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 sm:size-11">
                <Timer className="size-4 sm:size-5" />
              </span>
              <div className="space-y-2">
                <h2 className="font-heading text-base font-bold tracking-tight sm:text-xl">
                  Ready to run your first exam?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Free to start. No credit card required.
                </p>
              </div>
            </div>
            <Button
              asChild
              className="h-11 w-full rounded-xl px-5 text-sm font-semibold shadow-2xs sm:h-10 sm:w-auto"
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
  )
}

function SectionHeading({ badge, title }: { badge: string; title: string }) {
  return (
    <div className="space-y-3">
      <Badge
        variant="outline"
        className="rounded-full border-border/70 bg-card px-3 py-1 text-xs font-semibold text-muted-foreground"
      >
        {badge}
      </Badge>
      <h2 className="max-w-2xl font-heading text-2xl font-extrabold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h2>
    </div>
  )
}

function AudiencePanel({
  badge,
  title,
  points,
  icon: Icon,
}: {
  badge: string
  title: string
  points: readonly string[]
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className={cardClassName}>
      <CardHeader className="gap-3 border-b border-border/50 bg-muted/20 p-4 sm:p-6 lg:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 sm:size-11">
            <Icon className="size-4 sm:size-5" />
          </span>
          <Badge variant="secondary" className="rounded-full">
            {badge}
          </Badge>
        </div>
        <CardTitle className="font-heading text-base font-bold tracking-tight sm:text-xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 lg:p-7">
        <ul className="flex flex-col gap-4">
          {points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
