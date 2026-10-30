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
  BookOpen,
  Trophy,
  ShieldCheck,
  Calendar,
  Trash2,
  Plus,
  Globe,
  Lock,
  Users,
  RefreshCw,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  HelpCircle,
  Eye,
  KeyRound,
  ShieldAlert,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  isPublic?: boolean
  allowGuestAccess?: boolean
  accessCode?: string | null
}

const DURATION_PRESETS = [30, 45, 60, 90, 120] as const

/**
 * Reusable Info Tooltip Helper
 */
function InfoTip({ text, side = "top" }: { text: string; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          role="button"
          aria-label="More information"
          className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors cursor-help outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <HelpCircle className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-xs font-normal leading-relaxed p-2.5 shadow-md">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}

export function ExamForm({
  action,
  initialValues,
  submitLabel = "Create Assessment & Add Questions",
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

  // Advanced Configuration Modals State
  const [isProctoringModalOpen, setIsProctoringModalOpen] = useState(false)
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)

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

  const [isPublic, setIsPublic] = useState<boolean>(
    initialValues?.isPublic ?? true
  )
  const [allowGuestAccess, setAllowGuestAccess] = useState<boolean>(
    initialValues?.allowGuestAccess ?? true
  )
  const [accessCode, setAccessCode] = useState<string>(
    initialValues?.accessCode ?? ""
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
    <TooltipProvider delayDuration={150}>
      <form action={formAction} className="w-full">
        {state && "error" in state && (
          <Alert variant="destructive" className="mb-6 rounded-2xl border-destructive/30 shadow-xs">
            <AlertTriangle className="size-5" />
            <AlertTitle className="text-base font-bold">Error saving assessment</AlertTitle>
            <AlertDescription className="text-sm mt-1">{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Main 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Left Form Canvas (8 Columns on lg/xl) */}
          <div className="space-y-8 lg:col-span-8 min-w-0">
            {/* ── CARD 1: EXAM DETAILS ── */}
            <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
              <div className="px-6 py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                        Assessment Details
                      </h2>
                      <InfoTip text="General information, subject naming conventions, and candidate instructions that will appear on test entry." />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      General title, subject presets, and candidate instructions
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 border-border/70 shrink-0">
                  Required
                </Badge>
              </div>

              <div className="p-6 sm:p-7 space-y-6">
                {/* Title Field with Presets Tool */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Label htmlFor="title" className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5">
                        <span>Assessment Title</span>
                        <span className="text-destructive">*</span>
                        <InfoTip text="The official title students see on their dashboard and certificate. Minimum 3 characters." />
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="h-7 px-2.5 rounded-lg border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 hover:border-primary/50 transition-all gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                        title="Open Title Presets & Auto Generator"
                      >
                        <BookOpen className="size-3.5 shrink-0" />
                        <span>Title Presets</span>
                      </Button>
                    </div>
                    <span
                      className={cn(
                        "text-xs sm:text-sm transition-colors font-medium",
                        titleTouched && !isTitleValid
                          ? "text-destructive font-bold"
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
                      placeholder="e.g. Higher Mathematics Mid-Term Examination 2026"
                      maxLength={200}
                      className={cn(
                        "h-12 sm:h-13 text-base sm:text-lg font-medium rounded-xl pr-12 transition-all",
                        titleTouched && !isTitleValid && "border-destructive focus-visible:ring-destructive/30"
                      )}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title="Choose from presets"
                    >
                      <Plus className="size-5" />
                    </Button>
                  </div>

                  {titleTouched && !isTitleValid && (
                    <p className="text-xs sm:text-sm text-destructive font-semibold flex items-center gap-1.5 mt-1.5 animate-in fade-in-50 duration-200">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>
                        {title.trim().length === 0
                          ? "Exam title is required (minimum 3 characters)."
                          : "Title must be at least 3 characters."}
                      </span>
                    </p>
                  )}
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5">
                      <span>Description & Instructions</span>
                      <InfoTip text="Guidelines, allowed materials, or syllabus topics shown to students before they click Start Exam." />
                    </Label>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                      Optional
                    </span>
                  </div>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={initialValues?.description}
                    placeholder="Provide syllabus chapters, negative marking notices, or candidate guidelines..."
                    className="rounded-xl text-sm sm:text-base min-h-[105px] resize-y p-4 leading-relaxed"
                  />
                </div>
              </div>
            </Card>

            {/* ── CARD 2: TIMING & LIMITS ── */}
            <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
              <div className="px-6 py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                        Timing & Scoring Limits
                      </h2>
                      <InfoTip text="Enforces total test countdown timer, retry constraints, and grading threshold." />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Test duration, maximum attempts, and passing threshold
                    </p>
                  </div>
                </div>

                {/* Duration Presets as Shadcn Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 sm:pt-0">
                  <span className="text-xs font-semibold text-muted-foreground mr-1 hidden md:inline">Presets:</span>
                  {DURATION_PRESETS.map((mins) => (
                    <Button
                      key={mins}
                      type="button"
                      variant={durationMinutes === mins ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setDurationMinutes(mins)
                        setDurationTouched(true)
                      }}
                      className={cn(
                        "h-8 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer active:scale-95",
                        durationMinutes === mins
                          ? "shadow-sm font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {mins}m
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes" className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5">
                      <span>Duration (Minutes)</span>
                      <span className="text-destructive">*</span>
                      <InfoTip text="The countdown timer starts as soon as the student launches the test. Exam auto-submits when time reaches 0." />
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
                          "h-12 sm:h-13 text-base sm:text-lg font-bold rounded-xl pr-14 transition-all",
                          durationTouched && !isDurationValid && "border-destructive focus-visible:ring-destructive/30"
                        )}
                        required
                      />
                      <span className="absolute inset-y-0 right-4 flex items-center text-xs sm:text-sm font-semibold text-muted-foreground pointer-events-none">
                        mins
                      </span>
                    </div>
                    {durationTouched && !isDurationValid && (
                      <p className="text-xs sm:text-sm text-destructive font-semibold flex items-center gap-1.5 mt-1.5 animate-in fade-in-50 duration-200">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Duration must be between 1 and 600 minutes.</span>
                      </p>
                    )}
                  </div>

                  {/* Max Attempts */}
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts" className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5">
                      <span>Max Attempts</span>
                      <span className="text-destructive">*</span>
                      <InfoTip text="Maximum number of times a candidate can take this exam. 1 attempt is recommended for formal assessments." />
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
                        "h-12 sm:h-13 text-base sm:text-lg font-bold rounded-xl transition-all",
                        attemptsTouched && !isAttemptsValid && "border-destructive focus-visible:ring-destructive/30"
                      )}
                      required
                    />
                    {attemptsTouched && !isAttemptsValid && (
                      <p className="text-xs sm:text-sm text-destructive font-semibold flex items-center gap-1.5 mt-1.5 animate-in fade-in-50 duration-200">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Attempts must be between 1 and 10.</span>
                      </p>
                    )}
                  </div>

                  {/* Passing Marks */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="passingMarks" className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5">
                        <span>Passing Marks</span>
                        <InfoTip text="Score required to achieve 'PASSED' status. If left blank, total score is displayed without pass/fail distinction." />
                      </Label>
                      <span className="text-xs text-muted-foreground font-medium">Optional</span>
                    </div>
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
                        "h-12 sm:h-13 text-base sm:text-lg font-bold rounded-xl transition-all",
                        passingMarksTouched && !isPassingMarksValid && "border-destructive focus-visible:ring-destructive/30"
                      )}
                    />
                    {passingMarksTouched && !isPassingMarksValid && (
                      <p className="text-xs sm:text-sm text-destructive font-semibold flex items-center gap-1.5 mt-1.5 animate-in fade-in-50 duration-200">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Passing marks must be 0 or greater.</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* ── CARD 3: SCHEDULE WINDOW ── */}
            <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
              <div className="px-6 py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                        Schedule Window
                      </h2>
                      <InfoTip text="Define precise opening and closing times. Candidates cannot take the assessment outside of this window." />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Restrict exam accessibility within a specified date & time range
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1 shrink-0 self-start sm:self-auto">
                  Leave empty for 24/7 access
                </Badge>
              </div>

              <div className="p-6 sm:p-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5">
                      <span>Opens At (Start Time)</span>
                      <InfoTip text="Date and time when students can begin taking this assessment." />
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
                    <Label htmlFor="endTime" className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5">
                      <span>Closes At (End Time)</span>
                      <InfoTip text="Deadline after which no new student attempts can be started." />
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
                  <p className="text-xs sm:text-sm text-destructive font-semibold flex items-center gap-1.5 mt-2 animate-in fade-in-50 duration-200">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Closing date & time must be strictly later than opening date & time.</span>
                  </p>
                )}
              </div>
            </Card>

            {/* ── CARD 4: PROCTORING & INTEGRITY (Google UI Clean Design: Minimal text, rich modal) ── */}
            <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
              <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-emerald-500/20">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                        Proctoring & Anti-Cheating
                      </h2>
                      <InfoTip text="Automated integrity controls. Configure question randomization, camera verification, and anomaly sensitivity." />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activeProctoringCount} of 3 active • {violationThreshold <= 3 ? "Strict" : violationThreshold <= 7 ? "Balanced" : "Lenient"} sensitivity
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsProctoringModalOpen(true)}
                    className="h-8.5 px-3.5 rounded-full border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 text-xs font-semibold gap-1.5 shadow-2xs active:scale-95 cursor-pointer transition-all"
                  >
                    <SlidersHorizontal className="size-3.5" />
                    <span>Configure Rules</span>
                  </Button>
                </div>
              </div>

              {/* Clean Google-Style Compact Settings List */}
              <div className="p-4 sm:p-5">
                <div className="divide-y divide-border/40 rounded-xl border border-border/50 bg-muted/10 overflow-hidden">
                  {/* 1. Shuffle Questions */}
                  <div
                    onClick={() => setShuffleQuestions(!shuffleQuestions)}
                    className="flex items-center justify-between py-3.5 px-4 hover:bg-muted/30 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        shuffleQuestions ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                      )}>
                        <Shuffle className="size-4.5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Shuffle Questions</span>
                        <InfoTip text="Display exam questions in completely randomized order for each candidate." />
                      </div>
                    </div>
                    <Switch
                      id="shuffleQuestionsSwitch"
                      checked={shuffleQuestions}
                      onCheckedChange={setShuffleQuestions}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="checkbox"
                      name="shuffleQuestions"
                      checked={shuffleQuestions}
                      readOnly
                      className="sr-only"
                    />
                  </div>

                  {/* 2. Shuffle Options */}
                  <div
                    onClick={() => setShuffleOptions(!shuffleOptions)}
                    className="flex items-center justify-between py-3.5 px-4 hover:bg-muted/30 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        shuffleOptions ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" : "bg-muted text-muted-foreground"
                      )}>
                        <Shuffle className="size-4.5 rotate-90" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Shuffle Options</span>
                        <InfoTip text="Randomize multiple-choice option positions (A, B, C, D) within every question." />
                      </div>
                    </div>
                    <Switch
                      id="shuffleOptionsSwitch"
                      checked={shuffleOptions}
                      onCheckedChange={setShuffleOptions}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="checkbox"
                      name="shuffleOptions"
                      checked={shuffleOptions}
                      readOnly
                      className="sr-only"
                    />
                  </div>

                  {/* 3. Webcam Surveillance */}
                  <div
                    onClick={() => setWebcamMonitoringRequired(!webcamMonitoringRequired)}
                    className="flex items-center justify-between py-3.5 px-4 hover:bg-muted/30 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        webcamMonitoringRequired ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground"
                      )}>
                        <Camera className="size-4.5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Webcam Surveillance & Consent</span>
                        <InfoTip text="Require student camera permission and capture periodic audit snapshots during the test." />
                      </div>
                    </div>
                    <Switch
                      id="webcamMonitoringSwitch"
                      checked={webcamMonitoringRequired}
                      onCheckedChange={setWebcamMonitoringRequired}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="checkbox"
                      name="webcamMonitoringRequired"
                      checked={webcamMonitoringRequired}
                      readOnly
                      className="sr-only"
                    />
                  </div>

                  {/* 4. Anomaly Review Sensitivity */}
                  <div className="flex items-center justify-between py-3.5 px-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="size-4.5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Anomaly Review Threshold</span>
                        <InfoTip text="Cumulative anti-cheat score triggering teacher review (tab switches, face absences, fullscreen exits)." />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: "Strict (3)", val: 3 },
                        { label: "Balanced (5)", val: 5 },
                        { label: "Lenient (10)", val: 10 },
                      ].map(({ label, val }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setViolationThreshold(val)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                            violationThreshold === val
                              ? "bg-primary text-primary-foreground shadow-2xs font-bold ring-1 ring-primary/30"
                              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                      <input
                        type="hidden"
                        name="violationReviewThreshold"
                        value={violationThreshold}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ── CARD 5: CANDIDATE ACCESS & PIN (Google UI Clean Design: Minimal text, rich modal) ── */}
            <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
              <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-amber-500/20">
                    <Globe className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                        Candidate Access & Security
                      </h2>
                      <InfoTip text="Control how candidates join: friction-free open link or registered account, with optional secret PIN." />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {allowGuestAccess ? "Direct Link Enabled" : "Registered Students Only"} • {accessCode ? `PIN: ${accessCode}` : "Open Access"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAccessModalOpen(true)}
                    className="h-8.5 px-3.5 rounded-full border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 text-xs font-semibold gap-1.5 shadow-2xs active:scale-95 cursor-pointer transition-all"
                  >
                    <KeyRound className="size-3.5" />
                    <span>Access Settings</span>
                  </Button>
                </div>
              </div>

              {/* Clean Google-Style Compact Settings List */}
              <div className="p-4 sm:p-5">
                <div className="divide-y divide-border/40 rounded-xl border border-border/50 bg-muted/10 overflow-hidden">
                  {/* Direct Link Access */}
                  <div
                    onClick={() => setAllowGuestAccess(!allowGuestAccess)}
                    className="flex items-center justify-between py-3.5 px-4 hover:bg-muted/30 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        allowGuestAccess ? "bg-sky-500/15 text-sky-600 dark:text-sky-400" : "bg-muted text-muted-foreground"
                      )}>
                        <Users className="size-4.5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          Direct Link Participation (No Registration Required)
                        </span>
                        <InfoTip text="Students can begin test immediately via link by entering their Full Name & Email. Registered students can also log in seamlessly." />
                      </div>
                    </div>
                    <Switch
                      id="allowGuestAccessSwitch"
                      checked={allowGuestAccess}
                      onCheckedChange={setAllowGuestAccess}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="hidden"
                      name="allowGuestAccess"
                      value={allowGuestAccess ? "on" : "off"}
                    />
                  </div>

                  {/* Access PIN Code */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 px-4 hover:bg-muted/30 transition-colors gap-3">
                    <div className="flex items-center gap-3.5 shrink-0">
                      <div className={cn(
                        "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        accessCode ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"
                      )}>
                        <Lock className="size-4.5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          Access Passcode / Security PIN
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                        <InfoTip text="If set, candidates must input this passcode along with their credentials before the test commences." />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-48">
                        <Input
                          id="accessCode"
                          name="accessCode"
                          placeholder="e.g. 2026EXAM"
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          className="h-8.5 font-mono text-xs tracking-wider rounded-lg pr-12 bg-background"
                          maxLength={50}
                        />
                        {accessCode && (
                          <button
                            type="button"
                            onClick={() => setAccessCode("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
                          setAccessCode(randomCode)
                        }}
                        className="h-8.5 px-3 text-xs font-semibold shrink-0 cursor-pointer rounded-lg gap-1.5"
                        title="Generate random 6-digit PIN"
                      >
                        <RefreshCw className="size-3" />
                        <span>Generate PIN</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <input type="hidden" name="isPublic" value={isPublic ? "on" : "off"} />
              </div>
            </Card>
          </div>

          {/* ── RIGHT STICKY SIDEBAR (4 Columns on lg/xl) ── */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4 min-w-0">
            <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Assessment Overview
                  </span>
                  <Badge variant="secondary" className="font-bold text-xs px-2.5 py-0.5 rounded-full">
                    Draft
                  </Badge>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground mt-1.5 line-clamp-2">
                  {title.trim() ? title : "Untitled Assessment"}
                </h3>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Specification List */}
                <div className="divide-y divide-border/60 text-sm sm:text-base">
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Clock className="size-4 text-blue-500" />
                      <span>Duration</span>
                    </span>
                    <span className={cn("font-bold", isDurationValid ? "text-foreground" : "text-destructive")}>
                      {durationMinutes > 0 ? `${durationMinutes} mins` : "Required"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <RefreshCw className="size-4 text-amber-500" />
                      <span>Max Attempts</span>
                    </span>
                    <span className={cn("font-bold", isAttemptsValid ? "text-foreground" : "text-destructive")}>
                      {maxAttempts > 0
                        ? `${maxAttempts} ${maxAttempts === 1 ? "attempt" : "attempts"}`
                        : "Required"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Trophy className="size-4 text-yellow-500" />
                      <span>Passing Score</span>
                    </span>
                    <span className={cn("font-bold", isPassingMarksValid ? "text-foreground" : "text-destructive")}>
                      {passingMarks ? passingMarks : "None"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-500" />
                      <span>Proctoring</span>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {activeProctoringCount} of 3 active
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 last:pb-0">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Globe className="size-4 text-primary" />
                      <span>Candidate Access</span>
                    </span>
                    <span className="font-bold text-primary text-xs sm:text-sm">
                      {allowGuestAccess ? "Direct Link (Open)" : "Registered Only"}
                    </span>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Live Form Readiness Status Alert */}
                {!isFormValid ? (
                  <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-semibold">
                    <AlertTriangle className="size-4.5 shrink-0 text-amber-500 mt-0.5" />
                    <span>
                      {!isTitleValid
                        ? "Enter exam title (minimum 3 characters)"
                        : !isDurationValid
                        ? "Enter valid duration (1-600 mins)"
                        : !isAttemptsValid
                        ? "Enter valid attempts (1-10)"
                        : !isPassingMarksValid
                        ? "Passing marks must be ≥ 0"
                        : !isScheduleValid
                        ? "Closing time must be after opening time"
                        : "Please fill required fields to activate"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-bold animate-in fade-in-50 duration-200">
                    <CheckCircle2 className="size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>All fields valid — ready to save!</span>
                  </div>
                )}

                {/* Actions Section */}
                <div className="pt-2 flex flex-col gap-3 w-full">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!isFormValid || isPending}
                    className={cn(
                      "w-full h-13 rounded-xl text-base sm:text-lg font-bold shadow-md transition-all cursor-pointer",
                      isFormValid && !isPending
                        ? "hover:shadow-lg active:scale-[0.99] text-primary-foreground"
                        : "opacity-50 cursor-not-allowed pointer-events-auto"
                    )}
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
                    variant="outline"
                    size="lg"
                    className="w-full h-11 rounded-xl text-sm font-semibold border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all cursor-pointer active:scale-[0.99] shadow-2xs"
                  >
                    <Link href={cancelHref} className="flex items-center justify-center gap-2">
                      <Trash2 className="size-4 shrink-0" />
                      <span>Discard Assessment</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── MODAL 1: PROCTORING & ANTI-CHEAT GOVERNANCE MODAL ── */}
        <Dialog open={isProctoringModalOpen} onOpenChange={setIsProctoringModalOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-3xl border-border/80 shadow-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/20 shadow-xs">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    Proctoring & Anti-Cheat Governance
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Configure automated cheating deterrents, live camera monitoring, and anomaly review thresholds.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6 text-sm">
              {/* Section 1: Randomization Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Randomization & Anti-Collision
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-medium">Automatic per candidate</span>
                </div>

                <div className="space-y-3">
                  {/* Card 1: Shuffle Questions */}
                  <div
                    onClick={() => setShuffleQuestions(!shuffleQuestions)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer select-none",
                      shuffleQuestions
                        ? "border-emerald-500/40 bg-emerald-500/5 shadow-2xs"
                        : "border-border/60 bg-card hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className={cn(
                          "size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                          shuffleQuestions ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                        )}>
                          <Shuffle className="size-4.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground text-sm sm:text-base">Shuffle Question Sequence</p>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                              [Q1, Q2, Q3] ➔ [Q3, Q1, Q2]
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Generates a unique randomized question order for each candidate attempt to prevent looking at neighbors&apos; screens.
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={shuffleQuestions}
                        onCheckedChange={setShuffleQuestions}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Card 2: Shuffle Choices */}
                  <div
                    onClick={() => setShuffleOptions(!shuffleOptions)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer select-none",
                      shuffleOptions
                        ? "border-indigo-500/40 bg-indigo-500/5 shadow-2xs"
                        : "border-border/60 bg-card hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className={cn(
                          "size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                          shuffleOptions ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-muted text-muted-foreground"
                        )}>
                          <Shuffle className="size-4.5 rotate-90" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground text-sm sm:text-base">Shuffle MCQ Answer Choices</p>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                              [A, B, C, D] ➔ [C, A, D, B]
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Scrambles multiple-choice choices inside each question to prevent candidates from sharing answers like (1-A, 2-C).
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={shuffleOptions}
                        onCheckedChange={setShuffleOptions}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Webcam Surveillance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Video Surveillance & Verification
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 border-blue-500/30">
                    Live Camera Snapshots
                  </Badge>
                </div>

                <div
                  onClick={() => setWebcamMonitoringRequired(!webcamMonitoringRequired)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer select-none",
                    webcamMonitoringRequired
                      ? "border-blue-500/40 bg-blue-500/5 shadow-2xs"
                      : "border-border/60 bg-card hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={cn(
                        "size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        webcamMonitoringRequired ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground"
                      )}>
                        <Camera className="size-4.5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-foreground text-sm sm:text-base">Mandatory Webcam Consent</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Candidate must grant camera permission before opening questions. Periodic silent audit snapshots verify student identity and detect unpermitted persons.
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={webcamMonitoringRequired}
                      onCheckedChange={setWebcamMonitoringRequired}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Anomaly Sensitivity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Anomaly Review Threshold
                  </h4>
                  <Badge variant="secondary" className="font-bold text-xs">
                    Current: {violationThreshold} ({violationThreshold <= 3 ? "Strict" : violationThreshold <= 7 ? "Balanced" : "Lenient"})
                  </Badge>
                </div>

                <div className="p-4 rounded-2xl border border-border/70 bg-muted/20 space-y-4">
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: "Strict (3 pts)", desc: "High-stakes certification & finals", val: 3 },
                      { label: "Balanced (5 pts)", desc: "Standard class tests (Recommended)", val: 5 },
                      { label: "Lenient (10 pts)", desc: "Practice & open-book quizzes", val: 10 },
                    ].map(({ label, desc, val }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setViolationThreshold(val)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1",
                          violationThreshold === val
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 font-bold shadow-2xs"
                            : "border-border/60 bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="text-xs font-bold block">{label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight block">{desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl border border-border/50 bg-background/80 text-xs text-muted-foreground space-y-1.5">
                    <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">Violation Point Weights:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded-lg bg-muted/50 flex items-center justify-between">
                        <span>Tab Switch</span>
                        <strong className="text-destructive font-mono">+2 pts</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50 flex items-center justify-between">
                        <span>Window Unfocus</span>
                        <strong className="text-destructive font-mono">+3 pts</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50 flex items-center justify-between">
                        <span>No Face / Multi</span>
                        <strong className="text-destructive font-mono">+2 pts</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => setIsProctoringModalOpen(false)}
                  className="w-full h-11 text-sm font-bold rounded-xl cursor-pointer gap-2 shadow-xs"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Save & Apply Proctoring Rules</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── MODAL 2: CANDIDATE ACCESS & PARTICIPATION MODAL ── */}
        <Dialog open={isAccessModalOpen} onOpenChange={setIsAccessModalOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-3xl border-border/80 shadow-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 ring-1 ring-amber-500/20 shadow-xs">
                  <Globe className="size-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    Candidate Access & Security Governance
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Define student joining permissions, registration requirements, and secret passcodes.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6 text-sm">
              {/* Participation Mode */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Participation & Authentication Mode
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 border-sky-500/30">
                    Fast 1-Click Join
                  </Badge>
                </div>

                <div
                  onClick={() => setAllowGuestAccess(!allowGuestAccess)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer select-none",
                    allowGuestAccess
                      ? "border-sky-500/40 bg-sky-500/5 shadow-2xs"
                      : "border-border/60 bg-card hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={cn(
                        "size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        allowGuestAccess ? "bg-sky-500/20 text-sky-600 dark:text-sky-400" : "bg-muted text-muted-foreground"
                      )}>
                        <Users className="size-4.5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-foreground text-sm sm:text-base">
                          Direct Link (No Registration Required)
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Candidates simply click the exam URL, enter their Full Name & Email Address, and begin immediately. No password or prior account registration needed. (Registered students can also log in seamlessly).
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={allowGuestAccess}
                      onCheckedChange={setAllowGuestAccess}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Passcode Security */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Access Passcode / Security PIN
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
                      setAccessCode(randomCode)
                    }}
                    className="h-7 text-xs font-semibold text-primary hover:bg-primary/10 gap-1.5 cursor-pointer rounded-lg"
                  >
                    <RefreshCw className="size-3" />
                    <span>Generate Random PIN</span>
                  </Button>
                </div>

                <div className="p-4 rounded-2xl border border-border/60 bg-card space-y-3">
                  <div className="relative">
                    <Input
                      placeholder="e.g. 2026EXAM or leave empty for open access"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="h-11 font-mono text-base tracking-wider rounded-xl pr-16 bg-background"
                      maxLength={50}
                    />
                    {accessCode && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAccessCode("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {accessCode ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Lock className="size-3.5" />
                        PIN Active: Candidates must input &ldquo;{accessCode}&rdquo; before they can access the exam questions.
                      </span>
                    ) : (
                      "Open access: Anyone with the direct exam link can participate without a passcode."
                    )}
                  </p>
                </div>
              </div>

              {/* Student Experience Mockup */}
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <div className="flex items-center gap-2">
                    <Eye className="size-4" />
                    <span>Candidate Joining Experience Live Preview</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-primary/10 px-2 py-0.5 rounded-md">Simulated View</span>
                </div>
                <div className="p-3.5 rounded-xl border border-border/50 bg-background/90 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="font-bold text-foreground">ExamHub Assessment Portal</span>
                    <span className="text-[10px] text-muted-foreground">Candidate Check-in</span>
                  </div>
                  <div className="space-y-1.5 text-muted-foreground text-[11px]">
                    <div className="flex items-center gap-2 p-1.5 rounded-md bg-muted/40">
                      <span className="font-semibold text-foreground w-20">Full Name:</span>
                      <span className="text-muted-foreground">Required for identification</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-md bg-muted/40">
                      <span className="font-semibold text-foreground w-20">Email:</span>
                      <span className="text-muted-foreground">Used for score reports</span>
                    </div>
                    {accessCode && (
                      <div className="flex items-center gap-2 p-1.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        <span className="font-semibold w-20 flex items-center gap-1">
                          <Lock className="size-3" /> PIN:
                        </span>
                        <span className="font-mono font-bold">{accessCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => setIsAccessModalOpen(false)}
                  className="w-full h-11 text-sm font-bold rounded-xl cursor-pointer gap-2 shadow-xs"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Save Access Settings</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Title Presets & Dropdown Generator Modal */}
        <TitleTemplateModal
          open={isTemplateModalOpen}
          onOpenChange={setIsTemplateModalOpen}
          onSelectTitle={handleSelectPresetTitle}
        />
      </form>
    </TooltipProvider>
  )
}
