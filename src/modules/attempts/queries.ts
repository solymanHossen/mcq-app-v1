import { prisma } from "@/lib/prisma"
import { shuffledOptionOrder } from "./shuffle"

export function countAttempts(studentId: string, examId: string) {
  return prisma.examAttempt.count({ where: { studentId, examId } })
}

export function findActiveOrLatestAttempt(studentId: string, examId: string) {
  return prisma.examAttempt.findFirst({
    where: { studentId, examId },
    orderBy: { attemptNumber: "desc" },
  })
}

/**
 * The only query the live exam-taking UI may use. Deliberately selects
 * everything EXCEPT `correctOptionSnapshot` / `explanationSnapshot` — this is
 * enforced at the query layer, not left to the page/component to remember not
 * to render, so a careless future change can't leak answers mid-exam.
 */
export async function getAttemptForStudent(attemptId: string) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          shuffleOptions: true,
        },
      },
      answers: {
        select: {
          id: true,
          examQuestionId: true,
          selectedOption: true,
          isMarkedForReview: true,
          presentationOrder: true,
          examQuestion: {
            select: {
              id: true,
              marks: true,
              questionTextSnapshot: true,
              optionASnapshot: true,
              optionBSnapshot: true,
              optionCSnapshot: true,
              optionDSnapshot: true,
              // correctOptionSnapshot / explanationSnapshot intentionally
              // not selected.
            },
          },
        },
        orderBy: { presentationOrder: "asc" },
      },
    },
  })
  if (!attempt) return null

  const options = {
    A: "optionASnapshot",
    B: "optionBSnapshot",
    C: "optionCSnapshot",
    D: "optionDSnapshot",
  } as const

  return {
    ...attempt,
    answers: attempt.answers.map((a) => {
      const order: ("A" | "B" | "C" | "D")[] = attempt.exam.shuffleOptions
        ? shuffledOptionOrder(attempt.id, a.examQuestionId)
        : ["A", "B", "C", "D"]
      return {
        id: a.id,
        examQuestionId: a.examQuestionId,
        selectedOption: a.selectedOption,
        isMarkedForReview: a.isMarkedForReview,
        marks: a.examQuestion.marks,
        questionText: a.examQuestion.questionTextSnapshot,
        optionOrder: order,
        optionText: Object.fromEntries(
          order.map((key) => [key, a.examQuestion[options[key]]])
        ) as Record<"A" | "B" | "C" | "D", string>,
      }
    }),
  }
}

export type AttemptForStudent = NonNullable<
  Awaited<ReturnType<typeof getAttemptForStudent>>
>
