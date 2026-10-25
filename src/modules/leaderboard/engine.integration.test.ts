import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { finalizeAndGradeAttempt } from "@/modules/grading/finalize"
import { getExamLeaderboard, getGlobalLeaderboard } from "./engine"
import { invalidateScope } from "./cache"

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []
const examIds: string[] = []

async function makeUser(label: string) {
  const user = await prisma.user.create({
    data: {
      name: `${label} ${suffix}`,
      email: `${label}-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role: "STUDENT",
      isEmailVerified: true,
    },
  })
  userIds.push(user.id)
  return user
}

let teacher: { id: string }

beforeAll(async () => {
  const t = await prisma.user.create({
    data: {
      name: "lb-teacher",
      email: `lb-teacher-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role: "TEACHER",
      isEmailVerified: true,
    },
  })
  userIds.push(t.id)
  teacher = t
})

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

beforeEach(async () => {
  // leaderboard results are cached — clear between tests so each one reads
  // its own freshly-seeded data instead of a previous test's cached page.
  for (const examId of examIds) await invalidateScope(`exam:${examId}`)
  await invalidateScope("global")
})

async function makeExam(opts: {
  tieBreakerPolicy?: "TIME_TAKEN_ASC" | "SUBMITTED_AT_ASC" | "ACCURACY_DESC"
  leaderboardEnabled?: boolean
} = {}) {
  const exam = await prisma.exam.create({
    data: {
      teacherId: teacher.id,
      title: `lb exam ${suffix}-${Math.random()}`,
      durationMinutes: 60,
      status: "PUBLISHED",
      publishedAt: new Date(),
      tieBreakerPolicy: opts.tieBreakerPolicy ?? "TIME_TAKEN_ASC",
      leaderboardEnabled: opts.leaderboardEnabled ?? true,
    },
  })
  examIds.push(exam.id)
  const question = await prisma.examQuestion.create({
    data: {
      examId: exam.id,
      order: 0,
      marks: 10,
      correctOptionSnapshot: "A",
      questionTextSnapshot: `Q ${suffix}`,
      optionASnapshot: "A",
      optionBSnapshot: "B",
      optionCSnapshot: "C",
      optionDSnapshot: "D",
    },
  })
  return { exam, question }
}

/** Creates a finalized, graded, PUBLISHED attempt with a specific score and timing. */
async function makeAttempt(
  examId: string,
  questionId: string,
  studentId: string,
  opts: {
    selectedOption: "A" | "B" | "C" | "D" | null
    startedSecondsAgo: number
    submittedSecondsAgo: number
    status?: "COMPLETED" | "TIMEOUT"
  }
) {
  const now = Date.now()
  const startedAt = new Date(now - opts.startedSecondsAgo * 1000)
  const attempt = await prisma.examAttempt.create({
    data: {
      examId,
      studentId,
      attemptNumber: 1,
      startedAt,
      deadline: new Date(startedAt.getTime() + 60 * 60_000),
    },
  })
  await prisma.attemptAnswer.create({
    data: {
      attemptId: attempt.id,
      examQuestionId: questionId,
      selectedOption: opts.selectedOption,
      presentationOrder: 0,
      clientUpdatedAt: startedAt,
    },
  })

  // Backdate submittedAt precisely by finalizing then overwriting the
  // timestamps — finalizeAndGradeAttempt always uses "now", so we adjust
  // afterward to get an exact, reproducible time-taken value for the test.
  await finalizeAndGradeAttempt(attempt.id, opts.status ?? "COMPLETED")
  const submittedAt = new Date(now - opts.submittedSecondsAgo * 1000)
  await prisma.examAttempt.update({
    where: { id: attempt.id },
    data: { submittedAt },
  })
  await prisma.examResult.update({
    where: { attemptId: attempt.id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  })

  return attempt
}

describe("getExamLeaderboard — ranking correctness", () => {
  it("ranks three students strictly by score, worked example", async () => {
    const { exam, question } = await makeExam()
    const [s1, s2, s3] = [await makeUser("r1"), await makeUser("r2"), await makeUser("r3")]

    // s1 correct (10), s2 and s3 both wrong (0) — distinct scores, no tie
    await makeAttempt(exam.id, question.id, s1.id, {
      selectedOption: "A",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })
    await makeAttempt(exam.id, question.id, s2.id, {
      selectedOption: "B",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 60,
    })
    await makeAttempt(exam.id, question.id, s3.id, {
      selectedOption: "C",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 70,
    })

    const board = await getExamLeaderboard({ examId: exam.id })

    expect(board.totalParticipants).toBe(3)
    expect(board.entries[0].studentId).toBe(s1.id)
    expect(board.entries[0].rank).toBe(1)
    expect(board.entries[0].obtainedMarks).toBe(10)
    expect(board.entries[1].rank).toBe(2) // s2 and s3 tied on score (0)...
    expect(board.entries[2].rank).toBe(3) // ...but time-taken breaks the tie
    // s2 submitted after 60s (40s taken), s3 after 70s (30s taken) from a
    // 100s-ago start — wait, submittedSecondsAgo smaller means submitted
    // MORE RECENTLY i.e. took LONGER from startedSecondsAgo=100. s2 took
    // 100-60=40s, s3 took 100-70=30s — s3 was faster, so s3 ranks above s2.
    expect(board.entries[1].studentId).toBe(s3.id)
    expect(board.entries[2].studentId).toBe(s2.id)
  })

  it("gives genuinely tied students (same score, same time taken) the same rank, and skips the next rank", async () => {
    const { exam, question } = await makeExam()
    const [s1, s2, s3] = [await makeUser("t1"), await makeUser("t2"), await makeUser("t3")]

    // s1 and s2 identical: correct, same timing. s3 scores lower.
    await makeAttempt(exam.id, question.id, s1.id, {
      selectedOption: "A",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })
    await makeAttempt(exam.id, question.id, s2.id, {
      selectedOption: "A",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })
    await makeAttempt(exam.id, question.id, s3.id, {
      selectedOption: "B",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })

    const board = await getExamLeaderboard({ examId: exam.id })

    const ranksById = Object.fromEntries(
      board.entries.map((e) => [e.studentId, e.rank])
    )
    expect(ranksById[s1.id]).toBe(1)
    expect(ranksById[s2.id]).toBe(1) // tied with s1 — same displayed rank
    expect(ranksById[s3.id]).toBe(3) // rank 2 is skipped, standard competition ranking
  })

  it("only counts each student's single best attempt", async () => {
    const { exam, question } = await makeExam()
    const student = await makeUser("best")

    // first attempt: wrong. Needs maxAttempts > 1 to allow a second one.
    await prisma.exam.update({ where: { id: exam.id }, data: { maxAttempts: 2 } })
    const first = await makeAttempt(exam.id, question.id, student.id, {
      selectedOption: "B",
      startedSecondsAgo: 200,
      submittedSecondsAgo: 150,
    })
    await prisma.examAttempt.update({
      where: { id: first.id },
      data: { attemptNumber: 1 },
    })

    const now = Date.now()
    const startedAt2 = new Date(now - 100_000)
    const second = await prisma.examAttempt.create({
      data: {
        examId: exam.id,
        studentId: student.id,
        attemptNumber: 2,
        startedAt: startedAt2,
        deadline: new Date(startedAt2.getTime() + 60 * 60_000),
      },
    })
    await prisma.attemptAnswer.create({
      data: {
        attemptId: second.id,
        examQuestionId: question.id,
        selectedOption: "A", // correct this time
        presentationOrder: 0,
        clientUpdatedAt: startedAt2,
      },
    })
    await finalizeAndGradeAttempt(second.id, "COMPLETED")
    await prisma.examResult.update({
      where: { attemptId: second.id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    })

    const board = await getExamLeaderboard({ examId: exam.id })
    const entries = board.entries.filter((e) => e.studentId === student.id)
    expect(entries).toHaveLength(1) // one row, not two
    expect(entries[0].obtainedMarks).toBe(10) // their best attempt's score
  })

  it("excludes incomplete, unpublished, and disqualified attempts", async () => {
    const { exam, question } = await makeExam()
    const [inProgressStudent, unpublishedStudent, disqualifiedStudent, validStudent] = [
      await makeUser("ip"),
      await makeUser("unpub"),
      await makeUser("dq"),
      await makeUser("valid"),
    ]

    // in-progress: never finalized
    await prisma.examAttempt.create({
      data: {
        examId: exam.id,
        studentId: inProgressStudent.id,
        attemptNumber: 1,
        startedAt: new Date(),
        deadline: new Date(Date.now() + 60 * 60_000),
      },
    })

    // graded but still PROVISIONAL (never explicitly published)
    const unpublished = await prisma.examAttempt.create({
      data: {
        examId: exam.id,
        studentId: unpublishedStudent.id,
        attemptNumber: 1,
        startedAt: new Date(),
        deadline: new Date(Date.now() + 60 * 60_000),
      },
    })
    await prisma.attemptAnswer.create({
      data: {
        attemptId: unpublished.id,
        examQuestionId: question.id,
        selectedOption: "A",
        presentationOrder: 0,
        clientUpdatedAt: new Date(),
      },
    })
    await finalizeAndGradeAttempt(unpublished.id, "COMPLETED") // stays PROVISIONAL

    // disqualified after being completed and published
    const disqualified = await makeAttempt(exam.id, question.id, disqualifiedStudent.id, {
      selectedOption: "A",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })
    await prisma.examAttempt.update({
      where: { id: disqualified.id },
      data: { status: "DISQUALIFIED", disqualifiedReason: "test" },
    })

    // the one legitimate entry
    await makeAttempt(exam.id, question.id, validStudent.id, {
      selectedOption: "A",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })

    const board = await getExamLeaderboard({ examId: exam.id })
    const ids = board.entries.map((e) => e.studentId)

    expect(ids).toContain(validStudent.id)
    expect(ids).not.toContain(inProgressStudent.id)
    expect(ids).not.toContain(unpublishedStudent.id)
    expect(ids).not.toContain(disqualifiedStudent.id)
    expect(board.totalParticipants).toBe(1)
  })

  it("percentile is 0 for the lowest scorer and approaches 1 for the top scorer", async () => {
    const { exam, question } = await makeExam()
    const [low, mid, top] = [await makeUser("low"), await makeUser("mid"), await makeUser("top")]

    await makeAttempt(exam.id, question.id, low.id, {
      selectedOption: "B",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })
    const midAttempt = await makeAttempt(exam.id, question.id, mid.id, {
      selectedOption: "B",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })
    // bump mid's score to be strictly between low (0) and top (10) by
    // editing their result directly — simplest way to get 3 distinct tiers
    await prisma.examResult.update({
      where: { attemptId: midAttempt.id },
      data: { obtainedMarks: 5 },
    })
    await makeAttempt(exam.id, question.id, top.id, {
      selectedOption: "A",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })

    const board = await getExamLeaderboard({ examId: exam.id })
    const byId = Object.fromEntries(board.entries.map((e) => [e.studentId, e]))

    expect(byId[low.id].percentile).toBe(0)
    expect(byId[top.id].percentile).toBe(1)
    expect(byId[mid.id].percentile).toBeGreaterThan(0)
    expect(byId[mid.id].percentile).toBeLessThan(1)
  })

  it("is deterministic across repeated queries", async () => {
    const { exam, question } = await makeExam()
    const students = await Promise.all(
      Array.from({ length: 5 }, (_, i) => makeUser(`det${i}`))
    )
    for (const s of students) {
      await makeAttempt(exam.id, question.id, s.id, {
        selectedOption: "A",
        startedSecondsAgo: 100,
        submittedSecondsAgo: 50,
      })
    }

    const first = await getExamLeaderboard({ examId: exam.id })
    await invalidateScope(`exam:${exam.id}`) // force a fresh query, not a cache hit
    const second = await getExamLeaderboard({ examId: exam.id })

    expect(first.entries.map((e) => e.studentId)).toEqual(
      second.entries.map((e) => e.studentId)
    )
  }, 15_000)

  it("paginates without duplicates or gaps", async () => {
    const { exam, question } = await makeExam()
    const students = await Promise.all(
      Array.from({ length: 7 }, (_, i) => makeUser(`page${i}`))
    )
    for (const s of students) {
      await makeAttempt(exam.id, question.id, s.id, {
        selectedOption: "A",
        startedSecondsAgo: 100,
        submittedSecondsAgo: 50,
      })
    }

    const page1 = await getExamLeaderboard({ examId: exam.id, page: 1, pageSize: 3 })
    const page2 = await getExamLeaderboard({ examId: exam.id, page: 2, pageSize: 3 })
    const page3 = await getExamLeaderboard({ examId: exam.id, page: 3, pageSize: 3 })

    expect(page1.totalParticipants).toBe(7)
    expect(page1.pageCount).toBe(3)
    const allIds = [...page1.entries, ...page2.entries, ...page3.entries].map(
      (e) => e.studentId
    )
    expect(new Set(allIds).size).toBe(7) // no duplicates
    expect(allIds).toHaveLength(7) // and no gaps
  }, 15_000)

  it("excludes exams with leaderboardEnabled=false from the global leaderboard", async () => {
    const { exam: enabledExam, question: q1 } = await makeExam({ leaderboardEnabled: true })
    const { exam: disabledExam, question: q2 } = await makeExam({ leaderboardEnabled: false })
    const student = await makeUser("global-toggle")

    await makeAttempt(enabledExam.id, q1.id, student.id, {
      selectedOption: "A",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })
    await makeAttempt(disabledExam.id, q2.id, student.id, {
      selectedOption: "A",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })

    const board = await getGlobalLeaderboard({})
    const entry = board.entries.find((e) => e.studentId === student.id)
    expect(entry?.examsCompleted).toBe(1) // only the enabled exam counts
  })
})

describe("leaderboard correctness under concurrent submissions", () => {
  it("reflects every attempt correctly when multiple students finalize at the same time", async () => {
    const { exam, question } = await makeExam()
    const students = await Promise.all(
      Array.from({ length: 5 }, (_, i) => makeUser(`concurrent${i}`))
    )

    // All 5 students start, answer, and submit at effectively the same
    // instant — exercising finalizeAndGradeAttempt's per-row transaction
    // under real concurrency, then publishing all 5 results at once.
    const now = new Date()
    const attempts = await Promise.all(
      students.map(async (s, i) => {
        const attempt = await prisma.examAttempt.create({
          data: {
            examId: exam.id,
            studentId: s.id,
            attemptNumber: 1,
            startedAt: now,
            deadline: new Date(now.getTime() + 60 * 60_000),
          },
        })
        await prisma.attemptAnswer.create({
          data: {
            attemptId: attempt.id,
            examQuestionId: question.id,
            selectedOption: i % 2 === 0 ? "A" : "B", // alternate correct/incorrect
            presentationOrder: 0,
            clientUpdatedAt: now,
          },
        })
        return attempt
      })
    )

    await Promise.all(
      attempts.map((a) => finalizeAndGradeAttempt(a.id, "COMPLETED"))
    )
    await prisma.examResult.updateMany({
      where: { attempt: { examId: exam.id } },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    })

    const board = await getExamLeaderboard({ examId: exam.id, pageSize: 10 })

    expect(board.totalParticipants).toBe(5)
    const correctStudents = students.filter((_, i) => i % 2 === 0)
    const incorrectStudents = students.filter((_, i) => i % 2 !== 0)
    const topIds = board.entries
      .filter((e) => e.obtainedMarks === 10)
      .map((e) => e.studentId)
    const bottomIds = board.entries
      .filter((e) => e.obtainedMarks === 0)
      .map((e) => e.studentId)

    expect(new Set(topIds)).toEqual(new Set(correctStudents.map((s) => s.id)))
    expect(new Set(bottomIds)).toEqual(new Set(incorrectStudents.map((s) => s.id)))
    // every result exists exactly once — no lost update, no duplicate row
    const resultCount = await prisma.examResult.count({
      where: { attempt: { examId: exam.id } },
    })
    expect(resultCount).toBe(5)
  })
})

describe("caching is actually used, and invalidation actually works", () => {
  it("serves a stale cached page until the scope is invalidated", async () => {
    const { exam, question } = await makeExam()
    const student = await makeUser("cache-stale")
    await makeAttempt(exam.id, question.id, student.id, {
      selectedOption: "B", // wrong — 0 marks
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })

    const first = await getExamLeaderboard({ examId: exam.id })
    expect(first.entries[0].obtainedMarks).toBe(0)

    // Change the underlying data directly, bypassing every call site that
    // would normally invalidate the cache — if caching does nothing, this
    // change would already be visible on the next read.
    await prisma.examResult.updateMany({
      where: { attempt: { examId: exam.id } },
      data: { obtainedMarks: 999 },
    })

    const stillCached = await getExamLeaderboard({ examId: exam.id })
    expect(stillCached.entries[0].obtainedMarks).toBe(0) // proves it came from cache, not Postgres

    await invalidateScope(`exam:${exam.id}`)

    const fresh = await getExamLeaderboard({ examId: exam.id })
    expect(fresh.entries[0].obtainedMarks).toBe(999) // now reflects the real data
  })
})

describe("getGlobalLeaderboard — worked example", () => {
  it("sums each exam's percentage score across exams", async () => {
    const { exam: examA, question: qA } = await makeExam()
    const { exam: examB, question: qB } = await makeExam()
    const student = await makeUser("global-sum")

    // examA: 10/10 marks = 100%. examB: question worth 10, wrong answer = 0%.
    await makeAttempt(examA.id, qA.id, student.id, {
      selectedOption: "A",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })
    await makeAttempt(examB.id, qB.id, student.id, {
      selectedOption: "B",
      startedSecondsAgo: 100,
      submittedSecondsAgo: 50,
    })

    const board = await getGlobalLeaderboard({})
    const entry = board.entries.find((e) => e.studentId === student.id)
    expect(entry?.totalScore).toBe(100) // 100% + 0% = 100
    expect(entry?.examsCompleted).toBe(2)
  })
})
