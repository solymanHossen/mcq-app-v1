import { z } from "zod"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/prisma/generated/prisma/client"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError, readJsonBody } from "@/modules/mobile/response"
import { finalizeIfExpired } from "@/modules/attempts/expire"
import {
  checkSessionConflict,
  shouldWriteSessionToken,
  SESSION_CONFLICT_WINDOW_MS,
} from "@/modules/proctoring/engine"
import { recordRequestAndCheckSuspicious } from "@/modules/proctoring/rate-detection"
import { recordViolationEvent } from "@/modules/proctoring/record"

const saveAnswerSchema = z.object({
  examQuestionId: z.string().uuid(),
  selectedOption: z.enum(["A", "B", "C", "D"]).nullable().optional(),
  isMarkedForReview: z.boolean().optional(),
  clientUpdatedAt: z.coerce.date(),
  sessionToken: z.string().min(1).max(200),
})

/** Mirrors modules/attempts/actions.ts's saveAnswerAction — see its comments for the invariants reused here verbatim. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, "STUDENT")
    const { attemptId } = await params
    const {
      examQuestionId,
      selectedOption,
      isMarkedForReview,
      clientUpdatedAt,
      sessionToken,
    } = saveAnswerSchema.parse(await readJsonBody(request))

    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt) return apiError(404, "Attempt not found")
    if (attempt.studentId !== user.id) return apiError(403, "Not your attempt")

    const current = await finalizeIfExpired(attempt)
    if (current.status !== "IN_PROGRESS") {
      return apiError(409, "This attempt has ended")
    }

    const now = new Date()
    const conflict = checkSessionConflict(attempt, sessionToken, now)
    if (shouldWriteSessionToken(attempt, sessionToken, now)) {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: { activeSessionToken: sessionToken, activeSessionTokenAt: now },
      })
    }
    if (conflict.conflict) {
      await recordViolationEvent({
        attemptId,
        studentId: user.id,
        examId: attempt.examId,
        type: "SESSION_CONFLICT",
        source: "SERVER_DETECTED",
        metadata: { withinMs: SESSION_CONFLICT_WINDOW_MS },
      })
    }
    if (await recordRequestAndCheckSuspicious(attemptId, "save")) {
      await recordViolationEvent({
        attemptId,
        studentId: user.id,
        examId: attempt.examId,
        type: "SUSPICIOUS_REQUEST_PATTERN",
        source: "SERVER_DETECTED",
        metadata: { context: "save-rate" },
      })
    }

    const data: Prisma.AttemptAnswerUpdateManyMutationInput = { clientUpdatedAt }
    if (selectedOption !== undefined) data.selectedOption = selectedOption
    if (isMarkedForReview !== undefined) data.isMarkedForReview = isMarkedForReview

    const result = await prisma.attemptAnswer.updateMany({
      where: { attemptId, examQuestionId, clientUpdatedAt: { lt: clientUpdatedAt } },
      data,
    })

    if (result.count === 0) {
      const exists = await prisma.attemptAnswer.findUnique({
        where: { attemptId_examQuestionId: { attemptId, examQuestionId } },
      })
      if (!exists) return apiError(422, "That question isn't part of this attempt")
      return apiOk({ success: true, applied: false })
    }

    return apiOk({ success: true, applied: true })
  } catch (e) {
    return handleApiError(e)
  }
}
