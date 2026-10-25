"use server"

import { z } from "zod"
import { prisma } from "@/lib/db"
import { assertRole, revokeAllSessions } from "@/lib/auth/guards"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import { recordAdminAction } from "@/lib/admin/audit"

/**
 * Every action here is ADMIN-only and leaves an AdminAuditLog row — see
 * lib/admin/audit.ts. None of this ever touches exam/grading/payment logic
 * directly; it only changes a User row's own fields (isActive,
 * teacherVerificationStatus) that those other systems already read.
 */

const reasonSchema = z.object({
  reason: z.string().trim().min(5, "Explain the reason for this action").max(1000),
})

export async function suspendUserAction(userId: string, _state: unknown, formData: FormData) {
  const admin = await assertRole("ADMIN")

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { error: "User not found" }
  if (target.role === "ADMIN") return { error: "Admin accounts can't be suspended from here" }
  if (!target.isActive) return { error: "This account is already suspended" }

  const parsed = reasonSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspendedReason: parsed.data.reason,
        suspendedById: admin.id,
      },
    })
    await recordAdminAction(tx, {
      action: "ACCOUNT_SUSPENDED",
      actorId: admin.id,
      targetUserId: userId,
      reason: parsed.data.reason,
    })
  })

  // Suspension takes effect immediately, not just on the account's next
  // login — an already-open session must stop working right now.
  await revokeAllSessions(userId)

  safeRevalidatePath("/admin/users")
  return { success: true }
}

export async function reinstateUserAction(userId: string) {
  const admin = await assertRole("ADMIN")

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { error: "User not found" }
  if (target.isActive) return { error: "This account isn't suspended" }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { isActive: true, suspendedAt: null, suspendedReason: null, suspendedById: null },
    })
    await recordAdminAction(tx, {
      action: "ACCOUNT_REINSTATED",
      actorId: admin.id,
      targetUserId: userId,
    })
  })

  safeRevalidatePath("/admin/users")
  return { success: true }
}

export async function verifyTeacherAction(userId: string, _state: unknown, formData: FormData) {
  const admin = await assertRole("ADMIN")

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { error: "User not found" }
  if (target.role !== "TEACHER") return { error: "Only teacher accounts can be verified" }

  const note = String(formData.get("note") ?? "").trim().slice(0, 1000) || null

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        teacherVerificationStatus: "VERIFIED",
        teacherVerifiedAt: new Date(),
        teacherVerifiedById: admin.id,
        teacherVerificationNote: note,
      },
    })
    await recordAdminAction(tx, {
      action: "TEACHER_VERIFIED",
      actorId: admin.id,
      targetUserId: userId,
      reason: note ?? undefined,
    })
  })

  safeRevalidatePath("/admin/teachers")
  return { success: true }
}

export async function rejectTeacherAction(userId: string, _state: unknown, formData: FormData) {
  const admin = await assertRole("ADMIN")

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { error: "User not found" }
  if (target.role !== "TEACHER") return { error: "Only teacher accounts can be verified" }

  const parsed = reasonSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        teacherVerificationStatus: "REJECTED",
        teacherVerifiedAt: new Date(),
        teacherVerifiedById: admin.id,
        teacherVerificationNote: parsed.data.reason,
      },
    })
    await recordAdminAction(tx, {
      action: "TEACHER_REJECTED",
      actorId: admin.id,
      targetUserId: userId,
      reason: parsed.data.reason,
    })
  })

  safeRevalidatePath("/admin/teachers")
  return { success: true }
}

export async function resetTeacherVerificationAction(userId: string) {
  const admin = await assertRole("ADMIN")

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { error: "User not found" }
  if (target.role !== "TEACHER") return { error: "Only teacher accounts can be verified" }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        teacherVerificationStatus: "PENDING",
        teacherVerifiedAt: null,
        teacherVerifiedById: null,
        teacherVerificationNote: null,
      },
    })
    await recordAdminAction(tx, {
      action: "TEACHER_VERIFICATION_RESET",
      actorId: admin.id,
      targetUserId: userId,
    })
  })

  safeRevalidatePath("/admin/teachers")
  return { success: true }
}
