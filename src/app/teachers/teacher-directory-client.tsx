"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  Layers,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
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

export function TeacherDirectoryClient({ teachers, stats }: TeacherDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "VERIFIED" | "PENDING">("ALL")

  // Filter teachers by search query and verification status
  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((teacher) => {
      // Status filter
      if (statusFilter === "VERIFIED" && !teacher.isVerified) return false
      if (statusFilter === "PENDING" && teacher.isVerified) return false

      // Search term
      const query = searchTerm.toLowerCase().trim()
      if (!query) return true

      const nameMatch = teacher.name.toLowerCase().includes(query)
      const emailMatch = teacher.email.toLowerCase().includes(query)
      const subjectMatch = teacher.subjects.some((s) => s.toLowerCase().includes(query))
      const examMatch = teacher.publishedExams.some((e) => e.title.toLowerCase().includes(query))

      return nameMatch || emailMatch || subjectMatch || examMatch
    })
  }, [teachers, searchTerm, statusFilter])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* ================= HERO HEADER ================= */}
      <div className="relative mx-auto max-w-4xl text-center pb-12 sm:pb-16">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-primary/10 px-5 py-2 text-sm sm:text-base font-semibold text-primary mb-6 shadow-xs">
          <GraduationCap className="size-5" />
          <span>Verified Faculty &amp; Examiners</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
          Teacher Directory
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          Browse certified academic examiners, inspect authored questions, and explore live online exams with automated grading.
        </p>

        {/* ================= REAL NUMBERS METRIC COUNTERS ================= */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 text-center shadow-xs">
            <span className="block font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-foreground">
              {stats.totalTeachers}
            </span>
            <span className="mt-2 block text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Total Teachers
            </span>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 text-center shadow-xs">
            <span className="block font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.verifiedTeachers}
            </span>
            <span className="mt-2 block text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Verified Faculty
            </span>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 text-center shadow-xs">
            <span className="block font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-primary">
              {stats.totalPublishedExams}
            </span>
            <span className="mt-2 block text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Published Exams
            </span>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 text-center shadow-xs">
            <span className="block font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-foreground">
              {stats.totalQuestions}
            </span>
            <span className="mt-2 block text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Question Bank
            </span>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & STATUS FILTER TOOLBAR ================= */}
      <div className="mx-auto max-w-6xl mb-12 space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Big Clean Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by teacher name, email, subject, or exam title..."
              className="w-full rounded-2xl border border-border/90 bg-card py-4 pl-12 pr-12 text-base sm:text-lg font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 shadow-xs transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Clean Segmented Filter Controls */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-border/80 bg-muted/40 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-xl px-4 py-2.5 text-sm sm:text-base font-semibold transition-all ${
                statusFilter === "ALL"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Teachers ({teachers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("VERIFIED")}
              className={`rounded-xl px-4 py-2.5 text-sm sm:text-base font-semibold transition-all ${
                statusFilter === "VERIFIED"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Verified ({stats.verifiedTeachers})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`rounded-xl px-4 py-2.5 text-sm sm:text-base font-semibold transition-all ${
                statusFilter === "PENDING"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending ({stats.totalTeachers - stats.verifiedTeachers})
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm sm:text-base text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground font-bold">{filteredTeachers.length}</strong> of {teachers.length} registered teachers
          </span>
          {stats.totalAttempts > 0 && (
            <span className="font-medium">
              <strong className="text-foreground">{stats.totalAttempts}</strong> total student attempts recorded
            </span>
          )}
        </div>
      </div>

      {/* ================= TEACHERS LIST GRID ================= */}
      <div className="mx-auto max-w-6xl">
        {filteredTeachers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center bg-card/50">
            <Users className="mx-auto size-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-heading text-2xl font-bold text-foreground">
              No teachers found
            </h3>
            <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto">
              No registered teachers match &ldquo;{searchTerm}&rdquo; with the current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("ALL")
              }}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-8 sm:p-9 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl text-card-foreground"
              >
                <div>
                  {/* Card Header: Avatar, Name, and Status Badge */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex size-16 sm:size-18 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-heading text-2xl sm:text-3xl font-extrabold shadow-xs transition-transform duration-300 group-hover:scale-105">
                        {teacher.initials}
                      </div>
                      <div>
                        <h2 className="font-heading text-2xl sm:text-3xl font-black text-foreground group-hover:text-primary transition-colors">
                          {teacher.name}
                        </h2>
                        <p className="text-sm sm:text-base font-medium text-muted-foreground mt-0.5">
                          {teacher.email}
                        </p>
                      </div>
                    </div>

                    {teacher.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                        <ShieldCheck className="size-4 stroke-[2.5]" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 shrink-0">
                        <Clock className="size-4 stroke-[2.5]" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  {/* Authored Subjects from Real Questions */}
                  {teacher.subjects.length > 0 && (
                    <div className="mb-6">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                        Authored Subjects
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {teacher.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="rounded-xl border border-border/80 bg-muted/60 px-3 py-1 text-xs sm:text-sm font-semibold text-foreground"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Real Stats Metrics Strip */}
                  <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 sm:p-5 text-center mb-6">
                    <div>
                      <span className="block font-heading text-2xl sm:text-3xl font-black text-foreground">
                        {teacher.publishedExamsCount}
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-semibold text-muted-foreground">
                        Published Exams
                      </span>
                    </div>

                    <div>
                      <span className="block font-heading text-2xl sm:text-3xl font-black text-foreground">
                        {teacher.totalQuestions}
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-semibold text-muted-foreground">
                        MCQs Authored
                      </span>
                    </div>

                    <div>
                      <span className="block font-heading text-2xl sm:text-3xl font-black text-foreground">
                        {teacher.totalAttempts}
                      </span>
                      <span className="mt-1 block text-xs sm:text-sm font-semibold text-muted-foreground">
                        Test Takers
                      </span>
                    </div>
                  </div>

                  {/* Real Published Exams List */}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
                      Active Examination Programs ({teacher.publishedExams.length})
                    </span>

                    {teacher.publishedExams.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 p-4 text-center text-sm font-medium text-muted-foreground">
                        No published exams at this moment.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {teacher.publishedExams.map((exam) => (
                          <div
                            key={exam.id}
                            className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3.5 transition-colors hover:border-primary/40"
                          >
                            <div className="pr-3">
                              <h4 className="text-sm sm:text-base font-bold text-foreground">
                                {exam.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {exam.durationMinutes} min · {exam.questionsCount} questions · {exam.attemptsCount} attempts
                              </p>
                            </div>
                            <Link
                              href={`/login?callbackUrl=/exams`}
                              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary px-3 py-1.5 text-xs font-bold text-primary hover:text-primary-foreground transition-all"
                            >
                              <span>Enter</span>
                              <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-6 border-t border-border/60">
                  <Link
                    href={`/register?role=student`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground hover:bg-foreground/90 py-3.5 px-6 text-sm sm:text-base font-bold text-background transition-all active:scale-95 shadow-sm"
                  >
                    <span>Register to Take Teacher&apos;s Exams</span>
                    <ArrowRight className="size-4 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= INSTRUCTOR APPLICATION BANNER ================= */}
      <div className="mx-auto max-w-6xl mt-20">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 sm:p-12 shadow-sm text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
            <UserCheck className="size-7" />
          </div>

          <h3 className="font-heading text-3xl sm:text-4xl font-black text-foreground">
            Are you an academic educator?
          </h3>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            Join the platform to author reusable MCQ question banks, schedule secure proctored exams, and leverage instant auto-grading.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-primary hover:bg-primary/90 px-8 py-4 text-base font-bold text-primary-foreground shadow-md transition-all active:scale-95"
            >
              Register as Teacher
            </Link>
            <Link
              href="/#features"
              className="rounded-full border border-border bg-card px-8 py-4 text-base font-bold text-foreground hover:bg-muted transition-all active:scale-95"
            >
              View Platform Features
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
