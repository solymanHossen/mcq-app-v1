"use client"

import * as React from "react"
import Link from "next/link"
import {
  Clock,
  FileText,
  Users,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Search,
  CheckCircle2,
  Lock,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input"
import { cn } from "@/lib/utils"

export interface PublicExamItem {
  id: string
  title: string
  description: string | null
  durationMinutes: number
  maxAttempts: number
  allowGuestAccess: boolean
  isPublic: boolean
  startTime: string | null
  endTime: string | null
  publishedAt: string | null
  teacherName: string
  teacherEmail: string
  teacherVerified: boolean
  questionsCount: number
  attemptsCount: number
}

interface ExamCatalogClientProps {
  exams: PublicExamItem[]
  totalExamsCount: number
  totalAttemptsCount: number
}

export function ExamCatalogClient({
  exams,
  totalExamsCount,
  totalAttemptsCount,
}: ExamCatalogClientProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterDuration, setFilterDuration] = React.useState<"ALL" | "SHORT" | "LONG">("ALL")

  const filteredExams = React.useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch =
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        exam.teacherName.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchSearch) return false

      if (filterDuration === "SHORT") {
        return exam.durationMinutes <= 30
      }
      if (filterDuration === "LONG") {
        return exam.durationMinutes > 30
      }

      return true
    })
  }, [exams, searchTerm, filterDuration])

  return (
    <div className="w-full space-y-8 sm:space-y-10">
      {/* ================= PAGE HERO & STATS HEADER ================= */}
      <Card className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Globe className="size-3.5" />
              <span>Public Assessments</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Public Examination List
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
              Take live, timed MCQ assessments authored by verified faculty. Instant auto-grading,
              mistake explanations, and competitive leaderboards included.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 shadow-2xs">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20">
                <FileText className="size-5" />
              </span>
              <div>
                <span className="block font-heading text-lg sm:text-xl font-black text-foreground">
                  {totalExamsCount}
                </span>
                <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Published Exams
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 shadow-2xs">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs ring-1 ring-emerald-500/20">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <span className="block font-heading text-lg sm:text-xl font-black text-foreground">
                  {totalAttemptsCount}
                </span>
                <span className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Attempts Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ================= SEARCH & FILTER TOOLBAR ================= */}
      <Card className="rounded-2xl border border-border/70 bg-card p-2 sm:p-2.5 shadow-xs">
        <div className="flex flex-col gap-2.5 sm:gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <DebouncedSearchInput
              syncUrl={false}
              defaultValue={searchTerm}
              onSearch={setSearchTerm}
              placeholder="Search exams by title, subject, or instructor name..."
              className="w-full"
              inputClassName="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-input/60 bg-muted/20 px-4 text-sm sm:text-base focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/25"
            />
          </div>

          <div className="flex w-full shrink-0 items-center gap-1 rounded-xl border border-border/60 bg-muted/20 p-1 shadow-2xs md:w-auto">
            <button
              type="button"
              onClick={() => setFilterDuration("ALL")}
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-center text-xs font-semibold transition-all select-none sm:px-4 sm:text-sm md:flex-none",
                filterDuration === "ALL"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
              )}
            >
              All Durations
            </button>
            <button
              type="button"
              onClick={() => setFilterDuration("SHORT")}
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-center text-xs font-semibold transition-all select-none sm:px-4 sm:text-sm md:flex-none",
                filterDuration === "SHORT"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
              )}
            >
              &le; 30 Mins
            </button>
            <button
              type="button"
              onClick={() => setFilterDuration("LONG")}
              className={cn(
                "flex-1 cursor-pointer rounded-lg px-3.5 py-2 text-center text-xs font-semibold transition-all select-none sm:px-4 sm:text-sm md:flex-none",
                filterDuration === "LONG"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
              )}
            >
              &gt; 30 Mins
            </button>
          </div>
        </div>
      </Card>

      {/* ================= EXAM CARDS GRID ================= */}
      {filteredExams.length === 0 ? (
        <Card className="rounded-2xl border border-border/70 bg-card p-10 text-center shadow-xs">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
            <Search className="size-6" />
          </div>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            No assessments found
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {searchTerm
              ? `No exams matched "${searchTerm}". Try searching for another subject or instructor.`
              : "There are currently no public examinations available."}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="mt-5 rounded-xl h-9.5 px-4 font-semibold cursor-pointer"
            >
              Clear Search Filter
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <Card
              key={exam.id}
              className="group rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Header Strip inside Card matching /teacher/exams/new */}
                <div className="px-5 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {exam.questionsCount} {exam.questionsCount === 1 ? "Question" : "Questions"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {exam.allowGuestAccess ? (
                      <Badge
                        variant="secondary"
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      >
                        <Globe className="size-3 mr-1" />
                        Guest Open
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground border-border/60"
                      >
                        <Lock className="size-3 mr-1" />
                        Auth Required
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {exam.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {exam.description || "Comprehensive timed examination testing critical domain knowledge and problem-solving skills."}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground font-medium">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1">
                      <Clock className="size-3.5 text-primary" />
                      <span>{exam.durationMinutes} mins</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1">
                      <RotateCcw className="size-3.5 text-primary" />
                      <span>{exam.maxAttempts} {exam.maxAttempts === 1 ? "Attempt" : "Attempts"}</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1">
                      <Users className="size-3.5 text-primary" />
                      <span>{exam.attemptsCount} taken</span>
                    </span>
                  </div>

                  {/* Instructor Pill */}
                  <div className="flex items-center gap-2.5 pt-2 border-t border-border/40">
                    <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {exam.teacherName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {exam.teacherName}
                      </span>
                      {exam.teacherVerified && (
                        <span title="Verified Instructor" className="inline-flex shrink-0">
                          <ShieldCheck className="size-3.5 text-emerald-500" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="p-5 sm:p-6 pt-0">
                <Button
                  asChild
                  className="w-full h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 transition-all active:scale-98 gap-2 cursor-pointer"
                >
                  <Link href={`/exam/${exam.id}`}>
                    <span>Enter Assessment</span>
                    <ArrowRight className="size-4 stroke-[2.5]" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
