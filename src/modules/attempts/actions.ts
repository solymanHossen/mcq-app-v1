"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/prisma/generated/prisma/client"
import { assertRole } from "@/lib/authorization"
import { finalizeIfExpired } from "@/modules/attempts/expire"
import { countAttempts, findActiveOrLatestAttempt } from "@/modules/attempts/queries"
import { shuffledQuestionOrder } from "@/modules/attempts/shuffle"
import { finalizeAndGradeAttempt } from "@/modules/grading/finalize"
import {
  checkSessionConflict,
  shouldWriteSessionToken,
  SESSION_CONFLICT_WINDOW_MS,
} from "@/modules/proctoring/engine"
import { recordRequestAndCheckSuspicious } from "@/modules/proctoring/rate-detection"
import { recordViolationEvent } from "@/modules/proctoring/record"
import { recordDailyActivity } from "@/modules/learning/streak"
import { awardXP, XP_PER_STREAK_DAY } from "@/modules/learning/xp"
import { evaluateBadgesAfterStreakUpdate } from "@/modules/learning/badges"
import { cookies } from "next/headers"
import { encode } from "next-auth/jwt"
import { hashPassword } from "@/modules/auth/password"

// ─── Start (idempotent: resumes an existing in-progress attempt) ──
export type StartAttemptResult = { attemptId: string } | { error: string }

export async function startAttemptAction(
  examId: string,
  opts: { webcamConsent?: boolean; accessCode?: string } = {}
): Promise<StartAttemptResult> {
  const user = await assertRole("STUDENT")

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) return { error: "Exam not found" }
  if (exam.status !== "PUBLISHED") return { error: "This exam isn't available" }

  if (
    exam.accessCode &&
    opts.accessCode?.trim().toLowerCase() !== exam.accessCode.trim().toLowerCase()
  ) {
    return { error: "Invalid exam passcode" }
  }

  if (exam.webcamMonitoringRequired && opts.webcamConsent !== true) {
    return {
      error:
        "This exam requires webcam monitoring — you must consent before starting.",
    }
  }

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
            webcamConsentGivenAt: opts.webcamConsent ? now : null,
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

export type GuestExamInput = {
  examId: string
  name: string
  email: string
  accessCode?: string
  webcamConsent?: boolean
}

export async function startGuestExamAction(
  input: GuestExamInput
): Promise<StartAttemptResult> {
  const { examId, name, email, accessCode, webcamConsent } = input

  if (!name || name.trim().length < 2) {
    return { error: "Please provide your full name (at least 2 characters)" }
  }

  const cleanEmail = email?.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { error: "Please provide a valid email address" }
  }

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) return { error: "Exam not found" }
  if (exam.status !== "PUBLISHED") {
    return { error: "This exam is not currently available" }
  }

  if (!exam.allowGuestAccess) {
    return {
      error:
        "This exam is restricted to registered students. Please log in to take it.",
    }
  }

  if (
    exam.accessCode &&
    accessCode?.trim().toLowerCase() !== exam.accessCode.trim().toLowerCase()
  ) {
    return { error: "Invalid exam passcode" }
  }

  if (exam.webcamMonitoringRequired && webcamConsent !== true) {
    return {
      error:
        "This exam requires webcam monitoring — you must give consent before starting.",
    }
  }

  const now = new Date()
  if (exam.startTime && now < exam.startTime) {
    return { error: "This exam hasn't opened yet" }
  }
  if (exam.endTime && now > exam.endTime) {
    return { error: "This exam has closed" }
  }

  // Find or create student account
  let user = await prisma.user.findUnique({ where: { email: cleanEmail } })
  if (user) {
    if (!user.isActive) {
      return { error: "This student account is suspended" }
    }
  } else {
    const dummyHash = await hashPassword(crypto.randomUUID())
    user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash: dummyHash,
        role: "STUDENT",
        isActive: true,
        isGuest: true,
        isEmailVerified: true,
      },
    })
  }

  // Issue NextAuth session cookie so student is automatically authenticated
  const secret =
    process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "default-secret-key"
  const token = await encode({
    token: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    secret,
    maxAge: 7 * 24 * 60 * 60,
  })

  const cookieStore = await cookies()
  const isSecure =
    process.env.NODE_ENV === "production" &&
    process.env.NEXTAUTH_URL?.startsWith("https://")
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: !!isSecure,
    maxAge: 7 * 24 * 60 * 60,
  }

  cookieStore.set(
    isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token",
    token,
    cookieOptions
  )
  if (isSecure) {
    cookieStore.set("next-auth.session-token", token, cookieOptions)
  }

  // Resume active in-progress attempt if exists
  const existing = await findActiveOrLatestAttempt(user.id, examId)
  if (existing) {
    const current = await finalizeIfExpired(existing)
    if (current.status === "IN_PROGRESS") {
      return { attemptId: current.id }
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
            studentId: user!.id,
            attemptNumber: count + 1,
            startedAt: now,
            deadline,
            webcamConsentGivenAt: webcamConsent ? now : null,
          },
        })

        const order = exam.shuffleQuestions
          ? shuffledQuestionOrder(questions.length, created.id)
          : questions.map((_, idx) => idx)

        await tx.attemptAnswer.createMany({
          data: questions.map((q, idx) => ({
            attemptId: created.id,
            examQuestionId: q.id,
            presentationOrder: order[idx],
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
        continue
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
  // Opaque per-page-load token, not a device fingerprint — see
  // lib/anti-cheat/engine.ts's session-conflict detection.
  sessionToken: z.string().min(1).max(200),
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
    sessionToken,
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

  // Server-detected signals — never trust a client to report these two
  // itself (see CLIENT_REPORTABLE_TYPES). Both are best-effort: detection
  // never blocks the actual save underneath it.
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
export async function submitAttemptAction(
  attemptId: string,
  opts: { clientTimezone?: string } = {}
) {
  const user = await assertRole("STUDENT")

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  })
  if (!attempt) return { error: "Attempt not found" }
  if (attempt.studentId !== user.id) return { error: "Not your attempt" }

  const nextStatus = new Date() > attempt.deadline ? "TIMEOUT" : "COMPLETED"

  // finalizeAndGradeAttempt's status transition is conditional on the
  // attempt still being IN_PROGRESS, so two concurrent submits (double-click,
  // or a manual submit racing the auto-submit timer) can only have one
  // actually transition — and grade — the row.
  const { graded } = await finalizeAndGradeAttempt(attemptId, nextStatus)

  if (!graded) {
    const settled = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: attemptId },
    })
    return { success: true, status: settled.status, alreadySubmitted: true }
  }

  // The daily-activity streak is deliberately NOT part of
  // finalizeAndGradeAttempt itself: it needs the live client's own reported
  // timezone to mean anything ("today" has no meaning without one), so it
  // can only be recorded from a request that actually came from the
  // student's browser just now — never from the passive expiry sweep, which
  // has no client to ask. See lib/learning/streak.ts.
  const streak = await recordDailyActivity(user.id, opts.clientTimezone)
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

  return { success: true, status: nextStatus }
}
