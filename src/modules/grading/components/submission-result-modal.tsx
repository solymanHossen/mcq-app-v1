"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
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
  X,
} from "lucide-react"

import {
  Dialog,
  DialogClose,
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
  logoUrl?: string | null
  appName?: string
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
  logoUrl,
  appName = "BCS & Bank Aspirants",
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
        <span>View Scorecard</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl rounded-3xl border border-border/70 bg-card/95 backdrop-blur-xl p-0 shadow-2xl overflow-hidden gap-0 focus:outline-none"
        >
          {/* Top-Right Cancel / Close (X) Cross Button */}
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCloseAndScrollTop}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-50 size-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer transition-all active:scale-95 shadow-2xs"
              aria-label="Close scorecard modal"
            >
              <X className="size-5" />
            </Button>
          </DialogClose>

          {/* Soft Top Ambient Gradient Glow (Borderless, Premium & Subtle) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 inset-x-0 h-44 bg-gradient-to-b from-primary/[0.08] via-emerald-500/[0.03] to-transparent blur-2xl"
          />

          {/* Soft Ambient System Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-emerald-500/[0.06] blur-3xl dark:bg-emerald-500/[0.10]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-primary/[0.06] blur-3xl dark:bg-primary/[0.10]"
          />

          <DialogHeader className="sr-only">
            <DialogTitle>Assessment Result Summary</DialogTitle>
            <DialogDescription>
              Official score, accuracy, and question breakdown for {examTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 px-5 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8 space-y-5 sm:space-y-6">
            {/* Celebration Header */}
            <div className="text-center space-y-3">
              {/* Official Brand Logo - Clean, Large & Borderless */}
              <div className="relative size-24 sm:size-28 mx-auto shrink-0 select-none flex items-center justify-center transition-transform duration-300 hover:scale-105">
                <Image
                  src={logoUrl || "/images/bcs-bank-logo-512.png"}
                  alt={appName}
                  width={112}
                  height={112}
                  priority
                  className="size-full object-contain drop-shadow-sm"
                />
              </div>

              {/* Status Badge & Brand */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-2xs border-0",
                    isPassed === true
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : isPassed === false
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-primary/15 text-primary"
                  )}
                >
                  <span>
                    {isPassed === true
                      ? "Exam Passed Successfully"
                      : isPassed === false
                      ? "Exam Completed • Review Required"
                      : "Official Result Published"}
                  </span>
                </Badge>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden xs:inline">
                  • {appName}
                </span>
              </div>

              {/* Exam Title */}
              <div className="space-y-1">
                <h3 className="font-heading text-lg sm:text-2xl font-black text-foreground tracking-tight max-w-md mx-auto line-clamp-2 leading-snug" title={examTitle}>
                  {examTitle}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Official grading verified by <span className="text-primary font-bold">{appName}</span>
                </p>
              </div>
            </div>

            {/* Hero Scorecard Box */}
            <div className="relative rounded-2xl sm:rounded-3xl border border-border/50 bg-gradient-to-b from-muted/50 via-muted/20 to-card p-4 sm:p-5.5 text-center shadow-2xs overflow-hidden">
              <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Obtained Score
              </span>

              <div className="flex items-baseline justify-center gap-1.5 sm:gap-2 my-1.5 sm:my-2">
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
                  className="rounded-full px-2.5 sm:px-3 py-0.5 text-xs font-bold border-0 bg-primary/10 text-primary gap-1.5 shadow-2xs"
                >
                  <Target className="size-3.5" />
                  <span>{accuracyPercent}% Accuracy</span>
                </Badge>

                {isPassed !== null && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-2.5 sm:px-3 py-0.5 text-xs font-bold gap-1.5 shadow-2xs border-0",
                      isPassed
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-destructive/15 text-destructive"
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
              <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 text-center shadow-2xs transition-all hover:bg-emerald-500/10">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-1.5">
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
              <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border border-destructive/20 bg-gradient-to-b from-destructive/10 to-destructive/5 text-center shadow-2xs transition-all hover:bg-destructive/10">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-destructive/15 text-destructive mb-1.5">
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
              <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border border-border/50 bg-gradient-to-b from-muted/30 to-muted/15 text-center shadow-2xs transition-all hover:bg-muted/30">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-muted-foreground/15 text-muted-foreground mb-1.5">
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
              <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-primary/5 text-center shadow-2xs transition-all hover:bg-primary/10">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-primary/15 text-primary mb-1.5">
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

