import { prisma } from "@/lib/db"

/**
 * Access policy (enforced by the caller via assertOwner before calling
 * these — these functions assume that's already happened): only the exam's
 * own teacher or an ADMIN may see every student's violation events and
 * appeals for it. A student may only ever see their own (see
 * getMyViolationEvents), never another student's.
 */
export function listFlaggedAttempts(examId: string) {
  return prisma.examAttempt.findMany({
    where: {
      examId,
      OR: [{ flaggedForReviewAt: { not: null } }, { status: "DISQUALIFIED" }],
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      violationEvents: { orderBy: { occurredAt: "desc" } },
      appeals: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { flaggedForReviewAt: "desc" },
  })
}

export function getMyViolationEvents(attemptId: string, studentId: string) {
  return prisma.violationEvent.findMany({
    where: { attemptId, studentId },
    orderBy: { occurredAt: "desc" },
    select: {
      id: true,
      type: true,
      source: true,
      severity: true,
      occurredAt: true,
      reviewStatus: true,
    },
  })
}

export function getPendingAppeal(attemptId: string) {
  return prisma.violationAppeal.findFirst({
    where: { attemptId, status: "PENDING" },
  })
}

export function getAppealsForAttempt(attemptId: string) {
  return prisma.violationAppeal.findMany({
    where: { attemptId },
    orderBy: { createdAt: "desc" },
  })
}
