import Link from "next/link"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { finalizeIfExpired } from "@/modules/attempts/expire"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StartExamButton } from "@/modules/attempts/components/start-exam-button"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  RefreshCw,
  Trophy,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  History,
} from "lucide-react"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ExamInfoPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const user = await requireRole("STUDENT")

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam || exam.status !== "PUBLISHED") notFound()

  const attempts = await prisma.examAttempt.findMany({
    where: { studentId: user.id, examId },
    orderBy: { attemptNumber: "desc" },
  })

  const latest = attempts[0]
  if (latest) {
    const current = await finalizeIfExpired(latest)
    if (current.status === "IN_PROGRESS") {
      redirect(`/exams/${examId}/attempt/${current.id}`)
    }
  }

  const now = new Date()
  const notYetOpen = exam.startTime && now < exam.startTime
  const closed = exam.endTime && now > exam.endTime
  const attemptsLeft = exam.maxAttempts - attempts.length

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-1.5 sm:gap-2"
          >
            <Link href="/exams">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to exams</span>
            </Link>
          </Button>

          {exam.leaderboardEnabled && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 sm:h-8.5 px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold shadow-2xs active:scale-95 gap-1.5 cursor-pointer"
            >
              <Link href={`/exams/${examId}/leaderboard`}>
                <Trophy className="size-3.5 text-amber-500" />
                <span>Leaderboard</span>
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground wrap-anywhere">
              {exam.title}
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
            >
              <span
                className={`size-1.5 sm:size-2 rounded-full ${
                  closed ? "bg-destructive" : notYetOpen ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span>{closed ? "Closed" : notYetOpen ? "Upcoming" : "Active"}</span>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
            >
              {exam.durationMinutes} Minutes
            </Badge>
            {exam.negativeMarks > 0 ? (
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold border-amber-500/40 text-amber-700 dark:text-amber-400 gap-1 bg-amber-500/10"
              >
                <AlertTriangle className="size-3 text-amber-500" />
                <span>Negative: -{exam.negativeMarks}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
              >
                No Negative Penalty
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Grid matching /teacher/exams/new */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Left Column (8 Columns) */}
        <div className="space-y-8 lg:col-span-8 min-w-0">
          {/* Card 1: Exam Details & Guidelines */}
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="relative size-9 sm:size-11 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 shadow-2xs ring-1 ring-primary/25 bg-white dark:bg-card p-0.5 flex items-center justify-center">
                  <Image
                    src="/images/bcs-bank-logo-512.png"
                    alt="BCS & Bank Aspirants"
                    width={44}
                    height={44}
                    className="size-full object-contain rounded-xl sm:rounded-2xl"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                    Assessment Instructions
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                    Review candidate guidelines before launching your attempt
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 border-primary/30 text-primary bg-primary/5 shrink-0">
                BCS &amp; Bank Verified
              </Badge>
            </div>

            <div className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
              {exam.description ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {exam.description}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No additional candidate instructions provided for this assessment.
                </p>
              )}

              {/* Schedule Details if available */}
              {(exam.startTime || exam.endTime) && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                    <Calendar className="size-4 text-purple-500" />
                    <span>Availability Window</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">Opens: </span>
                      {exam.startTime ? exam.startTime.toLocaleString() : "Always Open"}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Closes: </span>
                      {exam.endTime ? exam.endTime.toLocaleString() : "No Deadline"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Card 2: Attempt History */}
          {attempts.length > 0 && (
            <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
              <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-amber-500/20">
                    <History className="size-4.5 sm:size-5.5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                      Your Past Attempts
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                      History of previously launched and submitted sessions
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 rounded-full border-border/70">
                  {attempts.length} of {exam.maxAttempts}
                </Badge>
              </div>

              <div className="p-4 sm:p-6 lg:p-7 space-y-3">
                {attempts.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 sm:p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="size-8 rounded-lg bg-card border border-border/70 flex items-center justify-center font-bold text-xs shadow-2xs">
                        #{a.attemptNumber}
                      </span>
                      <div>
                        <span className="font-semibold text-foreground text-xs sm:text-sm">
                          Attempt {a.attemptNumber}
                        </span>
                        <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                          Started: {a.startedAt.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                      <Badge
                        variant={
                          a.status === "IN_PROGRESS"
                            ? "default"
                            : a.status === "COMPLETED"
                              ? "secondary"
                              : "outline"
                        }
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      >
                        {a.status.replace("_", " ")}
                      </Badge>
                      {a.submittedAt && (
                        <span className="text-[11px] sm:text-xs text-muted-foreground">
                          Submitted: {a.submittedAt.toLocaleDateString()}
                        </span>
                      )}
                      {a.status !== "IN_PROGRESS" && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs hover:border-primary/40 active:scale-95 transition-all cursor-pointer"
                        >
                          <Link href={`/exams/${examId}/attempt/${a.id}`}>
                            <span>View Result</span>
                            <ArrowRight className="size-3" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Sticky Column (4 Columns) matching /teacher/exams/new */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4 min-w-0">
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Assessment Overview
                </span>
                <Badge
                  variant={closed ? "destructive" : notYetOpen ? "outline" : "default"}
                  className="font-bold text-xs px-2.5 py-0.5 rounded-full"
                >
                  {closed ? "Closed" : notYetOpen ? "Scheduled" : "Ready"}
                </Badge>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mt-1.5 line-clamp-2">
                {exam.title}
              </h3>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
              {/* Specification List */}
              <div className="divide-y divide-border/60 text-sm sm:text-base">
                <div className="flex items-center justify-between py-3 first:pt-0">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Clock className="size-4 text-blue-500" />
                    <span>Duration</span>
                  </span>
                  <span className="font-bold text-foreground">{exam.durationMinutes} mins</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <RefreshCw className="size-4 text-amber-500" />
                    <span>Attempts Left</span>
                  </span>
                  <span className={`font-bold ${attemptsLeft <= 0 ? "text-destructive" : "text-foreground"}`}>
                    {attemptsLeft > 0 ? attemptsLeft : 0} of {exam.maxAttempts}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Trophy className="size-4 text-yellow-500" />
                    <span>Passing Score</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {exam.passingMarks ? `${exam.passingMarks} marks` : "None"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 last:pb-0">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>Proctoring</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {exam.webcamMonitoringRequired ? "Webcam Active" : "Standard"}
                  </span>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Status Notice or Action Button */}
              {notYetOpen ? (
                <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 sm:p-3.5 text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-semibold">
                  <AlertTriangle className="size-4 sm:size-4.5 shrink-0 text-amber-500 mt-0.5" />
                  <span>Opens {exam.startTime!.toLocaleString()}. Please return when the exam begins.</span>
                </div>
              ) : closed ? (
                <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3 sm:p-3.5 text-xs sm:text-sm text-destructive font-semibold">
                  <AlertTriangle className="size-4 sm:size-4.5 shrink-0 text-destructive mt-0.5" />
                  <span>This exam closed on {exam.endTime!.toLocaleString()}. No further attempts allowed.</span>
                </div>
              ) : attemptsLeft <= 0 ? (
                <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 sm:p-3.5 text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-semibold">
                  <AlertTriangle className="size-4 sm:size-4.5 shrink-0 text-amber-500 mt-0.5" />
                  <span>You have used all {exam.maxAttempts} allowed attempt{exam.maxAttempts === 1 ? "" : "s"} for this assessment.</span>
                </div>
              ) : (
                <div className="pt-1 sm:pt-2 w-full">
                  <StartExamButton
                    examId={examId}
                    label={attempts.length > 0 ? "Start Next Attempt" : "Start Assessment"}
                    webcamMonitoringRequired={exam.webcamMonitoringRequired}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

