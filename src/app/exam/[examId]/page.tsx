import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/authorization"
import { countAttempts } from "@/modules/attempts/queries"
import { StudentExamEntryCard } from "@/modules/attempts/components/student-exam-entry-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  HelpCircle,
  Award,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  BookOpen,
  User,
  ArrowLeft,
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
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background flex flex-col">
      {/* Top Navigation Strip */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-foreground text-sm hover:opacity-80 transition-opacity"
          >
            <div className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-xs">
              EH
            </div>
            <span>ExamHub Assessment</span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold rounded-xl">
                <Link href="/dashboard">
                  <User className="size-3.5 mr-1" />
                  <span>My Dashboard</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="text-xs font-semibold rounded-xl">
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
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary text-primary-foreground font-bold text-xs px-2.5 py-0.5">
              Live Assessment
            </Badge>
            {exam.allowGuestAccess ? (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                Open Link Access
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs font-semibold">
                Account Required
              </Badge>
            )}
            {exam.webcamMonitoringRequired && (
              <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                Proctored
              </Badge>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground font-heading">
              {exam.title}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-muted-foreground flex items-center gap-1.5">
              <span>Prepared by</span>
              <strong className="text-foreground font-semibold">{exam.teacher.name}</strong>
            </p>
          </div>

          {exam.description && (
            <div className="p-4 rounded-xl border border-border/70 bg-card text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {exam.description}
            </div>
          )}

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div className="p-3 sm:p-3.5 rounded-xl border border-border/70 bg-card flex items-center gap-3 shadow-2xs">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock className="size-4.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Duration</p>
                <p className="text-sm sm:text-base font-extrabold text-foreground">{exam.durationMinutes} mins</p>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl border border-border/70 bg-card flex items-center gap-3 shadow-2xs">
              <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <HelpCircle className="size-4.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Questions</p>
                <p className="text-sm sm:text-base font-extrabold text-foreground">{totalQuestions} MCQs</p>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl border border-border/70 bg-card flex items-center gap-3 shadow-2xs">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Award className="size-4.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Marks</p>
                <p className="text-sm sm:text-base font-extrabold text-foreground">{totalMarks} pts</p>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl border border-border/70 bg-card flex items-center gap-3 shadow-2xs">
              <div className="size-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Calendar className="size-4.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Max Attempts</p>
                <p className="text-sm sm:text-base font-extrabold text-foreground">{exam.maxAttempts}</p>
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
          <div className="space-y-6">
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
              user={user}
              existingAttemptsCount={existingAttemptsCount}
            />

            {/* Test Rules & Instructions Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" />
                <span>Instructions for Candidates</span>
              </h3>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Once you start, the timer of <strong>{exam.durationMinutes} minutes</strong> runs continuously.</li>
                <li>Your responses are automatically autosaved every time you select or change an option.</li>
                <li>Ensure you have a stable internet connection. In case of brief disconnections, your progress is safely preserved.</li>
                {exam.webcamMonitoringRequired && (
                  <li>This test requires active webcam proctoring. Avoid leaving or minimizing the test window.</li>
                )}
                {exam.passingMarks != null && (
                  <li>Minimum passing marks required: <strong>{exam.passingMarks} points</strong>.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} ExamHub · Online Assessment Platform</p>
      </footer>
    </div>
  )
}
