import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError } from "@/modules/mobile/response"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, "STUDENT")
    const { examId } = await params

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        durationMinutes: true,
        maxAttempts: true,
        startTime: true,
        endTime: true,
        webcamMonitoringRequired: true,
        leaderboardEnabled: true,
        _count: { select: { examQuestions: true } },
      },
    })
    // A student may only ever see a published exam through this endpoint —
    // draft/archived exams aren't "not found" to their own teacher, but
    // they are to everyone else, same as the rest of the student app.
    if (!exam || exam.status !== "PUBLISHED") return apiError(404, "Exam not found")

    return apiOk({ exam })
  } catch (e) {
    return handleApiError(e)
  }
}
