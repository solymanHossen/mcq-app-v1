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
            className="gap-2 rounded-xl text-xs sm:text-sm h-10 px-4 shadow-2xs font-semibold cursor-pointer"
          >
            <Eye className="size-4 text-primary" />
            <span>Preview</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="w-[96vw] sm:w-[94vw] md:w-[92vw] lg:w-[90vw] sm:max-w-5xl md:max-w-6xl lg:max-w-7xl xl:max-w-[1340px] max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border-border/80">
        <DialogHeader className="space-y-3 text-left border-b border-border/60 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 rounded-full">
                <Eye className="size-3.5 mr-1.5" />
                Preview Mode
              </Badge>
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                Simulated Candidate View
              </span>
            </div>

            {/* Candidate Instructions & Rules Interactive Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground border border-border/80 hover:border-primary/40 transition-all cursor-pointer shadow-2xs group"
                >
                  <Info className="size-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span>Instructions & Rules</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 sm:w-96 p-4 rounded-2xl shadow-xl border-border/80 text-xs space-y-3 bg-popover"
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

          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
            {exam.title}
          </DialogTitle>

          {exam.description && (
            <DialogDescription className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {exam.description}
            </DialogDescription>
          )}

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground px-2.5 py-1 rounded-lg bg-muted/40 border border-border/50">
              <Clock className="size-3.5 text-primary" />
              {exam.durationMinutes} Minutes Allotted
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground px-2.5 py-1 rounded-lg bg-muted/40 border border-border/50">
              <HelpCircle className="size-3.5 text-primary" />
              {exam.examQuestions.length} Questions
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground px-2.5 py-1 rounded-lg bg-muted/40 border border-border/50">
              <Award className="size-3.5 text-primary" />
              {totalMarks} Total Marks
            </span>
            {Boolean(exam.passingMarks && exam.passingMarks > 0) && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground px-2.5 py-1 rounded-lg bg-muted/40 border border-border/50">
                Pass Threshold: {exam.passingMarks}
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Clean Questions Container */}
        <div className="space-y-6 pt-4">
          {exam.examQuestions.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm space-y-2">
              <HelpCircle className="size-12 mx-auto text-muted-foreground/40" />
              <p className="font-semibold text-foreground text-base">No questions added yet.</p>
              <p className="text-xs">Add questions from your bank to see them in this preview.</p>
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
                  className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 space-y-5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-3 pb-1 border-b border-border/40">
                    <span className="text-xs font-bold text-primary px-3 py-1 rounded-lg bg-primary/10">
                      Question {idx + 1} of {exam.examQuestions.length}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground px-2.5 py-1 rounded-lg bg-muted/50 border border-border/50">
                      {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                    </span>
                  </div>

                  <div className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                    <LatexText text={q.questionTextSnapshot} />
                  </div>

                  {options.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                      {options.map((opt) => {
                        const isCorrect = q.correctOptionSnapshot === opt.key

                        return (
                          <div
                            key={opt.key}
                            className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-sm transition-all ${
                              isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/40 text-foreground font-medium shadow-xs ring-1 ring-emerald-500/20"
                                : "bg-muted/20 border-border/70 text-foreground hover:bg-muted/30"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div
                                className={`size-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                                  isCorrect
                                    ? "bg-emerald-600 text-white shadow-2xs"
                                    : "bg-muted text-muted-foreground border border-border/60"
                                }`}
                              >
                                {opt.key}
                              </div>
                              <div className="min-w-0 flex-1 pt-0.5 leading-relaxed break-words">
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
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-xs sm:text-sm text-foreground/90 leading-relaxed flex items-start gap-2.5">
                      <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
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

        <div className="pt-5 border-t border-border/60 flex justify-end">
          <Button
            type="button"
            className="rounded-xl px-6 font-semibold text-xs sm:text-sm h-10 shadow-sm cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
