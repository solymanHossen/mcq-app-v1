import type { Prisma, PrismaClient } from "@/prisma/generated/prisma/client"
import { toInternalUnits, sumInternalUnits, roundMarks, roundRatio } from "./arithmetic"

export type GradeBreakdown = {
  totalMarks: number
  obtainedMarks: number
  correctCount: number
  incorrectCount: number
  skippedCount: number
  cancelledCount: number
  accuracy: number
  isPassed: boolean | null
}

type DbClient = PrismaClient | Prisma.TransactionClient

/**
 * The grading policy, in one place:
 *
 * - Cancelled question: full marks awarded to every attempt regardless of
 *   what was selected. Excluded from correct/incorrect/accuracy, but its
 *   marks still count toward totalMarks (the question is effectively
 *   "marked correct for everyone", not an extra bonus on top of the total).
 * - Unanswered (selectedOption null): 0 marks, counted as skipped.
 * - Correct: full positive marks for the question.
 * - Incorrect: the question's configured negative marks are deducted (never
 *   floored at zero — a student's total can go negative; that's the honest
 *   result of the negative-marking configuration they were told about).
 *
 * Always reads the CURRENT ExamQuestion state, so a correction applied
 * after this attempt was graded is picked up the next time it's (re)graded
 * — see lib/grading/regrade.ts.
 */
export async function computeGrade(
  db: DbClient,
  attemptId: string
): Promise<GradeBreakdown> {
  const attempt = await db.examAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      exam: { select: { passingMarks: true } },
      answers: {
        include: {
          examQuestion: {
            select: {
              marks: true,
              negativeMarks: true,
              correctOptionSnapshot: true,
              isCancelled: true,
            },
          },
        },
      },
    },
  })

  let correctCount = 0
  let incorrectCount = 0
  let skippedCount = 0
  let cancelledCount = 0
  const totalUnits: number[] = []
  const obtainedUnits: number[] = []

  for (const answer of attempt.answers) {
    const q = answer.examQuestion
    totalUnits.push(toInternalUnits(q.marks))

    if (q.isCancelled) {
      cancelledCount++
      obtainedUnits.push(toInternalUnits(q.marks))
    } else if (answer.selectedOption === null) {
      skippedCount++
      obtainedUnits.push(0)
    } else if (answer.selectedOption === q.correctOptionSnapshot) {
      correctCount++
      obtainedUnits.push(toInternalUnits(q.marks))
    } else {
      incorrectCount++
      obtainedUnits.push(toInternalUnits(-q.negativeMarks))
    }
  }

  const totalMarks = roundMarks(sumInternalUnits(totalUnits))
  const obtainedMarks = roundMarks(sumInternalUnits(obtainedUnits))
  const attemptedCount = correctCount + incorrectCount
  const accuracy =
    attemptedCount > 0 ? roundRatio(correctCount / attemptedCount) : 0
  const isPassed =
    attempt.exam.passingMarks !== null
      ? obtainedMarks >= attempt.exam.passingMarks
      : null

  return {
    totalMarks,
    obtainedMarks,
    correctCount,
    incorrectCount,
    skippedCount,
    cancelledCount,
    accuracy,
    isPassed,
  }
}
