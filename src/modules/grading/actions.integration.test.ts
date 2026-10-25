import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { ForbiddenError } from "@/lib/errors"
import { finalizeAndGradeAttempt } from "@/modules/grading/finalize"
import {
  correctExamQuestionAction,
  updateExamQuestionMarksAction,
  publishExamResultsAction,
  releaseAnswerKeyAction,
} from "./actions"

const mockAuth = vi.mocked(auth)

function asUser(user: { id: string; tokenVersion: number }) {
  mockAuth.mockResolvedValue({
    user: { id: user.id, tokenVersion: user.tokenVersion },
    expires: "",
  } as never)
}

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

async function makePublishedExamWithGradedAttempt(
  teacherId: string,
  studentId: string
) {
  const exam = await prisma.exam.create({
    data: {
      teacherId,
      title: `grading-action exam ${suffix}-${Math.random()}`,
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
      marks: 1,
      correctOptionSnapshot: "A",
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
      selectedOption: "B",
      presentationOrder: 0,
      clientUpdatedAt: now,
    },
  })
  await finalizeAndGradeAttempt(attempt.id, "COMPLETED")

  return { exam, examQuestion, attempt }
}

async function makeDraftExamWithQuestion(teacherId: string) {
  const exam = await prisma.exam.create({
    data: {
      teacherId,
      title: `draft grading exam ${suffix}-${Math.random()}`,
      durationMinutes: 60,
    },
  })
  examIds.push(exam.id)
  const examQuestion = await prisma.examQuestion.create({
    data: {
      examId: exam.id,
      order: 0,
      marks: 1,
      correctOptionSnapshot: "A",
      questionTextSnapshot: `Q ${suffix}`,
      optionASnapshot: "A",
      optionBSnapshot: "B",
      optionCSnapshot: "C",
      optionDSnapshot: "D",
    },
  })
  return { exam, examQuestion }
}

let teacherA: Awaited<ReturnType<typeof makeUser>>
let teacherB: Awaited<ReturnType<typeof makeUser>>
let student: Awaited<ReturnType<typeof makeUser>>

beforeAll(async () => {
  teacherA = await makeUser("TEACHER", "ga-teacher-a")
  teacherB = await makeUser("TEACHER", "ga-teacher-b")
  student = await makeUser("STUDENT", "ga-student")
})

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

function correctionFormData(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

describe("correctExamQuestionAction", () => {
  it("rejects a teacher who doesn't own the exam", async () => {
    const { exam, examQuestion } = await makePublishedExamWithGradedAttempt(
      teacherA.id,
      student.id
    )
    asUser(teacherB)

    await expect(
      correctExamQuestionAction(
        exam.id,
        examQuestion.id,
        undefined,
        correctionFormData({ correctOption: "B", reason: "Hijack attempt" })
      )
    ).rejects.toThrow(ForbiddenError)

    const unchanged = await prisma.examQuestion.findUniqueOrThrow({
      where: { id: examQuestion.id },
    })
    expect(unchanged.correctOptionSnapshot).toBe("A")
  })

  it("rejects a correction on a draft exam", async () => {
    const { exam, examQuestion } = await makeDraftExamWithQuestion(teacherA.id)
    asUser(teacherA)

    const result = await correctExamQuestionAction(
      exam.id,
      examQuestion.id,
      undefined,
      correctionFormData({ correctOption: "B", reason: "Should use normal edit" })
    )
    expect(result && "error" in result).toBe(true)
  })

  it("requires a reason", async () => {
    const { exam, examQuestion } = await makePublishedExamWithGradedAttempt(
      teacherA.id,
      student.id
    )
    asUser(teacherA)

    const result = await correctExamQuestionAction(
      exam.id,
      examQuestion.id,
      undefined,
      correctionFormData({ correctOption: "B", reason: "hi" }) // too short
    )
    expect(result && "error" in result).toBe(true)
  })

  it("applies the correction and regrades affected attempts, owner authorized", async () => {
    const { exam, examQuestion, attempt } = await makePublishedExamWithGradedAttempt(
      teacherA.id,
      student.id
    )
    asUser(teacherA)

    const result = await correctExamQuestionAction(
      exam.id,
      examQuestion.id,
      undefined,
      correctionFormData({
        correctOption: "B",
        reason: "The printed answer key was wrong",
      })
    )
    expect(result).toEqual({ success: true, regradedCount: 1 })

    const graded = await prisma.examResult.findUniqueOrThrow({
      where: { attemptId: attempt.id },
    })
    expect(graded.obtainedMarks).toBe(1)
    expect(graded.correctCount).toBe(1)
  })
})

describe("updateExamQuestionMarksAction", () => {
  it("configures marks and negativeMarks while the exam is a draft", async () => {
    const { exam, examQuestion } = await makeDraftExamWithQuestion(teacherA.id)
    asUser(teacherA)

    const result = await updateExamQuestionMarksAction(
      exam.id,
      examQuestion.id,
      undefined,
      correctionFormData({ marks: "2", negativeMarks: "0.5" })
    )
    expect(result).toEqual({ success: true })

    const updated = await prisma.examQuestion.findUniqueOrThrow({
      where: { id: examQuestion.id },
    })
    expect(updated.marks).toBe(2)
    expect(updated.negativeMarks).toBe(0.5)
  })

  it("refuses to change marks once the exam is published", async () => {
    const { exam, examQuestion } = await makePublishedExamWithGradedAttempt(
      teacherA.id,
      student.id
    )
    asUser(teacherA)

    const result = await updateExamQuestionMarksAction(
      exam.id,
      examQuestion.id,
      undefined,
      correctionFormData({ marks: "5", negativeMarks: "0" })
    )
    expect(result && "error" in result).toBe(true)

    const unchanged = await prisma.examQuestion.findUniqueOrThrow({
      where: { id: examQuestion.id },
    })
    expect(unchanged.marks).toBe(1)
  })
})

describe("publishExamResultsAction", () => {
  it("publishes only this exam's provisional results, not another exam's", async () => {
    const { exam: examOne, attempt: attemptOne } =
      await makePublishedExamWithGradedAttempt(teacherA.id, student.id)
    const { attempt: attemptTwo } = await makePublishedExamWithGradedAttempt(
      teacherA.id,
      student.id
    )

    asUser(teacherA)
    const result = await publishExamResultsAction(examOne.id)
    expect(result).toEqual({ success: true, published: 1 })

    const resultOne = await prisma.examResult.findUniqueOrThrow({
      where: { attemptId: attemptOne.id },
    })
    const resultTwo = await prisma.examResult.findUniqueOrThrow({
      where: { attemptId: attemptTwo.id },
    })
    expect(resultOne.status).toBe("PUBLISHED")
    expect(resultTwo.status).toBe("PROVISIONAL") // untouched — different exam
  })
})

describe("releaseAnswerKeyAction", () => {
  it("is one-way — a second release is rejected", async () => {
    const { exam } = await makePublishedExamWithGradedAttempt(teacherA.id, student.id)
    asUser(teacherA)

    const first = await releaseAnswerKeyAction(exam.id)
    expect(first).toEqual({ success: true })

    const second = await releaseAnswerKeyAction(exam.id)
    expect(second && "error" in second).toBe(true)

    const freshExam = await prisma.exam.findUniqueOrThrow({ where: { id: exam.id } })
    expect(freshExam.answerKeyReleased).toBe(true)
  })
})
