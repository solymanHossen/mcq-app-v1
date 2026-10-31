"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Calendar,
  Check,
  Clock,
  Copy,
  FileSpreadsheet,
  GraduationCap,
  HelpCircle,
  Mail,
  ShieldCheck,
  FileText,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input"
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
    <div className="w-full space-y-6 sm:space-y-8">
      {/* ================= HERO CARD: ALIGNED WITH /teacher/exams/new ================= */}
      <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 lg:p-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          {/* Left: Heading & Narrative */}
          <div className="space-y-2.5 min-w-0">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
              >
                <GraduationCap className="size-3.5 text-primary" />
                <span>Academic Faculty &amp; Examination Board</span>
              </Badge>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Teacher Directory
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Browse verified academic examiners, inspect question bank repositories, and explore official timed examination tracks.
            </p>
          </div>

          {/* Right: Metric Tiles (Matching /teacher/exams/new choice tiles) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            {/* Faculty */}
            <div className="flex items-center gap-2.5 rounded-xl sm:rounded-2xl border border-border/60 bg-muted/20 px-3.5 py-2.5 shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
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
            <div className="flex items-center gap-2.5 rounded-xl sm:rounded-2xl border border-border/60 bg-muted/20 px-3.5 py-2.5 shadow-2xs hover:border-emerald-500/40 hover:bg-muted/30 transition-all">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs ring-1 ring-emerald-500/20">
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
            <div className="flex items-center gap-2.5 rounded-xl sm:rounded-2xl border border-border/60 bg-muted/20 px-3.5 py-2.5 shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
                <FileText className="size-4" />
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
            <div className="flex items-center gap-2.5 rounded-xl sm:rounded-2xl border border-border/60 bg-muted/20 px-3.5 py-2.5 shadow-2xs hover:border-indigo-500/40 hover:bg-muted/30 transition-all">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20">
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
      </Card>

      {/* ================= SEARCH & FILTER TOOLBAR ================= */}
      <Card className="rounded-2xl border border-border/70 bg-card p-2 sm:p-2.5 gap-0 py-0 shadow-xs">
        <div className="flex flex-col gap-2.5 sm:gap-3 md:flex-row md:items-center">
          {/* Debounced Search Input */}
          <div className="flex-1">
            <DebouncedSearchInput
              syncUrl={false}
              defaultValue={searchTerm}
              onSearch={setSearchTerm}
              placeholder="Search faculty, exams, subjects..."
              className="w-full"
              inputClassName="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-input/60 bg-muted/20 px-4 text-sm sm:text-base focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/25"
            />
          </div>

          {/* Filter Segmented Control (Matching /teacher/exams tabs list dock) */}
          <div className="flex w-full shrink-0 items-center gap-1 rounded-xl border border-border/60 bg-muted/20 p-1 shadow-2xs md:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-center text-xs font-semibold transition-all select-none sm:px-4 sm:text-sm md:flex-none",
                statusFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
              )}
            >
              All ({teachers.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("VERIFIED")}
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-center text-xs font-semibold transition-all select-none sm:px-4 sm:text-sm md:flex-none",
                statusFilter === "VERIFIED"
                  ? "bg-emerald-600 text-white shadow-2xs font-bold"
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
              )}
            >
              Verified ({stats.verifiedTeachers})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-center text-xs font-semibold transition-all select-none sm:px-4 sm:text-sm md:flex-none",
                statusFilter === "PENDING"
                  ? "bg-amber-600 text-white shadow-2xs font-bold"
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
              )}
            >
              Pending ({stats.totalTeachers - stats.verifiedTeachers})
            </button>
          </div>
        </div>
      </Card>

      {/* ================= TEACHERS LIST GRID ================= */}
      <div>
        {filteredTeachers.length === 0 ? (
          <Card className="rounded-2xl border border-border/70 bg-card p-8 sm:p-12 text-center shadow-xs gap-0">
            <div className="mx-auto mb-4 flex size-12 sm:size-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
              <Users className="size-6 sm:size-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
              No teachers found
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-muted-foreground font-medium">
              No registered faculty match &ldquo;{searchTerm}&rdquo; with the current filter criteria.
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("ALL")
                }}
                className="rounded-xl px-5 sm:px-6 text-sm font-semibold shadow-xs"
              >
                Reset Search &amp; Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {filteredTeachers.map((teacher) => {
              const joinedFormatted = new Intl.DateTimeFormat("en-US", {
                month: "short",
                year: "numeric",
              }).format(new Date(teacher.createdAt))

              const isEmailCopied = copiedEmailId === teacher.id

              return (
                <Card
                  key={teacher.id}
                  className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between group"
                >
                  {/* ================= 1. CARD HEADER ================= */}
                  <div className="px-4 sm:px-6 py-4 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <Avatar className="size-13 sm:size-15 rounded-xl sm:rounded-2xl ring-1 ring-primary/20 bg-primary/10">
                          <AvatarFallback className="bg-primary/10 font-heading text-base sm:text-lg font-extrabold tracking-tight text-primary">
                            {teacher.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-card shadow-xs",
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
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate font-heading text-base sm:text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                            {teacher.name}
                          </h2>
                          <Badge
                            variant="secondary"
                            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold border border-border/60"
                          >
                            Faculty
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(teacher.email, teacher.id)}
                            className="group/copy inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2 py-0.5 text-xs font-medium transition-colors hover:bg-muted/70 hover:text-foreground"
                            title="Click to copy email address"
                          >
                            <Mail className="size-3 text-muted-foreground transition-colors group-hover/copy:text-primary" />
                            <span className="truncate max-w-[130px] sm:max-w-none">{teacher.email}</span>
                            {isEmailCopied ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3 opacity-0 transition-opacity group-hover/copy:opacity-70" />
                            )}
                          </button>

                          <span className="text-muted-foreground/40">•</span>

                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <Calendar className="size-3 text-muted-foreground" />
                            <span>Joined {joinedFormatted}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0">
                      {teacher.isVerified ? (
                        <Badge
                          variant="secondary"
                          className="rounded-full px-2.5 py-1 text-xs font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 shadow-2xs"
                        >
                          <ShieldCheck className="size-3.5 stroke-[2.5]" />
                          <span>Verified</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="rounded-full px-2.5 py-1 text-xs font-bold border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 shadow-2xs"
                        >
                          <Clock className="size-3.5 stroke-[2.5]" />
                          <span>Pending</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* ================= 2. CARD CONTENT ================= */}
                  <div className="p-4 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Academic Specialization Subjects */}
                      {teacher.subjects.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {teacher.subjects.map((subject) => (
                            <span
                              key={subject}
                              className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-border/60 bg-muted/20 px-2.5 py-1 text-xs font-medium text-foreground/90 transition-colors hover:bg-muted/40 hover:border-primary/30"
                            >
                              <BookOpen className="size-3 text-primary shrink-0" />
                              <span className="truncate max-w-[180px]">{subject}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 3-Tile KPI Metrics System */}
                      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                        {/* Tile 1: Published Exams */}
                        <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border/60 bg-muted/20 p-3 sm:p-3.5 transition-all duration-200 hover:border-primary/40 hover:bg-muted/30">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                              Exams
                            </span>
                            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
                              <FileSpreadsheet className="size-3.5" />
                            </span>
                          </div>
                          <div className="mt-2.5">
                            <p className="font-heading text-xl sm:text-2xl font-black tracking-tight text-foreground">
                              {teacher.publishedExamsCount}
                            </p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                              Scheduled
                            </p>
                          </div>
                        </div>

                        {/* Tile 2: Question Vault */}
                        <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border/60 bg-muted/20 p-3 sm:p-3.5 transition-all duration-200 hover:border-indigo-500/40 hover:bg-muted/30">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                              Questions
                            </span>
                            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/20">
                              <HelpCircle className="size-3.5" />
                            </span>
                          </div>
                          <div className="mt-2.5">
                            <p className="font-heading text-xl sm:text-2xl font-black tracking-tight text-foreground">
                              {teacher.totalQuestions}
                            </p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                              Bank Vault
                            </p>
                          </div>
                        </div>

                        {/* Tile 3: Student Submissions */}
                        <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border/60 bg-muted/20 p-3 sm:p-3.5 transition-all duration-200 hover:border-emerald-500/40 hover:bg-muted/30">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                              Takers
                            </span>
                            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 shadow-2xs ring-1 ring-emerald-500/20">
                              <Users className="size-3.5" />
                            </span>
                          </div>
                          <div className="mt-2.5">
                            <p className="font-heading text-xl sm:text-2xl font-black tracking-tight text-foreground">
                              {teacher.totalAttempts}
                            </p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                              Submissions
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Published Assessment Tracks */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold tracking-wider text-muted-foreground uppercase">
                          <span className="flex items-center gap-1.5">
                            <BookOpenCheck className="size-3.5 text-primary" />
                            <span>Published Assessment Tracks</span>
                          </span>
                          <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px] font-bold border border-border/60">
                            {teacher.publishedExams.length}
                          </Badge>
                        </div>

                        {teacher.publishedExams.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-4 text-center text-xs sm:text-sm text-muted-foreground font-medium">
                            No public examination tracks scheduled at this moment.
                          </div>
                        ) : (
                          <div className="max-h-56 scrollbar-none space-y-2 overflow-y-auto pr-0.5">
                            {teacher.publishedExams.map((exam) => (
                              <div
                                key={exam.id}
                                className="group/exam flex flex-col gap-2 rounded-xl sm:rounded-2xl border border-border/60 bg-muted/20 p-3 sm:p-3.5 transition-all duration-200 hover:border-primary/40 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
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
                                  className="h-8 shrink-0 rounded-xl border-border/70 text-xs font-semibold shadow-2xs hover:bg-muted hover:border-primary/40"
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
                  </div>

                  {/* ================= 3. CARD FOOTER ================= */}
                  <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-border/50 bg-muted/10">
                    <Button
                      asChild
                      size="lg"
                      className="h-10 sm:h-11 w-full rounded-xl text-sm font-semibold shadow-xs"
                    >
                      <Link href="/register?role=student">
                        <span>Register to Take Exams</span>
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

