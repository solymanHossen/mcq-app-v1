"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck2,
  Filter,
  GraduationCap,
  Medal,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import type { TeacherResultItem, TeacherExamOption } from "./page"

interface TeacherResultsClientProps {
  exams: TeacherExamOption[]
  attempts: TeacherResultItem[]
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function TeacherResultsClient({
  exams,
  attempts,
}: TeacherResultsClientProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [sortBy, setSortBy] = useState<string>("LATEST")
  const [activeTab, setActiveTab] = useState<string>("roster")

  // Filter and sort attempts
  const filteredAttempts = useMemo(() => {
    return attempts
      .filter((att) => {
        // 1. Exam filter
        if (selectedExamId !== "ALL" && att.exam.id !== selectedExamId) {
          return false
        }

        // 2. Status filter
        if (statusFilter === "PASSED" && att.result?.isPassed !== true) {
          return false
        }
        if (statusFilter === "FAILED" && att.result?.isPassed !== false) {
          return false
        }
        if (statusFilter === "COMPLETED" && att.status !== "COMPLETED") {
          return false
        }
        if (statusFilter === "IN_PROGRESS" && att.status !== "IN_PROGRESS") {
          return false
        }
        if (statusFilter === "TIMEOUT" && att.status !== "TIMEOUT") {
          return false
        }
        if (
          statusFilter === "DISQUALIFIED" &&
          att.status !== "DISQUALIFIED"
        ) {
          return false
        }

        // 3. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const nameMatch = att.student.name.toLowerCase().includes(q)
          const emailMatch = att.student.email.toLowerCase().includes(q)
          const examMatch = att.exam.title.toLowerCase().includes(q)
          if (!nameMatch && !emailMatch && !examMatch) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === "LATEST") {
          const dateA = new Date(a.submittedAt || a.startedAt).getTime()
          const dateB = new Date(b.submittedAt || b.startedAt).getTime()
          return dateB - dateA
        }
        if (sortBy === "SCORE_HIGH") {
          const scoreA = a.result?.obtainedMarks ?? -1
          const scoreB = b.result?.obtainedMarks ?? -1
          return scoreB - scoreA
        }
        if (sortBy === "SCORE_LOW") {
          const scoreA = a.result?.obtainedMarks ?? 999999
          const scoreB = b.result?.obtainedMarks ?? 999999
          return scoreA - scoreB
        }
        if (sortBy === "ACCURACY_HIGH") {
          const accA = a.result?.accuracy ?? -1
          const accB = b.result?.accuracy ?? -1
          return accB - accA
        }
        if (sortBy === "NAME_ASC") {
          return a.student.name.localeCompare(b.student.name)
        }
        return 0
      })
  }, [attempts, selectedExamId, statusFilter, searchQuery, sortBy])

  // Summary statistics for currently filtered attempts
  const stats = useMemo(() => {
    const total = filteredAttempts.length
    const completed = filteredAttempts.filter(
      (a) => a.status === "COMPLETED"
    ).length
    const inProgress = filteredAttempts.filter(
      (a) => a.status === "IN_PROGRESS"
    ).length
    const passed = filteredAttempts.filter(
      (a) => a.result?.isPassed === true
    ).length
    const uniqueStudents = new Set(filteredAttempts.map((a) => a.student.id))
      .size

    let totalAccuracySum = 0
    let evaluatedCount = 0
    let highestScore = 0

    filteredAttempts.forEach((a) => {
      if (a.result) {
        totalAccuracySum += a.result.accuracy
        evaluatedCount++
        if (a.result.obtainedMarks > highestScore) {
          highestScore = a.result.obtainedMarks
        }
      }
    })

    const avgAccuracy =
      evaluatedCount > 0 ? Math.round(totalAccuracySum / evaluatedCount) : 0
    const passRate =
      completed > 0 ? Math.round((passed / completed) * 100) : 0

    return {
      total,
      completed,
      inProgress,
      passed,
      uniqueStudents,
      avgAccuracy,
      passRate,
      highestScore,
    }
  }, [filteredAttempts])

  // Top leaderboard performers
  const leaderboardPerformers = useMemo(() => {
    return [...filteredAttempts]
      .filter((a) => a.result !== null)
      .sort((a, b) => {
        const scoreB = b.result?.obtainedMarks ?? 0
        const scoreA = a.result?.obtainedMarks ?? 0
        if (scoreB !== scoreA) return scoreB - scoreA
        const accB = b.result?.accuracy ?? 0
        const accA = a.result?.accuracy ?? 0
        return accB - accA
      })
      .slice(0, 15)
  }, [filteredAttempts])

  // CSV Export function
  function handleExportCsv() {
    if (filteredAttempts.length === 0) return

    const headers = [
      "Candidate Name",
      "Candidate Email",
      "Exam Title",
      "Status",
      "Obtained Marks",
      "Total Marks",
      "Accuracy (%)",
      "Result",
      "Started At",
      "Submitted At",
    ]

    const rows = filteredAttempts.map((a) => [
      `"${a.student.name.replace(/"/g, '""')}"`,
      `"${a.student.email.replace(/"/g, '""')}"`,
      `"${a.exam.title.replace(/"/g, '""')}"`,
      a.status,
      a.result ? a.result.obtainedMarks : "N/A",
      a.result ? a.result.totalMarks : "N/A",
      a.result ? `${Math.round(a.result.accuracy)}%` : "N/A",
      a.result?.isPassed === true
        ? "PASSED"
        : a.result?.isPassed === false
          ? "FAILED"
          : "PENDING",
      `"${new Date(a.startedAt).toLocaleString()}"`,
      a.submittedAt ? `"${new Date(a.submittedAt).toLocaleString()}"` : "N/A",
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `exam_submissions_report_${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleResetFilters() {
    setSelectedExamId("ALL")
    setSearchQuery("")
    setStatusFilter("ALL")
    setSortBy("LATEST")
  }

  const hasActiveFilters =
    selectedExamId !== "ALL" ||
    searchQuery.trim() !== "" ||
    statusFilter !== "ALL" ||
    sortBy !== "LATEST"

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      {/* ── TOP HEADER & BREADCRUMB (Strictly matching /teacher/exams/new) ── */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-1.5 sm:gap-2"
          >
            <Link href="/teacher">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>

          {/* Reset button for mobile screens (< sm) */}
          {hasActiveFilters && (
            <Button
              onClick={handleResetFilters}
              variant="ghost"
              size="sm"
              className="sm:hidden h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
            >
              <RotateCcw className="size-3.5 shrink-0" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Results &amp; Cohort Submissions
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
            >
              <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Telemetry</span>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
            >
              {filteredAttempts.length} Submissions
            </Badge>
          </div>

          {/* Desktop/Tablet Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-auto">
            <Button
              onClick={handleExportCsv}
              disabled={filteredAttempts.length === 0}
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold border-border/70 hover:bg-muted transition-all gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="size-4 text-primary shrink-0" />
              <span>Export CSV</span>
            </Button>

            <Button
              asChild
              size="sm"
              className="h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold shadow-xs gap-2"
            >
              <Link href="/teacher/exams">
                <BookOpen className="size-4 shrink-0" />
                <span>Manage Exams</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN RESPONSIVE GRID (Strictly matching /teacher/exams/new) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* ── LEFT CANVAS (8 Columns on lg/xl) ── */}
        <div className="space-y-8 lg:col-span-8 min-w-0">
          {/* ── CARD 1: KPI TELEMETRY GRID ── */}
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                  <Activity className="size-4.5 sm:size-5.5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                    Cohort Performance Telemetry
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                    Real-time candidate submissions, evaluation pass rate, and score distributions
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 border-border/70 shrink-0">
                {stats.uniqueStudents} Candidates
              </Badge>
            </div>

            <div className="p-4 sm:p-6 lg:p-7">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Tile 1 */}
                <div className="rounded-xl border border-border/60 bg-muted/15 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Submissions
                    </span>
                    <Users className="size-4 text-primary" />
                  </div>
                  <p className="font-heading text-xl sm:text-2xl font-extrabold text-foreground mt-2">
                    {stats.total}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                    {stats.completed} finalized
                  </p>
                </div>

                {/* Tile 2 */}
                <div className="rounded-xl border border-border/60 bg-muted/15 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Pass Rate
                    </span>
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="font-heading text-xl sm:text-2xl font-extrabold text-foreground mt-2">
                    {stats.passRate}%
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                    {stats.passed} passed
                  </p>
                </div>

                {/* Tile 3 */}
                <div className="rounded-xl border border-border/60 bg-muted/15 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Mean Score
                    </span>
                    <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="font-heading text-xl sm:text-2xl font-extrabold text-foreground mt-2">
                    {stats.avgAccuracy}%
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                    Avg accuracy
                  </p>
                </div>

                {/* Tile 4 */}
                <div className="rounded-xl border border-border/60 bg-muted/15 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Top Mark
                    </span>
                    <Trophy className="size-4 text-amber-500" />
                  </div>
                  <p className="font-heading text-xl sm:text-2xl font-extrabold text-foreground mt-2">
                    {Math.round(stats.highestScore)}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                    Highest score
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* ── CARD 2: FILTER & SEARCH CONTROLS ── */}
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20 shadow-2xs flex items-center justify-center shrink-0 dark:bg-indigo-500/15 dark:text-indigo-400">
                  <Filter className="size-4.5 sm:size-5.5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                    Filter &amp; Search Controls
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                    Search candidate names, filter by assessment, or sort by scoring performance
                  </p>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  onClick={handleResetFilters}
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground shrink-0"
                >
                  <RotateCcw className="size-3.5 mr-1" />
                  <span>Reset</span>
                </Button>
              )}
            </div>

            <div className="p-4 sm:p-6 lg:p-7 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by candidate name, email, or assessment title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 sm:h-12 pl-10 pr-16 rounded-xl border-input/60 bg-muted/20 text-sm font-medium focus-visible:bg-background transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Dropdown Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                {/* Exam Filter */}
                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block truncate">
                    Assessment
                  </label>
                  <Select
                    value={selectedExamId}
                    onValueChange={(val) => setSelectedExamId(val)}
                  >
                    <SelectTrigger className="h-11 rounded-xl text-xs sm:text-sm font-medium w-full min-w-0 overflow-hidden">
                      <SelectValue placeholder="All Assessments" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 rounded-xl">
                      <SelectItem value="ALL" className="truncate">All Assessments ({exams.length})</SelectItem>
                      {exams.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id} className="truncate">
                          {ex.title} ({ex.attemptsCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block truncate">
                    Evaluation
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={(val) => setStatusFilter(val)}
                  >
                    <SelectTrigger className="h-11 rounded-xl text-xs sm:text-sm font-medium w-full min-w-0 overflow-hidden">
                      <SelectValue placeholder="Status: All" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ALL" className="truncate">Status: All</SelectItem>
                      <SelectItem value="PASSED" className="truncate">Passed Only</SelectItem>
                      <SelectItem value="FAILED" className="truncate">Failed Only</SelectItem>
                      <SelectItem value="COMPLETED" className="truncate">Completed</SelectItem>
                      <SelectItem value="IN_PROGRESS" className="truncate">In Progress</SelectItem>
                      <SelectItem value="TIMEOUT" className="truncate">Timed Out</SelectItem>
                      <SelectItem value="DISQUALIFIED" className="truncate">Disqualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block truncate">
                    Sort Sequence
                  </label>
                  <Select
                    value={sortBy}
                    onValueChange={(val) => setSortBy(val)}
                  >
                    <SelectTrigger className="h-11 rounded-xl text-xs sm:text-sm font-medium w-full min-w-0 overflow-hidden">
                      <SelectValue placeholder="Sort Sequence" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="LATEST" className="truncate">Latest Submissions</SelectItem>
                      <SelectItem value="SCORE_HIGH" className="truncate">Highest Score</SelectItem>
                      <SelectItem value="SCORE_LOW" className="truncate">Lowest Score</SelectItem>
                      <SelectItem value="ACCURACY_HIGH" className="truncate">Highest Accuracy</SelectItem>
                      <SelectItem value="NAME_ASC" className="truncate">Candidate Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* ── CARD 3: TABBED CONTENT (ROSTER / TRACKS / LEADERBOARD) ── */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full min-w-0 space-y-6"
          >
            <div className="w-full overflow-x-auto pb-1 scrollbar-none">
              <TabsList className="group-data-horizontal/tabs:h-auto flex w-max min-w-full items-center gap-1 rounded-xl border border-border/60 bg-muted/20 p-1 shadow-2xs">
                <TabsTrigger
                  value="roster"
                  className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Users className="size-4" />
                  <span>Submissions Roster</span>
                  <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground/20 text-[11px] font-bold">
                    {filteredAttempts.length}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="cohorts"
                  className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <BookOpen className="size-4" />
                  <span>Assessment Tracks</span>
                  <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground/20 text-[11px] font-bold">
                    {exams.length}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="leaderboard"
                  className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Trophy className="size-4" />
                  <span>Top Leaderboard</span>
                  <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground/20 text-[11px] font-bold">
                    {leaderboardPerformers.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: SUBMISSIONS ROSTER */}
            <TabsContent value="roster" className="mt-0">
              <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
                <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                      <FileCheck2 className="size-4.5 sm:size-5.5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                        Candidate Submissions Roster
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                        Showing {filteredAttempts.length} candidate attempts matching your search and filter criteria
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 border-border/70 shrink-0 self-start sm:self-auto">
                    {stats.completed} finalized • {stats.passed} passed
                  </Badge>
                </div>

                <div className="p-0">
                  {filteredAttempts.length === 0 ? (
                    <div className="p-6 sm:p-10">
                      <Empty className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 sm:py-12">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Users />
                          </EmptyMedia>
                          <EmptyTitle className="font-heading text-base sm:text-lg font-bold">
                            No candidate submissions found
                          </EmptyTitle>
                          <EmptyDescription className="text-xs sm:text-sm">
                            {hasActiveFilters
                              ? "Try clearing or adjusting your search filters to find candidate records."
                              : "Student submissions will automatically appear here once candidates start your assessments."}
                          </EmptyDescription>
                        </EmptyHeader>
                        {hasActiveFilters && (
                          <EmptyContent>
                            <Button
                              onClick={handleResetFilters}
                              size="sm"
                              className="h-9 rounded-xl px-4 text-xs font-semibold shadow-xs"
                            >
                              Reset Filters
                            </Button>
                          </EmptyContent>
                        )}
                      </Empty>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden lg:block overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-muted/10">
                            <TableRow className="hover:bg-transparent border-b border-border/60">
                              <TableHead className="h-11 px-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Candidate
                              </TableHead>
                              <TableHead className="h-11 px-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Assessment Track
                              </TableHead>
                              <TableHead className="h-11 px-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Score / Total
                              </TableHead>
                              <TableHead className="h-11 px-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Accuracy &amp; Answers
                              </TableHead>
                              <TableHead className="h-11 px-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Evaluation
                              </TableHead>
                              <TableHead className="h-11 px-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Date &amp; Time
                              </TableHead>
                              <TableHead className="h-11 px-5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-border/50">
                            {filteredAttempts.map((att) => {
                              const isPassed = att.result?.isPassed === true
                              const isFailed = att.result?.isPassed === false

                              return (
                                <TableRow
                                  key={att.id}
                                  className="transition-colors hover:bg-muted/20"
                                >
                                  {/* Candidate */}
                                  <TableCell className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="size-9 shrink-0 rounded-xl border border-border/70">
                                        <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-bold text-primary">
                                          {getInitials(att.student.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <p className="font-heading text-sm font-semibold text-foreground truncate">
                                            {att.student.name}
                                          </p>
                                          {att.student.isGuest && (
                                            <Badge
                                              variant="secondary"
                                              className="text-[10px] px-1.5 py-0 rounded"
                                            >
                                              Guest
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium truncate">
                                          {att.student.email}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>

                                  {/* Exam */}
                                  <TableCell className="px-5 py-4 max-w-64">
                                    <div className="min-w-0">
                                      <Link
                                        href={`/teacher/exams/${att.exam.id}`}
                                        className="font-heading text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                                      >
                                        {att.exam.title}
                                      </Link>
                                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-medium">
                                        <span className="inline-flex items-center gap-1">
                                          <Clock className="size-3" />
                                          <span>{att.exam.durationMinutes} min</span>
                                        </span>
                                        <span>•</span>
                                        <span>Attempt #{att.attemptNumber}</span>
                                      </div>
                                    </div>
                                  </TableCell>

                                  {/* Score */}
                                  <TableCell className="px-5 py-4">
                                    {att.result ? (
                                      <div className="space-y-1">
                                        <div className="flex items-baseline gap-1">
                                          <span className="font-heading text-base font-bold text-foreground">
                                            {att.result.obtainedMarks}
                                          </span>
                                          <span className="text-xs text-muted-foreground font-medium">
                                            / {att.result.totalMarks}
                                          </span>
                                        </div>
                                        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                                          <div
                                            className={`h-full rounded-full transition-all ${
                                              isPassed
                                                ? "bg-emerald-500"
                                                : isFailed
                                                  ? "bg-destructive"
                                                  : "bg-primary"
                                            }`}
                                            style={{
                                              width: `${Math.min(
                                                100,
                                                Math.max(
                                                  0,
                                                  att.result.totalMarks > 0
                                                    ? (att.result.obtainedMarks /
                                                        att.result.totalMarks) *
                                                        100
                                                    : 0
                                                )
                                              )}%`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground font-medium">
                                        In progress
                                      </span>
                                    )}
                                  </TableCell>

                                  {/* Accuracy */}
                                  <TableCell className="px-5 py-4">
                                    {att.result ? (
                                      <div className="space-y-0.5">
                                        <span className="font-heading text-sm font-bold text-foreground">
                                          {Math.round(att.result.accuracy)}%
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                                          <span className="text-emerald-600 font-semibold dark:text-emerald-400">
                                            ✓ {att.result.correctCount}
                                          </span>
                                          <span>•</span>
                                          <span className="text-destructive font-semibold">
                                            ✗ {att.result.incorrectCount}
                                          </span>
                                          <span>•</span>
                                          <span>− {att.result.skippedCount}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground font-medium">
                                        —
                                      </span>
                                    )}
                                  </TableCell>

                                  {/* Evaluation Status */}
                                  <TableCell className="px-5 py-4">
                                    {att.status === "COMPLETED" ? (
                                      isPassed ? (
                                        <Badge
                                          variant="default"
                                          className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold gap-1"
                                        >
                                          <CheckCircle2 className="size-3" />
                                          <span>Passed</span>
                                        </Badge>
                                      ) : isFailed ? (
                                        <Badge
                                          variant="destructive"
                                          className="rounded-lg text-xs font-semibold gap-1"
                                        >
                                          <XCircle className="size-3" />
                                          <span>Failed</span>
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="secondary"
                                          className="rounded-lg text-xs font-semibold"
                                        >
                                          Finalized
                                        </Badge>
                                      )
                                    ) : att.status === "IN_PROGRESS" ? (
                                      <Badge
                                        variant="outline"
                                        className="rounded-lg text-xs font-semibold border-amber-500/40 text-amber-600 bg-amber-500/10"
                                      >
                                        In Progress
                                      </Badge>
                                    ) : att.status === "DISQUALIFIED" ? (
                                      <Badge
                                        variant="destructive"
                                        className="rounded-lg text-xs font-semibold gap-1"
                                      >
                                        <ShieldAlert className="size-3" />
                                        <span>Disqualified</span>
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="rounded-lg text-xs font-semibold"
                                      >
                                        {att.status}
                                      </Badge>
                                    )}
                                  </TableCell>

                                  {/* Date */}
                                  <TableCell className="px-5 py-4 whitespace-nowrap">
                                    <p className="text-xs font-semibold text-foreground">
                                      {new Intl.DateTimeFormat("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }).format(
                                        new Date(att.submittedAt || att.startedAt)
                                      )}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground font-medium">
                                      {new Intl.DateTimeFormat("en-US", {
                                        hour: "numeric",
                                        minute: "numeric",
                                      }).format(
                                        new Date(att.submittedAt || att.startedAt)
                                      )}
                                    </p>
                                  </TableCell>

                                  {/* Actions */}
                                  <TableCell className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-xl px-2.5 text-xs font-semibold shadow-2xs hover:border-primary/40 hover:text-primary"
                                      >
                                        <Link
                                          href={`/teacher/exams/${att.exam.id}/results`}
                                        >
                                          <span>Results</span>
                                          <ArrowRight className="ml-1 size-3" />
                                        </Link>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile & Tablet Card View (Zero Horizontal Overflow) */}
                      <div className="block lg:hidden divide-y divide-border/60">
                        {filteredAttempts.map((att) => {
                          const isPassed = att.result?.isPassed === true
                          const isFailed = att.result?.isPassed === false

                          return (
                            <div
                              key={att.id}
                              className="p-4 sm:p-5 space-y-3.5 transition-colors hover:bg-muted/15"
                            >
                              {/* Row 1: Student and Status */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar className="size-9 shrink-0 rounded-xl border border-border/70">
                                    <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-bold text-primary">
                                      {getInitials(att.student.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-heading text-sm font-semibold text-foreground truncate">
                                      {att.student.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium truncate">
                                      {att.student.email}
                                    </p>
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <div>
                                  {att.status === "COMPLETED" ? (
                                    isPassed ? (
                                      <Badge
                                        variant="default"
                                        className="rounded-lg bg-emerald-600 text-white text-[11px] font-semibold gap-1"
                                      >
                                        <CheckCircle2 className="size-3" />
                                        <span>Passed</span>
                                      </Badge>
                                    ) : isFailed ? (
                                      <Badge
                                        variant="destructive"
                                        className="rounded-lg text-[11px] font-semibold gap-1"
                                      >
                                        <XCircle className="size-3" />
                                        <span>Failed</span>
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="secondary"
                                        className="rounded-lg text-[11px] font-semibold"
                                      >
                                        Finalized
                                      </Badge>
                                    )
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="rounded-lg text-[11px] font-semibold"
                                    >
                                      {att.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Row 2: Exam Title */}
                              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                <p className="font-heading text-xs font-bold text-foreground">
                                  {att.exam.title}
                                </p>
                                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40 text-xs font-medium">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="size-3 text-primary" />
                                    <span>{att.exam.durationMinutes} min</span>
                                    <span>•</span>
                                    <span>Attempt #{att.attemptNumber}</span>
                                  </div>
                                  {att.result && (
                                    <span className="font-heading font-bold text-foreground">
                                      Score: {att.result.obtainedMarks} /{" "}
                                      {att.result.totalMarks} (
                                      {Math.round(att.result.accuracy)}%)
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Row 3: Accuracy breakdown and action button */}
                              <div className="flex items-center justify-between gap-3 pt-1">
                                <span className="text-xs text-muted-foreground font-medium">
                                  {new Intl.DateTimeFormat("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                  }).format(
                                    new Date(att.submittedAt || att.startedAt)
                                  )}
                                </span>

                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="h-8 rounded-xl px-3 text-xs font-semibold shadow-2xs hover:border-primary/40"
                                >
                                  <Link
                                    href={`/teacher/exams/${att.exam.id}/results`}
                                  >
                                    <span>Exam Results</span>
                                    <ArrowRight className="ml-1 size-3" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* TAB 2: ASSESSMENT TRACKS / COHORTS */}
            <TabsContent value="cohorts" className="mt-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {exams.map((ex) => {
                  const examAttempts = attempts.filter((a) => a.exam.id === ex.id)
                  const completedCount = examAttempts.filter(
                    (a) => a.status === "COMPLETED"
                  ).length
                  const passedCount = examAttempts.filter(
                    (a) => a.result?.isPassed === true
                  ).length
                  const examPassRate =
                    completedCount > 0
                      ? Math.round((passedCount / completedCount) * 100)
                      : 0

                  let examTotalScore = 0
                  let examScoredCount = 0
                  let examTopScore = 0

                  examAttempts.forEach((a) => {
                    if (a.result) {
                      examTotalScore += a.result.obtainedMarks
                      examScoredCount++
                      if (a.result.obtainedMarks > examTopScore) {
                        examTopScore = a.result.obtainedMarks
                      }
                    }
                  })

                  return (
                    <div
                      key={ex.id}
                      className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between gap-2.5">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs">
                            <BookOpen className="size-5" />
                          </span>
                          <Badge
                            variant={
                              ex.status === "PUBLISHED" ? "default" : "secondary"
                            }
                            className="rounded-lg text-[11px] font-semibold"
                          >
                            {ex.status === "PUBLISHED" ? "Published" : "Draft"}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-heading text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {ex.title}
                          </h3>
                          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3" />
                              <span>{ex.durationMinutes} min</span>
                            </span>
                            <span>•</span>
                            <span>{ex.questionsCount} questions</span>
                          </p>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Submissions
                            </p>
                            <p className="mt-0.5 font-heading text-base font-extrabold text-foreground">
                              {ex.attemptsCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Pass Rate
                            </p>
                            <p className="mt-0.5 font-heading text-base font-extrabold text-foreground">
                              {examPassRate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Top Score
                            </p>
                            <p className="mt-0.5 font-heading text-base font-extrabold text-foreground">
                              {examTopScore}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/50 pt-3.5">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                        >
                          <Link href={`/teacher/exams/${ex.id}`}>
                            <span>Edit Exam</span>
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl px-3 text-xs font-semibold shadow-2xs hover:border-primary/40 hover:text-primary"
                        >
                          <Link href={`/teacher/exams/${ex.id}/results`}>
                            <span>Full Results</span>
                            <ArrowRight className="ml-1 size-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            {/* TAB 3: LEADERBOARD & TOP SCORERS */}
            <TabsContent value="leaderboard" className="mt-0">
              <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
                <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 shadow-2xs dark:bg-amber-500/15 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Trophy className="size-4.5 sm:size-5.5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                        Hall of Fame &amp; Top Scorers
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                        Highest scoring candidates ranked by obtained marks and question accuracy
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className="self-start sm:self-auto rounded-lg border border-border/60 px-2.5 py-1 text-xs font-semibold gap-1.5 shrink-0"
                  >
                    <Medal className="size-3.5 text-amber-500" />
                    <span>Top {leaderboardPerformers.length} Performers</span>
                  </Badge>
                </div>

                <div className="p-4 sm:p-6 lg:p-7">
                  {leaderboardPerformers.length === 0 ? (
                    <Empty className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Trophy />
                        </EmptyMedia>
                        <EmptyTitle className="text-base font-bold">
                          No scored attempts yet
                        </EmptyTitle>
                        <EmptyDescription>
                          Scores will appear here once candidates complete your assessments.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {leaderboardPerformers.map((performer, idx) => {
                        const isRank1 = idx === 0
                        const isRank2 = idx === 1
                        const isRank3 = idx === 2

                        return (
                          <div
                            key={performer.id}
                            className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                              isRank1
                                ? "border-amber-500/50 bg-amber-500/5 shadow-xs"
                                : isRank2
                                  ? "border-slate-400/50 bg-slate-500/5 shadow-xs"
                                  : isRank3
                                    ? "border-amber-700/40 bg-amber-700/5 shadow-xs"
                                    : "border-border/60 bg-muted/15 hover:bg-muted/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                    isRank1
                                      ? "bg-amber-500 text-white shadow-2xs"
                                      : isRank2
                                        ? "bg-slate-400 text-white shadow-2xs"
                                        : isRank3
                                          ? "bg-amber-700 text-white shadow-2xs"
                                          : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  #{idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-heading text-sm font-bold text-foreground truncate">
                                    {performer.student.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-medium truncate">
                                    {performer.student.email}
                                  </p>
                                </div>
                              </div>

                              {isRank1 && (
                                <Badge className="bg-amber-500 text-white border-none text-[10px] px-2 py-0.5">
                                  Champion
                                </Badge>
                              )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {performer.exam.title}
                              </p>
                              <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-muted-foreground">
                                  Accuracy: {Math.round(performer.result?.accuracy ?? 0)}%
                                </span>
                                <span className="font-heading font-extrabold text-foreground">
                                  {performer.result?.obtainedMarks} / {performer.result?.totalMarks} Marks
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── RIGHT STICKY SIDEBAR (4 Columns on lg/xl, strictly matching /teacher/exams/new) ── */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 min-w-0">
          {/* Card 1: Cohort Health Overview */}
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cohort Evaluation
                </span>
                <Badge variant="secondary" className="font-bold text-xs px-2.5 py-0.5 rounded-full border border-border/60">
                  Live
                </Badge>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-foreground mt-1.5 line-clamp-1">
                Evaluation Summary
              </h3>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 space-y-4">
              <div className="divide-y divide-border/60 text-sm">
                <div className="flex items-center justify-between py-2.5 first:pt-0">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Users className="size-4 text-blue-500" />
                    <span>Total Candidates</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {stats.uniqueStudents}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>Pass Rate</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.passRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="size-4 text-indigo-500" />
                    <span>Mean Accuracy</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {stats.avgAccuracy}%
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Trophy className="size-4 text-amber-500" />
                    <span>Top Score</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {Math.round(stats.highestScore)} pts
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5 last:pb-0">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <span>In Progress</span>
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {stats.inProgress} active
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-2">
                <Button
                  onClick={handleExportCsv}
                  disabled={filteredAttempts.length === 0}
                  className="w-full h-11 rounded-xl text-sm font-bold shadow-xs gap-2"
                >
                  <Download className="size-4" />
                  <span>Download Report (CSV)</span>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full h-10 rounded-xl text-xs sm:text-sm font-semibold border-border/70 hover:bg-muted"
                >
                  <Link href="/teacher/exams">
                    <span>Manage Assessments</span>
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Card 2: Authored Assessments Quick Directory */}
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Assessments
              </span>
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-border/70">
                {exams.length}
              </Badge>
            </div>

            <div className="p-3 sm:p-4 space-y-2">
              {exams.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No assessments created yet.
                </p>
              ) : (
                exams.slice(0, 5).map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelectedExamId(ex.id)
                      setActiveTab("roster")
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      selectedExamId === ex.id
                        ? "border-primary/50 bg-primary/5 shadow-2xs"
                        : "border-border/60 bg-muted/15 hover:bg-muted/30"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-heading text-xs font-bold text-foreground line-clamp-1">
                        {ex.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                        {ex.attemptsCount} submissions • {ex.durationMinutes} min
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </button>
                ))
              )}

              {exams.length > 5 && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-semibold text-primary hover:bg-primary/10"
                >
                  <Link href="/teacher/exams">
                    <span>View all {exams.length} exams →</span>
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
