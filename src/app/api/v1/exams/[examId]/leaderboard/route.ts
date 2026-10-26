import type { NextRequest } from "next/server"
import { requireApiUser } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError } from "@/modules/mobile/response"
import { getExamLeaderboard } from "@/modules/leaderboard/engine"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    await requireApiUser(request)
    const { examId } = await params

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { leaderboardEnabled: true },
    })
    if (!exam) return apiError(404, "Exam not found")
    if (!exam.leaderboardEnabled) return apiError(409, "Leaderboard is disabled for this exam")

    const page = Number(request.nextUrl.searchParams.get("page") ?? "1")
    const leaderboard = await getExamLeaderboard({ examId, page: Number.isFinite(page) ? page : 1 })

    return apiOk(leaderboard)
  } catch (e) {
    return handleApiError(e)
  }
}
