/**
 * Seeds a realistic-scale dataset for the Phase 8 performance audit (see
 * docs/performance-audit.md): ~5k students, 3 exams × 40 questions, ~9k
 * graded+published attempts, ~360k answers. Needed because an empty dev
 * database makes every query look instant and every EXPLAIN ANALYZE
 * meaningless — this gives query plans and connection-pool contention
 * something realistic to work against.
 *
 * Not a Vitest file and not run by `npm test` — it's a one-off data
 * generator, run manually:
 *
 *   npx tsx lib/perf/seed-scale.ts          # seed
 *   npx tsx lib/perf/seed-scale.ts --cleanup # remove everything it created
 *
 * Idempotent cleanup: everything it creates is tagged with a `scale-seed-`
 * marker in emails/titles, so `--cleanup` finds and removes it precisely —
 * safe to run against a database that also has real data in it.
 */
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { randomUUID } from "crypto"

const MARKER = "scale-seed-"
const STUDENT_COUNT = 5000
const EXAM_COUNT = 3
const QUESTIONS_PER_EXAM = 40
const BATCH = 2000

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function seed() {
  const t0 = Date.now()
  const suffix = `${MARKER}${Date.now()}`
  const passwordHash = await hashPassword("irrelevant")

  console.log("creating teacher...")
  const teacher = await prisma.user.create({
    data: {
      name: "Scale Teacher",
      email: `${suffix}-teacher@example.com`,
      passwordHash,
      role: "TEACHER",
      isEmailVerified: true,
    },
  })

  console.log(`creating ${STUDENT_COUNT} students...`)
  const studentRows = Array.from({ length: STUDENT_COUNT }, (_, i) => ({
    id: randomUUID(),
    name: `Scale Student ${i}`,
    email: `${suffix}-student-${i}@example.com`,
    passwordHash,
    role: "STUDENT" as const,
    isEmailVerified: true,
  }))
  for (const batch of chunk(studentRows, BATCH)) {
    await prisma.user.createMany({ data: batch })
  }

  console.log(`creating ${EXAM_COUNT} exams with ${QUESTIONS_PER_EXAM} questions each...`)
  const examQuestionsByExam: { examId: string; questions: { id: string }[] }[] = []
  const examIds: string[] = []
  for (let e = 0; e < EXAM_COUNT; e++) {
    const exam = await prisma.exam.create({
      data: {
        teacherId: teacher.id,
        title: `${suffix}-exam-${e}`,
        durationMinutes: 60,
        status: "PUBLISHED",
        publishedAt: new Date(),
        answerKeyReleased: true,
        leaderboardEnabled: true,
      },
    })
    examIds.push(exam.id)

    const questionRows = Array.from({ length: QUESTIONS_PER_EXAM }, (_, i) => ({
      id: randomUUID(),
      examId: exam.id,
      order: i,
      marks: 1,
      questionTextSnapshot: `Exam ${e} Question ${i}`,
      optionASnapshot: "Option A",
      optionBSnapshot: "Option B",
      optionCSnapshot: "Option C",
      optionDSnapshot: "Option D",
      correctOptionSnapshot: "A" as const,
    }))
    await prisma.examQuestion.createMany({ data: questionRows })
    examQuestionsByExam.push({ examId: exam.id, questions: questionRows.map((q) => ({ id: q.id })) })
  }

  console.log("creating attempts, answers, and results (this is the big one)...")
  let attemptCount = 0
  let answerCount = 0

  for (const { examId, questions } of examQuestionsByExam) {
    const attemptRows: {
      id: string
      examId: string
      studentId: string
      attemptNumber: number
      status: "COMPLETED"
      startedAt: Date
      deadline: Date
      submittedAt: Date
    }[] = []
    const answerRows: {
      attemptId: string
      examQuestionId: string
      selectedOption: "A" | "B"
      presentationOrder: number
      clientUpdatedAt: Date
    }[] = []
    const resultRows: {
      attemptId: string
      status: "PUBLISHED"
      totalMarks: number
      obtainedMarks: number
      correctCount: number
      incorrectCount: number
      skippedCount: number
      cancelledCount: number
      accuracy: number
      isPassed: boolean
      publishedAt: Date
    }[] = []

    // ~60% of students attempt each exam — realistic partial participation,
    // and gives the global leaderboard a genuine aggregation to do.
    for (const student of studentRows) {
      if (Math.random() > 0.6) continue
      const attemptId = randomUUID()
      const now = new Date(Date.now() - Math.floor(Math.random() * 30) * 86_400_000)
      const submittedAt = new Date(now.getTime() + 20 * 60_000)

      let correctCount = 0
      questions.forEach((q, i) => {
        const correct = Math.random() < 0.7 // 70% average accuracy
        if (correct) correctCount++
        answerRows.push({
          attemptId,
          examQuestionId: q.id,
          selectedOption: correct ? "A" : "B",
          presentationOrder: i,
          clientUpdatedAt: submittedAt,
        })
      })

      attemptRows.push({
        id: attemptId,
        examId,
        studentId: student.id,
        attemptNumber: 1,
        status: "COMPLETED",
        startedAt: now,
        deadline: submittedAt,
        submittedAt,
      })

      const totalMarks = questions.length
      resultRows.push({
        attemptId,
        status: "PUBLISHED",
        totalMarks,
        obtainedMarks: correctCount,
        correctCount,
        incorrectCount: totalMarks - correctCount,
        skippedCount: 0,
        cancelledCount: 0,
        accuracy: correctCount / totalMarks,
        isPassed: correctCount / totalMarks >= 0.4,
        publishedAt: submittedAt,
      })
    }

    for (const batch of chunk(attemptRows, BATCH)) {
      await prisma.examAttempt.createMany({ data: batch })
    }
    for (const batch of chunk(answerRows, BATCH)) {
      await prisma.attemptAnswer.createMany({ data: batch })
    }
    for (const batch of chunk(resultRows, BATCH)) {
      await prisma.examResult.createMany({ data: batch })
    }

    attemptCount += attemptRows.length
    answerCount += answerRows.length
    console.log(`  exam ${examId}: ${attemptRows.length} attempts, ${answerRows.length} answers`)
  }

  console.log(
    JSON.stringify(
      { suffix, teacherId: teacher.id, examIds, studentCount: STUDENT_COUNT, attemptCount, answerCount, elapsedMs: Date.now() - t0 },
      null,
      2
    )
  )
}

async function cleanup() {
  // Matches both the teacher and every student this script created — all of
  // them share the `scale-seed-<timestamp>-` email prefix.
  const userIds = (
    await prisma.user.findMany({ where: { email: { contains: MARKER } }, select: { id: true } })
  ).map((u) => u.id)
  const examIds = (
    await prisma.exam.findMany({ where: { teacherId: { in: userIds } }, select: { id: true } })
  ).map((e) => e.id)

  console.log(`removing ${userIds.length} users and ${examIds.length} exams created by this script...`)

  await prisma.examResult.deleteMany({ where: { attempt: { examId: { in: examIds } } } })
  await prisma.attemptAnswer.deleteMany({ where: { attempt: { examId: { in: examIds } } } })
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })

  console.log("done")
}

const run = process.argv.includes("--cleanup") ? cleanup : seed

run()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
