"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  reorderExamQuestionsAction,
  removeQuestionFromExamAction,
} from "@/modules/exams/exam-question-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LatexText } from "@/components/shared/latex-text"
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  FolderPlus,
  FilePlus2,
  Award,
  Loader2,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Lightbulb,
} from "lucide-react"

export type ListedQuestion = {
  id: string
  order?: number
  marks: number
  negativeMarks?: number
  questionTextSnapshot: string
  optionASnapshot?: string
  optionBSnapshot?: string
  optionCSnapshot?: string
  optionDSnapshot?: string
  correctOptionSnapshot?: string
  explanationSnapshot?: string | null
}

export function ExamQuestionList({
  examId,
  questions,
  editable,
}: {
  examId: string
  questions: ListedQuestion[]
  editable: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({})

  function toggleExplanation(id: string) {
    setExpandedExplanations((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= questions.length) return
    const reordered = [...questions]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)

    startTransition(async () => {
      const result = await reorderExamQuestionsAction(
        examId,
        reordered.map((q) => q.id)
      )
      if (result?.error) toast.error(result.error)
    })
  }

  function remove(examQuestionId: string) {
    startTransition(async () => {
      const result = await removeQuestionFromExamAction(examId, examQuestionId)
      if (result?.error) toast.error(result.error)
      else toast.success("Question removed from exam")
    })
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border/80 bg-muted/10 p-6 sm:p-10 text-center space-y-6 sm:space-y-8 shadow-2xs">
        <div className="max-w-md mx-auto space-y-2">
          <div className="size-12 sm:size-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-2xs">
            <HelpCircle className="size-6 sm:size-7" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Build Your Assessment Questions
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            This examination currently has no questions. Choose one of the quick start methods below to populate this test.
          </p>
        </div>

        {editable && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 max-w-2xl mx-auto text-left">
            {/* Option 1: Add from Bank */}
            <div className="group relative rounded-2xl border border-border/70 bg-card p-4 sm:p-5 hover:border-primary/50 shadow-2xs transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FolderPlus className="size-5" />
                </div>
                <h4 className="font-bold text-foreground text-sm sm:text-base">
                  Import from Question Bank
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Select and snapshot multiple-choice questions you have already verified and stored in your question bank.
                </p>
              </div>

              <Button asChild className="w-full gap-2 font-semibold shadow-xs rounded-xl h-10 text-xs sm:text-sm cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href={`/teacher/exams/${examId}/add-questions`}>
                  <span>Browse Question Bank</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>

            {/* Option 2: Create Brand New */}
            <div className="group relative rounded-2xl border border-border/70 bg-card p-4 sm:p-5 hover:border-emerald-500/50 shadow-2xs transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FilePlus2 className="size-5" />
                </div>
                <h4 className="font-bold text-foreground text-sm sm:text-base">
                  Create New Question
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Draft a brand new question with 4 multiple choice options, LaTeX math formulas, and answer explanations.
                </p>
              </div>

              <Button asChild variant="outline" className="w-full gap-2 font-semibold rounded-xl h-10 text-xs sm:text-sm cursor-pointer shadow-2xs">
                <Link href="/teacher/questions/new">
                  <span>Create New Question</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((q, index) => {
        const hasOptions =
          q.optionASnapshot &&
          q.optionBSnapshot &&
          q.optionCSnapshot &&
          q.optionDSnapshot
        const hasExplanation = Boolean(q.explanationSnapshot)
        const isExplanationOpen = expandedExplanations[q.id]

        const options = hasOptions
          ? [
              { key: "A", text: q.optionASnapshot! },
              { key: "B", text: q.optionBSnapshot! },
              { key: "C", text: q.optionCSnapshot! },
              { key: "D", text: q.optionDSnapshot! },
            ]
          : []

        return (
          <div
            key={q.id}
            className="group relative rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-sm space-y-4"
          >
            {/* Top Row: Question Number, Marks & Actions */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center size-8 rounded-xl bg-primary/10 text-primary font-bold text-xs">
                  Q{index + 1}
                </div>
                <Badge variant="outline" className="text-xs font-semibold gap-1 px-2.5 py-1 rounded-lg border-border/70 text-foreground">
                  <Award className="size-3 text-primary" />
                  <span>{q.marks} {q.marks === 1 ? "Mark" : "Marks"}</span>
                  {typeof q.negativeMarks === "number" && q.negativeMarks > 0 && (
                    <span className="text-destructive font-normal ml-1">
                      (-{q.negativeMarks} neg.)
                    </span>
                  )}
                </Badge>
              </div>

              {/* Action Buttons */}
              {editable && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    disabled={isPending || index === 0}
                    onClick={() => move(index, -1)}
                    title="Move Question Up"
                    aria-label="Move question up"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    disabled={isPending || index === questions.length - 1}
                    onClick={() => move(index, 1)}
                    title="Move Question Down"
                    aria-label="Move question down"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={isPending}
                    onClick={() => remove(q.id)}
                    title="Remove Question from Exam"
                    aria-label="Remove question"
                  >
                    {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  </Button>
                </div>
              )}
            </div>

            {/* Question Text */}
            <div className="text-sm sm:text-base font-semibold text-foreground leading-relaxed pl-1">
              <LatexText text={q.questionTextSnapshot} />
            </div>

            {/* Options Grid (if snapshots are available) */}
            {hasOptions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {options.map((opt) => {
                  const isCorrect = q.correctOptionSnapshot === opt.key

                  return (
                    <div
                      key={opt.key}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all text-xs sm:text-sm ${
                        isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/40 text-foreground font-medium"
                          : "bg-muted/30 border-border/60 text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCorrect
                            ? "bg-emerald-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt.key}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <LatexText text={opt.text} />
                      </div>

                      {isCorrect && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 self-center">
                          <CheckCircle2 className="size-3.5" />
                          <span>Correct</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Explanation Toggle */}
            {hasExplanation && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => toggleExplanation(q.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Lightbulb className="size-3 text-amber-500" />
                  <span>{isExplanationOpen ? "Hide Explanation" : "View Explanation"}</span>
                  {isExplanationOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </button>

                {isExplanationOpen && (
                  <div className="mt-2 p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <LatexText text={q.explanationSnapshot!} />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
