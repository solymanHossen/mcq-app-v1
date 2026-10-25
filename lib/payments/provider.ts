import { verifyWebhookSignature } from "./signature"

/**
 * The entire payment-provider boundary. Nothing outside lib/payments/ and
 * actions/billing.actions.ts / actions/admin-billing.actions.ts ever knows
 * which provider is configured, or imports a provider-specific shape — the
 * rest of the app (and all of the exam-taking engine) only ever sees the
 * NormalizedWebhookEvent / CheckoutSession / RefundResult types below.
 * Swapping providers means writing one new file that implements
 * PaymentProvider and changing one line in getPaymentProvider() — nothing
 * else in the app changes.
 */

export type NormalizedEventType =
  | "payment.succeeded"
  | "payment.failed"
  | "payment.refunded"
  | "subscription.updated"
  | "subscription.canceled"

export type NormalizedWebhookEvent = {
  id: string
  type: NormalizedEventType
  data: {
    providerTransactionId?: string
    providerSubscriptionId?: string
    amountCents?: number
    refundedAmountCents?: number
    currency?: string
    failureReason?: string
    subscriptionStatus?: "active" | "past_due" | "canceled" | "trialing"
    currentPeriodStart?: string
    currentPeriodEnd?: string
    userId?: string
  }
}

export type CheckoutSessionResult = { url: string } | { error: string }
export type RefundResult = { success: true; providerRefundId: string } | { error: string }

export interface PaymentProvider {
  readonly name: string
  isConfigured(): boolean
  /** Verifies the raw request body against the provider's signature scheme
   * using THIS provider's own signing secret — never trust a request body
   * alone, and never trust anything about a checkout redirect. */
  verifySignature(rawBody: string, signatureHeader: string | null): boolean
  /** Converts a provider-specific raw event body into the shape the rest of
   * the app understands. Returns null for an event type this integration
   * doesn't need to act on (still valid, just ignored). */
  parseWebhookEvent(rawBody: string): NormalizedWebhookEvent | null
  createCheckoutSession(opts: {
    userId: string
    planKey: string
    successUrl: string
    cancelUrl: string
    couponCode?: string
  }): Promise<CheckoutSessionResult>
  issueRefund(providerTransactionId: string, amountCents?: number): Promise<RefundResult>
}

/**
 * A real Stripe-compatible implementation: `verifySignature` and
 * `parseWebhookEvent` implement Stripe's actual, publicly documented
 * signature scheme and event shapes (for the handful of event types this
 * integration acts on) — these work correctly and are fully tested without
 * needing a live Stripe account, because verifying a signature and parsing
 * a JSON shape are pure, offline operations. `createCheckoutSession` and
 * `issueRefund` require an actual network call to Stripe's API with a real
 * secret key; without one configured, they return a clear `{ error }`
 * rather than silently pretending to succeed — this integration is
 * genuinely optional, the same pattern as lib/ai/explain.ts's AI provider.
 */
class StripeCompatibleProvider implements PaymentProvider {
  readonly name = "stripe"

  isConfigured(): boolean {
    return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET
  }

  verifySignature(rawBody: string, signatureHeader: string | null): boolean {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret) return false
    return verifyWebhookSignature(rawBody, signatureHeader, secret).valid
  }

  parseWebhookEvent(rawBody: string): NormalizedWebhookEvent | null {
    let event: unknown
    try {
      event = JSON.parse(rawBody)
    } catch {
      return null
    }
    if (!isRecord(event) || typeof event.id !== "string" || typeof event.type !== "string") {
      return null
    }

    const object = isRecord(event.data) && isRecord(event.data.object) ? event.data.object : {}

    switch (event.type) {
      case "payment_intent.succeeded":
        return {
          id: event.id,
          type: "payment.succeeded",
          data: {
            providerTransactionId: str(object.id),
            amountCents: num(object.amount),
            currency: str(object.currency),
            userId: isRecord(object.metadata) ? str(object.metadata.userId) : undefined,
          },
        }
      case "payment_intent.payment_failed":
        return {
          id: event.id,
          type: "payment.failed",
          data: {
            providerTransactionId: str(object.id),
            failureReason: isRecord(object.last_payment_error)
              ? str(object.last_payment_error.message)
              : undefined,
          },
        }
      case "charge.refunded":
        return {
          id: event.id,
          type: "payment.refunded",
          data: {
            providerTransactionId: str(object.payment_intent),
            refundedAmountCents: num(object.amount_refunded),
          },
        }
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        return {
          id: event.id,
          type: event.type === "customer.subscription.deleted" ? "subscription.canceled" : "subscription.updated",
          data: {
            providerSubscriptionId: str(object.id),
            subscriptionStatus: normalizeSubStatus(str(object.status)),
            currentPeriodStart: epochToIso(num(object.current_period_start)),
            currentPeriodEnd: epochToIso(num(object.current_period_end)),
          },
        }
      default:
        return null // a real event type this integration simply doesn't act on
    }
  }

  async createCheckoutSession(): Promise<CheckoutSessionResult> {
    if (!this.isConfigured()) {
      return { error: "Payments are not configured" }
    }
    // A real integration POSTs to Stripe's Checkout Sessions API here with
    // STRIPE_SECRET_KEY. Deliberately not implemented against a live
    // network call in this codebase — see docs/payments.md — but every
    // caller (actions/billing.actions.ts) already handles the
    // `{ error }` branch as a normal, expected outcome, not a crash.
    return { error: "Checkout session creation requires a live Stripe integration, not implemented in this environment" }
  }

  async issueRefund(): Promise<RefundResult> {
    if (!this.isConfigured()) {
      return { error: "Payments are not configured" }
    }
    return { error: "Refund issuance requires a live Stripe integration, not implemented in this environment" }
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}
function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined
}
function num(v: unknown): number | undefined {
  return typeof v === "number" ? v : undefined
}
function epochToIso(seconds: number | undefined): string | undefined {
  return typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : undefined
}
function normalizeSubStatus(status: string | undefined): NormalizedWebhookEvent["data"]["subscriptionStatus"] {
  if (status === "active" || status === "past_due" || status === "canceled" || status === "trialing") {
    return status
  }
  return undefined
}

let provider: PaymentProvider | undefined

/** The one place the rest of the app asks "which provider." Swapping
 * providers (or adding a second, selected by env var) changes only this
 * function. */
export function getPaymentProvider(): PaymentProvider {
  if (!provider) provider = new StripeCompatibleProvider()
  return provider
}

/** Test-only: inject a fake provider instead of the real Stripe-compatible
 * one, or reset to it. */
export function _setPaymentProviderForTests(p: PaymentProvider | undefined) {
  provider = p
}
