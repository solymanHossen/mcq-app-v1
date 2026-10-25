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
 *
 * One batched `INSERT ... ON CONFLICT DO UPDATE`, not N sequential
 * `upsert()` round-trips — a Phase 8 profiling run measured the N-upsert
 * version at ~93ms for a 30-question exam (versus ~6ms each for the other,
 * single-row writes in the same transaction), by far the largest single
 * contributor to grading-transaction time and therefore to how long each
 * submission holds a pooled connection under concurrent load.
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
  const rows = answers
    .filter((a) => !a.examQuestion.isCancelled)
    .map((a) => ({
      examQuestionId: a.examQuestionId,
      correct: a.selectedOption === a.examQuestion.correctOptionSnapshot,
    }))
  if (rows.length === 0) return

  const values = Prisma.join(
    rows.map(
      (r) =>
        Prisma.sql`(gen_random_uuid(), ${studentId}::text, ${r.examQuestionId}::text, ${r.correct ? 1 : 0}::int, ${r.correct ? 0 : 1}::int, ${r.correct}::boolean, ${now}::timestamp, ${r.correct ? null : addDays(now, 1)}::timestamp)`
    )
  )

  await tx.$executeRaw`
    INSERT INTO "QuestionProgress"
      (id, "studentId", "examQuestionId", "timesCorrect", "timesIncorrect", "lastOutcomeCorrect", "lastAttemptedAt", "nextReviewAt", "timesSeen", "createdAt", "updatedAt")
    SELECT id, "studentId", "examQuestionId", "timesCorrect", "timesIncorrect", "lastOutcomeCorrect", "lastAttemptedAt", "nextReviewAt", 1, now(), now()
    FROM (VALUES ${values}) AS v(id, "studentId", "examQuestionId", "timesCorrect", "timesIncorrect", "lastOutcomeCorrect", "lastAttemptedAt", "nextReviewAt")
    ON CONFLICT ("studentId", "examQuestionId") DO UPDATE SET
      "timesSeen" = "QuestionProgress"."timesSeen" + 1,
      "timesCorrect" = "QuestionProgress"."timesCorrect" + EXCLUDED."timesCorrect",
      "timesIncorrect" = "QuestionProgress"."timesIncorrect" + EXCLUDED."timesIncorrect",
      "lastOutcomeCorrect" = EXCLUDED."lastOutcomeCorrect",
      "lastAttemptedAt" = EXCLUDED."lastAttemptedAt",
      "nextReviewAt" = EXCLUDED."nextReviewAt",
      "masteryStatus" = CASE WHEN EXCLUDED."lastOutcomeCorrect" THEN "QuestionProgress"."masteryStatus" ELSE 'LEARNING'::"MasteryStatus" END,
      "repetitions" = CASE WHEN EXCLUDED."lastOutcomeCorrect" THEN "QuestionProgress"."repetitions" ELSE 0 END,
      "intervalDays" = CASE WHEN EXCLUDED."lastOutcomeCorrect" THEN "QuestionProgress"."intervalDays" ELSE 1 END,
      "updatedAt" = now()
  `
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
