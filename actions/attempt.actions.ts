"use server"

import { z } from "zod"
import { prisma } from "@/lib/db"
import { Prisma } from "@/prisma/generated/prisma/client"
import { assertRole } from "@/lib/auth/guards"
import { finalizeIfExpired } from "@/lib/attempts/expire"
import { countAttempts, findActiveOrLatestAttempt } from "@/lib/attempts/queries"
import { shuffledQuestionOrder } from "@/lib/attempts/shuffle"

// ─── Start (idempotent: resumes an existing in-progress attempt) ──
export type StartAttemptResult = { attemptId: string } | { error: string }

export async function startAttemptAction(
  examId: string
): Promise<StartAttemptResult> {
  const user = await assertRole("STUDENT")

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) return { error: "Exam not found" }
  if (exam.status !== "PUBLISHED") return { error: "This exam isn't available" }

  const now = new Date()
  if (exam.startTime && now < exam.startTime) {
    return { error: "This exam hasn't opened yet" }
  }
  if (exam.endTime && now > exam.endTime) {
    return { error: "This exam has closed" }
  }

  const existing = await findActiveOrLatestAttempt(user.id, examId)
  if (existing) {
    const current = await finalizeIfExpired(existing)
    if (current.status === "IN_PROGRESS") {
      return { attemptId: current.id } // resume, don't duplicate
    }
  }

  const questions = await prisma.examQuestion.findMany({
    where: { examId },
    orderBy: { order: "asc" },
    select: { id: true },
  })
  if (questions.length === 0) return { error: "This exam has no questions" }

  const deadline = new Date(
    Math.min(
      now.getTime() + exam.durationMinutes * 60_000,
      exam.endTime?.getTime() ?? Infinity
    )
  )

  // Optimistic retry: two simultaneous "start" clicks race on the same
  // (studentId, examId, attemptNumber) unique constraint. The loser retries
  // with a freshly recounted attemptNumber instead of erroring.
  for (let i = 0; i < 5; i++) {
    const count = await countAttempts(user.id, examId)
    if (count >= exam.maxAttempts) {
      return { error: "You've used all your attempts for this exam" }
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

      return { attemptId: attempt.id }
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        continue // lost the race — recount and retry
      }
      throw e
    }
  }

  return { error: "Could not start the attempt — please try again" }
}

// ─── Autosave: idempotent, conflict-resolved, snapshot-scoped ─────
const saveAnswerSchema = z.object({
  attemptId: z.string().uuid(),
  examQuestionId: z.string().uuid(),
  selectedOption: z.enum(["A", "B", "C", "D"]).nullable().optional(),
  isMarkedForReview: z.boolean().optional(),
  clientUpdatedAt: z.coerce.date(),
})

export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>

export async function saveAnswerAction(input: unknown) {
  const user = await assertRole("STUDENT")

  const parsed = saveAnswerSchema.safeParse(input)
  if (!parsed.success) return { error: "Invalid answer payload" }
  const {
    attemptId,
    examQuestionId,
    selectedOption,
    isMarkedForReview,
    clientUpdatedAt,
  } = parsed.data

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  })
  if (!attempt) return { error: "Attempt not found" }
  // Strict ownership for mutations — never an ADMIN bypass here. Nobody but
  // the student themself may ever write to their own attempt.
  if (attempt.studentId !== user.id) return { error: "Not your attempt" }

  const current = await finalizeIfExpired(attempt)
  if (current.status !== "IN_PROGRESS") {
    return { error: "This attempt has ended", status: current.status }
  }

  const data: Prisma.AttemptAnswerUpdateManyMutationInput = {
    clientUpdatedAt,
  }
  if (selectedOption !== undefined) data.selectedOption = selectedOption
  if (isMarkedForReview !== undefined) data.isMarkedForReview = isMarkedForReview

  // Conditional update: only applies if this edit is strictly newer than
  // whatever's stored. A stale/out-of-order retry or a second open tab
  // racing an earlier edit silently loses instead of clobbering newer data.
  const result = await prisma.attemptAnswer.updateMany({
    where: { attemptId, examQuestionId, clientUpdatedAt: { lt: clientUpdatedAt } },
    data,
  })

  if (result.count === 0) {
    const exists = await prisma.attemptAnswer.findUnique({
      where: { attemptId_examQuestionId: { attemptId, examQuestionId } },
    })
    if (!exists) {
      // examQuestionId isn't part of this attempt's frozen question set.
      return { error: "That question isn't part of this attempt" }
    }
    // Lost a race to a newer edit, or this exact edit was already applied
    // (retry after a dropped response) — both are harmless no-ops.
    return { success: true, applied: false }
  }

  return { success: true, applied: true }
}

// ─── Submit: idempotent, server decides COMPLETED vs TIMEOUT ──────
export async function submitAttemptAction(attemptId: string) {
  const user = await assertRole("STUDENT")

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  })
  if (!attempt) return { error: "Attempt not found" }
  if (attempt.studentId !== user.id) return { error: "Not your attempt" }

  const now = new Date()
  const nextStatus = now > attempt.deadline ? "TIMEOUT" : "COMPLETED"

  // Conditional on status still being IN_PROGRESS: two concurrent submits
  // (double-click, or a manual submit racing the auto-submit timer) can only
  // have one actually transition the row.
  const result = await prisma.examAttempt.updateMany({
    where: { id: attemptId, status: "IN_PROGRESS" },
    data: { status: nextStatus, submittedAt: now },
  })

  if (result.count === 0) {
    const settled = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: attemptId },
    })
    return { success: true, status: settled.status, alreadySubmitted: true }
  }

  return { success: true, status: nextStatus }
}
