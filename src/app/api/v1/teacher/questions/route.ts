import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { TEACHER_ROLES } from "@/lib/authorization"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError, readJsonBody } from "@/modules/mobile/response"
import { listQuestions, findDuplicateQuestion } from "@/modules/question-bank/queries"
import { questionSchema } from "@/modules/question-bank/validators"
import { computeQuestionContentHash } from "@/modules/question-bank/content-hash"

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)

    const page = Number(request.nextUrl.searchParams.get("page") ?? "1")
    const result = await listQuestions({
      teacherId: user.id,
      page: Number.isFinite(page) ? page : 1,
    })
    return apiOk(result)
  } catch (e) {
    return handleApiError(e)
  }
}

/**
 * Mirrors modules/question-bank/actions.ts's createQuestionAction. A
 * detected duplicate returns 409 with the existing question's id rather
 * than the web flow's "confirm and resubmit" dialog — a mobile client
 * decides for itself whether to resubmit with `confirmDuplicate: true`.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)

    const body = (await readJsonBody(request)) as Record<string, unknown>
    const data = questionSchema.parse(body)
    const confirmDuplicate = body.confirmDuplicate === true

    const contentHash = computeQuestionContentHash(data)

    if (!confirmDuplicate) {
      const duplicate = await findDuplicateQuestion(user.id, contentHash)
      if (duplicate) {
        return apiError(409, `Duplicate of an existing question: "${duplicate.questionText}"`)
      }
    }

    const question = await prisma.question.create({
      data: { ...data, teacherId: user.id, contentHash },
    })

    return apiOk({ question }, 201)
  } catch (e) {
    return handleApiError(e)
  }
}
