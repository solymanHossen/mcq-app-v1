import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { TEACHER_ROLES, assertOwner } from "@/lib/authorization"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError, readJsonBody } from "@/modules/mobile/response"
import { getQuestionById, findDuplicateQuestion } from "@/modules/question-bank/queries"
import { questionSchema } from "@/modules/question-bank/validators"
import { computeQuestionContentHash } from "@/modules/question-bank/content-hash"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)
    const { questionId } = await params

    const question = await getQuestionById(questionId)
    if (!question) return apiError(404, "Question not found")
    assertOwner(user, question.teacherId)

    return apiOk({ question })
  } catch (e) {
    return handleApiError(e)
  }
}

/** Mirrors modules/question-bank/actions.ts's updateQuestionAction. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)
    const { questionId } = await params

    const existing = await prisma.question.findUnique({ where: { id: questionId } })
    if (!existing) return apiError(404, "Question not found")
    assertOwner(user, existing.teacherId)

    const body = (await readJsonBody(request)) as Record<string, unknown>
    const data = questionSchema.parse(body)
    const confirmDuplicate = body.confirmDuplicate === true
    const contentHash = computeQuestionContentHash(data)

    if (!confirmDuplicate && contentHash !== existing.contentHash) {
      const duplicate = await findDuplicateQuestion(user.id, contentHash, questionId)
      if (duplicate) {
        return apiError(409, `Duplicate of an existing question: "${duplicate.questionText}"`)
      }
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: { ...data, contentHash },
    })

    return apiOk({ question })
  } catch (e) {
    return handleApiError(e)
  }
}

/** Mirrors modules/question-bank/actions.ts's deleteQuestionAction. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)
    const { questionId } = await params

    const existing = await prisma.question.findUnique({ where: { id: questionId } })
    if (!existing) return apiError(404, "Question not found")
    assertOwner(user, existing.teacherId)

    const usageCount = await prisma.examQuestion.count({ where: { questionId } })
    if (usageCount > 0) {
      return apiError(
        409,
        `This question is used in ${usageCount} exam${usageCount === 1 ? "" : "s"}. Archive it instead of deleting.`
      )
    }

    await prisma.question.delete({ where: { id: questionId } })
    return apiOk({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
