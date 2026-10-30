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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  Check,
  Info,
  Sparkles,
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
      <TooltipProvider delayDuration={150}>
        <div className="rounded-3xl border border-dashed border-border/80 bg-linear-to-b from-card via-card/70 to-muted/20 p-6 sm:p-10 md:p-12 text-center space-y-7 sm:space-y-8 shadow-xs">
          {/* Header Section */}
          <div className="max-w-xl mx-auto space-y-3.5">
            <div className="size-14 sm:size-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center ring-4 ring-primary/5 shadow-2xs">
              <HelpCircle className="size-7 sm:size-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                Build Your Assessment Questions
              </h3>

              {/* Subtitle placed inside a sleek interactive Tooltip as requested */}
              <div className="flex items-center justify-center pt-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="group/sub inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 hover:bg-muted border border-border/70 hover:border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-help"
                    >
                      <Info className="size-3.5 text-primary group-hover/sub:scale-110 transition-transform" />
                      <span>Setup instructions &amp; overview</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs p-3 space-y-1 shadow-lg bg-popover text-popover-foreground border border-border">
                    <p className="font-semibold text-foreground">Assessment Notice</p>
                    <p className="text-muted-foreground leading-relaxed">
                      This examination currently has no questions. Choose one of the quick start methods below to populate this test.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Small interaction feature tags with tooltips */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border/80 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-help">
                    <Sparkles className="size-3 text-primary" />
                    <span>Instant Snapshotting</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  Questions are safely cloned into this exam so future question bank edits will not change published exam results.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border/80 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground hover:border-emerald-500/50 transition-colors cursor-help">
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    <span>LaTeX &amp; Formula Ready</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  Full KaTeX rendering support for math equations, chemical formulas, and scientific notations.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border/80 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground hover:border-amber-500/50 transition-colors cursor-help">
                    <Award className="size-3 text-amber-500" />
                    <span>Custom Scoring &amp; Penalties</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  Set custom marks per question and optional negative marking penalties per wrong answer.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Cards Section */}
          {editable && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto text-left">
                {/* Option 1: Import from Question Bank */}
                <div className="group relative rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 hover:border-primary/50 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                        <FolderPlus className="size-5 sm:size-6" />
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Badge variant="secondary" className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 cursor-help">
                              Fast Setup
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Fastest method: pull existing verified questions from your repository
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-base sm:text-lg">
                        Import from Question Bank
                      </h4>
                      {/* Sub title placed inside interactive Tooltip */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-help">
                            <span className="font-medium">Snapshot pre-verified questions</span>
                            <Info className="size-3.5 text-primary shrink-0" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-2.5 text-xs bg-popover text-popover-foreground border border-border shadow-md">
                          <p className="font-semibold text-foreground mb-0.5">Question Bank Workflow</p>
                          <p className="text-muted-foreground leading-relaxed">
                            Select and snapshot multiple-choice questions you have already verified and stored in your question bank.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Small interaction feature checklist with tooltips */}
                    <div className="space-y-2 pt-1 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Check className="size-3.5 text-primary" />
                          <span>Bulk selection from repository</span>
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-muted-foreground/80 hover:text-foreground">
                              <Info className="size-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            Select 10, 20, or all questions at once with 1-click filters
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Check className="size-3.5 text-primary" />
                          <span>Isolated snapshot protection</span>
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-muted-foreground/80 hover:text-foreground">
                              <Info className="size-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            Questions remain unchanged even if the master bank is modified later
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild className="w-full gap-2 font-semibold shadow-xs rounded-xl h-11 text-xs sm:text-sm cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href={`/teacher/exams/${examId}/add-questions`}>
                          <span>Browse Question Bank</span>
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Open question repository to search, filter, and import questions
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Option 2: Create New Question */}
                <div className="group relative rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 hover:border-emerald-500/50 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20">
                        <FilePlus2 className="size-5 sm:size-6" />
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Badge variant="secondary" className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-help">
                              Custom Authoring
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          Author a dedicated question tailored specifically for this exam
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-base sm:text-lg">
                        Create New Question
                      </h4>
                      {/* Sub title placed inside interactive Tooltip */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-help">
                            <span className="font-medium">Draft dedicated question directly</span>
                            <Info className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-2.5 text-xs bg-popover text-popover-foreground border border-border shadow-md">
                          <p className="font-semibold text-foreground mb-0.5">Direct Authoring Workflow</p>
                          <p className="text-muted-foreground leading-relaxed">
                            Draft a brand new question with 4 multiple choice options, LaTeX math formulas, and answer explanations.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Small interaction feature checklist with tooltips */}
                    <div className="space-y-2 pt-1 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>4 Options MCQ with Answer Key</span>
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-muted-foreground/80 hover:text-foreground">
                              <Info className="size-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            Define options A, B, C, D with clear single-select answer key
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>LaTeX math &amp; answer explanation</span>
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-muted-foreground/80 hover:text-foreground">
                              <Info className="size-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            Format equations with KaTeX and provide solution hints for students
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" className="w-full gap-2 font-semibold rounded-xl h-11 text-xs sm:text-sm cursor-pointer border-border hover:border-emerald-500/50 hover:bg-emerald-500/5">
                        <Link href="/teacher/questions/new">
                          <span>Create New Question</span>
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Open full question creation form with math editor &amp; options
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Guidance Banner */}
              <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground max-w-xl mx-auto">
                <Lightbulb className="size-4 text-amber-500 shrink-0" />
                <span>Tip: You can reorder questions, modify marks, and set negative marking anytime after adding.</span>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
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
