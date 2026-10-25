"use server"

import { prisma } from "@/lib/db"
import { assertRole } from "@/lib/auth/guards"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import { recordAdminAction } from "@/lib/admin/audit"
import { getPaymentProvider } from "@/lib/payments/provider"
import { planSchema, couponSchema, refundSchema, reconcileSchema } from "@/lib/validators/billing"

// ─── Subscription plans ─────────────────────────────────────────────────

export async function createPlanAction(_state: unknown, formData: FormData) {
  const admin = await assertRole("ADMIN")

  const parsed = planSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid plan" }

  const existing = await prisma.subscriptionPlan.findUnique({ where: { key: parsed.data.key } })
  if (existing) return { error: "A plan with this key already exists" }

  await prisma.$transaction(async (tx) => {
    const plan = await tx.subscriptionPlan.create({
      data: {
        key: parsed.data.key,
        name: parsed.data.name,
        description: parsed.data.description,
        priceCents: parsed.data.priceCents,
        currency: parsed.data.currency,
        billingInterval: parsed.data.billingInterval,
        entitlements: JSON.parse(parsed.data.entitlements),
      },
    })
    await recordAdminAction(tx, {
      action: "SUBSCRIPTION_PLAN_CREATED",
      actorId: admin.id,
      metadata: { planId: plan.id, key: plan.key },
    })
  })

  safeRevalidatePath("/admin/subscriptions")
  return { success: true }
}

export async function updatePlanAction(planId: string, _state: unknown, formData: FormData) {
  const admin = await assertRole("ADMIN")

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
  if (!plan) return { error: "Plan not found" }

  const parsed = planSchema.omit({ key: true }).safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid plan" }

  await prisma.$transaction(async (tx) => {
    await tx.subscriptionPlan.update({
      where: { id: planId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        priceCents: parsed.data.priceCents,
        currency: parsed.data.currency,
        billingInterval: parsed.data.billingInterval,
        entitlements: JSON.parse(parsed.data.entitlements),
      },
    })
    await recordAdminAction(tx, {
      action: "SUBSCRIPTION_PLAN_UPDATED",
      actorId: admin.id,
      metadata: { planId },
    })
  })

  safeRevalidatePath("/admin/subscriptions")
  return { success: true }
}

export async function setPlanActiveAction(planId: string, isActive: boolean) {
  const admin = await assertRole("ADMIN")

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
  if (!plan) return { error: "Plan not found" }

  await prisma.$transaction(async (tx) => {
    await tx.subscriptionPlan.update({ where: { id: planId }, data: { isActive } })
    await recordAdminAction(tx, {
      action: "SUBSCRIPTION_PLAN_UPDATED",
      actorId: admin.id,
      metadata: { planId, isActive },
    })
  })

  safeRevalidatePath("/admin/subscriptions")
  return { success: true }
}

// ─── Coupons ─────────────────────────────────────────────────────────────

export async function createCouponAction(_state: unknown, formData: FormData) {
  const admin = await assertRole("ADMIN")

  const parsed = couponSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid coupon" }

  const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } })
  if (existing) return { error: "A coupon with this code already exists" }

  await prisma.$transaction(async (tx) => {
    const coupon = await tx.coupon.create({
      data: {
        code: parsed.data.code,
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        maxRedemptions: parsed.data.maxRedemptions ?? null,
        expiresAt: parsed.data.expiresAt ?? null,
      },
    })
    await recordAdminAction(tx, {
      action: "COUPON_CREATED",
      actorId: admin.id,
      metadata: { couponId: coupon.id, code: coupon.code },
    })
  })

  safeRevalidatePath("/admin/coupons")
  return { success: true }
}

export async function deactivateCouponAction(couponId: string) {
  const admin = await assertRole("ADMIN")

  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } })
  if (!coupon) return { error: "Coupon not found" }
  if (!coupon.isActive) return { error: "This coupon is already inactive" }

  await prisma.$transaction(async (tx) => {
    await tx.coupon.update({ where: { id: couponId }, data: { isActive: false } })
    await recordAdminAction(tx, {
      action: "COUPON_DEACTIVATED",
      actorId: admin.id,
      metadata: { couponId, code: coupon.code },
    })
  })

  safeRevalidatePath("/admin/coupons")
  return { success: true }
}

// ─── Refunds & reconciliation ──────────────────────────────────────────

export async function issueRefundAction(transactionId: string, _state: unknown, formData: FormData) {
  const admin = await assertRole("ADMIN")

  const transaction = await prisma.paymentTransaction.findUnique({ where: { id: transactionId } })
  if (!transaction) return { error: "Transaction not found" }
  if (transaction.status !== "SUCCEEDED") {
    return { error: "Only a succeeded payment can be refunded" }
  }

  const parsed = refundSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid refund request" }
  if (parsed.data.amountCents !== undefined && parsed.data.amountCents > transaction.amountCents) {
    return { error: "Refund amount can't exceed the original payment" }
  }

  // The provider call is the actual money movement — our own record is only
  // ever updated after that succeeds, never in anticipation of it.
  const provider = getPaymentProvider()
  const result = await provider.issueRefund(transaction.providerTransactionId, parsed.data.amountCents)
  if ("error" in result) return { error: result.error }

  const refundedAmount = parsed.data.amountCents ?? transaction.amountCents

  await prisma.$transaction(async (tx) => {
    await tx.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: refundedAmount >= transaction.amountCents ? "REFUNDED" : "PARTIALLY_REFUNDED",
        refundedAmountCents: refundedAmount,
        refundedAt: new Date(),
        refundReason: parsed.data.reason,
        refundedById: admin.id,
      },
    })
    await recordAdminAction(tx, {
      action: "PAYMENT_REFUNDED",
      actorId: admin.id,
      targetUserId: transaction.userId,
      reason: parsed.data.reason,
      metadata: { transactionId, refundedAmountCents: refundedAmount, providerRefundId: result.providerRefundId },
    })
  })

  safeRevalidatePath("/admin/payments")
  return { success: true }
}

export async function reconcileTransactionAction(transactionId: string, _state: unknown, formData: FormData) {
  const admin = await assertRole("ADMIN")

  const transaction = await prisma.paymentTransaction.findUnique({ where: { id: transactionId } })
  if (!transaction) return { error: "Transaction not found" }
  if (transaction.status !== "PENDING") {
    return { error: "Only a pending transaction needs reconciliation" }
  }

  const parsed = reconcileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" }

  await prisma.$transaction(async (tx) => {
    await tx.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: parsed.data.resolution,
        failureReason: parsed.data.resolution === "FAILED" ? parsed.data.reason : null,
      },
    })
    await recordAdminAction(tx, {
      action: "PAYMENT_RECONCILED",
      actorId: admin.id,
      targetUserId: transaction.userId,
      reason: parsed.data.reason,
      metadata: { transactionId, resolution: parsed.data.resolution },
    })
  })

  safeRevalidatePath("/admin/payments")
  return { success: true }
}
