import Link from "next/link"
import { connection } from "next/server"
import {
  Users,
  GraduationCap,
  ShieldAlert,
  Receipt,
  ChevronRight,
  ShieldCheck,
  Crown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
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
import { ProfileHero } from "@/modules/account/components/profile-hero"
import { DashboardKpiCard } from "@/components/shared/dashboard-kpi-card"
import { DashboardAreaChart } from "@/components/shared/dashboard-area-chart"
import { generateDashboardChartData } from "@/lib/chart-data-utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export const metadata = {
  title: "Admin Dashboard",
  description: "Enterprise system management, teacher verification queue, and billing telemetry.",
}

export default async function AdminDashboardPage() {
  const admin = await requireRole(...ADMIN_ROLES)

  // getStalePendingTransactions computes `now` internally (Date.now()), an
  // unstable value Cache Components refuses to bake into a prerendered
  // page — connection() is Next's own documented way to say "this render
  // only ever happens per-request," matching this page's actual nature
  // (live counts for an admin, never a static shell).
  await connection()

  const [
    adminUser,
    userCount,
    pendingTeachers,
    suspendedCount,
    stalePending,
    totalExams,
    recentUsers,
    pendingTeacherList,
  ] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: admin.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        isEmailVerified: true,
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "TEACHER", teacherVerificationStatus: "PENDING" } }),
    prisma.user.count({ where: { isActive: false } }),
    getStalePendingTransactions(),
    prisma.exam.count(),
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
  ])

  const heroUser = {
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role,
    isEmailVerified: adminUser.isEmailVerified,
    createdAt: adminUser.createdAt,
    lastLoginAt: adminUser.lastLoginAt,
    adminStats: {
      totalUsers: userCount,
      totalPlatformExams: totalExams,
      pendingVerifications: pendingTeachers,
    },
  }

  // Pre-calculate chart points
  const { data90d, data30d, data7d } = generateDashboardChartData(
    userCount * 4,
    Math.round(userCount * 1.8)
  )

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* ================= COMPACT PROFILE HERO ================= */}
      <ProfileHero user={heroUser} />

      {/* ================= 4-TILE KPI METRICS ROW (MATCHING REFERENCE SCREENSHOT) ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Total Users */}
        <DashboardKpiCard
          title="Total Users"
          value={userCount}
          badgeText="+24.8%"
          trend="up"
          trendLabel="Growing user base"
          subtext="Students, faculty & admin accounts"
          href="/admin/users"
        />

        {/* KPI 2: Teacher Verifications */}
        <DashboardKpiCard
          title="Teacher Verifications"
          value={pendingTeachers}
          badgeText={pendingTeachers > 0 ? "Review Queue" : "Clear"}
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
          highlight={pendingTeachers > 0}
          href="/admin/teachers"
        />

        {/* KPI 3: Suspended Accounts */}
        <DashboardKpiCard
          title="Suspended Accounts"
          value={suspendedCount}
          badgeText={suspendedCount > 0 ? "Review" : "Optimal"}
          trend="neutral"
          trendLabel="System security status"
          subtext="Locked or restricted user profiles"
          href="/admin/users"
        />

        {/* KPI 4: Financial Reconciliation */}
        <DashboardKpiCard
          title="Reconciliation"
          value={stalePending.length}
          badgeText={stalePending.length > 0 ? "Audit Needed" : "Healthy"}
          trend={stalePending.length > 0 ? "down" : "neutral"}
          trendLabel={
            stalePending.length > 0
              ? "Stale gateway transactions"
              : "Payment reconciliation clean"
          }
          subtext={
            stalePending.length > 0
              ? "Requires manual invoice check"
              : "All subscriptions up to date"
          }
          highlight={stalePending.length > 0}
          href="/admin/payments"
        />
      </div>

      {/* ================= INTERACTIVE PLATFORM TRAFFIC CHART ================= */}
      <DashboardAreaChart
        title="Platform Traffic & User Ingestion"
        description="Total user traffic and system authentication volume for the last 3 months"
        data90d={data90d}
        data30d={data30d}
        data7d={data7d}
        primaryLabel="System Activity"
        secondaryLabel="Active Sessions"
      />

      {/* ================= SUB-NAVIGATION TABS & DATA SECTIONS (MATCHING REFERENCE SCREENSHOT) ================= */}
      <Tabs defaultValue="teachers" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-10 rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="teachers" className="rounded-lg text-xs font-semibold sm:text-sm">
              Teacher Queue ({pendingTeachers})
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg text-xs font-semibold sm:text-sm">
              Recent Users ({recentUsers.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg text-xs font-semibold sm:text-sm">
              Reconciliation ({stalePending.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button asChild variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold">
              <Link href="/admin/users">
                <span>Manage Users</span>
                <ChevronRight className="ml-1 size-3.5" />
              </Link>
            </Button>
            <Button asChild size="sm" className="h-9 rounded-xl text-xs font-semibold shadow-xs">
              <Link href="/admin/audit-log">
                <ShieldCheck className="mr-1 size-3.5" />
                <span>Audit Log</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab 1: Pending Teachers */}
        <TabsContent value="teachers" className="mt-0">
          <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex flex-col gap-1">
                <CardTitle className="font-heading text-lg font-bold text-foreground">
                  Teacher Verification Requests
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                  Educators who registered with teacher privileges requiring identity approval.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {pendingTeacherList.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold sm:text-sm">Verification Queue Empty</p>
                    <p className="text-xs text-muted-foreground">
                      No educators currently awaiting accreditation review.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/50 rounded-xl border border-border/60">
                  {pendingTeacherList.map((teacherItem) => (
                    <div
                      key={teacherItem.id}
                      className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-heading text-sm font-bold text-foreground">
                            {teacherItem.name}
                          </p>
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                            Pending
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {teacherItem.email} • Requested on{" "}
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                          }).format(new Date(teacherItem.createdAt))}
                        </p>
                      </div>

                      <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs font-semibold">
                        <Link href="/admin/teachers">
                          <span>Review Accreditation</span>
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

        {/* Tab 2: Recent Users */}
        <TabsContent value="users" className="mt-0">
          <Card className="rounded-2xl border border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex flex-col gap-1">
                <CardTitle className="font-heading text-lg font-bold text-foreground">
                  Recent User Registrations
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground sm:text-sm">
                  Latest candidates, teachers, and staff joining the platform.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col justify-between gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-4 transition-all hover:bg-muted/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-heading text-sm font-bold text-foreground truncate">
                          {u.name}
                        </p>
                        <Badge variant="secondary" className="text-[10px]">
                          {u.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                      <span>
                        Joined{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(u.createdAt))}
                      </span>
                      <span className={u.isActive ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>
                        {u.isActive ? "Active" : "Locked"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Payments */}
        <TabsContent value="payments" className="mt-0">
          <Card className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="font-heading text-lg font-bold text-foreground">
                Payment Reconciliation &amp; Gateway Health
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Transactions requiring administrative reconciliation or verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {stalePending.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold sm:text-sm">Billing Gateways Reconciled</p>
                    <p className="text-xs text-muted-foreground">
                      Zero stale pending transactions detected across payment providers.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    There are <span className="font-bold text-destructive">{stalePending.length} transactions</span> pending reconciliation.
                  </p>
                  <Button asChild variant="destructive" size="sm" className="self-start rounded-xl px-4 text-xs">
                    <Link href="/admin/payments">Open Payment Reconciliation</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
