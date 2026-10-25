import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { finalizeAndGradeAttempt } from "@/lib/grading/finalize"
import { getSubjectTopicPerformance, getOverallStats, getWeakestTopics } from "./engine"

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []
const examIds: string[] = []
const questionIds: string[] = []

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

let teacher: Awaited<ReturnType<typeof makeUser>>
let student: Awaited<ReturnType<typeof makeUser>>

/** Creates and grades one attempt with a single bank-backed question so the
 * answer is attributable to a subject/topic. */
async function answerOneQuestion(opts: {
  subject: string
  topic: string
  correct: boolean
}) {
  const question = await prisma.question.create({
    data: {
      teacherId: teacher.id,
      status: "ACTIVE",
      subject: opts.subject,
      topic: opts.topic,
      questionText: `Q ${suffix}-${Math.random()}`,
      optionA: "A",
      optionB: "B",
      optionC: "C",
      optionD: "D",
      correctOption: "A",
      contentHash: `hash-${suffix}-${Math.random()}`,
    },
  })
  questionIds.push(question.id)

  const exam = await prisma.exam.create({
    data: {
      teacherId: teacher.id,
      title: `analytics exam ${suffix}-${Math.random()}`,
      durationMinutes: 60,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  })
  examIds.push(exam.id)

  const examQuestion = await prisma.examQuestion.create({
    data: {
      examId: exam.id,
      questionId: question.id,
      order: 0,
      questionTextSnapshot: question.questionText,
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
      studentId: student.id,
      attemptNumber: 1,
      startedAt: now,
      deadline: new Date(now.getTime() + 60 * 60_000),
    },
  })
  await prisma.attemptAnswer.create({
    data: {
      attemptId: attempt.id,
      examQuestionId: examQuestion.id,
      selectedOption: opts.correct ? "A" : "B",
      presentationOrder: 0,
      clientUpdatedAt: now,
    },
  })

  await finalizeAndGradeAttempt(attempt.id, "COMPLETED")
}

beforeAll(async () => {
  teacher = await makeUser("TEACHER", "analytics-teacher")
  student = await makeUser("STUDENT", "analytics-student")

  await answerOneQuestion({ subject: "Math", topic: "Algebra", correct: true })
  await answerOneQuestion({ subject: "Math", topic: "Algebra", correct: true })
  await answerOneQuestion({ subject: "Math", topic: "Algebra", correct: false })
  await answerOneQuestion({ subject: "Math", topic: "Geometry", correct: false })
  await answerOneQuestion({ subject: "Science", topic: "Physics", correct: true })
})

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.question.deleteMany({ where: { id: { in: questionIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("getSubjectTopicPerformance", () => {
  it("groups correct/incorrect counts by subject and topic", async () => {
    const stats = await getSubjectTopicPerformance(student.id)

    const algebra = stats.find((s) => s.subject === "Math" && s.topic === "Algebra")
    expect(algebra).toMatchObject({ totalAnswered: 3, correct: 2, incorrect: 1 })
    expect(algebra?.accuracy).toBeCloseTo(2 / 3)

    const geometry = stats.find((s) => s.subject === "Math" && s.topic === "Geometry")
    expect(geometry).toMatchObject({ totalAnswered: 1, correct: 0, incorrect: 1, accuracy: 0 })

    const physics = stats.find((s) => s.subject === "Science" && s.topic === "Physics")
    expect(physics).toMatchObject({ totalAnswered: 1, correct: 1, accuracy: 1 })
  })
})

describe("getOverallStats", () => {
  it("aggregates across every subject/topic", async () => {
    const stats = await getOverallStats(student.id)
    expect(stats.examsCompleted).toBe(5)
    expect(stats.totalAnswered).toBe(5)
    expect(stats.totalCorrect).toBe(3)
    expect(stats.accuracy).toBeCloseTo(3 / 5)
  })
})

describe("getWeakestTopics", () => {
  it("excludes topics below the minimum sample size and sorts weakest first", async () => {
    const weakest = await getWeakestTopics(student.id)
    // Geometry (1 answer) and Physics (1 answer) are below the minimum
    // sample size of 3 — only Algebra (3 answers) qualifies.
    expect(weakest).toHaveLength(1)
    expect(weakest[0].topic).toBe("Algebra")
  })
})
