import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import {
  addQuestionsToExamAction,
  removeQuestionFromExamAction,
  reorderExamQuestionsAction,
} from "./exam-question-actions"
import { publishExamAction } from "./actions"

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

async function makeTeacher(label: string) {
  const user = await prisma.user.create({
    data: {
      name: label,
      email: `${label}-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role: "TEACHER",
      isEmailVerified: true,
      // New teacher accounts default to PENDING (Phase 9) and
      // publishExamAction gates on it — these tests are about question-bank
      // management, not the verification feature, so this fixture is an
      // established, already-trusted teacher persona.
      teacherVerificationStatus: "VERIFIED",
    },
  })
  userIds.push(user.id)
  return user
}

async function makeQuestion(
  teacherId: string,
  status: "DRAFT" | "ACTIVE" | "ARCHIVED" = "ACTIVE",
  text?: string
) {
  return prisma.question.create({
    data: {
      teacherId,
      status,
      subject: "Math",
      topic: "Algebra",
      questionText: text ?? `question ${suffix}-${Math.random()}`,
      optionA: "1",
      optionB: "2",
      optionC: "3",
      optionD: "4",
      correctOption: "A",
      contentHash: `hash-${suffix}-${Math.random()}`,
    },
  })
}

async function makeDraftExam(teacherId: string) {
  const exam = await prisma.exam.create({
    data: { teacherId, title: `exam ${suffix}-${Math.random()}`, durationMinutes: 30 },
  })
  examIds.push(exam.id)
  return exam
}

let teacherA: Awaited<ReturnType<typeof makeTeacher>>
let teacherB: Awaited<ReturnType<typeof makeTeacher>>

beforeAll(async () => {
  teacherA = await makeTeacher("eq-teacher-a")
  teacherB = await makeTeacher("eq-teacher-b")
})

afterAll(async () => {
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.question.deleteMany({ where: { teacherId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("addQuestionsToExamAction", () => {
  it("snapshots the question content, independent of later bank edits", async () => {
    const exam = await makeDraftExam(teacherA.id)
    const question = await makeQuestion(teacherA.id, "ACTIVE", "Original wording")

    asUser(teacherA)
    const result = await addQuestionsToExamAction(exam.id, [question.id])
    expect(result).toEqual({ success: true, added: 1 })

    // edit the bank question after it's been added
    await prisma.question.update({
      where: { id: question.id },
      data: { questionText: "Edited wording", correctOption: "B" },
    })

    const examQuestion = await prisma.examQuestion.findFirstOrThrow({
      where: { examId: exam.id, questionId: question.id },
    })
    expect(examQuestion.questionTextSnapshot).toBe("Original wording")
    expect(examQuestion.correctOptionSnapshot).toBe("A")
  })

  it("never pulls in another teacher's question, even by a direct id", async () => {
    const exam = await makeDraftExam(teacherA.id)
    const othersQuestion = await makeQuestion(teacherB.id, "ACTIVE")

    asUser(teacherA)
    const result = await addQuestionsToExamAction(exam.id, [othersQuestion.id])
    expect(result && "error" in result).toBe(true)

    const count = await prisma.examQuestion.count({ where: { examId: exam.id } })
    expect(count).toBe(0)
  })

  it("refuses a DRAFT or ARCHIVED bank question", async () => {
    const exam = await makeDraftExam(teacherA.id)
    const draftQuestion = await makeQuestion(teacherA.id, "DRAFT")
    const archivedQuestion = await makeQuestion(teacherA.id, "ARCHIVED")

    asUser(teacherA)
    const result = await addQuestionsToExamAction(exam.id, [
      draftQuestion.id,
      archivedQuestion.id,
    ])
    expect(result && "error" in result).toBe(true)
  })

  it("locks the question list once the exam is published", async () => {
    const exam = await makeDraftExam(teacherA.id)
    const question = await makeQuestion(teacherA.id, "ACTIVE")

    asUser(teacherA)
    await addQuestionsToExamAction(exam.id, [question.id])
    await publishExamAction(exam.id)

    const anotherQuestion = await makeQuestion(teacherA.id, "ACTIVE")
    const result = await addQuestionsToExamAction(exam.id, [anotherQuestion.id])
    expect(result && "error" in result).toBe(true)

    const count = await prisma.examQuestion.count({ where: { examId: exam.id } })
    expect(count).toBe(1)
  })
})

describe("reorderExamQuestionsAction", () => {
  it("rejects an order list that doesn't match the exam's actual questions", async () => {
    const exam = await makeDraftExam(teacherA.id)
    const q1 = await makeQuestion(teacherA.id)
    const q2 = await makeQuestion(teacherA.id)

    asUser(teacherA)
    await addQuestionsToExamAction(exam.id, [q1.id, q2.id])

    const result = await reorderExamQuestionsAction(exam.id, [
      "not-a-real-id",
    ])
    expect(result && "error" in result).toBe(true)
  })

  it("applies a valid reorder", async () => {
    const exam = await makeDraftExam(teacherA.id)
    const q1 = await makeQuestion(teacherA.id)
    const q2 = await makeQuestion(teacherA.id)

    asUser(teacherA)
    await addQuestionsToExamAction(exam.id, [q1.id, q2.id])

    const [first, second] = await prisma.examQuestion.findMany({
      where: { examId: exam.id },
      orderBy: { order: "asc" },
    })

    const result = await reorderExamQuestionsAction(exam.id, [
      second.id,
      first.id,
    ])
    expect(result).toEqual({ success: true })

    const reordered = await prisma.examQuestion.findMany({
      where: { examId: exam.id },
      orderBy: { order: "asc" },
    })
    expect(reordered[0].id).toBe(second.id)
    expect(reordered[1].id).toBe(first.id)
  })
})

describe("removeQuestionFromExamAction", () => {
  it("removes the row and closes the order gap", async () => {
    const exam = await makeDraftExam(teacherA.id)
    const q1 = await makeQuestion(teacherA.id)
    const q2 = await makeQuestion(teacherA.id)
    const q3 = await makeQuestion(teacherA.id)

    asUser(teacherA)
    await addQuestionsToExamAction(exam.id, [q1.id, q2.id, q3.id])

    const rows = await prisma.examQuestion.findMany({
      where: { examId: exam.id },
      orderBy: { order: "asc" },
    })

    await removeQuestionFromExamAction(exam.id, rows[1].id) // remove the middle one

    const remaining = await prisma.examQuestion.findMany({
      where: { examId: exam.id },
      orderBy: { order: "asc" },
    })
    expect(remaining).toHaveLength(2)
    expect(remaining.map((r) => r.order)).toEqual([0, 1])
  })
})
