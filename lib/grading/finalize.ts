import { prisma } from "@/lib/db"
import { computeGrade } from "./engine"

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
      select: { examId: true },
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

    return { graded: true }
  })
}
