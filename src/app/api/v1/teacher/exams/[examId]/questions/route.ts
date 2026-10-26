import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { TEACHER_ROLES, assertOwner } from "@/lib/authorization"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError, readJsonBody } from "@/modules/mobile/response"
import { addQuestionsToExamSchema } from "@/modules/exams/validators"

/** Mirrors modules/exams/exam-question-actions.ts's addQuestionsToExamAction. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)
    const { examId } = await params

    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) return apiError(404, "Exam not found")
    assertOwner(user, exam.teacherId)
    if (exam.status !== "DRAFT") return apiError(409, "This exam's question list is locked.")

    const { questionIds } = addQuestionsToExamSchema.parse(await readJsonBody(request))

    // Every question must belong to this same teacher and be ACTIVE — see
    // the action this mirrors for why.
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds }, teacherId: exam.teacherId, status: "ACTIVE" },
    })

    const alreadyAdded = await prisma.examQuestion.findMany({
      where: { examId, questionId: { in: questions.map((q) => q.id) } },
      select: { questionId: true },
    })
    const alreadyAddedIds = new Set(alreadyAdded.map((a) => a.questionId))
    const toAdd = questions.filter((q) => !alreadyAddedIds.has(q.id))

    if (toAdd.length === 0) {
      return apiError(422, "Those questions are unavailable or already in this exam")
    }

    const currentMax = await prisma.examQuestion.aggregate({
      where: { examId },
      _max: { order: true },
    })
    let nextOrder = (currentMax._max.order ?? -1) + 1

    await prisma.$transaction(
      toAdd.map((q) =>
        prisma.examQuestion.create({
          data: {
            examId,
            questionId: q.id,
            order: nextOrder++,
            questionTextSnapshot: q.questionText,
            optionASnapshot: q.optionA,
            optionBSnapshot: q.optionB,
            optionCSnapshot: q.optionC,
            optionDSnapshot: q.optionD,
            correctOptionSnapshot: q.correctOption,
            explanationSnapshot: q.explanation,
          },
        })
      )
    )

    return apiOk({ success: true, added: toAdd.length }, 201)
  } catch (e) {
    return handleApiError(e)
  }
}
