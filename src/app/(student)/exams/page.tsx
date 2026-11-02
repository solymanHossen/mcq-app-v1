import Link from "next/link"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import type { Prisma, AttemptStatus } from "@/prisma/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import {
  ClipboardListIcon,
  Clock,
  Award,
  ArrowRight,
  BookOpen,
  Calendar,
  RefreshCw,
  ShieldCheck,
  History,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Target,
  Trophy,
  Search,
} from "lucide-react"
import { GuestBanner } from "@/modules/account/components/guest-banner"
import { UpgradeGuestModal } from "@/modules/account/components/upgrade-guest-modal"
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input"
import { PagePagination } from "@/components/shared/page-pagination"
import { cn } from "@/lib/utils"

import { connection } from "next/server"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const PAGE_SIZE = 9

export default async function AvailableExamsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    tab?: string
    q?: string
    status?: string
    page?: string
  }>
}) {
  const user = await requireRole("STUDENT")
  await connection()

  const sp = (await searchParams) ?? {}
  const activeTab = sp.tab === "history" ? "history" : "available"
  const query = sp.q?.trim() ?? ""
  const statusFilter = sp.status ?? "ALL"
  const currentPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)

  // =========================================================================
  // Isolated Guest Candidate Mode: Guest students see the exams shared directly
  // =========================================================================
  if (user.isGuest) {
    const attemptWhere: Prisma.ExamAttemptWhereInput = {
      studentId: user.id,
      ...(query
        ? {
            exam: {
              title: { contains: query, mode: "insensitive" },
            },
          }
        : {}),
    }

    const [totalGuestAttempts, guestAttempts] = await Promise.all([
      prisma.examAttempt.count({ where: attemptWhere }),
      prisma.examAttempt.findMany({
        where: attemptWhere,
        include: {
          exam: true,
          result: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ])

    const guestPageCount = Math.ceil(totalGuestAttempts / PAGE_SIZE)

    return (
      <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
        <GuestBanner name={user.name} email={user.email} />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              My Assessment Exams
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
            >
              <span className="size-1.5 sm:size-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Candidate Restricted</span>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
            >
              {totalGuestAttempts} shared test{totalGuestAttempts === 1 ? "" : "s"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            You are in isolated candidate mode. Only exams shared directly with you via private link appear here.
          </p>
        </div>

        {/* Search bar for guest candidates */}
        <div className="w-full max-w-md">
          <DebouncedSearchInput
            placeholder="Search shared assessments..."
            className="w-full"
          />
        </div>

        {guestAttempts.length === 0 ? (
          <Empty className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-12 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs"
              >
                <ClipboardListIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground mt-2">
                {query ? "No matching exams found" : "No Shared Exams Found"}
              </EmptyTitle>
              <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                {query
                  ? `No shared assessments match "${query}". Try another search keyword.`
                  : "You haven't started any exams yet. Please use the direct exam link shared by your teacher."}
              </EmptyDescription>
            </EmptyHeader>
            {query && (
              <EmptyContent>
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link href="/exams">Clear Search</Link>
                </Button>
              </EmptyContent>
            )}
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {guestAttempts.map((attempt) => {
              const exam = attempt.exam
              const isCompleted =
                attempt.status === "COMPLETED" || attempt.status === "TIMEOUT"
              const isInProgress = attempt.status === "IN_PROGRESS"

              return (
                <Card
                  key={attempt.id}
                  className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                >
                  <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                        <BookOpen className="size-4.5 sm:size-5.5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                          {exam.title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {exam.description || "Assessment Evaluation"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        isInProgress
                          ? "default"
                          : isCompleted
                            ? "secondary"
                            : "outline"
                      }
                      className="rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold shrink-0 uppercase tracking-wider"
                    >
                      {isInProgress
                        ? "In Progress"
                        : isCompleted
                          ? "Completed"
                          : attempt.status}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6 space-y-3 flex-1">
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="size-4 text-blue-500 shrink-0" />
                        <span>{exam.durationMinutes} mins</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4 text-purple-500 shrink-0" />
                        <span>{new Date(attempt.startedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {attempt.result && attempt.result.status === "PUBLISHED" && (
                      <div className="rounded-xl bg-muted/40 border border-border/50 p-3 flex items-center justify-between text-xs sm:text-sm font-semibold">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Award className="size-4 text-amber-500" />
                          <span>Score: {attempt.result.obtainedMarks} / {attempt.result.totalMarks}</span>
                        </span>
                        <Badge variant="outline" className="text-xs font-bold rounded-full">
                          {Math.round(attempt.result.accuracy)}% accuracy
                        </Badge>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="border-t border-border/50 bg-muted/10 p-4 sm:px-6 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      Attempt #{attempt.attemptNumber}
                    </span>
                    {isInProgress ? (
                      <Button
                        asChild
                        className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all gap-2"
                      >
                        <Link href={`/exams/${exam.id}/attempt/${attempt.id}`}>
                          <span>Resume Attempt</span>
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs active:scale-95 transition-all gap-1.5"
                      >
                        <Link href={`/exams/${exam.id}/attempt/${attempt.id}`}>
                          <span>View Result</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        <PagePagination
          page={currentPage}
          pageCount={guestPageCount}
          searchParams={{ q: query || undefined }}
        />

        {/* Upgrade Card to discover other exams */}
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 lg:p-7">
            <div className="flex items-start gap-3 sm:gap-3.5">
              <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                <BookOpen className="size-4.5 sm:size-5.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                  Want to access other public practice exams?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Set a password to upgrade your guest session into a permanent student account with full access to mistake reviews and open contests.
                </p>
              </div>
            </div>
            <UpgradeGuestModal
              name={user.name}
              email={user.email}
              trigger={
                <Button
                  size="lg"
                  className="h-11 sm:h-12 px-5 rounded-xl font-bold shadow-sm shrink-0 active:scale-95 transition-all"
                >
                  Upgrade Account
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // =========================================================================
  // Registered Students: Full Exam Hub with History, Search, Filter & Pagination
  // =========================================================================
  const now = new Date()

  // High-level KPI metrics
  const [
    totalAvailableCount,
    totalAttemptsCount,
    passedAttemptsCount,
    accuracyAggregate,
  ] = await Promise.all([
    prisma.exam.count({
      where: {
        status: "PUBLISHED",
        OR: [{ startTime: null }, { startTime: { lte: now } }],
        AND: [{ OR: [{ endTime: null }, { endTime: { gte: now } }] }],
      },
    }),
    prisma.examAttempt.count({
      where: { studentId: user.id },
    }),
    prisma.examResult.count({
      where: {
        attempt: { studentId: user.id },
        isPassed: true,
        status: "PUBLISHED",
      },
    }),
    prisma.examResult.aggregate({
      where: {
        attempt: { studentId: user.id },
        status: "PUBLISHED",
      },
      _avg: { accuracy: true },
    }),
  ])

  const avgAccuracyPct = accuracyAggregate._avg.accuracy
    ? Math.round(accuracyAggregate._avg.accuracy * 100)
    : null

  // Tab 1: Available Exams
  const examWhere: Prisma.ExamWhereInput = {
    status: "PUBLISHED",
    OR: [{ startTime: null }, { startTime: { lte: now } }],
    AND: [{ OR: [{ endTime: null }, { endTime: { gte: now } }] }],
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  // Tab 2: Attempt History
  const attemptWhere: Prisma.ExamAttemptWhereInput = {
    studentId: user.id,
    ...(query
      ? {
          exam: {
            title: { contains: query, mode: "insensitive" },
          },
        }
      : {}),
    ...(statusFilter !== "ALL"
      ? {
          status: statusFilter as AttemptStatus,
        }
      : {}),
  }

  // Execute data queries for the current active tab
  const [
    filteredExamsCount,
    availableExams,
    studentAttemptsOnExams,
    filteredAttemptsCount,
    historyAttempts,
  ] = await Promise.all([
    activeTab === "available"
      ? prisma.exam.count({ where: examWhere })
      : Promise.resolve(0),
    activeTab === "available"
      ? prisma.exam.findMany({
          where: examWhere,
          orderBy: { publishedAt: "desc" },
          skip: (currentPage - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true,
            title: true,
            description: true,
            durationMinutes: true,
            maxAttempts: true,
            passingMarks: true,
            webcamMonitoringRequired: true,
            leaderboardEnabled: true,
            startTime: true,
            endTime: true,
          },
        })
      : Promise.resolve([]),
    activeTab === "available"
      ? prisma.examAttempt.groupBy({
          by: ["examId"],
          where: { studentId: user.id },
          _count: { id: true },
        })
      : Promise.resolve([]),
    activeTab === "history"
      ? prisma.examAttempt.count({ where: attemptWhere })
      : Promise.resolve(0),
    activeTab === "history"
      ? prisma.examAttempt.findMany({
          where: attemptWhere,
          orderBy: { startedAt: "desc" },
          skip: (currentPage - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                durationMinutes: true,
                passingMarks: true,
                maxAttempts: true,
              },
            },
            result: {
              select: {
                status: true,
                obtainedMarks: true,
                totalMarks: true,
                accuracy: true,
                isPassed: true,
              },
            },
          },
        })
      : Promise.resolve([]),
  ])

  const attemptCountsMap = new Map(
    studentAttemptsOnExams.map((a) => [a.examId, a._count.id])
  )

  const pageCount =
    activeTab === "available"
      ? Math.ceil(filteredExamsCount / PAGE_SIZE)
      : Math.ceil(filteredAttemptsCount / PAGE_SIZE)

  const statusOptions = [
    { label: "All Status", value: "ALL" },
    { label: "Completed", value: "COMPLETED" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Timed Out", value: "TIMEOUT" },
  ]

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      {/* ================= TOP HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Exams &amp; Assessments Hub
          </h1>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
          >
            <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Assessment Center</span>
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Browse published examinations to take or inspect your full historical performance and scorecards.
        </p>
      </div>

      {/* ================= KPI STATS SUMMARY GRID ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Available Assessments */}
        <Card className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Open Tests
            </span>
            <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {totalAvailableCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">available</span>
          </div>
        </Card>

        {/* Card 2: Exams Attempted */}
        <Card className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Attempted
            </span>
            <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <History className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {totalAttemptsCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">sessions</span>
          </div>
        </Card>

        {/* Card 3: Passed Exams */}
        <Card className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Passed Tests
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {passedAttemptsCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">passed</span>
          </div>
        </Card>

        {/* Card 4: Average Accuracy */}
        <Card className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Avg. Accuracy
            </span>
            <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {avgAccuracyPct !== null ? `${avgAccuracyPct}%` : "—"}
            </span>
            <span className="text-xs text-muted-foreground font-medium">on published</span>
          </div>
        </Card>
      </div>

      {/* ================= TAB NAVIGATION & TOOLBAR ================= */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
          {/* Tab Selector Links */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/60 self-start">
            <Link
              href={`/exams?tab=available${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={cn(
                "px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 select-none",
                activeTab === "available"
                  ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="size-4 text-primary" />
              <span>Available Exams</span>
              <Badge
                variant={activeTab === "available" ? "default" : "secondary"}
                className="rounded-full text-[10px] px-2 py-0 shrink-0"
              >
                {totalAvailableCount}
              </Badge>
            </Link>

            <Link
              href={`/exams?tab=history${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={cn(
                "px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 select-none",
                activeTab === "history"
                  ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <History className="size-4 text-primary" />
              <span>My Exam History</span>
              <Badge
                variant={activeTab === "history" ? "default" : "secondary"}
                className="rounded-full text-[10px] px-2 py-0 shrink-0"
              >
                {totalAttemptsCount}
              </Badge>
            </Link>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72 lg:w-80">
            <DebouncedSearchInput
              placeholder={
                activeTab === "history"
                  ? "Search your exam history..."
                  : "Search assessments by title..."
              }
              className="w-full"
            />
          </div>
        </div>

        {/* History Tab Status Filter Pills */}
        {activeTab === "history" && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-muted-foreground font-semibold mr-1">Filter by status:</span>
            {statusOptions.map((opt) => {
              const isActive = statusFilter === opt.value
              const params = new URLSearchParams()
              params.set("tab", "history")
              if (query) params.set("q", query)
              if (opt.value !== "ALL") params.set("status", opt.value)

              return (
                <Link
                  key={opt.value}
                  href={`/exams?${params.toString()}`}
                  className={cn(
                    "px-3 py-1.5 rounded-full font-bold transition-all border text-xs shadow-2xs",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground border-border/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {opt.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ================= TAB 1: AVAILABLE EXAMS ================= */}
      {activeTab === "available" && (
        <div className="space-y-6">
          {availableExams.length === 0 ? (
            <Empty className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-12 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs"
                >
                  <BookOpen className="size-6" />
                </EmptyMedia>
                <EmptyTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground mt-2">
                  {query ? "No assessments found" : "No open exams right now"}
                </EmptyTitle>
                <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  {query
                    ? `No available examinations match "${query}". Try adjusting your search query.`
                    : "There are currently no active assessments published for open testing. Please check back later."}
                </EmptyDescription>
              </EmptyHeader>
              {query && (
                <EmptyContent>
                  <Button asChild variant="outline" size="sm" className="rounded-xl">
                    <Link href="/exams?tab=available">Clear Search</Link>
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
              {availableExams.map((exam) => {
                const attemptsUsed = attemptCountsMap.get(exam.id) ?? 0
                const attemptsLeft = exam.maxAttempts - attemptsUsed
                const hasStarted = attemptsUsed > 0

                return (
                  <Card
                    key={exam.id}
                    className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                          <BookOpen className="size-4.5 sm:size-5.5" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                            {exam.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {exam.description || "Timed multiple-choice assessment"}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 border-border/70"
                      >
                        {exam.durationMinutes}m
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-3 flex-1">
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                          <Clock className="size-4 text-blue-500 shrink-0" />
                          <span>{exam.durationMinutes} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                          <RefreshCw className="size-4 text-amber-500 shrink-0" />
                          <span>
                            {attemptsUsed} / {exam.maxAttempts} attempts
                          </span>
                        </div>
                        {exam.webcamMonitoringRequired && (
                          <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                            <span>Webcam active</span>
                          </div>
                        )}
                        {exam.leaderboardEnabled && (
                          <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <Trophy className="size-4 text-yellow-500 shrink-0" />
                            <span>Leaderboard</span>
                          </div>
                        )}
                      </div>

                      {hasStarted && (
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-2.5 flex items-center justify-between text-xs font-semibold">
                          <span className="text-muted-foreground">Previous Attempts:</span>
                          <span className="text-foreground font-bold">
                            {attemptsUsed} of {exam.maxAttempts} used
                          </span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="border-t border-border/50 bg-muted/10 p-4 sm:px-6 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground font-medium">
                        {exam.passingMarks ? `Pass: ${exam.passingMarks} marks` : "Standard grading"}
                      </span>
                      <Button
                        asChild
                        className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all gap-1.5 cursor-pointer"
                      >
                        <Link href={`/exams/${exam.id}`}>
                          <span>
                            {attemptsLeft <= 0
                              ? "View Details"
                              : hasStarted
                                ? "Take Again"
                                : "Start Test"}
                          </span>
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}

          <PagePagination
            page={currentPage}
            pageCount={pageCount}
            searchParams={{ tab: "available", q: query || undefined }}
          />
        </div>
      )}

      {/* ================= TAB 2: MY EXAM HISTORY ================= */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {historyAttempts.length === 0 ? (
            <Empty className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-12 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs"
                >
                  <History className="size-6" />
                </EmptyMedia>
                <EmptyTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground mt-2">
                  {query || statusFilter !== "ALL"
                    ? "No matching attempts found"
                    : "No exam history recorded yet"}
                </EmptyTitle>
                <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  {query || statusFilter !== "ALL"
                    ? "Try adjusting your search keyword or clearing the status filter."
                    : "You haven't launched any examination assessments yet. Switch to Available Exams to begin your first test."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {query || statusFilter !== "ALL" ? (
                  <Button asChild variant="outline" size="sm" className="rounded-xl">
                    <Link href="/exams?tab=history">Clear Filters</Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" className="rounded-xl font-bold">
                    <Link href="/exams?tab=available">Browse Available Exams</Link>
                  </Button>
                )}
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
              {historyAttempts.map((attempt) => {
                const exam = attempt.exam
                const isCompleted = attempt.status === "COMPLETED"
                const isTimeout = attempt.status === "TIMEOUT"
                const isInProgress = attempt.status === "IN_PROGRESS"
                const publishedResult =
                  attempt.result && attempt.result.status === "PUBLISHED"
                    ? attempt.result
                    : null

                return (
                  <Card
                    key={attempt.id}
                    className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                          <History className="size-4.5 sm:size-5.5" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                            {exam.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            Attempt #{attempt.attemptNumber} · {exam.durationMinutes} mins
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          isInProgress
                            ? "default"
                            : isCompleted
                              ? "secondary"
                              : "outline"
                        }
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold shrink-0 uppercase tracking-wider",
                          isInProgress && "bg-blue-600 text-white",
                          isCompleted && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                          isTimeout && "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        )}
                      >
                        {attempt.status.replace("_", " ")}
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-3 flex-1">
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                          <Calendar className="size-4 text-purple-500 shrink-0" />
                          <span>{new Date(attempt.startedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                          <Clock className="size-4 text-blue-500 shrink-0" />
                          <span>
                            {new Date(attempt.startedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Result metrics or pending notice */}
                      {publishedResult ? (
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                            <span className="flex items-center gap-1.5 text-foreground font-bold">
                              <Award className="size-4 text-amber-500" />
                              <span>
                                Score: {publishedResult.obtainedMarks} / {publishedResult.totalMarks}
                              </span>
                            </span>
                            <Badge
                              variant={publishedResult.isPassed ? "default" : "destructive"}
                              className="rounded-full text-[10px] px-2 py-0 font-bold uppercase"
                            >
                              {publishedResult.isPassed ? "Passed" : "Not Passed"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Accuracy</span>
                            <span className="font-bold text-foreground">
                              {Math.round(publishedResult.accuracy * 100)}%
                            </span>
                          </div>
                        </div>
                      ) : isInProgress ? (
                        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-2.5 text-xs text-blue-800 dark:text-blue-300 font-medium">
                          This assessment session is currently ongoing.
                        </div>
                      ) : (
                        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
                          Submitted · Result pending teacher review
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="border-t border-border/50 bg-muted/10 p-4 sm:px-6 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground font-medium">
                        Attempt #{attempt.attemptNumber}
                      </span>
                      {isInProgress ? (
                        <Button
                          asChild
                          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all gap-1.5 cursor-pointer"
                        >
                          <Link href={`/exams/${exam.id}/attempt/${attempt.id}`}>
                            <span>Resume Exam</span>
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          variant="outline"
                          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs hover:border-primary/40 active:scale-95 transition-all gap-1.5 cursor-pointer"
                        >
                          <Link href={`/exams/${exam.id}/attempt/${attempt.id}`}>
                            <span>View Result</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}

          <PagePagination
            page={currentPage}
            pageCount={pageCount}
            searchParams={{
              tab: "history",
              q: query || undefined,
              status: statusFilter !== "ALL" ? statusFilter : undefined,
            }}
          />
        </div>
      )}
    </div>
  )
}
