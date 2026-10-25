"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Prisma } from "@/prisma/generated/prisma/client"
import { hashPassword } from "@/lib/auth/password"
import {
  generateOtp,
  generateResetToken,
  hashToken,
  tokenMatches,
  otpExpiry,
  resetTokenExpiry,
  hasExceededVerifyAttempts,
} from "@/lib/auth/tokens"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/auth/mail"
import { getClientIp } from "@/lib/auth/ip"
import { recordAuditEvent } from "@/lib/auth/audit"
import {
  isRegisterRateLimited,
  isForgotPasswordRateLimited,
  isVerifyEmailRateLimited,
  isResendOtpRateLimited,
} from "@/lib/auth/rate-limit"
import { revokeAllSessions } from "@/lib/auth/guards"
import {
  registerSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validators"

async function clientIp() {
  // Best-effort only: IP extraction must never be able to break the actual
  // auth operation (and has no request to read from outside one, e.g. tests
  // or a direct function call).
  try {
    return getClientIp(await headers())
  } catch {
    return undefined
  }
}

// ─── Register ─────────────────────────────────────────
export async function registerAction(_state: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const { name, email, password } = parsed.data
  const ip = await clientIp()

  if (await isRegisterRateLimited(ip)) {
    await recordAuditEvent({
      action: "RATE_LIMITED",
      identifier: email,
      ip,
      metadata: { context: "register" },
    })
    return { error: "Too many attempts, please try again later" }
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (!existing) {
    // Explicit field list, never a spread of raw input — `role` can never
    // arrive from the client this way.
    const passwordHash = await hashPassword(password)
    try {
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
      })
      await issueEmailVerificationOtp(user.id, email)
    } catch (e) {
      if (
        !(e instanceof Prisma.PrismaClientKnownRequestError) ||
        e.code !== "P2002"
      ) {
        throw e
      }
      // Lost a create race to a concurrent registration for the same email;
      // the winning request already sent a verification OTP.
    }
  } else if (!existing.isEmailVerified) {
    // Account exists but was never verified — treat this like a resend
    // rather than silently failing. Never touches password/name here.
    await issueEmailVerificationOtp(existing.id, email)
  }
  // else: already registered and verified — silent no-op. Never overwrite an
  // existing account's password just because the register form was resubmitted.

  await recordAuditEvent({ action: "REGISTER", identifier: email, ip })

  // Identical response whether or not the email was already taken — the
  // register form must not reveal which emails already have an account.
  redirect(`/verify-email?email=${encodeURIComponent(email)}`)
}

async function issueEmailVerificationOtp(userId: string, email: string) {
  const otp = generateOtp()
  await prisma.authToken.create({
    data: {
      userId,
      purpose: "EMAIL_VERIFICATION",
      tokenHash: hashToken(otp),
      expiresAt: otpExpiry(),
    },
  })
  await sendVerificationEmail(email, otp)
}

// ─── Verify Email OTP ─────────────────────────────────
export async function verifyEmailAction(_state: unknown, formData: FormData) {
  const parsed = verifyEmailSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const { email, otp } = parsed.data

  if (await isVerifyEmailRateLimited(email)) {
    await recordAuditEvent({
      action: "RATE_LIMITED",
      identifier: email,
      metadata: { context: "verify-email" },
    })
    return { error: "Too many attempts, please try again later" }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  const token = user
    ? await prisma.authToken.findFirst({
        where: {
          userId: user.id,
          purpose: "EMAIL_VERIFICATION",
          consumedAt: null,
        },
        orderBy: { createdAt: "desc" },
      })
    : null

  if (
    !user ||
    !token ||
    token.expiresAt < new Date() ||
    hasExceededVerifyAttempts(token.attempts)
  ) {
    await recordAuditEvent({
      action: "EMAIL_VERIFY_FAILED",
      success: false,
      identifier: email,
    })
    return { error: "Invalid or expired OTP" }
  }

  if (!tokenMatches(otp, token.tokenHash)) {
    await prisma.authToken.update({
      where: { id: token.id },
      data: { attempts: { increment: 1 } },
    })
    await recordAuditEvent({
      action: "EMAIL_VERIFY_FAILED",
      success: false,
      identifier: email,
    })
    return { error: "Invalid or expired OTP" }
  }

  await prisma.$transaction([
    prisma.authToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    }),
  ])
  await recordAuditEvent({
    action: "EMAIL_VERIFIED",
    identifier: email,
    actorId: user.id,
  })

  redirect("/login?verified=true")
}

// ─── Resend OTP ───────────────────────────────────────
export async function resendOTPAction(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })

  // Don't reveal whether the account exists or is already verified.
  if (!user || user.isEmailVerified) return { success: true }

  if (await isResendOtpRateLimited(email)) {
    return { error: "Too many attempts, please try again later" }
  }

  const recent = await prisma.authToken.findFirst({
    where: { userId: user.id, purpose: "EMAIL_VERIFICATION" },
    orderBy: { createdAt: "desc" },
  })
  if (recent && Date.now() - recent.createdAt.getTime() < 60_000) {
    return { error: "Please wait a minute before requesting another code" }
  }

  await issueEmailVerificationOtp(user.id, email)
  await recordAuditEvent({
    action: "OTP_RESENT",
    identifier: email,
    actorId: user.id,
  })

  return { success: true }
}

// ─── Forgot Password ──────────────────────────────────
export async function forgotPasswordAction(
  _state: unknown,
  formData: FormData
) {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const { email } = parsed.data
  const ip = await clientIp()

  // Rate-limited or not, pre-auth responses on this endpoint must look
  // identical — otherwise the response itself becomes an enumeration oracle.
  if (!(await isForgotPasswordRateLimited(email, ip))) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      const token = generateResetToken()
      await prisma.authToken.create({
        data: {
          userId: user.id,
          purpose: "PASSWORD_RESET",
          tokenHash: hashToken(token),
          expiresAt: resetTokenExpiry(),
        },
      })
      await sendPasswordResetEmail(email, token)
    }
  }

  await recordAuditEvent({
    action: "PASSWORD_RESET_REQUESTED",
    identifier: email,
    ip,
  })

  return { success: true }
}

// ─── Reset Password ───────────────────────────────────
export async function resetPasswordAction(
  token: string,
  _state: unknown,
  formData: FormData
) {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const authToken = await prisma.authToken.findUnique({
    where: { tokenHash: hashToken(token) },
  })

  if (
    !authToken ||
    authToken.purpose !== "PASSWORD_RESET" ||
    authToken.consumedAt ||
    authToken.expiresAt < new Date()
  ) {
    return { error: "Reset failed or link expired" }
  }

  const passwordHash = await hashPassword(parsed.data.password)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: authToken.userId },
      data: { passwordHash },
    }),
    prisma.authToken.update({
      where: { id: authToken.id },
      data: { consumedAt: new Date() },
    }),
  ])
  // A password reset must kill every session issued before it, not just let
  // old ones expire naturally — otherwise a stolen cookie survives its own
  // victim's password change.
  await revokeAllSessions(authToken.userId)
  await recordAuditEvent({
    action: "PASSWORD_RESET_COMPLETED",
    actorId: authToken.userId,
  })

  redirect("/login?reset=true")
}
