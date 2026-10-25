import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { computeGrade } from "./engine"

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

type QuestionSpec = {
  marks: number
  negativeMarks?: number
  correctOption?: "A" | "B" | "C" | "D"
  isCancelled?: boolean
}

async function makeExam(
  teacherId: string,
  questionSpecs: QuestionSpec[],
  examOpts: { passingMarks?: number } = {}
) {
  const exam = await prisma.exam.create({
    data: {
      teacherId,
      title: `grading exam ${suffix}-${Math.random()}`,
      durationMinutes: 60,
      status: "PUBLISHED",
      publishedAt: new Date(),
      passingMarks: examOpts.passingMarks,
    },
  })
  examIds.push(exam.id)

  const questions = []
  for (let i = 0; i < questionSpecs.length; i++) {
    const spec = questionSpecs[i]
    const q = await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        order: i,
        marks: spec.marks,
        negativeMarks: spec.negativeMarks ?? 0,
        isCancelled: spec.isCancelled ?? false,
        questionTextSnapshot: `Q${i} ${suffix}`,
        optionASnapshot: "opt A",
        optionBSnapshot: "opt B",
        optionCSnapshot: "opt C",
        optionDSnapshot: "opt D",
        correctOptionSnapshot: spec.correctOption ?? "A",
      },
    })
    questions.push(q)
  }

  return { exam, questions }
}

async function makeAttemptWithAnswers(
  examId: string,
  studentId: string,
  questions: { id: string }[],
  selections: ("A" | "B" | "C" | "D" | null)[],
  overrides: { deadline?: Date } = {}
) {
  const now = new Date()
  const attempt = await prisma.examAttempt.create({
    data: {
      examId,
      studentId,
      attemptNumber: 1,
      startedAt: now,
      deadline: overrides.deadline ?? new Date(now.getTime() + 60 * 60_000),
    },
  })
  await prisma.attemptAnswer.createMany({
    data: questions.map((q, i) => ({
      attemptId: attempt.id,
      examQuestionId: q.id,
      selectedOption: selections[i] ?? null,
      presentationOrder: i,
      clientUpdatedAt: now,
    })),
  })
  return attempt
}

let teacher: Awaited<ReturnType<typeof makeUser>>
let studentA: Awaited<ReturnType<typeof makeUser>>
let studentB: Awaited<ReturnType<typeof makeUser>>

beforeAll(async () => {
  teacher = await makeUser("TEACHER", "grade-teacher")
  studentA = await makeUser("STUDENT", "grade-student-a")
  studentB = await makeUser("STUDENT", "grade-student-b")
})

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("computeGrade — worked examples", () => {
  it("example 1: 4 questions, 1 mark each, 0.25 negative — 2 correct, 1 incorrect, 1 skipped", async () => {
    const { exam, questions } = await makeExam(teacher.id, [
      { marks: 1, negativeMarks: 0.25, correctOption: "A" },
      { marks: 1, negativeMarks: 0.25, correctOption: "A" },
      { marks: 1, negativeMarks: 0.25, correctOption: "A" },
      { marks: 1, negativeMarks: 0.25, correctOption: "A" },
    ])
    // Q1 correct (A), Q2 incorrect (B instead of A), Q3 skipped, Q4 correct (A)
    const attempt = await makeAttemptWithAnswers(
      exam.id,
      studentA.id,
      questions,
      ["A", "B", null, "A"]
    )

    const grade = await computeGrade(prisma, attempt.id)

    expect(grade.correctCount).toBe(2)
    expect(grade.incorrectCount).toBe(1)
    expect(grade.skippedCount).toBe(1)
    expect(grade.cancelledCount).toBe(0)
    expect(grade.totalMarks).toBe(4)
    // 1 + (-0.25) + 0 + 1 = 1.75
    expect(grade.obtainedMarks).toBe(1.75)
    // accuracy over attempted (correct+incorrect) = 2/3
    expect(grade.accuracy).toBe(0.6667)
  })

  it("example 2: all skipped yields 0, not NaN", async () => {
    const { exam, questions } = await makeExam(teacher.id, [
      { marks: 2, negativeMarks: 0.5 },
      { marks: 2, negativeMarks: 0.5 },
    ])
    const attempt = await makeAttemptWithAnswers(exam.id, studentA.id, questions, [
      null,
      null,
    ])

    const grade = await computeGrade(prisma, attempt.id)

    expect(grade.obtainedMarks).toBe(0)
    expect(grade.correctCount).toBe(0)
    expect(grade.incorrectCount).toBe(0)
    expect(grade.skippedCount).toBe(2)
    expect(grade.accuracy).toBe(0) // 0/0 case must not be NaN
  })

  it("example 3: negative marking can take the total below zero", async () => {
    const { exam, questions } = await makeExam(teacher.id, [
      { marks: 1, negativeMarks: 1, correctOption: "A" },
      { marks: 1, negativeMarks: 1, correctOption: "A" },
      { marks: 1, negativeMarks: 1, correctOption: "A" },
    ])
    // all three wrong
    const attempt = await makeAttemptWithAnswers(exam.id, studentA.id, questions, [
      "B",
      "B",
      "B",
    ])

    const grade = await computeGrade(prisma, attempt.id)

    expect(grade.obtainedMarks).toBe(-3) // not floored at 0 — documented policy
    expect(grade.correctCount).toBe(0)
    expect(grade.incorrectCount).toBe(3)
  })

  it("example 4: a cancelled question awards full marks regardless of the answer, and isn't counted as correct/incorrect", async () => {
    const { exam, questions } = await makeExam(teacher.id, [
      { marks: 2, correctOption: "A", isCancelled: true },
      { marks: 1, correctOption: "A" },
    ])
    // picked the "wrong" option on the cancelled question, correct on the other
    const attempt = await makeAttemptWithAnswers(exam.id, studentA.id, questions, [
      "D",
      "A",
    ])

    const grade = await computeGrade(prisma, attempt.id)

    expect(grade.cancelledCount).toBe(1)
    expect(grade.correctCount).toBe(1) // only the non-cancelled correct one
    expect(grade.incorrectCount).toBe(0)
    expect(grade.totalMarks).toBe(3) // cancelled question's marks still count toward the total
    expect(grade.obtainedMarks).toBe(3) // full credit for cancelled (2) + correct (1)
  })

  it("example 5: pass/fail boundary is inclusive (obtainedMarks >= passingMarks)", async () => {
    const { exam, questions } = await makeExam(
      teacher.id,
      [{ marks: 1, correctOption: "A" }, { marks: 1, correctOption: "A" }],
      { passingMarks: 2 }
    )
    const passing = await makeAttemptWithAnswers(exam.id, studentA.id, questions, [
      "A",
      "A",
    ])
    const failing = await makeAttemptWithAnswers(exam.id, studentB.id, questions, [
      "A",
      "B",
    ])

    const passingGrade = await computeGrade(prisma, passing.id)
    const failingGrade = await computeGrade(prisma, failing.id)

    expect(passingGrade.obtainedMarks).toBe(2)
    expect(passingGrade.isPassed).toBe(true) // exactly at the threshold
    expect(failingGrade.obtainedMarks).toBe(1)
    expect(failingGrade.isPassed).toBe(false)
  })

  it("example 6: isPassed is null when the exam has no configured passing marks", async () => {
    const { exam, questions } = await makeExam(teacher.id, [{ marks: 1, correctOption: "A" }])
    const attempt = await makeAttemptWithAnswers(exam.id, studentA.id, questions, ["A"])

    const grade = await computeGrade(prisma, attempt.id)
    expect(grade.isPassed).toBeNull()
  })

  it("example 7: ties score identically — deterministic arithmetic, not float-drift-dependent", async () => {
    const { exam, questions } = await makeExam(teacher.id, [
      { marks: 0.3333, correctOption: "A" },
      { marks: 0.3333, correctOption: "A" },
      { marks: 0.3333, correctOption: "A" },
    ])
    const a = await makeAttemptWithAnswers(exam.id, studentA.id, questions, [
      "A",
      "A",
      "A",
    ])
    const b = await makeAttemptWithAnswers(exam.id, studentB.id, questions, [
      "A",
      "A",
      "A",
    ])

    const gradeA = await computeGrade(prisma, a.id)
    const gradeB = await computeGrade(prisma, b.id)

    expect(gradeA.obtainedMarks).toBe(gradeB.obtainedMarks)
    expect(gradeA.obtainedMarks).toBe(1) // 0.3333 * 3 = 0.9999 -> rounds to 1.00
  })

  it("always re-reads the current ExamQuestion state, not a cached one", async () => {
    const { exam, questions } = await makeExam(teacher.id, [
      { marks: 1, correctOption: "A" },
    ])
    const attempt = await makeAttemptWithAnswers(exam.id, studentA.id, questions, ["B"])

    const before = await computeGrade(prisma, attempt.id)
    expect(before.correctCount).toBe(0)

    // simulate a correction changing the answer key to B
    await prisma.examQuestion.update({
      where: { id: questions[0].id },
      data: { correctOptionSnapshot: "B" },
    })

    const after = await computeGrade(prisma, attempt.id)
    expect(after.correctCount).toBe(1)
    expect(after.obtainedMarks).toBe(1)
  })
})
