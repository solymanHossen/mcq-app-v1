"use server"

import { prisma } from "@/lib/prisma"
import { assertRole } from "@/lib/authorization"
import { getExplanationSchema } from "@/modules/learning/validators"
import { getOrGenerateExplanation } from "@/modules/learning/ai-explain"

/**
 * The only entry point into the AI module from the rest of the app — kept
 * in its own action file, never imported by exam/attempt/grading actions,
 * so a provider outage or a missing API key can never affect exam
 * submission. Scoped the same way the mistake notebook and bookmarks are:
 * only a question the student has actually been given, and only after its
 * exam's answer key has been released (an explanation of the correct answer
 * is itself a disclosure of the correct answer).
 */
export async function getExplanationAction(input: unknown) {
  const user = await assertRole("STUDENT")

  const parsed = getExplanationSchema.safeParse(input)
  if (!parsed.success) return { error: "Invalid request" }
  const { examQuestionId } = parsed.data

  const answer = await prisma.attemptAnswer.findFirst({
    where: { examQuestionId, attempt: { studentId: user.id } },
    select: {
      examQuestion: { select: { exam: { select: { answerKeyReleased: true } } } },
    },
  })
  if (!answer) return { error: "You haven't attempted this question" }
  if (!answer.examQuestion.exam.answerKeyReleased) {
    return { error: "This question's answer key hasn't been released yet" }
  }

  return getOrGenerateExplanation(examQuestionId, user.id)
}
