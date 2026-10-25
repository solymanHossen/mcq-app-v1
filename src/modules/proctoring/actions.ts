"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertRole, assertOwner } from "@/lib/authorization"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import {
  CLIENT_REPORTABLE_TYPES,
  parseClientViolationMetadata,
} from "@/modules/proctoring/engine"
import { recordRequestAndCheckSuspicious } from "@/modules/proctoring/rate-detection"
import { recordViolationEvent } from "@/modules/proctoring/record"
import { invalidateScope } from "@/modules/leaderboard/cache"
import {
  examLeaderboardScope,
  globalLeaderboardScope,
} from "@/modules/leaderboard/engine"

// ─── Client-reported violation events ──────────────────────────────────
const reportSchema = z.object({
  attemptId: z.string().uuid(),
  type: z.enum(CLIENT_REPORTABLE_TYPES),
  metadata: z.unknown().optional(),
})

export async function reportViolationAction(input: unknown) {
  const user = await assertRole("STUDENT")

  const parsed = reportSchema.safeParse(input)
  if (!parsed.success) return { error: "Invalid violation report" }
  const { attemptId, type } = parsed.data

  const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } })
  if (!attempt) return { error: "Attempt not found" }
  if (attempt.studentId !== user.id) return { error: "Not your attempt" }
  if (attempt.status !== "IN_PROGRESS") {
    // The attempt already ended — nothing meaningful to record against it.
    return { success: true }
  }

  const metadataResult = parseClientViolationMetadata(type, parsed.data.metadata)
  if (!metadataResult.success) return { error: "Invalid event details" }

  await recordViolationEvent({
    attemptId,
    studentId: user.id,
    examId: attempt.examId,
    type,
    source: "CLIENT_REPORTED",
    metadata: metadataResult.data,
  })

  // A flood of self-reports is itself a signal worth a human's attention,
  // independent of whatever the reports claim.
  if (await recordRequestAndCheckSuspicious(attemptId, "report")) {
    await recordViolationEvent({
      attemptId,
      studentId: user.id,
      examId: attempt.examId,
      type: "SUSPICIOUS_REQUEST_PATTERN",
      source: "SERVER_DETECTED",
      metadata: { context: "report-rate" },
    })
  }

  return { success: true }
}

// ─── Teacher/admin review ───────────────────────────────────────────────
const reviewSchema = z.object({
  status: z.enum(["REVIEWED_NO_ACTION", "REVIEWED_WARNING_ISSUED"]),
  reviewNote: z.string().trim().max(1000).optional(),
})

export async function reviewViolationEventAction(
  eventId: string,
  _state: unknown,
  formData: FormData
) {
  const user = await assertRole("TEACHER", "ADMIN")

  const event = await prisma.violationEvent.findUnique({
    where: { id: eventId },
    include: {
      attempt: { select: { examId: true, exam: { select: { teacherId: true } } } },
    },
  })
  if (!event) return { error: "Event not found" }
  assertOwner(user, event.attempt.exam.teacherId)

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" }
  }

  // Review status/note/reviewer is the only thing that ever changes on a
  // ViolationEvent — the original evidence (type, source, severity,
  // metadata, occurredAt) is immutable once recorded.
  await prisma.violationEvent.update({
    where: { id: eventId },
    data: {
      reviewStatus: parsed.data.status,
      reviewNote: parsed.data.reviewNote,
      reviewedById: user.id,
      reviewedAt: new Date(),
    },
  })

  safeRevalidatePath(`/teacher/exams/${event.attempt.examId}/violations`)
  return { success: true }
}

// ─── Appeals ────────────────────────────────────────────────────────────
const appealSchema = z.object({
  explanation: z.string().trim().min(10, "Explain why this decision should be reconsidered").max(2000),
})

export async function fileAppealAction(
  attemptId: string,
  _state: unknown,
  formData: FormData
) {
  const user = await assertRole("STUDENT")

  const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } })
  if (!attempt) return { error: "Attempt not found" }
  if (attempt.studentId !== user.id) return { error: "Not your attempt" }
  if (attempt.status !== "DISQUALIFIED") {
    return { error: "Only a disqualified attempt can be appealed" }
  }

  const existing = await prisma.violationAppeal.findFirst({
    where: { attemptId, status: "PENDING" },
  })
  if (existing) return { error: "An appeal is already pending for this attempt" }

  const parsed = appealSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid appeal" }
  }

  await prisma.violationAppeal.create({
    data: { attemptId, studentId: user.id, explanation: parsed.data.explanation },
  })

  return { success: true }
}

const resolveAppealSchema = z.object({
  decision: z.enum(["ACCEPTED", "REJECTED"]),
  resolutionNote: z.string().trim().min(5, "Explain the decision").max(1000),
})

export async function resolveAppealAction(
  appealId: string,
  _state: unknown,
  formData: FormData
) {
  const user = await assertRole("TEACHER", "ADMIN")

  const appeal = await prisma.violationAppeal.findUnique({
    where: { id: appealId },
    include: { attempt: { include: { exam: { select: { id: true, teacherId: true } } } } },
  })
  if (!appeal) return { error: "Appeal not found" }
  assertOwner(user, appeal.attempt.exam.teacherId)
  if (appeal.status !== "PENDING") return { error: "This appeal was already resolved" }

  const parsed = resolveAppealSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid resolution" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.violationAppeal.update({
      where: { id: appealId },
      data: {
        status: parsed.data.decision,
        resolutionNote: parsed.data.resolutionNote,
        resolvedById: user.id,
        resolvedAt: new Date(),
      },
    })

    if (parsed.data.decision === "ACCEPTED") {
      // Restore the exact state the attempt was in before disqualification
      // — never a guess — and leave disqualifiedReason in place as a
      // historical record of what was originally alleged and overturned.
      await tx.examAttempt.update({
        where: { id: appeal.attemptId },
        data: { status: appeal.attempt.statusBeforeDisqualification ?? "COMPLETED" },
      })
      await tx.gradingAuditLog.create({
        data: {
          examId: appeal.attempt.exam.id,
          attemptId: appeal.attemptId,
          action: "ATTEMPT_REQUALIFIED",
          actorId: user.id,
          reason: parsed.data.resolutionNote,
        },
      })
    }
  })

  if (parsed.data.decision === "ACCEPTED") {
    await invalidateScope(examLeaderboardScope(appeal.attempt.exam.id))
    await invalidateScope(globalLeaderboardScope)
  }

  safeRevalidatePath(`/teacher/exams/${appeal.attempt.exam.id}/violations`)
  return { success: true }
}
