import { prisma } from "@/lib/db"
import type { OptionChoice } from "@/prisma/generated/prisma/client"
import { computeGrade } from "./engine"

export type QuestionCorrection = {
  correctOption?: OptionChoice
  isCancelled?: boolean
}

/**
 * Applies a post-publication correction to one ExamQuestion (the exam's own
 * frozen snapshot — never the reusable bank Question, which this exam has
 * already copied away from) and regrades every already-finalized attempt.
 *
 * Deliberately narrow: only correctOptionSnapshot / isCancelled can change
 * here. Marks, question text, and the question list itself stay locked by
 * Phase 2's publish rule — this is a controlled, audited exception for
 * answer-key errors specifically, not a reopening of the exam for editing.
 */
export async function applyCorrectionAndRegrade(opts: {
  examId: string
  examQuestionId: string
  correction: QuestionCorrection
  reason: string
  actorId: string
}): Promise<{ regradedCount: number }> {
  await prisma.$transaction([
    prisma.examQuestion.update({
      where: { id: opts.examQuestionId },
      data: {
        ...(opts.correction.correctOption !== undefined
          ? { correctOptionSnapshot: opts.correction.correctOption }
          : {}),
        ...(opts.correction.isCancelled !== undefined
          ? { isCancelled: opts.correction.isCancelled }
          : {}),
      },
    }),
    prisma.gradingAuditLog.create({
      data: {
        examId: opts.examId,
        examQuestionId: opts.examQuestionId,
        action: opts.correction.isCancelled
          ? "QUESTION_CANCELLED"
          : "QUESTION_CORRECTED",
        actorId: opts.actorId,
        reason: opts.reason,
        metadata: opts.correction,
      },
    }),
  ])

  const attempts = await prisma.examAttempt.findMany({
    where: { examId: opts.examId, status: { in: ["COMPLETED", "TIMEOUT"] } },
    select: { id: true },
  })

  let regradedCount = 0
  for (const { id: attemptId } of attempts) {
    const didChange = await regradeAttempt(
      attemptId,
      opts.examId,
      opts.actorId,
      opts.reason
    )
    if (didChange) regradedCount++
  }

  return { regradedCount }
}

/**
 * Recomputes one attempt's result. Returns false (and writes nothing) if the
 * recomputed grade is identical to what's stored — most corrections only
 * affect students who answered that specific question a specific way, so
 * this avoids flooding the audit log with no-op entries for everyone else.
 *
 * Uses optimistic concurrency (the stored gradingVersion) rather than a
 * row lock: if two corrections land close together and both try to regrade
 * the same attempt, the loser's conditional update matches zero rows and
 * retries against the now-current version instead of clobbering it.
 */
async function regradeAttempt(
  attemptId: string,
  examId: string,
  actorId: string,
  reason: string
): Promise<boolean> {
  for (let i = 0; i < 5; i++) {
    const existing = await prisma.examResult.findUnique({
      where: { attemptId },
    })
    if (!existing) return false // not graded yet — nothing to regrade

    const grade = await computeGrade(prisma, attemptId)
    const unchanged =
      grade.totalMarks === existing.totalMarks &&
      grade.obtainedMarks === existing.obtainedMarks &&
      grade.correctCount === existing.correctCount &&
      grade.incorrectCount === existing.incorrectCount &&
      grade.skippedCount === existing.skippedCount &&
      grade.cancelledCount === existing.cancelledCount

    if (unchanged) return false

    const applied = await prisma.$transaction(async (tx) => {
      const { count } = await tx.examResult.updateMany({
        where: { attemptId, gradingVersion: existing.gradingVersion },
        data: {
          ...grade,
          gradingVersion: { increment: 1 },
          gradedAt: new Date(),
          // status (PROVISIONAL/PUBLISHED) is intentionally left as-is —
          // a regrade corrects the number, it doesn't change who can see it.
        },
      })
      if (count === 0) return false

      await tx.gradingAuditLog.create({
        data: {
          examId,
          attemptId,
          action: "REGRADED",
          actorId,
          previousScore: existing.obtainedMarks,
          newScore: grade.obtainedMarks,
          reason,
        },
      })
      return true
    })

    if (applied) return true
    // lost the optimistic-lock race — recompute against the new version
  }

  return false
}
