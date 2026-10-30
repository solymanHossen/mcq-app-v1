import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Trophy,
  Award,
  FileQuestion,
  Wrench,
  Search,
} from "lucide-react"
import { requireUser, assertOwner } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { listExamResults, getExamQuestionsForCorrection } from "@/modules/grading/queries"
import { getLiveContestStats } from "@/modules/leaderboard/stats"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ResultDisclosureActions } from "@/modules/grading/components/result-disclosure-actions"
import { QuestionCorrectionForm } from "@/modules/grading/components/question-correction-form"
import { DisqualifyButton } from "@/modules/grading/components/disqualify-button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

export const instant = false

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default async function ExamResultsPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const user = await requireUser()

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) notFound()
  assertOwner(user, exam.teacherId)

  const [results, questions, liveStats] = await Promise.all([
    listExamResults(examId),
    getExamQuestionsForCorrection(examId),
    getLiveContestStats(examId),
  ])

  const completionPercent =
    liveStats.totalParticipants > 0
      ? Math.round((liveStats.completed / liveStats.totalParticipants) * 100)
      : 0

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      {/* ================= PAGE HEADER & TOOLBAR ================= */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-1.5 sm:gap-2 mb-2 sm:mb-3"
          >
            <Link href={`/teacher/exams/${examId}`}>
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to exam</span>
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                {exam.title} — Results & Grading
              </h1>
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
              >
                {results.length} {results.length === 1 ? "Submission" : "Submissions"}
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Candidate performance breakdown, real-time attempt statuses, and answer key regrading.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 rounded-xl px-4 text-xs sm:text-sm font-semibold border-border/70 shadow-2xs hover:bg-muted transition-all"
            >
              <Link href={`/teacher/exams/${examId}/violations`}>
                <ShieldAlert className="mr-1.5 size-4 text-amber-500" />
                <span>Flagged Attempts</span>
              </Link>
            </Button>

            {exam.leaderboardEnabled && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4 text-xs sm:text-sm font-semibold border-border/70 shadow-2xs hover:bg-muted transition-all"
              >
                <Link href={`/exams/${examId}/leaderboard`}>
                  <Trophy className="mr-1.5 size-4 text-primary" />
                  <span>Public Leaderboard</span>
                </Link>
              </Button>
            )}

            {exam.status === "PUBLISHED" && (
              <ResultDisclosureActions
                examId={examId}
                answerKeyReleased={exam.answerKeyReleased}
              />
            )}
          </div>
        </div>
      </div>

      {/* ================= 4-TILE SUMMARY KPI METRICS ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
        {/* Metric 1: Total Participants */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Participants
            </span>
            <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs ring-1 ring-primary/20">
              <Users className="size-4.5 sm:size-5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {liveStats.totalParticipants}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {liveStats.inProgress} in progress currently
            </p>
          </div>
        </div>

        {/* Metric 2: Completed Submissions */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Completed
            </span>
            <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs ring-1 ring-emerald-500/20">
              <CheckCircle2 className="size-4.5 sm:size-5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {liveStats.completed}{" "}
              <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                ({completionPercent}%)
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Successfully finalized attempts
            </p>
          </div>
        </div>

        {/* Metric 3: Average Duration */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Avg Time Taken
            </span>
            <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs ring-1 ring-amber-500/20">
              <Clock className="size-4.5 sm:size-5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {liveStats.averageTimeTakenSec !== null
                ? `${Math.round(liveStats.averageTimeTakenSec / 60)} min`
                : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {liveStats.timedOut} auto-timed out
            </p>
          </div>
        </div>

        {/* Metric 4: Disqualified / Flagged */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Disqualified
            </span>
            <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl sm:rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-2xs ring-1 ring-rose-500/20">
              <ShieldAlert className="size-4.5 sm:size-5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {liveStats.disqualified}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Academic integrity breaches
            </p>
          </div>
        </div>
      </div>

      {/* ================= RESULTS TABLE CARD ================= */}
      <div className="w-full max-w-full min-w-0 rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-4 sm:p-6 sm:p-7 shadow-2xs space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Candidate Submissions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Live score logs and grading status for all enrolled students.
            </p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-12 px-4 text-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users className="size-8 text-primary" />
                </EmptyMedia>
                <EmptyTitle className="font-heading text-lg sm:text-xl font-bold">
                  No submissions yet
                </EmptyTitle>
                <EmptyDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Student submissions will automatically appear here once candidates start the assessment.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="w-full max-w-full min-w-0 overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader className="bg-muted/30 border-b border-border/70">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Candidate
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Attempt Status
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Score
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Accuracy (C / I / S)
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Result
                  </TableHead>
                  <TableHead className="text-right h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 rounded-xl border border-border/80 shadow-2xs">
                          <AvatarFallback className="rounded-xl text-xs font-bold bg-muted text-foreground">
                            {getInitials(r.student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground text-sm leading-snug">
                            {r.student.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.student.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {r.status === "DISQUALIFIED" ? (
                          <span className="inline-flex items-center rounded-full border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 text-xs font-semibold">
                            Disqualified
                          </span>
                        ) : r.status === "TIMEOUT" ? (
                          <span className="inline-flex items-center rounded-full border border-border/70 bg-secondary/80 text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold">
                            Timed Out
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-bold">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            {r.status}
                          </span>
                        )}
                      </div>
                      {r.disqualifiedReason && (
                        <p className="mt-1 text-xs text-destructive max-w-xs truncate font-medium">
                          {r.disqualifiedReason}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 font-bold text-foreground tabular-nums">
                      {r.result ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                          {r.result.obtainedMarks} / {r.result.totalMarks}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-xs text-muted-foreground tabular-nums">
                      {r.result ? (
                        <span className="font-medium text-foreground">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{r.result.correctCount}</span>
                          {" / "}
                          <span className="text-rose-500 font-semibold">{r.result.incorrectCount}</span>
                          {" / "}
                          <span className="text-muted-foreground">{r.result.skippedCount}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 px-4">
                      {r.result && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-bold">
                          {r.result.status}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-right">
                      {r.status !== "DISQUALIFIED" && <DisqualifyButton attemptId={r.id} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ================= ANSWER KEY CORRECTIONS SECTION ================= */}
      {exam.status === "PUBLISHED" && (
        <div className="w-full max-w-full min-w-0 rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3.5 border-b border-border/50 pb-5">
            <div className="flex size-10 sm:size-11 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs ring-1 ring-amber-500/20">
              <Wrench className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Answer-Key Corrections & Regrading
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Updating an answer key or cancelling a question automatically recalculates scores for all submitted candidate attempts.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <QuestionCorrectionForm
                key={q.id}
                examId={examId}
                examQuestionId={q.id}
                order={q.order}
                questionText={q.questionTextSnapshot}
                correctOption={q.correctOptionSnapshot}
                isCancelled={q.isCancelled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
