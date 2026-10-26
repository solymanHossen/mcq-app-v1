import { z } from "zod"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/prisma/generated/prisma/client"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError, readJsonBody } from "@/modules/mobile/response"
import { finalizeIfExpired } from "@/modules/attempts/expire"
import { countAttempts, findActiveOrLatestAttempt } from "@/modules/attempts/queries"
import { shuffledQuestionOrder } from "@/modules/attempts/shuffle"

const startAttemptSchema = z.object({ webcamConsent: z.boolean().optional() })

/**
 * Mirrors modules/attempts/actions.ts's startAttemptAction exactly — same
 * window/status/webcam/max-attempts checks, same race-safe retry on a
 * concurrent "start" — just fed a bearer-resolved user instead of a cookie
 * session, since that action can't be called directly from here (it reads
 * its user from the web session, not a header).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, "STUDENT")
    const { examId } = await params
    const { webcamConsent } = startAttemptSchema.parse(await readJsonBody(request))

    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) return apiError(404, "Exam not found")
    if (exam.status !== "PUBLISHED") return apiError(409, "This exam isn't available")

    if (exam.webcamMonitoringRequired && webcamConsent !== true) {
      return apiError(
        422,
        "This exam requires webcam monitoring — you must consent before starting."
      )
    }

    const now = new Date()
    if (exam.startTime && now < exam.startTime) return apiError(409, "This exam hasn't opened yet")
    if (exam.endTime && now > exam.endTime) return apiError(409, "This exam has closed")

    const existing = await findActiveOrLatestAttempt(user.id, examId)
    if (existing) {
      const current = await finalizeIfExpired(existing)
      if (current.status === "IN_PROGRESS") {
        return apiOk({ attemptId: current.id }) // resume, don't duplicate
      }
    }

    const questions = await prisma.examQuestion.findMany({
      where: { examId },
      orderBy: { order: "asc" },
      select: { id: true },
    })
    if (questions.length === 0) return apiError(409, "This exam has no questions")

    const deadline = new Date(
      Math.min(
        now.getTime() + exam.durationMinutes * 60_000,
        exam.endTime?.getTime() ?? Infinity
      )
    )

    for (let i = 0; i < 5; i++) {
      const count = await countAttempts(user.id, examId)
      if (count >= exam.maxAttempts) {
        return apiError(409, "You've used all your attempts for this exam")
      }

      try {
        const attempt = await prisma.$transaction(async (tx) => {
          const created = await tx.examAttempt.create({
            data: {
              examId,
              studentId: user.id,
              attemptNumber: count + 1,
              startedAt: now,
              deadline,
              webcamConsentGivenAt: webcamConsent ? now : null,
            },
          })

          const order = exam.shuffleQuestions
            ? shuffledQuestionOrder(questions.length, created.id)
            : questions.map((_, i) => i)

          await tx.attemptAnswer.createMany({
            data: questions.map((q, i) => ({
              attemptId: created.id,
              examQuestionId: q.id,
              presentationOrder: order[i],
              clientUpdatedAt: now,
            })),
          })

          return created
        })

        return apiOk({ attemptId: attempt.id }, 201)
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          continue // lost the race — recount and retry
        }
        throw e
      }
    }

    return apiError(409, "Could not start the attempt — please try again")
  } catch (e) {
    return handleApiError(e)
  }
}
