import { prisma } from "@/lib/db"
import type { AttemptStatus } from "@/prisma/generated/prisma/client"
import { finalizeAndGradeAttempt } from "@/lib/grading/finalize"

/**
 * Lazily self-heals an attempt that's past its deadline but still marked
 * IN_PROGRESS — called at the top of every action that touches an attempt
 * (save, submit, resume). This means correctness never depends on a
 * background sweep actually running: even if the cron worker is down for a
 * week, the very next time anyone touches an expired attempt it flips to
 * TIMEOUT (and gets graded) before anything else happens.
 */
export async function finalizeIfExpired<
  T extends { id: string; status: AttemptStatus; deadline: Date },
>(attempt: T): Promise<T> {
  if (attempt.status !== "IN_PROGRESS" || attempt.deadline > new Date()) {
    return attempt
  }

  const { graded } = await finalizeAndGradeAttempt(attempt.id, "TIMEOUT")
  if (graded) return { ...attempt, status: "TIMEOUT" }

  // Someone else (a racing request, or the sweep worker) finalized it first
  // — re-read to report whatever status it actually ended up with.
  const fresh = await prisma.examAttempt.findUniqueOrThrow({
    where: { id: attempt.id },
    select: { status: true },
  })
  return { ...attempt, status: fresh.status }
}

/**
 * Background-worker entry point: sweeps every attempt past its deadline.
 * Intended to be hit by a scheduled job (see
 * app/api/cron/sweep-expired-attempts/route.ts), but it's purely a
 * convenience/promptness optimization — finalizeIfExpired() above makes the
 * system correct even if this never runs. Grading needs each attempt's own
 * answers, so this can't be a single bulk UPDATE like before Phase 4 — it
 * finalizes (and grades) one attempt at a time.
 */
export async function sweepExpiredAttempts() {
  const expired = await prisma.examAttempt.findMany({
    where: { status: "IN_PROGRESS", deadline: { lt: new Date() } },
    select: { id: true },
  })

  let gradedCount = 0
  for (const { id } of expired) {
    const { graded } = await finalizeAndGradeAttempt(id, "TIMEOUT")
    if (graded) gradedCount++
  }

  return { expired: gradedCount }
}
