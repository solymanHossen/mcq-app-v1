import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { finalizeAndGradeAttempt } from "./finalize"
import { applyCorrectionAndRegrade } from "./regrade"
import { getResultForStudent } from "./queries"

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

async function makeGradedAttempt(
  teacherId: string,
  studentId: string,
  question: { marks: number; negativeMarks?: number; correctOption: "A" | "B" | "C" | "D" },
  selectedOption: "A" | "B" | "C" | "D" | null
) {
  const exam = await prisma.exam.create({
    data: {
      teacherId,
      title: `regrade exam ${suffix}-${Math.random()}`,
      durationMinutes: 60,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  })
  examIds.push(exam.id)

  const examQuestion = await prisma.examQuestion.create({
    data: {
      examId: exam.id,
      order: 0,
      marks: question.marks,
      negativeMarks: question.negativeMarks ?? 0,
      correctOptionSnapshot: question.correctOption,
      questionTextSnapshot: `Q ${suffix}`,
      optionASnapshot: "A",
      optionBSnapshot: "B",
      optionCSnapshot: "C",
      optionDSnapshot: "D",
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
      examQuestionId: examQuestion.id,
      selectedOption,
      presentationOrder: 0,
      clientUpdatedAt: now,
    },
  })

  await finalizeAndGradeAttempt(attempt.id, "COMPLETED")

  return { exam, examQuestion, attempt }
}

let teacherA: Awaited<ReturnType<typeof makeUser>>
let studentA: Awaited<ReturnType<typeof makeUser>>
let studentB: Awaited<ReturnType<typeof makeUser>>

beforeAll(async () => {
  teacherA = await makeUser("TEACHER", "regrade-teacher-a")
  studentA = await makeUser("STUDENT", "regrade-student-a")
  studentB = await makeUser("STUDENT", "regrade-student-b")
})

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("applyCorrectionAndRegrade — answer-key correction", () => {
  it("regrades an attempt whose score changes, and audits previous/new score", async () => {
    // Originally keyed to A; student picked B, so originally incorrect.
    const { exam, examQuestion, attempt } = await makeGradedAttempt(
      teacherA.id,
      studentA.id,
      { marks: 2, negativeMarks: 0.5, correctOption: "A" },
      "B"
    )
    const before = await prisma.examResult.findUniqueOrThrow({
      where: { attemptId: attempt.id },
    })
    expect(before.obtainedMarks).toBe(-0.5)
    expect(before.incorrectCount).toBe(1)

    const { regradedCount } = await applyCorrectionAndRegrade({
      examId: exam.id,
      examQuestionId: examQuestion.id,
      correction: { correctOption: "B" }, // the key was actually B all along
      reason: "Official answer key had a typo",
      actorId: teacherA.id,
    })

    expect(regradedCount).toBe(1)

    const after = await prisma.examResult.findUniqueOrThrow({
      where: { attemptId: attempt.id },
    })
    expect(after.obtainedMarks).toBe(2)
    expect(after.correctCount).toBe(1)
    expect(after.incorrectCount).toBe(0)
    expect(after.gradingVersion).toBe(before.gradingVersion + 1)

    // REGRADED entries are attempt-scoped (one per affected attempt)...
    const regradeLog = await prisma.gradingAuditLog.findFirstOrThrow({
      where: { attemptId: attempt.id, action: "REGRADED" },
    })
    expect(regradeLog.previousScore).toBe(-0.5)
    expect(regradeLog.newScore).toBe(2)
    expect(regradeLog.reason).toBe("Official answer key had a typo")

    // ...but QUESTION_CORRECTED is exam/question-scoped, not attempt-scoped —
    // one correction can regrade many attempts, so it isn't tied to just one.
    const correctionLog = await prisma.gradingAuditLog.findFirstOrThrow({
      where: { examQuestionId: examQuestion.id, action: "QUESTION_CORRECTED" },
    })
    expect(correctionLog.actorId).toBe(teacherA.id)
    expect(correctionLog.attemptId).toBeNull()
  })

  it("skips (and doesn't audit) an attempt whose score is unaffected by the correction", async () => {
    // Student already got it right under the old key, and the new key is
    // the same option they picked — nothing actually changes for them.
    const { exam, examQuestion, attempt } = await makeGradedAttempt(
      teacherA.id,
      studentA.id,
      { marks: 1, correctOption: "A" },
      "A"
    )

    const { regradedCount } = await applyCorrectionAndRegrade({
      examId: exam.id,
      examQuestionId: examQuestion.id,
      correction: { correctOption: "A" }, // "corrected" to the same answer
      reason: "Re-confirmed the key",
      actorId: teacherA.id,
    })

    expect(regradedCount).toBe(0)
    const regradeLogs = await prisma.gradingAuditLog.findMany({
      where: { attemptId: attempt.id, action: "REGRADED" },
    })
    expect(regradeLogs).toHaveLength(0)
  })

  it("cancelling a question gives every attempt full credit for it", async () => {
    const { exam, examQuestion, attempt: wrongAttempt } = await makeGradedAttempt(
      teacherA.id,
      studentA.id,
      { marks: 3, negativeMarks: 1, correctOption: "A" },
      "C" // wrong
    )

    const before = await prisma.examResult.findUniqueOrThrow({
      where: { attemptId: wrongAttempt.id },
    })
    expect(before.obtainedMarks).toBe(-1)

    await applyCorrectionAndRegrade({
      examId: exam.id,
      examQuestionId: examQuestion.id,
      correction: { isCancelled: true },
      reason: "Question had no correct option",
      actorId: teacherA.id,
    })

    const after = await prisma.examResult.findUniqueOrThrow({
      where: { attemptId: wrongAttempt.id },
    })
    expect(after.obtainedMarks).toBe(3) // full marks despite the wrong pick
    expect(after.cancelledCount).toBe(1)
    expect(after.incorrectCount).toBe(0)
  })

  it("future (not-yet-submitted) attempts pick up the correction automatically", async () => {
    const { exam, examQuestion } = await makeGradedAttempt(
      teacherA.id,
      studentA.id,
      { marks: 1, correctOption: "A" },
      "A"
    )
    await applyCorrectionAndRegrade({
      examId: exam.id,
      examQuestionId: examQuestion.id,
      correction: { correctOption: "B" },
      reason: "Key correction before a second student takes it",
      actorId: teacherA.id,
    })

    // studentB takes the (already-corrected) exam fresh
    const now = new Date()
    const newAttempt = await prisma.examAttempt.create({
      data: {
        examId: exam.id,
        studentId: studentB.id,
        attemptNumber: 1,
        startedAt: now,
        deadline: new Date(now.getTime() + 60 * 60_000),
      },
    })
    await prisma.attemptAnswer.create({
      data: {
        attemptId: newAttempt.id,
        examQuestionId: examQuestion.id,
        selectedOption: "B",
        presentationOrder: 0,
        clientUpdatedAt: now,
      },
    })
    await finalizeAndGradeAttempt(newAttempt.id, "COMPLETED")

    const result = await prisma.examResult.findUniqueOrThrow({
      where: { attemptId: newAttempt.id },
    })
    expect(result.correctCount).toBe(1)
    expect(result.obtainedMarks).toBe(1)
  })

  it("is safe under two corrections racing on the same exam", async () => {
    const { exam, examQuestion } = await makeGradedAttempt(
      teacherA.id,
      studentA.id,
      { marks: 1, correctOption: "A" },
      "B"
    )

    // Two different "corrections" land close together — both should fully
    // apply without a lost-update, ending on the gradingVersion incremented
    // exactly as many times as a change actually occurred.
    await Promise.all([
      applyCorrectionAndRegrade({
        examId: exam.id,
        examQuestionId: examQuestion.id,
        correction: { correctOption: "B" },
        reason: "race 1",
        actorId: teacherA.id,
      }),
      applyCorrectionAndRegrade({
        examId: exam.id,
        examQuestionId: examQuestion.id,
        correction: { correctOption: "B" },
        reason: "race 2",
        actorId: teacherA.id,
      }),
    ])

    const result = await prisma.examResult.findFirstOrThrow({
      where: { attempt: { examId: exam.id } },
    })
    expect(result.correctCount).toBe(1)
    expect(result.obtainedMarks).toBe(1)
  })
})

describe("answer-key disclosure", () => {
  it("never reveals per-question correct answers until the exam's answer key is released", async () => {
    const { exam, attempt } = await makeGradedAttempt(
      teacherA.id,
      studentA.id,
      { marks: 1, correctOption: "A" },
      "A"
    )

    // publish the result itself — score should be visible...
    await prisma.examResult.update({
      where: { attemptId: attempt.id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    })

    const beforeRelease = await getResultForStudent(attempt.id)
    expect(beforeRelease?.result?.status).toBe("PUBLISHED")
    // ...but the answer key must still be withheld, independent of the
    // result being published.
    expect(beforeRelease?.questions).toBeNull()
    expect(JSON.stringify(beforeRelease)).not.toMatch(/correctOption/i)

    await prisma.exam.update({
      where: { id: exam.id },
      data: { answerKeyReleased: true, answerKeyReleasedAt: new Date() },
    })

    const afterRelease = await getResultForStudent(attempt.id)
    expect(afterRelease?.questions).not.toBeNull()
    expect(afterRelease?.questions?.[0].correctOption).toBe("A")
  })
})
