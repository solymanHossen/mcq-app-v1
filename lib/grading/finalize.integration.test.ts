import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
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
