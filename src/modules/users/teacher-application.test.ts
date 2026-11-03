import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Role, TeacherVerificationStatus } from "@/prisma/generated/prisma/client"

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  exam: { findUnique: vi.fn() },
  examQuestion: { findMany: vi.fn() },
  examAttempt: {
    count: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  attemptAnswer: { createMany: vi.fn(), updateMany: vi.fn() },
  $transaction: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))
vi.mock("@/lib/prisma", () => ({ prisma: db }))
vi.mock("@/lib/safe-revalidate", () => ({ safeRevalidatePath: vi.fn() }))
vi.mock("@/lib/admin-audit", () => ({ recordAdminAction: vi.fn() }))
vi.mock("next/server", () => ({ connection: vi.fn() }))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => { throw new Error(`NEXT_REDIRECT:${path}`) }),
}))
vi.mock("@/modules/grading/finalize", () => ({ finalizeAndGradeAttempt: vi.fn() }))
vi.mock("@/modules/proctoring/rate-detection", () => ({
  recordRequestAndCheckSuspicious: vi.fn().mockResolvedValue(false),
}))
vi.mock("@/modules/proctoring/record", () => ({ recordViolationEvent: vi.fn() }))
vi.mock("@/modules/learning/streak", () => ({ recordDailyActivity: vi.fn() }))
vi.mock("@/modules/learning/xp", () => ({ awardXP: vi.fn(), XP_PER_STREAK_DAY: 5 }))
vi.mock("@/modules/learning/badges", () => ({ evaluateBadgesAfterStreakUpdate: vi.fn() }))

import { auth } from "@/lib/auth"
import { recordAdminAction } from "@/lib/admin-audit"
import { ForbiddenError } from "@/lib/errors"
import { applyForTeacherRoleAction, verifyTeacherAction } from "./actions"
import { startAttemptAction, saveAnswerAction, submitAttemptAction } from "@/modules/attempts/actions"
import { finalizeAndGradeAttempt } from "@/modules/grading/finalize"
import { recordDailyActivity } from "@/modules/learning/streak"

type TestUser = {
  id: string
  name: string
  email: string
  role: Role
  isGuest: boolean
  isActive: boolean
  tokenVersion: number
  teacherVerificationStatus: TeacherVerificationStatus
  institution: string | null
}

const applicantId = "00000000-0000-4000-8000-000000000001"
const attemptId = "00000000-0000-4000-8000-000000000002"
const questionId = "00000000-0000-4000-8000-000000000003"
const users = new Map<string, TestUser>()

function addUser(id: string, role: Role): TestUser {
  const user: TestUser = {
    id,
    name: "Applicant",
    email: `${id}@example.com`,
    role,
    isGuest: false,
    isActive: true,
    tokenVersion: 0,
    teacherVerificationStatus: "PENDING",
    institution: null,
  }
  users.set(id, user)
  return user
}

function signIn(user: TestUser) {
  vi.mocked(auth).mockResolvedValue({
    user: { id: user.id, role: user.role, tokenVersion: user.tokenVersion },
    expires: "",
  } as never)
}

function applicationForm() {
  const data = new FormData()
  data.set("institution", "  Example College  ")
  data.set("department", "  Mathematics  ")
  data.set("bio", "  Qualified mathematics instructor with teaching experience.  ")
  return data
}

function answerInput() {
  return {
    attemptId,
    examQuestionId: questionId,
    selectedOption: "A",
    clientUpdatedAt: new Date(Date.now() + 1000),
    sessionToken: "student-browser-session",
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  users.clear()
  db.user.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) =>
    users.get(where.id) ?? null,
  )
  db.user.update.mockImplementation(async ({ where, data }: {
    where: { id: string }
    data: Partial<TestUser>
  }) => {
    const current = users.get(where.id)
    if (!current) throw new Error("Test user not found")
    const updated = { ...current, ...data }
    users.set(where.id, updated)
    return updated
  })
  db.$transaction.mockImplementation(async (run: (tx: typeof db) => Promise<unknown>) => run(db))

  db.exam.findUnique.mockResolvedValue({
    id: "exam-1",
    status: "PUBLISHED",
    durationMinutes: 60,
    maxAttempts: 1,
    webcamMonitoringRequired: false,
  })
  db.examQuestion.findMany.mockResolvedValue([{ id: questionId }])
  db.examAttempt.findFirst.mockResolvedValue(null)
  db.examAttempt.count.mockResolvedValue(0)
  db.examAttempt.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
    const attempt = { id: attemptId, status: "IN_PROGRESS", ...data }
    db.examAttempt.findUnique.mockResolvedValue(attempt)
    return attempt
  })
  db.attemptAnswer.createMany.mockResolvedValue({ count: 1 })
  db.attemptAnswer.updateMany.mockResolvedValue({ count: 1 })
  vi.mocked(finalizeAndGradeAttempt).mockResolvedValue({ graded: true } as never)
  vi.mocked(recordDailyActivity).mockResolvedValue({ isNewDay: false } as never)
})

async function completeStudentExam() {
  await expect(startAttemptAction("exam-1")).resolves.toEqual({ attemptId })
  await expect(saveAnswerAction(answerInput())).resolves.toEqual({ success: true, applied: true })
  await expect(submitAttemptAction(attemptId)).resolves.toEqual({ success: true, status: "COMPLETED" })
  expect(db.examAttempt.create).toHaveBeenCalledWith({
    data: expect.objectContaining({ studentId: applicantId }),
  })
  expect(db.attemptAnswer.updateMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ attemptId, examQuestionId: questionId }),
    data: expect.objectContaining({ selectedOption: "A" }),
  }))
  expect(finalizeAndGradeAttempt).toHaveBeenCalledWith(attemptId, "COMPLETED")
}

describe("student access during teacher applications", () => {
  it("keeps a new applicant as a student and allows an exam through submission", async () => {
    signIn(addUser(applicantId, "STUDENT"))

    await expect(applyForTeacherRoleAction(undefined, applicationForm())).resolves.toEqual({ success: true })
    expect(users.get(applicantId)).toMatchObject({
      role: "STUDENT",
      teacherVerificationStatus: "PENDING",
      institution: "Example College",
      department: "Mathematics",
    })

    await completeStudentExam()
  })

  it("allows an existing pending teacher applicant to start, save and submit an exam", async () => {
    signIn(addUser(applicantId, "TEACHER"))
    await completeStudentExam()
  })

  it("still validates application details before changing the account", async () => {
    signIn(addUser(applicantId, "STUDENT"))
    const invalid = applicationForm()
    invalid.set("bio", "short")

    const result = await applyForTeacherRoleAction(undefined, invalid)
    expect(result).toEqual({ error: expect.stringMatching(/min 10 characters/) })
    expect(db.user.update).not.toHaveBeenCalled()
  })

  it("promotes an approved student applicant and stops student exam actions with the existing session", async () => {
    const student = addUser(applicantId, "STUDENT")
    signIn(student)
    await applyForTeacherRoleAction(undefined, applicationForm())

    const admin = addUser("admin-1", "ADMIN")
    signIn(admin)
    const note = new FormData()
    note.set("note", "Credentials checked")
    await expect(verifyTeacherAction(applicantId, undefined, note)).resolves.toEqual({ success: true })
    expect(users.get(applicantId)).toMatchObject({
      role: "TEACHER",
      teacherVerificationStatus: "VERIFIED",
      teacherVerifiedById: admin.id,
    })
    expect(recordAdminAction).toHaveBeenCalledWith(db, expect.objectContaining({
      action: "TEACHER_VERIFIED",
      actorId: admin.id,
      targetUserId: applicantId,
    }))

    // The cookie still has the student's original role; guards read the approved DB record.
    signIn(student)
    await expect(startAttemptAction("exam-1")).rejects.toThrow(ForbiddenError)
    await expect(saveAnswerAction(answerInput())).rejects.toThrow(ForbiddenError)
    await expect(submitAttemptAction(attemptId)).rejects.toThrow(ForbiddenError)
  })

  it("does not allow a pending applicant to approve their own application", async () => {
    signIn(addUser(applicantId, "TEACHER"))
    await expect(verifyTeacherAction(applicantId, undefined, new FormData())).rejects.toThrow(ForbiddenError)
    expect(db.user.update).not.toHaveBeenCalled()
  })

  it("preserves attempt ownership checks for pending teacher applicants", async () => {
    signIn(addUser(applicantId, "TEACHER"))
    await startAttemptAction("exam-1")
    signIn(addUser("other-applicant", "TEACHER"))

    await expect(saveAnswerAction(answerInput())).resolves.toEqual({ error: "Not your attempt" })
    await expect(submitAttemptAction(attemptId)).resolves.toEqual({ error: "Not your attempt" })
    expect(db.attemptAnswer.updateMany).not.toHaveBeenCalled()
    expect(finalizeAndGradeAttempt).not.toHaveBeenCalled()
  })
})
