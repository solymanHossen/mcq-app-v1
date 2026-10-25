import { afterAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { recordDailyActivity } from "./streak"

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []

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

afterAll(async () => {
  await prisma.userStreak.deleteMany({ where: { studentId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("recordDailyActivity", () => {
  it("creates a streak of 1 on a student's first-ever activity", async () => {
    const student = await makeStudent("streak-a")
    const result = await recordDailyActivity(student.id, "UTC", new Date("2026-02-01T10:00:00Z"))

    expect(result.currentStreak).toBe(1)
    expect(result.isNewDay).toBe(true)

    const row = await prisma.userStreak.findUniqueOrThrow({ where: { studentId: student.id } })
    expect(row.currentStreak).toBe(1)
    expect(row.lastActiveDate).toBe("2026-02-01")
  })

  it("is idempotent: repeated calls the same local day never inflate the streak", async () => {
    const student = await makeStudent("streak-b")
    const day = new Date("2026-02-01T10:00:00Z")

    await recordDailyActivity(student.id, "UTC", day)
    await recordDailyActivity(student.id, "UTC", new Date("2026-02-01T18:00:00Z"))
    const third = await recordDailyActivity(student.id, "UTC", new Date("2026-02-01T23:59:00Z"))

    expect(third.isNewDay).toBe(false)
    const row = await prisma.userStreak.findUniqueOrThrow({ where: { studentId: student.id } })
    expect(row.currentStreak).toBe(1)
  })

  it("extends the streak on consecutive local days and resets after a gap", async () => {
    const student = await makeStudent("streak-c")

    await recordDailyActivity(student.id, "UTC", new Date("2026-02-01T10:00:00Z"))
    await recordDailyActivity(student.id, "UTC", new Date("2026-02-02T10:00:00Z"))
    const third = await recordDailyActivity(student.id, "UTC", new Date("2026-02-03T10:00:00Z"))
    expect(third.currentStreak).toBe(3)

    // a 3-day gap
    const afterGap = await recordDailyActivity(student.id, "UTC", new Date("2026-02-07T10:00:00Z"))
    expect(afterGap.currentStreak).toBe(1)

    const row = await prisma.userStreak.findUniqueOrThrow({ where: { studentId: student.id } })
    expect(row.longestStreak).toBe(3) // the earlier record survives the reset
  })

  it("uses the student's own timezone to decide the day boundary, not UTC", async () => {
    const student = await makeStudent("streak-d")

    // 2026-02-01T23:30:00Z is already 2026-02-02 in Asia/Dhaka (UTC+6).
    await recordDailyActivity(student.id, "Asia/Dhaka", new Date("2026-02-01T23:30:00Z"))
    const second = await recordDailyActivity(
      student.id,
      "Asia/Dhaka",
      new Date("2026-02-02T01:00:00Z") // same Dhaka calendar day, different UTC day
    )

    // Still the same local day in Dhaka — this must be a no-op, not a second day.
    expect(second.isNewDay).toBe(false)
    expect(second.currentStreak).toBe(1)
  })

  it("falls back to UTC when no client timezone is provided", async () => {
    const student = await makeStudent("streak-e")
    const result = await recordDailyActivity(student.id, undefined, new Date("2026-02-01T10:00:00Z"))
    expect(result.timezone).toBe("UTC")
  })
})
