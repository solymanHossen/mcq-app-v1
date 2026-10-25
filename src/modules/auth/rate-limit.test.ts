import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/db"
import { isLoginRateLimited, RATE_LIMITS } from "./rate-limit"

const email = `rate-limit-test+${Date.now()}@example.com`

describe("isLoginRateLimited (integration, live Postgres)", () => {
  beforeAll(async () => {
    await prisma.auditLog.deleteMany({ where: { identifier: email } })
  })

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { identifier: email } })
  })

  it("allows attempts under the per-email threshold", async () => {
    for (let i = 0; i < RATE_LIMITS.loginPerEmail.limit - 1; i++) {
      await prisma.auditLog.create({
        data: { action: "LOGIN_FAILURE", success: false, identifier: email },
      })
    }
    expect(await isLoginRateLimited(email)).toBe(false)
  })

  it("blocks once the per-email threshold is reached", async () => {
    // one more failure crosses the threshold set up in the previous test
    await prisma.auditLog.create({
      data: { action: "LOGIN_FAILURE", success: false, identifier: email },
    })
    expect(await isLoginRateLimited(email)).toBe(true)
  })

  it("does not count successes toward the limit", async () => {
    const otherEmail = `rate-limit-success+${Date.now()}@example.com`
    for (let i = 0; i < 20; i++) {
      await prisma.auditLog.create({
        data: { action: "LOGIN_SUCCESS", identifier: otherEmail },
      })
    }
    expect(await isLoginRateLimited(otherEmail)).toBe(false)
    await prisma.auditLog.deleteMany({ where: { identifier: otherEmail } })
  })
})
