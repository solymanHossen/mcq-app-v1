import Link from "next/link"
import { connection } from "next/server"
import { Users, GraduationCap, ShieldAlert, Receipt } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getStalePendingTransactions } from "@/modules/payments/queries"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AdminDashboardPage() {
  // getStalePendingTransactions computes `now` internally (Date.now()), an
  // unstable value Cache Components refuses to bake into a prerendered
  // page — connection() is Next's own documented way to say "this render
  // only ever happens per-request," matching this page's actual nature
  // (live counts for an admin, never a static shell).
  await connection()

  const [userCount, pendingTeachers, suspendedCount, stalePending] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "TEACHER", teacherVerificationStatus: "PENDING" } }),
    prisma.user.count({ where: { isActive: false } }),
    getStalePendingTransactions(),
  ])

  const stats = [
    {
      href: "/admin/users",
      label: "Total users",
      value: userCount,
      icon: Users,
      highlight: false,
    },
    {
      href: "/admin/teachers",
      label: "Pending teacher verifications",
      value: pendingTeachers,
      icon: GraduationCap,
      highlight: pendingTeachers > 0,
    },
    {
      href: "/admin/users",
      label: "Suspended accounts",
      value: suspendedCount,
      icon: ShieldAlert,
      highlight: false,
    },
    {
      href: "/admin/payments",
      label: "Transactions needing reconciliation",
      value: stalePending.length,
      icon: Receipt,
      highlight: stalePending.length > 0,
    },
  ] as const

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of accounts, verification, and billing health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ href, label, value, icon: Icon, highlight }) => (
          <Link key={label} href={href}>
            <Card className="h-full gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30">
              <CardHeader>
                <span
                  className={`mb-2 flex size-9 items-center justify-center rounded-lg ${
                    highlight ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="size-4.5" />
                </span>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
