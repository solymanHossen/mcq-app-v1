import { prisma } from "@/lib/db"
import type {
  ViolationType,
  ViolationSource,
  Prisma,
} from "@/prisma/generated/prisma/client"
import { VIOLATION_SEVERITY, severityScore } from "./engine"

export async function recordViolationEvent(opts: {
  attemptId: string
  studentId: string
  examId: string
  type: ViolationType
  source: ViolationSource
  metadata?: Prisma.InputJsonValue
}) {
  await prisma.violationEvent.create({
    data: {
      attemptId: opts.attemptId,
      studentId: opts.studentId,
      type: opts.type,
      source: opts.source,
      severity: VIOLATION_SEVERITY[opts.type],
      metadata: opts.metadata,
    },
  })

  await maybeFlagForReview(opts.attemptId, opts.examId)
}

/**
 * Flags the attempt for mandatory human review the first time its
 * cumulative violation severity score crosses the exam's configured
 * threshold. This is the ONLY automated consequence of a violation event,
 * ever — it never changes attempt status, never disqualifies, and never
 * fires more than once per attempt. Disqualification stays a separate,
 * explicit, reason-required teacher/admin action (disqualifyAttemptAction).
 */
async function maybeFlagForReview(attemptId: string, examId: string) {
  const [exam, attempt, events] = await Promise.all([
    prisma.exam.findUniqueOrThrow({
      where: { id: examId },
      select: { violationReviewThreshold: true },
    }),
    prisma.examAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      select: { flaggedForReviewAt: true },
    }),
    prisma.violationEvent.findMany({
      where: { attemptId },
      select: { severity: true },
    }),
  ])

  if (attempt.flaggedForReviewAt) return

  const score = severityScore(events.map((e) => e.severity))
  if (score < exam.violationReviewThreshold) return

  // Conditional on flaggedForReviewAt still being null: if two violation
  // events race to cross the threshold at the same time, only one of them
  // actually performs the flip and writes the audit entry.
  const { count } = await prisma.examAttempt.updateMany({
    where: { id: attemptId, flaggedForReviewAt: null },
    data: { flaggedForReviewAt: new Date() },
  })
  if (count === 0) return

  await prisma.gradingAuditLog.create({
    data: {
      examId,
      attemptId,
      action: "ATTEMPT_FLAGGED_FOR_REVIEW",
      metadata: { severityScore: score, threshold: exam.violationReviewThreshold },
    },
  })
}
