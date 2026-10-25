"use server"

import { z } from "zod"
import { prisma } from "@/lib/db"
import { assertUser } from "@/lib/auth/guards"
import { ForbiddenError } from "@/lib/auth/errors"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import { getPaymentProvider } from "@/lib/payments/provider"
import { validateCoupon } from "@/lib/payments/coupons"

/**
 * User-facing billing — any authenticated user, not role-restricted (a
 * subscription is an account-level thing, not specific to STUDENT/TEACHER).
 * Never issues or trusts a success/failure outcome itself: it only ever
 * starts a checkout (handing control to the provider) or requests a
 * cancellation take effect at period end. The only place a payment is ever
 * confirmed is the verified webhook (app/api/webhooks/payments/route.ts).
 */

const checkoutSchema = z.object({
  planKey: z.string().min(1).max(100),
  couponCode: z.string().trim().max(100).optional(),
})

export async function createCheckoutSessionAction(input: unknown) {
  const user = await assertUser()

  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) return { error: "Invalid request" }
  const { planKey, couponCode } = parsed.data

  const plan = await prisma.subscriptionPlan.findUnique({ where: { key: planKey } })
  if (!plan || !plan.isActive) return { error: "This plan is not available" }

  if (couponCode) {
    const validation = await validateCoupon(couponCode)
    if (!validation.valid) return { error: validation.reason }
  }

  const provider = getPaymentProvider()
  const origin = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const result = await provider.createCheckoutSession({
    userId: user.id,
    planKey,
    couponCode,
    successUrl: `${origin}/billing?checkout=success`,
    cancelUrl: `${origin}/billing?checkout=canceled`,
  })

  return result
}

export async function cancelSubscriptionAction(subscriptionId: string) {
  const user = await assertUser()

  const subscription = await prisma.subscription.findUnique({ where: { id: subscriptionId } })
  if (!subscription) return { error: "Subscription not found" }
  // Strict ownership — no ADMIN bypass here; an admin cancels through its
  // own, separately-audited action (actions/admin-billing.actions.ts) so
  // there's always a clear record of who initiated a cancellation and why.
  if (subscription.userId !== user.id) throw new ForbiddenError()

  if (subscription.status === "CANCELED") return { error: "This subscription is already canceled" }
  if (subscription.cancelAtPeriodEnd) return { error: "Cancellation is already scheduled" }

  // Takes effect at the end of the current period, not immediately — the
  // user already paid for it. The provider's own subscription-deletion
  // webhook (subscription.canceled) is what ultimately flips status to
  // CANCELED once the period actually ends.
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { cancelAtPeriodEnd: true, canceledAt: new Date() },
  })

  safeRevalidatePath("/billing")
  return { success: true }
}
