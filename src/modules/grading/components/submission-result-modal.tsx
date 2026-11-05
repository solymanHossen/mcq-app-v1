"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Target,
  FileCheck2,
  Sparkles,
  ArrowDown,
  ArrowRight,
  ExternalLink,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface SubmissionResultModalProps {
  attemptId: string
  examId: string
  examTitle: string
  result: {
    totalMarks: number
    obtainedMarks: number
    correctCount: number
    incorrectCount: number
    skippedCount: number
    accuracy: number
    isPassed: boolean | null
  }
  totalQuestions: number
  answeredCount: number
  targetScrollId?: string
  initialOpen?: boolean
}

/**
 * World-class, modern, clean & gorgeous modal displayed to students upon
 * submitting an assessment with published results.
 * Follows the design tokens and hierarchy of `/teacher/exams/new`.
 */
export function SubmissionResultModal({
  attemptId,
  examId,
  examTitle,
  result,
  totalQuestions,
  answeredCount,
  targetScrollId = "result-top",
  initialOpen = true,
}: SubmissionResultModalProps) {
  const storageKey = `result_modal_closed_${attemptId}`
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Only auto-open if the user hasn't explicitly dismissed it in this browser session
    try {
      const alreadyDismissed = sessionStorage.getItem(storageKey) === "true"
      if (!alreadyDismissed && initialOpen) {
        setOpen(true)
      }
    } catch {
      // Fallback if sessionStorage is disabled or blocked
      if (initialOpen) setOpen(true)
    }
  }, [storageKey, initialOpen])

  const handleCloseAndScrollTop = useCallback(() => {
    setOpen(false)
    try {
      sessionStorage.setItem(storageKey, "true")
    } catch {
      // ignore
    }

    // Smoothly scroll to the very top of the result page as requested
    setTimeout(() => {
      const targetElement = document.getElementById(targetScrollId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" })
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }, 100)
  }, [storageKey, targetScrollId])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        handleCloseAndScrollTop()
      } else {
        setOpen(true)
      }
    },
    [handleCloseAndScrollTop]
  )

  const accuracyPercent = Math.round((result.accuracy ?? 0) * 100)
  const isPassed = result.isPassed

  return (
    <>
      {/* Re-trigger Button on the page for easy reopening anytime */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8.5 sm:h-9 px-3.5 sm:px-4 rounded-xl border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs active:scale-95 transition-all gap-2 cursor-pointer"
      >
        <Trophy className="size-4 text-emerald-600 dark:text-emerald-400" />
        <span>View Scorecard Modal</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={true}
          className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl p-0 shadow-2xl overflow-hidden gap-0 focus:outline-none"
        >
          {/* Subtle Radiant Top Accent Gradient */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-primary to-teal-400 z-20"
          />

          {/* Soft Ambient System Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-emerald-500/[0.08] blur-3xl dark:bg-emerald-500/[0.12]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-primary/[0.08] blur-3xl dark:bg-primary/[0.12]"
          />

          <DialogHeader className="sr-only">
            <DialogTitle>Assessment Result Summary</DialogTitle>
            <DialogDescription>
              Official score, accuracy, and question breakdown for {examTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 px-5 sm:px-8 pt-7 sm:pt-8 pb-6 sm:pb-8 space-y-6 sm:space-y-7">
            {/* Celebration Header */}
            <div className="text-center space-y-3">
              {/* Animated Icon Avatar */}
              <div
                className={cn(
                  "size-14 sm:size-16 rounded-2xl flex items-center justify-center mx-auto shadow-2xs ring-1 transition-all",
                  isPassed === true
                    ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/30 shadow-emerald-500/10"
                    : isPassed === false
                    ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/30 shadow-amber-500/10"
                    : "bg-gradient-to-br from-primary/20 to-teal-500/10 text-primary ring-primary/30 shadow-primary/10"
                )}
              >
                {isPassed === true ? (
                  <Trophy className="size-7 sm:size-8" />
                ) : isPassed === false ? (
                  <Target className="size-7 sm:size-8" />
                ) : (
                  <Sparkles className="size-7 sm:size-8" />
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase gap-1.5 shadow-2xs",
                    isPassed === true
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : isPassed === false
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "border-primary/40 bg-primary/15 text-primary"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 sm:size-2 rounded-full",
                      isPassed === true
                        ? "bg-emerald-500 animate-pulse"
                        : isPassed === false
                        ? "bg-amber-500"
                        : "bg-primary animate-pulse"
                    )}
                  />
                  <span>
                    {isPassed === true
                      ? "Exam Passed Successfully"
                      : isPassed === false
                      ? "Exam Completed • Review Required"
                      : "Official Result Published"}
                  </span>
                </Badge>
              </div>

              {/* Exam Title */}
              <div className="space-y-1">
                <h3 className="font-heading text-xl sm:text-2xl font-black text-foreground tracking-tight line-clamp-1">
                  {examTitle}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Your attempt has been graded and officially confirmed
                </p>
              </div>
            </div>

            {/* Hero Scorecard Box */}
            <div className="relative rounded-2xl border border-border/70 bg-gradient-to-b from-muted/40 via-muted/20 to-card p-5 sm:p-6 text-center shadow-xs overflow-hidden">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Obtained Score
              </span>

              <div className="flex items-baseline justify-center gap-1.5 sm:gap-2 my-2 sm:my-3">
                <span className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
                  {result.obtainedMarks}
                </span>
                <span className="font-heading text-lg sm:text-2xl font-bold text-muted-foreground/70">
                  / {result.totalMarks}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1">
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-xs font-bold border-primary/30 bg-primary/10 text-primary gap-1.5 shadow-2xs"
                >
                  <Target className="size-3.5" />
                  <span>{accuracyPercent}% Accuracy</span>
                </Badge>

                {isPassed !== null && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold gap-1.5 shadow-2xs",
                      isPassed
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "border-destructive/40 bg-destructive/15 text-destructive"
                    )}
                  >
                    {isPassed ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Pass Mark Met</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="size-3.5 text-destructive" />
                        <span>Below Pass Mark</span>
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>

            {/* 4 Metric Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Correct */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 text-center shadow-2xs transition-all hover:bg-emerald-500/10">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-1.5">
                  <CheckCircle2 className="size-4" />
                </span>
                <span className="font-heading text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {result.correctCount}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Correct
                </span>
              </div>

              {/* Incorrect */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 dark:bg-destructive/10 text-center shadow-2xs transition-all hover:bg-destructive/10">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive mb-1.5">
                  <XCircle className="size-4" />
                </span>
                <span className="font-heading text-lg sm:text-xl font-black text-destructive">
                  {result.incorrectCount}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Incorrect
                </span>
              </div>

              {/* Skipped */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-border/70 bg-muted/20 text-center shadow-2xs transition-all hover:bg-muted/30">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-muted-foreground/15 text-muted-foreground mb-1.5">
                  <MinusCircle className="size-4" />
                </span>
                <span className="font-heading text-lg sm:text-xl font-black text-foreground">
                  {result.skippedCount}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Skipped
                </span>
              </div>

              {/* Attempted */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 text-center shadow-2xs transition-all hover:bg-primary/10">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-primary/15 text-primary mb-1.5">
                  <FileCheck2 className="size-4" />
                </span>
                <span className="font-heading text-lg sm:text-xl font-black text-primary">
                  {answeredCount}/{totalQuestions}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Attempted
                </span>
              </div>
            </div>

            {/* Actions: View Details / Close and Scroll to Top */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
              <Button
                asChild
                variant="outline"
                className="h-10.5 sm:h-11 rounded-xl px-4 font-semibold text-xs sm:text-sm border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95 cursor-pointer order-2 sm:order-1"
              >
                <Link href={`/exams/${examId}`}>
                  <span>Back to Assessment</span>
                </Link>
              </Button>

              <Button
                type="button"
                onClick={handleCloseAndScrollTop}
                className="h-10.5 sm:h-11 rounded-xl px-5 sm:px-6 font-bold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs hover:shadow-sm active:scale-95 transition-all gap-2 cursor-pointer order-1 sm:order-2"
              >
                <span>View Full Result Details</span>
                <ArrowDown className="size-4 animate-bounce" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

