import { prisma } from "@/lib/db"

/**
 * Retention policy: violation evidence is kept for the life of the exam and
 * for a grace period after it's archived, then eligible for purge — EXCEPT
 * for any attempt with a still-PENDING appeal, which is never purged
 * regardless of age (destroying evidence mid-dispute would be worse than
 * keeping it a little longer). There's no policy for purging while an exam
 * is still DRAFT/PUBLISHED — only an archived, settled exam's old evidence
 * is ever removed.
 */
export const VIOLATION_RETENTION_DAYS = 180

export async function purgeExpiredViolationEvents() {
  const cutoff = new Date(Date.now() - VIOLATION_RETENTION_DAYS * 24 * 60 * 60 * 1000)

  const eligibleAttempts = await prisma.examAttempt.findMany({
    where: {
      exam: { status: "ARCHIVED", archivedAt: { lt: cutoff } },
      appeals: { none: { status: "PENDING" } },
    },
    select: { id: true },
  })

  if (eligibleAttempts.length === 0) return { purged: 0 }

  const { count } = await prisma.violationEvent.deleteMany({
    where: { attemptId: { in: eligibleAttempts.map((a) => a.id) } },
  })

  return { purged: count }
}
