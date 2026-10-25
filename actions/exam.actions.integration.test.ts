import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("@/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { ForbiddenError } from "@/lib/auth/errors"
import {
  createExamAction,
  updateExamAction,
  publishExamAction,
  archiveExamAction,
  deleteExamAction,
} from "./exam.actions"

const mockAuth = vi.mocked(auth)

function asUser(user: { id: string; tokenVersion: number }) {
  mockAuth.mockResolvedValue({
    user: { id: user.id, tokenVersion: user.tokenVersion },
    expires: "",
  } as never)
}

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []

async function makeTeacher(label: string) {
  const user = await prisma.user.create({
    data: {
      name: label,
      email: `${label}-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role: "TEACHER",
      isEmailVerified: true,
    },
  })
  userIds.push(user.id)
  return user
}

let teacherA: Awaited<ReturnType<typeof makeTeacher>>
let teacherB: Awaited<ReturnType<typeof makeTeacher>>

beforeAll(async () => {
  teacherA = await makeTeacher("exam-teacher-a")
  teacherB = await makeTeacher("exam-teacher-b")
})

afterAll(async () => {
  await prisma.exam.deleteMany({ where: { teacherId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

function examFormData(overrides: Record<string, string> = {}) {
  const data = new FormData()
  const base = {
    title: `Midterm ${suffix}`,
    durationMinutes: "60",
    maxAttempts: "1",
    violationReviewThreshold: "5",
    ...overrides,
  }
  for (const [key, value] of Object.entries(base)) data.set(key, value)
  return data
}

async function expectRedirect(promise: Promise<unknown>) {
  try {
    await promise
    throw new Error("expected a NEXT_REDIRECT throw, got a normal return")
  } catch (e) {
    expect((e as { digest?: string }).digest).toMatch(/^NEXT_REDIRECT/)
  }
}

async function createDraftExam(title: string) {
  asUser(teacherA)
  await expectRedirect(createExamAction(undefined, examFormData({ title })))
  return prisma.exam.findFirstOrThrow({ where: { teacherId: teacherA.id, title } })
}

describe("createExamAction", () => {
  it("creates the exam as DRAFT, owned by the caller", async () => {
    const exam = await createDraftExam(`Created ${suffix}`)
    expect(exam.status).toBe("DRAFT")
    expect(exam.teacherId).toBe(teacherA.id)
  })
})

describe("updateExamAction — cross-teacher authorization and DRAFT-only edits", () => {
  it("forbids a different teacher from editing it", async () => {
    const exam = await createDraftExam(`Owned by A ${suffix}`)

    asUser(teacherB)
    await expect(
      updateExamAction(exam.id, undefined, examFormData({ title: "Hijacked" }))
    ).rejects.toThrow(ForbiddenError)
  })

  it("lets the owner edit a draft exam", async () => {
    const exam = await createDraftExam(`Editable ${suffix}`)
    asUser(teacherA)
    const result = await updateExamAction(
      exam.id,
      undefined,
      examFormData({ title: "Edited title" })
    )
    expect(result).toEqual({ success: true })
  })

  it("locks the exam against edits once published", async () => {
    const exam = await createDraftExam(`To publish ${suffix}`)

    // publishing requires at least one question
    const question = await prisma.question.create({
      data: {
        teacherId: teacherA.id,
        status: "ACTIVE",
        subject: "Math",
        topic: "Algebra",
        questionText: `q for publish test ${suffix}`,
        optionA: "1",
        optionB: "2",
        optionC: "3",
        optionD: "4",
        correctOption: "A",
        contentHash: `hash-${suffix}-${Math.random()}`,
      },
    })
    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        questionId: question.id,
        order: 0,
        questionTextSnapshot: question.questionText,
        optionASnapshot: question.optionA,
        optionBSnapshot: question.optionB,
        optionCSnapshot: question.optionC,
        optionDSnapshot: question.optionD,
        correctOptionSnapshot: question.correctOption,
      },
    })

    asUser(teacherA)
    const published = await publishExamAction(exam.id)
    expect(published).toEqual({ success: true })

    const afterPublish = await prisma.exam.findUniqueOrThrow({
      where: { id: exam.id },
    })
    expect(afterPublish.status).toBe("PUBLISHED")

    const editAttempt = await updateExamAction(
      exam.id,
      undefined,
      examFormData({ title: "Should not apply" })
    )
    expect(editAttempt && "error" in editAttempt).toBe(true)

    const unchanged = await prisma.exam.findUniqueOrThrow({
      where: { id: exam.id },
    })
    expect(unchanged.title).not.toBe("Should not apply")

    await prisma.examQuestion.deleteMany({ where: { examId: exam.id } })
    await prisma.question.delete({ where: { id: question.id } })
  })
})

describe("publishExamAction", () => {
  it("refuses to publish an exam with no questions", async () => {
    const exam = await createDraftExam(`Empty exam ${suffix}`)
    asUser(teacherA)
    const result = await publishExamAction(exam.id)
    expect(result && "error" in result).toBe(true)

    const unchanged = await prisma.exam.findUniqueOrThrow({
      where: { id: exam.id },
    })
    expect(unchanged.status).toBe("DRAFT")
  })
})

describe("archiveExamAction / deleteExamAction", () => {
  it("archives a draft exam and then refuses to delete it", async () => {
    const exam = await createDraftExam(`To archive ${suffix}`)
    asUser(teacherA)

    const archived = await archiveExamAction(exam.id)
    expect(archived).toEqual({ success: true })

    const deleteResult = await deleteExamAction(exam.id)
    expect(deleteResult && "error" in deleteResult).toBe(true)

    const stillThere = await prisma.exam.findUnique({ where: { id: exam.id } })
    expect(stillThere).not.toBeNull()
  })

  it("allows deleting a draft exam", async () => {
    const exam = await createDraftExam(`To delete ${suffix}`)
    asUser(teacherA)
    await expectRedirect(deleteExamAction(exam.id))

    const gone = await prisma.exam.findUnique({ where: { id: exam.id } })
    expect(gone).toBeNull()
  })
})
