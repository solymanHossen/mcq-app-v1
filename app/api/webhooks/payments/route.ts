import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getPaymentProvider } from "@/lib/payments/provider"
import { recordWebhookEvent, markWebhookEventProcessed, markWebhookEventFailed } from "@/lib/payments/events"
import { applyWebhookEvent } from "@/lib/payments/webhook-processor"

/**
 * The only HTTP entry point for payment events, and the only place in the
 * app that trusts a payment provider's word for anything — nowhere else
 * (least of all a browser redirect back from a checkout page) is ever
 * treated as proof a payment succeeded. See lib/payments/provider.ts for
 * the signature scheme and lib/payments/events.ts for the idempotency
 * mechanism this route composes.
 *
 * An invalid signature is rejected before the body is ever parsed as JSON
 * or recorded as an event at all — an unverified payload isn't "a webhook
 * event we failed to process," it's not ours to act on in the first place.
 */
export async function POST(request: NextRequest) {
  const provider = getPaymentProvider()
  const rawBody = await request.text()
  const signatureHeader = request.headers.get("stripe-signature")

  if (!provider.verifySignature(rawBody, signatureHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const parsed = provider.parseWebhookEvent(rawBody)
  if (!parsed) {
    // A real, verified event type this integration doesn't act on — still
    // a success from the provider's point of view, nothing to retry.
    return NextResponse.json({ received: true, ignored: true })
  }

  const { eventId, alreadyProcessed } = await recordWebhookEvent({
    provider: provider.name,
    providerEventId: parsed.id,
    type: parsed.type,
    payload: JSON.parse(rawBody),
  })

  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    await prisma.$transaction((tx) => applyWebhookEvent(tx, parsed))
    await markWebhookEventProcessed(eventId)
    return NextResponse.json({ received: true })
  } catch (e) {
    await markWebhookEventFailed(eventId, e instanceof Error ? e.message : String(e))
    // Non-2xx so the provider's own retry schedule retries this delivery —
    // safe to retry any number of times (see applyWebhookEvent's module
    // comment on idempotent-by-construction handlers).
    return NextResponse.json({ error: "Processing failed, will retry" }, { status: 500 })
  }
}
