"use client"

import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"

import { DateTimePicker } from "@/components/ui/date-time-picker"
import type { ExamFormState } from "@/modules/exams/actions"



export type ExamFormValues = {
  title?: string
  description?: string
  durationMinutes?: number
  maxAttempts?: number
  passingMarks?: number | null
  startTime?: Date | null
  endTime?: Date | null
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
  webcamMonitoringRequired?: boolean
  violationReviewThreshold?: number
}

function toLocalInputValue(date?: Date | null) {
  if (!date) return undefined
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

export function ExamForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (
    state: ExamFormState,
    formData: FormData
  ) => Promise<ExamFormState>
  initialValues?: ExamFormValues
  submitLabel: string
}) {
  const [state, formAction, isPending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" name="title" defaultValue={initialValues?.title} required />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialValues?.description}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="durationMinutes">Duration (minutes)</FieldLabel>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={1}
              max={600}
              defaultValue={initialValues?.durationMinutes ?? 60}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="maxAttempts">Max attempts</FieldLabel>
            <Input
              id="maxAttempts"
              name="maxAttempts"
              type="number"
              min={1}
              max={10}
              defaultValue={initialValues?.maxAttempts ?? 1}
              required
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="passingMarks">Passing marks (optional)</FieldLabel>
          <Input
            id="passingMarks"
            name="passingMarks"
            type="number"
            min={0}
            step="any"
            defaultValue={initialValues?.passingMarks ?? undefined}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="startTime">Opens at (optional)</FieldLabel>
            <DateTimePicker
              id="startTime"
              name="startTime"
              defaultValue={initialValues?.startTime ? new Date(initialValues.startTime) : undefined}
              placeholder="Pick opening date & time"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="endTime">Closes at (optional)</FieldLabel>
            <DateTimePicker
              id="endTime"
              name="endTime"
              defaultValue={initialValues?.endTime ? new Date(initialValues.endTime) : undefined}
              placeholder="Pick closing date & time"
            />
          </Field>
        </div>


        <Field orientation="horizontal">
          <Checkbox
            id="shuffleQuestions"
            name="shuffleQuestions"
            defaultChecked={initialValues?.shuffleQuestions ?? true}
          />
          <FieldLabel htmlFor="shuffleQuestions" className="font-normal">
            Shuffle question order per student
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="shuffleOptions"
            name="shuffleOptions"
            defaultChecked={initialValues?.shuffleOptions ?? false}
          />
          <FieldLabel htmlFor="shuffleOptions" className="font-normal">
            Shuffle option order per student
          </FieldLabel>
        </Field>

        <Field>
          <FieldLabel htmlFor="violationReviewThreshold">
            Violation review threshold
          </FieldLabel>
          <Input
            id="violationReviewThreshold"
            name="violationReviewThreshold"
            type="number"
            min={1}
            max={1000}
            defaultValue={initialValues?.violationReviewThreshold ?? 5}
            required
          />
          <p className="text-xs text-muted-foreground">
            Cumulative violation severity score that flags an attempt for
            your review. This only ever flags for review — it never
            disqualifies anyone automatically.
          </p>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="webcamMonitoringRequired"
            name="webcamMonitoringRequired"
            defaultChecked={initialValues?.webcamMonitoringRequired ?? false}
          />
          <FieldLabel htmlFor="webcamMonitoringRequired" className="font-normal">
            Require webcam monitoring consent to start
          </FieldLabel>
        </Field>

        {state && "error" in state && <FieldError>{state.error}</FieldError>}

        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending && <Spinner data-icon="inline-start" />}
          {submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
