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
    <div className="space-y-6">
      {/* Quick Action Shortcuts Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/exams"
          className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm active:scale-98"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <BookOpen className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Exams Catalog
              </p>
              <p className="text-xs text-muted-foreground">
                Practice & take exams
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/mistakes"
          className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm active:scale-98"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-105">
              <RotateCcw className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Mistake Notebook
              </p>
              <p className="text-xs text-muted-foreground">
                Review wrong answers
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/leaderboard"
          className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm active:scale-98"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500 transition-transform group-hover:scale-105">
              <Trophy className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Leaderboard
              </p>
              <p className="text-xs text-muted-foreground">
                See ranking & scores
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Recent Exam Attempts Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Exam Activity</CardTitle>
              <CardDescription>
                Your latest tests, score breakdowns, and performance outcomes.
              </CardDescription>
            </div>
            <Link
              href="/exams"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          {recentAttempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Sparkles className="size-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No exam attempts yet
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Start practicing with available question banks and mock exams to
                track your progress here.
              </p>
              <Link
                href="/exams"
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-95"
              >
                Explore Exams
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
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
                    className="flex flex-col justify-between gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {attempt.exam.title}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium"
                        >
                          {isCompleted ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{dateFormatted}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {attempt.status.toLowerCase().replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {attempt.result && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">
                            {score}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Accuracy: {accuracy}
                          </p>
                        </div>
                      )}

                      {attempt.result?.isPassed !== undefined &&
                        attempt.result?.isPassed !== null && (
                          <Badge
                            variant="outline"
                            className={
                              attempt.result.isPassed
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }
                          >
                            {attempt.result.isPassed ? (
                              <CheckCircle2 className="mr-1 size-3" />
                            ) : (
                              <XCircle className="mr-1 size-3" />
                            )}
                            {attempt.result.isPassed
                              ? "Passed"
                              : "Needs Review"}
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
