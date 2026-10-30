import Link from "next/link"
import { notFound } from "next/navigation"
import { connection } from "next/server"
import { requireUser, assertOwner } from "@/lib/authorization"
import { getExamWithQuestions, getExamTotalMarks } from "@/modules/exams/queries"
import { listActiveUnusedQuestions } from "@/modules/question-bank/queries"
import { updateExamAction } from "@/modules/exams/actions"
import { ExamForm } from "@/modules/exams/components/exam-form"
import { ExamStatusActions } from "@/modules/exams/components/exam-status-actions"
import { ExamQuestionList } from "@/modules/exams/components/exam-question-list"
import { StudentPreviewModal } from "@/modules/exams/components/student-preview-modal"
import { AddQuestionsModal } from "@/modules/exams/components/add-questions-modal"
import { ShareExamModal } from "@/modules/exams/components/share-exam-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ArrowLeft,
  HelpCircle,
  Settings,
  Share2,
  Globe,
  Lock,
  Plus,
  Award,
  Clock,
  Eye,
  BarChart3,
  Calendar,
  ShieldAlert,
  Users,
  CheckCircle2,
  Layers,
  FilePlus2,
} from "lucide-react"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ExamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>
  searchParams?: Promise<Record<string, string | undefined>>
}) {
  await connection()
  const { examId } = await params
  const sp = (await searchParams) ?? {}
  const user = await requireUser()

  const [exam, unusedQuestionsData] = await Promise.all([
    getExamWithQuestions(examId),
    listActiveUnusedQuestions({
      teacherId: user.id,
      examId,
      page: 1,
    }),
  ])

  if (!exam) notFound()
  assertOwner(user, exam.teacherId)

  const isDraft = exam.status === "DRAFT"
  const isPublished = exam.status === "PUBLISHED"
  const totalMarks = getExamTotalMarks(exam.examQuestions)
  const defaultTab = sp.tab || "questions"

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      {/* ─── 1. TOP BREADCRUMB & HERO COMMAND BAR ─── */}
      <div className="space-y-3 sm:space-y-4">
        {/* Back Button matching master reference pill style */}
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-1.5 sm:gap-2"
          >
            <Link href="/teacher/exams">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to exams</span>
            </Link>
          </Button>
        </div>

        {/* Main Hero Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 pb-2 border-b border-border/60">
          <div className="space-y-1.5 max-w-4xl">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                {exam.title}
              </h1>

              {/* Status Badge */}
              <Badge
                variant={isDraft ? "secondary" : isPublished ? "default" : "outline"}
                className={`font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isDraft
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                    : isPublished
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                    : ""
                }`}
              >
                {exam.status}
              </Badge>
            </div>

            {exam.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {exam.description}
              </p>
            )}
          </div>

          {/* Unified Action Button Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 pt-1 lg:pt-0">
            {/* Direct Link Active Status Badge */}
            {isPublished && exam.allowGuestAccess && (
              <div className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-2xs h-10 select-none">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <Globe className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Direct Link Active</span>
              </div>
            )}

            {/* Share Exam Button */}
            {isPublished && (
              <ShareExamModal
                exam={exam}
                trigger={
                  <Button className="gap-2 shadow-xs font-semibold rounded-xl text-xs sm:text-sm h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                    <Share2 className="size-4" />
                    <span>Share Exam</span>
                  </Button>
                }
              />
            )}

            {/* Student Preview Modal Button */}
            <StudentPreviewModal
              exam={exam}
              totalMarks={totalMarks}
            />

            {/* Results Button */}
            {!isDraft && (
              <Button variant="outline" asChild className="gap-1.5 rounded-xl text-xs sm:text-sm h-10 px-4 shadow-2xs font-semibold">
                <Link href={`/teacher/exams/${examId}/results`}>
                  <BarChart3 className="size-4 text-primary" />
                  <span>Results & Roster</span>
                </Link>
              </Button>
            )}

            {/* Publish & Delete Draft Buttons */}
            <ExamStatusActions examId={exam.id} status={exam.status} />
          </div>
        </div>
      </div>

      {/* ─── 2. 4-CARD KPI STATS ROW (Matching Master Design System) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Questions & Marks */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs hover:border-primary/40 transition-all flex items-center gap-3.5 sm:gap-4">
          <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <HelpCircle className="size-5 sm:size-6" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Questions & Marks
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {exam.examQuestions.length}{" "}
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Qs</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {totalMarks} Total Marks ({exam.passingMarks ? `Pass: ${exam.passingMarks}` : "No pass mark"})
            </p>
          </div>
        </div>

        {/* Card 2: Duration & Limits */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs hover:border-primary/40 transition-all flex items-center gap-3.5 sm:gap-4">
          <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="size-5 sm:size-6" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Timing & Attempts
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {exam.durationMinutes}{" "}
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">mins</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {exam.maxAttempts} max attempt{exam.maxAttempts === 1 ? "" : "s"} allowed
            </p>
          </div>
        </div>

        {/* Card 3: Student Access & PIN */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs hover:border-primary/40 transition-all flex items-center gap-3.5 sm:gap-4">
          <div
            className={`size-11 sm:size-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
              exam.allowGuestAccess
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            <Globe className="size-5 sm:size-6" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student Access
              </p>
              {exam.allowGuestAccess && isPublished && (
                <Badge
                  variant="outline"
                  className="text-[10px] h-4.5 px-1.5 font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1 shrink-0"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-base sm:text-lg font-extrabold text-foreground tracking-tight truncate">
              {exam.allowGuestAccess ? "Direct Link Access" : "Registered Only"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {exam.accessCode ? `PIN: ${exam.accessCode}` : "Open without passcode"}
            </p>
          </div>
        </div>

        {/* Card 4: Proctoring & Rules */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs hover:border-primary/40 transition-all flex items-center gap-3.5 sm:gap-4">
          <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="size-5 sm:size-6" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Proctoring Mode
            </p>
            <p className="text-base sm:text-lg font-extrabold text-foreground tracking-tight truncate">
              {exam.webcamMonitoringRequired ? "Webcam Proctored" : "Standard Anti-Cheat"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Threshold: {exam.violationReviewThreshold} pts · {exam.shuffleQuestions ? "Shuffled" : "Sequential"}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. SEGMENTED TABS (Matching Master Design System Standard) ─── */}
      <Tabs defaultValue={defaultTab} className="w-full space-y-6 sm:space-y-8">
        <div className="w-full overflow-x-auto pb-1 no-scrollbar">
          <TabsList className="h-11 sm:h-12 p-1 sm:p-1.5 bg-muted/70 rounded-xl border border-border/60 gap-1 sm:gap-1.5 w-fit">
            {/* Tab 1: Questions */}
            <TabsTrigger
              value="questions"
              className="h-full rounded-lg text-xs sm:text-sm font-bold gap-1.5 sm:gap-2 px-3 sm:px-4 cursor-pointer data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground transition-none duration-0"
            >
              <HelpCircle className="size-4 shrink-0" />
              <span className="whitespace-nowrap">Questions</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] sm:text-xs font-bold bg-muted-foreground/10 text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                {exam.examQuestions.length}
              </span>
            </TabsTrigger>

            {/* Tab 2: Settings */}
            <TabsTrigger
              value="settings"
              className="h-full rounded-lg text-xs sm:text-sm font-bold gap-1.5 sm:gap-2 px-3 sm:px-4 cursor-pointer data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground transition-none duration-0"
            >
              <Settings className="size-4 shrink-0" />
              <span className="whitespace-nowrap">Settings & Rules</span>
            </TabsTrigger>

            {/* Tab 3: Share Link */}
            <TabsTrigger
              value="share"
              className="h-full rounded-lg text-xs sm:text-sm font-bold gap-1.5 sm:gap-2 px-3 sm:px-4 cursor-pointer data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground transition-none duration-0"
            >
              <Share2 className="size-4 shrink-0" />
              <span className="whitespace-nowrap">Share & Link Hub</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── TAB 1: QUESTIONS MANAGEMENT ─── */}
        <TabsContent value="questions" className="space-y-6 outline-none">
          {/* Action Bar Above Questions */}
          <div className="p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border/70 shadow-2xs hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="size-10 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20 mt-0.5 sm:mt-0">
                <Layers className="size-5 sm:size-5.5" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-foreground">
                    Assessment Questions
                  </h2>
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-bold tracking-wide flex items-center gap-1.5 border border-border/60 shrink-0"
                  >
                    <span>{exam.examQuestions.length} Questions</span>
                    <span className="size-1 rounded-full bg-muted-foreground/40" />
                    <span>{totalMarks} Marks</span>
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Reorder, inspect option choices, or remove questions from this examination.
                </p>
              </div>
            </div>

            {isDraft && (
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap shrink-0 pt-1 lg:pt-0">
                {/* Instant Modal Trigger: Add Questions from Bank */}
                <AddQuestionsModal
                  examId={examId}
                  availableQuestions={unusedQuestionsData.items}
                  trigger={
                    <Button
                      type="button"
                      className="gap-2 rounded-xl font-bold text-xs sm:text-sm h-10 sm:h-10.5 px-3.5 sm:px-4.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs active:scale-95 transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-initial"
                    >
                      <Plus className="size-4 shrink-0" />
                      <span>Add from Question Bank</span>
                    </Button>
                  }
                />

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl font-bold text-xs sm:text-sm h-10 sm:h-10.5 px-3 sm:px-4 border-border/70 bg-card hover:bg-muted text-foreground active:scale-95 transition-all shadow-2xs cursor-pointer whitespace-nowrap flex-1 sm:flex-initial"
                >
                  <Link href="/teacher/questions/new">
                    <FilePlus2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Create New Question</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Question List (with instant modal trigger if empty) */}
          <ExamQuestionList
            examId={examId}
            editable={isDraft}
            questions={exam.examQuestions.map((eq) => ({
              id: eq.id,
              order: eq.order,
              marks: eq.marks,
              negativeMarks: eq.negativeMarks,
              questionTextSnapshot: eq.questionTextSnapshot,
              optionASnapshot: eq.optionASnapshot,
              optionBSnapshot: eq.optionBSnapshot,
              optionCSnapshot: eq.optionCSnapshot,
              optionDSnapshot: eq.optionDSnapshot,
              correctOptionSnapshot: eq.correctOptionSnapshot,
              explanationSnapshot: eq.explanationSnapshot,
            }))}
          />
        </TabsContent>

        {/* ─── TAB 2: EXAM SETTINGS & RULES ─── */}
        <TabsContent value="settings" className="space-y-6 outline-none">
          {isDraft ? (
            <ExamForm
              action={updateExamAction.bind(null, examId)}
              submitLabel="Save changes"
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
                isPublic: exam.isPublic,
                allowGuestAccess: exam.allowGuestAccess,
                accessCode: exam.accessCode,
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Card className="rounded-2xl border-border/70 shadow-2xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    Timing & Limits
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Time allotment and allowed attempt configurations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold text-foreground">{exam.durationMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Max Attempts</span>
                    <span className="font-semibold text-foreground">{exam.maxAttempts}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Passing Marks</span>
                    <span className="font-semibold text-foreground">{exam.passingMarks ?? "Not required"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/70 shadow-2xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    Participation Mode
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Link sharing and student registration policy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Direct Link (No Reg.)</span>
                    <Badge variant={exam.allowGuestAccess ? "default" : "secondary"} className="text-xs">
                      {exam.allowGuestAccess ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Passcode (PIN)</span>
                    <span className="font-mono font-bold text-foreground">{exam.accessCode ?? "None"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Public Directory</span>
                    <span className="font-semibold text-foreground">{exam.isPublic ? "Public" : "Private"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/70 shadow-2xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShieldAlert className="size-4 text-primary" />
                    Proctoring & Anti-Cheat
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Security triggers and integrity monitoring.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Webcam Consent</span>
                    <span className="font-semibold text-foreground">
                      {exam.webcamMonitoringRequired ? "Required" : "Not Required"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Review Threshold</span>
                    <span className="font-semibold text-foreground">{exam.violationReviewThreshold} points</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Shuffle Questions</span>
                    <span className="font-semibold text-foreground">{exam.shuffleQuestions ? "Yes" : "No"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 3: SHARE & STUDENT ACCESS LINK ─── */}
        <TabsContent value="share" className="space-y-6 outline-none">
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
            {/* Master Header Bar */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                  <Globe className="size-4.5 sm:size-5.5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                    Share Assessment with Students
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                    Direct candidate link sharing, entry credentials, and test distribution
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 sm:py-1 border-border/70 shrink-0 self-start sm:self-auto">
                Candidate Access
              </Badge>
            </div>

            {/* Card Content Body */}
            <div className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                Send this direct link to your students via WhatsApp, Messenger, Telegram, or email. Students can start the test instantly with only their Name and Email address — no prior registration required.
              </p>

              {/* Status and Action Banner */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold px-2.5 py-0.5 rounded-full gap-1">
                      <CheckCircle2 className="size-3" />
                      <span>Direct Link Active</span>
                    </Badge>
                    {exam.accessCode && (
                      <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-mono font-bold px-2.5 py-0.5 rounded-full gap-1">
                        <Lock className="size-3" />
                        <span>PIN: {exam.accessCode}</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Access is open. Students will enter their full name and email to begin their exam attempt.
                  </p>
                </div>

                <ShareExamModal
                  exam={exam}
                  trigger={
                    <Button className="gap-2 shadow-xs font-semibold rounded-xl text-xs sm:text-sm h-10 sm:h-10.5 px-4 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                      <Share2 className="size-4" />
                      <span>Open Share Hub</span>
                    </Button>
                  }
                />
              </div>

              {/* Student Experience Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
                <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                      <Users className="size-4" />
                    </div>
                    <span className="font-bold text-sm sm:text-base text-foreground">1. Direct Join</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Student clicks the shared link on their phone or computer.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card hover:border-emerald-500/40 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/20">
                      <Award className="size-4" />
                    </div>
                    <span className="font-bold text-sm sm:text-base text-foreground">2. Name &amp; Email</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Enters their full name, email, and optional PIN to start immediately.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card hover:border-blue-500/40 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 ring-1 ring-blue-500/20">
                      <BarChart3 className="size-4" />
                    </div>
                    <span className="font-bold text-sm sm:text-base text-foreground">3. Instant Grading</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Upon submission, results flow straight into your teacher dashboard.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
