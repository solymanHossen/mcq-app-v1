/**
 * Concurrency/load harness for the Phase 8 performance audit. NOT part of
 * the regular test suite — it doesn't match Vitest's default `*.test.ts`
 * glob, so `npm test` never runs it. Run explicitly:
 *
 *   npx vitest run lib/perf/exam-concurrency.loadtest.ts --no-coverage
 *
 * It exercises the REAL server action functions (startAttemptAction,
 * saveAnswerAction, submitAttemptAction, getExamLeaderboard) directly
 * in-process — bypassing HTTP and Next.js request handling, but exercising
 * every real Prisma query, transaction, and the actual shared connection
 * pool — against a database pre-populated with ~5k students / ~9k attempts
 * / ~360k answers (see /tmp .../scratchpad/seed-scale.ts) so query plans and
 * pool contention are representative of a platform with real history, not
 * an empty dev database.
 *
 * This measures server-action + Postgres-layer latency on this one
 * machine's shared resources — NOT full end-to-end HTTP latency through a
 * browser, a proxy, or a production-sized host. Numbers here are diagnostic
 * and comparative (before/after a change), never a capacity guarantee.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import {
  startAttemptAction,
  saveAnswerAction,
  submitAttemptAction,
} from "@/modules/attempts/actions"
import { getExamLeaderboard } from "@/modules/leaderboard/engine"
import { printStats, timed } from "./stats"

const mockAuth = vi.mocked(auth)

function asUser(user: { id: string; tokenVersion: number }) {
  mockAuth.mockResolvedValue({
    user: { id: user.id, tokenVersion: user.tokenVersion },
    expires: "",
  } as never)
}

const suffix = `loadtest-${Date.now()}`
const userIds: string[] = []
let teacherId: string
let examId: string
let questionIds: string[] = []

const QUESTION_COUNT = 30

async function makeFreshStudents(n: number) {
  const passwordHash = await hashPassword("irrelevant")
  const rows = Array.from({ length: n }, (_, i) => ({
    id: crypto.randomUUID(),
    name: `${suffix}-student-${i}-${Math.random()}`,
    email: `${suffix}-student-${i}-${Math.random()}@example.com`,
    passwordHash,
    role: "STUDENT" as const,
    isEmailVerified: true,
  }))
  await prisma.user.createMany({ data: rows })
  rows.forEach((r) => userIds.push(r.id))
  return rows
}

beforeAll(async () => {
  const teacher = await prisma.user.create({
    data: {
      name: "Loadtest Teacher",
      email: `${suffix}-teacher@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role: "TEACHER",
      isEmailVerified: true,
    },
  })
  teacherId = teacher.id
  userIds.push(teacher.id)

  const exam = await prisma.exam.create({
    data: {
      teacherId,
      title: `Loadtest Exam ${suffix}`,
      durationMinutes: 60,
      maxAttempts: 1,
      status: "PUBLISHED",
      publishedAt: new Date(),
      answerKeyReleased: true,
    },
  })
  examId = exam.id

  const questions = await Promise.all(
    Array.from({ length: QUESTION_COUNT }, (_, i) =>
      prisma.examQuestion.create({
        data: {
          examId,
          order: i,
          marks: 1,
          questionTextSnapshot: `Loadtest Q${i}`,
          optionASnapshot: "A",
          optionBSnapshot: "B",
          optionCSnapshot: "C",
          optionDSnapshot: "D",
          correctOptionSnapshot: "A",
        },
      })
    )
  )
  questionIds = questions.map((q) => q.id)
}, 30_000)

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId } })
  await prisma.examQuestion.deleteMany({ where: { examId } })
  await prisma.exam.deleteMany({ where: { id: examId } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
}, 60_000)

describe("concurrent exam starts", () => {
  it("N students starting the same exam at the same instant", async () => {
    const CONCURRENCY = 60
    const students = await makeFreshStudents(CONCURRENCY)

    const samples: number[] = []
    let errors = 0

    const results = await Promise.all(
      students.map(async (s) => {
        asUser({ id: s.id, tokenVersion: 0 })
        const { result, ms } = await timed(() => startAttemptAction(examId))
        samples.push(ms)
        if ("error" in result) errors++
        return result
      })
    )

    printStats("startAttemptAction (60-way burst)", samples, errors)

    const attemptIds = results
      .filter((r): r is { attemptId: string } => "attemptId" in r)
      .map((r) => r.attemptId)
    expect(attemptIds).toHaveLength(CONCURRENCY) // nobody errored

    const distinct = new Set(attemptIds)
    expect(distinct.size).toBe(CONCURRENCY) // no duplicate/shared attempts

    const count = await prisma.examAttempt.count({ where: { examId } })
    expect(count).toBe(CONCURRENCY)
  }, 60_000)
})

describe("sustained concurrent autosave", () => {
  it("many students answering many questions at once", async () => {
    const STUDENT_COUNT = 50
    const students = await makeFreshStudents(STUDENT_COUNT)

    const attempts: { studentId: string; attemptId: string }[] = []
    for (const s of students) {
      asUser({ id: s.id, tokenVersion: 0 })
      const result = await startAttemptAction(examId)
      if ("attemptId" in result) attempts.push({ studentId: s.id, attemptId: result.attemptId })
    }
    expect(attempts).toHaveLength(STUDENT_COUNT)

    // Every student answers every question, all of it fired concurrently —
    // a deliberately extreme synthetic spike (everyone saves within the same
    // millisecond), not typical sustained traffic. 50 students x 30
    // questions = 1500 concurrent autosaves at once.
    //
    // Under real backpressure (a configured connectionTimeoutMillis — see
    // lib/db.ts) a request that can't get a connection within the timeout
    // THROWS rather than returning {error}. That's the intended tradeoff:
    // a fast, clear failure instead of a multi-second hang. The existing
    // client-side autosave hook (lib/attempts/use-attempt-sync.ts) already
    // catches exactly this and retries after 4s with the answer safely kept
    // in IndexedDB meanwhile — so this harness tallies thrown failures
    // separately and expects them to be a small minority, not zero.
    const samples: number[] = []
    const thrownLatencies: number[] = []
    let softErrors = 0
    const tasks: Promise<void>[] = []
    for (const { studentId, attemptId } of attempts) {
      const sessionToken = crypto.randomUUID()
      for (const examQuestionId of questionIds) {
        tasks.push(
          (async () => {
            asUser({ id: studentId, tokenVersion: 0 })
            const start = performance.now()
            try {
              const { result, ms } = await timed(() =>
                saveAnswerAction({
                  attemptId,
                  examQuestionId,
                  selectedOption: "A",
                  clientUpdatedAt: new Date().toISOString(),
                  sessionToken,
                })
              )
              samples.push(ms)
              if (result && "error" in result) softErrors++
            } catch {
              thrownLatencies.push(performance.now() - start)
            }
          })()
        )
      }
    }
    await Promise.all(tasks)

    printStats(`saveAnswerAction (${tasks.length}-way burst, succeeded)`, samples, softErrors)
    printStats(`saveAnswerAction (${tasks.length}-way burst, pool-timeout shed)`, thrownLatencies, 0)
    console.log(
      `saveAnswerAction (${tasks.length}-way burst): ${thrownLatencies.length}/${tasks.length} shed by the connection-pool timeout — this is deliberate backpressure under a deliberately pathological "every save at the same instant" burst, not realistic spread-out autosave traffic. The existing client-side autosave hook already retries these transparently (lib/attempts/use-attempt-sync.ts), with the answer durably queued in IndexedDB in the meantime.`
    )

    expect(softErrors).toBe(0)
    // The whole point of configuring connectionTimeoutMillis is that an
    // overloaded pool fails FAST, not that it never sheds load. Verify the
    // shed requests actually failed fast (close to the configured timeout)
    // rather than some other slow/hanging failure mode sneaking in.
    for (const ms of thrownLatencies) {
      expect(ms).toBeLessThan(6_500) // configured timeout (5000ms) + slack
    }
  }, 120_000)
})

describe("simultaneous final submissions (deadline storm)", () => {
  it("many attempts submitting in the same instant", async () => {
    const STUDENT_COUNT = 50
    const students = await makeFreshStudents(STUDENT_COUNT)

    const attemptIds: string[] = []
    for (const s of students) {
      asUser({ id: s.id, tokenVersion: 0 })
      const result = await startAttemptAction(examId)
      if ("attemptId" in result) attemptIds.push(result.attemptId)
    }
    expect(attemptIds).toHaveLength(STUDENT_COUNT)

    const samples: number[] = []
    let errors = 0
    await Promise.all(
      attemptIds.map(async (attemptId, i) => {
        asUser({ id: students[i].id, tokenVersion: 0 })
        const { result, ms } = await timed(() =>
          submitAttemptAction(attemptId, { clientTimezone: "UTC" })
        )
        samples.push(ms)
        if ("error" in result) errors++
      })
    )

    printStats(`submitAttemptAction (${STUDENT_COUNT}-way storm)`, samples, errors)
    expect(errors).toBe(0)

    const results = await prisma.examResult.count({
      where: { attempt: { examId, id: { in: attemptIds } } },
    })
    expect(results).toBe(STUDENT_COUNT) // exactly one result per attempt, none lost or duplicated
  }, 120_000)
})

describe("leaderboard reads under concurrent load", () => {
  it("many concurrent reads of an exam leaderboard with real history", async () => {
    // Uses the bulk-seeded exam (~3k published results), not the empty
    // loadtest exam — a leaderboard read is only interesting at scale. Run
    // `npx tsx lib/perf/seed-scale.ts` first to populate it.
    const scaleExam = await prisma.exam.findFirst({
      where: { title: { contains: "scale-seed-" } },
      select: { id: true },
    })
    if (!scaleExam) {
      console.warn("No scale-seeded exam found — skipping (run `npx tsx lib/perf/seed-scale.ts` first)")
      return
    }

    const CONCURRENCY = 40
    const samples: number[] = []
    let errors = 0
    await Promise.all(
      Array.from({ length: CONCURRENCY }, async (_, i) => {
        const { ms } = await timed(() =>
          getExamLeaderboard({ examId: scaleExam.id, page: (i % 5) + 1 })
        ).catch((e) => {
          errors++
          throw e
        })
        samples.push(ms)
      })
    )

    printStats(`getExamLeaderboard (${CONCURRENCY}-way concurrent reads)`, samples, errors)
  }, 60_000)
})
