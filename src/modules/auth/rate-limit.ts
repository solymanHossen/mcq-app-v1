import { prisma } from "@/lib/db"
import type { AuditAction } from "@/prisma/generated/prisma/client"

const MINUTE = 60_000
const HOUR = 60 * MINUTE

/**
 * Centralized thresholds. Counts are read from AuditLog, so there's no
 * separate counter store to reset — a single Postgres index scan per check.
 * Fine at this app's scale; a high-traffic deployment should move this to a
 * dedicated TTL'd store (Redis) instead of querying the audit trail.
 */
export const RATE_LIMITS = {
  loginPerEmail: { action: "LOGIN_FAILURE" as AuditAction, limit: 10, windowMs: 15 * MINUTE },
  loginPerIp: { action: "LOGIN_FAILURE" as AuditAction, limit: 30, windowMs: 15 * MINUTE },
  registerPerIp: { action: "REGISTER" as AuditAction, limit: 10, windowMs: HOUR },
  forgotPasswordPerEmail: { action: "PASSWORD_RESET_REQUESTED" as AuditAction, limit: 5, windowMs: HOUR },
  forgotPasswordPerIp: { action: "PASSWORD_RESET_REQUESTED" as AuditAction, limit: 20, windowMs: HOUR },
  verifyEmailPerEmail: { action: "EMAIL_VERIFY_FAILED" as AuditAction, limit: 10, windowMs: 15 * MINUTE },
  resendOtpPerEmail: { action: "OTP_RESENT" as AuditAction, limit: 5, windowMs: HOUR },
} as const

async function countRecentEvents(opts: {
  action: AuditAction
  identifier?: string
  ip?: string
  windowMs: number
}) {
  const since = new Date(Date.now() - opts.windowMs)
  return prisma.auditLog.count({
    where: {
      action: opts.action,
      createdAt: { gte: since },
      ...(opts.identifier !== undefined ? { identifier: opts.identifier } : {}),
      ...(opts.ip !== undefined ? { ip: opts.ip } : {}),
    },
  })
}

type RateLimitRule = { action: AuditAction; limit: number; windowMs: number }

/** Checks one dimension (identifier or IP) against one rule. */
export async function isRateLimited(
  rule: RateLimitRule,
  key: { identifier?: string } | { ip?: string }
) {
  if (!("identifier" in key && key.identifier) && !("ip" in key && key.ip)) {
    return false
  }
  const count = await countRecentEvents({ ...rule, ...key })
  return count >= rule.limit
}

/** Checks both the per-identifier and per-IP rules; true if either trips. */
export async function isLoginRateLimited(identifier: string, ip?: string) {
  const byEmail = await isRateLimited(RATE_LIMITS.loginPerEmail, { identifier })
  if (byEmail) return true
  if (ip) return isRateLimited(RATE_LIMITS.loginPerIp, { ip })
  return false
}

export async function isRegisterRateLimited(ip?: string) {
  if (!ip) return false
  return isRateLimited(RATE_LIMITS.registerPerIp, { ip })
}

export async function isForgotPasswordRateLimited(
  identifier: string,
  ip?: string
) {
  const byEmail = await isRateLimited(RATE_LIMITS.forgotPasswordPerEmail, {
    identifier,
  })
  if (byEmail) return true
  if (ip) return isRateLimited(RATE_LIMITS.forgotPasswordPerIp, { ip })
  return false
}

export async function isVerifyEmailRateLimited(identifier: string) {
  return isRateLimited(RATE_LIMITS.verifyEmailPerEmail, { identifier })
}

export async function isResendOtpRateLimited(identifier: string) {
  return isRateLimited(RATE_LIMITS.resendOtpPerEmail, { identifier })
}
