import { describe, expect, it } from "vitest"
import { assertOwner } from "./authorization"
import { ForbiddenError } from "./errors"
import type { CurrentUser } from "./authorization"

function user(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    role: "STUDENT",
    isGuest: false,
    teacherVerificationStatus: "VERIFIED",
    ...overrides,
  }
}

describe("assertOwner", () => {
  it("allows the resource owner", () => {
    expect(() => assertOwner(user({ id: "owner-1" }), "owner-1")).not.toThrow()
  })

  it("rejects a non-owner", () => {
    expect(() => assertOwner(user({ id: "user-1" }), "owner-1")).toThrow(
      ForbiddenError
    )
  })

  it("lets ADMIN bypass ownership entirely", () => {
    expect(() =>
      assertOwner(user({ id: "admin-1", role: "ADMIN" }), "owner-1")
    ).not.toThrow()
  })

  it("does not let TEACHER bypass ownership", () => {
    expect(() =>
      assertOwner(user({ id: "teacher-1", role: "TEACHER" }), "owner-1")
    ).toThrow(ForbiddenError)
  })
})
