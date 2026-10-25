import type { Prisma, PrismaClient, XPReason } from "@/prisma/generated/prisma/client"
import { prisma } from "@/lib/db"

export const XP_PER_CORRECT_ANSWER = 10
export const XP_PERFECT_SCORE_BONUS = 50
export const XP_PER_STREAK_DAY = 5
export const XP_PER_MISTAKE_CORRECTED = 15

type Tx = PrismaClient | Prisma.TransactionClient

/**
 * The only way XP is ever awarded. Idempotent by construction: the
 * (studentId, sourceType, sourceId) unique constraint on XPTransaction means
 * a retried or duplicated request for the exact same real-world event (the
 * same exam attempt, the same calendar day, the same review submission)
 * always collides on that constraint — never a second row, never double XP.
 * Callers choose sourceId to be something stable across retries of the SAME
 * event (an attemptId, a YYYY-MM-DD string, a client-generated nonce for
 * actions with no other natural stable id) — see the call sites in
 * lib/grading/finalize.ts, lib/learning/streak.ts's callers, and
 * actions/learning.actions.ts.
 *
 * Uses createMany + skipDuplicates (SQL `ON CONFLICT DO NOTHING`) rather
 * than create() wrapped in a try/catch for the unique-constraint violation:
 * Postgres aborts an entire transaction the instant ANY statement in it
 * raises a SQL-level error, even one the client catches in JS — so a plain
 * create() that hits the unique constraint would poison the rest of the
 * surrounding grading transaction (every later statement in the same
 * `prisma.$transaction` callback would then fail with "current transaction
 * is aborted"). ON CONFLICT DO NOTHING never raises that error in the first
 * place, so it's the only Postgres-safe way to do this inside a transaction.
 */
export async function awardXP(
  tx: Tx,
  studentId: string,
  amount: number,
  reason: XPReason,
  sourceType: string,
  sourceId: string
): Promise<{ awarded: boolean }> {
  const { count } = await tx.xPTransaction.createMany({
    data: [{ studentId, amount, reason, sourceType, sourceId }],
    skipDuplicates: true,
  })
  return { awarded: count > 0 }
}

export async function getTotalXP(studentId: string): Promise<number> {
  const result = await prisma.xPTransaction.aggregate({
    where: { studentId },
    _sum: { amount: true },
  })
  return result._sum.amount ?? 0
}

/**
 * Simple, documented level curve: level N requires N*100 cumulative XP more
 * than level N-1 (i.e. a triangular threshold), computed on read from the
 * ledger total rather than stored — there is nothing to keep in sync.
 */
export function levelForXP(totalXP: number): { level: number; xpIntoLevel: number; xpForNextLevel: number } {
  let level = 1
  let threshold = 0
  let step = 100
  while (totalXP >= threshold + step) {
    threshold += step
    level += 1
    step += 100
  }
  return { level, xpIntoLevel: totalXP - threshold, xpForNextLevel: step }
}
