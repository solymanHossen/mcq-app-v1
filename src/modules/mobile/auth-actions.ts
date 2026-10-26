import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/prisma/generated/prisma/client"
import { UnauthorizedError, RateLimitedError } from "@/lib/errors"
import { hashPassword, verifyPassword } from "@/modules/auth/password"
import { tokenMatches, hasExceededVerifyAttempts } from "@/modules/auth/tokens"
import { issueEmailVerificationOtp } from "@/modules/auth/actions"
import { recordAuditEvent } from "@/modules/auth/audit"
import {
  isRegisterRateLimited,
  isLoginRateLimited,
  isVerifyEmailRateLimited,
} from "@/modules/auth/rate-limit"
import { registerSchema, loginSchema, verifyEmailSchema } from "@/modules/auth/validators"
import { getSystemSettings } from "@/modules/settings/queries"
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
} from "@/modules/mobile/tokens"

/**
 * The REST/mobile counterpart of modules/auth/actions.ts: same validation,
 * rate limits, and audit trail, but JSON in/out instead of FormData, and
 * issuing a bearer token pair instead of establishing a cookie session —
 * NextAuth's signIn() is a browser-session mechanism and isn't used here at
 * all. Some control flow is necessarily duplicated from actions.ts/lib/
 * auth.ts (different output shape), but every security-sensitive primitive
 * (password hashing, OTP matching, rate limiting, audit logging) is the
 * exact same shared function, not reimplemented.
 */

const refreshRequestSchema = z.object({ refreshToken: z.string().min(1) })

async function issueTokenPair(
  user: { id: string; tokenVersion: number },
  userAgent: string | undefined
) {
  const accessToken = await signAccessToken({ id: user.id, tokenVersion: user.tokenVersion })
  const refreshToken = generateRefreshToken()

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: refreshTokenExpiry(),
      userAgent,
    },
  })

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer" as const,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  }
}

export async function registerMobile(input: unknown, ip: string | undefined) {
  const { name, email, password } = registerSchema.parse(input)

  if (await isRegisterRateLimited(ip)) {
    await recordAuditEvent({
      action: "RATE_LIMITED",
      identifier: email,
      ip,
      metadata: { context: "register" },
    })
    throw new RateLimitedError()
  }

  const { requireEmailVerification } = await getSystemSettings()
  const existing = await prisma.user.findUnique({ where: { email } })

  if (!existing) {
    const passwordHash = await hashPassword(password)
    try {
      const user = await prisma.user.create({
        data: { name, email, passwordHash, isEmailVerified: !requireEmailVerification },
      })
      if (requireEmailVerification) await issueEmailVerificationOtp(user.id, email)
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") {
        throw e
      }
      // Lost a create race to a concurrent registration for the same email.
    }
  } else if (!existing.isEmailVerified) {
    if (requireEmailVerification) {
      await issueEmailVerificationOtp(existing.id, email)
    } else {
      await prisma.user.update({ where: { id: existing.id }, data: { isEmailVerified: true } })
    }
  }
  // else: already registered and verified — silent no-op, same as the web flow.

  await recordAuditEvent({ action: "REGISTER", identifier: email, ip })

  // Never reveals whether the email was already taken — same response
  // whichever branch above ran.
  return { requiresEmailVerification: requireEmailVerification }
}

export async function verifyEmailMobile(input: unknown) {
  const { email, otp } = verifyEmailSchema.parse(input)

  if (await isVerifyEmailRateLimited(email)) {
    await recordAuditEvent({
      action: "RATE_LIMITED",
      identifier: email,
      metadata: { context: "verify-email" },
    })
    throw new RateLimitedError()
  }

  const user = await prisma.user.findUnique({ where: { email } })
  const token = user
    ? await prisma.authToken.findFirst({
        where: { userId: user.id, purpose: "EMAIL_VERIFICATION", consumedAt: null },
        orderBy: { createdAt: "desc" },
      })
    : null

  if (!user || !token || token.expiresAt < new Date() || hasExceededVerifyAttempts(token.attempts)) {
    await recordAuditEvent({ action: "EMAIL_VERIFY_FAILED", success: false, identifier: email })
    throw new UnauthorizedError("Invalid or expired OTP")
  }

  if (!tokenMatches(otp, token.tokenHash)) {
    await prisma.authToken.update({ where: { id: token.id }, data: { attempts: { increment: 1 } } })
    await recordAuditEvent({ action: "EMAIL_VERIFY_FAILED", success: false, identifier: email })
    throw new UnauthorizedError("Invalid or expired OTP")
  }

  await prisma.$transaction([
    prisma.authToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } }),
  ])
  await recordAuditEvent({ action: "EMAIL_VERIFIED", identifier: email, actorId: user.id })

  return { success: true }
}

export async function loginMobile(
  input: unknown,
  ip: string | undefined,
  userAgent: string | undefined
) {
  const { email, password } = loginSchema.parse(input)

  if (await isLoginRateLimited(email, ip)) {
    await recordAuditEvent({
      action: "RATE_LIMITED",
      identifier: email,
      ip,
      metadata: { context: "login" },
    })
    throw new RateLimitedError()
  }

  const user = await prisma.user.findUnique({ where: { email } })
  const { requireEmailVerification } = await getSystemSettings()

  // Same generic failure for "no such user", "wrong password", "not
  // verified", and "suspended" as the web login — never reveal which.
  if (!user || !user.isActive || (requireEmailVerification && !user.isEmailVerified)) {
    await recordAuditEvent({ action: "LOGIN_FAILURE", success: false, identifier: email, ip })
    throw new UnauthorizedError("Invalid credentials")
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    await recordAuditEvent({ action: "LOGIN_FAILURE", success: false, identifier: email, ip })
    throw new UnauthorizedError("Invalid credentials")
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  await recordAuditEvent({ action: "LOGIN_SUCCESS", identifier: email, ip, actorId: user.id })

  const tokens = await issueTokenPair(user, userAgent)
  return {
    ...tokens,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }
}

export async function refreshMobile(input: unknown, userAgent: string | undefined) {
  const { refreshToken } = refreshRequestSchema.parse(input)
  const tokenHash = hashRefreshToken(refreshToken)

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } })
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Invalid or expired refresh token")
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } })
  if (!user || !user.isActive) {
    throw new UnauthorizedError("Account no longer active")
  }

  // Rotate on every redemption — a stolen refresh token works at most once
  // before the legitimate client's own next refresh reveals it's gone.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  })

  return issueTokenPair(user, userAgent)
}

export async function logoutMobile(input: unknown) {
  const { refreshToken } = refreshRequestSchema.parse(input)
  const tokenHash = hashRefreshToken(refreshToken)

  // Idempotent no-op if already revoked/unknown — logging out twice, or
  // logging out a token that expired naturally, isn't an error.
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  return { success: true }
}
