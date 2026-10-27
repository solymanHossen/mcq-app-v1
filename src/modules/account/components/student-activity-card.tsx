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
      {/* Quick Action Shortcuts Grid — Large, Modern, Ultra-Smooth */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <Link
          href="/exams"
          className="group flex items-center justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99] sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16">
              <BookOpen className="size-7 sm:size-8" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Exams Catalog
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Practice & take live exams
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>

        <Link
          href="/mistakes"
          className="group flex items-center justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99] sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16">
              <RotateCcw className="size-7 sm:size-8" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Mistake Notebook
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Review wrong answers
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>

        <Link
          href="/leaderboard"
          className="group flex items-center justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99] sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16">
              <Trophy className="size-7 sm:size-8" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Leaderboard
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Rankings & top scores
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>
      </div>

      {/* Recent Exam Attempts Card — Large, Modern, Spacious */}
      <Card className="overflow-hidden rounded-3xl border-0 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <CardHeader className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Recent Exam Activity
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground sm:text-base">
                Your latest tests, score breakdowns, accuracy rates, and
                performance outcomes.
              </CardDescription>
            </div>
            <Link
              href="/exams"
              className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-secondary px-4 text-xs font-semibold text-secondary-foreground shadow-2xs transition-colors hover:bg-secondary/80 active:scale-95 sm:self-auto sm:text-sm"
            >
              <span>View all exams</span>
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 pt-0 sm:pt-0">
          {recentAttempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
                <Sparkles className="size-8" />
              </div>
              <p className="text-lg font-bold text-foreground">
                No exam attempts yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Start practicing with available question banks and mock exams to
                track your progress and performance here.
              </p>
              <Link
                href="/exams"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-95"
              >
                <span>Explore Exams Catalog</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
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
                    className="flex flex-col justify-between gap-4 rounded-2xl bg-muted/30 p-5 transition-all duration-200 hover:bg-muted/50 sm:flex-row sm:items-center sm:p-6"
                  >
                    {/* Left: Title, Status, and Date */}
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                          {attempt.exam.title}
                        </p>
                        <Badge
                          variant={isCompleted ? "default" : "secondary"}
                          className="rounded-lg px-2.5 py-0.5 text-xs font-semibold"
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
                    <div className="flex shrink-0 items-center gap-5 self-end sm:self-center">
                      {attempt.result && (
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-foreground sm:text-xl">
                            {score}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
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
                            variant={
                              attempt.result.isPassed ? "default" : "outline"
                            }
                            className="h-8 gap-1.5 rounded-xl px-3.5 text-xs font-semibold sm:text-sm"
                          >
                            {attempt.result.isPassed ? (
                              <CheckCircle2 className="size-4" />
                            ) : (
                              <XCircle className="size-4 text-destructive" />
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
