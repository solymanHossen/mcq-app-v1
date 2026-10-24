import { afterAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/db"
import { hashPassword } from "./password"
import { resolveCurrentUser, revokeAllSessions } from "./guards"

const email = `guards-test+${Date.now()}@example.com`
let userId: string

async function createTestUser() {
  const user = await prisma.user.create({
    data: {
      name: "Guards Test",
      email,
      passwordHash: await hashPassword("irrelevant"),
      isEmailVerified: true,
    },
  })
  userId = user.id
  return user
}

afterAll(async () => {
  if (userId) await prisma.user.delete({ where: { id: userId } })
})

describe("resolveCurrentUser (integration, live Postgres)", () => {
  it("returns the user when the session's tokenVersion matches the DB", async () => {
    const user = await createTestUser()
    const resolved = await resolveCurrentUser({
      id: user.id,
      tokenVersion: user.tokenVersion,
    })
    expect(resolved?.id).toBe(user.id)
  })

  it("rejects an inactive account even with a matching tokenVersion", async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    })
    const resolved = await resolveCurrentUser({ id: userId, tokenVersion: 0 })
    expect(resolved).toBeNull()
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    })
  })

  it("rejects a stale tokenVersion after revokeAllSessions", async () => {
    // session was issued when tokenVersion was 0
    const staleIdentity = { id: userId, tokenVersion: 0 }
    expect((await resolveCurrentUser(staleIdentity))?.id).toBe(userId)

    await revokeAllSessions(userId)

    expect(await resolveCurrentUser(staleIdentity)).toBeNull()
  })

  it("accepts a session issued after the revocation", async () => {
    const fresh = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    })
    const resolved = await resolveCurrentUser({
      id: userId,
      tokenVersion: fresh.tokenVersion,
    })
    expect(resolved?.id).toBe(userId)
  })
})
