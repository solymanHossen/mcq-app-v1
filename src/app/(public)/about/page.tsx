import type { Metadata } from "next"
import Link from "next/link"
import {
  GraduationCap,
  ShieldCheck,
  Target,
  Users,
  CheckCircle2,
  FileText,
  Brain,
  ArrowRight,
  Award,
  Globe2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = {
  title: `About Us — ${APP_NAME}`,
  description:
    "Learn about ExamHub mission to empower academic institutions, faculty, and students with fair, transparent, and cheat-resistant online assessments.",
}

export const instant = false

export default async function AboutPage() {
  const [totalTeachers, totalExams, totalAttempts, totalQuestions] = await Promise.all([
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.exam.count({ where: { status: "PUBLISHED" } }),
    prisma.examAttempt.count(),
    prisma.question.count(),
  ])

  return (
    <main className="flex-1 pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* ================= PAGE HERO ================= */}
        <Card className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 lg:p-12 shadow-xs relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Target className="size-3.5" />
              <span>Our Mission</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Democratizing High-Stakes Academic Testing
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
              {APP_NAME} was engineered from the ground up to eliminate the friction of traditional
              paper examinations and insecure digital quizzes. We provide faculty and students with a
              reliable, automated, and strictly honest assessment ecosystem.
            </p>
          </div>
        </Card>

        {/* ================= LIVE PLATFORM METRICS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
              <Users className="size-5" />
            </div>
            <div>
              <span className="block font-heading text-2xl sm:text-3xl font-black text-foreground">
                {totalTeachers}
              </span>
              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Instructors
              </span>
            </div>
          </Card>

          <Card className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs ring-1 ring-emerald-500/20">
              <FileText className="size-5" />
            </div>
            <div>
              <span className="block font-heading text-2xl sm:text-3xl font-black text-foreground">
                {totalExams}
              </span>
              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Published Exams
              </span>
            </div>
          </Card>

          <Card className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-2xs ring-1 ring-blue-500/20">
              <Award className="size-5" />
            </div>
            <div>
              <span className="block font-heading text-2xl sm:text-3xl font-black text-foreground">
                {totalAttempts}
              </span>
              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Exam Attempts
              </span>
            </div>
          </Card>

          <Card className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20">
              <Globe2 className="size-5" />
            </div>
            <div>
              <span className="block font-heading text-2xl sm:text-3xl font-black text-foreground">
                {totalQuestions}
              </span>
              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Question Bank
              </span>
            </div>
          </Card>
        </div>

        {/* ================= 3 CORE PILLARS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <Card className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Uncompromising Integrity
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Every assessment is protected by proactive anti-cheat detection, randomized question
              distribution, and tamper-evident submission timestamps.
            </p>
          </Card>

          <Card className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs ring-1 ring-emerald-500/20">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Instant Auto-Grading
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Instructors save countless grading hours. Numerical and multiple choice solutions
              are scored instantaneously with mathematically exact accuracy.
            </p>
          </Card>

          <Card className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs space-y-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20">
              <Brain className="size-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Feedback-Driven Learning
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Evaluation is only half the journey. Automated explanations and mistake diagnostics
              ensure candidates learn why answers were right or wrong.
            </p>
          </Card>
        </div>

        {/* ================= ACTION SECTION ================= */}
        <Card className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-foreground">
              Ready to explore our open assessments?
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Start practicing with our verified questions or create your own test today.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              asChild
              className="h-11 rounded-xl px-6 font-bold bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Link href="/exam-list">
                <span>View Exam List</span>
                <ArrowRight className="size-4 ml-1.5 stroke-[2.5]" />
              </Link>
            </Button>
          </div>
        </Card>

      </div>
    </main>
  )
}
