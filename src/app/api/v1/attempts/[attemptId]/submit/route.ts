import { z } from "zod"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError, readJsonBody } from "@/modules/mobile/response"
import { finalizeAndGradeAttempt } from "@/modules/grading/finalize"
import { recordDailyActivity } from "@/modules/learning/streak"
import { awardXP, XP_PER_STREAK_DAY } from "@/modules/learning/xp"
import { evaluateBadgesAfterStreakUpdate } from "@/modules/learning/badges"

const submitSchema = z.object({ clientTimezone: z.string().optional() })

/** Mirrors modules/attempts/actions.ts's submitAttemptAction. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, "STUDENT")
    const { attemptId } = await params
    const { clientTimezone } = submitSchema.parse(await readJsonBody(request).catch(() => ({})))

    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt) return apiError(404, "Attempt not found")
    if (attempt.studentId !== user.id) return apiError(403, "Not your attempt")

    const nextStatus = new Date() > attempt.deadline ? "TIMEOUT" : "COMPLETED"
    const { graded } = await finalizeAndGradeAttempt(attemptId, nextStatus)

    if (!graded) {
      const settled = await prisma.examAttempt.findUniqueOrThrow({ where: { id: attemptId } })
      return apiOk({ success: true, status: settled.status, alreadySubmitted: true })
    }

    const streak = await recordDailyActivity(user.id, clientTimezone)
    if (streak.isNewDay) {
      await awardXP(
        prisma,
        user.id,
        XP_PER_STREAK_DAY,
        "STREAK_DAY",
        "STREAK_DAY",
        streak.lastActiveDate ?? ""
      )
      await evaluateBadgesAfterStreakUpdate(prisma, user.id, streak.currentStreak)
    }

    return apiOk({ success: true, status: nextStatus })
  } catch (e) {
    return handleApiError(e)
  }
}
