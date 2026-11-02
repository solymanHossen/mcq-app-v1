import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next-auth/jwt", () => ({ getToken: vi.fn() }))

import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"
import { proxy } from "./proxy"

const mockGetToken = vi.mocked(getToken)

beforeEach(() => mockGetToken.mockReset())

describe("teacher application routing", () => {
  it.each(["STUDENT", "TEACHER"])(
    "lets a %s session reach the DB-backed teacher guard after approval",
    async (role) => {
      mockGetToken.mockResolvedValue({ id: "applicant", role } as never)

      const response = await proxy(new NextRequest("http://localhost/teacher"))

      expect(response.headers.get("x-middleware-next")).toBe("1")
      expect(response.headers.get("location")).toBeNull()
    },
  )

  it.each(["/dashboard", "/exams", "/exams/exam-1/attempt", "/mistakes", "/progress", "/leaderboard", "/billing"])(
    "allows a legacy teacher applicant to reach the student guard at %s",
    async (path) => {
      mockGetToken.mockResolvedValue({ id: "applicant", role: "TEACHER" } as never)

      const response = await proxy(new NextRequest(`http://localhost${path}`))

      expect(response.headers.get("x-middleware-next")).toBe("1")
    },
  )

  it.each(["STUDENT", "TEACHER"])(
    "resolves a signed-in %s user's home through the database",
    async (role) => {
      mockGetToken.mockResolvedValue({ id: "applicant", role } as never)

      const response = await proxy(new NextRequest("http://localhost/login"))

      expect(response.headers.get("location")).toBe("http://localhost/dashboard")
    },
  )

  it("still requires sign-in before teacher routes", async () => {
    mockGetToken.mockResolvedValue(null)

    const response = await proxy(new NextRequest("http://localhost/teacher/exams"))
    const target = new URL(response.headers.get("location")!)

    expect(target.pathname).toBe("/login")
    expect(target.searchParams.get("callbackUrl")).toBe("/teacher/exams")
  })

  it("keeps teacher applicants out of admin routes", async () => {
    mockGetToken.mockResolvedValue({ id: "applicant", role: "TEACHER" } as never)

    const response = await proxy(new NextRequest("http://localhost/admin/teachers"))

    expect(response.headers.get("location")).toBe("http://localhost/dashboard")
  })
})
