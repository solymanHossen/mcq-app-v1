import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, assertOwner } from "@/lib/authorization"
import { getExamWithQuestions, getExamTotalMarks } from "@/modules/exams/queries"
import { updateExamAction } from "@/modules/exams/actions"
import { ExamForm } from "@/modules/exams/components/exam-form"
import { ExamStatusActions } from "@/modules/exams/components/exam-status-actions"
import { ExamQuestionList } from "@/modules/exams/components/exam-question-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ShareExamModal } from "@/modules/exams/components/share-exam-modal"
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
} from "lucide-react"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
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
  const sp = (await searchParams) ?? {}
  const user = await requireUser()
  const exam = await getExamWithQuestions(examId)
  if (!exam) notFound()
  assertOwner(user, exam.teacherId)

  const isDraft = exam.status === "DRAFT"
  const totalMarks = getExamTotalMarks(exam.examQuestions)
  const defaultTab = sp.tab || "questions"

  return (
    <div className="w-full space-y-6 pb-24 lg:pb-16">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/exams"
            className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 shadow-2xs"
            title="Back to Exams"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {exam.title}
              </h1>
              <Badge variant={STATUS_VARIANT[exam.status]} className="font-semibold text-xs px-2.5 py-0.5">
                {exam.status}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <HelpCircle className="size-3.5 text-primary" />
                {exam.examQuestions.length} {exam.examQuestions.length === 1 ? "question" : "questions"}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-medium">
                <Award className="size-3.5 text-primary" />
                {totalMarks} total marks
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="size-3.5 text-primary" />
                {exam.durationMinutes} mins duration
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {exam.status === "PUBLISHED" && (
            <ShareExamModal
              exam={exam}
              trigger={
                <Button size="sm" className="gap-1.5 shadow-sm font-semibold rounded-xl text-xs h-9">
                  <Share2 className="size-3.5" />
                  <span>Share Exam</span>
                </Button>
              }
            />
          )}

          <Button variant="outline" size="sm" asChild className="gap-1.5 rounded-xl text-xs h-9">
            <Link href={`/teacher/exams/${examId}/preview`}>
              <Eye className="size-3.5 text-muted-foreground" />
              <span>Preview</span>
            </Link>
          </Button>

          {!isDraft && (
            <Button variant="outline" size="sm" asChild className="gap-1.5 rounded-xl text-xs h-9">
              <Link href={`/teacher/exams/${examId}/results`}>
                <BarChart3 className="size-3.5 text-primary" />
                <span>Results</span>
              </Link>
            </Button>
          )}

          <ExamStatusActions examId={exam.id} status={exam.status} />
        </div>
      </div>

      {/* Main Spacious Content with Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="h-11 p-1 bg-muted/60 rounded-xl border border-border/50">
          <TabsTrigger value="questions" className="rounded-lg text-xs sm:text-sm font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <HelpCircle className="size-4" />
            <span>Questions ({exam.examQuestions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg text-xs sm:text-sm font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Settings className="size-4" />
            <span>Settings & Rules</span>
          </TabsTrigger>
          <TabsTrigger value="share" className="rounded-lg text-xs sm:text-sm font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Share2 className="size-4" />
            <span>Share & Access Link</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Questions Management */}
        <TabsContent value="questions" className="space-y-4 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/70 shadow-2xs">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Assessment Questions</span>
                <Badge variant="outline" className="text-xs bg-muted/50 border-border">
                  {exam.examQuestions.length} Questions · {totalMarks} Marks
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Reorder, inspect, or manage marks for the questions in this examination.
              </p>
            </div>

            {isDraft && (
              <Button asChild size="sm" className="gap-1.5 rounded-xl font-semibold text-xs h-9 shadow-sm shrink-0">
                <Link href={`/teacher/exams/${examId}/add-questions`}>
                  <Plus className="size-3.5" />
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
        </TabsContent>

        {/* TAB 2: Exam Settings & Rules (Full Wide Two-Column Layout) */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="rounded-2xl border-border/70 shadow-2xs">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    Timing & Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold text-foreground">{exam.durationMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Max Attempts</span>
                    <span className="font-semibold text-foreground">{exam.maxAttempts}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Passing Marks</span>
                    <span className="font-semibold text-foreground">{exam.passingMarks ?? "Not required"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/70 shadow-2xs">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    Participation Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Direct Link (No Reg.)</span>
                    <Badge variant={exam.allowGuestAccess ? "default" : "secondary"} className="text-[10px] h-5">
                      {exam.allowGuestAccess ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Passcode (PIN)</span>
                    <span className="font-mono font-bold text-foreground">{exam.accessCode ?? "None"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Public Directory</span>
                    <span className="font-semibold text-foreground">{exam.isPublic ? "Public" : "Private"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/70 shadow-2xs">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldAlert className="size-4 text-primary" />
                    Anti-Cheat Proctoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Webcam Consent</span>
                    <span className="font-semibold text-foreground">
                      {exam.webcamMonitoringRequired ? "Required" : "Not Required"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Review Threshold</span>
                    <span className="font-semibold text-foreground">{exam.violationReviewThreshold} points</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Shuffle Questions</span>
                    <span className="font-semibold text-foreground">{exam.shuffleQuestions ? "Yes" : "No"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: Share & Access Link */}
        <TabsContent value="share" className="space-y-4 outline-none">
          <Card className="rounded-2xl border-border/70 shadow-2xs">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Globe className="size-4" />
                <span>Student Assessment Link</span>
              </div>
              <CardTitle className="text-xl font-bold">Share Exam with Students</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Students can open this link on their mobile or desktop browser to take the exam instantly without creating an account.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold">
                      Direct Link Active
                    </Badge>
                    {exam.accessCode && (
                      <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 font-mono">
                        PIN: {exam.accessCode}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students just enter their Full Name and Email Address to start immediately.
                  </p>
                </div>

                <ShareExamModal
                  exam={exam}
                  trigger={
                    <Button className="gap-2 shadow-sm font-semibold rounded-xl text-xs h-10 px-5 shrink-0">
                      <Share2 className="size-4" />
                      <span>Open Share Hub (QR Code & Socials)</span>
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
