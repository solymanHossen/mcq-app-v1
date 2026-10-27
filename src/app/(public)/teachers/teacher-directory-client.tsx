"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileSpreadsheet,
  GraduationCap,
  HelpCircle,
  Mail,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export function TeacherDirectoryClient({
  teachers,
  stats,
}: TeacherDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<
    "ALL" | "VERIFIED" | "PENDING"
  >("ALL")
  const [copiedEmailId, setCopiedEmailId] = React.useState<string | null>(null)

  function handleCopyEmail(email: string, id: string) {
    navigator.clipboard.writeText(email)
    setCopiedEmailId(id)
    toast.success("Email copied to clipboard")
    setTimeout(() => setCopiedEmailId(null), 2000)
  }

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
    <div className="w-full space-y-8">
      {/* ================= HERO BANNER: MATCHING PROFILE HERO ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all sm:p-8 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        {/* Subtle Radiant Top Accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
        />

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          {/* Left: Heading & Narrative */}
          <div className="space-y-2 sm:space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <GraduationCap className="size-3.5" />
              <span>Academic Faculty &amp; Examination Board</span>
            </div>

            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Teacher Directory
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Browse verified academic examiners, inspect question bank repositories, and explore official timed examination tracks.
            </p>
          </div>

          {/* Right: Executive Metric Chips (Same style as Profile Hero) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Faculty */}
            <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-4" />
              </span>
              <div className="leading-tight">
                <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                  {stats.totalTeachers}
                </span>
                <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Faculty
                </span>
              </div>
            </div>

            {/* Accredited */}
            <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-4" />
              </span>
              <div className="leading-tight">
                <span className="block font-heading text-base font-black text-emerald-600 sm:text-lg dark:text-emerald-400">
                  {stats.verifiedTeachers}
                </span>
                <span className="block text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                  Accredited
                </span>
              </div>
            </div>

            {/* Published Exams */}
            <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div className="leading-tight">
                <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                  {stats.totalPublishedExams}
                </span>
                <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Exams
                </span>
              </div>
            </div>

            {/* Questions */}
            <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <HelpCircle className="size-4" />
              </span>
              <div className="leading-tight">
                <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                  {stats.totalQuestions}
                </span>
                <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Bank
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FLOATING SEARCH & FILTER TOOLBAR ================= */}
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:rounded-3xl sm:p-3.5 md:flex-row md:items-center dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground sm:size-4.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search faculty, exams, subjects..."
            className="h-11 w-full rounded-xl bg-muted/40 pr-10 pl-10 text-sm font-medium text-foreground transition-all placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/25 focus:outline-none sm:h-12 sm:rounded-2xl sm:text-base"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg px-2 py-0.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Segmented Control (Matching ProfileTabs segmented pill dock) */}
        <div className="flex w-full shrink-0 items-center gap-1.5 rounded-xl bg-muted/60 p-1 sm:rounded-2xl sm:p-1.5 md:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-center text-xs font-semibold transition-all duration-200 select-none sm:rounded-xl sm:px-5 sm:text-sm md:flex-none",
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
            )}
          >
            All ({teachers.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("VERIFIED")}
            className={cn(
              "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-center text-xs font-semibold transition-all duration-200 select-none sm:rounded-xl sm:px-5 sm:text-sm md:flex-none",
              statusFilter === "VERIFIED"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
            )}
          >
            Verified ({stats.verifiedTeachers})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("PENDING")}
            className={cn(
              "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-center text-xs font-semibold transition-all duration-200 select-none sm:rounded-xl sm:px-5 sm:text-sm md:flex-none",
              statusFilter === "PENDING"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
            )}
          >
            Pending ({stats.totalTeachers - stats.verifiedTeachers})
          </button>
        </div>
      </div>

      {/* ================= TEACHERS LIST GRID ================= */}
      <div>
        {filteredTeachers.length === 0 ? (
          <div className="rounded-3xl bg-card p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-14 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground">
              <Users className="size-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
              No teachers found
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground sm:text-sm">
              No registered faculty match &ldquo;{searchTerm}&rdquo; with the current filter criteria.
            </p>
            <Button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("ALL")
              }}
              className="mt-6 rounded-xl px-6 text-sm font-semibold shadow-xs"
            >
              Reset Search &amp; Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {filteredTeachers.map((teacher) => {
              const joinedFormatted = new Intl.DateTimeFormat("en-US", {
                month: "short",
                year: "numeric",
              }).format(new Date(teacher.createdAt))

              const isEmailCopied = copiedEmailId === teacher.id

              return (
                <div
                  key={teacher.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7 lg:p-8 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                >
                  {/* Subtle radiant ambient top highlight */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <div className="space-y-6">
                    {/* ================= 1. CARD HEADER: AVATAR, NAME, CREDENTIALS & STATUS ================= */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        {/* Avatar matching Profile Hero with active beacon */}
                        <div className="relative shrink-0">
                          <Avatar className="size-14 ring-2 ring-primary/15 sm:size-16">
                            <AvatarFallback className="bg-primary/10 font-heading text-lg font-extrabold tracking-tight text-primary sm:text-xl">
                              {teacher.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={cn(
                              "absolute right-0 bottom-0 size-3 rounded-full border-2 border-card shadow-xs",
                              teacher.isVerified ? "bg-emerald-500" : "bg-amber-500"
                            )}
                            title={
                              teacher.isVerified
                                ? "Verified Faculty"
                                : "Pending Verification"
                            }
                          />
                        </div>

                        {/* Name, Email Pill & Joined */}
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate font-heading text-lg font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
                              {teacher.name}
                            </h2>
                            <Badge
                              variant="secondary"
                              className="rounded-lg px-2 py-0.5 text-xs font-semibold"
                            >
                              Faculty
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(teacher.email, teacher.id)}
                              className="group/copy inline-flex items-center gap-1.5 rounded-lg bg-muted/40 px-2.5 py-1 font-medium transition-colors hover:bg-muted/70 hover:text-foreground"
                              title="Click to copy email address"
                            >
                              <Mail className="size-3.5 text-muted-foreground transition-colors group-hover/copy:text-primary" />
                              <span className="truncate max-w-[150px] sm:max-w-none">{teacher.email}</span>
                              {isEmailCopied ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3 opacity-0 transition-opacity group-hover/copy:opacity-70" />
                              )}
                            </button>

                            <span className="text-muted-foreground/30">•</span>

                            <span className="inline-flex items-center gap-1 font-medium text-xs text-muted-foreground">
                              <Calendar className="size-3 text-muted-foreground" />
                              <span>Joined {joinedFormatted}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Distinctive Status Pill */}
                      <div className="shrink-0">
                        {teacher.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 shadow-2xs sm:px-3.5 sm:py-1.5 sm:text-sm dark:bg-emerald-500/15 dark:text-emerald-400">
                            <ShieldCheck className="size-3.5 stroke-[2.5]" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 shadow-2xs sm:px-3.5 sm:py-1.5 sm:text-sm dark:bg-amber-500/15 dark:text-amber-400">
                            <Clock className="size-3.5 stroke-[2.5]" />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ================= 2. ACADEMIC SPECIALIZATION SUBJECTS ================= */}
                    {teacher.subjects.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {teacher.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground/90 transition-colors hover:bg-muted/90"
                          >
                            <BookOpen className="size-3 text-primary" />
                            <span>{subject}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ================= 3. SCULPTED 3-TILE KPI METRICS SYSTEM ================= */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                      {/* Tile 1: Published Exams */}
                      <div className="flex flex-col justify-between rounded-2xl bg-muted/30 p-3.5 sm:p-4 transition-all duration-200 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                            Exams
                          </span>
                          <span className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileSpreadsheet className="size-3.5 sm:size-4" />
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <p className="font-heading text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
                            {teacher.publishedExamsCount}
                          </p>
                          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                            Scheduled
                          </p>
                        </div>
                      </div>

                      {/* Tile 2: Question Vault */}
                      <div className="flex flex-col justify-between rounded-2xl bg-muted/30 p-3.5 sm:p-4 transition-all duration-200 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                            Questions
                          </span>
                          <span className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                            <HelpCircle className="size-3.5 sm:size-4" />
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <p className="font-heading text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
                            {teacher.totalQuestions}
                          </p>
                          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                            Bank Vault
                          </p>
                        </div>
                      </div>

                      {/* Tile 3: Student Submissions */}
                      <div className="flex flex-col justify-between rounded-2xl bg-muted/30 p-3.5 sm:p-4 transition-all duration-200 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                            Takers
                          </span>
                          <span className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                            <Users className="size-3.5 sm:size-4" />
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <p className="font-heading text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
                            {teacher.totalAttempts}
                          </p>
                          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                            Submissions
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ================= 4. PUBLISHED EXAMS ACCREDITED TRACKS ================= */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        <span className="flex items-center gap-1.5">
                          <BookOpenCheck className="size-3.5 text-primary" />
                          <span>Published Assessment Tracks</span>
                        </span>
                        <span className="rounded-full bg-muted/80 px-2 py-0.5 text-xs font-semibold text-foreground">
                          {teacher.publishedExams.length}
                        </span>
                      </div>

                      {teacher.publishedExams.length === 0 ? (
                        <div className="rounded-2xl bg-muted/20 p-4 text-center text-xs sm:text-sm text-muted-foreground">
                          No public examination tracks scheduled at this moment.
                        </div>
                      ) : (
                        <div className="max-h-56 scrollbar-none space-y-2.5 overflow-y-auto pr-0.5">
                          {teacher.publishedExams.map((exam) => (
                            <div
                              key={exam.id}
                              className="group/exam flex flex-col gap-2 rounded-2xl bg-muted/30 p-3.5 transition-all duration-200 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="min-w-0 flex-1">
                                <h4 className="truncate text-sm font-bold text-foreground transition-colors group-hover/exam:text-primary sm:text-base">
                                  {exam.title}
                                </h4>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span className="inline-flex items-center gap-1 font-medium">
                                    <Clock className="size-3 text-primary" />
                                    <span>{exam.durationMinutes} min</span>
                                  </span>
                                  <span>•</span>
                                  <span className="font-medium">
                                    {exam.questionsCount} questions
                                  </span>
                                  <span>•</span>
                                  <span className="font-semibold text-foreground">
                                    {exam.attemptsCount} takers
                                  </span>
                                </div>
                              </div>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 shrink-0 rounded-xl text-xs font-semibold shadow-2xs hover:border-primary/40"
                              >
                                <Link href="/login?callbackUrl=/exams">
                                  <span>Take Exam</span>
                                  <ArrowRight className="ml-1 size-3.5" />
                                </Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= 5. FOOTER ACTION: CLEAN BALANCED CTA ================= */}
                  <div className="mt-6 pt-2 border-t border-border/40">
                    <Button
                      asChild
                      size="lg"
                      className="h-11 sm:h-12 w-full rounded-xl text-sm sm:text-base font-semibold shadow-xs"
                    >
                      <Link href="/register?role=student">
                        <span>Register to Take Exams</span>
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
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

