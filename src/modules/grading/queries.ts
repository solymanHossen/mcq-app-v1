import { prisma } from "@/lib/db"

export function listExamResults(examId: string) {
  return prisma.examAttempt.findMany({
    where: { examId, status: { in: ["COMPLETED", "TIMEOUT", "DISQUALIFIED"] } },
    include: {
      student: { select: { id: true, name: true, email: true } },
      result: true,
    },
    orderBy: [{ result: { obtainedMarks: "desc" } }, { submittedAt: "asc" }],
  })
}

export function getExamQuestionsForCorrection(examId: string) {
  return prisma.examQuestion.findMany({
    where: { examId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      marks: true,
      negativeMarks: true,
      isCancelled: true,
      questionTextSnapshot: true,
      optionASnapshot: true,
      optionBSnapshot: true,
      optionCSnapshot: true,
      optionDSnapshot: true,
      correctOptionSnapshot: true,
    },
  })
}

/**
 * The only query the student-facing result view may use. Only returns
 * per-question answer-key detail (which option was correct) when the exam's
 * answerKeyReleased flag is set — otherwise that detail is omitted entirely
 * at the query level, the same defense-in-depth approach as the live
 * attempt view in Phase 3.
 */
export async function getResultForStudent(attemptId: string) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        select: { id: true, title: true, answerKeyReleased: true },
      },
      result: true,
      answers: {
        orderBy: { presentationOrder: "asc" },
        select: {
          selectedOption: true,
          examQuestion: {
            select: {
              id: true,
              marks: true,
              isCancelled: true,
              questionTextSnapshot: true,
              optionASnapshot: true,
              optionBSnapshot: true,
              optionCSnapshot: true,
              optionDSnapshot: true,
              correctOptionSnapshot: true,
            },
          },
        },
      },
    },
  })
  if (!attempt) return null

  const revealAnswerKey = attempt.exam.answerKeyReleased

  return {
    id: attempt.id,
    studentId: attempt.studentId,
    examId: attempt.examId,
    examTitle: attempt.exam.title,
    status: attempt.status,
    result: attempt.result,
    answerKeyReleased: revealAnswerKey,
    questions: revealAnswerKey
      ? attempt.answers.map((a) => ({
          questionText: a.examQuestion.questionTextSnapshot,
          optionA: a.examQuestion.optionASnapshot,
          optionB: a.examQuestion.optionBSnapshot,
          optionC: a.examQuestion.optionCSnapshot,
          optionD: a.examQuestion.optionDSnapshot,
          correctOption: a.examQuestion.correctOptionSnapshot,
          selectedOption: a.selectedOption,
          isCancelled: a.examQuestion.isCancelled,
          marks: a.examQuestion.marks,
        }))
      : null,
  }
}

export type ResultForStudent = NonNullable<
  Awaited<ReturnType<typeof getResultForStudent>>
>
