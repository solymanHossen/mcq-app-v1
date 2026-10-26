"use server"

import { prisma } from "@/lib/prisma"
import { assertRole } from "@/lib/authorization"
import { recordAdminAction } from "@/lib/admin-audit"
import { safeRevalidatePath } from "@/lib/safe-revalidate"

/**
 * Both toggles here are SUPER_ADMIN-only — stricter than the ADMIN_ROLES
 * used by the rest of modules/users/actions.ts. This is platform-wide
 * verification policy, not an action on one user's own account, so a plain
 * ADMIN can't touch it (the admin layout still lets them reach /admin, but
 * the settings page and these actions reject anyone below SUPER_ADMIN).
 */

export async function setRequireEmailVerificationAction(enabled: boolean) {
  const admin = await assertRole("SUPER_ADMIN")

  const current = await prisma.systemSettings.findUnique({ where: { id: "global" } })
  const previousValue = current?.requireEmailVerification ?? true
  if (previousValue === enabled) return { success: true as const }

  await prisma.$transaction(async (tx) => {
    await tx.systemSettings.upsert({
      where: { id: "global" },
      update: { requireEmailVerification: enabled, updatedById: admin.id },
      create: { id: "global", requireEmailVerification: enabled, updatedById: admin.id },
    })
    await recordAdminAction(tx, {
      action: "SYSTEM_SETTINGS_UPDATED",
      actorId: admin.id,
      metadata: { field: "requireEmailVerification", from: previousValue, to: enabled },
    })
  })

  safeRevalidatePath("/admin/settings")
  return { success: true as const }
}

export async function setRequireTeacherVerificationAction(enabled: boolean) {
  const admin = await assertRole("SUPER_ADMIN")

  const current = await prisma.systemSettings.findUnique({ where: { id: "global" } })
  const previousValue = current?.requireTeacherVerification ?? true
  if (previousValue === enabled) return { success: true as const }

  await prisma.$transaction(async (tx) => {
    await tx.systemSettings.upsert({
      where: { id: "global" },
      update: { requireTeacherVerification: enabled, updatedById: admin.id },
      create: { id: "global", requireTeacherVerification: enabled, updatedById: admin.id },
    })
    await recordAdminAction(tx, {
      action: "SYSTEM_SETTINGS_UPDATED",
      actorId: admin.id,
      metadata: { field: "requireTeacherVerification", from: previousValue, to: enabled },
    })
  })

  safeRevalidatePath("/admin/settings")
  return { success: true as const }
}
