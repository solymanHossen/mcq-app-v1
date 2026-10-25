import { prisma } from "@/lib/prisma"

/**
 * Access policy: every "for a user" query here is scoped by a `userId`
 * parameter the caller supplies from their own session — never from a
 * client-provided id. A student/teacher sees only their own payment
 * history and invoices; only the admin-prefixed queries below ever see
 * across users, and only actions/admin-billing.actions.ts (ADMIN-gated)
 * calls those.
 */

export function getPaymentHistoryForUser(userId: string) {
  return prisma.paymentTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
  })
}

export function getSubscriptionHistoryForUser(userId: string) {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { plan: true },
  })
}

export function listActivePlans() {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { priceCents: "asc" },
  })
}

// ─── Admin-only (caller enforces the role check before calling these) ──

export function adminListPaymentTransactions(opts: { page: number; pageSize: number }) {
  const skip = (opts.page - 1) * opts.pageSize
  return Promise.all([
    prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: opts.pageSize,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.paymentTransaction.count(),
  ])
}

const STALE_PENDING_THRESHOLD_MS = 60 * 60 * 1000 // 1 hour

/** Transactions stuck PENDING long enough that a webhook almost certainly
 * should have resolved them by now — the reconciliation queue. */
export function getStalePendingTransactions() {
  return prisma.paymentTransaction.findMany({
    where: { status: "PENDING", createdAt: { lt: new Date(Date.now() - STALE_PENDING_THRESHOLD_MS) } },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  })
}

export function listAllSubscriptionPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { createdAt: "asc" } })
}

export function listAllCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, take: 500 })
}

export function listPendingTeacherVerifications() {
  return prisma.user.findMany({
    where: { role: "TEACHER", teacherVerificationStatus: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, createdAt: true },
    take: 500,
  })
}

export function listUsers(opts: {
  page: number
  pageSize: number
  role?: "ADMIN" | "TEACHER" | "STUDENT"
  search?: string
}) {
  const skip = (opts.page - 1) * opts.pageSize
  const search = opts.search?.trim()
  const where = {
    ...(opts.role ? { role: opts.role } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  return Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: opts.pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        teacherVerificationStatus: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ])
}

export function listAdminAuditLog(opts: { page: number; pageSize: number }) {
  const skip = (opts.page - 1) * opts.pageSize
  return Promise.all([
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: opts.pageSize,
      include: {
        actor: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
      },
    }),
    prisma.adminAuditLog.count(),
  ])
}
