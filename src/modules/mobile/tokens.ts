import { SignJWT, jwtVerify, errors as joseErrors } from "jose"
import { generateResetToken, hashToken } from "@/modules/auth/tokens"

// Short-lived — a stolen access token is only ever useful for a few
// minutes; the refresh token (below) is what actually needs revoking to
// shut a session down. Separate from NextAuth's own session JWT (different
// issuer/audience) so the two token families can never be confused for
// each other even though they're signed with the same app secret.
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000
const ISSUER = "examhub-api"
const AUDIENCE = "examhub-mobile"

function secretKey() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is not configured")
  return new TextEncoder().encode(secret)
}

export type AccessTokenIdentity = { id: string; tokenVersion: number }

export async function signAccessToken(identity: AccessTokenIdentity) {
  return new SignJWT({ tokenVersion: identity.tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(identity.id)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(secretKey())
}

/** Returns the decoded identity, or null for any invalid/expired/malformed token — never throws. */
export async function verifyAccessToken(token: string): Promise<AccessTokenIdentity | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    })
    if (typeof payload.sub !== "string" || typeof payload.tokenVersion !== "number") {
      return null
    }
    return { id: payload.sub, tokenVersion: payload.tokenVersion }
  } catch (e) {
    if (e instanceof joseErrors.JOSEError) return null
    throw e
  }
}

export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = ACCESS_TOKEN_TTL_SECONDS

/** Opaque, high-entropy, DB-looked-up — same shape as the password-reset token, not a JWT. */
export function generateRefreshToken() {
  return generateResetToken()
}

export function hashRefreshToken(raw: string) {
  return hashToken(raw)
}

export function refreshTokenExpiry(now = new Date()) {
  return new Date(now.getTime() + REFRESH_TOKEN_TTL_MS)
}
