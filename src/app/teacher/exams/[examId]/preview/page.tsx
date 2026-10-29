import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Eye, Clock, Award, FileQuestion, CheckCircle2 } from "lucide-react"
import { requireUser, assertOwner } from "@/lib/authorization"
import { getExamWithQuestions, getExamTotalMarks } from "@/modules/exams/queries"
import { QuestionContent } from "@/components/shared/question-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
    <div className="w-full space-y-8 pb-16">
      {/* Top Header */}
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/teacher/exams/${examId}`}>
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Back to exam details</span>
          </Link>
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {exam.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Candidate Preview · Review questions, verified answer keys, and LaTeX formatting.
            </p>
          </div>
          <Badge
            variant="outline"
            className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-primary/5 text-primary border-primary/20 self-start sm:self-auto"
          >
            <Eye className="mr-1.5 size-3.5" />
            <span>Faculty View</span>
          </Badge>
        </div>
      </div>

      {/* Teacher Inspection Notice */}
      <Alert className="rounded-2xl border-primary/20 bg-primary/[0.04]">
        <Eye className="size-4 text-primary" />
        <AlertTitle className="font-heading font-semibold text-foreground">
          Answer Key & Explanation Reveal
        </AlertTitle>
        <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
          This preview reveals the correct option snapshots and question explanations for faculty verification.
          Students undertaking this exam will not see answer highlights until the official answer key is released.
        </AlertDescription>
      </Alert>

      {/* 3-Chip Info Strip */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Duration</p>
            <p className="text-sm sm:text-base font-bold text-foreground">
              {exam.durationMinutes} min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Award className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Total Marks</p>
            <p className="text-sm sm:text-base font-bold text-foreground">
              {totalMarks} pts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FileQuestion className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Questions</p>
            <p className="text-sm sm:text-base font-bold text-foreground">
              {exam.examQuestions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {exam.examQuestions.map((eq, index) => (
          <div
            key={eq.id}
            className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                  {index + 1}
                </span>
                <span className="font-heading text-sm sm:text-base font-bold text-foreground">
                  Question {index + 1}
                </span>
              </div>
              <Badge
                variant="outline"
                className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-muted/60 text-muted-foreground border-border/70"
              >
                <Award className="mr-1 size-3 text-primary" />
                {eq.marks} mark{eq.marks === 1 ? "" : "s"}
              </Badge>
            </div>

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
          </div>
        ))}
      </div>
    </div>
  )
}
