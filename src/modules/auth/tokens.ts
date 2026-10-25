import { randomBytes, randomInt, createHash, timingSafeEqual } from "crypto"

const OTP_LENGTH = 6
const OTP_TTL_MS = 10 * 60 * 1000
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000
const MAX_VERIFY_ATTEMPTS = 5

/** 6-digit numeric OTP, e.g. for email verification. */
export function generateOtp() {
  return randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0")
}

/** High-entropy URL-safe token, e.g. for a password-reset link. */
export function generateResetToken() {
  return randomBytes(32).toString("hex")
}

/**
 * Deterministic hash so a token/OTP can be looked up by its hash
 * (unlike a password hash, which is salted and never queried by value).
 */
export function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex")
}

export function tokenMatches(raw: string, tokenHash: string) {
  const candidate = Buffer.from(hashToken(raw))
  const expected = Buffer.from(tokenHash)
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  )
}

export function otpExpiry(now = new Date()) {
  return new Date(now.getTime() + OTP_TTL_MS)
}

export function resetTokenExpiry(now = new Date()) {
  return new Date(now.getTime() + RESET_TOKEN_TTL_MS)
}

export function hasExceededVerifyAttempts(attempts: number) {
  return attempts >= MAX_VERIFY_ATTEMPTS
}
