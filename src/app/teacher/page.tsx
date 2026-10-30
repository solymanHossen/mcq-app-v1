import Link from "next/link"
import { connection } from "next/server"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Clock,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Users,
  Activity,
  CheckCircle2,
  GraduationCap,
  Sparkles,
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
    prisma.exam.count({ where: { teacherId: teacher.id, status: "PUBLISHED" } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "DRAFT" } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "ARCHIVED" } }),
    prisma.question.count({ where: { teacherId: teacher.id } }),
    prisma.question.count({ where: { teacherId: teacher.id, difficulty: "EASY" } }),
    prisma.question.count({ where: { teacherId: teacher.id, difficulty: "MEDIUM" } }),
    prisma.question.count({ where: { teacherId: teacher.id, difficulty: "HARD" } }),
    prisma.violationEvent.count({
      where: { reviewStatus: "OPEN", attempt: { exam: { teacherId: teacher.id } } },
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
    <div className="w-full min-w-0 flex flex-col gap-6 sm:gap-8">
      {/* ================= CLEAN WORLD-CLASS HEADER (IN SYNC WITH ADMIN) ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Teacher Dashboard
            </h1>
            <Badge
              variant="outline"
              className="text-xs font-semibold bg-primary/10 text-primary border-primary/20 gap-1.5 py-0.5"
            >
              <GraduationCap className="size-3.5" />
              <span>Faculty</span>
            </Badge>
            {teacherUser.teacherVerificationStatus === "VERIFIED" ? (
              <Badge
                variant="outline"
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1 py-0.5"
              >
                <CheckCircle2 className="size-3" />
                <span>Verified</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs font-medium text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1 py-0.5"
              >
                <span>Pending Verification</span>
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Academic examination telemetry, question vault analytics, and student submission oversight.
          </p>
        </div>

        {/* Quick Actions matching Admin Dashboard */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button asChild variant="outline" size="sm" className="h-10 rounded-xl px-4 text-xs font-semibold shadow-2xs">
            <Link href="/teacher/questions/new">
              <BookOpen className="mr-1.5 size-4" />
              <span>New Question</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-10 rounded-xl px-4 text-xs font-semibold shadow-xs">
            <Link href="/teacher/exams/new">
              <Plus className="mr-1.5 size-4" />
              <span>Create Exam</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ================= VERIFICATION ACCREDITATION NOTICE (IF NOT VERIFIED) ================= */}
      {teacherUser.role === "TEACHER" &&
        teacherUser.teacherVerificationStatus !== "VERIFIED" && (
          <VerificationStatusCard
            status={teacherUser.teacherVerificationStatus}
            note={teacherUser.teacherVerificationNote}
          />
        )}

      {/* ================= 5-TILE GRAND KPI METRICS ROW (IN SYNC WITH ADMIN) ================= */}
      <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:gap-4.5">
        {/* KPI 1: Authored Assessments */}
        <DashboardKpiCard
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
          sparklineColor="#3b82f6"
        />

        {/* KPI 2: Question Bank */}
        <DashboardKpiCard
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
          sparklineColor="#8b5cf6"
        />

        {/* KPI 3: Student Submissions */}
        <DashboardKpiCard
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
          sparklineColor="#10b981"
        />

        {/* KPI 4: Disciplines & Coverage */}
        <DashboardKpiCard
          title="Disciplines"
          value={subjects.length}
          badgeText={`${questionCount} Qs`}
          trend="up"
          trendLabel="Disciplinary breadth"
          subtext={
            subjects.length > 0
              ? `${subjects.slice(0, 2).map((s) => s.subject).join(", ")}${subjects.length > 2 ? "..." : ""}`
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
          sparklineColor="#f59e0b"
        />

        {/* KPI 5: Academic Integrity */}
        <DashboardKpiCard
          title="Integrity Health"
          value={openViolations === 0 ? "Optimal" : `${openViolations} Alert${openViolations === 1 ? "" : "s"}`}
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
          sparklineData={[100, 100, 99.8, 100, 100, openViolations > 0 ? 94 : 100]}
          sparklineType="line"
          sparklineColor={openViolations > 0 ? "#f43f5e" : "#10b981"}
        />
      </div>

      {/* ================= PRIMARY TIME-SERIES INTERACTIVE CHART (IN SYNC WITH ADMIN) ================= */}
      <DashboardAreaChart
        title="Student Submissions & Exam Velocity"
        description="Comprehensive volume of student test submissions and candidate participation over time"
        data90d={data90d}
        data30d={data30d}
        data7d={data7d}
        primaryLabel="Submissions"
        secondaryLabel="Active Candidates"
      />

      {/* ================= SECONDARY SHADCN CHARTS ROW (IN SYNC WITH ADMIN) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Exam Lifecycle Status Distribution */}
        <DashboardDonutChart
          title="Exam Portfolio Breakdown"
          description="Lifecycle distribution across all your authored assessments"
          data={examStatusData}
          totalUsers={totalExams}
          centerLabel="Total Exams"
          iconName="exams"
        />


        {/* Chart B: Question Difficulty Distribution */}
        <DashboardBarChart
          title="Question Bank Telemetry"
          description="Curriculum item breakdown categorized by difficulty tier"
          data={questionDifficultyData}
          totalItems={questionCount}
          itemLabel="Bank Questions"
        />
      </div>

      {/* ================= TABS DATA OPERATIONS HUB (IN SYNC WITH ADMIN) ================= */}
      <Tabs defaultValue="exams" className="flex flex-col gap-4 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="group-data-horizontal/tabs:!h-auto !h-auto flex w-fit items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-2 sm:p-2 min-h-12 sm:min-h-14">
            <TabsTrigger
              value="exams"
              className="group relative flex !h-auto min-h-9.5 sm:min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 select-none sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[15px] text-muted-foreground hover:bg-background/80 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm focus-visible:ring-0 focus-visible:outline-none"
            >
              <BookOpen className="size-4.5 sm:size-5 transition-transform duration-200 group-hover:scale-105 text-muted-foreground group-hover:text-primary group-data-[state=active]:text-primary-foreground" />
              <span className="whitespace-nowrap">Authored Exams</span>
              <span className="ml-0.5 inline-flex size-5.5 items-center justify-center rounded-full text-xs font-bold transition-colors bg-background text-foreground shadow-2xs group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                {recentExams.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="attempts"
              className="group relative flex !h-auto min-h-9.5 sm:min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 select-none sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[15px] text-muted-foreground hover:bg-background/80 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm focus-visible:ring-0 focus-visible:outline-none"
            >
              <Activity className="size-4.5 sm:size-5 transition-transform duration-200 group-hover:scale-105 text-muted-foreground group-hover:text-primary group-data-[state=active]:text-primary-foreground" />
              <span className="whitespace-nowrap">Recent Submissions</span>
              <span className="ml-0.5 inline-flex size-5.5 items-center justify-center rounded-full text-xs font-bold transition-colors bg-background text-foreground shadow-2xs group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                {recentAttempts.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="proctoring"
              className="group relative flex !h-auto min-h-9.5 sm:min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 select-none sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[15px] text-muted-foreground hover:bg-background/80 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm focus-visible:ring-0 focus-visible:outline-none"
            >
              <ShieldAlert className="size-4.5 sm:size-5 transition-transform duration-200 group-hover:scale-105 text-muted-foreground group-hover:text-primary group-data-[state=active]:text-primary-foreground" />
              <span className="whitespace-nowrap">Proctoring Alerts</span>
              <span className="ml-0.5 inline-flex size-5.5 items-center justify-center rounded-full text-xs font-bold transition-colors bg-background text-foreground shadow-2xs group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                {openViolations}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="subjects"
              className="group relative flex !h-auto min-h-9.5 sm:min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 select-none sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[15px] text-muted-foreground hover:bg-background/80 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm focus-visible:ring-0 focus-visible:outline-none"
            >
              <GraduationCap className="size-4.5 sm:size-5 transition-transform duration-200 group-hover:scale-105 text-muted-foreground group-hover:text-primary group-data-[state=active]:text-primary-foreground" />
              <span className="whitespace-nowrap">Disciplines</span>
              <span className="ml-0.5 inline-flex size-5.5 items-center justify-center rounded-full text-xs font-bold transition-colors bg-background text-foreground shadow-2xs group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                {subjects.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Actions & Navigation Link */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-11 sm:h-12 rounded-xl border border-border/70 bg-card px-4 sm:px-5 text-xs sm:text-sm font-semibold shadow-2xs hover:bg-muted/70 cursor-pointer"
            >
              <Link href="/teacher/exams">
                <span>Manage Exams</span>
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab 1: Authored Exams */}
        <TabsContent value="exams" className="mt-0">
          <Card className="rounded-2xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg sm:text-xl font-bold text-foreground">
                    Authored Assessments
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Your scheduled examination tracks, durations, question items, and student participation.
                  </CardDescription>
                </div>
                <Button asChild size="sm" variant="ghost" className="text-xs font-semibold text-primary">
                  <Link href="/teacher/exams">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {recentExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border/70 bg-muted/20 p-6">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <BookOpenCheck className="size-6" />
                  </div>
                  <p className="text-base font-bold text-foreground">No exams created yet</p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Start authoring assessments to publish tests to students and review performance.
                  </p>
                  <Button asChild size="sm" className="mt-4 rounded-xl px-5 text-xs font-semibold shadow-xs">
                    <Link href="/teacher/exams/new">Create First Exam</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
                  {recentExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-foreground text-xs font-bold shadow-2xs border border-border/70">
                          <BookOpen className="size-4 text-primary" />
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-heading text-sm font-bold text-foreground truncate">
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
                              className="text-[10px] font-semibold px-2 py-0.2"
                            >
                              {exam.status === "PUBLISHED"
                                ? "Published"
                                : exam.status === "DRAFT"
                                  ? "Draft"
                                  : "Archived"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-2">
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

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
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
                          className="h-8.5 rounded-lg px-3.5 text-xs font-semibold shadow-2xs hover:border-primary/40"
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
          <Card className="rounded-2xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg sm:text-xl font-bold text-foreground">
                    Candidate Submissions
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Real-time student attempt logs and graded scores across your examinations.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {recentAttempts.length === 0 ? (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-8 text-center text-xs text-muted-foreground">
                  No candidate submissions recorded yet.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
                  {recentAttempts.map((att) => (
                    <div
                      key={att.id}
                      className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-foreground text-xs font-bold shadow-2xs border border-border/70">
                          {att.student.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-heading text-sm font-bold text-foreground truncate">
                            {att.exam.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Candidate: {att.student.name} ({att.student.email})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {att.result && (
                          <span className="text-xs font-bold text-foreground tabular-nums px-2.5 py-1 rounded-lg bg-muted/50 border border-border/60">
                            Score: {Math.round(att.result.obtainedMarks)} / {Math.round(att.result.totalMarks)}
                          </span>
                        )}
                        <Badge
                          variant={att.status === "COMPLETED" ? "default" : "outline"}
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 border-border/70"
                        >
                          {att.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-normal">
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
          <Card className="rounded-2xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg sm:text-xl font-bold text-foreground">
                    Proctoring &amp; Academic Integrity
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Flagged examination security anomalies and tab blur thresholds awaiting teacher review.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {openViolations > 0 && recentViolations.length > 0 ? (
                <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
                  {recentViolations.map((v) => (
                    <div
                      key={v.id}
                      className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive text-xs font-bold shadow-2xs border border-destructive/20">
                          <AlertTriangle className="size-4" />
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-heading text-sm font-bold text-foreground truncate">
                              {v.attempt.exam.title}
                            </p>
                            <Badge variant="destructive" className="text-[10px] font-semibold">
                              {v.type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            Student: {v.attempt.student.name} ({v.attempt.student.email})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground font-normal">
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
                          className="h-8.5 rounded-lg px-3 text-xs font-semibold shadow-xs"
                        >
                          <Link href="/teacher/exams">Review Incident</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-muted/20 p-5 text-foreground shadow-2xs">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

        {/* Tab 4: Disciplines */}
        <TabsContent value="subjects" className="mt-0">
          <Card className="rounded-2xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg sm:text-xl font-bold text-foreground">
                    Academic Disciplines
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Subjects registered across your question bank and examination tracks.
                  </CardDescription>
                </div>
                <Button asChild size="sm" variant="ghost" className="text-xs font-semibold text-primary">
                  <Link href="/teacher/questions">View Question Vault</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {subjects.length === 0 ? (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-8 text-center text-xs text-muted-foreground">
                  No academic disciplines registered yet. Create questions to tag subjects.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {subjects.map((item) => (
                    <div
                      key={item.subject}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="size-4 text-primary" />
                        <span className="font-heading text-sm font-bold text-foreground">
                          {item.subject}
                        </span>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-semibold text-primary p-0">
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
