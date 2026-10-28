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

// Independent of the two toggles above — this is "is the platform paid or
// free for everyone", not a verification policy. assertRole("SUPER_ADMIN")
// for the same reason as the verification toggles: platform-wide monetary
// policy, not an action on one user's own account.
export async function setBillingEnabledAction(enabled: boolean) {
  const admin = await assertRole("SUPER_ADMIN")

  const current = await prisma.systemSettings.findUnique({ where: { id: "global" } })
  const previousValue = current?.billingEnabled ?? true
  if (previousValue === enabled) return { success: true as const }

  await prisma.$transaction(async (tx) => {
    await tx.systemSettings.upsert({
      where: { id: "global" },
      update: { billingEnabled: enabled, updatedById: admin.id },
      create: { id: "global", billingEnabled: enabled, updatedById: admin.id },
    })
    await recordAdminAction(tx, {
      action: "SYSTEM_SETTINGS_UPDATED",
      actorId: admin.id,
      metadata: { field: "billingEnabled", from: previousValue, to: enabled },
    })
  })

  safeRevalidatePath("/admin/settings")
  safeRevalidatePath("/billing")
  return { success: true as const }
}

export type UpdateHeroBrandingInput = {
  logoUrl?: string | null
  heroImageUrl?: string | null
  heroVideoUrl?: string | null
  heroTitle?: string | null
  heroSubtitle?: string | null
}

export async function updateHeroBrandingSettingsAction(input: UpdateHeroBrandingInput) {
  try {
    const admin = await assertRole("SUPER_ADMIN")

    const current = await prisma.systemSettings.findUnique({ where: { id: "global" } })
    const previousData = {
      logoUrl: current?.logoUrl ?? null,
      heroImageUrl: current?.heroImageUrl ?? null,
      heroVideoUrl: current?.heroVideoUrl ?? null,
      heroTitle: current?.heroTitle ?? null,
      heroSubtitle: current?.heroSubtitle ?? null,
    }

    const sanitized = {
      logoUrl: input.logoUrl?.trim() ? input.logoUrl.trim() : null,
      heroImageUrl: input.heroImageUrl?.trim() ? input.heroImageUrl.trim() : null,
      heroVideoUrl: input.heroVideoUrl?.trim() ? input.heroVideoUrl.trim() : null,
      heroTitle: input.heroTitle?.trim() ? input.heroTitle.trim() : null,
      heroSubtitle: input.heroSubtitle?.trim() ? input.heroSubtitle.trim() : null,
    }

    await prisma.$transaction(async (tx) => {
      await tx.systemSettings.upsert({
        where: { id: "global" },
        update: { ...sanitized, updatedById: admin.id },
        create: { id: "global", ...sanitized, updatedById: admin.id },
      })
      await recordAdminAction(tx, {
        action: "SYSTEM_SETTINGS_UPDATED",
        actorId: admin.id,
        metadata: {
          field: "heroBrandingSettings",
          from: previousData,
          to: sanitized,
        },
      })
    })

    safeRevalidatePath("/admin/settings")
    safeRevalidatePath("/")
    return { success: true as const }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update branding settings"
    return { error: message }
  }
}

