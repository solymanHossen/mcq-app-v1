import { describe, expect, it } from "vitest"
import { verifyWebhookSignature, signWebhookPayload } from "./signature"

const SECRET = "whsec_test_secret"
const BODY = JSON.stringify({ id: "evt_123", type: "payment_intent.succeeded" })

describe("verifyWebhookSignature", () => {
  it("accepts a correctly signed payload", () => {
    const header = signWebhookPayload(BODY, SECRET)
    expect(verifyWebhookSignature(BODY, header, SECRET)).toEqual({ valid: true })
  })

  it("rejects a tampered body", () => {
    const header = signWebhookPayload(BODY, SECRET)
    const tamperedBody = JSON.stringify({ id: "evt_123", type: "payment_intent.succeeded", amount: 999999 })
    const result = verifyWebhookSignature(tamperedBody, header, SECRET)
    expect(result.valid).toBe(false)
  })

  it("rejects a signature produced with the wrong secret", () => {
    const header = signWebhookPayload(BODY, "wrong_secret")
    expect(verifyWebhookSignature(BODY, header, SECRET).valid).toBe(false)
  })

  it("rejects a missing signature header", () => {
    expect(verifyWebhookSignature(BODY, null, SECRET).valid).toBe(false)
    expect(verifyWebhookSignature(BODY, undefined, SECRET).valid).toBe(false)
  })

  it("rejects a malformed signature header", () => {
    expect(verifyWebhookSignature(BODY, "not-a-valid-header", SECRET).valid).toBe(false)
    expect(verifyWebhookSignature(BODY, "t=123", SECRET).valid).toBe(false) // missing v1
  })

  it("rejects when no signing secret is configured", () => {
    const header = signWebhookPayload(BODY, SECRET)
    expect(verifyWebhookSignature(BODY, header, "").valid).toBe(false)
  })

  it("rejects a replayed old signature outside the tolerance window", () => {
    const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600
    const header = signWebhookPayload(BODY, SECRET, tenMinutesAgo)
    expect(verifyWebhookSignature(BODY, header, SECRET).valid).toBe(false)
  })

  it("accepts a timestamp comfortably within the tolerance window", () => {
    const oneMinuteAgo = Math.floor(Date.now() / 1000) - 60
    const header = signWebhookPayload(BODY, SECRET, oneMinuteAgo)
    expect(verifyWebhookSignature(BODY, header, SECRET).valid).toBe(true)
  })

  it("never throws on a garbage signature value", () => {
    expect(() =>
      verifyWebhookSignature(BODY, "t=123,v1=not-hex-!!!", SECRET)
    ).not.toThrow()
  })
})
