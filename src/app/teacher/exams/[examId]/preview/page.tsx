import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser, assertOwner } from "@/lib/authorization"
import { getExamWithQuestions, getExamTotalMarks } from "@/modules/exams/queries"
import { QuestionContent } from "@/components/shared/question-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftIcon } from "lucide-react"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ExamPreviewPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const user = await requireUser()
  const exam = await getExamWithQuestions(examId)
  if (!exam) notFound()
  assertOwner(user, exam.teacherId)

  const totalMarks = getExamTotalMarks(exam.examQuestions)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/teacher/exams/${examId}`}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to exam
        </Link>
      </Button>

      <div>
        <p className="text-sm text-muted-foreground">
          Teacher preview — correct answers are shown, students won&apos;t see
          this.
        </p>
        <h1 className="text-2xl font-semibold">{exam.title}</h1>
        {exam.description && (
          <p className="mt-1 text-muted-foreground">{exam.description}</p>
        )}
        <div className="mt-2 flex gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{exam.durationMinutes} min</Badge>
          <Badge variant="outline">{totalMarks} marks</Badge>
          <Badge variant="outline">
            {exam.examQuestions.length} question
            {exam.examQuestions.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      <Separator />

      <ol className="space-y-6">
        {exam.examQuestions.map((eq, index) => (
          <li key={eq.id}>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Question {index + 1} · {eq.marks} mark{eq.marks === 1 ? "" : "s"}
            </p>
            <QuestionContent
              data={{
                questionText: eq.questionTextSnapshot,
                optionA: eq.optionASnapshot,
                optionB: eq.optionBSnapshot,
                optionC: eq.optionCSnapshot,
                optionD: eq.optionDSnapshot,
                correctOption: eq.correctOptionSnapshot,
                explanation: eq.explanationSnapshot,
              }}
            />
          </li>
        ))}
      </ol>
    </div>
  )
}
