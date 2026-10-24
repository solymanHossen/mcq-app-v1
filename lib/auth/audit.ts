import { prisma } from "@/lib/db"
import type {
  AuditAction,
  Prisma,
} from "@/prisma/generated/prisma/client"

export async function recordAuditEvent(opts: {
  action: AuditAction
  success?: boolean
  identifier?: string
  ip?: string
  actorId?: string
  metadata?: Prisma.InputJsonValue
}) {
  // Audit logging must never block or break the caller's actual operation.
  try {
    await prisma.auditLog.create({
      data: {
        action: opts.action,
        success: opts.success ?? true,
        identifier: opts.identifier,
        ip: opts.ip,
        actorId: opts.actorId,
        metadata: opts.metadata,
      },
    })
  } catch (e) {
    console.error("[audit] failed to record event", opts.action, e)
  }
}
