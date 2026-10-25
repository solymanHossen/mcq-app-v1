import { randomUUID } from "crypto"
import { prisma } from "@/lib/db"
import type { Prisma } from "@/prisma/generated/prisma/client"

/**
 * The entire idempotency mechanism: `createMany` + `skipDuplicates`
 * (SQL `ON CONFLICT DO NOTHING`), never `create()` + catch(P2002) — a caught
 * unique-constraint violation still poisons the rest of a Postgres
 * transaction (see lib/learning/xp.ts's awardXP for the full explanation
 * and the test failures that first surfaced it). Recording happens BEFORE
 * any processing — see lib/payments/webhook-processor.ts — so a provider
 * redelivering the same event any number of times (which webhook providers
 * routinely do, deliberately, for reliability) is processed at most once.
 */
/**
 * `alreadyProcessed` is the real idempotency signal the webhook route acts
 * on — NOT `isNew`. A webhook provider retries undelivered-looking events
 * automatically, including ones that failed on OUR side after being
 * recorded (a transient DB hiccup mid-processing, say); treating "already
 * recorded" alone as "skip" would mean a processing failure is never
 * retried and the payment silently never gets applied. Only an event whose
 * `processedAt` is already set is truly done; everything else (new, or
 * recorded-but-never-finished) should be (re)processed — and because the
 * actual state changes downstream are themselves idempotent (upsert by
 * providerTransactionId), reprocessing is always safe.
 */
export async function recordWebhookEvent(opts: {
  provider: string
  providerEventId: string
  type: string
  payload: Prisma.InputJsonValue
}): Promise<{ eventId: string; alreadyProcessed: boolean }> {
  const id = randomUUID()
  await prisma.webhookEvent.createMany({
    data: [
      {
        id,
        provider: opts.provider,
        providerEventId: opts.providerEventId,
        type: opts.type,
        payload: opts.payload,
      },
    ],
    skipDuplicates: true,
  })

  const row = await prisma.webhookEvent.findUniqueOrThrow({
    where: { provider_providerEventId: { provider: opts.provider, providerEventId: opts.providerEventId } },
    select: { id: true, processedAt: true },
  })
  return { eventId: row.id, alreadyProcessed: row.processedAt !== null }
}

export async function markWebhookEventProcessed(eventId: string): Promise<void> {
  await prisma.webhookEvent.update({
    where: { id: eventId },
    data: { processedAt: new Date(), processingError: null },
  })
}

export async function markWebhookEventFailed(eventId: string, error: string): Promise<void> {
  await prisma.webhookEvent.update({
    where: { id: eventId },
    data: { processingError: error.slice(0, 2000) },
  })
}
