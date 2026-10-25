import { Prisma, type PrismaClient } from "@/prisma/generated/prisma/client"

type Tx = PrismaClient | Prisma.TransactionClient

/**
 * Called once per graded attempt (from lib/grading/finalize.ts, inside the
 * same transaction as grading itself) to update each answered question's
 * learning-progress summary. This is the ONLY writer of
 * timesSeen/timesCorrect/timesIncorrect/lastOutcomeCorrect — it reads the
 * already-immutable AttemptAnswer + ExamQuestion rows and derives correctness
 * from them, it never copies or re-stores the answers themselves.
 *
 * A skipped question (selectedOption null) and a cancelled question both
 * create no progress row and update no existing one — there's no meaningful
 * correct/incorrect signal for either.
 *
 * Spaced-repetition fields are deliberately NOT advanced by a correct retake
 * here — only an explicit mistake-notebook review submission
 * (lib/learning/spaced-repetition.ts) grows the interval/repetitions. A
 * correct retake just clears nextReviewAt (nothing left to review right
 * now); an incorrect retake re-enters the item into tomorrow's review queue.
 */
export async function recordAttemptProgress(tx: Tx, attemptId: string, studentId: string) {
  const answers = await tx.attemptAnswer.findMany({
    where: { attemptId, selectedOption: { not: null } },
    select: {
      examQuestionId: true,
      selectedOption: true,
      examQuestion: { select: { correctOptionSnapshot: true, isCancelled: true } },
    },
  })

  const now = new Date()

  for (const answer of answers) {
    if (answer.examQuestion.isCancelled) continue
    const correct = answer.selectedOption === answer.examQuestion.correctOptionSnapshot

    await tx.questionProgress.upsert({
      where: {
        studentId_examQuestionId: { studentId, examQuestionId: answer.examQuestionId },
      },
      create: {
        studentId,
        examQuestionId: answer.examQuestionId,
        timesSeen: 1,
        timesCorrect: correct ? 1 : 0,
        timesIncorrect: correct ? 0 : 1,
        lastOutcomeCorrect: correct,
        lastAttemptedAt: now,
        nextReviewAt: correct ? null : addDays(now, 1),
      },
      update: {
        timesSeen: { increment: 1 },
        timesCorrect: { increment: correct ? 1 : 0 },
        timesIncorrect: { increment: correct ? 0 : 1 },
        lastOutcomeCorrect: correct,
        lastAttemptedAt: now,
        ...(correct
          ? { nextReviewAt: null }
          : {
              masteryStatus: "LEARNING",
              repetitions: 0,
              intervalDays: 1,
              nextReviewAt: addDays(now, 1),
            }),
      },
    })
  }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
