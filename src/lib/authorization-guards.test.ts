import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}))
vi.mock("next/server", () => ({ connection: vi.fn().mockResolvedValue(undefined) }))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
}))

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  assertOwner,
  assertRole,
  canAccessRole,
  requireRole,
  type CurrentUser,
} from "./authorization"
import { ForbiddenError, UnauthorizedError } from "./errors"
import { requireApiRole } from "@/modules/mobile/auth"

const mockAuth = vi.mocked(auth)
const mockFindUser = vi.mocked(prisma.user.findUnique)

function currentUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: "applicant-1",
    name: "Teacher Applicant",
    email: "applicant@example.com",
    role: "STUDENT",
    isGuest: false,
    teacherVerificationStatus: "PENDING",
    ...overrides,
  }
}

function authenticate(user: CurrentUser) {
  mockAuth.mockResolvedValue({
    user: { id: user.id, role: user.role, tokenVersion: 0 },
    expires: "",
  } as never)
  mockFindUser.mockResolvedValue({
    ...user,
    isActive: true,
    tokenVersion: 0,
  } as never)
}

beforeEach(() => {
  mockAuth.mockReset()
  mockFindUser.mockReset()
  vi.mocked(redirect).mockClear()
})

describe("student access during teacher verification", () => {
  it.each([
    { role: "STUDENT", teacherVerificationStatus: "PENDING" },
    { role: "TEACHER", teacherVerificationStatus: "PENDING" },
    { role: "TEACHER", teacherVerificationStatus: "REJECTED" },
  ] as const)(
    "allows $role / $teacherVerificationStatus through page, action, and API guards",
    async (identity) => {
      const user = currentUser(identity)
      authenticate(user)

      expect(canAccessRole(user, "STUDENT")).toBe(true)
      await expect(requireRole("STUDENT")).resolves.toEqual(user)
      await expect(assertRole("STUDENT")).resolves.toEqual(user)
      expect(requireApiRole(user, "STUDENT")).toBe(user)
      expect(redirect).not.toHaveBeenCalled()
    },
  )

  it("does not give a student applicant teacher or admin permissions", async () => {
    const user = currentUser()
    authenticate(user)

    expect(canAccessRole(user, "TEACHER", "ADMIN", "SUPER_ADMIN")).toBe(false)
    await expect(requireRole("TEACHER")).rejects.toThrow("NEXT_REDIRECT:/dashboard")
    await expect(assertRole("TEACHER")).rejects.toThrow(ForbiddenError)
    expect(() => requireApiRole(user, "TEACHER")).toThrow(ForbiddenError)
  })

  it("preserves existing teacher-role permissions for unverified teacher accounts", async () => {
    const user = currentUser({ role: "TEACHER" })
    authenticate(user)

    expect(canAccessRole(user, "TEACHER")).toBe(true)
    await expect(assertRole("TEACHER")).resolves.toEqual(user)
    expect(requireApiRole(user, "TEACHER")).toBe(user)
    expect(canAccessRole(user, "ADMIN", "SUPER_ADMIN")).toBe(false)
  })

  it.each(["PENDING", "REJECTED"] as const)(
    "returns a %s teacher applicant to the student dashboard when a role is denied",
    async (teacherVerificationStatus) => {
      const user = currentUser({ role: "TEACHER", teacherVerificationStatus })
      authenticate(user)

      await expect(requireRole("ADMIN")).rejects.toThrow("NEXT_REDIRECT:/dashboard")
      await expect(assertRole("ADMIN")).rejects.toThrow(ForbiddenError)
      expect(() => requireApiRole(user, "ADMIN")).toThrow(ForbiddenError)
    },
  )

  it("keeps approved teachers out of student-only pages and mutations", async () => {
    const user = currentUser({ role: "TEACHER", teacherVerificationStatus: "VERIFIED" })
    authenticate(user)

    expect(canAccessRole(user, "STUDENT")).toBe(false)
    await expect(requireRole("STUDENT")).rejects.toThrow("NEXT_REDIRECT:/teacher")
    expect(redirect).toHaveBeenCalledWith("/teacher")
    await expect(assertRole("STUDENT")).rejects.toThrow(ForbiddenError)
    expect(() => requireApiRole(user, "STUDENT")).toThrow(ForbiddenError)
    await expect(requireRole("TEACHER")).resolves.toEqual(user)
  })

  it.each(["ADMIN", "SUPER_ADMIN"] as const)(
    "preserves %s permissions without granting student access",
    async (role) => {
      const user = currentUser({ role })
      authenticate(user)

      expect(canAccessRole(user, "STUDENT")).toBe(false)
      await expect(requireRole("STUDENT")).rejects.toThrow("NEXT_REDIRECT:/admin")
      await expect(assertRole("STUDENT")).rejects.toThrow(ForbiddenError)
      expect(() => requireApiRole(user, "STUDENT")).toThrow(ForbiddenError)
      await expect(requireRole("ADMIN", "SUPER_ADMIN")).resolves.toEqual(user)
      await expect(assertRole("ADMIN", "SUPER_ADMIN")).resolves.toEqual(user)
      expect(requireApiRole(user, "ADMIN", "SUPER_ADMIN")).toBe(user)
    },
  )

  it.each(["STUDENT", "TEACHER"] as const)(
    "uses the database approval immediately with an existing %s session",
    async (role) => {
      const applicant = currentUser({ role })
      authenticate(applicant)
      await expect(requireRole("STUDENT")).resolves.toEqual(applicant)

      const approved = { ...applicant, role: "TEACHER", teacherVerificationStatus: "VERIFIED" } as const
      mockFindUser.mockResolvedValue({
        ...approved,
        isActive: true,
        tokenVersion: 0,
      } as never)

      // The session still contains the applicant's pre-approval role.
      await expect(requireRole("STUDENT")).rejects.toThrow("NEXT_REDIRECT:/teacher")
      await expect(assertRole("STUDENT")).rejects.toThrow(ForbiddenError)
      await expect(requireRole("TEACHER")).resolves.toEqual(approved)
      expect(mockFindUser).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { id: applicant.id } }),
      )
    },
  )

  it("retains ownership checks for pending teacher applicants", async () => {
    const user = currentUser({ role: "TEACHER" })
    authenticate(user)

    const applicant = await assertRole("STUDENT")
    expect(() => assertOwner(applicant, applicant.id)).not.toThrow()
    expect(() => assertOwner(applicant, "another-student")).toThrow(ForbiddenError)
  })

  it("does not admit suspended or revoked applicants", async () => {
    const user = currentUser({ role: "TEACHER" })
    authenticate(user)
    mockFindUser.mockResolvedValue({
      ...user,
      isActive: false,
      tokenVersion: 0,
    } as never)

    await expect(requireRole("STUDENT")).rejects.toThrow("NEXT_REDIRECT:/login")
    await expect(assertRole("STUDENT")).rejects.toThrow(UnauthorizedError)

    mockFindUser.mockResolvedValue({
      ...user,
      isActive: true,
      tokenVersion: 1,
    } as never)
    await expect(requireRole("STUDENT")).rejects.toThrow("NEXT_REDIRECT:/login")
    await expect(assertRole("STUDENT")).rejects.toThrow(UnauthorizedError)
  })
})
