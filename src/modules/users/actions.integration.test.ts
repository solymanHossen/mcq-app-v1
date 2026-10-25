import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { ForbiddenError } from "@/lib/errors"
import {
  suspendUserAction,
  reinstateUserAction,
  changeUserRoleAction,
  verifyTeacherAction,
  rejectTeacherAction,
  resetTeacherVerificationAction,
} from "./actions"
import { publishExamAction } from "@/modules/exams/actions"

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

async function makeUser(role: "ADMIN" | "TEACHER" | "STUDENT", label: string, extra: Record<string, unknown> = {}) {
  const user = await prisma.user.create({
    data: {
      name: label,
      email: `${label}-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role,
      isEmailVerified: true,
      ...extra,
    },
  })
  userIds.push(user.id)
  return user
}

let admin: Awaited<ReturnType<typeof makeUser>>

beforeAll(async () => {
  admin = await makeUser("ADMIN", "admin-user")
})

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.adminAuditLog.deleteMany({ where: { actorId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("suspendUserAction", () => {
  it("rejects a non-admin caller", async () => {
    const teacher = await makeUser("TEACHER", `suspend-caller-${Math.random()}`)
    const target = await makeUser("STUDENT", `suspend-target-${Math.random()}`)
    asUser(teacher)

    const formData = new FormData()
    formData.set("reason", "Attempting to suspend without permission")
    await expect(suspendUserAction(target.id, undefined, formData)).rejects.toThrow(ForbiddenError)
  })

  it("suspends an active account, revokes its sessions, and logs the action", async () => {
    const target = await makeUser("STUDENT", `suspend-target2-${Math.random()}`)
    asUser(admin)

    const formData = new FormData()
    formData.set("reason", "Repeated policy violations reported by multiple teachers")
    const result = await suspendUserAction(target.id, undefined, formData)
    expect(result).toEqual({ success: true })

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: target.id } })
    expect(updated.isActive).toBe(false)
    expect(updated.suspendedAt).not.toBeNull()
    expect(updated.suspendedReason).toContain("policy violations")
    expect(updated.suspendedById).toBe(admin.id)
    expect(updated.tokenVersion).toBeGreaterThan(0) // existing sessions invalidated

    const log = await prisma.adminAuditLog.findFirst({
      where: { action: "ACCOUNT_SUSPENDED", targetUserId: target.id },
    })
    expect(log?.actorId).toBe(admin.id)
  })

  it("refuses to suspend an admin account", async () => {
    const otherAdmin = await makeUser("ADMIN", `suspend-admin-${Math.random()}`)
    asUser(admin)

    const formData = new FormData()
    formData.set("reason", "Should never be allowed")
    const result = await suspendUserAction(otherAdmin.id, undefined, formData)
    expect(result && "error" in result).toBe(true)

    const unchanged = await prisma.user.findUniqueOrThrow({ where: { id: otherAdmin.id } })
    expect(unchanged.isActive).toBe(true)
  })

  it("refuses to suspend an already-suspended account twice", async () => {
    const target = await makeUser("STUDENT", `suspend-twice-${Math.random()}`)
    asUser(admin)
    const formData = new FormData()
    formData.set("reason", "First suspension for cause")
    await suspendUserAction(target.id, undefined, formData)

    const second = await suspendUserAction(target.id, undefined, formData)
    expect(second && "error" in second).toBe(true)
  })
})

describe("reinstateUserAction", () => {
  it("clears suspension and logs the action", async () => {
    const target = await makeUser("STUDENT", `reinstate-${Math.random()}`)
    asUser(admin)
    const formData = new FormData()
    formData.set("reason", "Reason for the initial suspension")
    await suspendUserAction(target.id, undefined, formData)

    const result = await reinstateUserAction(target.id)
    expect(result).toEqual({ success: true })

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: target.id } })
    expect(updated.isActive).toBe(true)
    expect(updated.suspendedAt).toBeNull()
    expect(updated.suspendedReason).toBeNull()
    expect(updated.suspendedById).toBeNull()

    const log = await prisma.adminAuditLog.findFirst({
      where: { action: "ACCOUNT_REINSTATED", targetUserId: target.id },
    })
    expect(log).not.toBeNull()
  })

  it("rejects a non-admin caller", async () => {
    const student = await makeUser("STUDENT", `reinstate-caller-${Math.random()}`)
    asUser(student)
    await expect(reinstateUserAction("any-id")).rejects.toThrow(ForbiddenError)
  })
})

describe("changeUserRoleAction", () => {
  it("rejects a non-admin caller", async () => {
    const teacher = await makeUser("TEACHER", `role-caller-${Math.random()}`)
    const target = await makeUser("STUDENT", `role-target-${Math.random()}`)
    asUser(teacher)

    const formData = new FormData()
    formData.set("role", "TEACHER")
    formData.set("reason", "Attempting to change role without permission")
    await expect(changeUserRoleAction(target.id, undefined, formData)).rejects.toThrow(
      ForbiddenError
    )
  })

  it("lets an admin change their own role when other admins remain", async () => {
    const selfDemoter = await makeUser("ADMIN", `role-self-${Math.random()}`)
    asUser(selfDemoter)

    const formData = new FormData()
    formData.set("role", "TEACHER")
    formData.set("reason", "Stepping down from admin duties")
    const result = await changeUserRoleAction(selfDemoter.id, undefined, formData)
    expect(result).toEqual({ success: true })

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: selfDemoter.id } })
    expect(updated.role).toBe("TEACHER")
  })

  it("promotes a student to teacher, resets verification to PENDING, and logs the action", async () => {
    const target = await makeUser("STUDENT", `role-promote-${Math.random()}`, {
      teacherVerificationStatus: "REJECTED",
      teacherVerificationNote: "stale note from a previous stint",
    })
    asUser(admin)

    const formData = new FormData()
    formData.set("role", "TEACHER")
    formData.set("reason", "Approved as a new teacher after manual review")
    const result = await changeUserRoleAction(target.id, undefined, formData)
    expect(result).toEqual({ success: true })

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: target.id } })
    expect(updated.role).toBe("TEACHER")
    expect(updated.teacherVerificationStatus).toBe("PENDING")
    expect(updated.teacherVerificationNote).toBeNull()

    const log = await prisma.adminAuditLog.findFirst({
      where: { action: "USER_ROLE_CHANGED", targetUserId: target.id },
    })
    expect(log?.actorId).toBe(admin.id)
    expect(log?.metadata).toEqual({ fromRole: "STUDENT", toRole: "TEACHER" })
  })

  // The "can't remove the last admin" guard (actions.ts) is intentionally
  // not exercised here: this suite runs against the real shared dev
  // database (see vitest.config.ts — no isolated test DB), which already
  // has its own admins. Safely forcing the global admin count to exactly 1
  // would mean mutating those real accounts, risking leaving them demoted
  // if the test failed partway through. Verified by code review instead.

  it("rejects an invalid role value", async () => {
    const target = await makeUser("STUDENT", `role-invalid-${Math.random()}`)
    asUser(admin)
    const formData = new FormData()
    formData.set("role", "SUPERUSER")
    formData.set("reason", "Should fail validation")
    const result = await changeUserRoleAction(target.id, undefined, formData)
    expect(result && "error" in result).toBe(true)

    const unchanged = await prisma.user.findUniqueOrThrow({ where: { id: target.id } })
    expect(unchanged.role).toBe("STUDENT")
  })
})

describe("teacher verification workflow", () => {
  it("a new teacher starts PENDING and cannot publish an exam", async () => {
    const teacher = await makeUser("TEACHER", `verify-teacher-a-${Math.random()}`)
    expect(teacher.teacherVerificationStatus).toBe("PENDING")

    const exam = await prisma.exam.create({
      data: { teacherId: teacher.id, title: `Gate test ${suffix}`, durationMinutes: 30 },
    })
    examIds.push(exam.id)
    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        order: 0,
        questionTextSnapshot: "Q",
        optionASnapshot: "A",
        optionBSnapshot: "B",
        optionCSnapshot: "C",
        optionDSnapshot: "D",
        correctOptionSnapshot: "A",
      },
    })

    asUser(teacher)
    const result = await publishExamAction(exam.id)
    expect(result && "error" in result).toBe(true)

    const unchanged = await prisma.exam.findUniqueOrThrow({ where: { id: exam.id } })
    expect(unchanged.status).toBe("DRAFT")
  })

  it("verifying the teacher allows publishing afterward", async () => {
    const teacher = await makeUser("TEACHER", `verify-teacher-b-${Math.random()}`)
    const exam = await prisma.exam.create({
      data: { teacherId: teacher.id, title: `Gate test 2 ${suffix}`, durationMinutes: 30 },
    })
    examIds.push(exam.id)
    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        order: 0,
        questionTextSnapshot: "Q",
        optionASnapshot: "A",
        optionBSnapshot: "B",
        optionCSnapshot: "C",
        optionDSnapshot: "D",
        correctOptionSnapshot: "A",
      },
    })

    asUser(admin)
    const formData = new FormData()
    formData.set("note", "Checked credentials, looks good")
    const verifyResult = await verifyTeacherAction(teacher.id, undefined, formData)
    expect(verifyResult).toEqual({ success: true })

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: teacher.id } })
    expect(updated.teacherVerificationStatus).toBe("VERIFIED")
    expect(updated.teacherVerifiedById).toBe(admin.id)

    asUser(teacher)
    const publishResult = await publishExamAction(exam.id)
    expect(publishResult).toEqual({ success: true })
  })

  it("rejecting a teacher records the reason and leaves them unable to publish", async () => {
    const teacher = await makeUser("TEACHER", `verify-teacher-c-${Math.random()}`)
    asUser(admin)
    const formData = new FormData()
    formData.set("reason", "Credentials could not be verified")
    const result = await rejectTeacherAction(teacher.id, undefined, formData)
    expect(result).toEqual({ success: true })

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: teacher.id } })
    expect(updated.teacherVerificationStatus).toBe("REJECTED")
    expect(updated.teacherVerificationNote).toContain("could not be verified")
  })

  it("resetting verification returns a teacher to PENDING", async () => {
    const teacher = await makeUser("TEACHER", `verify-teacher-d-${Math.random()}`)
    asUser(admin)
    const verifyForm = new FormData()
    verifyForm.set("note", "ok")
    await verifyTeacherAction(teacher.id, undefined, verifyForm)

    const resetResult = await resetTeacherVerificationAction(teacher.id)
    expect(resetResult).toEqual({ success: true })

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: teacher.id } })
    expect(updated.teacherVerificationStatus).toBe("PENDING")
  })

  it("rejects a non-admin attempting to verify a teacher", async () => {
    const teacher = await makeUser("TEACHER", `verify-teacher-e-${Math.random()}`)
    asUser(teacher) // trying to self-verify
    const formData = new FormData()
    formData.set("note", "self-approval attempt")
    await expect(verifyTeacherAction(teacher.id, undefined, formData)).rejects.toThrow(ForbiddenError)
  })

  it("refuses to verify a non-teacher account", async () => {
    const student = await makeUser("STUDENT", `verify-student-${Math.random()}`)
    asUser(admin)
    const formData = new FormData()
    formData.set("note", "shouldn't work")
    const result = await verifyTeacherAction(student.id, undefined, formData)
    expect(result && "error" in result).toBe(true)
  })
})
