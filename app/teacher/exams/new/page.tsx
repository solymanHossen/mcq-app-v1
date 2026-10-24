import { createExamAction } from "@/actions/exam.actions"
import { ExamForm } from "@/components/teacher/exam-form"

export default function NewExamPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New exam</h1>
      <ExamForm action={createExamAction} submitLabel="Create exam" />
    </div>
  )
}
