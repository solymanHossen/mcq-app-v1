import { prisma } from "@/lib/prisma"

export function listExamResults(examId: string) {
  return prisma.examAttempt.findMany({
    where: { examId, status: { in: ["COMPLETED", "TIMEOUT", "DISQUALIFIED"] } },
    include: {
      student: { select: { id: true, name: true, email: true, isGuest: true } },
      result: true,
    },
    orderBy: [{ result: { obtainedMarks: "desc" } }, { submittedAt: "asc" }],
    // A generous safety net, not a realistic page size: this is a single
    // teacher-owned exam's full roster, which legitimately needs to render
    // in full today. Revisit with real pagination if contest sizes ever
    // approach this.
    take: 5000,
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
 * The only query the student-facing result view may use. The score/result
 * object itself is only returned once ExamResult.status is PUBLISHED, and
 * per-question answer-key detail (which option was correct) is only
 * returned once the exam's answerKeyReleased flag is set — both omitted
 * entirely at the query level (not just hidden in the UI) so a provisional
 * score or answer key can never leak through a future consumer of this
 * query that forgets to re-check disclosure state.
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
              negativeMarks: true,
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

  // Results are disclosed if:
  // 1. This specific result is already marked PUBLISHED
  // 2. The teacher published results for this exam (verified via audit log or any published attempt)
  const isExamResultsPublished =
    attempt.result?.status === "PUBLISHED" ||
    (await prisma.gradingAuditLog.findFirst({
      where: { examId: attempt.examId, action: "RESULTS_PUBLISHED" },
      select: { id: true },
    })) !== null ||
    (await prisma.examResult.findFirst({
      where: { attempt: { examId: attempt.examId }, status: "PUBLISHED" },
      select: { id: true },
    })) !== null

  // Self-heal: If the exam results have been published, ensure this attempt's
  // result record is permanently updated to PUBLISHED as well.
  if (
    isExamResultsPublished &&
    attempt.result &&
    attempt.result.status === "PROVISIONAL"
  ) {
    await prisma.examResult.update({
      where: { attemptId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    })
    attempt.result.status = "PUBLISHED"
  }

  const revealAnswerKey = attempt.exam.answerKeyReleased
  const revealResult = isExamResultsPublished && attempt.result !== null

  return {
    id: attempt.id,
    studentId: attempt.studentId,
    examId: attempt.examId,
    examTitle: attempt.exam.title,
    status: attempt.status,
    submittedAt: attempt.submittedAt,
    totalQuestions: attempt.answers.length,
    answeredCount: attempt.answers.filter((a) => a.selectedOption !== null).length,
    result: revealResult ? attempt.result : null,
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
          negativeMarks: a.examQuestion.negativeMarks,
        }))
      : null,
  }
}

export type ResultForStudent = NonNullable<
  Awaited<ReturnType<typeof getResultForStudent>>
>
