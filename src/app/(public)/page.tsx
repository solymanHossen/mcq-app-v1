import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Flame,
  Globe2,
  Lock,
  Server,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { HeroSection } from "@/components/landing/hero-section"
import { CapabilityStrip } from "@/components/landing/capability-strip"

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

const ENTERPRISE_FEATURES = [
  {
    icon: Building2,
    title: "Unlimited Concurrent Test Takers",
    description:
      "High-throughput architecture engineered to smoothly handle 50,000+ simultaneous candidates without latency spikes.",
  },
  {
    icon: Lock,
    title: "SOC 2 Type II & FERPA Compliant",
    description:
      "End-to-end encrypted test delivery, student data isolation, and comprehensive audit logs built for university compliance.",
  },
  {
    icon: Server,
    title: "Custom LMS & SSO Integration",
    description:
      "Seamless single sign-on via SAML 2.0 / Okta / Azure AD and bidirectional grade sync with Canvas, Blackboard, and Moodle.",
  },
  {
    icon: Globe2,
    title: "Dedicated Cloud or On-Premise",
    description:
      "Flexible deployment choices including regional data residency, sovereign private cloud, or air-gapped on-premise clusters.",
  },
] as const

export default function LandingPage() {
  return (
    <>
      {/* Hero Section matching design reference */}
      <HeroSection />

      {/* World-Class Modern Capability Proof Strip */}
      <CapabilityStrip />

        {/* Features */}
        <section id="features" className="border-t border-border/60 bg-muted/20 py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge variant="outline">Features</Badge>
              <h2 className="mt-4 text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                Everything an exam needs, nothing it doesn&apos;t
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">
                One platform for building, running, and grading exams — built
                for classrooms that want speed, integrity, and fairness.
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
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 sm:py-28">
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
        <section id="audiences" className="border-t border-border/60 bg-muted/20 py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge variant="outline">Audiences</Badge>
              <h2 className="mt-4 text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                Designed for both sides of the classroom
              </h2>
            </div>

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
          </div>
        </section>

        {/* Enterprise */}
        <section id="enterprise" className="py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge variant="outline">Enterprise</Badge>
              <h2 className="mt-4 text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                Built for institution &amp; enterprise scale
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">
                Robust infrastructure, compliant security, and dedicated SLA support trusted by large universities, certification bodies, and global enterprises.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ENTERPRISE_FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-heading font-semibold text-base mb-2 text-foreground">
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
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
      </>
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
