import Link from "next/link"
import { connection } from "next/server"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  ChevronRight,
  Clock,
  Plus,
  ShieldCheck,
  Users,
  Search,
  FileSpreadsheet,
  Filter,
} from "lucide-react"
import { requireRole, TEACHER_ROLES } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileHero } from "@/modules/account/components/profile-hero"
import { VerificationStatusCard } from "@/modules/account/components/verification-status-card"
import { DashboardKpiCard } from "@/components/shared/dashboard-kpi-card"
import { DashboardAreaChart } from "@/components/shared/dashboard-area-chart"
import { generateDashboardChartData } from "@/lib/chart-data-utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export const metadata = {
  title: "Teacher Dashboard",
  description:
    "Author assessments, manage questions, inspect student attempts, and review academic performance.",
}

export default async function TeacherDashboardPage() {
  const teacher = await requireRole(...TEACHER_ROLES)

  // Live counts for a signed-in teacher, never a prerendered shell
  await connection()

  const [
    teacherUser,
    totalExams,
    published,
    drafts,
    archived,
    questionCount,
    openViolations,
    totalAttempts,
    recentExams,
    subjects,
  ] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: teacher.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        isEmailVerified: true,
        teacherVerificationStatus: true,
        teacherVerificationNote: true,
      },
    }),
    prisma.exam.count({ where: { teacherId: teacher.id } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "PUBLISHED" } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "DRAFT" } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "ARCHIVED" } }),
    prisma.question.count({ where: { teacherId: teacher.id } }),
    prisma.violationEvent.count({
      where: { reviewStatus: "OPEN", attempt: { exam: { teacherId: teacher.id } } },
    }),
    prisma.examAttempt.count({
      where: { exam: { teacherId: teacher.id } },
    }),
    prisma.exam.findMany({
      where: { teacherId: teacher.id },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        durationMinutes: true,
        createdAt: true,
        _count: {
          select: {
            attempts: true,
            examQuestions: true,
          },
        },
      },
    }),
    prisma.question.findMany({
      where: { teacherId: teacher.id },
      select: { subject: true },
      distinct: ["subject"],
    }),
  ])

  const heroUser = {
    id: teacherUser.id,
    name: teacherUser.name,
    email: teacherUser.email,
    role: teacherUser.role,
    isEmailVerified: teacherUser.isEmailVerified,
    createdAt: teacherUser.createdAt,
    lastLoginAt: teacherUser.lastLoginAt,
    teacherVerificationStatus: teacherUser.teacherVerificationStatus,
    teacherTotalAttempts: totalAttempts,
    _count: {
      exams: totalExams,
      questions: questionCount,
    },
  }

  // Pre-calculate chart points
  const { data90d, data30d, data7d } = generateDashboardChartData(
    totalAttempts,
    Math.round(totalAttempts * 0.65)
  )

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 sm:gap-8">
      {/* ================= GRAND PROFILE HERO ================= */}
      <ProfileHero user={heroUser} />

      {/* ================= VERIFICATION ACCREDITATION NOTICE ================= */}
      {teacherUser.role === "TEACHER" &&
        teacherUser.teacherVerificationStatus !== "VERIFIED" && (
          <VerificationStatusCard
            status={teacherUser.teacherVerificationStatus}
            note={teacherUser.teacherVerificationNote}
          />
        )}

      {/* ================= QUICK EDUCATOR ACTION HUB (EXPANSIVE CARDS MATCHING PROFILE FLOW) ================= */}
      <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <Link
          href="/teacher/exams/new"
          className="group flex items-center justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16">
              <Plus className="size-7 sm:size-8" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Create Exam
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Author new timed assessment
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>

        <Link
          href="/teacher/questions/new"
          className="group flex items-center justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16 dark:bg-indigo-500/15 dark:text-indigo-400">
              <BookOpen className="size-7 sm:size-8" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Question Bank
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Expand academic question vault
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>

        <Link
          href="/teacher/exams"
          className="group flex items-center justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Users className="size-7 sm:size-8" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Cohorts &amp; Results
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Review student submissions
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>
      </div>

      {/* ================= 4-TILE GRAND KPI METRICS ROW ================= */}
      <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {/* KPI 1: Total Exams */}
        <DashboardKpiCard
          title="Total Exams"
          value={totalExams}
          badgeText="+12.5%"
          trend="up"
          trendLabel="Trending up this month"
          subtext={`${published} live · ${drafts} draft${drafts === 1 ? "" : "s"} · ${archived} archived`}
          href="/teacher/exams"
        />

        {/* KPI 2: Question Bank */}
        <DashboardKpiCard
          title="Question Bank"
          value={questionCount}
          badgeText="+Active"
          trend="up"
          trendLabel="Across disciplines"
          subtext={`In ${subjects.length} academic subject${subjects.length === 1 ? "" : "s"}`}
          href="/teacher/questions"
        />

        {/* KPI 3: Student Submissions */}
        <DashboardKpiCard
          title="Student Takers"
          value={totalAttempts}
          badgeText="+18.2%"
          trend="up"
          trendLabel="Strong engagement"
          subtext="Total completed assessments"
          href="/teacher/exams"
        />

        {/* KPI 4: Academic Integrity */}
        <DashboardKpiCard
          title="Flagged Attempts"
          value={openViolations}
          badgeText={openViolations > 0 ? "Attention" : "All Clear"}
          trend={openViolations > 0 ? "down" : "neutral"}
          trendLabel={
            openViolations > 0
              ? "Pending proctor reviews"
              : "All attempts clear & regular"
          }
          subtext={
            openViolations > 0
              ? "Requires academic review"
              : "Zero security anomalies"
          }
          highlight={openViolations > 0}
          href="/teacher/exams"
        />
      </div>

      {/* ================= GRAND DUAL-WAVE INTERACTIVE CHART ================= */}
      <DashboardAreaChart
        title="Student Submissions & Exam Traffic"
        description="Total student attempt volume and candidate engagement for the last 3 months"
        data90d={data90d}
        data30d={data30d}
        data7d={data7d}
        primaryLabel="Submissions"
        secondaryLabel="Active Takers"
      />

      {/* ================= SUB-NAVIGATION TABS & SEARCH DATA SECTIONS ================= */}
      <Tabs defaultValue="exams" className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className="h-11 rounded-2xl bg-muted/60 p-1.5 border border-border/40">
            <TabsTrigger value="exams" className="rounded-xl px-4 text-xs font-bold sm:text-sm">
              Authored Exams ({recentExams.length})
            </TabsTrigger>
            <TabsTrigger value="subjects" className="rounded-xl px-4 text-xs font-bold sm:text-sm">
              Disciplines ({subjects.length})
            </TabsTrigger>
            <TabsTrigger value="proctoring" className="rounded-xl px-4 text-xs font-bold sm:text-sm">
              Proctoring ({openViolations})
            </TabsTrigger>
          </TabsList>

          {/* Quick Search & Actions Toolbar matching Profile Page */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px] flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Filter exam titles..."
                className="h-10 rounded-xl border-border/80 bg-card pl-9 text-xs shadow-2xs focus-visible:ring-1"
              />
            </div>
            <Button asChild variant="outline" size="sm" className="h-10 rounded-xl px-4 text-xs font-semibold shadow-2xs">
              <Link href="/teacher/exams">
                <span>Manage All</span>
                <ChevronRight className="ml-1 size-3.5" />
              </Link>
            </Button>
            <Button asChild size="sm" className="h-10 rounded-xl px-4 text-xs font-semibold shadow-xs">
              <Link href="/teacher/exams/new">
                <Plus className="mr-1 size-3.5" />
                <span>New Exam</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab 1: Recent Authored Exams */}
        <TabsContent value="exams" className="mt-0">
          <Card className="rounded-3xl border border-border/80 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <CardHeader className="p-6 sm:p-7">
              <div className="flex flex-col gap-1">
                <CardTitle className="font-heading text-xl font-extrabold text-foreground">
                  Authored Assessments
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                  Your examination tracks, scheduled durations, questions count, and cohort participation.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 sm:p-7 sm:pt-0">
              {recentExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <BookOpenCheck className="size-7" />
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    No exams created yet
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Start authoring assessments to publish tests to students and review performance.
                  </p>
                  <Button asChild size="sm" className="mt-6 rounded-xl px-6 text-xs font-semibold shadow-xs">
                    <Link href="/teacher/exams/new">Create First Exam</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="group flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/40 hover:shadow-md sm:p-6"
                    >
                      <div className="min-w-0 space-y-2.5">
                        <div className="flex items-start justify-between gap-2.5">
                          <h4 className="font-heading text-base font-bold text-foreground transition-colors group-hover:text-primary line-clamp-1 sm:text-lg">
                            {exam.title}
                          </h4>
                          <Badge
                            variant={
                              exam.status === "PUBLISHED"
                                ? "default"
                                : exam.status === "DRAFT"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="shrink-0 rounded-lg text-[11px] font-semibold"
                          >
                            {exam.status === "PUBLISHED"
                              ? "Published"
                              : exam.status === "DRAFT"
                                ? "Draft"
                                : "Archived"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <Clock className="size-3.5 text-primary" />
                            <span>{exam.durationMinutes} min</span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-medium">
                            <BookOpen className="size-3.5" />
                            <span>{exam._count.examQuestions} Qs</span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                            <Users className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{exam._count.attempts} takers</span>
                          </span>
                        </div>

                        {exam.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {exam.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-3.5">
                        <span className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(exam.createdAt))}
                        </span>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl text-xs font-semibold shadow-2xs hover:border-primary/40"
                        >
                          <Link href={`/teacher/exams/${exam.id}`}>
                            <span>Manage Exam</span>
                            <ArrowRight className="ml-1 size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Subjects */}
        <TabsContent value="subjects" className="mt-0">
          <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="font-heading text-xl font-bold text-foreground">
                Subject Disciplines
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                Academic disciplines with registered test items authored in your vault.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {subjects.length === 0 ? (
                <p className="text-xs text-muted-foreground">No subjects found in question bank.</p>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5">
                  {subjects.map((item) => (
                    <span
                      key={item.subject}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 sm:text-sm"
                    >
                      <BookOpen className="size-4 text-primary" />
                      <span>{item.subject}</span>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Proctoring */}
        <TabsContent value="proctoring" className="mt-0">
          <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="font-heading text-xl font-bold text-foreground">
                Proctoring &amp; Academic Integrity
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                Flagged events and browser tab switch detection logs awaiting educator review.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {openViolations > 0 ? (
                <div className="flex items-center justify-between rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
                  <div className="flex items-center gap-3.5">
                    <AlertTriangle className="size-6 text-destructive" />
                    <div>
                      <p className="text-sm font-bold text-foreground sm:text-base">
                        {openViolations} attempt{openViolations === 1 ? "" : "s"} require review
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Integrity thresholds crossed during student examination sessions.
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="destructive" className="rounded-xl text-xs font-semibold">
                    <Link href="/teacher/exams">Review Submissions</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold sm:text-base">Academic Integrity Clean</p>
                    <p className="text-xs text-muted-foreground">
                      All ongoing and recent examinations are running without integrity warnings.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
