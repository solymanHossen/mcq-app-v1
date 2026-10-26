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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* ================= CLEAN HEADER WITH REAL INLINE METRICS ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 pb-6 sm:pb-8 border-b border-border">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            Teacher Directory
          </h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-muted-foreground font-medium">
            Browse verified academic examiners and explore active examination tracks.
          </p>
        </div>

        {/* Compact real metric summary pills with fluid mobile/tablet sizing */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm md:text-base font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 sm:px-4.5 py-1.5 sm:py-2 text-foreground shadow-2xs">
            <strong className="font-black text-foreground">{stats.totalTeachers}</strong> Teachers
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 sm:px-4.5 py-1.5 sm:py-2 text-primary shadow-2xs font-bold">
            <strong className="font-black">{stats.verifiedTeachers}</strong> Verified
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3.5 sm:px-4.5 py-1.5 sm:py-2 text-secondary-foreground shadow-2xs font-bold">
            <strong className="font-black">{stats.totalPublishedExams}</strong> Published Exams
          </span>
        </div>
      </div>

      {/* ================= SEARCH & STATUS FILTER TOOLBAR ================= */}
      <div className="mt-6 sm:mt-8 mb-8 sm:mb-10">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          {/* Big Clean Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 sm:size-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by teacher name, email, subject, or exam title..."
              className="w-full rounded-2xl border border-input bg-card py-3 sm:py-3.5 md:py-4 pl-11 sm:pl-12 pr-12 text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-3 focus:ring-ring/40 shadow-xs transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter Tabs using Theme Tokens - Segmented control on mobile */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 sm:p-1.5 rounded-2xl border border-border bg-muted/40 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-xl px-2.5 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-bold transition-all text-center justify-center cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({teachers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("VERIFIED")}
              className={`rounded-xl px-2.5 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-bold transition-all text-center justify-center cursor-pointer ${
                statusFilter === "VERIFIED"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Verified ({stats.verifiedTeachers})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`rounded-xl px-2.5 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-bold transition-all text-center justify-center cursor-pointer ${
                statusFilter === "PENDING"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
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
          <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border p-10 sm:p-16 text-center bg-card">
            <Users className="mx-auto size-12 sm:size-16 text-muted-foreground mb-4" />
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              No teachers found
            </h3>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              No registered teachers match &ldquo;{searchTerm}&rdquo; with the current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("ALL")
              }}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-7 lg:gap-8 lg:grid-cols-2">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="group flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-7 md:p-8 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg text-card-foreground"
              >
                <div>
                  {/* Card Header: Avatar, Name, Email, Status */}
                  <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex size-13 sm:size-15 md:size-16 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary font-heading text-lg sm:text-2xl md:text-3xl font-black shadow-2xs">
                        {teacher.initials}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-black text-foreground group-hover:text-primary transition-colors truncate">
                          {teacher.name}
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-0.5 font-medium truncate">
                          {teacher.email}
                        </p>
                      </div>
                    </div>

                    {/* Verification Badges strictly styled with Theme Palette */}
                    {teacher.isVerified ? (
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-primary shrink-0">
                        <ShieldCheck className="size-3.5 sm:size-4 stroke-[2.5]" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-secondary-foreground shrink-0">
                        <Clock className="size-3.5 sm:size-4 stroke-[2.5]" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  {/* Authored Subjects */}
                  {teacher.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                      {teacher.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-lg sm:rounded-xl border border-border bg-muted/50 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold text-foreground"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Real Stats Metrics Strip using Theme Tokens */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-border bg-muted/30 p-3 sm:p-4 md:p-5 text-center mb-5 sm:mb-6">
                    <div>
                      <span className="block font-heading text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-none">
                        {teacher.publishedExamsCount}
                      </span>
                      <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-muted-foreground mt-1.5 block leading-tight">
                        Published Exams
                      </span>
                    </div>

                    <div>
                      <span className="block font-heading text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-none">
                        {teacher.totalQuestions}
                      </span>
                      <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-muted-foreground mt-1.5 block leading-tight">
                        Questions Authored
                      </span>
                    </div>

                    <div>
                      <span className="block font-heading text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-none">
                        {teacher.totalAttempts}
                      </span>
                      <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-muted-foreground mt-1.5 block leading-tight">
                        Test Takers
                      </span>
                    </div>
                  </div>

                  {/* Real Published Exams List */}
                  <div>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-2 sm:mb-3">
                      Published Exams ({teacher.publishedExams.length})
                    </span>

                    {teacher.publishedExams.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border p-3.5 sm:p-4 text-center text-xs sm:text-sm font-medium text-muted-foreground bg-muted/20">
                        No published exams at this moment.
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-2.5 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
                        {teacher.publishedExams.map((exam) => (
                          <div
                            key={exam.id}
                            className="flex items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-3.5 transition-colors hover:border-primary/50"
                          >
                            <div className="pr-2 sm:pr-3 min-w-0 flex-1">
                              <h4 className="text-sm sm:text-base font-bold text-foreground truncate">
                                {exam.title}
                              </h4>
                              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 truncate">
                                {exam.durationMinutes} min · {exam.questionsCount} questions · {exam.attemptsCount} attempts
                              </p>
                            </div>
                            <Link
                              href={`/login?callbackUrl=/exams`}
                              className="shrink-0 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-primary/20 bg-primary/10 hover:bg-primary px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary-foreground transition-all"
                            >
                              <span>Enter</span>
                              <ArrowRight className="size-3 sm:size-3.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action using Theme Primary */}
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border">
                  <Link
                    href={`/register?role=student`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 py-3 sm:py-3.5 px-4 sm:px-6 text-sm sm:text-base font-bold text-primary-foreground transition-all active:scale-95 shadow-xs"
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
