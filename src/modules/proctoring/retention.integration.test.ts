import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { purgeExpiredViolationEvents, VIOLATION_RETENTION_DAYS } from "./retention"

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

let teacher: Awaited<ReturnType<typeof makeUser>>
let student: Awaited<ReturnType<typeof makeUser>>

const OLD_CUTOFF = new Date(
  Date.now() - (VIOLATION_RETENTION_DAYS + 10) * 24 * 60 * 60 * 1000
)
const RECENT = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)

async function makeAttemptWithEvent(opts: {
  examStatus: "PUBLISHED" | "ARCHIVED"
  archivedAt?: Date | null
  pendingAppeal?: boolean
}) {
  const exam = await prisma.exam.create({
    data: {
      teacherId: teacher.id,
      title: `retention exam ${suffix}-${Math.random()}`,
      durationMinutes: 60,
      status: opts.examStatus,
      publishedAt: new Date(),
      archivedAt: opts.archivedAt ?? null,
    },
  })
  examIds.push(exam.id)

  const now = new Date()
  const attempt = await prisma.examAttempt.create({
    data: {
      examId: exam.id,
      studentId: student.id,
      attemptNumber: 1,
      status: "COMPLETED",
      startedAt: now,
      deadline: new Date(now.getTime() + 60 * 60_000),
      submittedAt: now,
    },
  })

  await prisma.violationEvent.create({
    data: {
      attemptId: attempt.id,
      studentId: student.id,
      type: "TAB_SWITCH",
      source: "CLIENT_REPORTED",
      severity: "LOW",
    },
  })

  if (opts.pendingAppeal) {
    await prisma.violationAppeal.create({
      data: {
        attemptId: attempt.id,
        studentId: student.id,
        explanation: "Please review this disqualification decision",
        status: "PENDING",
      },
    })
  }

  return { exam, attempt }
}

beforeAll(async () => {
  teacher = await makeUser("TEACHER", "retention-teacher")
  student = await makeUser("STUDENT", "retention-student")
})

afterAll(async () => {
  await prisma.violationAppeal.deleteMany({
    where: { attempt: { examId: { in: examIds } } },
  })
  await prisma.violationEvent.deleteMany({
    where: { attempt: { examId: { in: examIds } } },
  })
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("purgeExpiredViolationEvents", () => {
  it("purges events for an archived exam well past the retention window", async () => {
    const { attempt } = await makeAttemptWithEvent({
      examStatus: "ARCHIVED",
      archivedAt: OLD_CUTOFF,
    })

    const { purged } = await purgeExpiredViolationEvents()
    expect(purged).toBeGreaterThanOrEqual(1)

    const remaining = await prisma.violationEvent.findMany({
      where: { attemptId: attempt.id },
    })
    expect(remaining).toHaveLength(0)
  })

  it("does not purge events for a non-archived (still PUBLISHED) exam", async () => {
    const { attempt } = await makeAttemptWithEvent({ examStatus: "PUBLISHED" })

    await purgeExpiredViolationEvents()

    const remaining = await prisma.violationEvent.findMany({
      where: { attemptId: attempt.id },
    })
    expect(remaining).toHaveLength(1)
  })

  it("does not purge events for a recently archived exam (within the retention window)", async () => {
    const { attempt } = await makeAttemptWithEvent({
      examStatus: "ARCHIVED",
      archivedAt: RECENT,
    })

    await purgeExpiredViolationEvents()

    const remaining = await prisma.violationEvent.findMany({
      where: { attemptId: attempt.id },
    })
    expect(remaining).toHaveLength(1)
  })

  it("never purges an attempt with a pending appeal, regardless of age", async () => {
    const { attempt } = await makeAttemptWithEvent({
      examStatus: "ARCHIVED",
      archivedAt: OLD_CUTOFF,
      pendingAppeal: true,
    })

    await purgeExpiredViolationEvents()

    const remaining = await prisma.violationEvent.findMany({
      where: { attemptId: attempt.id },
    })
    expect(remaining).toHaveLength(1)
  })
})
