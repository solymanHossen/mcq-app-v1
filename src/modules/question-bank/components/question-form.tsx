"use client"

import { useActionState, useRef, useState } from "react"
import Link from "next/link"
import {
  HelpCircle,
  CheckCircle2,
  FileCode2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { QuestionFormState } from "@/modules/question-bank/actions"

export type QuestionFormValues = {
  subject?: string
  topic?: string
  difficulty?: string
  questionText?: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctOption?: string
  explanation?: string
  imageUrl?: string
  codeSnippet?: string
  codeLanguage?: string
}

export function QuestionForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (
    state: QuestionFormState,
    formData: FormData
  ) => Promise<QuestionFormState>
  initialValues?: QuestionFormValues
  submitLabel: string
}) {
  const [state, formAction, isPending] = useActionState(action, undefined)
  const [confirmedDuplicate, setConfirmedDuplicate] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function saveAnyway() {
    if (!formRef.current) return
    const data = new FormData(formRef.current)
    data.set("confirmDuplicate", "true")
    setConfirmedDuplicate(true)
    formAction(data)
  }

  const showDuplicateWarning =
    state && "duplicateWarning" in state && !confirmedDuplicate

  return (
    <form ref={formRef} action={formAction} className="w-full space-y-6 sm:space-y-8">
      <input type="hidden" name="confirmDuplicate" value="false" />

      {/* ── CARD 1: QUESTION CLASSIFICATION & CORE ── */}
      <Card className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
              <HelpCircle className="size-4.5 sm:size-5.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                Question & Taxonomy
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Categorization, difficulty level, and core question text
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 sm:p-7 space-y-5 sm:space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-xs sm:text-sm font-semibold text-foreground">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                name="subject"
                defaultValue={initialValues?.subject}
                placeholder="e.g. Computer Science"
                className="h-10 rounded-xl text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic" className="text-xs sm:text-sm font-semibold text-foreground">
                Topic <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topic"
                name="topic"
                defaultValue={initialValues?.topic}
                placeholder="e.g. Data Structures"
                className="h-10 rounded-xl text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-xs sm:text-sm font-semibold text-foreground">
                Difficulty <span className="text-destructive">*</span>
              </Label>
              <Select
                name="difficulty"
                defaultValue={initialValues?.difficulty ?? "MEDIUM"}
              >
                <SelectTrigger id="difficulty" className="h-10 w-full rounded-xl border-border/70 bg-card shadow-2xs font-semibold text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className="rounded-xl border-border/70 shadow-xl bg-popover z-50 p-1">
                  <SelectGroup>
                    <SelectItem value="EASY" className="rounded-lg text-xs sm:text-sm font-medium">Easy</SelectItem>
                    <SelectItem value="MEDIUM" className="rounded-lg text-xs sm:text-sm font-medium">Medium</SelectItem>
                    <SelectItem value="HARD" className="rounded-lg text-xs sm:text-sm font-medium">Hard</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="questionText" className="text-xs sm:text-sm font-semibold text-foreground">
                Question Text <span className="text-destructive">*</span>
              </Label>
              <span className="text-xs text-muted-foreground font-medium">
                Wrap LaTeX math in $…$ or $$…$$
              </span>
            </div>
            <Textarea
              id="questionText"
              name="questionText"
              rows={4}
              defaultValue={initialValues?.questionText}
              placeholder="Enter your question text here. LaTeX equations like $\int_0^1 x dx$ will be rendered automatically..."
              className="rounded-xl text-xs sm:text-sm min-h-[105px] resize-y p-3.5 leading-relaxed"
              required
            />
          </div>
        </div>
      </Card>

      {/* ── CARD 2: OPTIONS & ANSWER KEY ── */}
      <Card className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-emerald-500/20">
              <CheckCircle2 className="size-4.5 sm:size-5.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                Options & Correct Answer
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Provide 4 distinct choices and mark the correct key
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 sm:p-7 space-y-5 sm:space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {(["A", "B", "C", "D"] as const).map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`option${key}`} className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <span className="flex size-5 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-foreground">
                    {key}
                  </span>
                  <span>Option {key}</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`option${key}`}
                  name={`option${key}`}
                  defaultValue={
                    initialValues?.[`option${key}` as keyof QuestionFormValues]
                  }
                  placeholder={`Choice ${key} content...`}
                  className="h-10 rounded-xl text-xs sm:text-sm"
                  required
                />
              </div>
            ))}
          </div>

          <div className="space-y-2 max-w-xs pt-1">
            <Label htmlFor="correctOption" className="text-xs sm:text-sm font-semibold text-foreground">
              Correct Answer Key <span className="text-destructive">*</span>
            </Label>
            <Select
              name="correctOption"
              defaultValue={initialValues?.correctOption ?? "A"}
            >
              <SelectTrigger id="correctOption" className="h-10 w-full rounded-xl border-border/70 bg-card shadow-2xs font-semibold text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="rounded-xl border-border/70 shadow-xl bg-popover z-50 p-1">
                <SelectGroup>
                  <SelectItem value="A" className="rounded-lg text-xs sm:text-sm font-medium">Option A is correct</SelectItem>
                  <SelectItem value="B" className="rounded-lg text-xs sm:text-sm font-medium">Option B is correct</SelectItem>
                  <SelectItem value="C" className="rounded-lg text-xs sm:text-sm font-medium">Option C is correct</SelectItem>
                  <SelectItem value="D" className="rounded-lg text-xs sm:text-sm font-medium">Option D is correct</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* ── CARD 3: ADDITIONAL CONTEXT & CODE ── */}
      <Card className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-amber-500/20">
              <FileCode2 className="size-4.5 sm:size-5.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                Context & Explanations
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Optional rationale shown after results release, diagrams, or code snippets
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 sm:p-7 space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="explanation" className="text-xs sm:text-sm font-semibold text-foreground">
                Solution Explanation
              </Label>
              <span className="text-xs text-muted-foreground font-medium">Optional</span>
            </div>
            <Textarea
              id="explanation"
              name="explanation"
              rows={3}
              defaultValue={initialValues?.explanation}
              placeholder="Explain why the designated option is correct, including theorems or derivations..."
              className="rounded-xl text-xs sm:text-sm min-h-[85px] resize-y p-3.5 leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="imageUrl" className="text-xs sm:text-sm font-semibold text-foreground">
                Diagram / Image URL
              </Label>
              <span className="text-xs text-muted-foreground font-medium">Optional</span>
            </div>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/diagram.png"
              defaultValue={initialValues?.imageUrl}
              className="h-10 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="codeSnippet" className="text-xs sm:text-sm font-semibold text-foreground">
                  Code Snippet
                </Label>
                <span className="text-xs text-muted-foreground font-medium">Optional</span>
              </div>
              <Textarea
                id="codeSnippet"
                name="codeSnippet"
                rows={4}
                className="font-mono text-xs sm:text-sm rounded-xl p-3.5 leading-relaxed"
                placeholder="// Code snippet for candidates to analyze..."
                defaultValue={initialValues?.codeSnippet}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codeLanguage" className="text-xs sm:text-sm font-semibold text-foreground">
                Code Language
              </Label>
              <Input
                id="codeLanguage"
                name="codeLanguage"
                placeholder="javascript"
                defaultValue={initialValues?.codeLanguage}
                className="h-10 rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Errors and Warnings */}
      {state && "error" in state && (
        <Alert variant="destructive" className="rounded-2xl border-rose-500/25 bg-rose-500/10">
          <AlertTriangle className="size-4 text-destructive" />
          <AlertTitle className="font-heading font-semibold text-destructive">Submission Error</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm text-destructive">{state.error}</AlertDescription>
        </Alert>
      )}

      {showDuplicateWarning && "duplicateQuestionId" in state && (
        <Alert variant="destructive" className="rounded-2xl border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="size-4 text-amber-500" />
          <AlertTitle className="font-heading font-semibold text-foreground">Duplicate Question Detected</AlertTitle>
          <AlertDescription className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p className="line-clamp-2">
              A similar question already exists in your vault: &ldquo;{state.duplicateText}&rdquo;
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button type="button" size="sm" onClick={saveAnyway} className="h-8 rounded-lg text-xs font-semibold">
                Save Anyway
              </Button>
              <Button type="button" size="sm" variant="outline" asChild className="h-8 rounded-lg text-xs font-semibold">
                <Link href={`/teacher/questions/${state.duplicateQuestionId}`}>
                  View Existing Question
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild
          className="h-11 rounded-xl px-5 text-xs sm:text-sm font-semibold border-border/70 shadow-2xs hover:bg-muted"
        >
          <Link href="/teacher/questions">Cancel</Link>
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          size="sm"
          className="h-11 rounded-xl px-6 text-xs sm:text-sm font-semibold shadow-xs"
        >
          {isPending && <Spinner className="mr-2 size-4" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
