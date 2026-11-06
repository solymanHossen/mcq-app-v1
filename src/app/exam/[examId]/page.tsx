import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { canAccessRole, getCurrentUser } from "@/lib/authorization"
import { countAttempts } from "@/modules/attempts/queries"
import { StudentExamEntryCard } from "@/modules/attempts/components/student-exam-entry-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { BrandLogo } from "@/components/shared/brand-logo"
import { getSystemSettings } from "@/modules/settings/queries"
import { APP_NAME } from "@/lib/config"
import {
  Clock,
  HelpCircle,
  Award,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  User,
  AlertTriangle,
} from "lucide-react"

// @next-codemod-ignore Cache Components adoption
export const instant = false

export default async function PublicExamLandingPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const [user, settings, exam] = await Promise.all([
    getCurrentUser(),
    getSystemSettings().catch(() => null),
    prisma.exam.findUnique({
      where: { id: examId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        examQuestions: {
          select: {
            id: true,
            marks: true,
          },
        },
      },
    }),
  ])

  if (!exam || exam.status !== "PUBLISHED") {
    notFound()
  }

  const existingAttemptsCount = user
    ? await countAttempts(user.id, exam.id)
    : 0

  const totalQuestions = exam.examQuestions.length
  const totalMarks = exam.examQuestions.reduce((sum, q) => sum + q.marks, 0)

  const now = new Date()
  const isNotYetOpen = exam.startTime && now < exam.startTime
  const isClosed = exam.endTime && now > exam.endTime

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Strip matching Platform Header */}
      <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
            title={`Back to ${APP_NAME} home`}
          >
            <BrandLogo
              logoUrl={settings?.logoUrl}
              className="h-7.5 sm:h-8.5 w-auto"
              priority
            />
            <div className="hidden xs:flex items-center gap-2 pl-2.5 sm:pl-3 border-l border-border/60">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide text-primary uppercase">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                <span>Assessment</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <ThemeToggle />
            {user ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border-border/70 bg-card hover:bg-muted text-foreground transition-all shadow-2xs active:scale-95 gap-1.5"
              >
                <Link href="/dashboard">
                  <User className="size-3.5 text-muted-foreground" />
                  <span>Dashboard</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border-border/70 bg-card hover:bg-muted text-foreground transition-all shadow-2xs active:scale-95"
              >
                <Link href={`/login?callbackUrl=/exam/${exam.id}`}>
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Exam Hero Card - Clean Minimal Institutional Identity (Profile-Flow Primary Gradient) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 sm:border-primary/20 bg-gradient-to-b from-primary/[0.08] via-card to-card p-4.5 sm:p-7 lg:p-9 shadow-xs backdrop-blur-xl space-y-4 sm:space-y-6">
          {/* Soft Ambient System Gradient Bloom - matching Profile Hero */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-primary/[0.08] blur-3xl dark:bg-primary/[0.12]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-primary/[0.05] blur-3xl dark:bg-primary/[0.08]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />

          <div className="relative z-10 space-y-4 sm:space-y-5">
            {/* 1. Big Logo & Highlighted Marketing Tagline */}
            <div className="flex flex-col items-center text-center space-y-2.5 sm:space-y-3">
              <div className="relative size-24 sm:size-28 lg:size-32 shrink-0 select-none">
                <Image
                  src={settings?.logoUrl || "/images/bcs-bank-logo-512.png"}
                  alt="BCS & Bank Aspirants"
                  width={128}
                  height={128}
                  priority
                  className="size-full object-contain drop-shadow-2xs"
                />
              </div>

              {/* Highlighted Official Motto / Marketing Tagline */}
              <div className="inline-flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/8 to-primary/15 text-primary shadow-2xs backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/20">
                <span className="font-heading text-xs sm:text-sm font-extrabold tracking-widest uppercase text-primary">
                  Your Dream, Our Support
                </span>
              </div>
            </div>

            {/* Assessment Meta & Policy Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-primary/25 bg-primary/10 text-primary shadow-2xs"
              >
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Assessment</span>
              </Badge>

              {exam.allowGuestAccess ? (
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-muted-foreground border-border/70 bg-card/60"
                >
                  Open Link Access
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-muted-foreground border-border/70 bg-card/60"
                >
                  Account Required
                </Badge>
              )}

              {exam.webcamMonitoringRequired && (
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400 gap-1 bg-amber-500/10"
                >
                  <ShieldAlert className="size-3" />
                  <span>Proctored</span>
                </Badge>
              )}

              {exam.negativeMarks > 0 ? (
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold border-amber-500/40 text-amber-700 dark:text-amber-400 gap-1 bg-amber-500/10"
                >
                  <AlertTriangle className="size-3 text-amber-500" />
                  <span>Negative (-{exam.negativeMarks})</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-muted-foreground border-border/70 bg-card/60"
                >
                  No Negative Marking
                </Badge>
              )}
            </div>

            {/* Exam Title & Faculty Attribution */}
            <div className="text-center space-y-1.5 sm:space-y-2 max-w-2xl mx-auto">
              <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                {exam.title}
              </h1>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
                <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[9px] ring-1 ring-primary/25">
                  {exam.teacher.name.slice(0, 2).toUpperCase()}
                </div>
                <span>
                  Prepared by <strong className="text-foreground font-semibold">{exam.teacher.name}</strong>
                </span>
              </div>
            </div>

            {/* Description (if present) */}
            {exam.description && (
              <div className="max-w-2xl mx-auto p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border/70 bg-muted/20 text-center text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {exam.description}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Alert (If Closed or Not Yet Open) */}
        {isNotYetOpen ? (
          <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-sm sm:text-sm space-y-1">
            <p className="font-bold">This exam hasn&apos;t opened yet</p>
            <p className="text-sm sm:text-xs leading-relaxed">
              Scheduled to open on {exam.startTime!.toLocaleString()}. Please check back at the scheduled opening time.
            </p>
          </div>
        ) : isClosed ? (
          <div className="p-4 sm:p-5 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-sm sm:text-sm space-y-1">
            <p className="font-bold">This exam is now closed</p>
            <p className="text-sm sm:text-xs leading-relaxed">
              The deadline for submissions closed on {exam.endTime!.toLocaleString()}. Submissions are no longer accepted.
            </p>
          </div>
        ) : (
          /* Active Entry Card (Guest Name & Email or Logged-in Start) */
          <div className="space-y-6 sm:space-y-8">
            <StudentExamEntryCard
              exam={{
                id: exam.id,
                title: exam.title,
                durationMinutes: exam.durationMinutes,
                maxAttempts: exam.maxAttempts,
                totalQuestions,
                totalMarks,
                allowGuestAccess: exam.allowGuestAccess,
                accessCode: exam.accessCode,
                webcamMonitoringRequired: exam.webcamMonitoringRequired,
                startTime: exam.startTime,
                endTime: exam.endTime,
              }}
              user={user && canAccessRole(user, "STUDENT") ? { ...user, role: "STUDENT" } : user}
              existingAttemptsCount={existingAttemptsCount}
            />

            {/* Test Rules & Instructions Card */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-2xs space-y-4">
              <h3 className="font-heading text-sm sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border/60">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>Instructions for Candidates</span>
              </h3>
              <ul className="text-sm sm:text-sm text-muted-foreground space-y-3 sm:space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Once you begin, the timer of <strong className="text-foreground font-semibold">{exam.durationMinutes} minutes</strong> runs continuously without pause.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Your responses are automatically autosaved every time you select or change an option.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Ensure you have a stable internet connection. In case of brief disconnections, your progress is safely preserved.</span>
                </li>
                {exam.negativeMarks > 0 ? (
                  <li className="flex items-start gap-2.5">
                    <span className="size-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>
                      <strong className="text-foreground font-semibold">Negative Marking is active:</strong>{" "}
                      <strong className="text-amber-600 dark:text-amber-400 font-bold">{exam.negativeMarks} marks</strong> will be deducted for each incorrect answer. Unanswered questions do not lose marks.
                    </span>
                  </li>
                ) : (
                  <li className="flex items-start gap-2.5">
                    <span className="size-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>No negative marks: you will not be penalized for wrong answers.</span>
                  </li>
                )}
                {exam.webcamMonitoringRequired && (
                  <li className="flex items-start gap-2.5">
                    <span className="size-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>This assessment requires active webcam proctoring. Avoid leaving or minimizing the test window.</span>
                  </li>
                )}
                {exam.passingMarks != null && (
                  <li className="flex items-start gap-2.5">
                    <span className="size-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>Minimum passing marks required: <strong className="text-foreground font-semibold">{exam.passingMarks} points</strong>.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-5 px-6 text-center text-xs text-muted-foreground bg-muted/10">
        <p>© {new Date().getFullYear()} {APP_NAME} · Online Assessment Platform</p>
      </footer>
    </div>
  )
}
