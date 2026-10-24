import { describe, expect, it } from "vitest"
import {
  generateOtp,
  generateResetToken,
  hashToken,
  tokenMatches,
  hasExceededVerifyAttempts,
} from "./tokens"

describe("generateOtp", () => {
  it("produces a zero-padded 6-digit code", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateOtp()).toMatch(/^\d{6}$/)
    }
  })
})

describe("generateResetToken", () => {
  it("produces a 64-character hex string", () => {
    expect(generateResetToken()).toMatch(/^[0-9a-f]{64}$/)
  })

  it("is not reused between calls", () => {
    expect(generateResetToken()).not.toBe(generateResetToken())
  })
})

describe("hashToken / tokenMatches", () => {
  it("matches the same raw value against its own hash", () => {
    const raw = generateResetToken()
    expect(tokenMatches(raw, hashToken(raw))).toBe(true)
  })

  it("rejects a different raw value", () => {
    const hash = hashToken(generateResetToken())
    expect(tokenMatches(generateResetToken(), hash)).toBe(false)
  })
})

describe("hasExceededVerifyAttempts", () => {
  it("allows attempts under the limit", () => {
    expect(hasExceededVerifyAttempts(0)).toBe(false)
    expect(hasExceededVerifyAttempts(4)).toBe(false)
  })

  it("blocks once the limit is reached", () => {
    expect(hasExceededVerifyAttempts(5)).toBe(true)
    expect(hasExceededVerifyAttempts(6)).toBe(true)
  })
})
