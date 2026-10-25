import { createQuestionAction } from "@/modules/question-bank/actions"
import { QuestionForm } from "@/modules/question-bank/components/question-form"

export default function NewQuestionPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New question</h1>
      <QuestionForm action={createQuestionAction} submitLabel="Create question" />
    </div>
  )
}
