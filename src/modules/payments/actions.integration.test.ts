import { afterAll, afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { ForbiddenError } from "@/lib/auth/errors"
import { _setPaymentProviderForTests, type PaymentProvider } from "@/lib/payments/provider"
import { createCheckoutSessionAction, cancelSubscriptionAction } from "./billing.actions"

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

async function makeUser(role: "STUDENT" | "TEACHER", label: string) {
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

async function makePlan() {
  const plan = await prisma.subscriptionPlan.create({
    data: {
      key: `plan-${suffix}-${Math.random()}`,
      name: "Pro",
      priceCents: 1999,
      billingInterval: "MONTH",
      entitlements: { maxActiveExams: 50 },
    },
  })
  planIds.push(plan.id)
  return plan
}

afterAll(async () => {
  await prisma.subscription.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.subscriptionPlan.deleteMany({ where: { id: { in: planIds } } })
  await prisma.coupon.deleteMany({ where: { id: { in: couponIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("createCheckoutSessionAction — provider unconfigured (default, no env secrets in tests)", () => {
  afterEach(() => _setPaymentProviderForTests(undefined))

  it("returns a clear error rather than pretending checkout is available", async () => {
    const student = await makeUser("STUDENT", `checkout-a-${Math.random()}`)
    const plan = await makePlan()
    asUser(student)

    const result = await createCheckoutSessionAction({ planKey: plan.key })
    expect(result && "error" in result).toBe(true)
  })

  it("rejects a checkout for a plan that doesn't exist", async () => {
    const student = await makeUser("STUDENT", `checkout-b-${Math.random()}`)
    asUser(student)

    const result = await createCheckoutSessionAction({ planKey: "does-not-exist" })
    expect(result).toEqual({ error: "This plan is not available" })
  })

  it("rejects an invalid coupon code before ever reaching the provider", async () => {
    const student = await makeUser("STUDENT", `checkout-c-${Math.random()}`)
    const plan = await makePlan()
    asUser(student)

    const result = await createCheckoutSessionAction({
      planKey: plan.key,
      couponCode: `nonexistent-${suffix}`,
    })
    expect(result).toMatchObject({ error: expect.stringContaining("Invalid coupon") })
  })
})

describe("createCheckoutSessionAction — with an injected fake provider", () => {
  afterEach(() => _setPaymentProviderForTests(undefined))

  it("returns the checkout URL the provider produces", async () => {
    const student = await makeUser("STUDENT", `checkout-d-${Math.random()}`)
    const plan = await makePlan()

    const fakeProvider: PaymentProvider = {
      name: "fake",
      isConfigured: () => true,
      verifySignature: () => true,
      parseWebhookEvent: () => null,
      createCheckoutSession: async () => ({ url: "https://checkout.example.com/session_123" }),
      issueRefund: async () => ({ success: true, providerRefundId: "re_fake" }),
    }
    _setPaymentProviderForTests(fakeProvider)

    asUser(student)
    const result = await createCheckoutSessionAction({ planKey: plan.key })
    expect(result).toEqual({ url: "https://checkout.example.com/session_123" })
  })
})

describe("cancelSubscriptionAction", () => {
  it("rejects a different user from canceling someone else's subscription", async () => {
    const owner = await makeUser("STUDENT", `cancel-owner-${Math.random()}`)
    const intruder = await makeUser("STUDENT", `cancel-intruder-${Math.random()}`)
    const plan = await makePlan()
    const now = new Date()
    const subscription = await prisma.subscription.create({
      data: {
        userId: owner.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 86_400_000),
      },
    })

    asUser(intruder)
    await expect(cancelSubscriptionAction(subscription.id)).rejects.toThrow(ForbiddenError)
  })

  it("schedules cancellation at period end without revoking access immediately", async () => {
    const owner = await makeUser("STUDENT", `cancel-owner2-${Math.random()}`)
    const plan = await makePlan()
    const now = new Date()
    const subscription = await prisma.subscription.create({
      data: {
        userId: owner.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 86_400_000),
      },
    })

    asUser(owner)
    const result = await cancelSubscriptionAction(subscription.id)
    expect(result).toEqual({ success: true })

    const updated = await prisma.subscription.findUniqueOrThrow({ where: { id: subscription.id } })
    expect(updated.cancelAtPeriodEnd).toBe(true)
    expect(updated.status).toBe("ACTIVE") // access continues through the paid period
  })

  it("refuses to schedule cancellation twice", async () => {
    const owner = await makeUser("STUDENT", `cancel-owner3-${Math.random()}`)
    const plan = await makePlan()
    const now = new Date()
    const subscription = await prisma.subscription.create({
      data: {
        userId: owner.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 86_400_000),
      },
    })

    asUser(owner)
    await cancelSubscriptionAction(subscription.id)
    const second = await cancelSubscriptionAction(subscription.id)
    expect(second && "error" in second).toBe(true)
  })
})
