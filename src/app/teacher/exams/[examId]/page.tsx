import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Eye,
  BarChart3,
  ShieldAlert,
  Clock,
  Award,
  Layers,
  FileQuestion,
  Plus,
  Lock,
  Calendar,
  Sparkles,
  Settings2,
  CheckCircle2,
} from "lucide-react"
import { requireUser, assertOwner } from "@/lib/authorization"
import { getExamWithQuestions, getExamTotalMarks } from "@/modules/exams/queries"
import { updateExamAction } from "@/modules/exams/actions"
import { ExamForm } from "@/modules/exams/components/exam-form"
import { ExamStatusActions } from "@/modules/exams/components/exam-status-actions"
import { ExamQuestionList } from "@/modules/exams/components/exam-question-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const instant = false

const STATUS_VARIANT = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
} as const

export default async function ExamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>
  searchParams?: Promise<Record<string, string | undefined>>
}) {
  const { examId } = await params
  const sp = searchParams ? await searchParams : {}
  const user = await requireUser()
  const exam = await getExamWithQuestions(examId)
  if (!exam) notFound()
  assertOwner(user, exam.teacherId)

  const isDraft = exam.status === "DRAFT"
  const totalMarks = getExamTotalMarks(exam.examQuestions)
  const defaultTab = sp.tab ?? (isDraft && exam.examQuestions.length === 0 ? "questions" : "questions")

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* ================= PAGE HEADER & TOOLBAR ================= */}
      <div className="flex flex-col gap-6">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/teacher/exams">
              <ArrowLeft className="mr-1.5 size-4" />
              <span>Back to exams</span>
            </Link>
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {exam.title}
                </h1>
                <Badge
                  variant={STATUS_VARIANT[exam.status]}
                  className="rounded-lg text-xs font-semibold px-2.5 py-0.5"
                >
                  {exam.status === "PUBLISHED"
                    ? "Published"
                    : exam.status === "DRAFT"
                      ? "Draft"
                      : "Archived"}
                </Badge>
              </div>

              {exam.description && (
                <p className="text-sm text-muted-foreground max-w-2xl">
                  {exam.description}
                </p>
              )}
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 rounded-xl text-xs font-semibold shadow-2xs hover:bg-muted"
              >
                <Link href={`/teacher/exams/${examId}/preview`}>
                  <Eye className="mr-1.5 size-3.5 text-muted-foreground" />
                  <span>Preview</span>
                </Link>
              </Button>

              {!isDraft && (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl text-xs font-semibold shadow-2xs hover:bg-muted"
                  >
                    <Link href={`/teacher/exams/${examId}/results`}>
                      <BarChart3 className="mr-1.5 size-3.5 text-primary" />
                      <span>Results & Grading</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl text-xs font-semibold shadow-2xs hover:bg-muted"
                  >
                    <Link href={`/teacher/exams/${examId}/violations`}>
                      <ShieldAlert className="mr-1.5 size-3.5 text-amber-500" />
                      <span>Flagged Attempts</span>
                    </Link>
                  </Button>
                </>
              )}

              <ExamStatusActions examId={exam.id} status={exam.status} />
            </div>
          </div>
        </div>

        {/* ================= 4-CHIP SUMMARY STRIP ================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-2xs">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileQuestion className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Questions</p>
              <p className="text-base sm:text-lg font-bold text-foreground">
                {exam.examQuestions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-2xs">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Award className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Total Marks</p>
              <p className="text-base sm:text-lg font-bold text-foreground">
                {totalMarks} pts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-2xs">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Duration</p>
              <p className="text-base sm:text-lg font-bold text-foreground">
                {exam.durationMinutes} min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-2xs">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Layers className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Max Attempts</p>
              <p className="text-base sm:text-lg font-bold text-foreground">
                {exam.maxAttempts} {exam.maxAttempts === 1 ? "time" : "times"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Notice if Published or Archived */}
      {!isDraft && (
        <Alert className="rounded-2xl border-primary/20 bg-primary/[0.04]">
          <Lock className="size-4 text-primary" />
          <AlertTitle className="font-heading font-semibold text-foreground">
            Assessment is {exam.status.toLowerCase()} and locked
          </AlertTitle>
          <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
            To preserve grading equity and candidate attempt fidelity, the question bank,
            timing, and scoring parameters can no longer be modified. You can view submissions
            and perform answer-key regrading in the Results tab.
          </AlertDescription>
        </Alert>
      )}

      {/* ================= TABS: QUESTIONS VS CONFIGURATION ================= */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <TabsList className="flex h-auto w-full min-w-fit items-center gap-1.5 rounded-2xl bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-2">
            <TabsTrigger
              value="questions"
              className="flex-1 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <FileQuestion className="mr-2 size-4" />
              <span>Questions List ({exam.examQuestions.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Settings2 className="mr-2 size-4" />
              <span>{isDraft ? "Edit Settings & Rules" : "Exam Policy & Configuration"}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* QUESTIONS TAB */}
        <TabsContent value="questions" className="space-y-6">
          <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5 mb-6">
              <div>
                <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Exam Questions
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Questions included in this assessment track.
                </p>
              </div>

              {isDraft && (
                <Button
                  asChild
                  size="default"
                  className="h-10 rounded-xl px-4 text-xs font-semibold shadow-xs"
                >
                  <Link href={`/teacher/exams/${examId}/add-questions`}>
                    <Plus className="mr-1.5 size-4" />
                    <span>Add from Question Bank</span>
                  </Link>
                </Button>
              )}
            </div>

            <ExamQuestionList
              examId={examId}
              editable={isDraft}
              questions={exam.examQuestions.map((eq) => ({
                id: eq.id,
                questionTextSnapshot: eq.questionTextSnapshot,
                marks: eq.marks,
              }))}
            />
          </div>
        </TabsContent>

        {/* SETTINGS / CONFIGURATION TAB */}
        <TabsContent value="settings" className="space-y-6">
          {isDraft ? (
            <ExamForm
              action={updateExamAction.bind(null, examId)}
              submitLabel="Save Changes"
              cancelHref={`/teacher/exams/${examId}`}
              initialValues={{
                title: exam.title,
                description: exam.description ?? undefined,
                durationMinutes: exam.durationMinutes,
                maxAttempts: exam.maxAttempts,
                passingMarks: exam.passingMarks,
                startTime: exam.startTime,
                endTime: exam.endTime,
                shuffleQuestions: exam.shuffleQuestions,
                shuffleOptions: exam.shuffleOptions,
                webcamMonitoringRequired: exam.webcamMonitoringRequired,
                violationReviewThreshold: exam.violationReviewThreshold,
              }}
            />
          ) : (
            <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground border-b border-border/50 pb-4">
                Active Assessment Parameters
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1 rounded-2xl bg-muted/30 p-4 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground">Duration</p>
                  <p className="text-base font-semibold text-foreground">
                    {exam.durationMinutes} minutes
                  </p>
                </div>

                <div className="space-y-1 rounded-2xl bg-muted/30 p-4 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground">Max Attempts</p>
                  <p className="text-base font-semibold text-foreground">
                    {exam.maxAttempts} per student
                  </p>
                </div>

                <div className="space-y-1 rounded-2xl bg-muted/30 p-4 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground">Passing Score</p>
                  <p className="text-base font-semibold text-foreground">
                    {exam.passingMarks !== null ? `${exam.passingMarks} marks` : "No cutoff set"}
                  </p>
                </div>

                <div className="space-y-1 rounded-2xl bg-muted/30 p-4 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground">Question Shuffling</p>
                  <p className="text-base font-semibold text-foreground">
                    {exam.shuffleQuestions ? "Enabled (Random per student)" : "Disabled (Fixed order)"}
                  </p>
                </div>

                <div className="space-y-1 rounded-2xl bg-muted/30 p-4 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground">Option Shuffling</p>
                  <p className="text-base font-semibold text-foreground">
                    {exam.shuffleOptions ? "Enabled (Random options)" : "Disabled (Fixed A-D)"}
                  </p>
                </div>

                <div className="space-y-1 rounded-2xl bg-muted/30 p-4 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground">Webcam Consent</p>
                  <p className="text-base font-semibold text-foreground">
                    {exam.webcamMonitoringRequired ? "Enforced" : "Optional / Disabled"}
                  </p>
                </div>

                <div className="space-y-1 rounded-2xl bg-muted/30 p-4 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground">Violation Review Score</p>
                  <p className="text-base font-semibold text-foreground">
                    Threshold: {exam.violationReviewThreshold} pts
                  </p>
                </div>

                <div className="space-y-1 rounded-2xl bg-muted/30 p-4 border border-border/50 sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Exam Window</p>
                  <p className="text-base font-semibold text-foreground">
                    {exam.startTime
                      ? new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(exam.startTime))
                      : "Always open"}{" "}
                    —{" "}
                    {exam.endTime
                      ? new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(exam.endTime))
                      : "No deadline"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
