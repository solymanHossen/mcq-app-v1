"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  RotateCcw,
  GraduationCap,
  Trophy,
  XCircle,
  ArrowRight,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RecentAttempt {
  id: string
  status: string
  startedAt: Date
  submittedAt: Date | null
  exam: {
    id: string
    title: string
  }
  result: {
    obtainedMarks: number
    totalMarks: number
    accuracy: number
    isPassed: boolean | null
  } | null
}

interface StudentActivityCardProps {
  recentAttempts: RecentAttempt[]
  bookmarksCount: number
}

export function StudentActivityCard({
  recentAttempts,
  bookmarksCount: _bookmarksCount,
}: StudentActivityCardProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Quick Action Shortcuts Grid — Master Reference Card Styling */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <Link
          href="/exams"
          className="group block rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <span className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20 transition-transform group-hover:scale-105">
                <BookOpen className="size-5 sm:size-6" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                  Exams Catalog
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  Browse &amp; take live tests
                </p>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground shrink-0" />
          </div>
        </Link>

        <Link
          href="/mistakes"
          className="group block rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <span className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs ring-1 ring-amber-500/20 transition-transform group-hover:scale-105">
                <RotateCcw className="size-5 sm:size-6" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                  Mistake Vault
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  Spaced mistake revision
                </p>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground shrink-0" />
          </div>
        </Link>

        <Link
          href="/leaderboard"
          className="group block rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <span className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20 transition-transform group-hover:scale-105">
                <Trophy className="size-5 sm:size-6" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                  Leaderboard
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  Ranks &amp; top percentiles
                </p>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground shrink-0" />
          </div>
        </Link>
      </div>

      {/* Recent Exam Attempts Card — Master Reference Card Styling */}
      <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
        {/* Card Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
              <GraduationCap className="size-4.5 sm:size-5.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                Recent Examination Activity
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Your latest tests, score breakdowns, and performance outcomes
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8.5 px-3.5 rounded-xl font-semibold text-xs sm:text-sm border-border/70 shadow-2xs gap-1.5 self-start sm:self-auto"
          >
            <Link href="/exams">
              <span>View all exams</span>
              <ChevronRight className="size-3.5 ml-0.5" />
            </Link>
          </Button>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-6 lg:p-7">
          {recentAttempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-14 text-center">
              <div className="mb-3.5 flex size-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground shadow-2xs ring-1 ring-border/50">
                <GraduationCap className="size-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                No exam attempts yet
              </h3>
              <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Start practicing with available question banks and mock exams to track your progress and performance here.
              </p>
              <Button asChild size="default" className="mt-5 rounded-xl font-bold shadow-xs">
                <Link href="/exams">
                  <span>Explore Exams Catalog</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {recentAttempts.map((attempt) => {
                const dateFormatted = new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(new Date(attempt.submittedAt ?? attempt.startedAt))

                const isCompleted = attempt.status === "COMPLETED"
                const score = attempt.result
                  ? `${Math.round(attempt.result.obtainedMarks)} / ${attempt.result.totalMarks}`
                  : null
                const accuracy = attempt.result
                  ? `${Math.round(attempt.result.accuracy * 100)}%`
                  : null

                return (
                  <div
                    key={attempt.id}
                    className="flex flex-col justify-between gap-3 sm:gap-4 rounded-xl border border-border/60 bg-muted/15 p-4 sm:p-4.5 transition-colors hover:bg-muted/25"
                  >
                    {/* Top: Title, Status, and Date */}
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <p className="font-heading text-sm sm:text-base font-bold tracking-tight text-foreground line-clamp-2">
                          {attempt.exam.title}
                        </p>
                        {attempt.result?.isPassed !== undefined &&
                        attempt.result?.isPassed !== null ? (
                          <Badge
                            className={
                              attempt.result.isPassed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-semibold gap-1 shrink-0"
                                : "bg-destructive/10 text-destructive border border-destructive/25 rounded-full text-[11px] font-semibold gap-1 shrink-0"
                            }
                          >
                            {attempt.result.isPassed ? (
                              <CheckCircle2 className="size-3" />
                            ) : (
                              <XCircle className="size-3" />
                            )}
                            <span>{attempt.result.isPassed ? "Passed" : "Review"}</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant={isCompleted ? "default" : "secondary"}
                            className="shrink-0 rounded-full text-[11px] font-semibold"
                          >
                            {isCompleted ? "Completed" : "In Progress"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{dateFormatted}</span>
                        </span>
                        <span>•</span>
                        <span className="font-medium capitalize">
                          {attempt.status.toLowerCase().replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Scores & Details */}
                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-xs">
                      {attempt.result ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading text-sm sm:text-base font-extrabold text-foreground">
                            {score}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            ({accuracy} accuracy)
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">In progress</span>
                      )}

                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Link href={`/exams/${attempt.exam.id}/attempt/${attempt.id}`}>
                          <span>View Review</span>
                          <ChevronRight className="size-3 ml-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
