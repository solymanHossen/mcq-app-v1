import type { Prisma, PrismaClient, AdminAuditAction } from "@/prisma/generated/prisma/client"

type Tx = PrismaClient | Prisma.TransactionClient

/**
 * The one way an AdminAuditLog row is ever created — every sensitive admin
 * action (suspend/reinstate, teacher verification, refunds, plan/coupon
 * changes) goes through this, never a direct `prisma.adminAuditLog.create`
 * at the call site, so the shape stays consistent and every such action is
 * guaranteed to leave a record. Append-only: nothing in this codebase ever
 * updates or deletes a row here.
 */
export async function recordAdminAction(
  tx: Tx,
  opts: {
    action: AdminAuditAction
    actorId: string
    targetUserId?: string
    reason?: string
    metadata?: Prisma.InputJsonValue
  }
) {
  await tx.adminAuditLog.create({
    data: {
      action: opts.action,
      actorId: opts.actorId,
      targetUserId: opts.targetUserId,
      reason: opts.reason,
      metadata: opts.metadata,
    },
  })
}
