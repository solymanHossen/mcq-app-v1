import { prisma } from "@/lib/prisma"
import { computeGrade } from "./engine"
import { recordAttemptProgress } from "@/modules/learning/progress"
import { awardXP, XP_PER_CORRECT_ANSWER, XP_PERFECT_SCORE_BONUS } from "@/modules/learning/xp"
import { evaluateBadgesAfterExamCompletion } from "@/modules/learning/badges"

/**
 * The single place an attempt transitions out of IN_PROGRESS and gets
 * graded — called from the manual-submit action, the lazy expiry check, and
 * the sweep worker alike. The status transition is conditional
 * (`WHERE status = 'IN_PROGRESS'`) and grading happens in the same
 * transaction as that transition, so the pair is atomic: a status flip can
 * never happen without a result, and a result can never be produced twice
 * for the same attempt, no matter how many callers race to finalize it.
 */
export async function finalizeAndGradeAttempt(
  attemptId: string,
  nextStatus: "COMPLETED" | "TIMEOUT"
): Promise<{ graded: boolean }> {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.examAttempt.updateMany({
      where: { id: attemptId, status: "IN_PROGRESS" },
      data: { status: nextStatus, submittedAt: new Date() },
    })
    if (count === 0) {
      return { graded: false } // someone else already finalized it
    }

    const grade = await computeGrade(tx, attemptId)
    const attempt = await tx.examAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      select: { examId: true, studentId: true },
    })

    await tx.examResult.create({
      data: { attemptId, ...grade },
    })
    await tx.gradingAuditLog.create({
      data: {
        examId: attempt.examId,
        attemptId,
        action: "GRADED",
        newScore: grade.obtainedMarks,
      },
    })

    // Learning-platform side effects of a freshly graded attempt. These
    // react to every grading path (manual submit, timeout, the passive
    // sweep) alike — unlike the timezone-aware daily-streak update, which
    // only fires from a live client request (see actions/attempt.actions.ts)
    // and so can't live here.
    await recordAttemptProgress(tx, attemptId, attempt.studentId)

    const xpAmount =
      grade.correctCount * XP_PER_CORRECT_ANSWER +
      (grade.accuracy >= 1 ? XP_PERFECT_SCORE_BONUS : 0)
    if (xpAmount > 0) {
      await awardXP(tx, attempt.studentId, xpAmount, "EXAM_COMPLETED", "EXAM_ATTEMPT", attemptId)
    }

    const priorResultCount = await tx.examResult.count({
      where: { attempt: { studentId: attempt.studentId } },
    })
    await evaluateBadgesAfterExamCompletion(tx, attempt.studentId, {
      isFirstCompletedExam: priorResultCount === 1,
      accuracy: grade.accuracy,
    })

    return { graded: true }
  })
}
