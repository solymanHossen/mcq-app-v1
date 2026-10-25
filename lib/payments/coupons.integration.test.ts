import { afterAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { validateCoupon, applyCouponDiscount, redeemCoupon } from "./coupons"

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []
const couponIds: string[] = []

async function makeStudent(label: string) {
  const user = await prisma.user.create({
    data: {
      name: label,
      email: `${label}-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role: "STUDENT",
      isEmailVerified: true,
    },
  })
  userIds.push(user.id)
  return user
}

async function makeCoupon(opts: {
  discountType: "PERCENT" | "FIXED_AMOUNT"
  discountValue: number
  maxRedemptions?: number | null
  isActive?: boolean
  expiresAt?: Date | null
}) {
  const coupon = await prisma.coupon.create({
    data: {
      code: `CODE-${suffix}-${Math.random()}`,
      discountType: opts.discountType,
      discountValue: opts.discountValue,
      maxRedemptions: opts.maxRedemptions ?? null,
      isActive: opts.isActive ?? true,
      expiresAt: opts.expiresAt ?? null,
    },
  })
  couponIds.push(coupon.id)
  return coupon
}

afterAll(async () => {
  await prisma.couponRedemption.deleteMany({ where: { couponId: { in: couponIds } } })
  await prisma.coupon.deleteMany({ where: { id: { in: couponIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("validateCoupon", () => {
  it("rejects an unknown code", async () => {
    const result = await validateCoupon(`does-not-exist-${suffix}`)
    expect(result.valid).toBe(false)
  })

  it("rejects an inactive coupon", async () => {
    const coupon = await makeCoupon({ discountType: "PERCENT", discountValue: 10, isActive: false })
    const result = await validateCoupon(coupon.code)
    expect(result).toMatchObject({ valid: false })
  })

  it("rejects an expired coupon", async () => {
    const coupon = await makeCoupon({
      discountType: "PERCENT",
      discountValue: 10,
      expiresAt: new Date(Date.now() - 86_400_000),
    })
    const result = await validateCoupon(coupon.code)
    expect(result).toMatchObject({ valid: false })
  })

  it("rejects a coupon that already reached its redemption limit", async () => {
    const coupon = await prisma.coupon.update({
      where: { id: (await makeCoupon({ discountType: "PERCENT", discountValue: 10, maxRedemptions: 1 })).id },
      data: { timesRedeemed: 1 },
    })
    const result = await validateCoupon(coupon.code)
    expect(result).toMatchObject({ valid: false })
  })

  it("accepts a valid, active, unexpired, under-limit coupon", async () => {
    const coupon = await makeCoupon({ discountType: "PERCENT", discountValue: 15, maxRedemptions: 5 })
    const result = await validateCoupon(coupon.code)
    expect(result.valid).toBe(true)
  })
})

describe("applyCouponDiscount", () => {
  it("applies a percentage discount", async () => {
    const coupon = await makeCoupon({ discountType: "PERCENT", discountValue: 20 })
    expect(applyCouponDiscount(1000, coupon)).toBe(800)
  })

  it("applies a fixed-amount discount", async () => {
    const coupon = await makeCoupon({ discountType: "FIXED_AMOUNT", discountValue: 300 })
    expect(applyCouponDiscount(1000, coupon)).toBe(700)
  })

  it("never discounts below zero", async () => {
    const coupon = await makeCoupon({ discountType: "FIXED_AMOUNT", discountValue: 5000 })
    expect(applyCouponDiscount(1000, coupon)).toBe(0)
  })
})

describe("redeemCoupon", () => {
  it("redeems successfully and increments timesRedeemed", async () => {
    const coupon = await makeCoupon({ discountType: "PERCENT", discountValue: 10, maxRedemptions: 5 })
    const student = await makeStudent(`redeem-a-${Math.random()}`)

    const result = await prisma.$transaction((tx) => redeemCoupon(tx, coupon.id, student.id))
    expect(result).toEqual({ redeemed: true })

    const updated = await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } })
    expect(updated.timesRedeemed).toBe(1)
  })

  it("refuses a second redemption by the same user", async () => {
    const coupon = await makeCoupon({ discountType: "PERCENT", discountValue: 10, maxRedemptions: 10 })
    const student = await makeStudent(`redeem-b-${Math.random()}`)

    await prisma.$transaction((tx) => redeemCoupon(tx, coupon.id, student.id))
    const second = await prisma.$transaction((tx) => redeemCoupon(tx, coupon.id, student.id))
    expect(second).toEqual({ redeemed: false })

    const updated = await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } })
    expect(updated.timesRedeemed).toBe(1) // not double-counted
  })

  it("never exceeds maxRedemptions under concurrent redemption attempts", async () => {
    const coupon = await makeCoupon({ discountType: "PERCENT", discountValue: 10, maxRedemptions: 3 })
    const students = await Promise.all(
      Array.from({ length: 10 }, (_, i) => makeStudent(`redeem-race-${i}-${Math.random()}`))
    )

    const results = await Promise.all(
      students.map((s) => prisma.$transaction((tx) => redeemCoupon(tx, coupon.id, s.id)))
    )

    const successCount = results.filter((r) => r.redeemed).length
    expect(successCount).toBe(3) // exactly the configured limit, never more

    const updated = await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } })
    expect(updated.timesRedeemed).toBe(3)

    const redemptionRows = await prisma.couponRedemption.count({ where: { couponId: coupon.id } })
    expect(redemptionRows).toBe(3) // the lost-race rollback actually removed the others
  }, 15_000)
})
