import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { getOrGenerateExplanation, AI_DAILY_EXPLANATION_LIMIT } from "./explain"

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []
const examIds: string[] = []

async function makeStudent(label: string) {
  const user = await prisma.user.create({
    data: {
      name: label,
      email: `${label}-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role: "STUDENT",
      isEmailVerified: true,
    },
  })
  userIds.push(user.id)
  return user
}

let sharedExamId: string

function makeExamQuestion() {
  return prisma.examQuestion.create({
    data: {
      examId: sharedExamId,
      order: 0,
      questionTextSnapshot: `Why is 2+2=4? ${suffix}-${Math.random()}`,
      optionASnapshot: "3",
      optionBSnapshot: "4",
      optionCSnapshot: "5",
      optionDSnapshot: "6",
      correctOptionSnapshot: "B",
    },
  })
}

beforeAll(async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key-for-integration-tests")

  const teacher = await prisma.user.create({
    data: {
      name: "ai-teacher",
      email: `ai-teacher-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role: "TEACHER",
      isEmailVerified: true,
    },
  })
  userIds.push(teacher.id)

  const exam = await prisma.exam.create({
    data: {
      teacherId: teacher.id,
      title: `ai exam ${suffix}`,
      durationMinutes: 60,
      status: "PUBLISHED",
      publishedAt: new Date(),
      answerKeyReleased: true,
    },
  })
  examIds.push(exam.id)
  sharedExamId = exam.id
})

afterAll(async () => {
  vi.unstubAllEnvs()
  await prisma.aIExplanationRequest.deleteMany({ where: { studentId: { in: userIds } } })
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("getOrGenerateExplanation", () => {
  it("calls the provider once, caches the result, and never calls it again for the same question", async () => {
    const student = await makeStudent(`ai-cache-${Math.random()}`)
    const examQuestion = await makeExamQuestion()
    const provider = vi.fn().mockResolvedValue({ content: "Because addition of 2 and 2 equals 4." })

    const first = await getOrGenerateExplanation(examQuestion.id, student.id, { provider })
    expect(first).toMatchObject({ cached: false })
    expect(provider).toHaveBeenCalledTimes(1)

    const otherStudent = await makeStudent(`ai-cache-b-${Math.random()}`)
    const second = await getOrGenerateExplanation(examQuestion.id, otherStudent.id, { provider })
    expect(second).toMatchObject({ cached: true })
    expect(provider).toHaveBeenCalledTimes(1) // still just once — the cache served student B
  })

  it("rejects and does not cache an invalid (too-short) provider response", async () => {
    const student = await makeStudent(`ai-invalid-${Math.random()}`)
    const examQuestion = await makeExamQuestion()
    const provider = vi.fn().mockResolvedValue({ content: "too short" })

    const result = await getOrGenerateExplanation(examQuestion.id, student.id, { provider })
    expect(result).toHaveProperty("error")

    const cached = await prisma.aIExplanation.findUnique({ where: { examQuestionId: examQuestion.id } })
    expect(cached).toBeNull()
  })

  it("handles a provider failure gracefully without throwing", async () => {
    const student = await makeStudent(`ai-fail-${Math.random()}`)
    const examQuestion = await makeExamQuestion()
    const provider = vi.fn().mockResolvedValue({ error: "simulated provider outage" })

    const result = await getOrGenerateExplanation(examQuestion.id, student.id, { provider })
    expect(result).toEqual({ error: "simulated provider outage" })
  })

  it("enforces the daily per-student generation limit (cache misses only)", async () => {
    const student = await makeStudent(`ai-limit-${Math.random()}`)
    const provider = vi.fn().mockResolvedValue({ content: "A sufficiently long explanation text." })

    // Each call targets a DIFFERENT question, so every one is a cache miss
    // and counts against the daily limit.
    for (let i = 0; i < AI_DAILY_EXPLANATION_LIMIT; i++) {
      const q = await makeExamQuestion()
      const result = await getOrGenerateExplanation(q.id, student.id, { provider })
      expect(result).not.toHaveProperty("error")
    }

    const overLimitQuestion = await makeExamQuestion()
    const blocked = await getOrGenerateExplanation(overLimitQuestion.id, student.id, { provider })
    expect(blocked).toHaveProperty("error")
    expect(provider).toHaveBeenCalledTimes(AI_DAILY_EXPLANATION_LIMIT) // the blocked call never reached the provider
  }, 15_000)

  it("is disabled when no provider API key is configured", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "")
    const student = await makeStudent(`ai-disabled-${Math.random()}`)
    const examQuestion = await makeExamQuestion()
    const provider = vi.fn()

    const result = await getOrGenerateExplanation(examQuestion.id, student.id, { provider })
    expect(result).toHaveProperty("error")
    expect(provider).not.toHaveBeenCalled()

    vi.stubEnv("ANTHROPIC_API_KEY", "test-key-for-integration-tests")
  })
})
