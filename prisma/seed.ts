import "dotenv/config"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/prisma/generated/prisma/client"
import { hashPassword } from "@/modules/auth/password"
import { computeQuestionContentHash } from "@/modules/question-bank/content-hash"
import { shuffledQuestionOrder } from "@/modules/attempts/shuffle"
import { finalizeAndGradeAttempt } from "@/modules/grading/finalize"
import { recordViolationEvent } from "@/modules/proctoring/record"
import { recordDailyActivity } from "@/modules/learning/streak"
import { awardXP, XP_PER_STREAK_DAY } from "@/modules/learning/xp"
import { evaluateBadgesAfterStreakUpdate } from "@/modules/learning/badges"

/**
 * A single, re-runnable seed covering every section of the platform — not
 * just auth. Every entity lookup checks for an existing row first (by the
 * same natural key a real duplicate-prevention check would use), so running
 * `npm run db:seed` repeatedly never duplicates data.
 *
 * Grading, shuffling, streaks, and badge awards all go through the real
 * production functions (finalizeAndGradeAttempt, shuffledQuestionOrder,
 * recordDailyActivity, …) rather than hand-computed fixtures, so the seeded
 * data is exactly what those code paths would have produced for real usage.
 */

const DEMO_PASSWORD = "Password123!"
type OptionLetter = "A" | "B" | "C" | "D"

function otherOption(correct: OptionLetter): OptionLetter {
  return (["A", "B", "C", "D"] as const).find((o) => o !== correct)!
}

// ─── Users ──────────────────────────────────────────────────────────────

async function upsertUser(opts: {
  email: string
  name: string
  role: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT"
}) {
  const passwordHash = await hashPassword(DEMO_PASSWORD)
  return prisma.user.upsert({
    where: { email: opts.email },
    update: {},
    create: {
      email: opts.email,
      name: opts.name,
      passwordHash,
      role: opts.role,
      isEmailVerified: true,
    },
  })
}

async function seedUsers() {
  const admin = await upsertUser({ email: "admin@example.com", name: "Admin User", role: "SUPER_ADMIN" })
  const teacherA = await upsertUser({ email: "teacher@example.com", name: "Teacher User", role: "TEACHER" })
  const teacherB = await upsertUser({ email: "teacher2@example.com", name: "Priya Sharma", role: "TEACHER" })
  const teacherPending = await upsertUser({ email: "teacher-pending@example.com", name: "Sam Carter", role: "TEACHER" })

  // teacherA/teacherB are grandfathered to VERIFIED with a matching audit
  // entry; teacherPending is left at the default PENDING to populate the
  // admin verification queue.
  for (const teacher of [teacherA, teacherB]) {
    const fresh = await prisma.user.findUniqueOrThrow({ where: { id: teacher.id } })
    if (fresh.teacherVerificationStatus !== "VERIFIED") {
      await prisma.user.update({
        where: { id: teacher.id },
        data: {
          teacherVerificationStatus: "VERIFIED",
          teacherVerifiedAt: new Date(),
          teacherVerifiedById: admin.id,
        },
      })
      await prisma.adminAuditLog.create({
        data: {
          action: "TEACHER_VERIFIED",
          actorId: admin.id,
          targetUserId: teacher.id,
          reason: "Verified during initial platform seeding",
        },
      })
    }
  }

  const studentSeeds = [
    { email: "student1@example.com", name: "Alice Chen" },
    { email: "student2@example.com", name: "Bob Martinez" },
    { email: "student3@example.com", name: "Carol Singh" },
    { email: "student4@example.com", name: "Dave Okafor" },
    { email: "student5@example.com", name: "Eve Johansson" },
    { email: "student6@example.com", name: "Frank Lee" },
    { email: "student7@example.com", name: "Grace Kim" },
    { email: "student8@example.com", name: "Henry Novak" },
    { email: "student9@example.com", name: "Iris Tanaka" },
    { email: "student10@example.com", name: "Jack Wilson" },
  ]
  const [alice, bob, carol, dave, eve, frank, grace, henry, iris, jack] = await Promise.all(
    studentSeeds.map((s) => upsertUser({ ...s, role: "STUDENT" }))
  )

  // Henry stays suspended; Iris is suspended then reinstated — together
  // they exercise both admin-audit outcomes, not just one.
  const henryFresh = await prisma.user.findUniqueOrThrow({ where: { id: henry.id } })
  if (henryFresh.isActive) {
    await prisma.user.update({
      where: { id: henry.id },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspendedReason: "Repeated policy violations across multiple exams",
        suspendedById: admin.id,
      },
    })
    await prisma.adminAuditLog.create({
      data: {
        action: "ACCOUNT_SUSPENDED",
        actorId: admin.id,
        targetUserId: henry.id,
        reason: "Repeated policy violations across multiple exams",
      },
    })
  }

  const irisReinstated = await prisma.adminAuditLog.findFirst({
    where: { action: "ACCOUNT_REINSTATED", targetUserId: iris.id },
  })
  if (!irisReinstated) {
    await prisma.user.update({
      where: { id: iris.id },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspendedReason: "Flagged in error during a routine audit sweep",
        suspendedById: admin.id,
      },
    })
    await prisma.adminAuditLog.create({
      data: {
        action: "ACCOUNT_SUSPENDED",
        actorId: admin.id,
        targetUserId: iris.id,
        reason: "Flagged in error during a routine audit sweep",
      },
    })
    await prisma.user.update({
      where: { id: iris.id },
      data: { isActive: true, suspendedAt: null, suspendedReason: null, suspendedById: null },
    })
    await prisma.adminAuditLog.create({
      data: {
        action: "ACCOUNT_REINSTATED",
        actorId: admin.id,
        targetUserId: iris.id,
        reason: "Reviewed and cleared — suspension was issued in error",
      },
    })
  }

  return {
    admin,
    teacherA,
    teacherB,
    teacherPending,
    students: { alice, bob, carol, dave, eve, frank, grace, henry, iris, jack },
  }
}

// ─── Question bank ──────────────────────────────────────────────────────

type QuestionSeed = {
  subject: string
  topic: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: OptionLetter
  explanation: string
}

const MATH_QUESTIONS: QuestionSeed[] = [
  {
    subject: "Mathematics", topic: "Algebra", difficulty: "EASY",
    questionText: "What is the value of x in 2x + 3 = 11?",
    optionA: "3", optionB: "4", optionC: "5", optionD: "6", correctOption: "B",
    explanation: "2x = 11 - 3 = 8, so x = 4.",
  },
  {
    subject: "Mathematics", topic: "Algebra", difficulty: "MEDIUM",
    questionText: "If f(x) = x^2 - 4x + 3, what is f(1)?",
    optionA: "0", optionB: "-1", optionC: "1", optionD: "2", correctOption: "A",
    explanation: "f(1) = 1 - 4 + 3 = 0.",
  },
  {
    subject: "Mathematics", topic: "Algebra", difficulty: "HARD",
    questionText: "Solve for x: log base 2 of x equals 5",
    optionA: "16", optionB: "25", optionC: "32", optionD: "64", correctOption: "C",
    explanation: "log2(x) = 5 means x = 2^5 = 32.",
  },
  {
    subject: "Mathematics", topic: "Geometry", difficulty: "EASY",
    questionText: "How many degrees are in a right angle?",
    optionA: "45", optionB: "90", optionC: "180", optionD: "360", correctOption: "B",
    explanation: "A right angle measures exactly 90 degrees.",
  },
  {
    subject: "Mathematics", topic: "Geometry", difficulty: "MEDIUM",
    questionText: "What is the area of a circle with radius 7 (use pi = 22/7)?",
    optionA: "144", optionB: "150", optionC: "154", optionD: "160", correctOption: "C",
    explanation: "Area = pi * r^2 = (22/7) * 49 = 154.",
  },
  {
    subject: "Mathematics", topic: "Geometry", difficulty: "HARD",
    questionText: "In a right triangle, the two legs measure 9 and 12. What is the hypotenuse?",
    optionA: "13", optionB: "14", optionC: "15", optionD: "21", correctOption: "C",
    explanation: "sqrt(9^2 + 12^2) = sqrt(81 + 144) = sqrt(225) = 15.",
  },
]

const PHYSICS_QUESTIONS: QuestionSeed[] = [
  {
    subject: "Physics", topic: "Mechanics", difficulty: "EASY",
    questionText: "What is the SI unit of force?",
    optionA: "Joule", optionB: "Newton", optionC: "Watt", optionD: "Pascal", correctOption: "B",
    explanation: "Force is measured in Newtons (N).",
  },
  {
    subject: "Physics", topic: "Mechanics", difficulty: "MEDIUM",
    questionText: "A car accelerates from rest at 2 m/s^2 for 5 seconds. What is its final velocity?",
    optionA: "5 m/s", optionB: "10 m/s", optionC: "15 m/s", optionD: "20 m/s", correctOption: "B",
    explanation: "v = u + at = 0 + (2 * 5) = 10 m/s.",
  },
  {
    subject: "Physics", topic: "Mechanics", difficulty: "HARD",
    questionText: "A 2kg object moving at 3 m/s collides and sticks to a stationary 1kg object. What is their combined velocity?",
    optionA: "1 m/s", optionB: "1.5 m/s", optionC: "2 m/s", optionD: "3 m/s", correctOption: "C",
    explanation: "Momentum is conserved: 2*3 = (2+1)*v, so v = 2 m/s.",
  },
  {
    subject: "Physics", topic: "Electricity", difficulty: "EASY",
    questionText: "What is the SI unit of electric current?",
    optionA: "Volt", optionB: "Ohm", optionC: "Ampere", optionD: "Watt", correctOption: "C",
    explanation: "Electric current is measured in Amperes (A).",
  },
  {
    subject: "Physics", topic: "Electricity", difficulty: "MEDIUM",
    questionText: "What is the resistance of a circuit with a 12V supply and a 3A current?",
    optionA: "3 ohm", optionB: "4 ohm", optionC: "6 ohm", optionD: "36 ohm", correctOption: "B",
    explanation: "R = V / I = 12 / 3 = 4 ohm.",
  },
  {
    subject: "Physics", topic: "Electricity", difficulty: "HARD",
    questionText: "Two resistors, 4 ohm and 6 ohm, are connected in parallel. What is their equivalent resistance?",
    optionA: "2 ohm", optionB: "2.4 ohm", optionC: "5 ohm", optionD: "10 ohm", correctOption: "B",
    explanation: "1/R = 1/4 + 1/6 = 5/12, so R = 12/5 = 2.4 ohm.",
  },
]

const CS_QUESTIONS: QuestionSeed[] = [
  {
    subject: "Computer Science", topic: "Data Structures", difficulty: "EASY",
    questionText: "Which data structure uses FIFO (First In, First Out) order?",
    optionA: "Stack", optionB: "Queue", optionC: "Tree", optionD: "Graph", correctOption: "B",
    explanation: "A queue processes elements in the order they arrived.",
  },
  {
    subject: "Computer Science", topic: "Data Structures", difficulty: "MEDIUM",
    questionText: "What is the time complexity of binary search on a sorted array of n elements?",
    optionA: "O(n)", optionB: "O(log n)", optionC: "O(n log n)", optionD: "O(1)", correctOption: "B",
    explanation: "Binary search halves the search space each step: O(log n).",
  },
  {
    subject: "Computer Science", topic: "Data Structures", difficulty: "HARD",
    questionText: "What is the worst-case time complexity of quicksort?",
    optionA: "O(n log n)", optionB: "O(n)", optionC: "O(n^2)", optionD: "O(log n)", correctOption: "C",
    explanation: "Quicksort degrades to O(n^2) when the pivot is always the smallest or largest element.",
  },
  {
    subject: "Computer Science", topic: "Databases", difficulty: "EASY",
    questionText: "What does SQL stand for?",
    optionA: "Structured Query Language", optionB: "Simple Query Logic",
    optionC: "Sequential Query Language", optionD: "Standard Query Language", correctOption: "A",
    explanation: "SQL stands for Structured Query Language.",
  },
  {
    subject: "Computer Science", topic: "Databases", difficulty: "MEDIUM",
    questionText: "Which SQL clause is used to filter grouped results?",
    optionA: "WHERE", optionB: "HAVING", optionC: "GROUP BY", optionD: "ORDER BY", correctOption: "B",
    explanation: "HAVING filters groups after GROUP BY, unlike WHERE which filters rows before grouping.",
  },
  {
    subject: "Computer Science", topic: "Databases", difficulty: "HARD",
    questionText: "In database normalization, which normal form eliminates transitive dependencies?",
    optionA: "1NF", optionB: "2NF", optionC: "3NF", optionD: "BCNF", correctOption: "C",
    explanation: "Third Normal Form (3NF) removes transitive dependencies on the primary key.",
  },
]

async function findOrCreateQuestion(
  teacherId: string,
  status: "DRAFT" | "ACTIVE" | "ARCHIVED",
  seed: QuestionSeed
) {
  const existing = await prisma.question.findFirst({
    where: { teacherId, questionText: seed.questionText },
  })
  if (existing) return existing

  return prisma.question.create({
    data: {
      teacherId,
      status,
      subject: seed.subject,
      topic: seed.topic,
      difficulty: seed.difficulty,
      questionText: seed.questionText,
      optionA: seed.optionA,
      optionB: seed.optionB,
      optionC: seed.optionC,
      optionD: seed.optionD,
      correctOption: seed.correctOption,
      explanation: seed.explanation,
      contentHash: computeQuestionContentHash(seed),
    },
  })
}

async function seedQuestionBank(teacherAId: string, teacherBId: string) {
  const mathQuestions = await Promise.all(
    MATH_QUESTIONS.map((q) => findOrCreateQuestion(teacherAId, "ACTIVE", q))
  )
  const physicsQuestions = await Promise.all(
    PHYSICS_QUESTIONS.map((q) => findOrCreateQuestion(teacherAId, "ACTIVE", q))
  )
  const csQuestions = await Promise.all(
    CS_QUESTIONS.map((q) => findOrCreateQuestion(teacherBId, "ACTIVE", q))
  )

  // One DRAFT and one ARCHIVED question, so the teacher's question-bank
  // status filter has something in every state, not just ACTIVE.
  await findOrCreateQuestion(teacherAId, "DRAFT", {
    subject: "Mathematics", topic: "Calculus", difficulty: "HARD",
    questionText: "What is the derivative of x^3 with respect to x?",
    optionA: "x^2", optionB: "3x^2", optionC: "3x", optionD: "x^3/3", correctOption: "B",
    explanation: "d/dx(x^3) = 3x^2.",
  })
  await findOrCreateQuestion(teacherAId, "ARCHIVED", {
    subject: "Mathematics", topic: "Arithmetic", difficulty: "EASY",
    questionText: "What is 15% of 200?",
    optionA: "20", optionB: "25", optionC: "30", optionD: "35", correctOption: "C",
    explanation: "15% of 200 = 0.15 * 200 = 30.",
  })

  return { mathQuestions, physicsQuestions, csQuestions }
}

// ─── Exams ──────────────────────────────────────────────────────────────

async function findOrCreateExam(
  teacherId: string,
  title: string,
  data: Omit<Prisma.ExamUncheckedCreateInput, "teacherId" | "title">
) {
  const existing = await prisma.exam.findFirst({ where: { teacherId, title } })
  if (existing) return existing
  return prisma.exam.create({ data: { teacherId, title, ...data } })
}

async function seedExams(teacherAId: string, teacherBId: string) {
  const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000)

  const draftExam = await findOrCreateExam(teacherAId, "Algebra & Geometry Fundamentals", {
    description: "A foundational draft exam covering basic algebra and geometry.",
    status: "DRAFT",
    durationMinutes: 30,
  })

  const upcomingExam = await findOrCreateExam(teacherAId, "Physics Midterm", {
    description: "Midterm covering mechanics and electricity. Opens next week.",
    status: "PUBLISHED",
    durationMinutes: 45,
    startTime: days(7),
    endTime: days(14),
    publishedAt: new Date(),
  })

  const liveExam = await findOrCreateExam(teacherAId, "Mathematics Practice Quiz", {
    description: "A short, low-stakes practice quiz, open for a week.",
    status: "PUBLISHED",
    durationMinutes: 20,
    maxAttempts: 2,
    shuffleQuestions: true,
    startTime: days(-1),
    endTime: days(6),
    publishedAt: days(-1),
  })

  const championshipExam = await findOrCreateExam(teacherBId, "Computer Science Championship", {
    description: "A closed-book competitive CS exam with full result disclosure.",
    status: "PUBLISHED",
    durationMinutes: 30,
    violationReviewThreshold: 3,
    startTime: days(-10),
    endTime: days(-3),
    publishedAt: days(-10),
    answerKeyReleased: true,
    answerKeyReleasedAt: days(-2),
  })

  const reviewExam = await findOrCreateExam(teacherAId, "General Science Review", {
    description: "A mixed-subject review exam. Graded, but results aren't published yet.",
    status: "PUBLISHED",
    durationMinutes: 25,
    startTime: days(-5),
    endTime: days(-1),
    publishedAt: days(-5),
  })

  const archivedExam = await findOrCreateExam(teacherAId, "Legacy Trigonometry Exam", {
    description: "An older exam, now archived.",
    status: "ARCHIVED",
    durationMinutes: 30,
    startTime: days(-210),
    endTime: days(-203),
    publishedAt: days(-210),
    archivedAt: days(-200),
    answerKeyReleased: true,
    answerKeyReleasedAt: days(-195),
  })

  return { draftExam, upcomingExam, liveExam, championshipExam, reviewExam, archivedExam }
}

async function attachQuestions(
  examId: string,
  questions: { id: string; questionText: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: OptionLetter; explanation: string | null }[]
) {
  const alreadyAdded = await prisma.examQuestion.findMany({
    where: { examId, questionId: { in: questions.map((q) => q.id) } },
  })
  const alreadyAddedIds = new Set(alreadyAdded.map((eq) => eq.questionId))
  const toAdd = questions.filter((q) => !alreadyAddedIds.has(q.id))

  const currentMax = await prisma.examQuestion.aggregate({
    where: { examId },
    _max: { order: true },
  })
  let nextOrder = (currentMax._max.order ?? -1) + 1

  const created = await Promise.all(
    toAdd.map((q) =>
      prisma.examQuestion.create({
        data: {
          examId,
          questionId: q.id,
          order: nextOrder++,
          questionTextSnapshot: q.questionText,
          optionASnapshot: q.optionA,
          optionBSnapshot: q.optionB,
          optionCSnapshot: q.optionC,
          optionDSnapshot: q.optionD,
          correctOptionSnapshot: q.correctOption,
          explanationSnapshot: q.explanation,
        },
      })
    )
  )

  return [...alreadyAdded, ...created].sort((a, b) => a.order - b.order)
}

// ─── Attempts ───────────────────────────────────────────────────────────

async function createAttempt(opts: {
  examId: string
  studentId: string
  attemptNumber: number
  startedAt: Date
  deadline: Date
  examQuestions: { id: string }[]
  shuffle?: boolean
}) {
  const existing = await prisma.examAttempt.findFirst({
    where: { studentId: opts.studentId, examId: opts.examId, attemptNumber: opts.attemptNumber },
  })
  if (existing) return existing

  return prisma.$transaction(async (tx) => {
    const created = await tx.examAttempt.create({
      data: {
        examId: opts.examId,
        studentId: opts.studentId,
        attemptNumber: opts.attemptNumber,
        startedAt: opts.startedAt,
        deadline: opts.deadline,
      },
    })

    const order = opts.shuffle
      ? shuffledQuestionOrder(opts.examQuestions.length, created.id)
      : opts.examQuestions.map((_, i) => i)

    await tx.attemptAnswer.createMany({
      data: opts.examQuestions.map((q, i) => ({
        attemptId: created.id,
        examQuestionId: q.id,
        presentationOrder: order[i],
        clientUpdatedAt: opts.startedAt,
      })),
    })

    return created
  })
}

async function answerQuestions(
  attemptId: string,
  answers: { examQuestionId: string; selectedOption: OptionLetter }[],
  at: Date
) {
  for (const a of answers) {
    await prisma.attemptAnswer.updateMany({
      where: { attemptId, examQuestionId: a.examQuestionId },
      data: { selectedOption: a.selectedOption, clientUpdatedAt: at },
    })
  }
}

/** A live, in-progress attempt — the exam is open and this student hasn't submitted yet. */
async function seedLiveQuizAttempt(
  liveExam: { id: string; durationMinutes: number },
  mathQuestions: Awaited<ReturnType<typeof seedQuestionBank>>["mathQuestions"],
  aliceId: string
) {
  const examQuestions = await attachQuestions(liveExam.id, mathQuestions)
  const now = new Date()
  const attempt = await createAttempt({
    examId: liveExam.id,
    studentId: aliceId,
    attemptNumber: 1,
    startedAt: now,
    deadline: new Date(now.getTime() + liveExam.durationMinutes * 60_000),
    examQuestions,
    shuffle: true,
  })

  const alreadyAnswered = await prisma.attemptAnswer.count({
    where: { attemptId: attempt.id, selectedOption: { not: null } },
  })
  if (alreadyAnswered === 0) {
    await answerQuestions(
      attempt.id,
      examQuestions.slice(0, 3).map((q) => ({ examQuestionId: q.id, selectedOption: "B" as const })),
      now
    )
  }
}

type ChampionshipStudents = {
  bob: { id: string }
  carol: { id: string }
  dave: { id: string }
  eve: { id: string }
  frank: { id: string }
  grace: { id: string }
  henry: { id: string }
}

/**
 * The richest scenario: a closed, fully-graded, fully-published exam with a
 * mix of outcomes (perfect score, average scores, a timeout, and two
 * disqualifications — one with a pending appeal, one reinstated) so every
 * teacher results/leaderboard/violations view has real data to show.
 */
async function seedChampionshipExam(
  championshipExam: { id: string; durationMinutes: number },
  csQuestions: Awaited<ReturnType<typeof seedQuestionBank>>["csQuestions"],
  students: ChampionshipStudents,
  teacherBId: string
) {
  const { bob, carol, dave, eve, frank, grace, henry } = students
  const examQuestions = await attachQuestions(championshipExam.id, csQuestions)
  const startedAt = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
  const deadline = new Date(startedAt.getTime() + championshipExam.durationMinutes * 60_000)

  async function attemptAndGrade(
    studentId: string,
    correctIndexes: number[],
    finalStatus: "COMPLETED" | "TIMEOUT" = "COMPLETED"
  ) {
    const attempt = await createAttempt({
      examId: championshipExam.id,
      studentId,
      attemptNumber: 1,
      startedAt,
      deadline,
      examQuestions,
    })

    const alreadyGraded = await prisma.examResult.findUnique({ where: { attemptId: attempt.id } })
    if (alreadyGraded) return attempt

    const answers = examQuestions.map((q, i) => ({
      examQuestionId: q.id,
      selectedOption: correctIndexes.includes(i)
        ? q.correctOptionSnapshot
        : otherOption(q.correctOptionSnapshot),
    }))
    await answerQuestions(
      attempt.id,
      finalStatus === "TIMEOUT" ? answers.slice(0, 2) : answers,
      startedAt
    )
    await finalizeAndGradeAttempt(attempt.id, finalStatus)
    return attempt
  }

  const bobAttempt = await attemptAndGrade(bob.id, [0, 1, 2, 3, 4, 5]) // perfect score
  await attemptAndGrade(carol.id, [0, 1, 2, 3]) // good score
  await attemptAndGrade(dave.id, [0, 1, 2]) // average score
  await attemptAndGrade(eve.id, [0]) // poor score
  const frankAttempt = await attemptAndGrade(frank.id, [0, 1, 2, 3]) // disqualified, appeal pending
  const graceAttempt = await attemptAndGrade(grace.id, [0, 1, 2, 3, 4]) // disqualified, appeal accepted
  await attemptAndGrade(henry.id, [0], "TIMEOUT") // never finished

  await prisma.examResult.updateMany({
    where: { status: "PROVISIONAL", attempt: { examId: championshipExam.id } },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  })

  // Crosses the exam's violationReviewThreshold (3): LOW(1) + MEDIUM(2) = 3.
  async function addReviewTriggeringViolations(attemptId: string, studentId: string) {
    const already = await prisma.violationEvent.count({ where: { attemptId } })
    if (already > 0) return
    await recordViolationEvent({
      attemptId, studentId, examId: championshipExam.id,
      type: "TAB_SWITCH", source: "CLIENT_REPORTED", metadata: { awayDurationMs: 5000 },
    })
    await recordViolationEvent({
      attemptId, studentId, examId: championshipExam.id,
      type: "COPY_ATTEMPT", source: "CLIENT_REPORTED", metadata: { selectionLength: 120 },
    })
  }
  async function disqualify(attemptId: string, reason: string) {
    const fresh = await prisma.examAttempt.findUniqueOrThrow({ where: { id: attemptId } })
    if (fresh.status === "DISQUALIFIED") return
    await prisma.$transaction([
      prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: "DISQUALIFIED",
          disqualifiedReason: reason,
          statusBeforeDisqualification: fresh.status,
        },
      }),
      prisma.gradingAuditLog.create({
        data: {
          examId: championshipExam.id, attemptId,
          action: "ATTEMPT_DISQUALIFIED", actorId: teacherBId, reason,
        },
      }),
    ])
  }

  // Each guarded by "does an appeal already exist for this attempt" rather
  // than "is it currently disqualified" — Grace's attempt is deliberately
  // NOT disqualified once her appeal is accepted, so a status-only guard
  // would re-disqualify her on every subsequent seed run.
  const frankAppeal = await prisma.violationAppeal.findFirst({ where: { attemptId: frankAttempt.id } })
  if (!frankAppeal) {
    await addReviewTriggeringViolations(frankAttempt.id, frank.id)
    await disqualify(frankAttempt.id, "Multiple tab-switch and copy violations crossing the review threshold")
    // Frank's appeal is left PENDING — an open item for the teacher to review.
    await prisma.violationAppeal.create({
      data: {
        attemptId: frankAttempt.id, studentId: frank.id,
        explanation: "I switched tabs briefly to check the exam instructions document, not to look up answers.",
      },
    })
  }

  // Grace's appeal is accepted — restores her prior status and leaderboard eligibility.
  const graceAppeal = await prisma.violationAppeal.findFirst({ where: { attemptId: graceAttempt.id } })
  if (!graceAppeal) {
    await addReviewTriggeringViolations(graceAttempt.id, grace.id)
    await disqualify(graceAttempt.id, "Multiple tab-switch and copy violations crossing the review threshold")
    const created = await prisma.violationAppeal.create({
      data: {
        attemptId: graceAttempt.id, studentId: grace.id,
        explanation: "My browser crashed and reopened the exam tab automatically, which triggered the tab-switch detection.",
      },
    })
    const freshGrace = await prisma.examAttempt.findUniqueOrThrow({ where: { id: graceAttempt.id } })
    await prisma.$transaction([
      prisma.violationAppeal.update({
        where: { id: created.id },
        data: {
          status: "ACCEPTED",
          resolutionNote: "Verified with the student — a genuine browser crash, not evasion. Reinstating.",
          resolvedById: teacherBId,
          resolvedAt: new Date(),
        },
      }),
      prisma.examAttempt.update({
        where: { id: graceAttempt.id },
        data: { status: freshGrace.statusBeforeDisqualification ?? "COMPLETED" },
      }),
      prisma.gradingAuditLog.create({
        data: {
          examId: championshipExam.id, attemptId: graceAttempt.id,
          action: "ATTEMPT_REQUALIFIED", actorId: teacherBId,
          reason: "Verified genuine browser crash",
        },
      }),
    ])
  }

  await prisma.questionBookmark.createMany({
    data: [
      { studentId: bob.id, examQuestionId: examQuestions[1].id },
      { studentId: carol.id, examQuestionId: examQuestions[2].id },
    ],
    skipDuplicates: true,
  })

  const report = await prisma.questionReport.findFirst({
    where: { questionId: csQuestions[4].id, reportedById: dave.id },
  })
  if (!report) {
    await prisma.questionReport.create({
      data: {
        questionId: csQuestions[4].id,
        reportedById: dave.id,
        reason: "The explanation for this question seems to contradict the marked correct answer — please double check.",
      },
    })
  }

  return { bobAttempt }
}

/** Graded but deliberately left PROVISIONAL — the pre-publish teacher workflow. */
async function seedProvisionalReviewExam(
  reviewExam: { id: string; durationMinutes: number },
  questions: { id: string; questionText: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: OptionLetter; explanation: string | null }[],
  irisId: string,
  jackId: string
) {
  const examQuestions = await attachQuestions(reviewExam.id, questions)
  const startedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  const deadline = new Date(startedAt.getTime() + reviewExam.durationMinutes * 60_000)

  for (const [studentId, correctCount] of [[irisId, 5], [jackId, 3]] as const) {
    const attempt = await createAttempt({
      examId: reviewExam.id, studentId, attemptNumber: 1, startedAt, deadline, examQuestions,
    })
    const alreadyGraded = await prisma.examResult.findUnique({ where: { attemptId: attempt.id } })
    if (alreadyGraded) continue

    const answers = examQuestions.map((q, i) => ({
      examQuestionId: q.id,
      selectedOption: i < correctCount ? q.correctOptionSnapshot : otherOption(q.correctOptionSnapshot),
    }))
    await answerQuestions(attempt.id, answers, startedAt)
    await finalizeAndGradeAttempt(attempt.id, "COMPLETED")
  }
}

/** An old, archived exam with a completed attempt and old violation evidence (purge-eligible). */
async function seedArchivedExam(
  archivedExam: { id: string; durationMinutes: number },
  mathQuestions: Awaited<ReturnType<typeof seedQuestionBank>>["mathQuestions"],
  aliceId: string
) {
  const examQuestions = await attachQuestions(archivedExam.id, mathQuestions.slice(0, 3))
  const startedAt = new Date(Date.now() - 208 * 24 * 60 * 60 * 1000)
  const deadline = new Date(startedAt.getTime() + archivedExam.durationMinutes * 60_000)

  const attempt = await createAttempt({
    examId: archivedExam.id, studentId: aliceId, attemptNumber: 1, startedAt, deadline, examQuestions,
  })

  const alreadyGraded = await prisma.examResult.findUnique({ where: { attemptId: attempt.id } })
  if (!alreadyGraded) {
    const answers = examQuestions.map((q) => ({
      examQuestionId: q.id,
      selectedOption: q.correctOptionSnapshot,
    }))
    await answerQuestions(attempt.id, answers, startedAt)
    await finalizeAndGradeAttempt(attempt.id, "COMPLETED")
    await prisma.examResult.update({
      where: { attemptId: attempt.id },
      data: { status: "PUBLISHED", publishedAt: startedAt },
    })
  }

  const alreadyHasViolations = await prisma.violationEvent.count({ where: { attemptId: attempt.id } })
  if (alreadyHasViolations === 0) {
    await prisma.violationEvent.create({
      data: {
        attemptId: attempt.id, studentId: aliceId,
        type: "TAB_SWITCH", source: "CLIENT_REPORTED", severity: "LOW",
        occurredAt: startedAt,
      },
    })
  }
}

/** Builds an 8-day activity streak for Alice, crossing the STREAK_7 badge. */
async function seedStreak(aliceId: string) {
  const existing = await prisma.userStreak.findUnique({ where: { studentId: aliceId } })
  if (existing && existing.currentStreak >= 7) return

  for (let daysAgo = 7; daysAgo >= 0; daysAgo--) {
    const day = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    const streak = await recordDailyActivity(aliceId, "Asia/Dhaka", day)
    if (streak.isNewDay) {
      await awardXP(prisma, aliceId, XP_PER_STREAK_DAY, "STREAK_DAY", "STREAK_DAY", streak.lastActiveDate ?? "")
      await evaluateBadgesAfterStreakUpdate(prisma, aliceId, streak.currentStreak)
    }
  }
}

// ─── Subscriptions, coupons & payments ──────────────────────────────────

async function seedPlans(adminId: string) {
  const seeds = [
    {
      key: "free", name: "Free", priceCents: 0, billingInterval: "MONTH" as const,
      description: "Get started with core exam-taking features.",
      entitlements: { maxActiveExams: 3, aiExplanationsEnabled: false },
    },
    {
      key: "pro-monthly", name: "Pro (Monthly)", priceCents: 1999, billingInterval: "MONTH" as const,
      description: "Unlimited exams and AI-powered explanations, billed monthly.",
      entitlements: { maxActiveExams: 50, aiExplanationsEnabled: true },
    },
    {
      key: "pro-yearly", name: "Pro (Yearly)", priceCents: 19999, billingInterval: "YEAR" as const,
      description: "Unlimited exams and AI-powered explanations — two months free versus monthly.",
      entitlements: { maxActiveExams: 50, aiExplanationsEnabled: true },
    },
  ]

  const plans: Record<string, Awaited<ReturnType<typeof prisma.subscriptionPlan.upsert>>> = {}
  for (const seed of seeds) {
    const existed = await prisma.subscriptionPlan.findUnique({ where: { key: seed.key } })
    plans[seed.key] = await prisma.subscriptionPlan.upsert({
      where: { key: seed.key },
      update: {},
      create: seed,
    })
    if (!existed) {
      await prisma.adminAuditLog.create({
        data: { action: "SUBSCRIPTION_PLAN_CREATED", actorId: adminId, reason: `Seeded plan: ${seed.name}` },
      })
    }
  }
  return plans
}

async function seedCoupons(adminId: string) {
  const seeds = [
    { code: "WELCOME10", discountType: "PERCENT" as const, discountValue: 10, maxRedemptions: 100 },
    {
      code: "LAUNCH50", discountType: "FIXED_AMOUNT" as const, discountValue: 500,
      maxRedemptions: 20, expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  ]

  const coupons: Record<string, Awaited<ReturnType<typeof prisma.coupon.upsert>>> = {}
  for (const seed of seeds) {
    const existed = await prisma.coupon.findUnique({ where: { code: seed.code } })
    coupons[seed.code] = await prisma.coupon.upsert({
      where: { code: seed.code },
      update: {},
      create: seed,
    })
    if (!existed) {
      await prisma.adminAuditLog.create({
        data: { action: "COUPON_CREATED", actorId: adminId, reason: `Seeded coupon: ${seed.code}` },
      })
    }
  }
  return coupons
}

async function seedBilling(
  adminId: string,
  teacherAId: string,
  teacherBId: string,
  plans: Record<string, { id: string }>,
  coupons: Record<string, { id: string }>
) {
  // teacherA: an active Pro-Monthly subscription, paid with a 10%-off
  // welcome coupon (1999 - 10% = 1799).
  const existingSubA = await prisma.subscription.findFirst({
    where: { userId: teacherAId, planId: plans["pro-monthly"].id },
  })
  if (!existingSubA) {
    const now = new Date()
    const subA = await prisma.subscription.create({
      data: {
        userId: teacherAId, planId: plans["pro-monthly"].id, status: "ACTIVE",
        currentPeriodStart: now, currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        provider: "stripe", providerSubscriptionId: `sub_demo_${teacherAId.slice(0, 8)}`,
      },
    })
    const txA = await prisma.paymentTransaction.create({
      data: {
        userId: teacherAId, subscriptionId: subA.id, provider: "stripe",
        providerTransactionId: `pi_demo_${teacherAId.slice(0, 8)}`,
        amountCents: 1799, status: "SUCCEEDED",
      },
    })
    await prisma.couponRedemption.create({
      data: { couponId: coupons["WELCOME10"].id, userId: teacherAId, transactionId: txA.id },
    })
    await prisma.coupon.update({
      where: { id: coupons["WELCOME10"].id },
      data: { timesRedeemed: { increment: 1 } },
    })
  }

  // teacherB: a canceled Pro-Yearly subscription whose payment was later
  // refunded — the full cancel+refund admin workflow.
  const existingSubB = await prisma.subscription.findFirst({
    where: { userId: teacherBId, planId: plans["pro-yearly"].id },
  })
  if (!existingSubB) {
    const start = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    const subB = await prisma.subscription.create({
      data: {
        userId: teacherBId, planId: plans["pro-yearly"].id, status: "CANCELED",
        currentPeriodStart: start, currentPeriodEnd: new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000),
        canceledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        provider: "stripe", providerSubscriptionId: `sub_demo_${teacherBId.slice(0, 8)}`,
      },
    })
    const txB = await prisma.paymentTransaction.create({
      data: {
        userId: teacherBId, subscriptionId: subB.id, provider: "stripe",
        providerTransactionId: `pi_demo_${teacherBId.slice(0, 8)}`,
        amountCents: 19999, status: "REFUNDED",
        refundedAmountCents: 19999, refundedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        refundReason: "Customer canceled shortly after purchase.", refundedById: adminId,
      },
    })
    await prisma.adminAuditLog.create({
      data: {
        action: "PAYMENT_REFUNDED", actorId: adminId, targetUserId: teacherBId,
        reason: "Customer canceled shortly after purchase.",
        metadata: { transactionId: txB.id },
      },
    })
  }
}

// ─── Orchestration ──────────────────────────────────────────────────────

async function main() {
  const { admin, teacherA, teacherB, teacherPending, students } = await seedUsers()
  const { alice, bob, carol, dave, eve, frank, grace, henry, iris, jack } = students

  const { mathQuestions, physicsQuestions, csQuestions } = await seedQuestionBank(teacherA.id, teacherB.id)
  const { draftExam, upcomingExam, liveExam, championshipExam, reviewExam, archivedExam } =
    await seedExams(teacherA.id, teacherB.id)

  await attachQuestions(draftExam.id, mathQuestions.slice(0, 3))
  await attachQuestions(upcomingExam.id, physicsQuestions)
  await seedLiveQuizAttempt(liveExam, mathQuestions, alice.id)
  await seedChampionshipExam(championshipExam, csQuestions, { bob, carol, dave, eve, frank, grace, henry }, teacherB.id)
  await seedProvisionalReviewExam(
    reviewExam,
    [...mathQuestions.slice(0, 3), ...physicsQuestions.slice(0, 3)],
    iris.id,
    jack.id
  )
  await seedArchivedExam(archivedExam, mathQuestions, alice.id)
  await seedStreak(alice.id)

  const plans = await seedPlans(admin.id)
  const coupons = await seedCoupons(admin.id)
  await seedBilling(admin.id, teacherA.id, teacherB.id, plans, coupons)

  console.log(`\nSeeded accounts (all passwords: ${DEMO_PASSWORD}):`)
  console.log(`  SUPER_ADMIN: ${admin.email}`)
  console.log(`  TEACHER: ${teacherA.email} (verified)`)
  console.log(`  TEACHER: ${teacherB.email} (verified)`)
  console.log(`  TEACHER: ${teacherPending.email} (pending verification)`)
  for (const student of Object.values(students)) {
    console.log(`  STUDENT: ${student.email}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
