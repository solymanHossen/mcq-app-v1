"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertRole, ADMIN_ROLES } from "@/lib/authorization"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import type { NewsletterStatus } from "@/prisma/generated/prisma/client"

const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email address")
    .max(255, "Email is too long"),
})

export async function subscribeNewsletterAction(emailInput: string) {
  const parsed = subscribeSchema.safeParse({ email: emailInput })
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid email address",
    }
  }

  const normalizedEmail = parsed.data.email.toLowerCase()

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (existing.status === "SUBSCRIBED") {
        return {
          success: true as const,
          message: "You're already subscribed to ExamHub Dispatch!",
          alreadySubscribed: true,
        }
      }

      // Re-activate previously unsubscribed
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { status: "SUBSCRIBED" },
      })

      safeRevalidatePath("/admin/subscribers")
      return {
        success: true as const,
        message: "Welcome back! Your subscription has been reactivated.",
      }
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        status: "SUBSCRIBED",
        source: "footer",
      },
    })

    safeRevalidatePath("/admin/subscribers")
    return {
      success: true as const,
      message: "Thanks for subscribing to ExamHub Dispatch!",
    }
  } catch (error) {
    console.error("Failed to subscribe to newsletter:", error)
    return {
      success: false as const,
      error: "Something went wrong while subscribing. Please try again later.",
    }
  }
}

export async function toggleSubscriberStatusAction(id: string, nextStatus: NewsletterStatus) {
  await assertRole(...ADMIN_ROLES)

  try {
    await prisma.newsletterSubscriber.update({
      where: { id },
      data: { status: nextStatus },
    })

    safeRevalidatePath("/admin/subscribers")
    return { success: true as const }
  } catch (error) {
    console.error("Failed to toggle subscriber status:", error)
    return { success: false as const, error: "Failed to update subscriber status." }
  }
}

export async function deleteSubscriberAction(id: string) {
  await assertRole(...ADMIN_ROLES)

  try {
    await prisma.newsletterSubscriber.delete({
      where: { id },
    })

    safeRevalidatePath("/admin/subscribers")
    return { success: true as const }
  } catch (error) {
    console.error("Failed to delete subscriber:", error)
    return { success: false as const, error: "Failed to delete subscriber." }
  }
}

export async function exportSubscribersAction() {
  await assertRole(...ADMIN_ROLES)

  try {
    const list = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        email: true,
        status: true,
        source: true,
        createdAt: true,
      },
    })
    return { success: true as const, data: list }
  } catch (error) {
    console.error("Failed to export subscribers:", error)
    return { success: false as const, error: "Failed to export subscribers." }
  }
}
