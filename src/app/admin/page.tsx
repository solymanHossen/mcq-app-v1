import Link from "next/link"
import { connection } from "next/server"
import { prisma } from "@/lib/db"
import { getStalePendingTransactions } from "@/lib/payments/queries"
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/users">
          <Card>
            <CardHeader>
              <CardDescription>Total users</CardDescription>
              <CardTitle>{userCount}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/teachers">
          <Card>
            <CardHeader>
              <CardDescription>Pending teacher verifications</CardDescription>
              <CardTitle>{pendingTeachers}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/users">
          <Card>
            <CardHeader>
              <CardDescription>Suspended accounts</CardDescription>
              <CardTitle>{suspendedCount}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/payments">
          <Card>
            <CardHeader>
              <CardDescription>Transactions needing reconciliation</CardDescription>
              <CardTitle>{stalePending.length}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
