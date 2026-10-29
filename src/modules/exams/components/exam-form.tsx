"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import {
  Clock,
  Sparkles,
  ShieldCheck,
  Shuffle,
  Video,
  AlertTriangle,
  Award,
  Layers,
  Check,
  ArrowRight,
  FileText,
  Calendar,
  AlertCircle,
  HelpCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { cn } from "@/lib/utils"
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

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120]
const ATTEMPTS_PRESETS = [1, 2, 3, 5]
const THRESHOLD_PRESETS = [
  { val: 3, label: "Strict (3)" },
  { val: 5, label: "Standard (5)" },
  { val: 10, label: "Lenient (10)" },
]

export function ExamForm({
  action,
  initialValues,
  submitLabel,
  cancelHref = "/teacher/exams",
}: {
  action: (
    state: ExamFormState,
    formData: FormData
  ) => Promise<ExamFormState>
  initialValues?: ExamFormValues
  submitLabel: string
  cancelHref?: string
}) {
  const [state, formAction, isPending] = useActionState(action, undefined)

  // Interactive local states for quick presets and toggles
  const [duration, setDuration] = useState<number | string>(
    initialValues?.durationMinutes ?? 60
  )
  const [maxAttempts, setMaxAttempts] = useState<number | string>(
    initialValues?.maxAttempts ?? 1
  )
  const [threshold, setThreshold] = useState<number | string>(
    initialValues?.violationReviewThreshold ?? 5
  )
  const [shuffleQuestions, setShuffleQuestions] = useState(
    initialValues?.shuffleQuestions ?? true
  )
  const [shuffleOptions, setShuffleOptions] = useState(
    initialValues?.shuffleOptions ?? false
  )
  const [webcamRequired, setWebcamRequired] = useState(
    initialValues?.webcamMonitoringRequired ?? false
  )

  return (
    <form action={formAction} className="w-full space-y-8">
      {/* Hidden native checkboxes for Zod / FormData parity */}
      <input
        type="checkbox"
        name="shuffleQuestions"
        checked={shuffleQuestions}
        onChange={(e) => setShuffleQuestions(e.target.checked)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <input
        type="checkbox"
        name="shuffleOptions"
        checked={shuffleOptions}
        onChange={(e) => setShuffleOptions(e.target.checked)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <input
        type="checkbox"
        name="webcamMonitoringRequired"
        checked={webcamRequired}
        onChange={(e) => setWebcamRequired(e.target.checked)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Error Banner */}
      {state && "error" in state && (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30 shadow-xs">
          <AlertCircle className="size-5" />
          <AlertDescription className="text-sm font-medium">
            {state.error}
          </AlertDescription>
        </Alert>
      )}

      {/* SECTION 1: GENERAL INFORMATION */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs transition-all">
        <div className="flex items-center gap-3 border-b border-border/50 pb-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <FileText className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
              General Details
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Primary identification and instructions presented to students.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="title"
                className="text-sm font-semibold tracking-tight text-foreground"
              >
                Assessment Title <span className="text-destructive">*</span>
              </label>
              <span className="text-xs text-muted-foreground">Max 200 characters</span>
            </div>
            <Input
              id="title"
              name="title"
              defaultValue={initialValues?.title}
              placeholder="e.g. Midterm Examination — Computer Science 101"
              required
              maxLength={200}
              className="h-11 sm:h-12 rounded-xl text-base px-4 bg-background/50 border-border/80 focus-visible:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="description"
                className="text-sm font-semibold tracking-tight text-foreground"
              >
                Description & Instructions
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <span className="text-xs text-muted-foreground">Markdown supported</span>
            </div>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialValues?.description}
              placeholder="Provide test instructions, syllabus breakdown, allowed materials, or grading rubrics..."
              className="rounded-xl text-sm p-4 bg-background/50 border-border/80 focus-visible:ring-primary/20 resize-y"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: TIMING & SCORING POLICY */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs transition-all">
        <div className="flex items-center gap-3 border-b border-border/50 pb-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
            <Clock className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Timing & Scoring Policy
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Define test duration, maximum attempts, and target pass mark.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Duration Minutes with Quick Presets */}
          <div className="space-y-3">
            <label
              htmlFor="durationMinutes"
              className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5"
            >
              <Clock className="size-4 text-muted-foreground" />
              Duration (minutes) <span className="text-destructive">*</span>
            </label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={1}
              max={600}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="h-11 rounded-xl text-base px-4 bg-background/50 border-border/80"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground mr-1">Presets:</span>
              {DURATION_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(m)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                    Number(duration) === m
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Max Attempts with Quick Presets */}
          <div className="space-y-3">
            <label
              htmlFor="maxAttempts"
              className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5"
            >
              <Layers className="size-4 text-muted-foreground" />
              Max Attempts per Student <span className="text-destructive">*</span>
            </label>
            <Input
              id="maxAttempts"
              name="maxAttempts"
              type="number"
              min={1}
              max={10}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              required
              className="h-11 rounded-xl text-base px-4 bg-background/50 border-border/80"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground mr-1">Quick:</span>
              {ATTEMPTS_PRESETS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setMaxAttempts(a)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                    Number(maxAttempts) === a
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {a} {a === 1 ? "attempt" : "attempts"}
                </button>
              ))}
            </div>
          </div>

          {/* Passing Marks */}
          <div className="space-y-2 sm:col-span-2">
            <label
              htmlFor="passingMarks"
              className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5"
            >
              <Award className="size-4 text-muted-foreground" />
              Passing Marks
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              id="passingMarks"
              name="passingMarks"
              type="number"
              min={0}
              step="any"
              defaultValue={initialValues?.passingMarks ?? undefined}
              placeholder="e.g. 50 (leave empty if no passing threshold)"
              className="h-11 rounded-xl text-base px-4 bg-background/50 border-border/80"
            />
            <p className="text-xs text-muted-foreground">
              Students scoring at or above this mark will receive a passing badge on results.
            </p>
          </div>

          {/* Schedule Windows */}
          <div className="space-y-2">
            <label
              htmlFor="startTime"
              className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5"
            >
              <Calendar className="size-4 text-muted-foreground" />
              Opens at
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <DateTimePicker
              id="startTime"
              name="startTime"
              defaultValue={
                initialValues?.startTime ? new Date(initialValues.startTime) : undefined
              }
              placeholder="Select start date & time"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="endTime"
              className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5"
            >
              <Calendar className="size-4 text-muted-foreground" />
              Closes at
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <DateTimePicker
              id="endTime"
              name="endTime"
              defaultValue={
                initialValues?.endTime ? new Date(initialValues.endTime) : undefined
              }
              placeholder="Select closing date & time"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: RANDOMIZATION & PROCTORING */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs transition-all">
        <div className="flex items-center gap-3 border-b border-border/50 pb-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-2xs">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Randomization & Academic Integrity
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Prevent collusion, shuffle content dynamically, and set up proctoring review triggers.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {/* Card Toggle 1: Shuffle Questions */}
          <div
            onClick={() => setShuffleQuestions(!shuffleQuestions)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault()
                setShuffleQuestions(!shuffleQuestions)
              }
            }}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-2xl border p-4 sm:p-5 transition-all select-none",
              shuffleQuestions
                ? "border-primary/50 bg-primary/[0.03] shadow-xs"
                : "border-border/70 bg-muted/20 hover:border-border hover:bg-muted/40"
            )}
          >
            <div className="flex items-start gap-3.5 pr-4">
              <div
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                  shuffleQuestions
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Shuffle className="size-4.5" />
              </div>
              <div>
                <p className="font-heading text-sm sm:text-base font-semibold text-foreground">
                  Shuffle Question Order
                </p>
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                  Randomizes the sequence of questions independently for every student attempt.
                </p>
              </div>
            </div>
            <Switch
              checked={shuffleQuestions}
              onCheckedChange={setShuffleQuestions}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Card Toggle 2: Shuffle Options */}
          <div
            onClick={() => setShuffleOptions(!shuffleOptions)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault()
                setShuffleOptions(!shuffleOptions)
              }
            }}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-2xl border p-4 sm:p-5 transition-all select-none",
              shuffleOptions
                ? "border-primary/50 bg-primary/[0.03] shadow-xs"
                : "border-border/70 bg-muted/20 hover:border-border hover:bg-muted/40"
            )}
          >
            <div className="flex items-start gap-3.5 pr-4">
              <div
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                  shuffleOptions
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Shuffle className="size-4.5" />
              </div>
              <div>
                <p className="font-heading text-sm sm:text-base font-semibold text-foreground">
                  Shuffle Answer Options
                </p>
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                  Randomizes choices (A, B, C, D) per question so option answers cannot be shared.
                </p>
              </div>
            </div>
            <Switch
              checked={shuffleOptions}
              onCheckedChange={setShuffleOptions}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Card Toggle 3: Webcam Monitoring */}
          <div
            onClick={() => setWebcamRequired(!webcamRequired)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault()
                setWebcamRequired(!webcamRequired)
              }
            }}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-2xl border p-4 sm:p-5 transition-all select-none",
              webcamRequired
                ? "border-primary/50 bg-primary/[0.03] shadow-xs"
                : "border-border/70 bg-muted/20 hover:border-border hover:bg-muted/40"
            )}
          >
            <div className="flex items-start gap-3.5 pr-4">
              <div
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                  webcamRequired
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Video className="size-4.5" />
              </div>
              <div>
                <p className="font-heading text-sm sm:text-base font-semibold text-foreground">
                  Require Webcam Monitoring Consent
                </p>
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                  Students must grant front-camera authorization before commencing the exam.
                </p>
              </div>
            </div>
            <Switch
              checked={webcamRequired}
              onCheckedChange={setWebcamRequired}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Violation Review Threshold */}
          <div className="mt-6 rounded-2xl border border-border/70 bg-muted/20 p-5 space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <label
                  htmlFor="violationReviewThreshold"
                  className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5"
                >
                  <AlertTriangle className="size-4 text-amber-500" />
                  Violation Review Threshold <span className="text-destructive">*</span>
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cumulative severity score from tab switches or fullscreen exits that flags an attempt.
                </p>
              </div>
              <div className="flex items-center gap-1.5 pt-2 sm:pt-0">
                {THRESHOLD_PRESETS.map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setThreshold(t.val)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                      Number(threshold) === t.val
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <Input
              id="violationReviewThreshold"
              name="violationReviewThreshold"
              type="number"
              min={1}
              max={1000}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              required
              className="h-10 w-full sm:w-44 rounded-xl text-base px-3.5 bg-background border-border/80"
            />
            <p className="text-xs text-muted-foreground italic">
              Note: Flagging only requests human teacher review in the results dashboard — it never disqualifies students automatically.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS BAR */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end pt-2">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 rounded-xl px-6 text-sm font-semibold shadow-2xs hover:bg-muted"
        >
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-12 rounded-xl px-7 text-sm font-semibold shadow-xs"
        >
          {isPending && <Spinner className="mr-2" />}
          <span>{submitLabel}</span>
          {!isPending && <ArrowRight className="ml-2 size-4" />}
        </Button>
      </div>
    </form>
  )
}
