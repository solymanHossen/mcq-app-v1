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
import { Separator } from "@/components/ui/separator"

import { ShareExamModal } from "@/modules/exams/components/share-exam-modal"
import { Globe, Share2 } from "lucide-react"

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
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const user = await requireUser()
  const exam = await getExamWithQuestions(examId)
  if (!exam) notFound()
  assertOwner(user, exam.teacherId)

  const isDraft = exam.status === "DRAFT"
  const totalMarks = getExamTotalMarks(exam.examQuestions)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{exam.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[exam.status]}>{exam.status}</Badge>
            <span className="text-sm text-muted-foreground">
              {exam.examQuestions.length} question
              {exam.examQuestions.length === 1 ? "" : "s"} · {totalMarks}{" "}
              marks
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {exam.status === "PUBLISHED" && (
            <ShareExamModal exam={exam} />
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/teacher/exams/${examId}/preview`}>Preview</Link>
          </Button>
          {!isDraft && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/teacher/exams/${examId}/results`}>Results</Link>
            </Button>
          )}
          <ExamStatusActions examId={exam.id} status={exam.status} />
        </div>
      </div>

      {!isDraft && (
        <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-primary" />
              <span>
                {exam.allowGuestAccess
                  ? "Direct Link Access: Active (No Student Registration Needed)"
                  : "Private Access: Registered Students Only"}
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {exam.accessCode
                ? `Passcode protected (PIN: ${exam.accessCode}). Students can take this exam via the shared link.`
                : "Students can take this exam anytime via the shared link."}
            </p>
          </div>
          {exam.status === "PUBLISHED" && (
            <ShareExamModal
              exam={exam}
              trigger={
                <Button size="sm" className="h-8 rounded-lg font-bold text-xs gap-1.5 shrink-0">
                  <Share2 className="size-3.5" />
                  <span>Share Exam</span>
                </Button>
              }
            />
          )}
        </div>
      )}

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
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">Duration</dt>
          <dd>{exam.durationMinutes} minutes</dd>
          <dt className="text-muted-foreground">Max attempts</dt>
          <dd>{exam.maxAttempts}</dd>
          {exam.description && (
            <>
              <dt className="text-muted-foreground">Description</dt>
              <dd>{exam.description}</dd>
            </>
          )}
        </dl>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="font-medium">Questions</h2>
        {isDraft && (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/teacher/exams/${examId}/add-questions`}>
              Add from bank
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
  )
}
