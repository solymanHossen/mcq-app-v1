import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { ForbiddenError } from "@/lib/errors"
import { _setPaymentProviderForTests, type PaymentProvider } from "@/modules/payments/provider"
import {
  createPlanAction,
  updatePlanAction,
  setPlanActiveAction,
  createCouponAction,
  deactivateCouponAction,
  issueRefundAction,
  reconcileTransactionAction,
} from "./admin-actions"

const mockAuth = vi.mocked(auth)

function asUser(user: { id: string; tokenVersion: number }) {
  mockAuth.mockResolvedValue({
    user: { id: user.id, tokenVersion: user.tokenVersion },
    expires: "",
  } as never)
}

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []
const planIds: string[] = []
const couponIds: string[] = []

async function makeUser(role: "ADMIN" | "STUDENT" | "TEACHER", label: string) {
  const user = await prisma.user.create({
    data: {
      name: label,
      email: `${label}-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role,
      isEmailVerified: true,
    },
  })
  userIds.push(user.id)
  return user
}

function shortId() {
  return Math.random().toString(36).slice(2, 8)
}

function planFormData(overrides: Record<string, string> = {}) {
  const data = new FormData()
  const base = {
    key: `plan-${shortId()}`,
    name: "Pro Plan",
    priceCents: "1999",
    currency: "usd",
    billingInterval: "MONTH",
    entitlements: JSON.stringify({ maxActiveExams: 50, aiExplanationsEnabled: true }),
    ...overrides,
  }
  for (const [k, v] of Object.entries(base)) data.set(k, v)
  return data
}

function couponFormData(overrides: Record<string, string> = {}) {
  const data = new FormData()
  const base = {
    code: `CODE-${shortId()}`,
    discountType: "PERCENT",
    discountValue: "20",
    ...overrides,
  }
  for (const [k, v] of Object.entries(base)) data.set(k, v)
  return data
}

let admin: Awaited<ReturnType<typeof makeUser>>

const fakeProvider: PaymentProvider = {
  name: "fake",
  isConfigured: () => true,
  verifySignature: () => true,
  parseWebhookEvent: () => null,
  createCheckoutSession: async () => ({ error: "not used in these tests" }),
  issueRefund: async () => ({ success: true, providerRefundId: "re_fake_123" }),
}

beforeAll(async () => {
  admin = await makeUser("ADMIN", "billing-admin")
})

afterAll(async () => {
  await prisma.paymentTransaction.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.subscriptionPlan.deleteMany({ where: { id: { in: planIds } } })
  await prisma.coupon.deleteMany({ where: { id: { in: couponIds } } })
  await prisma.adminAuditLog.deleteMany({ where: { actorId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("plan management", () => {
  it("rejects a non-admin caller", async () => {
    const teacher = await (async () => {
      const u = await makeUser("TEACHER", `plan-caller-${Math.random()}`)
      return u
    })()
    asUser(teacher)
    await expect(createPlanAction(undefined, planFormData())).rejects.toThrow(ForbiddenError)
  })

  it("creates a plan and logs the action", async () => {
    asUser(admin)

    const result = await createPlanAction(undefined, planFormData())
    expect(result).toEqual({ success: true })

    const plan = await prisma.subscriptionPlan.findFirst({ where: { name: "Pro Plan" }, orderBy: { createdAt: "desc" } })
    expect(plan).not.toBeNull()
    if (plan) planIds.push(plan.id)
    expect(plan?.entitlements).toEqual({ maxActiveExams: 50, aiExplanationsEnabled: true })

    const log = await prisma.adminAuditLog.findFirst({ where: { action: "SUBSCRIPTION_PLAN_CREATED" } })
    expect(log?.actorId).toBe(admin.id)
  })

  it("rejects a duplicate plan key", async () => {
    asUser(admin)
    const key = `dup-key-${suffix}`
    const first = await createPlanAction(undefined, planFormData({ key }))
    expect(first).toEqual({ success: true })
    const plan = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { key } })
    planIds.push(plan.id)

    const second = await createPlanAction(undefined, planFormData({ key }))
    expect(second && "error" in second).toBe(true)
  })

  it("rejects malformed entitlements JSON", async () => {
    asUser(admin)
    const result = await createPlanAction(undefined, planFormData({ entitlements: "{not json" }))
    expect(result && "error" in result).toBe(true)
  })

  it("updates an existing plan", async () => {
    asUser(admin)
    const created = await createPlanAction(undefined, planFormData())
    expect(created).toEqual({ success: true })
    const plan = await prisma.subscriptionPlan.findFirst({ orderBy: { createdAt: "desc" } })
    if (plan) planIds.push(plan.id)

    const updateResult = await updatePlanAction(
      plan!.id,
      undefined,
      planFormData({ name: "Updated Plan Name" })
    )
    expect(updateResult).toEqual({ success: true })

    const updated = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { id: plan!.id } })
    expect(updated.name).toBe("Updated Plan Name")
  })

  it("can deactivate and reactivate a plan", async () => {
    asUser(admin)
    await createPlanAction(undefined, planFormData())
    const plan = await prisma.subscriptionPlan.findFirst({ orderBy: { createdAt: "desc" } })
    if (plan) planIds.push(plan.id)

    await setPlanActiveAction(plan!.id, false)
    const deactivated = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { id: plan!.id } })
    expect(deactivated.isActive).toBe(false)

    await setPlanActiveAction(plan!.id, true)
    const reactivated = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { id: plan!.id } })
    expect(reactivated.isActive).toBe(true)
  })
})

describe("coupon management", () => {
  it("rejects a non-admin caller", async () => {
    const student = await makeUser("STUDENT", `coupon-caller-${Math.random()}`)
    asUser(student)
    await expect(createCouponAction(undefined, couponFormData())).rejects.toThrow(ForbiddenError)
  })

  it("creates a coupon, normalized to uppercase", async () => {
    asUser(admin)
    const result = await createCouponAction(undefined, couponFormData({ code: "lowercase-code" }))
    expect(result).toEqual({ success: true })

    const coupon = await prisma.coupon.findUniqueOrThrow({ where: { code: "LOWERCASE-CODE" } })
    couponIds.push(coupon.id)
    expect(coupon.discountValue).toBe(20)
  })

  it("rejects a duplicate coupon code", async () => {
    asUser(admin)
    // Uppercase already — couponSchema normalizes codes to uppercase, and
    // the lookup below must match what actually got stored.
    const code = `DUPCODE-${shortId().toUpperCase()}`
    await createCouponAction(undefined, couponFormData({ code }))
    const coupon = await prisma.coupon.findUniqueOrThrow({ where: { code } })
    couponIds.push(coupon.id)

    const second = await createCouponAction(undefined, couponFormData({ code }))
    expect(second && "error" in second).toBe(true)
  })

  it("deactivates a coupon and refuses to deactivate it twice", async () => {
    asUser(admin)
    await createCouponAction(undefined, couponFormData())
    const coupon = await prisma.coupon.findFirst({ orderBy: { createdAt: "desc" } })
    if (coupon) couponIds.push(coupon.id)

    const first = await deactivateCouponAction(coupon!.id)
    expect(first).toEqual({ success: true })

    const second = await deactivateCouponAction(coupon!.id)
    expect(second && "error" in second).toBe(true)
  })
})

describe("refunds", () => {
  afterEach(() => _setPaymentProviderForTests(undefined))

  it("rejects a non-admin caller", async () => {
    const student = await makeUser("STUDENT", `refund-caller-${Math.random()}`)
    asUser(student)
    const formData = new FormData()
    formData.set("reason", "Attempted refund without permission")
    await expect(issueRefundAction("any-id", undefined, formData)).rejects.toThrow(ForbiddenError)
  })

  it("refuses to refund a non-succeeded transaction", async () => {
    const student = await makeUser("STUDENT", `refund-target-${Math.random()}`)
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: student.id,
        provider: "stripe",
        providerTransactionId: `pi-${suffix}-${Math.random()}`,
        amountCents: 1000,
        status: "PENDING",
      },
    })

    asUser(admin)
    const formData = new FormData()
    formData.set("reason", "Should not be allowed on a pending transaction")
    const result = await issueRefundAction(transaction.id, undefined, formData)
    expect(result && "error" in result).toBe(true)
  })

  it("issues a full refund via the provider and records it with an audit log", async () => {
    _setPaymentProviderForTests(fakeProvider)
    const student = await makeUser("STUDENT", `refund-success-${Math.random()}`)
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: student.id,
        provider: "stripe",
        providerTransactionId: `pi-${suffix}-${Math.random()}`,
        amountCents: 2000,
        status: "SUCCEEDED",
      },
    })

    asUser(admin)
    const formData = new FormData()
    formData.set("reason", "Customer requested a refund within the window")
    const result = await issueRefundAction(transaction.id, undefined, formData)
    expect(result).toEqual({ success: true })

    const updated = await prisma.paymentTransaction.findUniqueOrThrow({ where: { id: transaction.id } })
    expect(updated.status).toBe("REFUNDED")
    expect(updated.refundedAmountCents).toBe(2000)
    expect(updated.refundedById).toBe(admin.id)

    const log = await prisma.adminAuditLog.findFirst({
      where: { action: "PAYMENT_REFUNDED", targetUserId: student.id },
    })
    expect(log).not.toBeNull()
  })

  it("issues a partial refund and marks PARTIALLY_REFUNDED", async () => {
    _setPaymentProviderForTests(fakeProvider)
    const student = await makeUser("STUDENT", `refund-partial-${Math.random()}`)
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: student.id,
        provider: "stripe",
        providerTransactionId: `pi-${suffix}-${Math.random()}`,
        amountCents: 2000,
        status: "SUCCEEDED",
      },
    })

    asUser(admin)
    const formData = new FormData()
    formData.set("reason", "Partial goodwill refund")
    formData.set("amountCents", "500")
    const result = await issueRefundAction(transaction.id, undefined, formData)
    expect(result).toEqual({ success: true })

    const updated = await prisma.paymentTransaction.findUniqueOrThrow({ where: { id: transaction.id } })
    expect(updated.status).toBe("PARTIALLY_REFUNDED")
    expect(updated.refundedAmountCents).toBe(500)
  })

  it("rejects a refund amount larger than the original payment", async () => {
    _setPaymentProviderForTests(fakeProvider)
    const student = await makeUser("STUDENT", `refund-toolarge-${Math.random()}`)
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: student.id,
        provider: "stripe",
        providerTransactionId: `pi-${suffix}-${Math.random()}`,
        amountCents: 1000,
        status: "SUCCEEDED",
      },
    })

    asUser(admin)
    const formData = new FormData()
    formData.set("reason", "Trying to over-refund")
    formData.set("amountCents", "5000")
    const result = await issueRefundAction(transaction.id, undefined, formData)
    expect(result && "error" in result).toBe(true)
  })

  it("surfaces a clear error when no payment provider is configured", async () => {
    // No fakeProvider injected — exercises the real, unconfigured provider.
    const student = await makeUser("STUDENT", `refund-noprovider-${Math.random()}`)
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: student.id,
        provider: "stripe",
        providerTransactionId: `pi-${suffix}-${Math.random()}`,
        amountCents: 1000,
        status: "SUCCEEDED",
      },
    })

    asUser(admin)
    const formData = new FormData()
    formData.set("reason", "Should fail cleanly, not crash")
    const result = await issueRefundAction(transaction.id, undefined, formData)
    expect(result && "error" in result).toBe(true)

    const unchanged = await prisma.paymentTransaction.findUniqueOrThrow({ where: { id: transaction.id } })
    expect(unchanged.status).toBe("SUCCEEDED") // never mutated on a failed provider call
  })
})

describe("reconciliation", () => {
  it("rejects a non-admin caller", async () => {
    const student = await makeUser("STUDENT", `reconcile-caller-${Math.random()}`)
    asUser(student)
    const formData = new FormData()
    formData.set("resolution", "SUCCEEDED")
    formData.set("reason", "Attempted reconciliation without permission")
    await expect(reconcileTransactionAction("any-id", undefined, formData)).rejects.toThrow(ForbiddenError)
  })

  it("resolves a stale pending transaction to SUCCEEDED with an audit trail", async () => {
    const student = await makeUser("STUDENT", `reconcile-a-${Math.random()}`)
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: student.id,
        provider: "stripe",
        providerTransactionId: `pi-${suffix}-${Math.random()}`,
        amountCents: 1000,
        status: "PENDING",
      },
    })

    asUser(admin)
    const formData = new FormData()
    formData.set("resolution", "SUCCEEDED")
    formData.set("reason", "Confirmed in the Stripe dashboard directly")
    const result = await reconcileTransactionAction(transaction.id, undefined, formData)
    expect(result).toEqual({ success: true })

    const updated = await prisma.paymentTransaction.findUniqueOrThrow({ where: { id: transaction.id } })
    expect(updated.status).toBe("SUCCEEDED")

    const log = await prisma.adminAuditLog.findFirst({
      where: { action: "PAYMENT_RECONCILED", targetUserId: student.id },
    })
    expect(log).not.toBeNull()
  })

  it("refuses to reconcile a transaction that isn't pending", async () => {
    const student = await makeUser("STUDENT", `reconcile-b-${Math.random()}`)
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: student.id,
        provider: "stripe",
        providerTransactionId: `pi-${suffix}-${Math.random()}`,
        amountCents: 1000,
        status: "SUCCEEDED",
      },
    })

    asUser(admin)
    const formData = new FormData()
    formData.set("resolution", "FAILED")
    formData.set("reason", "Shouldn't be allowed")
    const result = await reconcileTransactionAction(transaction.id, undefined, formData)
    expect(result && "error" in result).toBe(true)
  })
})
