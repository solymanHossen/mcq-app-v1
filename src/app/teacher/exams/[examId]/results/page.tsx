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
    <div className="w-full space-y-8 pb-16">
      {/* ================= PAGE HEADER & TOOLBAR ================= */}
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/teacher/exams/${examId}`}>
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Back to exam</span>
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {exam.title} — Results & Grading
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Candidate performance breakdown, real-time attempt statuses, and answer key regrading.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold shadow-2xs hover:bg-muted">
              <Link href={`/teacher/exams/${examId}/violations`}>
                <ShieldAlert className="mr-1.5 size-3.5 text-amber-500" />
                <span>Flagged Attempts</span>
              </Link>
            </Button>

            {exam.leaderboardEnabled && (
              <Button asChild variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold shadow-2xs hover:bg-muted">
                <Link href={`/exams/${examId}/leaderboard`}>
                  <Trophy className="mr-1.5 size-3.5 text-primary" />
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
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Participants
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Users className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {liveStats.totalParticipants}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {liveStats.inProgress} in progress currently
            </p>
          </div>
        </div>

        {/* Metric 2: Completed Submissions */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Completed
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <CheckCircle2 className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {liveStats.completed}{" "}
              <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                ({completionPercent}%)
              </span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Successfully finalized attempts
            </p>
          </div>
        </div>

        {/* Metric 3: Average Duration */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Avg Time Taken
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
              <Clock className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {liveStats.averageTimeTakenSec !== null
                ? `${Math.round(liveStats.averageTimeTakenSec / 60)} min`
                : "—"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {liveStats.timedOut} auto-timed out
            </p>
          </div>
        </div>

        {/* Metric 4: Disqualified / Flagged */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Disqualified
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-2xs">
              <ShieldAlert className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {liveStats.disqualified}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Academic integrity breaches
            </p>
          </div>
        </div>
      </div>

      {/* ================= RESULTS TABLE CARD ================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between px-2 pt-2">
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
          <div className="py-12">
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-foreground py-3.5">Candidate</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Attempt Status</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Score</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Accuracy (C / I / S)</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Result</TableHead>
                  <TableHead className="text-right font-bold text-foreground py-3.5">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 rounded-xl border border-border/80">
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

                    <TableCell className="py-3.5">
                      <Badge
                        variant={
                          r.status === "DISQUALIFIED"
                            ? "destructive"
                            : r.status === "TIMEOUT"
                              ? "secondary"
                              : "default"
                        }
                        className="rounded-lg text-xs font-semibold"
                      >
                        {r.status}
                      </Badge>
                      {r.disqualifiedReason && (
                        <p className="mt-1 text-xs text-destructive max-w-xs truncate">
                          {r.disqualifiedReason}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 font-bold text-foreground tabular-nums">
                      {r.result ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary border border-primary/20">
                          {r.result.obtainedMarks} / {r.result.totalMarks}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-muted-foreground tabular-nums">
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

                    <TableCell className="py-3.5">
                      {r.result && (
                        <Badge
                          variant={r.result.status === "PUBLISHED" ? "default" : "outline"}
                          className="rounded-lg text-xs font-semibold"
                        >
                          {r.result.status}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 text-right">
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
        <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-border/50 pb-5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
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
