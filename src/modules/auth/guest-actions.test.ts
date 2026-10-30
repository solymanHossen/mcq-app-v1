import { describe, expect, it, vi } from "vitest"
import { upgradeGuestAccountAction } from "./guest-actions"
import * as auth from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

describe("upgradeGuestAccountAction", () => {
  it("rejects an already registered (non-guest) user", async () => {
    vi.spyOn(auth, "requireUser").mockResolvedValueOnce({
      id: "u1",
      name: "Regular Student",
      email: "student@example.com",
      role: "STUDENT",
      isGuest: false,
      teacherVerificationStatus: "VERIFIED",
    })

    const fd = new FormData()
    fd.set("password", "secret1234")
    fd.set("confirmPassword", "secret1234")

    const res = await upgradeGuestAccountAction({}, fd)
    expect(res.error).toMatch(/already a full registered account/i)
  })

  it("validates password length and matching confirmation", async () => {
    vi.spyOn(auth, "requireUser").mockResolvedValueOnce({
      id: "u2",
      name: "Guest Student",
      email: "guest@example.com",
      role: "STUDENT",
      isGuest: true,
      teacherVerificationStatus: "VERIFIED",
    })

    const fd = new FormData()
    fd.set("password", "short")
    fd.set("confirmPassword", "short")

    const res = await upgradeGuestAccountAction({}, fd)
    expect(res.error).toMatch(/at least 8 characters/i)

    vi.spyOn(auth, "requireUser").mockResolvedValueOnce({
      id: "u2",
      name: "Guest Student",
      email: "guest@example.com",
      role: "STUDENT",
      isGuest: true,
      teacherVerificationStatus: "VERIFIED",
    })

    const fdMismatch = new FormData()
    fdMismatch.set("password", "password123")
    fdMismatch.set("confirmPassword", "password456")

    const resMismatch = await upgradeGuestAccountAction({}, fdMismatch)
    expect(resMismatch.error).toMatch(/do not match/i)
  })
})
