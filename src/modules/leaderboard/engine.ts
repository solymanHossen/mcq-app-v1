import { prisma } from "@/lib/prisma"
import { Prisma } from "@/prisma/generated/prisma/client"
import type { TieBreakerPolicy } from "@/prisma/generated/prisma/client"
import { getOrComputeCachedPage } from "./cache"

export const LEADERBOARD_PAGE_SIZE = 20

export type LeaderboardEntry = {
  rank: number
  studentId: string
  studentName: string
  obtainedMarks: number
  totalMarks: number
  accuracy: number
  timeTakenSec: number | null
  submittedAt: string
  percentile: number
}

export type LeaderboardPage = {
  entries: LeaderboardEntry[]
  totalParticipants: number
  page: number
  pageCount: number
}

/**
 * Three policies, each documented exactly:
 * - TIME_TAKEN_ASC (default): among equal scores, the faster submission
 *   (submittedAt - startedAt) ranks higher.
 * - SUBMITTED_AT_ASC: among equal scores, the earlier wall-clock submission
 *   ranks higher (rewards being first, not necessarily fastest).
 * - ACCURACY_DESC: among equal scores, higher correct/(correct+incorrect)
 *   ranks higher (rewards precision over raw speed).
 *
 * Only ever switched on a trusted server-side enum value (never
 * interpolated from client input), so branching the raw SQL fragment stays
 * injection-safe. Returns the column alias name defined in best_attempts
 * below, so the same fragment works both there and in the ranked CTE.
 */
function tieBreakerSql(policy: TieBreakerPolicy) {
  switch (policy) {
    case "SUBMITTED_AT_ASC":
      return Prisma.sql`submitted_at ASC`
    case "ACCURACY_DESC":
      return Prisma.sql`accuracy DESC`
    case "TIME_TAKEN_ASC":
    default:
      return Prisma.sql`time_taken_sec ASC`
  }
}

type RawRow = {
  student_id: string
  student_name: string
  obtained_marks: number
  total_marks: number
  accuracy: number
  time_taken_sec: number | null
  submitted_at: Date
  rnk: bigint
  percentile: number
  total_count: bigint
}

/**
 * Exam-specific leaderboard: one row per student (their single best
 * COMPLETED/TIMEOUT attempt with a PUBLISHED result), ranked by
 * obtainedMarks DESC then the exam's configured tie-breaker.
 *
 * Ranking uses RANK() for the DISPLAYED rank — genuine ties (identical score
 * AND identical tie-breaker value) share the same rank, with the next rank
 * skipping accordingly (1, 1, 3). That is "correct handling of equal
 * scores": two students indistinguishable by every configured criterion are
 * shown as tied, not arbitrarily split. The final result set is still
 * fetched in a fully deterministic order (the outer ORDER BY appends the
 * attempt id as a last, purely mechanical tiebreak) so paging through tied
 * entries is stable across repeated requests, even though that extra
 * tiebreak never affects the displayed rank number itself.
 *
 * Percentile = PERCENT_RANK() computed over ascending score: the fraction
 * of participants this student outscored, from 0.0 (bottom) to 1.0 (top
 * scorer). A single-participant exam is defined as percentile 0 — that is
 * PostgreSQL's literal definition (there's no one to outscore), not a bug.
 */
export async function getExamLeaderboard(opts: {
  examId: string
  page?: number
  pageSize?: number
}): Promise<LeaderboardPage> {
  const page = Math.max(1, opts.page ?? 1)
  const pageSize = opts.pageSize ?? LEADERBOARD_PAGE_SIZE
  const cacheScope = `exam:${opts.examId}`

  return getOrComputeCachedPage(cacheScope, page, pageSize, async () => {
    const exam = await prisma.exam.findUniqueOrThrow({
      where: { id: opts.examId },
      select: { tieBreakerPolicy: true },
    })
    const tieBreak = tieBreakerSql(exam.tieBreakerPolicy)

    const rows = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
      WITH best_attempts AS (
        SELECT DISTINCT ON (ea."studentId")
          ea."id" AS attempt_id,
          ea."studentId" AS student_id,
          u."name" AS student_name,
          er."obtainedMarks" AS obtained_marks,
          er."totalMarks" AS total_marks,
          er."accuracy" AS accuracy,
          EXTRACT(EPOCH FROM (ea."submittedAt" - ea."startedAt"))::int AS time_taken_sec,
          ea."submittedAt" AS submitted_at
        FROM "ExamAttempt" ea
        JOIN "ExamResult" er ON er."attemptId" = ea."id"
        JOIN "User" u ON u."id" = ea."studentId"
        WHERE ea."examId" = ${opts.examId}
          AND ea."status" IN ('COMPLETED', 'TIMEOUT')
          AND er."status" = 'PUBLISHED'
        ORDER BY ea."studentId", obtained_marks DESC, ${tieBreak}, attempt_id ASC
      ),
      ranked AS (
        SELECT
          *,
          RANK() OVER (ORDER BY obtained_marks DESC, ${tieBreak}) AS rnk,
          PERCENT_RANK() OVER (ORDER BY obtained_marks ASC) AS percentile,
          COUNT(*) OVER () AS total_count
        FROM best_attempts
      )
      SELECT * FROM ranked
      ORDER BY obtained_marks DESC, ${tieBreak}, attempt_id ASC
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `)

    const totalParticipants = rows.length > 0 ? Number(rows[0].total_count) : 0
    const entries: LeaderboardEntry[] = rows.map((r) => ({
      rank: Number(r.rnk),
      studentId: r.student_id,
      studentName: r.student_name,
      obtainedMarks: r.obtained_marks,
      totalMarks: r.total_marks,
      accuracy: r.accuracy,
      timeTakenSec: r.time_taken_sec,
      submittedAt: r.submitted_at.toISOString(),
      percentile: r.percentile,
    }))

    const result: LeaderboardPage = {
      entries,
      totalParticipants,
      page,
      pageCount: Math.max(1, Math.ceil(totalParticipants / pageSize)),
    }
    return result
  })
}

export type GlobalLeaderboardEntry = {
  rank: number
  studentId: string
  studentName: string
  totalScore: number
  examsCompleted: number
  percentile: number
}

export type GlobalLeaderboardPage = {
  entries: GlobalLeaderboardEntry[]
  totalParticipants: number
  page: number
  pageCount: number
}

type GlobalRawRow = {
  student_id: string
  student_name: string
  total_score: number
  exams_completed: bigint
  rnk: bigint
  percentile: number
  total_count: bigint
}

const GLOBAL_SCOPE = "global"

/**
 * Global score, defined precisely because raw marks aren't comparable
 * across exams with different totals: for each exam a student has a
 * PUBLISHED result on (their single best attempt, only counting exams with
 * leaderboardEnabled), convert that attempt to a percentage
 * (obtainedMarks / totalMarks * 100) and sum those percentages across every
 * such exam. This rewards both doing well AND taking more exams — it is
 * deliberately not an average, so it also reflects participation. A
 * negative per-exam percentage (from negative marking) still contributes
 * negatively to the sum; it is not floored at zero, consistent with
 * Phase 4's per-exam scoring policy.
 *
 * Tie-break: more exams completed wins; the final tiebreak (student id) is
 * purely mechanical for determinism, not a meaningful ranking criterion.
 */
export async function getGlobalLeaderboard(opts: {
  page?: number
  pageSize?: number
}): Promise<GlobalLeaderboardPage> {
  const page = Math.max(1, opts.page ?? 1)
  const pageSize = opts.pageSize ?? LEADERBOARD_PAGE_SIZE

  return getOrComputeCachedPage(GLOBAL_SCOPE, page, pageSize, async () => {
    const rows = await prisma.$queryRaw<GlobalRawRow[]>(Prisma.sql`
      WITH best_per_exam AS (
        SELECT DISTINCT ON (ea."studentId", ea."examId")
          ea."studentId" AS student_id,
          ea."examId" AS exam_id,
          ea."id" AS attempt_id,
          CASE WHEN er."totalMarks" > 0
            THEN (er."obtainedMarks" / er."totalMarks") * 100
            ELSE 0
          END AS pct
        FROM "ExamAttempt" ea
        JOIN "ExamResult" er ON er."attemptId" = ea."id"
        JOIN "Exam" e ON e."id" = ea."examId"
        WHERE ea."status" IN ('COMPLETED', 'TIMEOUT')
          AND er."status" = 'PUBLISHED'
          AND e."leaderboardEnabled" = true
        ORDER BY ea."studentId", ea."examId", er."obtainedMarks" DESC, ea."id" ASC
      ),
      aggregated AS (
        SELECT
          student_id,
          SUM(pct) AS total_score,
          COUNT(*) AS exams_completed
        FROM best_per_exam
        GROUP BY student_id
      ),
      ranked AS (
        SELECT
          a.student_id,
          u."name" AS student_name,
          a.total_score,
          a.exams_completed,
          RANK() OVER (ORDER BY a.total_score DESC) AS rnk,
          PERCENT_RANK() OVER (ORDER BY a.total_score ASC) AS percentile,
          COUNT(*) OVER () AS total_count
        FROM aggregated a
        JOIN "User" u ON u."id" = a.student_id
      )
      SELECT * FROM ranked
      ORDER BY total_score DESC, exams_completed DESC, student_id ASC
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `)

    const totalParticipants = rows.length > 0 ? Number(rows[0].total_count) : 0
    const entries: GlobalLeaderboardEntry[] = rows.map((r) => ({
      rank: Number(r.rnk),
      studentId: r.student_id,
      studentName: r.student_name,
      totalScore: r.total_score,
      examsCompleted: Number(r.exams_completed),
      percentile: r.percentile,
    }))

    const result: GlobalLeaderboardPage = {
      entries,
      totalParticipants,
      page,
      pageCount: Math.max(1, Math.ceil(totalParticipants / pageSize)),
    }
    return result
  })
}

export function examLeaderboardScope(examId: string) {
  return `exam:${examId}`
}

export { GLOBAL_SCOPE as globalLeaderboardScope }
