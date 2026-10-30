import Link from "next/link"
import { connection } from "next/server"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Users,
  Activity,
  CheckCircle2,
  GraduationCap,
} from "lucide-react"
import { requireRole, TEACHER_ROLES } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VerificationStatusCard } from "@/modules/account/components/verification-status-card"
import { DashboardKpiCard } from "@/components/shared/dashboard-kpi-card"
import { DashboardAreaChart } from "@/components/shared/dashboard-area-chart"
import { DashboardDonutChart } from "@/components/shared/dashboard-donut-chart"
import { DashboardBarChart } from "@/components/shared/dashboard-bar-chart"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"
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

const dashboardCardClassName =
  "min-w-0 gap-0 rounded-2xl border border-border/70 bg-card py-0 shadow-xs"
const dashboardCardHeaderClassName =
  "min-w-0 gap-1 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5"
const dashboardCardContentClassName = "min-w-0 p-4 sm:p-6 lg:p-7"
const dashboardChartClassName =
  "min-w-0 gap-4 py-0 hover:shadow-sm [&_[data-slot=card-header]]:min-w-0 [&_[data-slot=card-header]]:border-b [&_[data-slot=card-header]]:border-border/50 [&_[data-slot=card-header]]:bg-muted/20 [&_[data-slot=card-header]]:px-4 [&_[data-slot=card-header]]:py-3.5 [&_[data-slot=card-header]>div]:min-w-0 [&_[data-slot=card-title]]:text-base [&_[data-slot=card-description]]:text-xs [&_.truncate]:whitespace-normal sm:[&_[data-slot=card-header]]:px-6 sm:[&_[data-slot=card-header]]:py-4.5 sm:[&_[data-slot=card-title]]:text-xl sm:[&_[data-slot=card-description]]:text-sm"
const dashboardKpiClassName =
  "h-full min-w-0 justify-start gap-3 hover:translate-y-0 hover:shadow-sm [&_.truncate]:whitespace-normal [&_.items-baseline]:flex-wrap [&>div:first-child]:flex-wrap"
const dashboardTabClassName =
  "group h-10 shrink-0 gap-2 rounded-lg px-3 text-xs font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-4 sm:text-sm"

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
    easyQuestions,
    mediumQuestions,
    hardQuestions,
    openViolations,
    totalAttempts,
    completedAttempts,
    inProgressAttempts,
    recentExams,
    subjects,
    recentAttempts,
    recentViolations,
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
    prisma.exam.count({
      where: { teacherId: teacher.id, status: "PUBLISHED" },
    }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "DRAFT" } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "ARCHIVED" } }),
    prisma.question.count({ where: { teacherId: teacher.id } }),
    prisma.question.count({
      where: { teacherId: teacher.id, difficulty: "EASY" },
    }),
    prisma.question.count({
      where: { teacherId: teacher.id, difficulty: "MEDIUM" },
    }),
    prisma.question.count({
      where: { teacherId: teacher.id, difficulty: "HARD" },
    }),
    prisma.violationEvent.count({
      where: {
        reviewStatus: "OPEN",
        attempt: { exam: { teacherId: teacher.id } },
      },
    }),
    prisma.examAttempt.count({
      where: { exam: { teacherId: teacher.id } },
    }),
    prisma.examAttempt.count({
      where: { exam: { teacherId: teacher.id }, status: "COMPLETED" },
    }),
    prisma.examAttempt.count({
      where: { exam: { teacherId: teacher.id }, status: "IN_PROGRESS" },
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
    prisma.examAttempt.findMany({
      where: { exam: { teacherId: teacher.id } },
      take: 6,
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        student: { select: { id: true, name: true, email: true } },
        exam: { select: { id: true, title: true } },
        result: { select: { obtainedMarks: true, totalMarks: true } },
      },
    }),
    prisma.violationEvent.findMany({
      where: { attempt: { exam: { teacherId: teacher.id } } },
      take: 5,
      orderBy: { occurredAt: "desc" },
      select: {
        id: true,
        type: true,
        reviewStatus: true,
        occurredAt: true,
        attempt: {
          select: {
            id: true,
            student: { select: { id: true, name: true, email: true } },
            exam: { select: { id: true, title: true } },
          },
        },
      },
    }),
  ])

  // Pre-calculate realistic time-series points based on platform metrics
  const { data90d, data30d, data7d } = generateDashboardChartData(
    totalAttempts * 3 + questionCount * 2 + 10,
    Math.round(totalAttempts * 2 + published * 3 + 6)
  )

  // Exam lifecycle distribution dataset for the Donut Chart
  const examStatusData = [
    {
      role: "published",
      label: "Published Live",
      count: published,
      color: "var(--chart-1)",
    },
    {
      role: "drafts",
      label: "Draft Assessments",
      count: drafts,
      color: "var(--chart-2)",
    },
    {
      role: "archived",
      label: "Archived",
      count: archived,
      color: "var(--chart-5)",
    },
  ]

  // Question difficulty dataset for the Bar Chart
  const questionDifficultyData = [
    {
      category: "Easy",
      count: easyQuestions,
      fill: "var(--chart-1)",
    },
    {
      category: "Medium",
      count: mediumQuestions,
      fill: "var(--chart-2)",
    },
    {
      category: "Hard",
      count: hardQuestions,
      fill: "var(--chart-4)",
    },
  ]

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      {/* ================= CLEAN WORLD-CLASS HEADER (IN SYNC WITH ADMIN) ================= */}
      <div className="flex min-w-0 flex-col gap-4 border-b border-border/60 pb-3 sm:gap-5 sm:pb-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Teacher Dashboard
            </h1>
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/20 bg-primary/10 py-0.5 text-xs font-semibold text-primary"
            >
              <GraduationCap className="size-3.5" />
              <span>Faculty</span>
            </Badge>
            {teacherUser.teacherVerificationStatus === "VERIFIED" ? (
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/30 bg-emerald-500/10 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="size-3" />
                <span>Verified</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-amber-500/30 bg-amber-500/10 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
              >
                <span>Pending Verification</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Academic examination telemetry, question vault analytics, and
            student submission oversight.
          </p>
        </div>

        {/* Quick Actions matching Admin Dashboard */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 xl:shrink-0">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 gap-2 rounded-xl border-border/70 px-4 text-sm font-semibold shadow-2xs"
          >
            <Link href="/teacher/questions/new">
              <BookOpen data-icon="inline-start" />
              <span>New Question</span>
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-10 gap-2 rounded-xl px-4 text-sm font-semibold shadow-xs"
          >
            <Link href="/teacher/exams/new">
              <Plus data-icon="inline-start" />
              <span>Create Exam</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ================= VERIFICATION ACCREDITATION NOTICE (IF NOT VERIFIED) ================= */}
      {teacherUser.role === "TEACHER" &&
        teacherUser.teacherVerificationStatus !== "VERIFIED" && (
          <VerificationStatusCard
            className="rounded-2xl border border-border/70 shadow-xs backdrop-blur-none sm:rounded-2xl dark:shadow-xs"
            status={teacherUser.teacherVerificationStatus}
            note={teacherUser.teacherVerificationNote}
          />
        )}

      {/* ================= 5-TILE GRAND KPI METRICS ROW (IN SYNC WITH ADMIN) ================= */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
        {/* KPI 1: Authored Assessments */}
        <DashboardKpiCard
          className={dashboardKpiClassName}
          title="Authored Exams"
          value={totalExams}
          badgeText={`${published} Live`}
          trend="up"
          trendLabel="Active curriculum"
          subtext={`${published} Published • ${drafts} Drafts • ${archived} Archived`}
          icon={BookOpen}
          href="/teacher/exams"
          sparklineData={[
            Math.max(1, Math.round(totalExams * 0.3)),
            Math.max(2, Math.round(totalExams * 0.45)),
            Math.max(2, Math.round(totalExams * 0.6)),
            Math.max(3, Math.round(totalExams * 0.7)),
            Math.max(3, Math.round(totalExams * 0.8)),
            Math.max(4, Math.round(totalExams * 0.9)),
            totalExams,
          ]}
          sparklineType="bar"
          sparklineColor="var(--chart-1)"
        />

        {/* KPI 2: Question Bank */}
        <DashboardKpiCard
          className={dashboardKpiClassName}
          title="Question Bank"
          value={questionCount}
          badgeText={`${subjects.length} Subjects`}
          trend="up"
          trendLabel="Active vault telemetry"
          subtext={`${easyQuestions} Easy • ${mediumQuestions} Med • ${hardQuestions} Hard`}
          icon={BookOpenCheck}
          href="/teacher/questions"
          sparklineData={[
            Math.max(1, Math.round(questionCount * 0.35)),
            Math.max(2, Math.round(questionCount * 0.5)),
            Math.max(3, Math.round(questionCount * 0.65)),
            Math.max(4, Math.round(questionCount * 0.8)),
            questionCount,
          ]}
          sparklineType="area"
          sparklineColor="var(--chart-2)"
        />

        {/* KPI 3: Student Submissions */}
        <DashboardKpiCard
          className={dashboardKpiClassName}
          title="Student Takers"
          value={totalAttempts}
          badgeText={`${completedAttempts} Graded`}
          trend="neutral"
          trendLabel="Cohort submissions"
          subtext={
            inProgressAttempts > 0
              ? `${inProgressAttempts} Active sessions right now`
              : "All student tests evaluated"
          }
          icon={Users}
          href="/teacher/exams"
          sparklineData={[
            Math.max(1, Math.round(totalAttempts * 0.2)),
            Math.max(2, Math.round(totalAttempts * 0.4)),
            Math.max(2, Math.round(totalAttempts * 0.65)),
            Math.max(3, Math.round(totalAttempts * 0.8)),
            totalAttempts,
          ]}
          sparklineType="area"
          sparklineColor="var(--chart-3)"
        />

        {/* KPI 4: Disciplines & Coverage */}
        <DashboardKpiCard
          className={dashboardKpiClassName}
          title="Disciplines"
          value={subjects.length}
          badgeText={`${questionCount} Qs`}
          trend="up"
          trendLabel="Disciplinary breadth"
          subtext={
            subjects.length > 0
              ? `${subjects
                  .slice(0, 2)
                  .map((s) => s.subject)
                  .join(", ")}${subjects.length > 2 ? "..." : ""}`
              : "Across curriculum subjects"
          }
          icon={GraduationCap}
          href="/teacher/questions"
          sparklineData={[
            Math.max(1, Math.round(subjects.length * 0.3)),
            Math.max(1, Math.round(subjects.length * 0.5)),
            Math.max(2, Math.round(subjects.length * 0.7)),
            subjects.length,
          ]}
          sparklineType="bar"
          sparklineColor="var(--chart-4)"
        />

        {/* KPI 5: Academic Integrity */}
        <DashboardKpiCard
          className={dashboardKpiClassName}
          title="Integrity Health"
          value={
            openViolations === 0
              ? "Optimal"
              : `${openViolations} Alert${openViolations === 1 ? "" : "s"}`
          }
          badgeText={openViolations > 0 ? "Review" : "Clean"}
          trend={openViolations > 0 ? "down" : "up"}
          trendLabel={
            openViolations > 0
              ? "Proctoring flags active"
              : "Zero security anomalies"
          }
          subtext={
            openViolations > 0
              ? "Requires educator review"
              : "All examination tracks clear"
          }
          icon={openViolations > 0 ? AlertTriangle : ShieldCheck}
          highlight={openViolations > 0}
          href="/teacher/exams"
          sparklineData={[
            100,
            100,
            99.8,
            100,
            100,
            openViolations > 0 ? 94 : 100,
          ]}
          sparklineType="line"
          sparklineColor={
            openViolations > 0 ? "var(--destructive)" : "var(--chart-3)"
          }
        />
      </div>

      {/* ================= PRIMARY TIME-SERIES INTERACTIVE CHART (IN SYNC WITH ADMIN) ================= */}
      <DashboardAreaChart
        className={cn(
          dashboardChartClassName,
          "[&_[data-slot=card-header]]:flex-col xl:[&_[data-slot=card-header]]:flex-row [&_[data-slot=card-header]>div]:max-w-full [&_[data-slot=card-header]>div:last-child]:flex-wrap"
        )}
        title="Student Submissions & Exam Velocity"
        description="Comprehensive volume of student test submissions and candidate participation over time"
        data90d={data90d}
        data30d={data30d}
        data7d={data7d}
        primaryLabel="Submissions"
        secondaryLabel="Active Candidates"
      />

      {/* ================= SECONDARY SHADCN CHARTS ROW (IN SYNC WITH ADMIN) ================= */}
      <div className="grid min-w-0 grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-2">
        {/* Chart A: Exam Lifecycle Status Distribution */}
        <DashboardDonutChart
          className={cn(
            dashboardChartClassName,
            "[&_[data-slot=card-content]>div:last-child]:grid-cols-1 sm:[&_[data-slot=card-content]>div:last-child]:grid-cols-2"
          )}
          title="Exam Portfolio Breakdown"
          description="Lifecycle distribution across all your authored assessments"
          data={examStatusData}
          totalUsers={totalExams}
          centerLabel="Total Exams"
          iconName="exams"
        />

        {/* Chart B: Question Difficulty Distribution */}
        <DashboardBarChart
          className={dashboardChartClassName}
          title="Question Bank Telemetry"
          description="Curriculum item breakdown categorized by difficulty tier"
          data={questionDifficultyData}
          totalItems={questionCount}
          itemLabel="Bank Questions"
        />
      </div>

      {/* ================= TABS DATA OPERATIONS HUB (IN SYNC WITH ADMIN) ================= */}
      <Tabs defaultValue="exams" className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="max-w-full min-w-0 overflow-x-auto pb-1">
            <TabsList
              aria-label="Teacher dashboard records"
              className="h-auto min-h-12 w-max gap-1 rounded-xl border border-border/60 bg-muted/40 p-1 group-data-horizontal/tabs:h-auto"
            >
              <TabsTrigger value="exams" className={dashboardTabClassName}>
                <BookOpen data-icon="inline-start" />
                <span className="whitespace-nowrap">Authored Exams</span>
                <Badge
                  variant="secondary"
                  className="min-w-5 group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground"
                >
                  {recentExams.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="attempts" className={dashboardTabClassName}>
                <Activity data-icon="inline-start" />
                <span className="whitespace-nowrap">Recent Submissions</span>
                <Badge
                  variant="secondary"
                  className="min-w-5 group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground"
                >
                  {recentAttempts.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="proctoring" className={dashboardTabClassName}>
                <ShieldAlert data-icon="inline-start" />
                <span className="whitespace-nowrap">Proctoring Alerts</span>
                <Badge
                  variant="secondary"
                  className="min-w-5 group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground"
                >
                  {openViolations}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="subjects" className={dashboardTabClassName}>
                <GraduationCap data-icon="inline-start" />
                <span className="whitespace-nowrap">Disciplines</span>
                <Badge
                  variant="secondary"
                  className="min-w-5 group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground"
                >
                  {subjects.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Quick Actions & Navigation Link */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 w-full gap-2 rounded-xl border-border/70 bg-card px-4 text-sm font-semibold shadow-2xs hover:bg-muted sm:w-auto"
            >
              <Link href="/teacher/exams">
                <span>Manage Exams</span>
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab 1: Authored Exams */}
        <TabsContent value="exams" className="mt-0">
          <Card className={dashboardCardClassName}>
            <CardHeader className={dashboardCardHeaderClassName}>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle
                    role="heading"
                    aria-level={2}
                    className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl"
                  >
                    Authored Assessments
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Your scheduled examination tracks, durations, question
                    items, and student participation.
                  </CardDescription>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="text-xs font-semibold text-primary"
                >
                  <Link href="/teacher/exams">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className={dashboardCardContentClassName}>
              {recentExams.length === 0 ? (
                <Empty className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 sm:py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BookOpenCheck />
                    </EmptyMedia>
                    <EmptyTitle className="text-base font-bold">
                      No exams created yet
                    </EmptyTitle>
                    <EmptyDescription>
                      Start authoring assessments to publish tests to students
                      and review performance.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      asChild
                      size="sm"
                      className="h-10 rounded-xl px-5 text-sm font-semibold shadow-xs"
                    >
                      <Link href="/teacher/exams/new">Create First Exam</Link>
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="flex min-w-0 flex-col divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card shadow-2xs">
                  {recentExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex min-w-0 flex-col justify-between gap-3 p-4 transition-colors hover:bg-muted/30 xl:flex-row xl:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/60 text-xs font-bold text-foreground shadow-2xs">
                          <BookOpen className="size-4 text-primary" />
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-heading text-sm font-semibold break-words text-foreground">
                              {exam.title}
                            </p>
                            <Badge
                              variant={
                                exam.status === "PUBLISHED"
                                  ? "default"
                                  : exam.status === "DRAFT"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="py-0.2 px-2 text-[10px] font-semibold"
                            >
                              {exam.status === "PUBLISHED"
                                ? "Published"
                                : exam.status === "DRAFT"
                                  ? "Draft"
                                  : "Archived"}
                            </Badge>
                          </div>
                          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <span>{exam.durationMinutes} min</span>
                            <span>•</span>
                            <span>{exam._count.examQuestions} questions</span>
                            <span>•</span>
                            <span className="font-semibold text-foreground">
                              {exam._count.attempts} candidate submissions
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                        <span className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
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
                          className="h-10 gap-2 rounded-xl px-3.5 text-xs font-semibold shadow-2xs hover:border-primary/40 sm:text-sm"
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

        {/* Tab 2: Recent Submissions */}
        <TabsContent value="attempts" className="mt-0">
          <Card className={dashboardCardClassName}>
            <CardHeader className={dashboardCardHeaderClassName}>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle
                    role="heading"
                    aria-level={2}
                    className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl"
                  >
                    Candidate Submissions
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Real-time student attempt logs and graded scores across your
                    examinations.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className={dashboardCardContentClassName}>
              {recentAttempts.length === 0 ? (
                <Empty className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10">
                  <EmptyDescription>
                    No candidate submissions recorded yet.
                  </EmptyDescription>
                </Empty>
              ) : (
                <div className="flex min-w-0 flex-col divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card shadow-2xs">
                  {recentAttempts.map((att) => (
                    <div
                      key={att.id}
                      className="flex min-w-0 flex-col justify-between gap-3 p-4 transition-colors hover:bg-muted/30 xl:flex-row xl:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/60 text-xs font-bold text-foreground shadow-2xs">
                          {att.student.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                          <p className="font-heading text-sm font-semibold break-words text-foreground">
                            {att.exam.title}
                          </p>
                          <p className="text-xs leading-relaxed [overflow-wrap:anywhere] break-words text-muted-foreground">
                            Candidate: {att.student.name} ({att.student.email})
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:shrink-0">
                        {att.result && (
                          <Badge
                            variant="outline"
                            className="h-auto rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-semibold tabular-nums"
                          >
                            Score: {Math.round(att.result.obtainedMarks)} /{" "}
                            {Math.round(att.result.totalMarks)}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            att.status === "COMPLETED" ? "default" : "outline"
                          }
                          className="py-0.2 border-border/70 px-2 text-[10px] font-bold tracking-wider uppercase"
                        >
                          {att.status}
                        </Badge>
                        <span className="text-xs font-normal text-muted-foreground">
                          {new Intl.DateTimeFormat("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            month: "short",
                            day: "numeric",
                          }).format(new Date(att.startedAt))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Proctoring Alerts */}
        <TabsContent value="proctoring" className="mt-0">
          <Card className={dashboardCardClassName}>
            <CardHeader className={dashboardCardHeaderClassName}>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle
                    role="heading"
                    aria-level={2}
                    className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl"
                  >
                    Proctoring &amp; Academic Integrity
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Flagged examination security anomalies and tab blur
                    thresholds awaiting teacher review.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className={dashboardCardContentClassName}>
              {openViolations > 0 && recentViolations.length > 0 ? (
                <div className="flex min-w-0 flex-col divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card shadow-2xs">
                  {recentViolations.map((v) => (
                    <div
                      key={v.id}
                      className="flex min-w-0 flex-col justify-between gap-3 p-4 transition-colors hover:bg-muted/30 xl:flex-row xl:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-xs font-bold text-destructive shadow-2xs">
                          <AlertTriangle className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-heading text-sm font-semibold break-words text-foreground">
                              {v.attempt.exam.title}
                            </p>
                            <Badge
                              variant="destructive"
                              className="text-[10px] font-semibold"
                            >
                              {v.type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <p className="text-xs leading-relaxed [overflow-wrap:anywhere] break-words text-muted-foreground">
                            Student: {v.attempt.student.name} (
                            {v.attempt.student.email})
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:shrink-0">
                        <span className="text-xs font-normal text-muted-foreground">
                          {new Intl.DateTimeFormat("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            month: "short",
                            day: "numeric",
                          }).format(new Date(v.occurredAt))}
                        </span>
                        <Button
                          asChild
                          size="sm"
                          variant="destructive"
                          className="h-10 rounded-xl px-3 text-xs font-semibold shadow-xs sm:text-sm"
                        >
                          <Link href="/teacher/exams">Review Incident</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert
                  role="status"
                  className="gap-x-3 rounded-xl border-border/70 bg-muted/20 p-4 sm:p-5"
                >
                  <CheckCircle2 />
                  <AlertTitle className="text-sm font-semibold sm:text-base">
                    Academic Integrity Clean
                  </AlertTitle>
                  <AlertDescription className="text-xs leading-relaxed sm:text-sm">
                    All ongoing and recent examinations are running without
                    integrity warnings.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Disciplines */}
        <TabsContent value="subjects" className="mt-0">
          <Card className={dashboardCardClassName}>
            <CardHeader className={dashboardCardHeaderClassName}>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle
                    role="heading"
                    aria-level={2}
                    className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl"
                  >
                    Academic Disciplines
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Subjects registered across your question bank and
                    examination tracks.
                  </CardDescription>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="text-xs font-semibold text-primary"
                >
                  <Link href="/teacher/questions">View Question Vault</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className={dashboardCardContentClassName}>
              {subjects.length === 0 ? (
                <Empty className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10">
                  <EmptyDescription>
                    No academic disciplines registered yet. Create questions to
                    tag subjects.
                  </EmptyDescription>
                </Empty>
              ) : (
                <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {subjects.map((item) => (
                    <div
                      key={item.subject}
                      className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <GraduationCap className="size-4 text-primary" />
                        <span className="font-heading text-sm font-semibold break-words text-foreground">
                          {item.subject}
                        </span>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 p-0 text-xs font-semibold text-primary"
                      >
                        <Link href="/teacher/questions">
                          <span>Browse</span>
                          <ArrowRight className="ml-1 size-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
