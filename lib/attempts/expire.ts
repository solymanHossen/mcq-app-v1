import { prisma } from "@/lib/db"
import type { AttemptStatus } from "@/prisma/generated/prisma/client"

/**
 * Lazily self-heals an attempt that's past its deadline but still marked
 * IN_PROGRESS — called at the top of every action that touches an attempt
 * (save, submit, resume). This means correctness never depends on a
 * background sweep actually running: even if the cron worker is down for a
 * week, the very next time anyone touches an expired attempt it flips to
 * TIMEOUT before anything else happens.
 *
 * The update is conditional (`updateMany` + `status: "IN_PROGRESS"` in the
 * WHERE clause) so two concurrent callers racing on the same expired attempt
 * can't both "win" — only one UPDATE actually matches a row.
 */
export async function finalizeIfExpired<
  T extends { id: string; status: AttemptStatus; deadline: Date },
>(attempt: T): Promise<T> {
  if (attempt.status !== "IN_PROGRESS" || attempt.deadline > new Date()) {
    return attempt
  }

  const { count } = await prisma.examAttempt.updateMany({
    where: { id: attempt.id, status: "IN_PROGRESS" },
    data: { status: "TIMEOUT", submittedAt: new Date() },
  })

  return count > 0 ? { ...attempt, status: "TIMEOUT" } : attempt
}

/**
 * Background-worker entry point: sweeps every attempt past its deadline in
 * one pass. Intended to be hit by a scheduled job (see
 * app/api/cron/sweep-expired-attempts/route.ts), but it's purely a
 * convenience/promptness optimization — finalizeIfExpired() above makes the
 * system correct even if this never runs.
 */
export async function sweepExpiredAttempts() {
  const { count } = await prisma.examAttempt.updateMany({
    where: { status: "IN_PROGRESS", deadline: { lt: new Date() } },
    data: { status: "TIMEOUT", submittedAt: new Date() },
  })
  return { expired: count }
}
