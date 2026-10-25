import type { Prisma, PrismaClient } from "@/prisma/generated/prisma/client"

/**
 * Fixed badge catalog. Deliberately small and code-defined rather than
 * database-editable — adding a badge is a code change + migration-free
 * deploy, not a new admin surface, which this phase doesn't need.
 */
export const BADGES = [
  {
    key: "FIRST_EXAM",
    name: "First Steps",
    description: "Complete your first exam",
  },
  {
    key: "PERFECT_SCORE",
    name: "Perfectionist",
    description: "Score 100% on an exam",
  },
  {
    key: "STREAK_7",
    name: "Week Warrior",
    description: "Maintain a 7-day activity streak",
  },
  {
    key: "STREAK_30",
    name: "Monthly Master",
    description: "Maintain a 30-day activity streak",
  },
  {
    key: "MISTAKE_SLAYER_10",
    name: "Mistake Slayer",
    description: "Correct 10 mistakes in the review queue",
  },
  {
    key: "XP_500",
    name: "Rising Star",
    description: "Earn 500 total XP",
  },
] as const

export type BadgeKey = (typeof BADGES)[number]["key"]

type Tx = PrismaClient | Prisma.TransactionClient

// ON CONFLICT DO NOTHING, not create()+catch(P2002) — see the comment on
// lib/learning/xp.ts's awardXP for why: a caught unique-constraint error
// still poisons the rest of the surrounding Postgres transaction.
async function award(tx: Tx, studentId: string, badgeKey: BadgeKey): Promise<boolean> {
  const { count } = await tx.userBadge.createMany({
    data: [{ studentId, badgeKey }],
    skipDuplicates: true,
  })
  return count > 0
}

/**
 * Evaluated after the event(s) that could plausibly unlock a badge, with
 * just enough context to check each one cheaply — never a full table scan
 * of the student's history. Every award is independently idempotent (same
 * unique-constraint pattern as XP), so calling this redundantly after
 * unrelated events is always safe.
 */
export async function evaluateBadgesAfterExamCompletion(
  tx: Tx,
  studentId: string,
  context: { isFirstCompletedExam: boolean; accuracy: number }
): Promise<BadgeKey[]> {
  const newlyAwarded: BadgeKey[] = []

  if (context.isFirstCompletedExam && (await award(tx, studentId, "FIRST_EXAM"))) {
    newlyAwarded.push("FIRST_EXAM")
  }
  if (context.accuracy >= 1 && (await award(tx, studentId, "PERFECT_SCORE"))) {
    newlyAwarded.push("PERFECT_SCORE")
  }

  newlyAwarded.push(...(await evaluateXPBadges(tx, studentId)))
  return newlyAwarded
}

export async function evaluateBadgesAfterStreakUpdate(
  tx: Tx,
  studentId: string,
  currentStreak: number
): Promise<BadgeKey[]> {
  const newlyAwarded: BadgeKey[] = []

  if (currentStreak >= 7 && (await award(tx, studentId, "STREAK_7"))) {
    newlyAwarded.push("STREAK_7")
  }
  if (currentStreak >= 30 && (await award(tx, studentId, "STREAK_30"))) {
    newlyAwarded.push("STREAK_30")
  }

  return newlyAwarded
}

export async function evaluateBadgesAfterMistakeReview(
  tx: Tx,
  studentId: string
): Promise<BadgeKey[]> {
  const newlyAwarded: BadgeKey[] = []

  const correctedCount = await tx.xPTransaction.count({
    where: { studentId, reason: "MISTAKE_REVIEWED" },
  })
  if (correctedCount >= 10 && (await award(tx, studentId, "MISTAKE_SLAYER_10"))) {
    newlyAwarded.push("MISTAKE_SLAYER_10")
  }

  newlyAwarded.push(...(await evaluateXPBadges(tx, studentId)))
  return newlyAwarded
}

async function evaluateXPBadges(tx: Tx, studentId: string): Promise<BadgeKey[]> {
  const newlyAwarded: BadgeKey[] = []
  const { _sum } = await tx.xPTransaction.aggregate({
    where: { studentId },
    _sum: { amount: true },
  })
  const totalXP = _sum.amount ?? 0

  if (totalXP >= 500 && (await award(tx, studentId, "XP_500"))) {
    newlyAwarded.push("XP_500")
  }

  return newlyAwarded
}
