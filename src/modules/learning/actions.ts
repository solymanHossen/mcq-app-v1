"use server"

import { prisma } from "@/lib/prisma"
import { assertRole } from "@/lib/authorization"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import { toggleBookmarkSchema, submitMistakeReviewSchema } from "@/modules/learning/validators"
import { applyReviewOutcome } from "@/modules/learning/spaced-repetition"
import { awardXP, XP_PER_MISTAKE_CORRECTED } from "@/modules/learning/xp"
import { evaluateBadgesAfterMistakeReview } from "@/modules/learning/badges"
import { recordDailyActivity } from "@/modules/learning/streak"

/** A student may only bookmark/review an ExamQuestion they've actually been
 * given — i.e. one they hold an AttemptAnswer row for. This also means a
 * student can never use these actions to probe for questions outside exams
 * they were assigned, even though the id itself is an opaque UUID. */
async function hasEngagedWith(studentId: string, examQuestionId: string): Promise<boolean> {
  const answer = await prisma.attemptAnswer.findFirst({
    where: { examQuestionId, attempt: { studentId } },
    select: { id: true },
  })
  return !!answer
}

export async function toggleBookmarkAction(input: unknown) {
  const user = await assertRole("STUDENT")

  const parsed = toggleBookmarkSchema.safeParse(input)
  if (!parsed.success) return { error: "Invalid request" }
  const { examQuestionId } = parsed.data

  if (!(await hasEngagedWith(user.id, examQuestionId))) {
    return { error: "You haven't attempted this question" }
  }

  const existing = await prisma.questionBookmark.findUnique({
    where: { studentId_examQuestionId: { studentId: user.id, examQuestionId } },
  })

  if (existing) {
    await prisma.questionBookmark.delete({ where: { id: existing.id } })
    safeRevalidatePath("/mistakes")
    return { success: true, bookmarked: false }
  }

  await prisma.questionBookmark.create({
    data: { studentId: user.id, examQuestionId },
  })
  safeRevalidatePath("/mistakes")
  return { success: true, bookmarked: true }
}

/**
 * The mistake-notebook self-check: the student re-answers a question they
 * previously got wrong, and the server (never the client) grades it and
 * advances the spaced-repetition schedule. Gated on the exam's own
 * answerKeyReleased flag — the same disclosure gate the student-facing
 * result view uses (lib/grading/queries.ts) — because telling a student
 * right/wrong here is equivalent to confirming the answer key, which must
 * never happen before the teacher has released it (other students may still
 * be attempting that exam).
 *
 * Only the spaced-repetition fields and lastOutcomeCorrect are touched here
 * — timesSeen/timesCorrect/timesIncorrect are exam-engagement counts and
 * stay exclusively owned by lib/learning/progress.ts (grading time).
 */
export async function submitMistakeReviewAction(input: unknown) {
  const user = await assertRole("STUDENT")

  const parsed = submitMistakeReviewSchema.safeParse(input)
  if (!parsed.success) return { error: "Invalid review submission" }
  const { examQuestionId, selectedOption, reviewEventId, clientTimezone } = parsed.data

  const progress = await prisma.questionProgress.findUnique({
    where: { studentId_examQuestionId: { studentId: user.id, examQuestionId } },
    include: {
      examQuestion: {
        select: {
          correctOptionSnapshot: true,
          exam: { select: { answerKeyReleased: true } },
        },
      },
    },
  })
  if (!progress) return { error: "Nothing to review for this question yet" }
  if (!progress.examQuestion.exam.answerKeyReleased) {
    return { error: "This question's answer key hasn't been released yet" }
  }

  const correct = selectedOption === progress.examQuestion.correctOptionSnapshot
  const outcome = applyReviewOutcome(
    {
      easeFactor: progress.easeFactor,
      intervalDays: progress.intervalDays,
      repetitions: progress.repetitions,
    },
    correct
  )

  await prisma.$transaction(async (tx) => {
    await tx.questionProgress.update({
      where: { id: progress.id },
      data: {
        easeFactor: outcome.easeFactor,
        intervalDays: outcome.intervalDays,
        repetitions: outcome.repetitions,
        masteryStatus: outcome.masteryStatus,
        nextReviewAt: outcome.nextReviewAt,
        lastReviewedAt: new Date(),
        lastOutcomeCorrect: correct,
      },
    })

    if (correct) {
      await awardXP(
        tx,
        user.id,
        XP_PER_MISTAKE_CORRECTED,
        "MISTAKE_REVIEWED",
        "REVIEW",
        reviewEventId
      )
      await evaluateBadgesAfterMistakeReview(tx, user.id)
    }
  })

  await recordDailyActivity(user.id, clientTimezone)

  safeRevalidatePath("/mistakes")

  return {
    success: true,
    correct,
    correctOption: progress.examQuestion.correctOptionSnapshot,
    nextReviewAt: outcome.nextReviewAt,
    masteryStatus: outcome.masteryStatus,
  }
}
