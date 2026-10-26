import { z } from "zod"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { TEACHER_ROLES, assertOwner } from "@/lib/authorization"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError, readJsonBody } from "@/modules/mobile/response"

const statusSchema = z.object({ status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]) })

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ACTIVE"],
  ACTIVE: ["ARCHIVED"],
  ARCHIVED: ["ACTIVE"],
}

/** Mirrors modules/question-bank/actions.ts's setQuestionStatusAction. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)
    const { questionId } = await params
    const { status: nextStatus } = statusSchema.parse(await readJsonBody(request))

    const existing = await prisma.question.findUnique({ where: { id: questionId } })
    if (!existing) return apiError(404, "Question not found")
    assertOwner(user, existing.teacherId)

    if (!ALLOWED_TRANSITIONS[existing.status]?.includes(nextStatus)) {
      return apiError(422, `Can't move a question from ${existing.status} to ${nextStatus}`)
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: { status: nextStatus },
    })

    return apiOk({ question })
  } catch (e) {
    return handleApiError(e)
  }
}
