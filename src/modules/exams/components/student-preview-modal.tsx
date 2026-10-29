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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LatexText } from "@/components/shared/latex-text"
import {
  Eye,
  Clock,
  HelpCircle,
  Award,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
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
            className="gap-2 rounded-xl text-xs sm:text-sm h-10 px-4 shadow-2xs font-semibold"
          >
            <Eye className="size-4 text-primary" />
            <span>Student Preview</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-2 text-left border-b border-border/50 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-bold px-2.5 py-0.5">
              <Sparkles className="size-3 mr-1" />
              Student Live Preview
            </Badge>
            <Badge variant="secondary" className="text-xs text-muted-foreground">
              Teacher Simulation View
            </Badge>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
            {exam.title}
          </DialogTitle>

          {exam.description && (
            <DialogDescription className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {exam.description}
            </DialogDescription>
          )}

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="size-3.5 text-primary" />
              {exam.durationMinutes} Minutes Allotted
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <HelpCircle className="size-3.5 text-primary" />
              {exam.examQuestions.length} Questions
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Award className="size-3.5 text-primary" />
              {totalMarks} Total Marks
            </span>
            {exam.passingMarks && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">Pass Mark: {exam.passingMarks}</span>
              </>
            )}
          </div>
        </DialogHeader>

        {/* Mock Candidate Instructions Banner */}
        <div className="my-2 p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1.5">
          <p className="font-bold text-foreground flex items-center gap-1.5">
            <AlertCircle className="size-3.5 text-primary" />
            Candidate Instructions & Rules:
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>The test timer begins the moment the candidate starts their attempt.</li>
            <li>Each question has single correct multiple choice options.</li>
            {exam.webcamMonitoringRequired && (
              <li className="text-amber-600 dark:text-amber-400 font-medium">
                Webcam monitoring is required for this examination.
              </li>
            )}
          </ul>
        </div>

        {/* Question Previews */}
        <div className="space-y-6 pt-2">
          {exam.examQuestions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm space-y-2">
              <HelpCircle className="size-10 mx-auto text-muted-foreground/50" />
              <p className="font-semibold text-foreground">No questions added yet.</p>
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
                  className="rounded-2xl border border-border/70 bg-card p-5 space-y-3.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-lg bg-primary/10">
                      Question {idx + 1} of {exam.examQuestions.length}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                    </span>
                  </div>

                  <div className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">
                    <LatexText text={q.questionTextSnapshot} />
                  </div>

                  {options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {options.map((opt) => {
                        const isCorrect = q.correctOptionSnapshot === opt.key

                        return (
                          <div
                            key={opt.key}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm ${
                              isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/30 text-foreground font-medium"
                                : "bg-muted/20 border-border/60 text-foreground"
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
                              <LatexText text={opt.text!} />
                            </div>
                            {isCorrect && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold self-center shrink-0">
                                (Answer Key)
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {q.explanationSnapshot && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground">
                      <strong className="text-foreground">Explanation: </strong>
                      <LatexText text={q.explanationSnapshot} />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="pt-4 border-t border-border/50 flex justify-end">
          <Button
            type="button"
            className="rounded-xl px-5 font-semibold text-xs sm:text-sm h-10"
            onClick={() => setOpen(false)}
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
