import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { TEACHER_ROLES, assertOwner } from "@/lib/authorization"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError } from "@/modules/mobile/response"

/** Mirrors modules/exams/actions.ts's archiveExamAction. */
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

    if (exam.status === "ARCHIVED") return apiError(409, "This exam is already archived")

    const updated = await prisma.exam.update({
      where: { id: examId },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    })

    return apiOk({ exam: updated })
  } catch (e) {
    return handleApiError(e)
  }
}
