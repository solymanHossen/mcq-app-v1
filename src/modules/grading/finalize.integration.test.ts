import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { finalizeAndGradeAttempt } from "./finalize"

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []
const examIds: string[] = []

async function makeUser(role: "TEACHER" | "STUDENT", label: string) {
  const user = await prisma.user.create({
    data: {
      name: label,
      email: `${label}-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role,
      isEmailVerified: true,
    },
  })
  userIds.push(user.id)
  return user
}

async function makeInProgressAttempt(teacherId: string, studentId: string) {
  const exam = await prisma.exam.create({
    data: {
      teacherId,
      title: `finalize exam ${suffix}-${Math.random()}`,
      durationMinutes: 60,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  })
  examIds.push(exam.id)

  const question = await prisma.examQuestion.create({
    data: {
      examId: exam.id,
      order: 0,
      marks: 1,
      questionTextSnapshot: `Q ${suffix}`,
      optionASnapshot: "A",
      optionBSnapshot: "B",
      optionCSnapshot: "C",
      optionDSnapshot: "D",
      correctOptionSnapshot: "A",
    },
  })

  const now = new Date()
  const attempt = await prisma.examAttempt.create({
    data: {
      examId: exam.id,
      studentId,
      attemptNumber: 1,
      startedAt: now,
      deadline: new Date(now.getTime() + 60 * 60_000),
    },
  })
  await prisma.attemptAnswer.create({
    data: {
      attemptId: attempt.id,
      examQuestionId: question.id,
      selectedOption: "A",
      presentationOrder: 0,
      clientUpdatedAt: now,
    },
  })

  return attempt
}

async function makeInProgressAttemptWithAnswer(
  teacherId: string,
  studentId: string,
  opts: { selectedOption: "A" | "B"; correctOption: "A" | "B" }
) {
  const exam = await prisma.exam.create({
    data: {
      teacherId,
      title: `finalize learning exam ${suffix}-${Math.random()}`,
      durationMinutes: 60,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  })
  examIds.push(exam.id)

  const question = await prisma.examQuestion.create({
    data: {
      examId: exam.id,
      order: 0,
      marks: 1,
      questionTextSnapshot: `Q ${suffix}-${Math.random()}`,
      optionASnapshot: "A",
      optionBSnapshot: "B",
      optionCSnapshot: "C",
      optionDSnapshot: "D",
      correctOptionSnapshot: opts.correctOption,
    },
  })

  const now = new Date()
  const attempt = await prisma.examAttempt.create({
    data: {
      examId: exam.id,
      studentId,
      attemptNumber: 1,
      startedAt: now,
      deadline: new Date(now.getTime() + 60 * 60_000),
    },
  })
  await prisma.attemptAnswer.create({
    data: {
      attemptId: attempt.id,
      examQuestionId: question.id,
      selectedOption: opts.selectedOption,
      presentationOrder: 0,
      clientUpdatedAt: now,
    },
  })

  return { attempt, examQuestionId: question.id }
}

let teacher: Awaited<ReturnType<typeof makeUser>>
let student: Awaited<ReturnType<typeof makeUser>>

beforeAll(async () => {
  teacher = await makeUser("TEACHER", "finalize-teacher")
  student = await makeUser("STUDENT", "finalize-student")
})

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("finalizeAndGradeAttempt — idempotency", () => {
  it("grades exactly once even when called twice", async () => {
    const attempt = await makeInProgressAttempt(teacher.id, student.id)

    const first = await finalizeAndGradeAttempt(attempt.id, "COMPLETED")
    const second = await finalizeAndGradeAttempt(attempt.id, "COMPLETED")

    expect(first.graded).toBe(true)
    expect(second.graded).toBe(false)

    const results = await prisma.examResult.findMany({
      where: { attemptId: attempt.id },
    })
    expect(results).toHaveLength(1)
    expect(results[0].obtainedMarks).toBe(1)

    const gradedLogs = await prisma.gradingAuditLog.findMany({
      where: { attemptId: attempt.id, action: "GRADED" },
    })
    expect(gradedLogs).toHaveLength(1)
  })

  it("produces exactly one result under concurrent finalize calls", async () => {
    const attempt = await makeInProgressAttempt(teacher.id, student.id)

    const [r1, r2, r3] = await Promise.all([
      finalizeAndGradeAttempt(attempt.id, "COMPLETED"),
      finalizeAndGradeAttempt(attempt.id, "COMPLETED"),
      finalizeAndGradeAttempt(attempt.id, "COMPLETED"),
    ])

    const gradedCount = [r1, r2, r3].filter((r) => r.graded).length
    expect(gradedCount).toBe(1)

    const results = await prisma.examResult.findMany({
      where: { attemptId: attempt.id },
    })
    expect(results).toHaveLength(1)
  })

  it("new results start PROVISIONAL, never visible as published by default", async () => {
    const attempt = await makeInProgressAttempt(teacher.id, student.id)
    await finalizeAndGradeAttempt(attempt.id, "COMPLETED")

    const result = await prisma.examResult.findUniqueOrThrow({
      where: { attemptId: attempt.id },
    })
    expect(result.status).toBe("PROVISIONAL")
    expect(result.publishedAt).toBeNull()
  })
})

describe("finalizeAndGradeAttempt — learning-progress side effects", () => {
  it("creates QuestionProgress once and never double-counts on a repeated grading call", async () => {
    const freshStudent = await makeUser("STUDENT", `finalize-learning-a-${Math.random()}`)
    const { attempt, examQuestionId } = await makeInProgressAttemptWithAnswer(
      teacher.id,
      freshStudent.id,
      { selectedOption: "A", correctOption: "A" }
    )

    await finalizeAndGradeAttempt(attempt.id, "COMPLETED")
    await finalizeAndGradeAttempt(attempt.id, "COMPLETED") // repeated — must no-op

    const progress = await prisma.questionProgress.findUniqueOrThrow({
      where: {
        studentId_examQuestionId: { studentId: freshStudent.id, examQuestionId },
      },
    })
    expect(progress.timesSeen).toBe(1)
    expect(progress.timesCorrect).toBe(1)
    expect(progress.timesIncorrect).toBe(0)
    expect(progress.lastOutcomeCorrect).toBe(true)
    expect(progress.nextReviewAt).toBeNull() // correct — nothing to review

    const xpTotal = await prisma.xPTransaction.aggregate({
      where: { studentId: freshStudent.id },
      _sum: { amount: true },
    })
    // 1 correct answer (10 XP) + perfect-score bonus (50 XP) — awarded once,
    // not twice, despite finalizeAndGradeAttempt being called twice.
    expect(xpTotal._sum.amount).toBe(60)
  })

  it("schedules a next-day review only for an incorrect answer", async () => {
    const freshStudent = await makeUser("STUDENT", `finalize-learning-b-${Math.random()}`)
    const { attempt, examQuestionId } = await makeInProgressAttemptWithAnswer(
      teacher.id,
      freshStudent.id,
      { selectedOption: "B", correctOption: "A" }
    )

    await finalizeAndGradeAttempt(attempt.id, "COMPLETED")

    const progress = await prisma.questionProgress.findUniqueOrThrow({
      where: {
        studentId_examQuestionId: { studentId: freshStudent.id, examQuestionId },
      },
    })
    expect(progress.lastOutcomeCorrect).toBe(false)
    expect(progress.nextReviewAt).not.toBeNull()
    expect(progress.masteryStatus).toBe("LEARNING")
  })

  it("awards the FIRST_EXAM badge on a student's first graded attempt, never again", async () => {
    const freshStudent = await makeUser("STUDENT", `finalize-learning-c-${Math.random()}`)
    const first = await makeInProgressAttemptWithAnswer(teacher.id, freshStudent.id, {
      selectedOption: "A",
      correctOption: "A",
    })
    const second = await makeInProgressAttemptWithAnswer(teacher.id, freshStudent.id, {
      selectedOption: "A",
      correctOption: "A",
    })

    await finalizeAndGradeAttempt(first.attempt.id, "COMPLETED")
    await finalizeAndGradeAttempt(second.attempt.id, "COMPLETED")

    const badges = await prisma.userBadge.findMany({
      where: { studentId: freshStudent.id, badgeKey: "FIRST_EXAM" },
    })
    expect(badges).toHaveLength(1)
  })

  it("awards PERFECT_SCORE only when accuracy is 100%", async () => {
    const perfectStudent = await makeUser("STUDENT", `finalize-learning-d-${Math.random()}`)
    const perfect = await makeInProgressAttemptWithAnswer(teacher.id, perfectStudent.id, {
      selectedOption: "A",
      correctOption: "A",
    })
    await finalizeAndGradeAttempt(perfect.attempt.id, "COMPLETED")

    const imperfectStudent = await makeUser("STUDENT", `finalize-learning-e-${Math.random()}`)
    const imperfect = await makeInProgressAttemptWithAnswer(teacher.id, imperfectStudent.id, {
      selectedOption: "B",
      correctOption: "A",
    })
    await finalizeAndGradeAttempt(imperfect.attempt.id, "COMPLETED")

    const perfectBadges = await prisma.userBadge.findMany({
      where: { studentId: perfectStudent.id, badgeKey: "PERFECT_SCORE" },
    })
    const imperfectBadges = await prisma.userBadge.findMany({
      where: { studentId: imperfectStudent.id, badgeKey: "PERFECT_SCORE" },
    })
    expect(perfectBadges).toHaveLength(1)
    expect(imperfectBadges).toHaveLength(0)
  })
})
