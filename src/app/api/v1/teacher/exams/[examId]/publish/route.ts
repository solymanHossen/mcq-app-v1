import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { TEACHER_ROLES, assertOwner } from "@/lib/authorization"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError } from "@/modules/mobile/response"
import { getSystemSettings } from "@/modules/settings/queries"

/** Mirrors modules/exams/actions.ts's publishExamAction. */
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

    const { requireTeacherVerification } = await getSystemSettings()
    if (
      requireTeacherVerification &&
      user.role === "TEACHER" &&
      user.teacherVerificationStatus !== "VERIFIED"
    ) {
      return apiError(
        403,
        "Your teacher account hasn't been verified yet — an admin needs to approve it before you can publish exams."
      )
    }

    if (exam.status !== "DRAFT") return apiError(409, "Only a draft exam can be published")

    const questionCount = await prisma.examQuestion.count({ where: { examId } })
    if (questionCount === 0) return apiError(422, "Add at least one question before publishing")

    const updated = await prisma.exam.update({
      where: { id: examId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    })

    return apiOk({ exam: updated })
  } catch (e) {
    return handleApiError(e)
  }
}
