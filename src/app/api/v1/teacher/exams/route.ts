import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { TEACHER_ROLES } from "@/lib/authorization"
import type { ExamStatus } from "@/prisma/generated/prisma/client"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, handleApiError, readJsonBody } from "@/modules/mobile/response"
import { listExams } from "@/modules/exams/queries"
import { examSchema } from "@/modules/exams/validators"

const EXAM_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)

    const statusParam = request.nextUrl.searchParams.get("status")
    const status = EXAM_STATUSES.includes(statusParam as ExamStatus)
      ? (statusParam as ExamStatus)
      : undefined
    const page = Number(request.nextUrl.searchParams.get("page") ?? "1")

    const result = await listExams({
      teacherId: user.id,
      status,
      page: Number.isFinite(page) ? page : 1,
    })
    return apiOk(result)
  } catch (e) {
    return handleApiError(e)
  }
}

/** Mirrors modules/exams/actions.ts's createExamAction (JSON body instead of FormData). */
export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, ...TEACHER_ROLES)

    const data = examSchema.parse(await readJsonBody(request))

    const exam = await prisma.exam.create({
      data: {
        teacherId: user.id,
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

    return apiOk({ exam }, 201)
  } catch (e) {
    return handleApiError(e)
  }
}
