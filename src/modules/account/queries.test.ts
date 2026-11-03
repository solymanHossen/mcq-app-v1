import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUniqueOrThrow: vi.fn(), count: vi.fn() },
    examAttempt: { findMany: vi.fn(), count: vi.fn() },
    xPTransaction: { aggregate: vi.fn() },
    exam: { findMany: vi.fn(), count: vi.fn() },
    question: { findMany: vi.fn() },
  },
}))

import { prisma } from "@/lib/prisma"
import type { Role, TeacherVerificationStatus } from "@/prisma/generated/prisma/client"
import { getFullProfileData } from "./queries"

function profileUser(role: Role, teacherVerificationStatus: TeacherVerificationStatus) {
  return {
    id: "profile-user-1",
    name: "Profile User",
    email: "profile@example.com",
    role,
    teacherVerificationStatus,
    teacherVerificationNote: null,
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    lastLoginAt: null,
    streak: null,
    badges: [],
    subscriptions: [],
    _count: { examAttempts: 0, questions: 0, exams: 0, bookmarks: 0, badges: 0 },
  }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe("getFullProfileData teacher applicants", () => {
  it.each([
    { role: "TEACHER", status: "PENDING" },
    { role: "TEACHER", status: "REJECTED" },
    { role: "STUDENT", status: "PENDING" },
  ] as const)(
    "keeps the student profile, attempts, and XP for $role / $status",
    async ({ role, status }) => {
      const user = profileUser(role, status)
      const attempts = [{
        id: "attempt-1",
        status: "SUBMITTED",
        startedAt: new Date("2026-01-02T00:00:00Z"),
        submittedAt: new Date("2026-01-02T00:10:00Z"),
        exam: { id: "exam-1", title: "Student Exam" },
        result: null,
      }]
      vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue(user as never)
      vi.mocked(prisma.examAttempt.findMany).mockResolvedValue(attempts as never)
      vi.mocked(prisma.xPTransaction.aggregate).mockResolvedValue({ _sum: { amount: 75 } } as never)

      const profile = await getFullProfileData(user.id)

      expect(profile.role).toBe("STUDENT")
      expect(profile.teacherVerificationStatus).toBe(status)
      expect(profile.recentAttempts).toEqual(attempts)
      expect(profile.xpTotal).toBe(75)
      expect(profile.teacherExams).toEqual([])
      expect(prisma.examAttempt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { studentId: user.id }, take: 5 }),
      )
      expect(prisma.xPTransaction.aggregate).toHaveBeenCalledWith({
        where: { studentId: user.id },
        _sum: { amount: true },
      })
      expect(prisma.exam.findMany).not.toHaveBeenCalled()
      expect(prisma.question.findMany).not.toHaveBeenCalled()
      expect(user.role).toBe(role)
    },
  )

  it("keeps the teacher profile and authored data after approval", async () => {
    const user = profileUser("TEACHER", "VERIFIED")
    const exam = {
      id: "authored-exam-1",
      title: "Teacher Exam",
      description: null,
      status: "PUBLISHED",
      durationMinutes: 30,
      _count: { attempts: 9, examQuestions: 5 },
    }
    vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue(user as never)
    vi.mocked(prisma.exam.findMany).mockResolvedValue([exam] as never)
    vi.mocked(prisma.examAttempt.count).mockResolvedValue(9 as never)
    vi.mocked(prisma.question.findMany).mockResolvedValue([{ subject: "Math" }] as never)

    const profile = await getFullProfileData(user.id)

    expect(profile.role).toBe("TEACHER")
    expect(profile.teacherVerificationStatus).toBe("VERIFIED")
    expect(profile.teacherExams).toEqual([{
      id: exam.id,
      title: exam.title,
      description: null,
      status: exam.status,
      durationMinutes: 30,
      attemptsCount: 9,
      questionsCount: 5,
    }])
    expect(profile.teacherTotalAttempts).toBe(9)
    expect(profile.teacherSubjects).toEqual(["Math"])
    expect(prisma.exam.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { teacherId: user.id } }),
    )
    expect(prisma.xPTransaction.aggregate).not.toHaveBeenCalled()
    expect(prisma.examAttempt.findMany).not.toHaveBeenCalled()
  })
})
