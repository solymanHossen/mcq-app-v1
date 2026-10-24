"use server"

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
import {
  registerSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validators"

// ─── Register ─────────────────────────────────────────
export async function registerAction(_state: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Email already registered" }

  const passwordHash = await hashPassword(password)

  let user
  try {
    user = await prisma.user.create({ data: { name, email, passwordHash } })
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { error: "Email already registered" }
    }
    throw e
  }

  const otp = generateOtp()
  await prisma.authToken.create({
    data: {
      userId: user.id,
      purpose: "EMAIL_VERIFICATION",
      tokenHash: hashToken(otp),
      expiresAt: otpExpiry(),
    },
  })
  await sendVerificationEmail(email, otp)

  redirect(`/verify-email?email=${encodeURIComponent(email)}`)
}

// ─── Verify Email OTP ─────────────────────────────────
export async function verifyEmailAction(_state: unknown, formData: FormData) {
  const parsed = verifyEmailSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const { email, otp } = parsed.data

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
    return { error: "Invalid or expired OTP" }
  }

  if (!tokenMatches(otp, token.tokenHash)) {
    await prisma.authToken.update({
      where: { id: token.id },
      data: { attempts: { increment: 1 } },
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

  redirect("/login?verified=true")
}

// ─── Resend OTP ───────────────────────────────────────
export async function resendOTPAction(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })

  // Don't reveal whether the account exists or is already verified.
  if (!user || user.isEmailVerified) return { success: true }

  const recent = await prisma.authToken.findFirst({
    where: { userId: user.id, purpose: "EMAIL_VERIFICATION" },
    orderBy: { createdAt: "desc" },
  })
  if (recent && Date.now() - recent.createdAt.getTime() < 60_000) {
    return { error: "Please wait a minute before requesting another code" }
  }

  const otp = generateOtp()
  await prisma.authToken.create({
    data: {
      userId: user.id,
      purpose: "EMAIL_VERIFICATION",
      tokenHash: hashToken(otp),
      expiresAt: otpExpiry(),
    },
  })
  await sendVerificationEmail(email, otp)

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

  // Always report success — don't reveal whether the email is registered.
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

  redirect("/login?reset=true")
}
