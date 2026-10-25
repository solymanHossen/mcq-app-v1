import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("@/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { ForbiddenError, UnauthorizedError } from "@/lib/auth/errors"
import {
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
  bulkImportQuestionsAction,
} from "./question.actions"

const mockAuth = vi.mocked(auth)

function asUser(user: { id: string; tokenVersion: number }) {
  mockAuth.mockResolvedValue({
    user: { id: user.id, tokenVersion: user.tokenVersion },
    expires: "",
  } as never)
}

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []

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

let teacherA: Awaited<ReturnType<typeof makeUser>>
let teacherB: Awaited<ReturnType<typeof makeUser>>
let student: Awaited<ReturnType<typeof makeUser>>

beforeAll(async () => {
  teacherA = await makeUser("TEACHER", "qa-teacher-a")
  teacherB = await makeUser("TEACHER", "qa-teacher-b")
  student = await makeUser("STUDENT", "qa-student")
})

afterAll(async () => {
  await prisma.question.deleteMany({ where: { teacherId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

function questionFormData(overrides: Record<string, string> = {}) {
  const data = new FormData()
  const base = {
    subject: "Math",
    topic: "Algebra",
    difficulty: "MEDIUM",
    questionText: `What is 2 + 2? (${suffix})`,
    optionA: "3",
    optionB: "4",
    optionC: "5",
    optionD: "6",
    correctOption: "B",
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

describe("createQuestionAction — permissions", () => {
  it("rejects an unauthenticated caller", async () => {
    mockAuth.mockResolvedValue(null)
    await expect(
      createQuestionAction(undefined, questionFormData())
    ).rejects.toThrow(UnauthorizedError)
  })

  it("rejects a STUDENT", async () => {
    asUser(student)
    await expect(
      createQuestionAction(undefined, questionFormData())
    ).rejects.toThrow(ForbiddenError)
  })

  it("lets a TEACHER create a question, owned by them, as DRAFT", async () => {
    asUser(teacherA)
    await expectRedirect(createQuestionAction(undefined, questionFormData()))

    const created = await prisma.question.findFirstOrThrow({
      where: { teacherId: teacherA.id },
      orderBy: { createdAt: "desc" },
    })
    expect(created.status).toBe("DRAFT")
    expect(created.teacherId).toBe(teacherA.id)
  })
})

describe("createQuestionAction — duplicate detection", () => {
  it("warns instead of creating a second identical question", async () => {
    asUser(teacherA)
    const data = questionFormData({ questionText: `Unique dup test ${suffix}` })
    await expectRedirect(createQuestionAction(undefined, data))

    const beforeCount = await prisma.question.count({
      where: { teacherId: teacherA.id },
    })

    const result = await createQuestionAction(
      undefined,
      questionFormData({ questionText: `Unique dup test ${suffix}` })
    )
    expect(result && "duplicateWarning" in result).toBe(true)

    const afterCount = await prisma.question.count({
      where: { teacherId: teacherA.id },
    })
    expect(afterCount).toBe(beforeCount)
  })

  it("creates it anyway once the duplicate is confirmed", async () => {
    asUser(teacherA)
    const text = `Confirmed dup test ${suffix}`
    await expectRedirect(
      createQuestionAction(undefined, questionFormData({ questionText: text }))
    )

    const beforeCount = await prisma.question.count({
      where: { teacherId: teacherA.id },
    })

    await expectRedirect(
      createQuestionAction(
        undefined,
        questionFormData({ questionText: text, confirmDuplicate: "true" })
      )
    )

    const afterCount = await prisma.question.count({
      where: { teacherId: teacherA.id },
    })
    expect(afterCount).toBe(beforeCount + 1)
  })
})

describe("updateQuestionAction — cross-teacher authorization", () => {
  it("forbids a different teacher from editing it", async () => {
    asUser(teacherA)
    await expectRedirect(
      createQuestionAction(
        undefined,
        questionFormData({ questionText: `Owned by A ${suffix}` })
      )
    )
    const question = await prisma.question.findFirstOrThrow({
      where: { teacherId: teacherA.id, questionText: `Owned by A ${suffix}` },
    })

    asUser(teacherB)
    await expect(
      updateQuestionAction(
        question.id,
        undefined,
        questionFormData({ questionText: "Hijacked" })
      )
    ).rejects.toThrow(ForbiddenError)

    const unchanged = await prisma.question.findUniqueOrThrow({
      where: { id: question.id },
    })
    expect(unchanged.questionText).toBe(`Owned by A ${suffix}`)
  })

  it("lets the owner edit it", async () => {
    asUser(teacherA)
    await expectRedirect(
      createQuestionAction(
        undefined,
        questionFormData({ questionText: `Editable by A ${suffix}` })
      )
    )
    const question = await prisma.question.findFirstOrThrow({
      where: { teacherId: teacherA.id, questionText: `Editable by A ${suffix}` },
    })

    const result = await updateQuestionAction(
      question.id,
      undefined,
      questionFormData({ questionText: "Edited text" })
    )
    expect(result).toEqual({ success: true })

    const updated = await prisma.question.findUniqueOrThrow({
      where: { id: question.id },
    })
    expect(updated.questionText).toBe("Edited text")
  })
})

describe("deleteQuestionAction — exam-usage guard", () => {
  it("blocks deletion while the question is used in an exam", async () => {
    asUser(teacherA)
    await expectRedirect(
      createQuestionAction(
        undefined,
        questionFormData({ questionText: `In an exam ${suffix}` })
      )
    )
    const question = await prisma.question.findFirstOrThrow({
      where: { teacherId: teacherA.id, questionText: `In an exam ${suffix}` },
    })
    await prisma.question.update({
      where: { id: question.id },
      data: { status: "ACTIVE" },
    })

    const exam = await prisma.exam.create({
      data: { teacherId: teacherA.id, title: "Holder exam", durationMinutes: 30 },
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

    const result = await deleteQuestionAction(question.id)
    expect(result && "error" in result).toBe(true)

    const stillThere = await prisma.question.findUnique({
      where: { id: question.id },
    })
    expect(stillThere).not.toBeNull()

    await prisma.exam.delete({ where: { id: exam.id } })
  })
})

describe("bulkImportQuestionsAction", () => {
  it("imports valid rows and reports invalid and duplicate ones", async () => {
    asUser(teacherA)

    // seed one existing question that a CSV row will duplicate
    await expectRedirect(
      createQuestionAction(
        undefined,
        questionFormData({ questionText: `Existing bank row ${suffix}` })
      )
    )

    const csv = [
      "subject,topic,difficulty,questionText,optionA,optionB,optionC,optionD,correctOption,explanation,codeSnippet,codeLanguage,imageUrl",
      `Math,Algebra,EASY,Valid row ${suffix},1,2,3,4,A,,,,`,
      `Math,Algebra,EASY,Existing bank row ${suffix},3,4,5,6,B,,,,`, // dup of existing bank question
      `Math,Algebra,EASY,Valid row ${suffix},1,2,3,4,A,,,,`, // dup within the same file
      `Math,Algebra,NOT_A_DIFFICULTY,Broken row ${suffix},1,2,3,4,A,,,,`, // invalid difficulty
    ].join("\n")

    const formData = new FormData()
    formData.set("file", new File([csv], "questions.csv", { type: "text/csv" }))

    const result = await bulkImportQuestionsAction(undefined, formData)
    if (!("totalRows" in result)) throw new Error("expected a summary")

    expect(result.totalRows).toBe(4)
    expect(result.imported).toBe(1)
    expect(result.skippedDuplicates).toBe(1)
    expect(result.invalidRows).toHaveLength(2)

    const imported = await prisma.question.findFirst({
      where: { teacherId: teacherA.id, questionText: `Valid row ${suffix}` },
    })
    expect(imported).not.toBeNull()
  })
})
