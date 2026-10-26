import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { TEACHER_ROLES, assertOwner, type CurrentUser } from "@/lib/authorization"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError, readJsonBody } from "@/modules/mobile/response"
import { getExamWithQuestions } from "@/modules/exams/queries"
import { examSchema } from "@/modules/exams/validators"

async function requireExamOwner(examId: string, user: CurrentUser) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) return null
  assertOwner(user, exam.teacherId)
  return exam
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)
    const { examId } = await params

    const exam = await getExamWithQuestions(examId)
    if (!exam) return apiError(404, "Exam not found")
    assertOwner(user, exam.teacherId)

    return apiOk({ exam })
  } catch (e) {
    return handleApiError(e)
  }
}

/** Mirrors modules/exams/actions.ts's updateExamAction — DRAFT only. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)
    const { examId } = await params

    const exam = await requireExamOwner(examId, user)
    if (!exam) return apiError(404, "Exam not found")
    if (exam.status !== "DRAFT") {
      return apiError(409, "This exam is published or archived and can no longer be edited.")
    }

    const data = examSchema.parse(await readJsonBody(request))

    const updated = await prisma.exam.update({
      where: { id: examId },
      data: {
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        maxAttempts: data.maxAttempts,
        passingMarks: data.passingMarks,
        startTime: data.startTime ? new Date(data.startTime) : null,
        endTime: data.endTime ? new Date(data.endTime) : null,
        shuffleQuestions: data.shuffleQuestions,
        shuffleOptions: data.shuffleOptions,
        webcamMonitoringRequired: data.webcamMonitoringRequired,
        violationReviewThreshold: data.violationReviewThreshold,
      },
    })

    return apiOk({ exam: updated })
  } catch (e) {
    return handleApiError(e)
  }
}

/** Mirrors modules/exams/actions.ts's deleteExamAction — DRAFT only. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)
    const { examId } = await params

    const exam = await requireExamOwner(examId, user)
    if (!exam) return apiError(404, "Exam not found")
    if (exam.status !== "DRAFT") {
      return apiError(409, "Only a draft exam can be deleted — archive this one instead.")
    }

    await prisma.exam.delete({ where: { id: examId } })
    return apiOk({ success: true })
  } catch (e) {
    return handleApiError(e)
  }
}
