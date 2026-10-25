import { createHmac, timingSafeEqual } from "crypto"

/**
 * Webhook signature verification, Stripe-compatible: the same publicly
 * documented scheme Stripe's own SDK implements
 * (https://docs.stripe.com/webhooks#verify-manually) — `Stripe-Signature:
 * t=<unix seconds>,v1=<hex hmac>`, the signed payload is
 * `${timestamp}.${rawBody}`, HMAC-SHA256 with the endpoint's signing secret.
 * Implemented directly against Node's `crypto` rather than depending on the
 * `stripe` package, so this module has zero dependency on which payment
 * provider is actually configured (or whether one is configured at all) —
 * see lib/payments/provider.ts.
 *
 * Two independent checks, both required:
 * 1. The signature itself, compared in constant time
 *    (`timingSafeEqual`) — a non-constant-time string comparison here would
 *    leak timing information an attacker could use to forge a valid
 *    signature byte by byte.
 * 2. The timestamp is within a tolerance window of "now" — without this, a
 *    signature captured once (e.g. from network logs) stays forgeable
 *    forever; the tolerance window makes it a replay attack with a short,
 *    bounded blast radius instead of permanent.
 */

const SIGNATURE_TOLERANCE_SECONDS = 300

export type SignatureVerificationResult =
  | { valid: true }
  | { valid: false; reason: string }

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
  now: Date = new Date()
): SignatureVerificationResult {
  if (!signatureHeader) return { valid: false, reason: "Missing signature header" }
  if (!secret) return { valid: false, reason: "No webhook signing secret configured" }

  const parts: Record<string, string> = {}
  for (const segment of signatureHeader.split(",")) {
    const eq = segment.indexOf("=")
    if (eq === -1) continue
    parts[segment.slice(0, eq).trim()] = segment.slice(eq + 1).trim()
  }

  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return { valid: false, reason: "Malformed signature header" }

  const timestampSeconds = Number(timestamp)
  if (!Number.isFinite(timestampSeconds)) {
    return { valid: false, reason: "Invalid timestamp in signature header" }
  }
  const ageSeconds = Math.abs(now.getTime() / 1000 - timestampSeconds)
  if (ageSeconds > SIGNATURE_TOLERANCE_SECONDS) {
    return { valid: false, reason: "Timestamp outside tolerance window" }
  }

  const expectedHex = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex")

  let expectedBuf: Buffer
  let actualBuf: Buffer
  try {
    expectedBuf = Buffer.from(expectedHex, "hex")
    actualBuf = Buffer.from(signature, "hex")
  } catch {
    return { valid: false, reason: "Malformed signature encoding" }
  }
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
    return { valid: false, reason: "Signature mismatch" }
  }

  return { valid: true }
}

/** Test/dev helper: builds a header the way a real provider would, so tests
 * can exercise verifyWebhookSignature against a genuinely valid signature
 * instead of a hand-rolled fake. */
export function signWebhookPayload(
  rawBody: string,
  secret: string,
  timestampSeconds: number = Math.floor(Date.now() / 1000)
): string {
  const signature = createHmac("sha256", secret).update(`${timestampSeconds}.${rawBody}`).digest("hex")
  return `t=${timestampSeconds},v1=${signature}`
}
