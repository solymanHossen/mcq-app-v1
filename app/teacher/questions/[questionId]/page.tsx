import { notFound } from "next/navigation"
import { requireUser, assertOwner } from "@/lib/auth/guards"
import { getQuestionById } from "@/lib/questions/queries"
import { updateQuestionAction } from "@/actions/question.actions"
import { QuestionForm } from "@/components/teacher/question-form"
import { QuestionStatusActions } from "@/components/teacher/question-status-actions"
import { QuestionReports } from "@/components/teacher/question-reports"
import { Separator } from "@/components/ui/separator"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ questionId: string }>
}) {
  const { questionId } = await params
  const user = await requireUser()
  const question = await getQuestionById(questionId)
  if (!question) notFound()
  assertOwner(user, question.teacherId)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit question</h1>
        <QuestionStatusActions questionId={question.id} status={question.status} />
      </div>

      {question._count.examQuestions > 0 && (
        <p className="text-sm text-muted-foreground">
          Used in {question._count.examQuestions} exam
          {question._count.examQuestions === 1 ? "" : "s"}. Editing it here
          only changes the bank copy — exams that already include it keep
          their own snapshot.
        </p>
      )}

      <QuestionForm
        action={updateQuestionAction.bind(null, questionId)}
        submitLabel="Save changes"
        initialValues={{
          subject: question.subject,
          topic: question.topic,
          difficulty: question.difficulty,
          questionText: question.questionText,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
          correctOption: question.correctOption,
          explanation: question.explanation ?? undefined,
          imageUrl: question.imageUrl ?? undefined,
          codeSnippet: question.codeSnippet ?? undefined,
          codeLanguage: question.codeLanguage ?? undefined,
        }}
      />

      <Separator />

      <QuestionReports questionId={question.id} reports={question.reports} />
    </div>
  )
}
