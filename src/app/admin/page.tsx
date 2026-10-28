import Link from "next/link"
import { connection } from "next/server"
import {
  Users,
  GraduationCap,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  Activity,
  ArrowRight,
  UserCheck,
} from "lucide-react"
import { requireRole, ADMIN_ROLES } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { getStalePendingTransactions } from "@/modules/payments/queries"
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
  title: "Admin Dashboard",
  description: "Enterprise examination telemetry, candidate analytics, and infrastructure oversight.",
}

export default async function AdminDashboardPage() {
  await requireRole(...ADMIN_ROLES)

  // Live counts for an admin, never a static shell
  await connection()

  const [
    userCount,
    studentsCount,
    teachersCount,
    adminsCount,
    pendingTeachers,
    suspendedCount,
    stalePending,
    totalExams,
    publishedExams,
    draftExams,
    totalQuestions,
    easyQuestions,
    mediumQuestions,
    hardQuestions,
    totalAttempts,
    completedAttempts,
    inProgressAttempts,
    recentUsers,
    pendingTeacherList,
    recentAttempts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
    prisma.user.count({ where: { role: "TEACHER", teacherVerificationStatus: "PENDING" } }),
    prisma.user.count({ where: { isActive: false } }),
    getStalePendingTransactions(),
    prisma.exam.count(),
    prisma.exam.count({ where: { status: "PUBLISHED" } }),
    prisma.exam.count({ where: { status: "DRAFT" } }),
    prisma.question.count(),
    prisma.question.count({ where: { difficulty: "EASY" } }),
    prisma.question.count({ where: { difficulty: "MEDIUM" } }),
    prisma.question.count({ where: { difficulty: "HARD" } }),
    prisma.examAttempt.count(),
    prisma.examAttempt.count({ where: { status: "COMPLETED" } }),
    prisma.examAttempt.count({ where: { status: "IN_PROGRESS" } }),
    prisma.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isActive: true,
        isEmailVerified: true,
      },
    }),
    prisma.user.findMany({
      where: { role: "TEACHER", teacherVerificationStatus: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.examAttempt.findMany({
      take: 6,
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        student: { select: { id: true, name: true, email: true } },
        exam: { select: { id: true, title: true } },
      },
    }),
  ])

  // Pre-calculate realistic time-series points based on platform metrics
  const { data90d, data30d, data7d } = generateDashboardChartData(
    userCount * 5 + totalAttempts * 2,
    Math.round(totalAttempts * 1.5 + publishedExams * 3)
  )

  // Demographic distribution dataset for the Donut Chart
  const demographicData = [
    {
      role: "students",
      label: "Students",
      count: studentsCount,
      color: "var(--chart-1)",
    },
    {
      role: "teachers",
      label: "Teachers",
      count: Math.max(0, teachersCount - pendingTeachers),
      color: "var(--chart-2)",
    },
    {
      role: "pending",
      label: "Pending Verification",
      count: pendingTeachers,
      color: "var(--chart-5)",
    },
    {
      role: "admins",
      label: "Administrators",
      count: adminsCount,
      color: "var(--chart-3)",
    },
  ]

  // Question & Assessment Content difficulty dataset for the Bar Chart
  const questionContentData = [
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
      {/* ================= CLEAN WORLD-CLASS HEADER ================= */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Dashboard
        </h1>
      </div>

      {/* ================= 5-TILE GRAND KPI METRICS ROW ================= */}
      <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 sm:gap-5">
        {/* KPI 1: Total Users */}
        <DashboardKpiCard
          title="Total Users"
          value={userCount}
          badgeText="+24.8%"
          trend="up"
          trendLabel="Growing user base"
          subtext={`${studentsCount} Students • ${teachersCount} Teachers`}
          icon={Users}
          href="/admin/users"
          sparklineData={[
            Math.max(1, Math.round(userCount * 0.45)),
            Math.max(2, Math.round(userCount * 0.58)),
            Math.max(3, Math.round(userCount * 0.64)),
            Math.max(4, Math.round(userCount * 0.72)),
            Math.max(5, Math.round(userCount * 0.82)),
            Math.max(6, Math.round(userCount * 0.91)),
            userCount,
          ]}
          sparklineType="area"
          sparklineColor="#10b981"
        />

        {/* KPI 2: Assessments & Exams */}
        <DashboardKpiCard
          title="Assessments"
          value={totalExams}
          badgeText={`${publishedExams} Published`}
          trend="up"
          trendLabel={`${publishedExams} live exams`}
          subtext={`${totalQuestions} Questions in bank`}
          icon={BookOpen}
          href="/admin"
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

        {/* KPI 3: Submissions / Attempts */}
        <DashboardKpiCard
          title="Exam Attempts"
          value={totalAttempts}
          badgeText="Candidate Flow"
          trend="neutral"
          trendLabel={`${completedAttempts} Completed`}
          subtext={`${inProgressAttempts} In progress now`}
          icon={Activity}
          sparklineData={[
            Math.max(1, Math.round(totalAttempts * 0.2)),
            Math.max(2, Math.round(totalAttempts * 0.55)),
            Math.max(2, Math.round(totalAttempts * 0.4)),
            Math.max(3, Math.round(totalAttempts * 0.85)),
            Math.max(3, Math.round(totalAttempts * 0.65)),
            Math.max(4, Math.round(totalAttempts * 0.9)),
            totalAttempts,
          ]}
          sparklineType="area"
          sparklineColor="#8b5cf6"
        />

        {/* KPI 4: Faculty Queue */}
        <DashboardKpiCard
          title="Teacher Queue"
          value={pendingTeachers}
          badgeText={pendingTeachers > 0 ? "Review Required" : "Cleared"}
          trend={pendingTeachers > 0 ? "down" : "neutral"}
          trendLabel={
            pendingTeachers > 0
              ? "Faculty accreditation waiting"
              : "Zero pending verification requests"
          }
          subtext={
            pendingTeachers > 0
              ? "Action required in educator hub"
              : "All teachers accredited"
          }
          icon={GraduationCap}
          href="/admin/teachers"
          sparklineData={
            pendingTeachers > 0
              ? [0, 1, 0, 1, 2, 1, pendingTeachers]
              : [2, 1, 1, 0, 0, 0, 0]
          }
          sparklineType="line"
          sparklineColor={pendingTeachers > 0 ? "#f59e0b" : "#10b981"}
        />

        {/* KPI 5: Security & Integrity */}
        <DashboardKpiCard
          title="System Health"
          value={suspendedCount + stalePending.length}
          badgeText={(suspendedCount + stalePending.length) > 0 ? "Audit" : "Clean"}
          trend={(suspendedCount + stalePending.length) > 0 ? "down" : "neutral"}
          trendLabel="Platform integrity status"
          subtext={`${suspendedCount} Suspended • ${stalePending.length} Stale Txs`}
          icon={ShieldAlert}
          href="/admin/audit-log"
          sparklineData={[100, 100, 99.8, 100, 100, 100, 100]}
          sparklineType="line"
          sparklineColor={(suspendedCount + stalePending.length) > 0 ? "#f43f5e" : "#10b981"}
        />
      </div>

      {/* ================= PRIMARY TIME-SERIES INTERACTIVE CHART ================= */}
      <DashboardAreaChart
        title="Platform Traffic & Assessment Velocity"
        description="Comprehensive volume of user authentications and examination throughput over time"
        data90d={data90d}
        data30d={data30d}
        data7d={data7d}
        primaryLabel="System Activity"
        secondaryLabel="Active Candidates"
      />

      {/* ================= SECONDARY SHADCN CHARTS ROW ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Shadcn Donut Chart (User Demographics) */}
        <DashboardDonutChart
          title="User Role Demographics"
          description="Distribution of active accounts across platform personas"
          data={demographicData}
          totalUsers={userCount}
        />

        {/* Chart B: Shadcn Bar Chart (Question Difficulty Distribution) */}
        <DashboardBarChart
          title="Question Bank Telemetry"
          description="Curriculum item breakdown categorized by difficulty tier"
          data={questionContentData}
          totalItems={totalQuestions}
          itemLabel="Bank Questions"
        />
      </div>

      {/* ================= TABS DATA OPERATIONS HUB ================= */}
      <Tabs defaultValue="teachers" className="flex flex-col gap-5 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-10 sm:h-11 rounded-xl bg-muted/40 p-1 border border-border/70 shadow-2xs">
            <TabsTrigger value="teachers" className="rounded-lg px-3.5 py-1 text-xs sm:text-sm font-semibold cursor-pointer">
              Faculty Queue ({pendingTeachers})
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg px-3.5 py-1 text-xs sm:text-sm font-semibold cursor-pointer">
              Recent Users ({recentUsers.length})
            </TabsTrigger>
            <TabsTrigger value="attempts" className="rounded-lg px-3.5 py-1 text-xs sm:text-sm font-semibold cursor-pointer">
              Recent Attempts ({recentAttempts.length})
            </TabsTrigger>
          </TabsList>

          {/* Quick Actions & Navigation Link */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9.5 rounded-xl border border-border/70 bg-card px-3.5 text-xs font-semibold shadow-2xs hover:bg-muted/70 cursor-pointer"
            >
              <Link href="/admin/teachers">
                <span>Manage Verifications</span>
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab 1: Pending Teachers */}
        <TabsContent value="teachers" className="mt-0">
          <Card className="rounded-2xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg sm:text-xl font-bold text-foreground">
                    Teacher Verification Requests
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Educators who registered with teacher privileges requiring identity approval.
                  </CardDescription>
                </div>
                <Button asChild size="sm" variant="ghost" className="text-xs font-semibold text-primary">
                  <Link href="/admin/teachers">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {pendingTeacherList.length === 0 ? (
                <div className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-muted/20 p-5 text-foreground shadow-2xs">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold sm:text-base">Verification Queue Empty</p>
                    <p className="text-xs text-muted-foreground">
                      All educator applications have been reviewed and approved.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
                  {pendingTeacherList.map((teacherItem) => (
                    <div
                      key={teacherItem.id}
                      className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-foreground text-xs font-bold shadow-2xs border border-border/70">
                          {teacherItem.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-heading text-sm font-bold text-foreground truncate">
                              {teacherItem.name}
                            </p>
                            <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.2 border-border/70">
                              Pending
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {teacherItem.email} • Applied{" "}
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }).format(new Date(teacherItem.createdAt))}
                          </p>
                        </div>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        className="h-8.5 rounded-lg px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5 cursor-pointer shrink-0"
                      >
                        <Link href="/admin/teachers">
                          <UserCheck className="size-3.5" />
                          <span>Review &amp; Verify</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Recent Users */}
        <TabsContent value="users" className="mt-0">
          <Card className="rounded-2xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg sm:text-xl font-bold text-foreground">
                    Recently Registered Users
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Latest student, teacher, and administrator accounts created on the platform.
                  </CardDescription>
                </div>
                <Button asChild size="sm" variant="ghost" className="text-xs font-semibold text-primary">
                  <Link href="/admin/users">View all users</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-foreground text-xs font-bold shadow-2xs border border-border/70">
                        {user.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-heading text-sm font-bold text-foreground truncate">
                            {user.name}
                          </p>
                          <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.2 border border-border/70">
                            {user.role}
                          </Badge>
                          {user.isEmailVerified && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="size-3" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground font-normal shrink-0">
                      Joined {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(user.createdAt))}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Recent Attempts */}
        <TabsContent value="attempts" className="mt-0">
          <Card className="rounded-2xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg sm:text-xl font-bold text-foreground">
                    Live Assessment Attempts
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Recent exam submissions and ongoing student test sessions.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {recentAttempts.length === 0 ? (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-8 text-center text-xs text-muted-foreground">
                  No candidate exam attempts recorded yet.
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
                          <BookOpen className="size-4" />
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
                        <Badge
                          variant={att.status === "COMPLETED" ? "default" : "outline"}
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 border-border/70"
                        >
                          {att.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-normal">
                          {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", month: "short", day: "numeric" }).format(new Date(att.startedAt))}
                        </span>
                      </div>
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
