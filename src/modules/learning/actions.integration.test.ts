import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { finalizeAndGradeAttempt } from "@/modules/grading/finalize"
import { toggleBookmarkAction, submitMistakeReviewAction } from "./actions"

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

/** Grades a real attempt so the resulting QuestionProgress row is produced
 * by the actual grading pipeline, not hand-inserted. */
async function makeGradedMistake(
  teacherId: string,
  studentId: string,
  opts: { answerKeyReleased: boolean; correct?: boolean }
) {
  const exam = await prisma.exam.create({
    data: {
      teacherId,
      title: `learning exam ${suffix}-${Math.random()}`,
      durationMinutes: 60,
      status: "PUBLISHED",
      publishedAt: new Date(),
      answerKeyReleased: opts.answerKeyReleased,
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
      selectedOption: opts.correct ? "A" : "B",
      presentationOrder: 0,
      clientUpdatedAt: now,
    },
  })

  await finalizeAndGradeAttempt(attempt.id, "COMPLETED")

  return { exam, examQuestionId: question.id, attempt }
}

let teacher: Awaited<ReturnType<typeof makeUser>>
let studentA: Awaited<ReturnType<typeof makeUser>>
let studentB: Awaited<ReturnType<typeof makeUser>>

beforeAll(async () => {
  teacher = await makeUser("TEACHER", "learning-teacher")
  studentA = await makeUser("STUDENT", "learning-student-a")
  studentB = await makeUser("STUDENT", "learning-student-b")
})

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("toggleBookmarkAction", () => {
  it("rejects bookmarking a question the student never attempted", async () => {
    const { examQuestionId } = await makeGradedMistake(teacher.id, studentA.id, {
      answerKeyReleased: true,
    })
    asUser(studentB) // never attempted this one

    const result = await toggleBookmarkAction({ examQuestionId })
    expect(result && "error" in result).toBe(true)
  })

  it("toggles on, then off, for a question the student did attempt", async () => {
    const { examQuestionId } = await makeGradedMistake(teacher.id, studentA.id, {
      answerKeyReleased: true,
    })
    asUser(studentA)

    const on = await toggleBookmarkAction({ examQuestionId })
    expect(on).toEqual({ success: true, bookmarked: true })

    const row = await prisma.questionBookmark.findUnique({
      where: { studentId_examQuestionId: { studentId: studentA.id, examQuestionId } },
    })
    expect(row).not.toBeNull()

    const off = await toggleBookmarkAction({ examQuestionId })
    expect(off).toEqual({ success: true, bookmarked: false })

    const rowAfter = await prisma.questionBookmark.findUnique({
      where: { studentId_examQuestionId: { studentId: studentA.id, examQuestionId } },
    })
    expect(rowAfter).toBeNull()
  })
})

describe("submitMistakeReviewAction", () => {
  it("rejects a review for a question with no learning-progress row yet", async () => {
    asUser(studentA)
    const result = await submitMistakeReviewAction({
      examQuestionId: "00000000-0000-0000-0000-000000000000",
      selectedOption: "A",
      reviewEventId: crypto.randomUUID(),
    })
    expect(result && "error" in result).toBe(true)
  })

  it("rejects a review while the exam's answer key hasn't been released", async () => {
    const { examQuestionId } = await makeGradedMistake(teacher.id, studentA.id, {
      answerKeyReleased: false,
    })
    asUser(studentA)

    const result = await submitMistakeReviewAction({
      examQuestionId,
      selectedOption: "A",
      reviewEventId: crypto.randomUUID(),
    })
    expect(result && "error" in result).toBe(true)
  })

  it("a correct review updates progress, reveals the answer, and awards XP once", async () => {
    const { examQuestionId } = await makeGradedMistake(teacher.id, studentA.id, {
      answerKeyReleased: true,
    })
    asUser(studentA)
    const reviewEventId = crypto.randomUUID()

    const result = await submitMistakeReviewAction({
      examQuestionId,
      selectedOption: "A",
      reviewEventId,
    })
    expect(result).toMatchObject({ success: true, correct: true, correctOption: "A" })

    const progress = await prisma.questionProgress.findUniqueOrThrow({
      where: { studentId_examQuestionId: { studentId: studentA.id, examQuestionId } },
    })
    expect(progress.lastOutcomeCorrect).toBe(true)
    expect(progress.repetitions).toBe(1)

    const xpRows = await prisma.xPTransaction.findMany({
      where: { studentId: studentA.id, sourceType: "REVIEW", sourceId: reviewEventId },
    })
    expect(xpRows).toHaveLength(1)

    // Retrying the exact same submission (same reviewEventId) must not
    // award XP a second time, even though the review itself re-applies.
    await submitMistakeReviewAction({ examQuestionId, selectedOption: "A", reviewEventId })
    const xpRowsAfterRetry = await prisma.xPTransaction.findMany({
      where: { studentId: studentA.id, sourceType: "REVIEW", sourceId: reviewEventId },
    })
    expect(xpRowsAfterRetry).toHaveLength(1)
  })

  it("an incorrect review never awards XP and keeps the item due for review", async () => {
    const { examQuestionId } = await makeGradedMistake(teacher.id, studentA.id, {
      answerKeyReleased: true,
    })
    asUser(studentA)
    const reviewEventId = crypto.randomUUID()

    const result = await submitMistakeReviewAction({
      examQuestionId,
      selectedOption: "B", // still wrong
      reviewEventId,
    })
    expect(result).toMatchObject({ success: true, correct: false })

    const progress = await prisma.questionProgress.findUniqueOrThrow({
      where: { studentId_examQuestionId: { studentId: studentA.id, examQuestionId } },
    })
    expect(progress.lastOutcomeCorrect).toBe(false)
    expect(progress.nextReviewAt).not.toBeNull()

    const xpRows = await prisma.xPTransaction.findMany({
      where: { studentId: studentA.id, sourceType: "REVIEW", sourceId: reviewEventId },
    })
    expect(xpRows).toHaveLength(0)
  })

  it("awards the MISTAKE_SLAYER_10 badge after 10 corrected reviews", async () => {
    const badgeStudent = await makeUser("STUDENT", `badge-student-${Math.random()}`)
    for (let i = 0; i < 10; i++) {
      const { examQuestionId } = await makeGradedMistake(teacher.id, badgeStudent.id, {
        answerKeyReleased: true,
      })
      asUser(badgeStudent)
      await submitMistakeReviewAction({
        examQuestionId,
        selectedOption: "A",
        reviewEventId: crypto.randomUUID(),
      })
    }

    const badge = await prisma.userBadge.findUnique({
      where: { studentId_badgeKey: { studentId: badgeStudent.id, badgeKey: "MISTAKE_SLAYER_10" } },
    })
    expect(badge).not.toBeNull()
  })
})
