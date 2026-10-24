import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, assertOwner } from "@/lib/auth/guards"
import { getExamWithQuestions, getExamTotalMarks } from "@/lib/exams/queries"
import { updateExamAction } from "@/actions/exam.actions"
import { ExamForm } from "@/components/teacher/exam-form"
import { ExamStatusActions } from "@/components/teacher/exam-status-actions"
import { ExamQuestionList } from "@/components/teacher/exam-question-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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
      <div className="flex items-center justify-between">
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
        <div className="flex items-center gap-2">
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
        <p className="text-sm text-muted-foreground">
          This exam is {exam.status.toLowerCase()} and is now read-only — its
          details and question list can&apos;t change anymore.
        </p>
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
