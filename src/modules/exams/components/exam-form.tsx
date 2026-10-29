"use client"

import * as React from "react"
import { useActionState, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Clock,
  CalendarClock,
  ShieldCheck,
  Shuffle,
  Camera,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  Trophy,
  Sliders,
  HelpCircle,
  Eye,
  FileCheck,
  Layers,
  Calendar,
  Lock,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 180] as const

export function ExamForm({
  action,
  initialValues,
  submitLabel = "Save Exam",
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

  // Live state tracking for immediate summary feedback
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [description, setDescription] = useState(initialValues?.description ?? "")
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

  // Security score calculation
  const securityFeaturesActive = [
    shuffleQuestions,
    shuffleOptions,
    webcamMonitoringRequired,
  ].filter(Boolean).length

  // Sensitivity label helper
  const getSensitivityInfo = (score: number) => {
    if (score <= 3) {
      return {
        label: "Strict",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        desc: "High sensitivity. Flags attempts for teacher review on minor tab switches or cursor exits.",
      }
    }
    if (score <= 7) {
      return {
        label: "Balanced (Recommended)",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        desc: "Optimal sensitivity. Filters accidental clicks while accurately detecting persistent anomalies.",
      }
    }
    return {
      label: "Lenient",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      desc: "High tolerance. Only flags when prolonged multi-minute disruptions or exits occur.",
    }
  }

  const sensitivity = getSensitivityInfo(violationThreshold)

  return (
    <form id="exam-form" action={formAction} className="w-full space-y-8">
      {state && "error" in state && (
        <Alert variant="destructive" className="rounded-2xl shadow-sm border-destructive/40 p-5">
          <AlertTriangle className="size-5" />
          <AlertTitle className="text-base font-bold">Unable to save assessment</AlertTitle>
          <AlertDescription className="text-sm mt-1">{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Top Header Quick Action Bar (Full Width) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 shadow-2xs">
            <Layers className="size-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Step 1: Exam Configuration
              </span>
              <Badge variant="secondary" className="font-semibold text-xs px-2.5 py-0.5">
                Draft Mode
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Set timing, questions randomization, and proctoring parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 sm:h-12 rounded-xl px-5 text-sm sm:text-base font-semibold"
          >
            <Link href={cancelHref}>Discard</Link>
          </Button>

          <Button
            type="submit"
            size="lg"
            className="h-11 sm:h-12 rounded-xl px-6 sm:px-7 text-sm sm:text-base font-bold shadow-sm transition-transform active:scale-[0.98]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                <span>Saving Assessment...</span>
              </>
            ) : (
              <>
                <span>{submitLabel}</span>
                <ArrowRight className="ml-2 size-4.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Full-Width Studio Layout: 8 Cols Form Canvas + 4 Cols Live Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full">
        {/* Left Column: Form Canvas (8 Columns on XL) */}
        <div className="space-y-8 xl:col-span-8">
          {/* Card 1: General Details */}
          <Card className="rounded-3xl border-border/80 bg-card shadow-xs transition-all hover:shadow-sm overflow-hidden">
            <CardHeader className="p-6 sm:p-7 border-b border-border/60 bg-muted/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs">
                    <BookOpen className="size-5.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                        General Information
                      </CardTitle>
                      <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/30 uppercase tracking-wider">
                        Required
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground mt-0.5">
                      The core identity, title, and instructions displayed to all candidates
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-7 space-y-6">
              {/* Exam Title */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-base sm:text-lg font-bold text-foreground">
                    Assessment Title <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs font-medium text-muted-foreground">
                    {title.length} / 200 characters
                  </span>
                </div>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Higher Secondary Mathematics Final Term Assessment 2026"
                  maxLength={200}
                  className="h-13 sm:h-14 text-base sm:text-lg font-medium rounded-2xl px-4.5"
                  required
                />
              </div>

              {/* Description / Syllabus */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-base sm:text-lg font-bold text-foreground">
                    Description & Candidate Guidelines
                  </Label>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    Optional
                  </span>
                </div>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide syllabus topics covered, allowed instruments (e.g. standard scientific calculator), scoring rubrics, or special instructions..."
                  className="rounded-2xl text-base p-4 resize-y min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Timing, Attempts & Passing Criteria */}
          <Card className="rounded-3xl border-border/80 bg-card shadow-xs transition-all hover:shadow-sm overflow-hidden">
            <CardHeader className="p-6 sm:p-7 border-b border-border/60 bg-muted/15">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-2xs">
                  <Clock className="size-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                      Duration, Attempts & Scoring
                    </CardTitle>
                    <Badge variant="outline" className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 border-blue-500/30 uppercase tracking-wider">
                      Assessment Rules
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground mt-0.5">
                    Configure session time limit, allowed test retakes, and pass marks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-7 space-y-7">
              {/* Duration section with Large Quick Presets */}
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Label htmlFor="durationMinutes" className="text-base sm:text-lg font-bold text-foreground">
                    Time Limit (Minutes) <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>Quick presets:</span>
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {DURATION_PRESETS.map((mins) => (
                    <Button
                      key={mins}
                      type="button"
                      variant={durationMinutes === mins ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDurationMinutes(mins)}
                      className={cn(
                        "rounded-xl px-3.5 py-1.5 font-semibold text-xs sm:text-sm transition-all",
                        durationMinutes === mins
                          ? "shadow-xs font-bold"
                          : "hover:bg-muted/80 text-muted-foreground"
                      )}
                    >
                      {mins} mins
                    </Button>
                  ))}
                </div>

                <div className="relative">
                  <Input
                    id="durationMinutes"
                    name="durationMinutes"
                    type="number"
                    min={1}
                    max={600}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="h-13 sm:h-14 text-lg font-bold rounded-2xl pr-16"
                    required
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-sm font-bold text-muted-foreground">
                    minutes
                  </div>
                </div>
              </div>

              {/* Side-by-side: Max Attempts and Passing Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="maxAttempts" className="text-base sm:text-lg font-bold text-foreground">
                    Maximum Attempts <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="maxAttempts"
                    name="maxAttempts"
                    type="number"
                    min={1}
                    max={10}
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="h-13 sm:h-14 text-lg font-bold rounded-2xl"
                    required
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {maxAttempts === 1
                      ? "🔒 Single session: 1 attempt allowed (Standard exam)"
                      : `🔄 Retakes permitted: Up to ${maxAttempts} attempts allowed`}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passingMarks" className="text-base sm:text-lg font-bold text-foreground">
                      Passing Marks
                    </Label>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      Optional
                    </span>
                  </div>
                  <Input
                    id="passingMarks"
                    name="passingMarks"
                    type="number"
                    min={0}
                    step="any"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
                    placeholder="e.g. 40"
                    className="h-13 sm:h-14 text-lg font-bold rounded-2xl"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Minimum score required for a candidate to achieve a passing grade
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Schedule & Availability Window */}
          <Card className="rounded-3xl border-border/80 bg-card shadow-xs transition-all hover:shadow-sm overflow-hidden">
            <CardHeader className="p-6 sm:p-7 border-b border-border/60 bg-muted/15">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-2xs">
                  <CalendarClock className="size-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                      Schedule & Availability Window
                    </CardTitle>
                    <Badge variant="outline" className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 border-purple-500/30 uppercase tracking-wider">
                      Timeline
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground mt-0.5">
                    Define the specific dates and hours when students are permitted to take this test
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-7 space-y-6">
              <div className="rounded-2xl bg-purple-500/5 p-4 text-sm text-muted-foreground flex items-start gap-3 border border-purple-500/20">
                <Info className="size-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Flexible Anytime Access:</strong> If both start and end dates are left blank,
                  the exam will remain accessible to registered students 24/7 as soon as you publish it.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="startTime" className="text-base sm:text-lg font-bold text-foreground">
                    Opens At <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                  </Label>
                  <DateTimePicker
                    id="startTime"
                    name="startTime"
                    defaultValue={initialValues?.startTime ? new Date(initialValues.startTime) : undefined}
                    placeholder="Pick opening date & time"
                  />
                  <p className="text-xs text-muted-foreground">
                    Candidates cannot access questions before this time
                  </p>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="endTime" className="text-base sm:text-lg font-bold text-foreground">
                    Closes At <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                  </Label>
                  <DateTimePicker
                    id="endTime"
                    name="endTime"
                    defaultValue={initialValues?.endTime ? new Date(initialValues.endTime) : undefined}
                    placeholder="Pick closing date & time"
                  />
                  <p className="text-xs text-muted-foreground">
                    Submissions are locked once deadline passes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Anti-Cheat & Security Controls (Integrity Engine) */}
          <Card className="rounded-3xl border-border/80 bg-card shadow-xs transition-all hover:shadow-sm overflow-hidden">
            <CardHeader className="p-6 sm:p-7 border-b border-border/60 bg-muted/15">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                  <ShieldCheck className="size-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                      Anti-Cheat & Integrity Engine
                    </CardTitle>
                    <Badge variant="outline" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 uppercase tracking-wider">
                      Proctoring
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground mt-0.5">
                    Prevent exam cheating with automated shuffling, camera consent, and anomaly flags
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-7 space-y-6">
              {/* 3 Horizontal Full-Width Toggle Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Shuffle Questions */}
                <label
                  htmlFor="shuffleQuestionsSwitch"
                  className={cn(
                    "flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer space-y-4",
                    shuffleQuestions
                      ? "border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/20"
                      : "border-border/70 bg-card hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      shuffleQuestions ? "bg-primary text-primary-foreground shadow-2xs" : "bg-muted text-muted-foreground"
                    )}>
                      <Shuffle className="size-5" />
                    </div>
                    <Switch
                      id="shuffleQuestionsSwitch"
                      checked={shuffleQuestions}
                      onCheckedChange={setShuffleQuestions}
                    />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">
                      Randomize Questions
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Scramble the question order per candidate so adjacent screens never match.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="shuffleQuestions"
                    checked={shuffleQuestions}
                    readOnly
                    className="sr-only"
                  />
                </label>

                {/* 2. Shuffle Options */}
                <label
                  htmlFor="shuffleOptionsSwitch"
                  className={cn(
                    "flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer space-y-4",
                    shuffleOptions
                      ? "border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/20"
                      : "border-border/70 bg-card hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      shuffleOptions ? "bg-primary text-primary-foreground shadow-2xs" : "bg-muted text-muted-foreground"
                    )}>
                      <Shuffle className="size-5 rotate-90" />
                    </div>
                    <Switch
                      id="shuffleOptionsSwitch"
                      checked={shuffleOptions}
                      onCheckedChange={setShuffleOptions}
                    />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">
                      Randomize Answers
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Shuffle options (A, B, C, D) within every MCQ for enhanced integrity.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="shuffleOptions"
                    checked={shuffleOptions}
                    readOnly
                    className="sr-only"
                  />
                </label>

                {/* 3. Webcam Monitoring */}
                <label
                  htmlFor="webcamMonitoringSwitch"
                  className={cn(
                    "flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer space-y-4",
                    webcamMonitoringRequired
                      ? "border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/20"
                      : "border-border/70 bg-card hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      webcamMonitoringRequired ? "bg-primary text-primary-foreground shadow-2xs" : "bg-muted text-muted-foreground"
                    )}>
                      <Camera className="size-5" />
                    </div>
                    <Switch
                      id="webcamMonitoringSwitch"
                      checked={webcamMonitoringRequired}
                      onCheckedChange={setWebcamMonitoringRequired}
                    />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">
                      Webcam Proctoring
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Require students to enable camera before taking the test to deter proxy testing.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="webcamMonitoringRequired"
                    checked={webcamMonitoringRequired}
                    readOnly
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Violation Review Threshold */}
              <div className="pt-2 p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Label htmlFor="violationReviewThreshold" className="text-base sm:text-lg font-bold text-foreground">
                      Violation Review Sensitivity Threshold
                    </Label>
                    <Badge variant="outline" className={cn("text-xs font-bold px-2.5 py-0.5", sensitivity.badge)}>
                      {sensitivity.label}
                    </Badge>
                  </div>
                  <span className="text-sm font-extrabold text-foreground bg-background px-3 py-1 rounded-lg border">
                    Score: {violationThreshold}
                  </span>
                </div>

                <Input
                  id="violationReviewThreshold"
                  name="violationReviewThreshold"
                  type="number"
                  min={1}
                  max={100}
                  value={violationThreshold}
                  onChange={(e) => setViolationThreshold(Number(e.target.value))}
                  className="h-13 sm:h-14 text-lg font-bold rounded-2xl bg-background"
                  required
                />

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {sensitivity.desc}{" "}
                  <strong className="text-foreground">Important:</strong> This only flags an attempt for teacher review in the results dashboard; students are never automatically disqualified without your manual verification.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Sticky Control Studio (4 Columns on XL) */}
        <div className="space-y-6 xl:col-span-4 xl:sticky xl:top-24">
          {/* Live Preview Card */}
          <Card className="rounded-3xl border-border/80 bg-card/95 backdrop-blur-md shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 py-5 border-b border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Eye className="size-3.5" />
                  Live Candidate Preview
                </span>
                <Badge variant="secondary" className="font-bold text-xs px-2.5 py-0.5">
                  Draft
                </Badge>
              </div>
              <h3 className="font-heading text-xl font-extrabold text-foreground mt-2 line-clamp-2">
                {title.trim() ? title : "Untitled Assessment"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description.trim() ? description : "No instructions specified yet."}
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Specs Metric Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Clock className="size-4 text-blue-500" />
                    <span>Duration</span>
                  </div>
                  <p className="mt-1 text-lg font-extrabold text-foreground">
                    {durationMinutes} <span className="text-xs font-normal text-muted-foreground">mins</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Trophy className="size-4 text-amber-500" />
                    <span>Max Attempts</span>
                  </div>
                  <p className="mt-1 text-lg font-extrabold text-foreground">
                    {maxAttempts} <span className="text-xs font-normal text-muted-foreground">{maxAttempts === 1 ? "take" : "takes"}</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>Passing Score</span>
                  </div>
                  <p className="mt-1 text-lg font-extrabold text-foreground">
                    {passingMarks ? passingMarks : <span className="text-xs font-normal text-muted-foreground">No minimum</span>}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>Proctoring</span>
                  </div>
                  <p className="mt-1 text-lg font-extrabold text-foreground">
                    {securityFeaturesActive} <span className="text-xs font-normal text-muted-foreground">of 3 active</span>
                  </p>
                </div>
              </div>

              {/* Assessment Workflow Progress */}
              <div className="space-y-3 pt-1 border-t border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Publishing Roadmap
                </p>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
                      1
                    </div>
                    <span>Configure exam settings (Current)</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground font-medium">
                    <div className="size-6 rounded-full bg-muted border text-muted-foreground flex items-center justify-center text-xs">
                      2
                    </div>
                    <span>Select questions from question bank</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground font-medium">
                    <div className="size-6 rounded-full bg-muted border text-muted-foreground flex items-center justify-center text-xs">
                      3
                    </div>
                    <span>Preview & Publish to students</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 rounded-2xl text-base font-extrabold shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      <span>Saving Assessment...</span>
                    </>
                  ) : (
                    <>
                      <span>{submitLabel}</span>
                      <ArrowRight className="ml-2 size-5" />
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="w-full h-12 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-xl"
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
