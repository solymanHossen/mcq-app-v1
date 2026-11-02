import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { canAccessRole, getCurrentUser } from "@/lib/authorization"
import { countAttempts } from "@/modules/attempts/queries"
import { StudentExamEntryCard } from "@/modules/attempts/components/student-exam-entry-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import {
  Clock,
  HelpCircle,
  Award,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  BookOpen,
  User,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react"

// @next-codemod-ignore Cache Components adoption
export const instant = false

export default async function PublicExamLandingPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const user = await getCurrentUser()

  const exam = await prisma.exam.findUnique({
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
  })

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
      {/* Top Navigation Strip matching Dashboard Header */}
      <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-heading font-bold text-foreground text-sm sm:text-base hover:opacity-90 transition-opacity"
          >
            <div className="size-8.5 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-xs shadow-2xs">
              EH
            </div>
            <span className="tracking-tight">ExamHub Assessment</span>
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
        {/* Exam Hero Banner */}
        <div className="space-y-4 pb-4 sm:pb-6 border-b border-border/60">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60 bg-primary/10 text-primary"
            >
              <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Assessment</span>
            </Badge>
            {exam.allowGuestAccess ? (
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground border-border/70"
              >
                Open Link Access
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground border-border/70"
              >
                Account Required
              </Badge>
            )}
            {exam.webcamMonitoringRequired && (
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400 gap-1"
              >
                <ShieldAlert className="size-3" />
                <span>Proctored</span>
              </Badge>
            )}
          </div>

          <div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              {exam.title}
            </h1>
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
              <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] border border-border/60">
                {exam.teacher.name.slice(0, 2).toUpperCase()}
              </div>
              <span>
                Prepared by <strong className="text-foreground font-semibold">{exam.teacher.name}</strong>
              </span>
            </div>
          </div>

          {exam.description && (
            <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card text-xs sm:text-sm text-muted-foreground leading-relaxed shadow-2xs">
              {exam.description}
            </div>
          )}

          {/* Key Metrics Strip (Master tokens) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
            <div className="p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card flex items-center gap-3.5 shadow-2xs hover:border-border/90 transition-all group">
              <div className="size-10 rounded-xl border border-border/60 bg-muted/40 text-muted-foreground group-hover:text-primary group-hover:border-primary/50 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                <Clock className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">Duration</p>
                <p className="font-heading text-base sm:text-lg font-extrabold text-foreground tracking-tight">{exam.durationMinutes} mins</p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card flex items-center gap-3.5 shadow-2xs hover:border-border/90 transition-all group">
              <div className="size-10 rounded-xl border border-border/60 bg-muted/40 text-muted-foreground group-hover:text-primary group-hover:border-primary/50 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                <HelpCircle className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">Questions</p>
                <p className="font-heading text-base sm:text-lg font-extrabold text-foreground tracking-tight">{totalQuestions} MCQs</p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card flex items-center gap-3.5 shadow-2xs hover:border-border/90 transition-all group">
              <div className="size-10 rounded-xl border border-border/60 bg-muted/40 text-muted-foreground group-hover:text-primary group-hover:border-primary/50 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                <Award className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">Total Marks</p>
                <p className="font-heading text-base sm:text-lg font-extrabold text-foreground tracking-tight">{totalMarks} pts</p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card flex items-center gap-3.5 shadow-2xs hover:border-border/90 transition-all group">
              <div className="size-10 rounded-xl border border-border/60 bg-muted/40 text-muted-foreground group-hover:text-primary group-hover:border-primary/50 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                <Calendar className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">Max Attempts</p>
                <p className="font-heading text-base sm:text-lg font-extrabold text-foreground tracking-tight">{exam.maxAttempts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Alert (If Closed or Not Yet Open) */}
        {isNotYetOpen ? (
          <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-sm space-y-1">
            <p className="font-bold">This exam hasn&apos;t opened yet</p>
            <p className="text-xs">
              Scheduled to open on {exam.startTime!.toLocaleString()}. Please check back at the scheduled opening time.
            </p>
          </div>
        ) : isClosed ? (
          <div className="p-4 sm:p-5 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-sm space-y-1">
            <p className="font-bold">This exam is now closed</p>
            <p className="text-xs">
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
              <h3 className="font-heading text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border/60">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>Instructions for Candidates</span>
              </h3>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-2.5">
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
        <p>© {new Date().getFullYear()} ExamHub · Online Assessment Platform</p>
      </footer>
    </div>
  )
}
