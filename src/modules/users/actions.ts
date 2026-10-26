"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertRole, ADMIN_ROLES, isAdminTier, revokeAllSessions } from "@/lib/authorization"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import { recordAdminAction } from "@/lib/admin-audit"

/**
 * Every action here is admin-tier-only (ADMIN or SUPER_ADMIN) and leaves an
 * AdminAuditLog row — see lib/admin/audit.ts. None of this ever touches
 * exam/grading/payment logic directly; it only changes a User row's own
 * fields (isActive, role, teacherVerificationStatus) that those other
 * systems already read.
 */

const reasonSchema = z.object({
  reason: z.string().trim().min(5, "Explain the reason for this action").max(1000),
})

const roleChangeSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"]),
  reason: z.string().trim().min(5, "Explain the reason for this change").max(1000),
})

export async function suspendUserAction(userId: string, _state: unknown, formData: FormData) {
  const admin = await assertRole(...ADMIN_ROLES)

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { error: "User not found" }
  if (isAdminTier(target.role)) return { error: "Admin accounts can't be suspended from here" }
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
  const admin = await assertRole(...ADMIN_ROLES)

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

export async function changeUserRoleAction(userId: string, _state: unknown, formData: FormData) {
  const admin = await assertRole(...ADMIN_ROLES)

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { error: "User not found" }

  const parsed = roleChangeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" }

  const { role: newRole, reason } = parsed.data
  if (newRole === target.role) return { error: "User already has this role" }

  // Assigning or removing an admin-tier role is reserved for SUPER_ADMIN —
  // a plain ADMIN can promote/demote between TEACHER and STUDENT freely, but
  // can't grant (or take away) the tier they're both members of.
  if (admin.role !== "SUPER_ADMIN" && (isAdminTier(target.role) || isAdminTier(newRole))) {
    return { error: "Only a super admin can assign or change admin-tier roles" }
  }

  // The only invariant this guards: never end up with zero super admins —
  // the role that alone can create or restore one. A super admin stepping
  // down (even out of their own account) is fine as long as another one
  // remains to take over; this also covers "can I change my own role"
  // without a separate self-check, since the sole remaining super admin
  // changing their own role is exactly the superAdminCount <= 1 case.
  if (target.role === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } })
    if (superAdminCount <= 1) return { error: "Can't remove the last remaining super admin" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        role: newRole,
        // Moving someone into TEACHER always starts a fresh verification
        // cycle — a prior VERIFIED/REJECTED status (from an earlier stint as
        // a teacher, or a stale default) shouldn't carry over silently.
        ...(newRole === "TEACHER" && target.role !== "TEACHER"
          ? {
              teacherVerificationStatus: "PENDING",
              teacherVerifiedAt: null,
              teacherVerifiedById: null,
              teacherVerificationNote: null,
            }
          : {}),
      },
    })
    await recordAdminAction(tx, {
      action: "USER_ROLE_CHANGED",
      actorId: admin.id,
      targetUserId: userId,
      reason,
      metadata: { fromRole: target.role, toRole: newRole },
    })
  })

  safeRevalidatePath("/admin/users")
  return { success: true }
}

export async function verifyTeacherAction(userId: string, _state: unknown, formData: FormData) {
  const admin = await assertRole(...ADMIN_ROLES)

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
  const admin = await assertRole(...ADMIN_ROLES)

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
  const admin = await assertRole(...ADMIN_ROLES)

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
