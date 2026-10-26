"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  Clock,
  Search,
  ShieldCheck,
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

  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((teacher) => {
      if (statusFilter === "VERIFIED" && !teacher.isVerified) return false
      if (statusFilter === "PENDING" && teacher.isVerified) return false

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
      {/* ================= CLEAN HEADER WITH INLINE REAL METRICS ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/60">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Teacher Directory
          </h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground font-medium">
            Browse verified academic examiners and explore active examination tracks.
          </p>
        </div>

        {/* Compact real metric summary pills */}
        <div className="flex flex-wrap items-center gap-2.5 text-sm font-semibold">
          <span className="rounded-full border border-border/80 bg-card px-4 py-1.5 text-foreground shadow-2xs">
            <strong className="text-foreground font-bold">{stats.totalTeachers}</strong> Teachers
          </span>
          <span className="rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-1.5 text-emerald-700 dark:text-emerald-300 shadow-2xs">
            <strong className="font-bold">{stats.verifiedTeachers}</strong> Verified
          </span>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-primary shadow-2xs">
            <strong className="font-bold">{stats.totalPublishedExams}</strong> Published Exams
          </span>
        </div>
      </div>

      {/* ================= SEARCH & STATUS FILTER TOOLBAR ================= */}
      <div className="mt-8 mb-10 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Big Clean Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by teacher name, email, subject, or exam title..."
              className="w-full rounded-2xl border border-border/80 bg-card py-3.5 pl-12 pr-12 text-base font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 shadow-xs transition-all"
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

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-border/80 bg-muted/30 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                statusFilter === "ALL"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({teachers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("VERIFIED")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
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
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                statusFilter === "PENDING"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending ({stats.totalTeachers - stats.verifiedTeachers})
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground font-bold">{filteredTeachers.length}</strong> of {teachers.length} registered teachers
          </span>
          {stats.totalAttempts > 0 && (
            <span>
              <strong className="text-foreground font-semibold">{stats.totalAttempts}</strong> student attempts completed
            </span>
          )}
        </div>
      </div>

      {/* ================= TEACHERS LIST GRID ================= */}
      <div>
        {filteredTeachers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center bg-card/40">
            <Users className="mx-auto size-14 text-muted-foreground/50 mb-3" />
            <h3 className="font-heading text-xl font-bold text-foreground">
              No teachers found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              No registered teachers match &ldquo;{searchTerm}&rdquo; with the current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("ALL")
              }}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-7 sm:p-8 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-lg text-card-foreground"
              >
                <div>
                  {/* Card Header: Avatar, Name, Email, Status */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-heading text-xl font-black shadow-2xs">
                        {teacher.initials}
                      </div>
                      <div>
                        <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {teacher.name}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                          {teacher.email}
                        </p>
                      </div>
                    </div>

                    {teacher.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                        <ShieldCheck className="size-3.5 stroke-[2.5]" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 shrink-0">
                        <Clock className="size-3.5 stroke-[2.5]" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  {/* Authored Subjects */}
                  {teacher.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {teacher.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Real Stats Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/60 bg-muted/20 p-3.5 text-center mb-5">
                    <div>
                      <span className="block font-heading text-xl sm:text-2xl font-bold text-foreground">
                        {teacher.publishedExamsCount}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Published Exams
                      </span>
                    </div>

                    <div>
                      <span className="block font-heading text-xl sm:text-2xl font-bold text-foreground">
                        {teacher.totalQuestions}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Questions Authored
                      </span>
                    </div>

                    <div>
                      <span className="block font-heading text-xl sm:text-2xl font-bold text-foreground">
                        {teacher.totalAttempts}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Test Takers
                      </span>
                    </div>
                  </div>

                  {/* Real Published Exams List */}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
                      Published Exams ({teacher.publishedExams.length})
                    </span>

                    {teacher.publishedExams.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/70 p-3 text-center text-xs font-medium text-muted-foreground">
                        No published exams at this moment.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {teacher.publishedExams.map((exam) => (
                          <div
                            key={exam.id}
                            className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-primary/40"
                          >
                            <div className="pr-2">
                              <h4 className="text-sm font-semibold text-foreground">
                                {exam.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {exam.durationMinutes} min · {exam.questionsCount} questions · {exam.attemptsCount} attempts
                              </p>
                            </div>
                            <Link
                              href={`/login?callbackUrl=/exams`}
                              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary px-2.5 py-1 text-xs font-bold text-primary hover:text-primary-foreground transition-all"
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
                <div className="mt-6 pt-5 border-t border-border/60">
                  <Link
                    href={`/register?role=student`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground hover:bg-foreground/90 py-3 px-5 text-sm font-semibold text-background transition-all active:scale-95 shadow-2xs"
                  >
                    <span>Register to Take Exams</span>
                    <ArrowRight className="size-4 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
