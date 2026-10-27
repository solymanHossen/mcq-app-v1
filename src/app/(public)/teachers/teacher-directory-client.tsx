"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
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
      {/* ================= AMBIENT GLOW BACKDROP ================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-96 w-full -translate-x-1/2 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(15,118,110,0.12),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(15,118,110,0.22),transparent_70%)]"
      />

      {/* ================= HERO HEADER: AIRY, BORDERLESS, ELEVATED ================= */}
      <div className="flex flex-col justify-between gap-6 pb-8 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary shadow-xs">
            <GraduationCap className="size-4" />
            <span>Academic Faculty & Examination Board</span>
          </div>
          <h1 className="font-heading text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Teacher Directory
          </h1>
          <p className="text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
            Browse verified academic examiners, inspect accredited credentials,
            and explore official examination tracks.
          </p>
        </div>

        {/* Floating Real Metric Capsules with Soft Diffused Shadows */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-2xl bg-card/90 px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <Users className="size-4.5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">
              <strong className="text-base font-black text-foreground">
                {stats.totalTeachers}
              </strong>{" "}
              Teachers
            </span>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-card/90 px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <ShieldCheck className="size-4.5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">
              <strong className="text-base font-black text-foreground">
                {stats.verifiedTeachers}
              </strong>{" "}
              Verified
            </span>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-card/90 px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <Sparkles className="size-4.5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">
              <strong className="text-base font-black text-foreground">
                {stats.totalPublishedExams}
              </strong>{" "}
              Published Exams
            </span>
          </div>
        </div>
      </div>

      {/* ================= FLOATING LUXURY TOOLBAR: SMOOTH SHADOW ISLAND ================= */}
      <div className="my-8">
        <div className="flex flex-col items-stretch justify-between gap-4 rounded-3xl bg-card/90 p-2.5 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-3 md:flex-row md:items-center dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.3)]">
          {/* Large Seamless Search Input */}
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
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-card p-7 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] sm:p-9 dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]"
              >
                {/* Subtle radiant ambient highlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="space-y-6">
                  {/* Card Header: Large Avatar, Name, Email, Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-heading text-xl font-black text-primary shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] ring-4 ring-primary/10 sm:size-20 sm:rounded-3xl sm:text-2xl">
                        {teacher.initials}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h2 className="truncate font-heading text-2xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                          {teacher.name}
                        </h2>
                        <p className="truncate text-sm font-medium text-muted-foreground sm:text-base">
                          {teacher.email}
                        </p>
                      </div>
                    </div>

                    {/* Verification Badges styled with Soft Glow */}
                    {teacher.isVerified ? (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary shadow-xs sm:text-sm">
                        <ShieldCheck className="size-4 stroke-[2.5]" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-xs font-bold text-muted-foreground sm:text-sm">
                        <Clock className="size-4 stroke-[2.5]" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  {/* Authored Subjects — Soft Floating Chips */}
                  {teacher.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-xl bg-muted/40 px-3.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 sm:text-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Large Metrics Showcase (Borderless, Smooth Elevated Surface) */}
                  <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted/20 p-5 text-center sm:rounded-3xl sm:p-6 dark:bg-muted/10">
                    <div>
                      <span className="block font-heading text-3xl leading-none font-black text-foreground sm:text-4xl lg:text-5xl">
                        {teacher.publishedExamsCount}
                      </span>
                      <span className="mt-2 block text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm">
                        Published Exams
                      </span>
                    </div>

                    <div>
                      <span className="block font-heading text-3xl leading-none font-black text-foreground sm:text-4xl lg:text-5xl">
                        {teacher.totalQuestions}
                      </span>
                      <span className="mt-2 block text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm">
                        Questions Authored
                      </span>
                    </div>

                    <div>
                      <span className="block font-heading text-3xl leading-none font-black text-foreground sm:text-4xl lg:text-5xl">
                        {teacher.totalAttempts}
                      </span>
                      <span className="mt-2 block text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm">
                        Test Takers
                      </span>
                    </div>
                  </div>

                  {/* Real Published Exams List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-extrabold tracking-wider text-muted-foreground uppercase sm:text-sm">
                      <span className="flex items-center gap-2">
                        <BookOpen className="size-4 text-primary" />
                        <span>Published Exams</span>
                      </span>
                      <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-bold text-foreground">
                        {teacher.publishedExams.length}
                      </span>
                    </div>

                    {teacher.publishedExams.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 rounded-2xl bg-muted/15 p-5 text-center text-sm font-medium text-muted-foreground">
                        <span>No public exams authored at this moment.</span>
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
                              <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                                {exam.durationMinutes} min ·{" "}
                                {exam.questionsCount} questions ·{" "}
                                {exam.attemptsCount} attempts
                              </p>
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

                {/* Footer Action: Large, Prominent, Elevated Button */}
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
