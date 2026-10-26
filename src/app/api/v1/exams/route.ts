import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, handleApiError } from "@/modules/mobile/response"

// Published exams currently open to students — same window logic as
// src/app/(student)/exams/page.tsx.
export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, "STUDENT")

    const now = new Date()
    const exams = await prisma.exam.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ startTime: null }, { startTime: { lte: now } }],
        AND: [{ OR: [{ endTime: null }, { endTime: { gte: now } }] }],
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        durationMinutes: true,
        maxAttempts: true,
        startTime: true,
        endTime: true,
        leaderboardEnabled: true,
        _count: { select: { examQuestions: true } },
      },
    })

    return apiOk({ exams })
  } catch (e) {
    return handleApiError(e)
  }
}
