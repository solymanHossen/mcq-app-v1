"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"

const upgradeGuestSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type UpgradeGuestState = {
  success?: boolean
  error?: string
}

export async function upgradeGuestAccountAction(
  _prevState: UpgradeGuestState,
  formData: FormData
): Promise<UpgradeGuestState> {
  const user = await requireUser()

  if (!user.isGuest) {
    return { error: "This account is already a full registered account." }
  }

  const raw = {
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  }

  const parsed = upgradeGuestSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const passwordHash = await hashPassword(parsed.data.password)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      isGuest: false,
      isEmailVerified: true,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/exams")
  revalidatePath("/mistakes")
  revalidatePath("/progress")
  revalidatePath("/leaderboard")

  return { success: true }
}
