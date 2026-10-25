import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("@/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import {
  startAttemptAction,
  saveAnswerAction,
  submitAttemptAction,
} from "./attempt.actions"
import { getAttemptForStudent } from "@/lib/attempts/queries"
import { sweepExpiredAttempts } from "@/lib/attempts/expire"
import { SESSION_CONFLICT_WINDOW_MS } from "@/lib/anti-cheat/engine"

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

async function makePublishedExam(
  teacherId: string,
  opts: {
    maxAttempts?: number
    durationMinutes?: number
    questionCount?: number
    webcamMonitoringRequired?: boolean
  } = {}
) {
  const exam = await prisma.exam.create({
    data: {
      teacherId,
      title: `exam ${suffix}-${Math.random()}`,
      durationMinutes: opts.durationMinutes ?? 60,
      maxAttempts: opts.maxAttempts ?? 1,
      status: "PUBLISHED",
      publishedAt: new Date(),
      webcamMonitoringRequired: opts.webcamMonitoringRequired ?? false,
    },
  })
  examIds.push(exam.id)

  const questionCount = opts.questionCount ?? 2
  for (let i = 0; i < questionCount; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        order: i,
        questionTextSnapshot: `Question ${i} ${suffix}`,
        optionASnapshot: "1",
        optionBSnapshot: "2",
        optionCSnapshot: "3",
        optionDSnapshot: "4",
        correctOptionSnapshot: "A",
        explanationSnapshot: "Because 1 is correct",
      },
    })
  }

  return prisma.exam.findUniqueOrThrow({
    where: { id: exam.id },
    include: { examQuestions: { orderBy: { order: "asc" } } },
  })
}

let teacher: Awaited<ReturnType<typeof makeUser>>
let studentA: Awaited<ReturnType<typeof makeUser>>
let studentB: Awaited<ReturnType<typeof makeUser>>

beforeAll(async () => {
  teacher = await makeUser("TEACHER", "attempt-teacher")
  studentA = await makeUser("STUDENT", "attempt-student-a")
  studentB = await makeUser("STUDENT", "attempt-student-b")
})

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("startAttemptAction", () => {
  it("resumes an existing in-progress attempt instead of creating a duplicate", async () => {
    const exam = await makePublishedExam(teacher.id, { maxAttempts: 3 })
    asUser(studentA)

    const first = await startAttemptAction(exam.id)
    const second = await startAttemptAction(exam.id)

    expect("attemptId" in first && first.attemptId).toBeTruthy()
    expect("attemptId" in second && second.attemptId).toBe(
      "attemptId" in first ? first.attemptId : undefined
    )

    const count = await prisma.examAttempt.count({
      where: { studentId: studentA.id, examId: exam.id },
    })
    expect(count).toBe(1)
  })

  it("never creates more than one attempt under concurrent start requests", async () => {
    const exam = await makePublishedExam(teacher.id, { maxAttempts: 1 })
    asUser(studentA)

    const [r1, r2] = await Promise.all([
      startAttemptAction(exam.id),
      startAttemptAction(exam.id),
    ])

    expect("attemptId" in r1 || "attemptId" in r2).toBe(true)

    const attempts = await prisma.examAttempt.findMany({
      where: { studentId: studentA.id, examId: exam.id },
    })
    expect(attempts).toHaveLength(1)
    expect(attempts[0].attemptNumber).toBe(1)
  })

  it("refuses a new attempt once maxAttempts is used up", async () => {
    const exam = await makePublishedExam(teacher.id, { maxAttempts: 1 })
    asUser(studentA)

    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")
    await submitAttemptAction(started.attemptId)

    const blocked = await startAttemptAction(exam.id)
    expect("error" in blocked).toBe(true)

    const count = await prisma.examAttempt.count({
      where: { studentId: studentA.id, examId: exam.id },
    })
    expect(count).toBe(1)
  })
})

describe("saveAnswerAction — ownership and snapshot scoping", () => {
  it("rejects a different student saving onto someone else's attempt", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")

    asUser(studentB)
    const result = await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId: exam.examQuestions[0].id,
      selectedOption: "B",
      clientUpdatedAt: new Date().toISOString(),
      sessionToken: "test-session",
    })
    expect(result && "error" in result).toBe(true)

    const row = await prisma.attemptAnswer.findUnique({
      where: {
        attemptId_examQuestionId: {
          attemptId: started.attemptId,
          examQuestionId: exam.examQuestions[0].id,
        },
      },
    })
    expect(row?.selectedOption).toBeNull()
  })

  it("rejects an examQuestionId that isn't part of this attempt's snapshot", async () => {
    const examA = await makePublishedExam(teacher.id)
    const examB = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(examA.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")

    const result = await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId: examB.examQuestions[0].id, // belongs to a different exam
      selectedOption: "A",
      clientUpdatedAt: new Date().toISOString(),
      sessionToken: "test-session",
    })
    expect(result && "error" in result).toBe(true)
  })
})

describe("saveAnswerAction — idempotency and conflict resolution", () => {
  it("is a safe no-op when the identical save is retried", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")
    const examQuestionId = exam.examQuestions[0].id
    const clientUpdatedAt = new Date().toISOString()

    const first = await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId,
      selectedOption: "C",
      clientUpdatedAt,
      sessionToken: "test-session",
    })
    expect(first).toEqual({ success: true, applied: true })

    // exact retry — same payload, same timestamp
    const retry = await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId,
      selectedOption: "C",
      clientUpdatedAt,
      sessionToken: "test-session",
    })
    expect(retry).toEqual({ success: true, applied: false })

    const row = await prisma.attemptAnswer.findUniqueOrThrow({
      where: { attemptId_examQuestionId: { attemptId: started.attemptId, examQuestionId } },
    })
    expect(row.selectedOption).toBe("C")
  })

  it("keeps the newer edit even when the older one arrives second", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")
    const examQuestionId = exam.examQuestions[0].id

    const earlier = new Date(Date.now() - 5000).toISOString()
    const later = new Date().toISOString()

    // the "newer" click is saved first (e.g. its network request was faster)
    await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId,
      selectedOption: "D",
      clientUpdatedAt: later,
      sessionToken: "test-session",
    })

    // the "older" click's request arrives after, out of order
    const staleResult = await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId,
      selectedOption: "A",
      clientUpdatedAt: earlier,
      sessionToken: "test-session",
    })
    expect(staleResult).toEqual({ success: true, applied: false })

    const row = await prisma.attemptAnswer.findUniqueOrThrow({
      where: { attemptId_examQuestionId: { attemptId: started.attemptId, examQuestionId } },
    })
    expect(row.selectedOption).toBe("D") // the newer edit, not the stale one
  })
})

describe("expired attempts", () => {
  async function backdateDeadline(attemptId: string) {
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { deadline: new Date(Date.now() - 60_000) },
    })
  }

  it("rejects an answer save on an expired attempt and flips it to TIMEOUT", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")
    await backdateDeadline(started.attemptId)

    const result = await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId: exam.examQuestions[0].id,
      selectedOption: "A",
      clientUpdatedAt: new Date().toISOString(),
      sessionToken: "test-session",
    })
    expect(result && "error" in result).toBe(true)

    const attempt = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: started.attemptId },
    })
    expect(attempt.status).toBe("TIMEOUT")
  })

  it("records a late submit as TIMEOUT, not COMPLETED", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")
    await backdateDeadline(started.attemptId)

    const result = await submitAttemptAction(started.attemptId)
    expect(result).toMatchObject({ success: true, status: "TIMEOUT" })
  })

  it("sweepExpiredAttempts finalizes a backdated attempt directly", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")
    await backdateDeadline(started.attemptId)

    const { expired } = await sweepExpiredAttempts()
    expect(expired).toBeGreaterThanOrEqual(1)

    const attempt = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: started.attemptId },
    })
    expect(attempt.status).toBe("TIMEOUT")
  })
})

describe("submitAttemptAction — duplicate submission", () => {
  it("only transitions once under concurrent submits", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")

    const [r1, r2] = await Promise.all([
      submitAttemptAction(started.attemptId),
      submitAttemptAction(started.attemptId),
    ])

    expect(r1.success && r2.success).toBe(true)
    expect([r1, r2].some((r) => "alreadySubmitted" in r && r.alreadySubmitted)).toBe(
      true
    )

    const attempt = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: started.attemptId },
    })
    expect(attempt.status).toBe("COMPLETED")
    expect(attempt.submittedAt).not.toBeNull()
  })

  it("prevents further answer changes after submission", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")

    await submitAttemptAction(started.attemptId)

    const result = await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId: exam.examQuestions[0].id,
      selectedOption: "B",
      clientUpdatedAt: new Date().toISOString(),
      sessionToken: "test-session",
    })
    expect(result && "error" in result).toBe(true)

    const row = await prisma.attemptAnswer.findUniqueOrThrow({
      where: {
        attemptId_examQuestionId: {
          attemptId: started.attemptId,
          examQuestionId: exam.examQuestions[0].id,
        },
      },
    })
    expect(row.selectedOption).toBeNull()
  })
})

describe("getAttemptForStudent — never leaks correct answers", () => {
  it("excludes correctOptionSnapshot and explanationSnapshot entirely", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")

    const attempt = await getAttemptForStudent(started.attemptId)
    const serialized = JSON.stringify(attempt)

    expect(serialized).not.toMatch(/correctOption/i)
    expect(serialized).not.toMatch(/explanation/i)
    expect(serialized).not.toContain("Because 1 is correct")
  })
})

describe("startAttemptAction — webcam consent gating", () => {
  it("refuses to start a webcam-monitored exam without explicit consent", async () => {
    const exam = await makePublishedExam(teacher.id, { webcamMonitoringRequired: true })
    asUser(studentA)

    const result = await startAttemptAction(exam.id)
    expect("error" in result).toBe(true)

    const count = await prisma.examAttempt.count({
      where: { studentId: studentA.id, examId: exam.id },
    })
    expect(count).toBe(0)
  })

  it("starts and records the consent timestamp once consent is given", async () => {
    const exam = await makePublishedExam(teacher.id, { webcamMonitoringRequired: true })
    asUser(studentA)

    const result = await startAttemptAction(exam.id, { webcamConsent: true })
    if (!("attemptId" in result)) throw new Error("expected an attemptId")

    const attempt = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: result.attemptId },
    })
    expect(attempt.webcamConsentGivenAt).not.toBeNull()
  })

  it("does not require consent for an exam with no webcam monitoring", async () => {
    const exam = await makePublishedExam(teacher.id, { webcamMonitoringRequired: false })
    asUser(studentA)

    const result = await startAttemptAction(exam.id)
    expect("attemptId" in result).toBe(true)
  })
})

describe("saveAnswerAction — session-conflict detection", () => {
  it("logs a SESSION_CONFLICT when a second session token appears within the window", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")
    const examQuestionId = exam.examQuestions[0].id

    await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId,
      selectedOption: "A",
      clientUpdatedAt: new Date().toISOString(),
      sessionToken: "tab-1",
    })

    // A different token shows up almost immediately — still well within
    // SESSION_CONFLICT_WINDOW_MS, so this looks like two simultaneous tabs.
    await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId,
      selectedOption: "B",
      clientUpdatedAt: new Date().toISOString(),
      sessionToken: "tab-2",
    })

    const events = await prisma.violationEvent.findMany({
      where: { attemptId: started.attemptId, type: "SESSION_CONFLICT" },
    })
    expect(events).toHaveLength(1)
    expect(events[0].source).toBe("SERVER_DETECTED")

    const attempt = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: started.attemptId },
    })
    expect(attempt.activeSessionToken).toBe("tab-2") // still saved, not blocked
  })

  it("treats a token handoff after the window as a silent resume, not a conflict", async () => {
    const exam = await makePublishedExam(teacher.id)
    asUser(studentA)
    const started = await startAttemptAction(exam.id)
    if (!("attemptId" in started)) throw new Error("expected an attemptId")
    const examQuestionId = exam.examQuestions[0].id

    await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId,
      selectedOption: "A",
      clientUpdatedAt: new Date().toISOString(),
      sessionToken: "tab-1",
    })

    // Simulate the first tab having gone quiet well past the window (e.g. a
    // reload or a resumed session on a new tab), not a live second tab.
    await prisma.examAttempt.update({
      where: { id: started.attemptId },
      data: {
        activeSessionTokenAt: new Date(Date.now() - SESSION_CONFLICT_WINDOW_MS - 5_000),
      },
    })

    await saveAnswerAction({
      attemptId: started.attemptId,
      examQuestionId,
      selectedOption: "B",
      clientUpdatedAt: new Date().toISOString(),
      sessionToken: "tab-2",
    })

    const events = await prisma.violationEvent.findMany({
      where: { attemptId: started.attemptId, type: "SESSION_CONFLICT" },
    })
    expect(events).toHaveLength(0)
  })
})
