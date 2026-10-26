import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { TEACHER_ROLES, assertOwner } from "@/lib/authorization"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError } from "@/modules/mobile/response"
import { listExamResults } from "@/modules/grading/queries"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)
    const { examId } = await params

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { teacherId: true },
    })
    if (!exam) return apiError(404, "Exam not found")
    assertOwner(user, exam.teacherId)

    const attempts = await listExamResults(examId)
    return apiOk({ attempts })
  } catch (e) {
    return handleApiError(e)
  }
}
