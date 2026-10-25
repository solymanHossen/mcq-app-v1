import { prisma } from "@/lib/db"
import { getTotalXP, levelForXP } from "./xp"
import { BADGES } from "./badges"

/**
 * Access policy: every query here is scoped to a single `studentId` baked
 * into the `where` clause — there is no "list all students'" variant. A
 * student's bookmarks, mistakes, progress, XP, and streak are never visible
 * to another student; only to themselves (enforced by the caller passing
 * the current session's own id — see actions/learning.actions.ts and the
 * pages that call these directly).
 */

export function getBookmarks(studentId: string) {
  return prisma.questionBookmark.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: {
      examQuestion: {
        select: {
          id: true,
          questionTextSnapshot: true,
          examId: true,
          exam: { select: { id: true, title: true } },
        },
      },
    },
  })
}

/**
 * "Active mistake" = this ExamQuestion's most recent outcome for this
 * student was incorrect. Once a review (or a retake) answers it correctly,
 * lastOutcomeCorrect flips true and it naturally drops off this list — see
 * lib/learning/progress.ts and lib/learning/spaced-repetition.ts for the two
 * places that can flip it.
 */
export function getMistakeNotebook(studentId: string) {
  return prisma.questionProgress.findMany({
    where: { studentId, lastOutcomeCorrect: false },
    orderBy: { lastAttemptedAt: "desc" },
    include: {
      examQuestion: {
        select: {
          id: true,
          questionTextSnapshot: true,
          optionASnapshot: true,
          optionBSnapshot: true,
          optionCSnapshot: true,
          optionDSnapshot: true,
          correctOptionSnapshot: true,
          exam: { select: { id: true, title: true, answerKeyReleased: true } },
        },
      },
    },
  })
}

export function getDueReviews(studentId: string, now: Date = new Date()) {
  return prisma.questionProgress.findMany({
    where: {
      studentId,
      nextReviewAt: { lte: now },
      masteryStatus: { not: "MASTERED" },
    },
    orderBy: { nextReviewAt: "asc" },
    take: 20,
    include: {
      examQuestion: {
        select: {
          id: true,
          questionTextSnapshot: true,
          exam: { select: { id: true, title: true, answerKeyReleased: true } },
        },
      },
    },
  })
}

export async function getLearningSummary(studentId: string) {
  const [totalXP, streak, earnedBadges] = await Promise.all([
    getTotalXP(studentId),
    prisma.userStreak.findUnique({ where: { studentId } }),
    prisma.userBadge.findMany({ where: { studentId }, orderBy: { earnedAt: "desc" } }),
  ])

  const earnedKeys = new Set(earnedBadges.map((b) => b.badgeKey))

  return {
    totalXP,
    ...levelForXP(totalXP),
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    badges: BADGES.map((badge) => ({
      ...badge,
      earned: earnedKeys.has(badge.key),
      earnedAt: earnedBadges.find((b) => b.badgeKey === badge.key)?.earnedAt ?? null,
    })),
  }
}
