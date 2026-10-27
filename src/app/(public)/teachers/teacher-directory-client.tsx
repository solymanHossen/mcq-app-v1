"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpenCheck,
  Clock,
  FileSpreadsheet,
  GraduationCap,
  HelpCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface PublishedExamData {
  id: string
  title: string
  description: string | null
  durationMinutes: number
  questionsCount: number
  attemptsCount: number
}

export interface TeacherData {
  id: string
  name: string
  email: string
  initials: string
  isVerified: boolean
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED"
  createdAt: string
  totalExams: number
  publishedExamsCount: number
  totalQuestions: number
  totalAttempts: number
  subjects: string[]
  publishedExams: PublishedExamData[]
}

export interface DirectoryStats {
  totalTeachers: number
  verifiedTeachers: number
  totalPublishedExams: number
  totalQuestions: number
  totalAttempts: number
}

interface TeacherDirectoryClientProps {
  teachers: TeacherData[]
  stats: DirectoryStats
}

function renderVerificationBadge(status: "PENDING" | "VERIFIED" | "REJECTED") {
  switch (status) {
    case "VERIFIED":
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-2xs ring-1 ring-emerald-500/25 sm:px-4 sm:py-2 sm:text-sm dark:bg-emerald-500/15 dark:text-emerald-400">
          <ShieldCheck className="size-4 stroke-[2.5] sm:size-4.5" />
          <span>Verified</span>
        </span>
      )
    case "PENDING":
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 shadow-2xs ring-1 ring-amber-500/25 sm:px-4 sm:py-2 sm:text-sm dark:bg-amber-500/15 dark:text-amber-400">
          <Clock className="size-4 stroke-[2.5] sm:size-4.5" />
          <span>Pending</span>
        </span>
      )
    case "REJECTED":
    default:
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-2xs ring-1 ring-rose-500/25 sm:px-4 sm:py-2 sm:text-sm dark:bg-rose-500/15 dark:text-rose-400">
          <ShieldAlert className="size-4 stroke-[2.5] sm:size-4.5" />
          <span>Rejected</span>
        </span>
      )
  }
}

export function TeacherDirectoryClient({
  teachers,
  stats,
}: TeacherDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<
    "ALL" | "VERIFIED" | "PENDING"
  >("ALL")

  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((teacher) => {
      if (statusFilter === "VERIFIED" && !teacher.isVerified) return false
      if (statusFilter === "PENDING" && teacher.isVerified) return false

      const query = searchTerm.toLowerCase().trim()
      if (!query) return true

      const nameMatch = teacher.name.toLowerCase().includes(query)
      const emailMatch = teacher.email.toLowerCase().includes(query)
      const subjectMatch = teacher.subjects.some((s) =>
        s.toLowerCase().includes(query)
      )
      const examMatch = teacher.publishedExams.some((e) =>
        e.title.toLowerCase().includes(query)
      )

      return nameMatch || emailMatch || subjectMatch || examMatch
    })
  }, [teachers, searchTerm, statusFilter])

  return (
    <div className="relative w-full">
      {/* ================= AMBIENT RADIANT GLOW ================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-[380px] w-full -translate-x-1/2 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.15),transparent_70%)] sm:h-[440px] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.25),transparent_70%)]"
      />

      {/* ================= HERO HEADER: EXECUTIVE FACULTY SUITE ================= */}
      <div className="flex flex-col justify-between gap-6 pb-6 sm:gap-8 sm:pb-10 lg:flex-row lg:items-end">
        {/* Left: Headline & Narrative */}
        <div className="max-w-2xl space-y-2.5 sm:space-y-3.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-wide text-primary shadow-2xs backdrop-blur-md transition-colors hover:bg-primary/10 sm:px-4 sm:py-1.5 sm:text-sm">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
              <GraduationCap className="size-3 sm:size-3.5" />
            </span>
            <span>Academic Faculty &amp; Examination Board</span>
          </div>

          <h1 className="font-heading text-3xl font-black tracking-tight text-foreground min-[420px]:text-4xl sm:text-5xl lg:text-6xl">
            Teacher Directory
          </h1>

          <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base lg:text-lg">
            Browse verified academic examiners, inspect question bank
            repositories, and explore official timed examination tracks.
          </p>
        </div>

        {/* Right: 3 Rich Executive Metric Tiles */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 lg:w-auto">
          {/* Metric 1: Faculty */}
          <div className="group flex flex-col justify-between rounded-xl bg-card/95 p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] sm:rounded-2xl sm:p-5.5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                Faculty
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110 sm:size-9 sm:rounded-xl">
                <Users className="size-3.5 sm:size-4.5" />
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <p className="font-heading text-2xl font-black tracking-tight text-foreground min-[400px]:text-3xl sm:text-4xl">
                {stats.totalTeachers}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground sm:text-sm">
                Registered
              </p>
            </div>
          </div>

          {/* Metric 2: Verified */}
          <div className="group flex flex-col justify-between rounded-xl bg-card/95 p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] sm:rounded-2xl sm:p-5.5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase sm:text-xs dark:text-emerald-400">
                Verified
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 sm:size-9 sm:rounded-xl dark:bg-emerald-500/15 dark:text-emerald-400">
                <ShieldCheck className="size-3.5 sm:size-4.5" />
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <p className="font-heading text-2xl font-black tracking-tight text-emerald-600 min-[400px]:text-3xl sm:text-4xl dark:text-emerald-400">
                {stats.verifiedTeachers}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-emerald-600 sm:text-sm dark:text-emerald-400">
                Accredited
              </p>
            </div>
          </div>

          {/* Metric 3: Published Exams */}
          <div className="group flex flex-col justify-between rounded-xl bg-card/95 p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] sm:rounded-2xl sm:p-5.5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                Exams
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110 sm:size-9 sm:rounded-xl">
                <Sparkles className="size-3.5 sm:size-4.5" />
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <p className="font-heading text-2xl font-black tracking-tight text-foreground min-[400px]:text-3xl sm:text-4xl">
                {stats.totalPublishedExams}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground sm:text-sm">
                Published
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FLOATING LUXURY TOOLBAR: SMOOTH SHADOW ISLAND ================= */}
      <div className="my-6 sm:my-8">
        <div className="flex flex-col items-stretch justify-between gap-3.5 rounded-2xl bg-card/90 p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:gap-4 sm:rounded-3xl sm:p-3 md:flex-row md:items-center dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.3)]">
          {/* Seamless Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground sm:left-4.5 sm:size-5.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search faculty, exams, subjects..."
              className="h-13 w-full rounded-xl bg-muted/30 pr-11 pl-11 text-base font-medium text-foreground transition-all placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/25 focus:outline-none sm:h-15 sm:rounded-2xl sm:pr-14 sm:pl-13 sm:text-lg"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:right-4 sm:px-3 sm:text-sm"
              >
                Clear
              </button>
            )}
          </div>

          {/* Smooth Filter Segmented Control with Dedicated Status Colors */}
          <div className="flex w-full shrink-0 items-center gap-1.5 rounded-xl bg-muted/40 p-1 sm:rounded-2xl sm:p-1.5 md:w-auto">
            {/* Filter ALL */}
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-center text-xs font-bold transition-all sm:flex-none sm:rounded-xl sm:px-6 sm:py-3 sm:text-base",
                statusFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              All ({teachers.length})
            </button>

            {/* Filter VERIFIED (Emerald Active Badge) */}
            <button
              type="button"
              onClick={() => setStatusFilter("VERIFIED")}
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-center text-xs font-bold transition-all sm:flex-none sm:rounded-xl sm:px-6 sm:py-3 sm:text-base",
                statusFilter === "VERIFIED"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/25"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              Verified ({stats.verifiedTeachers})
            </button>

            {/* Filter PENDING (Amber Active Badge) */}
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-center text-xs font-bold transition-all sm:flex-none sm:rounded-xl sm:px-6 sm:py-3 sm:text-base",
                statusFilter === "PENDING"
                  ? "bg-amber-600 text-white shadow-xs shadow-amber-600/25"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              Pending ({stats.totalTeachers - stats.verifiedTeachers})
            </button>
          </div>
        </div>
      </div>

      {/* ================= TEACHERS LIST GRID ================= */}
      <div>
        {filteredTeachers.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:rounded-3xl sm:p-14 dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.25)]">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground sm:mb-5 sm:size-16 sm:rounded-3xl">
              <Users className="size-7 sm:size-8" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground sm:text-2xl">
              No teachers found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground sm:text-base">
              No registered faculty match &ldquo;{searchTerm}&rdquo; with the
              current filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("ALL")
              }}
              className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 sm:mt-6 sm:rounded-2xl sm:px-7 sm:py-3 sm:text-base"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-7 lg:grid-cols-2 lg:gap-8">
            {filteredTeachers.map((teacher) => {
              const joinedFormatted = new Intl.DateTimeFormat("en-US", {
                month: "short",
                year: "numeric",
              }).format(new Date(teacher.createdAt))

              return (
                <div
                  key={teacher.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-card p-4.5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] sm:rounded-[32px] sm:p-7 lg:p-8 dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_22px_55px_-12px_rgba(0,0,0,0.5)]"
                >
                  {/* Subtle radiant ambient top highlight */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <div className="space-y-4.5 sm:space-y-6">
                    {/* ================= 1. CARD HEADER: AVATAR, NAME, CREDENTIALS & STATUS ================= */}
                    <div className="flex items-start justify-between gap-3 sm:gap-5">
                      <div className="flex min-w-0 items-center gap-3.5 sm:gap-5">
                        {/* High-End Avatar with Glow & Dedicated Status Color Indicator Dot */}
                        <div className="relative shrink-0">
                          <div className="flex size-15 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 font-heading text-xl font-black text-primary shadow-[0_4px_16px_rgba(0,0,0,0.06)] ring-2 ring-primary/10 min-[400px]:size-18 min-[400px]:text-2xl sm:size-20 sm:text-3xl sm:ring-4 lg:size-22 lg:text-4xl">
                            {teacher.initials}
                          </div>
                          <span
                            className={cn(
                              "absolute right-0.5 bottom-0.5 size-3.5 rounded-full border-2 border-card shadow-xs sm:size-4",
                              teacher.isVerified
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            )}
                            title={
                              teacher.isVerified
                                ? "Verified Faculty"
                                : "Pending Verification"
                            }
                          />
                        </div>

                        {/* Name, Designation & Tenure */}
                        <div className="min-w-0 space-y-1 sm:space-y-1.5">
                          <h2 className="truncate font-heading text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary min-[400px]:text-2xl sm:text-3xl lg:text-4xl">
                            {teacher.name}
                          </h2>
                          <p className="truncate text-sm font-semibold text-muted-foreground sm:text-base">
                            {teacher.email}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground/80 sm:text-sm">
                            Faculty Member · Joined {joinedFormatted}
                          </p>
                        </div>
                      </div>

                      {/* Distinctive Professional Status Pill (Emerald for Verified, Amber for Pending) */}
                      {renderVerificationBadge(teacher.verificationStatus)}
                    </div>

                    {/* ================= 2. ACADEMIC SPECIALIZATION SUBJECTS (CLEAN MINIMAL TAGS, NO DOTS) ================= */}
                    {teacher.subjects.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        {teacher.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="inline-flex items-center rounded-xl bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground/90 transition-all duration-200 hover:bg-muted/80 hover:text-foreground sm:px-3.5 sm:py-1.5 sm:text-sm"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ================= 3. SCULPTED 3-TILE KPI METRICS SYSTEM ================= */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                      {/* Tile 1: Published Exams (Teal/Primary Tone) */}
                      <div className="group/tile flex flex-col justify-between rounded-xl bg-muted/30 p-3 transition-all duration-300 hover:bg-muted/50 hover:shadow-xs min-[400px]:p-3.5 sm:rounded-2xl sm:p-5 dark:bg-muted/15">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                            Exams
                          </span>
                          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs transition-transform duration-300 group-hover/tile:scale-110 sm:size-8 sm:rounded-xl">
                            <FileSpreadsheet className="size-3.5 sm:size-4" />
                          </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                          <p className="font-heading text-2xl font-black tracking-tight text-foreground min-[400px]:text-3xl sm:text-4xl lg:text-5xl">
                            {teacher.publishedExamsCount}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                            Scheduled
                          </p>
                        </div>
                      </div>

                      {/* Tile 2: Question Vault (Indigo Tone) */}
                      <div className="group/tile flex flex-col justify-between rounded-xl bg-muted/30 p-3 transition-all duration-300 hover:bg-muted/50 hover:shadow-xs min-[400px]:p-3.5 sm:rounded-2xl sm:p-5 dark:bg-muted/15">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                            Questions
                          </span>
                          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 shadow-2xs transition-transform duration-300 group-hover/tile:scale-110 sm:size-8 sm:rounded-xl dark:bg-indigo-500/15 dark:text-indigo-400">
                            <HelpCircle className="size-3.5 sm:size-4" />
                          </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                          <p className="font-heading text-2xl font-black tracking-tight text-foreground min-[400px]:text-3xl sm:text-4xl lg:text-5xl">
                            {teacher.totalQuestions}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                            Question Bank
                          </p>
                        </div>
                      </div>

                      {/* Tile 3: Student Submissions (Sky/Emerald Tone) */}
                      <div className="group/tile flex flex-col justify-between rounded-xl bg-muted/30 p-3 transition-all duration-300 hover:bg-muted/50 hover:shadow-xs min-[400px]:p-3.5 sm:rounded-2xl sm:p-5 dark:bg-muted/15">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                            Takers
                          </span>
                          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 shadow-2xs transition-transform duration-300 group-hover/tile:scale-110 sm:size-8 sm:rounded-xl dark:bg-emerald-500/15 dark:text-emerald-400">
                            <Users className="size-3.5 sm:size-4" />
                          </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                          <p className="font-heading text-2xl font-black tracking-tight text-foreground min-[400px]:text-3xl sm:text-4xl lg:text-5xl">
                            {teacher.totalAttempts}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                            Submissions
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ================= 4. PUBLISHED EXAMS ACCREDITED TRACKS ================= */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between text-xs font-black tracking-wider text-muted-foreground uppercase sm:text-sm lg:text-base">
                        <span className="flex items-center gap-2">
                          <BookOpenCheck className="size-4 text-primary sm:size-5" />
                          <span>Published Assessment Tracks</span>
                        </span>
                        <span className="rounded-full bg-muted/80 px-2.5 py-0.5 text-xs font-bold text-foreground sm:px-3 sm:py-1 sm:text-sm">
                          {teacher.publishedExams.length}
                        </span>
                      </div>

                      {teacher.publishedExams.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/15 p-5 text-center text-sm font-medium text-muted-foreground sm:rounded-2xl sm:p-6 sm:text-base">
                          <span>
                            No public examination tracks scheduled at this
                            moment.
                          </span>
                        </div>
                      ) : (
                        <div className="max-h-60 scrollbar-none space-y-2.5 overflow-y-auto pr-0.5 sm:space-y-3 sm:pr-1">
                          {teacher.publishedExams.map((exam) => (
                            <div
                              key={exam.id}
                              className="group/item flex flex-col gap-2.5 rounded-xl bg-muted/20 p-3.5 transition-all duration-200 hover:bg-muted/40 hover:shadow-xs min-[460px]:flex-row min-[460px]:items-center min-[460px]:justify-between sm:rounded-2xl sm:p-4"
                            >
                              <div className="min-w-0 flex-1 pr-0 min-[460px]:pr-3">
                                <h4 className="truncate text-base font-bold text-foreground transition-colors group-hover/item:text-primary sm:text-lg">
                                  {exam.title}
                                </h4>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-3 sm:text-sm">
                                  <span className="inline-flex items-center gap-1.5 font-medium">
                                    <Clock className="size-3.5 text-muted-foreground sm:size-4" />
                                    <span>{exam.durationMinutes} min</span>
                                  </span>
                                  <span>•</span>
                                  <span className="font-medium">
                                    {exam.questionsCount} questions
                                  </span>
                                  <span>•</span>
                                  <span className="font-semibold text-foreground">
                                    {exam.attemptsCount} test takers
                                  </span>
                                </div>
                              </div>
                              <Link
                                href={`/login?callbackUrl=/exams`}
                                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary shadow-2xs transition-all hover:bg-primary hover:text-primary-foreground min-[460px]:self-auto sm:px-4.5 sm:py-2.5 sm:text-sm"
                              >
                                <span>Enter</span>
                                <ArrowRight className="size-3.5 sm:size-4" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= 5. FOOTER ACTION: LARGE PROMINENT BUTTON ================= */}
                  <div className="mt-7 pt-1 sm:mt-9 sm:pt-2">
                    <Link
                      href={`/register?role=student`}
                      className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-black tracking-wide text-primary-foreground shadow-[0_6px_20px_-4px_rgba(15,118,110,0.35)] transition-all hover:bg-primary/95 hover:shadow-[0_12px_28px_-4px_rgba(15,118,110,0.45)] active:scale-[0.99] sm:h-15 sm:rounded-2xl sm:text-lg lg:text-xl"
                    >
                      <span>Register to Take Exams</span>
                      <ArrowRight className="size-5 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
