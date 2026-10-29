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
  ArrowLeft,
  Sparkles,
  Trophy,
  Shield,
  Calendar,
  Layers,
  Check,
  Trash2,
  Plus,
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
import { TitleTemplateModal } from "@/modules/exams/components/title-template-modal"
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
  const [titleTouched, setTitleTouched] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

  function handleSelectPresetTitle(presetTitle: string) {
    setTitle(presetTitle)
    setTitleTouched(true)
  }

  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialValues?.durationMinutes ?? 60
  )
  const [durationTouched, setDurationTouched] = useState(false)

  const [maxAttempts, setMaxAttempts] = useState<number>(
    initialValues?.maxAttempts ?? 1
  )
  const [attemptsTouched, setAttemptsTouched] = useState(false)

  const [passingMarks, setPassingMarks] = useState<string>(
    initialValues?.passingMarks != null ? String(initialValues.passingMarks) : ""
  )
  const [passingMarksTouched, setPassingMarksTouched] = useState(false)

  const [startTime, setStartTime] = useState<Date | undefined>(
    initialValues?.startTime ? new Date(initialValues.startTime) : undefined
  )
  const [endTime, setEndTime] = useState<Date | undefined>(
    initialValues?.endTime ? new Date(initialValues.endTime) : undefined
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

  // Real-time Field Validation Rules
  const isTitleValid = title.trim().length >= 3 && title.trim().length <= 200
  const isDurationValid =
    !isNaN(durationMinutes) && durationMinutes >= 1 && durationMinutes <= 600
  const isAttemptsValid =
    !isNaN(maxAttempts) && maxAttempts >= 1 && maxAttempts <= 10
  const isPassingMarksValid =
    passingMarks.trim() === "" ||
    (!isNaN(Number(passingMarks)) && Number(passingMarks) >= 0)
  const isScheduleValid =
    !startTime || !endTime || startTime.getTime() < endTime.getTime()
  const isThresholdValid =
    !isNaN(violationThreshold) && violationThreshold >= 1 && violationThreshold <= 1000

  // Form is valid when all required criteria pass
  const isFormValid =
    isTitleValid &&
    isDurationValid &&
    isAttemptsValid &&
    isPassingMarksValid &&
    isScheduleValid &&
    isThresholdValid

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
                  <div className="flex items-center gap-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 hover:border-primary/50 transition-all cursor-pointer shadow-2xs active:scale-95"
                      title="Open Title Presets & Dropdown Generator"
                    >
                      <Plus className="size-3.5 shrink-0" />
                      <span>Title Presets</span>
                    </button>
                  </div>
                  <span
                    className={cn(
                      "text-xs transition-colors",
                      titleTouched && !isTitleValid
                        ? "text-destructive font-semibold"
                        : "text-muted-foreground"
                    )}
                  >
                    {title.length}/200
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setTitleTouched(true)}
                    placeholder="e.g. Mathematics Mid-Term 2026"
                    maxLength={200}
                    className={cn(
                      "h-11 sm:h-12 text-base font-medium rounded-xl pr-11 transition-colors",
                      titleTouched && !isTitleValid && "border-destructive focus-visible:ring-destructive/30"
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    title="Open Title Presets & Dropdown Generator"
                  >
                    <Plus className="size-4.5" />
                  </button>
                </div>
                {titleTouched && !isTitleValid && (
                  <p className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1 animate-in fade-in-50 duration-200">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>
                      {title.trim().length === 0
                        ? "Exam title is required"
                        : "Title must be at least 3 characters"}
                    </span>
                  </p>
                )}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="size-4 text-primary shrink-0" />
                  <span>Timing & Limits</span>
                </CardTitle>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {DURATION_PRESETS.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-lg font-medium transition-colors border shrink-0 cursor-pointer active:scale-95",
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
                      value={durationMinutes || ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value)
                        setDurationMinutes(val)
                      }}
                      onBlur={() => setDurationTouched(true)}
                      className={cn(
                        "h-11 sm:h-12 text-base font-semibold rounded-xl pr-12 transition-colors",
                        durationTouched && !isDurationValid && "border-destructive focus-visible:ring-destructive/30"
                      )}
                      required
                    />
                    <span className="absolute inset-y-0 right-3.5 flex items-center text-xs font-semibold text-muted-foreground pointer-events-none">
                      min
                    </span>
                  </div>
                  {durationTouched && !isDurationValid && (
                    <p className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1 animate-in fade-in-50 duration-200">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>Duration must be 1-600 mins</span>
                    </p>
                  )}
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
                    value={maxAttempts || ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value)
                      setMaxAttempts(val)
                    }}
                    onBlur={() => setAttemptsTouched(true)}
                    className={cn(
                      "h-11 sm:h-12 text-base font-semibold rounded-xl transition-colors",
                      attemptsTouched && !isAttemptsValid && "border-destructive focus-visible:ring-destructive/30"
                    )}
                    required
                  />
                  {attemptsTouched && !isAttemptsValid && (
                    <p className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1 animate-in fade-in-50 duration-200">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>Attempts must be 1-10</span>
                    </p>
                  )}
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
                    onBlur={() => setPassingMarksTouched(true)}
                    placeholder="e.g. 40"
                    className={cn(
                      "h-11 sm:h-12 text-base font-semibold rounded-xl transition-colors",
                      passingMarksTouched && !isPassingMarksValid && "border-destructive focus-visible:ring-destructive/30"
                    )}
                  />
                  {passingMarksTouched && !isPassingMarksValid && (
                    <p className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1 animate-in fade-in-50 duration-200">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>Must be 0 or higher</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Schedule */}
          <Card className="rounded-2xl border border-border/70 bg-card py-0 gap-0 shadow-xs overflow-hidden">
            <CardHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-border/50 bg-muted/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="size-4 text-purple-500 shrink-0" />
                  <span>Schedule Window</span>
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
                    value={startTime}
                    onChange={setStartTime}
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
                    value={endTime}
                    onChange={setEndTime}
                    minDate={startTime}
                    placeholder="Closing date & time"
                  />
                </div>
              </div>
              {!isScheduleValid && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-2.5 animate-in fade-in-50 duration-200">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>Closing date & time must be strictly after the opening date & time.</span>
                </p>
              )}
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
                  <span className={cn("font-bold", isDurationValid ? "text-foreground" : "text-destructive")}>
                    {durationMinutes > 0 ? `${durationMinutes} mins` : "Required"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-muted-foreground font-medium">Max Attempts</span>
                  <span className={cn("font-bold", isAttemptsValid ? "text-foreground" : "text-destructive")}>
                    {maxAttempts > 0
                      ? `${maxAttempts} ${maxAttempts === 1 ? "attempt" : "attempts"}`
                      : "Required"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-muted-foreground font-medium">Passing Marks</span>
                  <span className={cn("font-bold", isPassingMarksValid ? "text-foreground" : "text-destructive")}>
                    {passingMarks ? passingMarks : "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 last:pb-0">
                  <span className="text-muted-foreground font-medium">Proctoring</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {activeProctoringCount} of 3 active
                  </span>
                </div>
              </div>

              {/* Form Readiness Indicator */}
              {!isFormValid ? (
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
                  <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                  <span>
                    {!isTitleValid
                      ? "Enter exam title (min 3 chars)"
                      : !isDurationValid
                      ? "Enter valid duration (1-600 mins)"
                      : !isAttemptsValid
                      ? "Enter valid attempts (1-10)"
                      : !isPassingMarksValid
                      ? "Passing marks must be ≥ 0"
                      : !isScheduleValid
                      ? "Closing time must be after opening time"
                      : "Fill required fields to activate"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold animate-in fade-in-50 duration-200">
                  <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>All fields valid — ready to submit!</span>
                </div>
              )}

              {/* Action Buttons: Primary on left, Discard Exam on the right */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isFormValid || isPending}
                  className={cn(
                    "w-full sm:flex-1 h-12 rounded-xl text-sm sm:text-base font-bold shadow-xs transition-all",
                    isFormValid && !isPending
                      ? "cursor-pointer hover:shadow-md active:scale-[0.99] text-primary-foreground"
                      : "opacity-45 cursor-not-allowed pointer-events-auto"
                  )}
                >
                  {isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>{submitLabel}</span>
                      <ArrowRight className="ml-1.5 size-4" />
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="destructive"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-5 rounded-xl text-sm font-semibold border border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all cursor-pointer active:scale-[0.98] shadow-2xs shrink-0 whitespace-nowrap"
                >
                  <Link href={cancelHref} className="flex items-center justify-center gap-2 whitespace-nowrap">
                    <Trash2 className="size-4 shrink-0" />
                    <span>Discard Exam</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Title Presets & Dropdown Generator Modal */}
      <TitleTemplateModal
        open={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        onSelectTitle={handleSelectPresetTitle}
      />
    </form>
  )
}
