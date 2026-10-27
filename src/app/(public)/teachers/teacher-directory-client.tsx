"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  GraduationCap,
  HelpCircle,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

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
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* ================= AMBIENT RADIANT GLOW ================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-[440px] w-full -translate-x-1/2 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.25),transparent_70%)]"
      />

      {/* ================= HERO HEADER: EXECUTIVE FACULTY SUITE ================= */}
      <div className="flex flex-col justify-between gap-8 pb-10 lg:flex-row lg:items-end">
        {/* Left: Headline & Narrative */}
        <div className="max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary shadow-xs ring-1 ring-primary/20">
            <GraduationCap className="size-4" />
            <span>Academic Faculty & Examination Board</span>
          </div>

          <h1 className="font-heading text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Teacher Directory
          </h1>

          <p className="text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
            Browse verified academic examiners, inspect question bank
            repositories, and explore official timed examination tracks.
          </p>
        </div>

        {/* Right: 3 Rich Executive Metric Tiles */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:w-auto">
          {/* Metric 1 */}
          <div className="group flex flex-col justify-between rounded-2xl bg-card/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] sm:p-5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                Faculty
              </span>
              <span className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 sm:size-8">
                <Users className="size-3.5 sm:size-4" />
              </span>
            </div>
            <div className="mt-2.5">
              <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {stats.totalTeachers}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                Registered
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="group flex flex-col justify-between rounded-2xl bg-card/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] sm:p-5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                Verified
              </span>
              <span className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 sm:size-8">
                <ShieldCheck className="size-3.5 sm:size-4" />
              </span>
            </div>
            <div className="mt-2.5">
              <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {stats.verifiedTeachers}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-primary">
                Accredited
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="group flex flex-col justify-between rounded-2xl bg-card/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] sm:p-5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                Exams
              </span>
              <span className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 sm:size-8">
                <Sparkles className="size-3.5 sm:size-4" />
              </span>
            </div>
            <div className="mt-2.5">
              <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {stats.totalPublishedExams}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                Published
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FLOATING LUXURY TOOLBAR: SMOOTH SHADOW ISLAND ================= */}
      <div className="my-8">
        <div className="flex flex-col items-stretch justify-between gap-4 rounded-3xl bg-card/90 p-2.5 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-3 md:flex-row md:items-center dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.3)]">
          {/* Seamless Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4.5 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by teacher name, email, subject, or exam title..."
              className="h-14 w-full rounded-2xl bg-muted/30 pr-12 pl-12 text-base font-medium text-foreground transition-all placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/25 focus:outline-none sm:h-15 sm:pl-13 sm:text-lg"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Smooth Filter Segmented Control */}
          <div className="flex w-full shrink-0 items-center gap-1.5 rounded-2xl bg-muted/40 p-1.5 md:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-center text-sm font-bold transition-all sm:flex-none sm:px-6 sm:py-3 sm:text-base ${
                statusFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              All ({teachers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("VERIFIED")}
              className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-center text-sm font-bold transition-all sm:flex-none sm:px-6 sm:py-3 sm:text-base ${
                statusFilter === "VERIFIED"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              Verified ({stats.verifiedTeachers})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-center text-sm font-bold transition-all sm:flex-none sm:px-6 sm:py-3 sm:text-base ${
                statusFilter === "PENDING"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              Pending ({stats.totalTeachers - stats.verifiedTeachers})
            </button>
          </div>
        </div>
      </div>

      {/* ================= TEACHERS LIST GRID ================= */}
      <div>
        {filteredTeachers.length === 0 ? (
          <div className="rounded-3xl bg-card p-12 text-center shadow-[0_12px_40px_-10px_rgba(0,0,0,0.05)] sm:p-16 dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.25)]">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-muted/40 text-muted-foreground">
              <Users className="size-8" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              No teachers found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              No registered faculty match &ldquo;{searchTerm}&rdquo; with the
              current filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("ALL")
              }}
              className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 sm:text-base"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-7 lg:grid-cols-2 lg:gap-8">
            {filteredTeachers.map((teacher) => {
              const joinedFormatted = new Intl.DateTimeFormat("en-US", {
                month: "short",
                year: "numeric",
              }).format(new Date(teacher.createdAt))

              return (
                <div
                  key={teacher.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-card p-6 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] sm:p-8 lg:p-9 dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]"
                >
                  {/* Subtle radiant ambient top highlight */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <div className="space-y-6">
                    {/* ================= 1. CARD HEADER: AVATAR, NAME, CREDENTIALS & STATUS ================= */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                        {/* High-End Avatar with Glow & Status Indicator */}
                        <div className="relative shrink-0">
                          <div className="flex size-18 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 font-heading text-2xl font-black text-primary shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] ring-4 ring-primary/10 sm:size-20 sm:rounded-3xl sm:text-3xl">
                            {teacher.initials}
                          </div>
                          <span
                            className="absolute right-0.5 bottom-0.5 size-3.5 rounded-full border-2 border-card bg-primary shadow-xs"
                            title="Faculty Member"
                          />
                        </div>

                        {/* Name, Designation & Tenure */}
                        <div className="min-w-0 space-y-1">
                          <h2 className="truncate font-heading text-2xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                            {teacher.name}
                          </h2>
                          <p className="truncate text-sm font-medium text-muted-foreground sm:text-base">
                            {teacher.email}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground/80">
                            Faculty Member · Joined {joinedFormatted}
                          </p>
                        </div>
                      </div>

                      {/* Verification Status Pill */}
                      {teacher.isVerified ? (
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary shadow-xs ring-1 ring-primary/20 sm:text-sm">
                          <ShieldCheck className="size-4 stroke-[2.5]" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground sm:text-sm">
                          <Clock className="size-4 stroke-[2.5]" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>

                    {/* ================= 2. ACADEMIC SPECIALIZATION SUBJECTS ================= */}
                    {teacher.subjects.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {teacher.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-muted/35 px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 sm:text-sm"
                          >
                            <span className="size-1.5 rounded-full bg-primary/60" />
                            <span>{subject}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ================= 3. SCULPTED 3-TILE KPI METRICS SYSTEM (DEEP & MODERN) ================= */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      {/* Tile 1: Published Exams */}
                      <div className="group/tile flex flex-col justify-between rounded-2xl bg-muted/30 p-4 transition-all duration-300 hover:bg-muted/50 hover:shadow-xs sm:p-5 dark:bg-muted/15">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                            Exams
                          </span>
                          <span className="flex size-7 items-center justify-center rounded-xl bg-card text-primary shadow-2xs transition-transform duration-300 group-hover/tile:scale-110 sm:size-8">
                            <FileSpreadsheet className="size-3.5 sm:size-4" />
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                            {teacher.publishedExamsCount}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground sm:text-xs">
                            Active &amp; Scheduled
                          </p>
                        </div>
                      </div>

                      {/* Tile 2: Questions Authored */}
                      <div className="group/tile flex flex-col justify-between rounded-2xl bg-muted/30 p-4 transition-all duration-300 hover:bg-muted/50 hover:shadow-xs sm:p-5 dark:bg-muted/15">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                            Questions
                          </span>
                          <span className="flex size-7 items-center justify-center rounded-xl bg-card text-primary shadow-2xs transition-transform duration-300 group-hover/tile:scale-110 sm:size-8">
                            <HelpCircle className="size-3.5 sm:size-4" />
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                            {teacher.totalQuestions}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground sm:text-xs">
                            Authoring Vault
                          </p>
                        </div>
                      </div>

                      {/* Tile 3: Test Takers */}
                      <div className="group/tile flex flex-col justify-between rounded-2xl bg-muted/30 p-4 transition-all duration-300 hover:bg-muted/50 hover:shadow-xs sm:p-5 dark:bg-muted/15">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                            Takers
                          </span>
                          <span className="flex size-7 items-center justify-center rounded-xl bg-card text-primary shadow-2xs transition-transform duration-300 group-hover/tile:scale-110 sm:size-8">
                            <Users className="size-3.5 sm:size-4" />
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                            {teacher.totalAttempts}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground sm:text-xs">
                            Submissions
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ================= 4. PUBLISHED EXAMS ACCREDITED TRACKS ================= */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-extrabold tracking-wider text-muted-foreground uppercase sm:text-sm">
                        <span className="flex items-center gap-2">
                          <BookOpenCheck className="size-4 text-primary" />
                          <span>Published Assessment Tracks</span>
                        </span>
                        <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-bold text-foreground">
                          {teacher.publishedExams.length}
                        </span>
                      </div>

                      {teacher.publishedExams.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 rounded-2xl bg-muted/15 p-5 text-center text-sm font-medium text-muted-foreground">
                          <span>
                            No public examination tracks scheduled at this
                            moment.
                          </span>
                        </div>
                      ) : (
                        <div className="max-h-56 scrollbar-none space-y-2.5 overflow-y-auto pr-1">
                          {teacher.publishedExams.map((exam) => (
                            <div
                              key={exam.id}
                              className="group/item flex items-center justify-between rounded-2xl bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40 hover:shadow-sm"
                            >
                              <div className="min-w-0 flex-1 pr-3">
                                <h4 className="truncate text-base font-bold text-foreground transition-colors group-hover/item:text-primary">
                                  {exam.title}
                                </h4>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="size-3.5 text-muted-foreground" />
                                    <span>{exam.durationMinutes} min</span>
                                  </span>
                                  <span>•</span>
                                  <span>{exam.questionsCount} questions</span>
                                  <span>•</span>
                                  <span className="font-medium text-foreground">
                                    {exam.attemptsCount} test takers
                                  </span>
                                </div>
                              </div>
                              <Link
                                href={`/login?callbackUrl=/exams`}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary shadow-xs transition-all hover:bg-primary hover:text-primary-foreground sm:text-sm"
                              >
                                <span>Enter</span>
                                <ArrowRight className="size-3.5" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= 5. FOOTER ACTION: LARGE PROMINENT BUTTON ================= */}
                  <div className="mt-8 pt-2">
                    <Link
                      href={`/register?role=student`}
                      className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground shadow-[0_8px_25px_-5px_rgba(15,118,110,0.35)] transition-all hover:bg-primary/95 hover:shadow-[0_12px_30px_-5px_rgba(15,118,110,0.45)] active:scale-[0.99] sm:h-14 sm:text-lg"
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
