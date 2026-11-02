import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Trophy,
  Wrench,
} from "lucide-react"
import { requireUser, assertOwner } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import {
  listExamResults,
  getExamQuestionsForCorrection,
} from "@/modules/grading/queries"
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { DashboardKpiCard } from "@/components/shared/dashboard-kpi-card"
import { ResultDisclosureActions } from "@/modules/grading/components/result-disclosure-actions"
import { QuestionCorrectionForm } from "@/modules/grading/components/question-correction-form"
import { DisqualifyButton } from "@/modules/grading/components/disqualify-button"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

export const instant = false

const summaryCardClassName =
  "min-w-0 justify-start gap-0 hover:translate-y-0 hover:shadow-sm [&_.truncate]:whitespace-normal"

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
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        <div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="group h-8 gap-1.5 rounded-full border-border/70 bg-card px-3 text-xs font-semibold text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:text-foreground active:scale-95 sm:h-8.5 sm:gap-2 sm:px-3.5 sm:text-sm"
          >
            <Link href={`/teacher/exams/${examId}`}>
              <ArrowLeft
                data-icon="inline-start"
                className="transition-transform group-hover:-translate-x-1"
              />
              Back to exam
            </Link>
          </Button>
        </div>

        <div className="flex min-w-0 flex-col gap-2 border-b border-border/60 pb-3 sm:gap-3 sm:pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Results & Grading
            </h1>
            <Badge
              variant="outline"
              className="h-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground sm:px-3 sm:py-1 sm:text-xs"
            >
              {results.length}{" "}
              {results.length === 1 ? "Submission" : "Submissions"}
            </Badge>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-sm font-semibold break-words text-foreground sm:text-base">
              {exam.title}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Candidate performance breakdown, real-time attempt statuses, and
              answer key regrading.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 xl:flex xl:flex-wrap xl:items-center">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 gap-2 rounded-xl border-border/70 px-4 text-sm font-semibold shadow-2xs"
          >
            <Link href={`/teacher/exams/${examId}/violations`}>
              <ShieldAlert data-icon="inline-start" />
              Flagged Attempts
            </Link>
          </Button>
          {exam.leaderboardEnabled && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 gap-2 rounded-xl border-border/70 px-4 text-sm font-semibold shadow-2xs"
            >
              <Link href={`/exams/${examId}/leaderboard`}>
                <Trophy data-icon="inline-start" />
                Public Leaderboard
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

      <section
        aria-label="Assessment summary"
        className="grid min-w-0 grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4"
      >
        <DashboardKpiCard
          className={summaryCardClassName}
          title="Participants"
          value={liveStats.totalParticipants}
          subtext={`${liveStats.inProgress} in progress currently`}
          icon={Users}
        />
        <DashboardKpiCard
          className={summaryCardClassName}
          title="Completed"
          value={`${liveStats.completed} (${completionPercent}%)`}
          subtext="Successfully finalized attempts"
          icon={CheckCircle2}
        />
        <DashboardKpiCard
          className={summaryCardClassName}
          title="Avg Time Taken"
          value={
            liveStats.averageTimeTakenSec !== null
              ? `${Math.round(liveStats.averageTimeTakenSec / 60)} min`
              : "—"
          }
          subtext={`${liveStats.timedOut} auto-timed out`}
          icon={Clock}
        />
        <DashboardKpiCard
          className={summaryCardClassName}
          title="Disqualified"
          value={liveStats.disqualified}
          subtext="Academic integrity breaches"
          icon={ShieldAlert}
        />
      </section>

      <Card className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card py-0 shadow-xs">
        <CardHeader className="gap-1 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
          <CardTitle className="text-base font-bold tracking-tight text-foreground sm:text-xl">
            <h2>Candidate Submissions</h2>
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed sm:text-sm">
            Live score logs and grading status for all enrolled students.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 p-4 sm:p-6 lg:p-7">
          {results.length === 0 ? (
            <Empty className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 sm:py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle className="font-heading text-base font-bold sm:text-xl">
                  No submissions yet
                </EmptyTitle>
                <EmptyDescription>
                  Student submissions will automatically appear here once
                  candidates start the assessment.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="min-w-0 overflow-hidden rounded-xl border border-border/60">
              <Table aria-label="Candidate submissions" tabIndex={0}>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-11 px-4 sm:px-5">
                      Candidate
                    </TableHead>
                    <TableHead className="h-11 px-4 sm:px-5">
                      Attempt Status
                    </TableHead>
                    <TableHead className="h-11 px-4 sm:px-5">Score</TableHead>
                    <TableHead className="h-11 px-4 sm:px-5">
                      Accuracy (C / I / S)
                    </TableHead>
                    <TableHead className="h-11 px-4 sm:px-5">Result</TableHead>
                    <TableHead className="h-11 px-4 text-right sm:px-5">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="max-w-80 min-w-56 px-4 py-4 whitespace-normal sm:px-5 sm:py-4.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 shrink-0 rounded-xl border border-border/70">
                            <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-bold text-primary">
                              {getInitials(r.student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <p className="text-sm leading-snug font-semibold break-words text-foreground">
                              {r.student.name}
                            </p>
                            <p className="text-xs break-all text-muted-foreground">
                              {r.student.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 sm:px-5 sm:py-4.5">
                        <div className="flex flex-col items-start gap-1.5">
                          <Badge
                            variant={
                              r.status === "DISQUALIFIED"
                                ? "destructive"
                                : r.status === "TIMEOUT"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {r.status === "DISQUALIFIED"
                              ? "Disqualified"
                              : r.status === "TIMEOUT"
                                ? "Timed Out"
                                : "Completed"}
                          </Badge>
                          {r.disqualifiedReason && (
                            <p className="max-w-xs text-xs leading-relaxed break-words whitespace-normal text-destructive">
                              {r.disqualifiedReason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 tabular-nums sm:px-5 sm:py-4.5">
                        {r.result ? (
                          <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/10 font-bold text-primary"
                          >
                            {r.result.obtainedMarks} / {r.result.totalMarks}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm tabular-nums sm:px-5 sm:py-4.5">
                        {r.result ? (
                          <span className="font-medium">
                            <span className="text-primary">
                              {r.result.correctCount}
                            </span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-destructive">
                              {r.result.incorrectCount}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              / {r.result.skippedCount}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 sm:px-5 sm:py-4.5">
                        {r.result ? (
                          <Badge
                            variant={
                              r.result.status === "PUBLISHED"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {r.result.status === "PUBLISHED"
                              ? "Published"
                              : "Provisional"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-right sm:px-5 sm:py-4.5">
                        {r.status !== "DISQUALIFIED" && (
                          <DisqualifyButton attemptId={r.id} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {exam.status === "PUBLISHED" && (
        <Card className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card py-0 shadow-xs">
          <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
            <div className="flex items-start gap-3 sm:gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20 sm:size-11 sm:rounded-2xl">
                <Wrench className="size-4.5 sm:size-5.5" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <CardTitle className="text-base font-bold tracking-tight text-foreground sm:text-xl">
                  <h2>Answer-Key Corrections & Regrading</h2>
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed sm:text-sm">
                  Updating an answer key or cancelling a question automatically
                  recalculates scores for all submitted candidate attempts.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex min-w-0 flex-col gap-3 p-4 sm:gap-4 sm:p-6 lg:p-7">
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
