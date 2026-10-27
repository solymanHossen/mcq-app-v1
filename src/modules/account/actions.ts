"use server"

import { prisma } from "@/lib/prisma"
import { assertUser, revokeAllSessions } from "@/lib/authorization"
import { hashPassword, verifyPassword } from "@/modules/auth/password"
import { recordAuditEvent } from "@/modules/auth/audit"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import {
  updateNameSchema,
  changePasswordSchema,
} from "@/modules/account/validators"

// Not audited: a display-name change isn't security-relevant, unlike every
// other event AuditLog records (see its model comment) — logging it there
// would just be noise in the security trail.
export async function updateProfileNameAction(name: string) {
  const user = await assertUser()

  const parsed = updateNameSchema.safeParse({ name })
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid name" }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  })

  safeRevalidatePath("/profile")
  safeRevalidatePath("/")
  safeRevalidatePath("/teacher/settings")
  return { success: true as const }
}

export async function changePasswordAction(input: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  const user = await assertUser()

  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const current = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  })
  if (
    !(await verifyPassword(parsed.data.currentPassword, current.passwordHash))
  ) {
    return { error: "Current password is incorrect" }
  }

  const passwordHash = await hashPassword(parsed.data.newPassword)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

  // Same rule as a forced password reset: a changed password must kill every
  // session issued before it, including this one — the client signs itself
  // out right after this resolves (see change-password-card.tsx).
  await revokeAllSessions(user.id)
  await recordAuditEvent({ action: "PASSWORD_CHANGED", actorId: user.id })

  return { success: true as const }
}

export async function signOutAllDevicesAction() {
  const user = await assertUser()

  await revokeAllSessions(user.id)
  await recordAuditEvent({ action: "SESSION_REVOKED", actorId: user.id })

  return { success: true as const }
}
