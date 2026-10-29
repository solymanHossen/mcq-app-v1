"use client"

import * as React from "react"
import { useActionState, useState } from "react"
import Link from "next/link"
import {
  Clock,
  Shuffle,
  Camera,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Trophy,
  Shield,
  Calendar,
  Layers,
  Check,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import type { ExamFormState } from "@/modules/exams/actions"
import { cn } from "@/lib/utils"

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

const DURATION_PRESETS = [30, 45, 60, 90, 120] as const

export function ExamForm({
  action,
  initialValues,
  submitLabel = "Create Exam",
  cancelHref = "/teacher/exams",
}: {
  action: (
    state: ExamFormState,
    formData: FormData
  ) => Promise<ExamFormState>
  initialValues?: ExamFormValues
  submitLabel?: string
  cancelHref?: string
}) {
  const [state, formAction, isPending] = useActionState(action, undefined)

  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialValues?.durationMinutes ?? 60
  )
  const [maxAttempts, setMaxAttempts] = useState<number>(
    initialValues?.maxAttempts ?? 1
  )
  const [passingMarks, setPassingMarks] = useState<string>(
    initialValues?.passingMarks != null ? String(initialValues.passingMarks) : ""
  )
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(
    initialValues?.shuffleQuestions ?? true
  )
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(
    initialValues?.shuffleOptions ?? false
  )
  const [webcamMonitoringRequired, setWebcamMonitoringRequired] =
    useState<boolean>(initialValues?.webcamMonitoringRequired ?? false)
  const [violationThreshold, setViolationThreshold] = useState<number>(
    initialValues?.violationReviewThreshold ?? 5
  )

  const activeProctoringCount = [
    shuffleQuestions,
    shuffleOptions,
    webcamMonitoringRequired,
  ].filter(Boolean).length

  return (
    <form action={formAction} className="w-full">
      {state && "error" in state && (
        <Alert variant="destructive" className="mb-6 rounded-xl border-destructive/30">
          <AlertTriangle className="size-4" />
          <AlertTitle className="text-sm font-semibold">Error saving exam</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Form Canvas (8 Columns on lg/xl) */}
        <div className="space-y-6 lg:col-span-8 min-w-0">
          {/* Card 1: Details */}
          <Card className="rounded-2xl border border-border/70 bg-card py-0 gap-0 shadow-xs overflow-hidden">
            <CardHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-border/50 bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground">
                  Exam Details
                </CardTitle>
                <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                  General
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">{title.length}/200</span>
                </div>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mathematics Mid-Term 2026"
                  maxLength={200}
                  className="h-11 sm:h-12 text-base font-medium rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                  Description <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={initialValues?.description}
                  placeholder="Instructions, syllabus topics, or candidate rules..."
                  className="rounded-xl text-sm min-h-[90px] resize-y p-3 sm:p-3.5 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Timing & Scoring */}
          <Card className="rounded-2xl border border-border/70 bg-card py-0 gap-0 shadow-xs overflow-hidden">
            <CardHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-border/50 bg-muted/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  Timing & Limits
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  {DURATION_PRESETS.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-lg font-medium transition-colors border",
                        durationMinutes === mins
                          ? "bg-primary text-primary-foreground border-primary font-semibold shadow-2xs"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                      )}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes" className="text-sm font-semibold text-foreground">
                    Duration (Minutes) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="durationMinutes"
                      name="durationMinutes"
                      type="number"
                      min={1}
                      max={600}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="h-11 sm:h-12 text-base font-semibold rounded-xl pr-12"
                      required
                    />
                    <span className="absolute inset-y-0 right-3.5 flex items-center text-xs font-semibold text-muted-foreground pointer-events-none">
                      min
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts" className="text-sm font-semibold text-foreground">
                    Max Attempts <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="maxAttempts"
                    name="maxAttempts"
                    type="number"
                    min={1}
                    max={10}
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="h-11 sm:h-12 text-base font-semibold rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingMarks" className="text-sm font-semibold text-foreground">
                    Passing Marks <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="passingMarks"
                    name="passingMarks"
                    type="number"
                    min={0}
                    step="any"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
                    placeholder="e.g. 40"
                    className="h-11 sm:h-12 text-base font-semibold rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Schedule */}
          <Card className="rounded-2xl border border-border/70 bg-card py-0 gap-0 shadow-xs overflow-hidden">
            <CardHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-border/50 bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="size-4 text-purple-500" />
                  Schedule Window
                </CardTitle>
                <span className="text-xs text-muted-foreground font-medium">
                  Leave empty for anytime access
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-semibold text-foreground">
                    Opens At
                  </Label>
                  <DateTimePicker
                    id="startTime"
                    name="startTime"
                    defaultValue={initialValues?.startTime ? new Date(initialValues.startTime) : undefined}
                    placeholder="Opening date & time"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-semibold text-foreground">
                    Closes At
                  </Label>
                  <DateTimePicker
                    id="endTime"
                    name="endTime"
                    defaultValue={initialValues?.endTime ? new Date(initialValues.endTime) : undefined}
                    placeholder="Closing date & time"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Proctoring & Integrity */}
          <Card className="rounded-2xl border border-border/70 bg-card py-0 gap-0 shadow-xs overflow-hidden">
            <CardHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-border/50 bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Shield className="size-4 text-emerald-500" />
                  Proctoring & Integrity
                </CardTitle>
                <Badge variant="outline" className="text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  {activeProctoringCount} of 3 active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              {/* Clean 3-Item Toggle Rows */}
              <div className="divide-y divide-border/50 rounded-xl border border-border/60 overflow-hidden bg-card">
                <label
                  htmlFor="shuffleQuestionsSwitch"
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Shuffle className="size-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">Shuffle Questions</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Randomize question order per student</p>
                    </div>
                  </div>
                  <Switch
                    id="shuffleQuestionsSwitch"
                    checked={shuffleQuestions}
                    onCheckedChange={setShuffleQuestions}
                  />
                  <input
                    type="checkbox"
                    name="shuffleQuestions"
                    checked={shuffleQuestions}
                    readOnly
                    className="sr-only"
                  />
                </label>

                <label
                  htmlFor="shuffleOptionsSwitch"
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Shuffle className="size-4 rotate-90 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">Shuffle Options</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Randomize choices (A, B, C, D) inside MCQs</p>
                    </div>
                  </div>
                  <Switch
                    id="shuffleOptionsSwitch"
                    checked={shuffleOptions}
                    onCheckedChange={setShuffleOptions}
                  />
                  <input
                    type="checkbox"
                    name="shuffleOptions"
                    checked={shuffleOptions}
                    readOnly
                    className="sr-only"
                  />
                </label>

                <label
                  htmlFor="webcamMonitoringSwitch"
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Camera className="size-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">Webcam Consent</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Require camera permission to start</p>
                    </div>
                  </div>
                  <Switch
                    id="webcamMonitoringSwitch"
                    checked={webcamMonitoringRequired}
                    onCheckedChange={setWebcamMonitoringRequired}
                  />
                  <input
                    type="checkbox"
                    name="webcamMonitoringRequired"
                    checked={webcamMonitoringRequired}
                    readOnly
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Review Threshold */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <div>
                  <Label htmlFor="violationReviewThreshold" className="text-sm font-semibold text-foreground">
                    Review Threshold Score
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cumulative anomaly score that flags attempt for review.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="violationReviewThreshold"
                    name="violationReviewThreshold"
                    type="number"
                    min={1}
                    max={100}
                    value={violationThreshold}
                    onChange={(e) => setViolationThreshold(Number(e.target.value))}
                    className="w-20 h-10 text-center font-bold rounded-xl"
                    required
                  />
                  <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
                    {violationThreshold <= 3 ? "Strict" : violationThreshold <= 7 ? "Balanced" : "Lenient"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sticky Summary Sidebar (4 Columns on lg/xl) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4 min-w-0">
          <Card className="rounded-2xl border border-border/70 bg-card py-0 gap-0 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Overview
                </span>
                <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
                  Draft
                </Badge>
              </div>
              <h3 className="text-base font-bold text-foreground mt-1 truncate">
                {title.trim() ? title : "Untitled Exam"}
              </h3>
            </div>

            <CardContent className="p-5 space-y-5">
              {/* Clean Specs List (No cut-offs on any resolution!) */}
              <div className="divide-y divide-border/50 text-sm">
                <div className="flex items-center justify-between py-2.5 first:pt-0">
                  <span className="text-muted-foreground font-medium">Duration</span>
                  <span className="font-bold text-foreground">{durationMinutes} mins</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-muted-foreground font-medium">Max Attempts</span>
                  <span className="font-bold text-foreground">{maxAttempts} {maxAttempts === 1 ? "attempt" : "attempts"}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-muted-foreground font-medium">Passing Marks</span>
                  <span className="font-bold text-foreground">{passingMarks ? passingMarks : "None"}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 last:pb-0">
                  <span className="text-muted-foreground font-medium">Proctoring</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {activeProctoringCount} of 3 active
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 sm:h-12 rounded-xl text-base font-bold shadow-xs transition-transform active:scale-[0.99]"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>{submitLabel}</span>
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground h-9 rounded-xl"
                >
                  <Link href={cancelHref}>Discard and return</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
