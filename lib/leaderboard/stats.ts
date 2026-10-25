import { prisma } from "@/lib/db"
import { Prisma } from "@/prisma/generated/prisma/client"

export type LiveContestStats = {
  totalParticipants: number
  inProgress: number
  completed: number
  timedOut: number
  disqualified: number
  averageTimeTakenSec: number | null
  medianTimeTakenSec: number | null
}

/**
 * Deliberately NOT a ranked leaderboard: this exposes only aggregate counts
 * and timing statistics, never an individual student's score, answer, or
 * rank. That's what makes it safe to call genuinely live, during a contest,
 * without waiting on a teacher publishing results — unlike
 * getExamLeaderboard/getGlobalLeaderboard, which require a PUBLISHED result
 * specifically because they reveal individual standing.
 */
export async function getLiveContestStats(
  examId: string
): Promise<LiveContestStats> {
  const [statusCounts, timing] = await Promise.all([
    prisma.examAttempt.groupBy({
      by: ["status"],
      where: { examId },
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ avg_seconds: number | null; median_seconds: number | null }[]>(
      Prisma.sql`
        SELECT
          AVG(EXTRACT(EPOCH FROM ("submittedAt" - "startedAt")))::float AS avg_seconds,
          PERCENTILE_CONT(0.5) WITHIN GROUP (
            ORDER BY EXTRACT(EPOCH FROM ("submittedAt" - "startedAt"))
          )::float AS median_seconds
        FROM "ExamAttempt"
        WHERE "examId" = ${examId} AND "status" IN ('COMPLETED', 'TIMEOUT')
      `
    ),
  ])

  const counts = Object.fromEntries(
    statusCounts.map((c) => [c.status, c._count._all])
  )

  return {
    totalParticipants: statusCounts.reduce((sum, c) => sum + c._count._all, 0),
    inProgress: counts.IN_PROGRESS ?? 0,
    completed: counts.COMPLETED ?? 0,
    timedOut: counts.TIMEOUT ?? 0,
    disqualified: counts.DISQUALIFIED ?? 0,
    averageTimeTakenSec: timing[0]?.avg_seconds ?? null,
    medianTimeTakenSec: timing[0]?.median_seconds ?? null,
  }
}
