import { notFound } from "next/navigation"
import { requireUser, assertOwner } from "@/lib/authorization"
import { getQuestionById } from "@/modules/question-bank/queries"
import { updateQuestionAction } from "@/modules/question-bank/actions"
import { QuestionForm } from "@/modules/question-bank/components/question-form"
import { QuestionStatusActions } from "@/modules/question-bank/components/question-status-actions"
import { QuestionReports } from "@/modules/question-bank/components/question-reports"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const editFormClassName = cn(
  "min-w-0 [&>[data-slot=card]]:rounded-2xl",
  "[&_[data-slot=label]]:text-sm sm:[&_[data-slot=label]]:text-base",
  "[&_[data-slot=input]]:h-11 [&_[data-slot=input]]:text-base sm:[&_[data-slot=input]]:h-12 md:[&_[data-slot=input]]:text-sm",
  "[&_[data-slot=select-trigger]]:h-11 [&_[data-slot=select-trigger]]:text-base sm:[&_[data-slot=select-trigger]]:h-12 md:[&_[data-slot=select-trigger]]:text-sm",
  "[&_[data-slot=textarea]]:p-4 [&_[data-slot=textarea]]:text-base md:[&_[data-slot=textarea]]:text-sm",
  "[&_h2]:overflow-visible [&_h2]:text-clip [&_h2]:whitespace-normal",
  "[&>[data-slot=card]>div:last-child]:p-4 sm:[&>[data-slot=card]>div:last-child]:p-6 lg:[&>[data-slot=card]>div:last-child]:p-7",
  "[&>[data-slot=card]:first-of-type>div:last-child>div:first-child]:grid-cols-1 lg:[&>[data-slot=card]:first-of-type>div:last-child>div:first-child]:grid-cols-3",
  "[&>[data-slot=card]>div:last-child>div>div:has(label[for=questionText])]:flex-wrap [&>[data-slot=card]>div:last-child>div>div:has(label[for=questionText])]:gap-2",
  "[&>div:last-child]:flex-col-reverse sm:[&>div:last-child]:flex-row [&>div:last-child>[data-slot=button]]:w-full sm:[&>div:last-child>[data-slot=button]]:w-auto"
)

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
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      <div className="flex min-w-0 flex-col gap-3 border-b border-border/60 pb-3 sm:gap-4 sm:pb-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Edit question
        </h1>
        <QuestionStatusActions
          questionId={question.id}
          status={question.status}
        />
      </div>

      {question._count.examQuestions > 0 && (
        <p className="text-sm text-muted-foreground">
          Used in {question._count.examQuestions} exam
          {question._count.examQuestions === 1 ? "" : "s"}. Editing it here only
          changes the bank copy — exams that already include it keep their own
          snapshot.
        </p>
      )}

      <QuestionForm
        className={editFormClassName}
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
