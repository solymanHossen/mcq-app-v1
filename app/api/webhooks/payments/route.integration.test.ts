import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { signWebhookPayload } from "@/lib/payments/signature"
import { POST } from "./route"

const WEBHOOK_SECRET = "whsec_integration_test"
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []

function makeRequest(body: string, signatureHeader?: string | null) {
  const headers = new Headers({ "content-type": "application/json" })
  if (signatureHeader !== null) {
    headers.set("stripe-signature", signatureHeader ?? signWebhookPayload(body, WEBHOOK_SECRET))
  }
  return new NextRequest("http://localhost/api/webhooks/payments", {
    method: "POST",
    headers,
    body,
  })
}

function paymentIntentEvent(opts: {
  eventId: string
  transactionId: string
  amount?: number
  userId?: string
}) {
  return JSON.stringify({
    id: opts.eventId,
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: opts.transactionId,
        amount: opts.amount ?? 2000,
        currency: "usd",
        metadata: opts.userId ? { userId: opts.userId } : {},
      },
    },
  })
}

function paymentFailedEvent(opts: { eventId: string; transactionId: string; reason?: string }) {
  return JSON.stringify({
    id: opts.eventId,
    type: "payment_intent.payment_failed",
    data: {
      object: {
        id: opts.transactionId,
        last_payment_error: { message: opts.reason ?? "Your card was declined" },
      },
    },
  })
}

beforeAll(() => {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET)
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_integration")
})

afterAll(async () => {
  vi.unstubAllEnvs()
  await prisma.paymentTransaction.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.webhookEvent.deleteMany({ where: { provider: "stripe", providerEventId: { contains: suffix } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

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

describe("POST /api/webhooks/payments — signature verification", () => {
  it("rejects a request with no signature header", async () => {
    const body = paymentIntentEvent({ eventId: `evt-nosig-${suffix}`, transactionId: `pi-${suffix}-a` })
    const response = await POST(makeRequest(body, null))
    expect(response.status).toBe(400)
  })

  it("rejects a request with a signature from the wrong secret", async () => {
    const body = paymentIntentEvent({ eventId: `evt-wrongsig-${suffix}`, transactionId: `pi-${suffix}-b` })
    const badSignature = signWebhookPayload(body, "a-completely-different-secret")
    const response = await POST(makeRequest(body, badSignature))
    expect(response.status).toBe(400)

    const events = await prisma.webhookEvent.findMany({
      where: { providerEventId: `evt-wrongsig-${suffix}` },
    })
    expect(events).toHaveLength(0) // an unverified payload is never even recorded
  })

  it("rejects a request whose body was tampered with after signing", async () => {
    const body = paymentIntentEvent({ eventId: `evt-tamper-${suffix}`, transactionId: `pi-${suffix}-c` })
    const signature = signWebhookPayload(body, WEBHOOK_SECRET)
    const tamperedBody = paymentIntentEvent({
      eventId: `evt-tamper-${suffix}`,
      transactionId: `pi-${suffix}-c`,
      amount: 999999,
    })
    const response = await POST(makeRequest(tamperedBody, signature))
    expect(response.status).toBe(400)
  })
})

describe("POST /api/webhooks/payments — processing", () => {
  it("creates a SUCCEEDED transaction from a verified payment.succeeded event", async () => {
    const student = await makeStudent(`webhook-a-${Math.random()}`)
    const transactionId = `pi-${suffix}-${Math.random()}`
    const body = paymentIntentEvent({
      eventId: `evt-${suffix}-${Math.random()}`,
      transactionId,
      amount: 1500,
      userId: student.id,
    })

    const response = await POST(makeRequest(body))
    expect(response.status).toBe(200)

    const transaction = await prisma.paymentTransaction.findUniqueOrThrow({
      where: { providerTransactionId: transactionId },
    })
    expect(transaction.status).toBe("SUCCEEDED")
    expect(transaction.amountCents).toBe(1500)
    expect(transaction.userId).toBe(student.id)
  })

  it("marks an existing transaction FAILED on payment_intent.payment_failed", async () => {
    const student = await makeStudent(`webhook-b-${Math.random()}`)
    const transactionId = `pi-${suffix}-${Math.random()}`

    await POST(
      makeRequest(
        paymentIntentEvent({
          eventId: `evt-${suffix}-${Math.random()}`,
          transactionId,
          userId: student.id,
        })
      )
    )
    // Now simulate the charge failing after all (e.g. a later dispute flow) —
    // unusual but the handler must not crash on it.
    const failedResponse = await POST(
      makeRequest(
        paymentFailedEvent({
          eventId: `evt-${suffix}-${Math.random()}`,
          transactionId,
          reason: "Card declined on retry",
        })
      )
    )
    expect(failedResponse.status).toBe(200)

    const transaction = await prisma.paymentTransaction.findUniqueOrThrow({
      where: { providerTransactionId: transactionId },
    })
    expect(transaction.status).toBe("FAILED")
    expect(transaction.failureReason).toBe("Card declined on retry")
  })

  it("ignores a real-but-unhandled event type without error", async () => {
    const body = JSON.stringify({ id: `evt-${suffix}-ignored`, type: "customer.created", data: { object: {} } })
    const response = await POST(makeRequest(body))
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.ignored).toBe(true)
  })
})

describe("POST /api/webhooks/payments — idempotent duplicate delivery", () => {
  it("processes the exact same event only once, even when delivered twice", async () => {
    const student = await makeStudent(`webhook-dup-${Math.random()}`)
    const transactionId = `pi-${suffix}-${Math.random()}`
    const eventId = `evt-${suffix}-dup`
    const body = paymentIntentEvent({ eventId, transactionId, amount: 3000, userId: student.id })

    const first = await POST(makeRequest(body))
    expect(first.status).toBe(200)
    const firstJson = await first.json()
    expect(firstJson.duplicate).toBeUndefined()

    const second = await POST(makeRequest(body))
    expect(second.status).toBe(200)
    const secondJson = await second.json()
    expect(secondJson.duplicate).toBe(true)

    const transactions = await prisma.paymentTransaction.findMany({
      where: { providerTransactionId: transactionId },
    })
    expect(transactions).toHaveLength(1) // never double-created
    expect(transactions[0].amountCents).toBe(3000)

    const events = await prisma.webhookEvent.findMany({ where: { providerEventId: eventId } })
    expect(events).toHaveLength(1) // never double-recorded either
  })
})

describe("POST /api/webhooks/payments — failed processing is retried, not silently dropped", () => {
  it("a processing error leaves the event unprocessed, and a redelivery retries it", async () => {
    // payment.succeeded for a transaction we've never seen, with no userId
    // metadata — nobody to safely attribute it to, a genuine processing
    // error (see lib/payments/webhook-processor.ts).
    const eventId = `evt-${suffix}-unprocessable`
    const body = JSON.stringify({
      id: eventId,
      type: "payment_intent.succeeded",
      data: { object: { id: `pi-${suffix}-orphan`, amount: 500, currency: "usd", metadata: {} } },
    })

    const first = await POST(makeRequest(body))
    expect(first.status).toBe(500)

    const afterFirst = await prisma.webhookEvent.findUniqueOrThrow({
      where: { provider_providerEventId: { provider: "stripe", providerEventId: eventId } },
    })
    expect(afterFirst.processedAt).toBeNull()
    expect(afterFirst.processingError).toContain("userId")

    // Redelivery of the SAME event (as a real provider would, on a non-2xx
    // response) must actually retry processing, not be short-circuited as
    // "already handled" — proven by it failing the same way again, not by
    // silently returning a cached success.
    const second = await POST(makeRequest(body))
    expect(second.status).toBe(500)

    const events = await prisma.webhookEvent.findMany({ where: { providerEventId: eventId } })
    expect(events).toHaveLength(1) // still one row — recording stayed idempotent throughout
  })
})
