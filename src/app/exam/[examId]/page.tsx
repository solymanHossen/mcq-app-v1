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
  Sparkles,
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
        {/* Exam Hero Card - World-Class Institutional Brand Showcase */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 lg:p-10 shadow-xs space-y-6 sm:space-y-8">
          {/* Ambient Multi-Layer Radial Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-gradient-to-b from-primary/10 via-amber-500/5 to-transparent blur-3xl dark:from-primary/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />

          <div className="relative z-10 space-y-6 sm:space-y-7">
            {/* 1. Official Institutional Brand Identity Centerpiece (Prominent Marketing Focus) */}
            <div className="flex flex-col items-center text-center space-y-3.5 sm:space-y-4">
              {/* Grand Brand Logo Avatar with Glowing Ring */}
              <div className="relative group cursor-default">
                {/* Subtle Amber-Primary Halo Glow behind Logo */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-amber-500/25 via-primary/30 to-blue-600/25 blur-md opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="relative size-24 sm:size-28 lg:size-32 rounded-full ring-4 ring-primary/25 dark:ring-primary/35 p-2 bg-white dark:bg-card shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]">
                  <Image
                    src={settings?.logoUrl || "/images/bcs-bank-logo-512.png"}
                    alt="BCS & Bank Aspirants"
                    width={128}
                    height={128}
                    priority
                    className="size-full object-contain rounded-full select-none"
                  />
                </div>
              </div>

              {/* Institution Name & Marketing Slogan */}
              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
                  BCS &amp; Bank Aspirants
                </h2>

                {/* High-Conversion Official Slogan Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 text-xs sm:text-sm font-bold tracking-wide text-amber-700 dark:text-amber-400 shadow-2xs">
                  <Sparkles className="size-3.5 text-amber-500 fill-amber-500/20" />
                  <span>Your Dream, Our Support</span>
                </div>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="w-full max-w-md mx-auto h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />

            {/* 2. Assessment Meta & Policy Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-primary/25 bg-primary/10 text-primary shadow-2xs"
              >
                <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Assessment</span>
              </Badge>

              {exam.allowGuestAccess ? (
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground border-border/70 bg-card/60 backdrop-blur-xs"
                >
                  Open Link Access
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground border-border/70 bg-card/60 backdrop-blur-xs"
                >
                  Account Required
                </Badge>
              )}

              {exam.webcamMonitoringRequired && (
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400 gap-1 bg-amber-500/10 backdrop-blur-xs"
                >
                  <ShieldAlert className="size-3" />
                  <span>Proctored Session</span>
                </Badge>
              )}

              {exam.negativeMarks > 0 ? (
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold border-amber-500/40 text-amber-700 dark:text-amber-400 gap-1 bg-amber-500/10 backdrop-blur-xs"
                >
                  <AlertTriangle className="size-3 text-amber-500" />
                  <span>Negative Marking (-{exam.negativeMarks})</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground border-border/70 bg-card/60 backdrop-blur-xs"
                >
                  No Negative Marking
                </Badge>
              )}
            </div>

            {/* 3. Exam Title & Faculty Attribution */}
            <div className="text-center space-y-2.5 max-w-3xl mx-auto">
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {exam.title}
              </h1>

              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium flex-wrap">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px] ring-1 ring-primary/25 shadow-2xs">
                  {exam.teacher.name.slice(0, 2).toUpperCase()}
                </div>
                <span>
                  Prepared by <strong className="text-foreground font-semibold">{exam.teacher.name}</strong>
                </span>
              </div>
            </div>

            {/* Description (if present) */}
            {exam.description && (
              <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl border border-border/70 bg-muted/20 text-center text-xs sm:text-sm text-muted-foreground leading-relaxed shadow-2xs">
                {exam.description}
              </div>
            )}

            {/* 4. Key Metrics Strip (Floating Stat Cards matching Master System) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1 sm:pt-2">
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xs sm:bg-muted/20 px-4 py-3.5 shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
                  <Clock className="size-5" />
                </span>
                <div className="min-w-0">
                  <span className="block font-heading text-lg sm:text-lg font-black text-foreground truncate">
                    {exam.durationMinutes} mins
                  </span>
                  <span className="block text-xs sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase truncate">
                    Duration
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xs sm:bg-muted/20 px-4 py-3.5 shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
                  <HelpCircle className="size-5" />
                </span>
                <div className="min-w-0">
                  <span className="block font-heading text-lg sm:text-lg font-black text-foreground truncate">
                    {totalQuestions} MCQs
                  </span>
                  <span className="block text-xs sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase truncate">
                    Questions
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xs sm:bg-muted/20 px-4 py-3.5 shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
                  <Award className="size-5" />
                </span>
                <div className="min-w-0">
                  <span className="block font-heading text-lg sm:text-lg font-black text-foreground truncate">
                    {totalMarks} pts
                  </span>
                  <span className="block text-xs sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase truncate">
                    Total Marks
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xs sm:bg-muted/20 px-4 py-3.5 shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
                  <Calendar className="size-5" />
                </span>
                <div className="min-w-0">
                  <span className="block font-heading text-lg sm:text-lg font-black text-foreground truncate">
                    {exam.maxAttempts}
                  </span>
                  <span className="block text-xs sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase truncate">
                    Max Attempts
                  </span>
                </div>
              </div>
            </div>
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
