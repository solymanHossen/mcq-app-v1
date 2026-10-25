import type { Prisma, PrismaClient } from "@/prisma/generated/prisma/client"
import type { NormalizedWebhookEvent } from "./provider"

type Tx = PrismaClient | Prisma.TransactionClient

/**
 * Applies one already-verified, already-recorded event to our own data.
 * Every branch is written to be safe to run twice (the same event retried
 * after a transient failure, or — defense in depth — called again by a
 * mistake somewhere upstream): each one finds-or-creates by the provider's
 * own stable id and writes an absolute status, never an increment or a
 * relative change, so applying it twice produces the same end state as
 * applying it once.
 */
export async function applyWebhookEvent(tx: Tx, event: NormalizedWebhookEvent): Promise<void> {
  switch (event.type) {
    case "payment.succeeded":
      return handlePaymentSucceeded(tx, event.data)
    case "payment.failed":
      return handlePaymentFailed(tx, event.data)
    case "payment.refunded":
      return handlePaymentRefunded(tx, event.data)
    case "subscription.updated":
      return handleSubscriptionUpdated(tx, event.data)
    case "subscription.canceled":
      return handleSubscriptionCanceled(tx, event.data)
  }
}

async function handlePaymentSucceeded(tx: Tx, data: NormalizedWebhookEvent["data"]) {
  if (!data.providerTransactionId) {
    throw new Error("payment.succeeded event is missing providerTransactionId")
  }

  const existing = await tx.paymentTransaction.findUnique({
    where: { providerTransactionId: data.providerTransactionId },
  })

  if (existing) {
    await tx.paymentTransaction.update({
      where: { id: existing.id },
      data: { status: "SUCCEEDED", failureReason: null },
    })
    if (existing.subscriptionId) {
      await tx.subscription.update({
        where: { id: existing.subscriptionId },
        data: { status: "ACTIVE" },
      })
    }
    return
  }

  // No transaction row exists yet — the provider is the source of truth
  // regardless of what (if anything) initiated the payment on our side; see
  // lib/payments/provider.ts's module comment on never trusting a client
  // redirect. Requires the provider to have echoed back the userId we set
  // as metadata when creating the charge — without it there is no safe
  // owner to attribute this payment to, so it's a processing error, not a
  // silently-dropped payment (the raw event is retained in WebhookEvent
  // either way for manual reconciliation).
  if (!data.userId) {
    throw new Error("payment.succeeded event for an unknown transaction is missing userId metadata")
  }
  await tx.paymentTransaction.create({
    data: {
      userId: data.userId,
      provider: "stripe",
      providerTransactionId: data.providerTransactionId,
      amountCents: data.amountCents ?? 0,
      currency: data.currency ?? "usd",
      status: "SUCCEEDED",
    },
  })
}

async function handlePaymentFailed(tx: Tx, data: NormalizedWebhookEvent["data"]) {
  if (!data.providerTransactionId) {
    throw new Error("payment.failed event is missing providerTransactionId")
  }
  const existing = await tx.paymentTransaction.findUnique({
    where: { providerTransactionId: data.providerTransactionId },
  })
  if (!existing) return // nothing of ours to mark failed — not an error, just nothing to do

  await tx.paymentTransaction.update({
    where: { id: existing.id },
    data: { status: "FAILED", failureReason: data.failureReason ?? "Payment failed" },
  })
  if (existing.subscriptionId) {
    await tx.subscription.update({
      where: { id: existing.subscriptionId },
      data: { status: "PAST_DUE" },
    })
  }
}

async function handlePaymentRefunded(tx: Tx, data: NormalizedWebhookEvent["data"]) {
  if (!data.providerTransactionId) {
    throw new Error("payment.refunded event is missing providerTransactionId")
  }
  const existing = await tx.paymentTransaction.findUnique({
    where: { providerTransactionId: data.providerTransactionId },
  })
  if (!existing) return

  const refundedAmount = data.refundedAmountCents ?? existing.amountCents
  await tx.paymentTransaction.update({
    where: { id: existing.id },
    data: {
      status: refundedAmount >= existing.amountCents ? "REFUNDED" : "PARTIALLY_REFUNDED",
      refundedAmountCents: refundedAmount,
      refundedAt: existing.refundedAt ?? new Date(),
    },
  })
}

async function handleSubscriptionUpdated(tx: Tx, data: NormalizedWebhookEvent["data"]) {
  if (!data.providerSubscriptionId) {
    throw new Error("subscription.updated event is missing providerSubscriptionId")
  }
  const existing = await tx.subscription.findUnique({
    where: { providerSubscriptionId: data.providerSubscriptionId },
  })
  if (!existing) return // we don't track a subscription we never created

  await tx.subscription.update({
    where: { id: existing.id },
    data: {
      status: toSubscriptionStatus(data.subscriptionStatus) ?? existing.status,
      currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart) : existing.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : existing.currentPeriodEnd,
    },
  })
}

async function handleSubscriptionCanceled(tx: Tx, data: NormalizedWebhookEvent["data"]) {
  if (!data.providerSubscriptionId) {
    throw new Error("subscription.canceled event is missing providerSubscriptionId")
  }
  const existing = await tx.subscription.findUnique({
    where: { providerSubscriptionId: data.providerSubscriptionId },
  })
  if (!existing) return

  await tx.subscription.update({
    where: { id: existing.id },
    data: { status: "CANCELED", canceledAt: existing.canceledAt ?? new Date() },
  })
}

function toSubscriptionStatus(
  s: NormalizedWebhookEvent["data"]["subscriptionStatus"]
): "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | undefined {
  switch (s) {
    case "active":
      return "ACTIVE"
    case "past_due":
      return "PAST_DUE"
    case "canceled":
      return "CANCELED"
    case "trialing":
      return "TRIALING"
    default:
      return undefined
  }
}
