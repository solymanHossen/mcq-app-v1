import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import type { Coupon, Prisma, PrismaClient } from "@/prisma/generated/prisma/client"

type Tx = PrismaClient | Prisma.TransactionClient

export type CouponValidation = { valid: true; coupon: Coupon } | { valid: false; reason: string }

export async function validateCoupon(code: string, now: Date = new Date()): Promise<CouponValidation> {
  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon) return { valid: false, reason: "Invalid coupon code" }
  if (!coupon.isActive) return { valid: false, reason: "This coupon is no longer active" }
  if (coupon.expiresAt && coupon.expiresAt < now) return { valid: false, reason: "This coupon has expired" }
  if (coupon.maxRedemptions !== null && coupon.timesRedeemed >= coupon.maxRedemptions) {
    return { valid: false, reason: "This coupon has reached its redemption limit" }
  }
  return { valid: true, coupon }
}

export function applyCouponDiscount(amountCents: number, coupon: Coupon): number {
  if (coupon.discountType === "PERCENT") {
    return Math.round(amountCents * (1 - coupon.discountValue / 100))
  }
  return Math.max(0, amountCents - Math.round(coupon.discountValue))
}

/**
 * Race-safe redemption: a plain `validate-then-increment` has a window where
 * two concurrent redemptions approaching maxRedemptions could both pass
 * validation and both increment, overshooting the limit by one. The
 * conditional UPDATE below closes that window — the WHERE clause compares
 * two columns of the same row (`timesRedeemed < maxRedemptions`), which
 * Prisma's typed query builder can't express, so this is raw SQL, not a
 * missing feature. The per-user uniqueness (one redemption per user per
 * coupon) is enforced the same way every other idempotent insert in this
 * codebase is — createMany + skipDuplicates, never create() + catch(P2002)
 * (see lib/learning/xp.ts's awardXP for why that poisons a transaction).
 */
export async function redeemCoupon(
  tx: Tx,
  couponId: string,
  userId: string,
  transactionId?: string
): Promise<{ redeemed: boolean }> {
  const { count: redemptionCount } = await tx.couponRedemption.createMany({
    data: [{ id: randomUUID(), couponId, userId, transactionId }],
    skipDuplicates: true,
  })
  if (redemptionCount === 0) {
    return { redeemed: false } // this user already redeemed this coupon
  }

  const updated = await tx.$executeRaw`
    UPDATE "Coupon"
    SET "timesRedeemed" = "timesRedeemed" + 1
    WHERE "id" = ${couponId}
      AND "isActive" = true
      AND ("maxRedemptions" IS NULL OR "timesRedeemed" < "maxRedemptions")
  `
  if (updated === 0) {
    // Lost the race for the last slot (or the coupon was deactivated between
    // validateCoupon and here) — roll back the redemption row we just
    // created so this user isn't left "redeemed" against a coupon whose
    // limit was never actually honored for them.
    await tx.couponRedemption.deleteMany({ where: { couponId, userId } })
    return { redeemed: false }
  }

  return { redeemed: true }
}
