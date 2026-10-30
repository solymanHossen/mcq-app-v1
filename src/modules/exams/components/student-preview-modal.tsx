"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LatexText } from "@/components/shared/latex-text"
import { cn } from "@/lib/utils"
import {
  Eye,
  Clock,
  HelpCircle,
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Info,
} from "lucide-react"

export interface StudentPreviewModalProps {
  exam: {
    id: string
    title: string
    description?: string | null
    durationMinutes: number
    maxAttempts: number
    passingMarks?: number | null
    allowGuestAccess?: boolean
    accessCode?: string | null
    webcamMonitoringRequired?: boolean
    examQuestions: Array<{
      id: string
      order: number
      marks: number
      questionTextSnapshot: string
      optionASnapshot?: string
      optionBSnapshot?: string
      optionCSnapshot?: string
      optionDSnapshot?: string
      correctOptionSnapshot?: string
      explanationSnapshot?: string | null
    }>
  }
  totalMarks: number
  trigger?: React.ReactNode
}

export function StudentPreviewModal({
  exam,
  totalMarks,
  trigger,
}: StudentPreviewModalProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 rounded-xl text-xs sm:text-sm h-10 px-4 shadow-2xs font-semibold cursor-pointer border-border/70 hover:bg-muted"
          >
            <Eye className="size-4 text-primary" />
            <span>Preview</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="w-[96vw] sm:w-[94vw] md:w-[92vw] lg:w-[90vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border-border/80 bg-background space-y-6 sm:space-y-7">
        <DialogHeader className="space-y-3.5 text-left p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-8 sm:pr-10">
            <div className="flex items-center gap-2.5">
              <Badge
                variant="outline"
                className="rounded-full bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 text-xs gap-1.5 shadow-2xs"
              >
                <Eye className="size-3.5" />
                <span>Preview Mode</span>
              </Badge>
              <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
                Simulated Candidate View
              </span>
            </div>

            {/* Candidate Instructions & Rules Interactive Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-card hover:bg-muted text-foreground border border-border/70 transition-all cursor-pointer shadow-2xs group"
                >
                  <Info className="size-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span>Instructions & Rules</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 sm:w-96 p-4 rounded-2xl shadow-xl border-border/80 text-xs space-y-3 bg-popover z-50"
              >
                <div className="flex items-center gap-2 font-bold text-foreground text-sm border-b border-border/60 pb-2">
                  <AlertCircle className="size-4 text-primary" />
                  <span>Candidate Instructions & Rules</span>
                </div>
                <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground leading-relaxed">
                  <li>The test timer begins the moment the candidate starts their attempt.</li>
                  <li>Each question has single correct multiple choice options.</li>
                  {exam.webcamMonitoringRequired && (
                    <li className="text-amber-600 dark:text-amber-400 font-semibold">
                      Webcam proctoring is enabled for this examination.
                    </li>
                  )}
                  {exam.allowGuestAccess && (
                    <li>Guest access active (candidates can join directly with name and email).</li>
                  )}
                  {Boolean(exam.passingMarks && exam.passingMarks > 0) && (
                    <li>Passing mark threshold: {exam.passingMarks} marks.</li>
                  )}
                </ul>
              </PopoverContent>
            </Popover>
          </div>

          <DialogTitle className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {exam.title}
          </DialogTitle>

          {exam.description && (
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {exam.description}
            </DialogDescription>
          )}

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground px-3 py-1 rounded-full bg-card border border-border/70 shadow-2xs">
              <Clock className="size-3.5 text-primary" />
              <span>{exam.durationMinutes} Minutes Allotted</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground px-3 py-1 rounded-full bg-card border border-border/70 shadow-2xs">
              <HelpCircle className="size-3.5 text-primary" />
              <span>{exam.examQuestions.length} Questions</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground px-3 py-1 rounded-full bg-card border border-border/70 shadow-2xs">
              <Award className="size-3.5 text-primary" />
              <span>{totalMarks} Total Marks</span>
            </span>
            {Boolean(exam.passingMarks && exam.passingMarks > 0) && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground px-3 py-1 rounded-full bg-card border border-border/70 shadow-2xs">
                <span>Pass Threshold: {exam.passingMarks}</span>
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Clean Questions Container */}
        <div className="space-y-5 sm:space-y-6">
          {exam.examQuestions.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm space-y-3 rounded-2xl border border-dashed border-border/80 bg-muted/10 p-8">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center ring-1 ring-primary/20">
                <HelpCircle className="size-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground text-base">No questions added yet</p>
                <p className="text-xs text-muted-foreground">Add questions from your bank to see them in this preview.</p>
              </div>
            </div>
          ) : (
            exam.examQuestions.map((q, idx) => {
              const options = [
                { key: "A", text: q.optionASnapshot },
                { key: "B", text: q.optionBSnapshot },
                { key: "C", text: q.optionCSnapshot },
                { key: "D", text: q.optionDSnapshot },
              ].filter((opt) => Boolean(opt.text))

              return (
                <div
                  key={q.id}
                  className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-2xs transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                      Question {idx + 1} of {exam.examQuestions.length}
                    </span>
                    <span className="inline-flex items-center text-xs font-semibold text-muted-foreground px-3 py-1 rounded-full bg-muted/30 border border-border/60">
                      {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                    </span>
                  </div>

                  <div className="font-heading text-lg sm:text-xl font-bold text-foreground leading-snug">
                    <LatexText text={q.questionTextSnapshot} />
                  </div>

                  {options.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 pt-0.5">
                      {options.map((opt) => {
                        const isCorrect = q.correctOptionSnapshot === opt.key

                        return (
                          <div
                            key={opt.key}
                            className={cn(
                              "flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border text-sm transition-all min-h-[52px]",
                              isCorrect
                                ? "border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20 text-foreground shadow-2xs"
                                : "border-border/70 bg-card hover:bg-muted/30 text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={cn(
                                  "size-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none",
                                  isCorrect
                                    ? "bg-emerald-600 text-white shadow-2xs"
                                    : "bg-muted/70 text-muted-foreground border border-border/60"
                                )}
                              >
                                {opt.key}
                              </div>
                              <div
                                className={cn(
                                  "min-w-0 flex-1 text-sm leading-relaxed break-words",
                                  isCorrect ? "font-semibold text-foreground" : "font-medium text-foreground"
                                )}
                              >
                                <LatexText text={opt.text!} />
                              </div>
                            </div>

                            {isCorrect && (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full shrink-0">
                                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Correct Answer</span>
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {q.explanationSnapshot && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-muted/20 border border-border/70 text-xs sm:text-sm text-foreground/90 leading-relaxed flex items-center gap-2.5">
                      <Lightbulb className="size-4 text-amber-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <strong className="text-foreground font-semibold">Explanation: </strong>
                        <LatexText text={q.explanationSnapshot} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="pt-2 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl px-5 font-semibold text-xs h-9 border-border/70 shadow-2xs hover:bg-muted cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
