"use client"

import { useActionState, useRef, useState } from "react"
import Link from "next/link"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field"
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
import type { QuestionFormState } from "@/actions/question.actions"

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
    <form ref={formRef} action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="confirmDuplicate" value="false" />

      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="subject">Subject</FieldLabel>
            <Input
              id="subject"
              name="subject"
              defaultValue={initialValues?.subject}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="topic">Topic</FieldLabel>
            <Input
              id="topic"
              name="topic"
              defaultValue={initialValues?.topic}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="difficulty">Difficulty</FieldLabel>
            <Select
              name="difficulty"
              defaultValue={initialValues?.difficulty ?? "MEDIUM"}
            >
              <SelectTrigger id="difficulty" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="questionText">
            Question text (wrap LaTeX in $…$ or $$…$$)
          </FieldLabel>
          <Textarea
            id="questionText"
            name="questionText"
            rows={3}
            defaultValue={initialValues?.questionText}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          {(["A", "B", "C", "D"] as const).map((key) => (
            <Field key={key}>
              <FieldLabel htmlFor={`option${key}`}>Option {key}</FieldLabel>
              <Input
                id={`option${key}`}
                name={`option${key}`}
                defaultValue={
                  initialValues?.[`option${key}` as keyof QuestionFormValues]
                }
                required
              />
            </Field>
          ))}
        </div>

        <Field>
          <FieldLabel htmlFor="correctOption">Correct option</FieldLabel>
          <Select
            name="correctOption"
            defaultValue={initialValues?.correctOption ?? "A"}
          >
            <SelectTrigger id="correctOption" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <FieldSeparator />

        <Field>
          <FieldLabel htmlFor="explanation">Explanation (optional)</FieldLabel>
          <Textarea
            id="explanation"
            name="explanation"
            rows={2}
            defaultValue={initialValues?.explanation}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="imageUrl">Diagram image URL (optional)</FieldLabel>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://…"
            defaultValue={initialValues?.imageUrl}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Field>
            <FieldLabel htmlFor="codeSnippet">Code snippet (optional)</FieldLabel>
            <Textarea
              id="codeSnippet"
              name="codeSnippet"
              rows={3}
              className="font-mono text-sm"
              defaultValue={initialValues?.codeSnippet}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="codeLanguage">Language</FieldLabel>
            <Input
              id="codeLanguage"
              name="codeLanguage"
              placeholder="javascript"
              defaultValue={initialValues?.codeLanguage}
            />
          </Field>
        </div>

        {state && "error" in state && <FieldError>{state.error}</FieldError>}

        {showDuplicateWarning && "duplicateQuestionId" in state && (
          <Alert variant="destructive">
            <AlertTitle>This looks like a duplicate</AlertTitle>
            <AlertDescription className="space-y-2">
              <p className="line-clamp-2">
                A similar question already exists: &ldquo;{state.duplicateText}
                &rdquo;
              </p>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={saveAnyway}>
                  Save anyway
                </Button>
                <Button type="button" size="sm" variant="ghost" asChild>
                  <Link href={`/teacher/questions/${state.duplicateQuestionId}`}>
                    View existing question
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending && <Spinner data-icon="inline-start" />}
          {submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
