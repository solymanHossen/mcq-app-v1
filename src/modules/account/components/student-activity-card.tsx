"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
  bookmarksCount,
}: StudentActivityCardProps) {
  return (
    <div className="space-y-8">
      {/* Quick Action Shortcuts Grid — Large, Premium Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/exams"
          className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-md active:scale-98"
        >
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
              <BookOpen className="size-6" />
            </span>
            <div>
              <p className="text-base font-bold text-foreground">
                Exams Catalog
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Practice & take exams
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
        </Link>

        <Link
          href="/mistakes"
          className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-amber-500/50 hover:shadow-md active:scale-98"
        >
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 transition-transform duration-200 group-hover:scale-105">
              <RotateCcw className="size-6" />
            </span>
            <div>
              <p className="text-base font-bold text-foreground">
                Mistake Notebook
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Review wrong answers
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
        </Link>

        <Link
          href="/leaderboard"
          className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-yellow-500/50 hover:shadow-md active:scale-98"
        >
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500 transition-transform duration-200 group-hover:scale-105">
              <Trophy className="size-6" />
            </span>
            <div>
              <p className="text-base font-bold text-foreground">Leaderboard</p>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Rankings & top scores
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Recent Exam Attempts Card — Larger, Spacious, Modern Design */}
      <Card className="overflow-hidden rounded-3xl border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 p-6 sm:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight sm:text-xl">
                Recent Exam Activity
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                Your latest tests, score breakdowns, accuracy rates, and
                performance outcomes.
              </CardDescription>
            </div>
            <Link
              href="/exams"
              className="inline-flex h-9 items-center gap-1.5 self-start rounded-xl bg-secondary px-3.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 sm:self-auto sm:text-sm"
            >
              <span>View all exams</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-7">
          {recentAttempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Sparkles className="size-7" />
              </div>
              <p className="text-base font-bold text-foreground">
                No exam attempts yet
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
                Start practicing with available question banks and mock exams to
                track your progress and stats here.
              </p>
              <Link
                href="/exams"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-95 sm:text-sm"
              >
                <span>Explore Exams Catalog</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentAttempts.map((attempt) => {
                const dateFormatted = new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
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
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4 transition-all duration-200 hover:border-border hover:bg-muted/50 hover:shadow-xs sm:flex-row sm:items-center sm:p-5"
                  >
                    {/* Left: Title, Status, and Date */}
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                          {attempt.exam.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            isCompleted
                              ? "border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                              : "bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                          }
                        >
                          {isCompleted ? "Completed" : "In Progress"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          {dateFormatted}
                        </span>
                        <span>•</span>
                        <span className="font-medium capitalize">
                          {attempt.status.toLowerCase().replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Right: Scores & Outcomes */}
                    <div className="flex shrink-0 items-center gap-4 self-end sm:self-center">
                      {attempt.result && (
                        <div className="text-right">
                          <p className="text-base font-extrabold text-foreground sm:text-lg">
                            {score}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                            Accuracy:{" "}
                            <span className="font-semibold text-foreground">
                              {accuracy}
                            </span>
                          </p>
                        </div>
                      )}

                      {attempt.result?.isPassed !== undefined &&
                        attempt.result?.isPassed !== null && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-7 gap-1.5 rounded-xl px-3 text-xs font-semibold sm:h-8 sm:text-sm",
                              attempt.result.isPassed
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {attempt.result.isPassed ? (
                              <CheckCircle2 className="size-4" />
                            ) : (
                              <XCircle className="size-4" />
                            )}
                            <span>
                              {attempt.result.isPassed
                                ? "Passed"
                                : "Needs Review"}
                            </span>
                          </Badge>
                        )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
