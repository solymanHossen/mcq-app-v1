import type { Metadata } from "next"
import Link from "next/link"
import {
  BookOpen,
  CheckCircle2,
  Trophy,
  ShieldCheck,
  Brain,
  Timer,
  BarChart3,
  Flame,
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = {
  title: `Platform Services & Features — ${APP_NAME}`,
  description:
    "Discover ExamHub services: high-stakes MCQ testing, verified question banks, instant auto-grading, anti-cheat proctoring, and AI mistake remediation.",
}

export const instant = false

const SERVICES = [
  {
    icon: Timer,
    title: "Timed Assessment Engine",
    badge: "Core Service",
    description:
      "Precision timed testing with candidate auto-save, question order randomization, and automatic submission upon expiration. Works smoothly across phones, tablets, and desktops.",
    features: [
      "Custom test duration & passing thresholds",
      "Dynamic option and question shuffling",
      "Candidate progress indicator & question bookmarking",
      "Resilient offline-recovery & network fault tolerance",
    ],
  },
  {
    icon: BookOpen,
    title: "Faculty Question Banking",
    badge: "For Teachers",
    description:
      "A centralized repository for educators to author, organize, and reuse questions across multiple exams. Filter by subject, difficulty, and question type.",
    features: [
      "Multi-subject tagging & categorization",
      "Rich LaTeX & markdown mathematical notation",
      "CSV bulk question import and export",
      "One-click assessment assembly from repository",
    ],
  },
  {
    icon: CheckCircle2,
    title: "Instant Auto-Grading & Results",
    badge: "Automated",
    description:
      "Instantaneous grading for single-select, multi-select, and numerical assessments. Results and comprehensive performance breakdowns appear immediately upon submission.",
    features: [
      "Zero-latency score computation",
      "Negative marking and partial credit algorithms",
      "Independent answer key release scheduling",
      "Item difficulty analytics for teachers",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Anti-Cheat Integrity Proctoring",
    badge: "Security",
    description:
      "Non-invasive browser integrity safeguards that monitor tab switching, window blurring, and unauthorized device actions without violating candidate privacy.",
    features: [
      "Real-time tab switch & blur tracking",
      "Weighted violation scoring engine",
      "Automated attempt flagging for instructor review",
      "Strict zero webcam recording policy for privacy",
    ],
  },
  {
    icon: Trophy,
    title: "Live Leaderboards & Ranking",
    badge: "Engagement",
    description:
      "Motivate students through transparent, real-time rankings. Supports configurable tie-breaker rules including elapsed duration and accuracy.",
    features: [
      "Real-time rank updates post assessment",
      "Multiple tie-breaker criteria (time, accuracy)",
      "Anonymized candidate display options",
      "Classroom and institution-wide scope",
    ],
  },
  {
    icon: Brain,
    title: "AI Explanation & Learning Assistant",
    badge: "AI Powered",
    description:
      "Turn errors into learning moments. Candidates receive intelligent, context-aware explanations for every mistake to clarify why an option was incorrect.",
    features: [
      "Step-by-step reasoning for wrong choices",
      "Subject-tailored diagnostic feedback",
      "Direct disputed question appeal channel",
      "Personalized revision recommendations",
    ],
  },
]

export default function ServicesPage() {
  return (
    <main className="flex-1 pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* ================= PAGE HERO CARD ================= */}
        <Card className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 lg:p-12 shadow-xs relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -left-20 size-80 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-chart-2/10 blur-3xl"
          />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Layers className="size-3.5" />
              <span>Full-Stack Assessment Services</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Enterprise-Grade Examination Services
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
              From faculty question banking and anti-cheat monitoring to instant auto-grading and
              AI-driven mistake explanations, ExamHub provides end-to-end infrastructure for modern assessments.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                className="h-11 rounded-xl px-6 font-bold bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 transition-all active:scale-98 gap-2 cursor-pointer"
              >
                <Link href="/exam-list">
                  <span>Browse Exam List</span>
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl px-6 font-semibold border-border/70 hover:bg-muted cursor-pointer"
              >
                <Link href="/teachers">
                  <span>View Verified Faculty</span>
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* ================= SERVICES CARDS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <Card
                key={service.title}
                className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header matching /teacher/exams/new header design */}
                  <div className="px-5 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                        <Icon className="size-5" />
                      </div>
                      <h2 className="font-heading text-base font-bold text-foreground">
                        {service.title}
                      </h2>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase shrink-0"
                    >
                      {service.badge}
                    </Badge>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        Key Capabilities
                      </span>
                      <ul className="space-y-1.5 text-xs text-foreground font-medium">
                        {service.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2">
                            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <div className="w-full pt-3 border-t border-border/40 flex items-center justify-between text-xs text-primary font-semibold">
                    <span>Platform Integrated</span>
                    <Zap className="size-3.5" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* ================= BOTTOM CTA CARD ================= */}
        <Card className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Ready to host or attempt high-stakes assessments?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Join thousands of learners and faculty using {APP_NAME} to deliver fair, secure,
              and frictionless online evaluations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                asChild
                className="h-11 rounded-xl px-7 font-bold bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl px-6 font-semibold border-border/70 hover:bg-muted cursor-pointer"
              >
                <Link href="/contact">Inquire for Institutions</Link>
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </main>
  )
}
