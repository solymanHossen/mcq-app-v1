import { afterAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import { resolveCurrentUser } from "@/lib/auth/guards"
import {
  registerAction,
  resetPasswordAction,
} from "./auth.actions"

const createdEmails: string[] = []

function uniqueEmail(label: string) {
  const email = `${label}+${Date.now()}+${Math.random().toString(36).slice(2)}@example.com`
  createdEmails.push(email)
  return email
}

async function expectRedirect(promise: Promise<unknown>) {
  try {
    await promise
    throw new Error("expected a NEXT_REDIRECT throw, got a normal return")
  } catch (e) {
    expect((e as { digest?: string }).digest).toMatch(/^NEXT_REDIRECT/)
  }
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: createdEmails } } })
})

describe("registerAction (integration, live Postgres)", () => {
  it("ignores a client-supplied role and always creates a STUDENT", async () => {
    const email = uniqueEmail("privesc")
    const formData = new FormData()
    formData.set("name", "Attempted Admin")
    formData.set("email", email)
    formData.set("password", "Password123!")
    // mass-assignment / privilege-escalation attempt: these fields don't
    // exist on registerSchema and must never reach the User row.
    formData.set("role", "ADMIN")
    formData.set("isActive", "true")
    formData.set("isEmailVerified", "true")

    await expectRedirect(registerAction(undefined, formData))

    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    expect(user.role).toBe("STUDENT")
    expect(user.isEmailVerified).toBe(false)
  })

  it("does not create a duplicate or touch the password for an existing verified email", async () => {
    const email = uniqueEmail("duplicate")
    const originalHash = await hashPassword("OriginalPassword1!")
    const existing = await prisma.user.create({
      data: {
        name: "Existing User",
        email,
        passwordHash: originalHash,
        isEmailVerified: true,
      },
    })

    const formData = new FormData()
    formData.set("name", "Attacker Name")
    formData.set("email", email)
    formData.set("password", "AttackerPassword1!")

    // Same response (redirect to verify-email) as a brand-new registration —
    // the form must not reveal that the email was already taken.
    await expectRedirect(registerAction(undefined, formData))

    const after = await prisma.user.findUniqueOrThrow({
      where: { id: existing.id },
    })
    expect(after.passwordHash).toBe(originalHash)
    expect(after.name).toBe("Existing User")

    const count = await prisma.user.count({ where: { email } })
    expect(count).toBe(1)
  })
})

describe("resetPasswordAction (integration, live Postgres)", () => {
  it("revokes existing sessions when a password reset completes", async () => {
    const email = uniqueEmail("reset")
    const user = await prisma.user.create({
      data: {
        name: "Reset Test",
        email,
        passwordHash: await hashPassword("OldPassword1!"),
        isEmailVerified: true,
      },
    })

    const staleIdentity = { id: user.id, tokenVersion: user.tokenVersion }
    expect((await resolveCurrentUser(staleIdentity))?.id).toBe(user.id)

    const rawToken = "test-raw-reset-token-value"
    const { hashToken, resetTokenExpiry } = await import("@/lib/auth/tokens")
    await prisma.authToken.create({
      data: {
        userId: user.id,
        purpose: "PASSWORD_RESET",
        tokenHash: hashToken(rawToken),
        expiresAt: resetTokenExpiry(),
      },
    })

    const formData = new FormData()
    formData.set("password", "NewPassword1!")
    formData.set("confirmPassword", "NewPassword1!")

    await expectRedirect(resetPasswordAction(rawToken, undefined, formData))

    // the session issued before the reset must no longer resolve
    expect(await resolveCurrentUser(staleIdentity)).toBeNull()
  })
})
