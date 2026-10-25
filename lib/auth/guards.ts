import { cache } from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import type { Role, TeacherVerificationStatus } from "@/prisma/generated/prisma/client"
import { UnauthorizedError, ForbiddenError } from "./errors"

export type CurrentUser = {
  id: string
  name: string
  email: string
  role: Role
  teacherVerificationStatus: TeacherVerificationStatus
}

type SessionIdentity = { id: string; tokenVersion: number }

/**
 * The single authoritative identity check, used by every guard below.
 *
 * Re-reads role/isActive/tokenVersion from the DB on every call instead of
 * trusting the JWT: an admin disabling an account, changing a role, or a
 * password reset (which bumps tokenVersion) all take effect on the very next
 * request, rather than waiting for the token to expire. The cost is one
 * indexed primary-key lookup per guarded request — acceptable at this app's
 * scale; a high-traffic deployment would want to cache this with a short TTL
 * or move to database-backed sessions instead.
 */
export async function resolveCurrentUser(
  identity: SessionIdentity | undefined
): Promise<CurrentUser | null> {
  if (!identity) return null

  const user = await prisma.user.findUnique({
    where: { id: identity.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      tokenVersion: true,
      teacherVerificationStatus: true,
    },
  })
  if (!user || !user.isActive) return null
  if (user.tokenVersion !== identity.tokenVersion) return null // revoked

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    teacherVerificationStatus: user.teacherVerificationStatus,
  }
}

// Memoized per request: a layout and the page it wraps both call this, and
// should share one DB lookup instead of issuing it twice.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth()
  if (!session?.user) return null
  return resolveCurrentUser({
    id: session.user.id,
    tokenVersion: session.user.tokenVersion,
  })
})

// ─── Server Components / layouts: redirect instead of rendering ──────────

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser()
  if (!roles.includes(user.role)) redirect("/dashboard")
  return user
}

// ─── Server Actions: throw instead of redirecting mid-mutation ───────────

export async function assertUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()
  return user
}

export async function assertRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await assertUser()
  if (!roles.includes(user.role)) throw new ForbiddenError()
  return user
}

/** ADMIN always passes; otherwise the resource's owner must match the caller. */
export function assertOwner(user: CurrentUser, resourceOwnerId: string) {
  if (user.role === "ADMIN") return
  if (user.id !== resourceOwnerId) throw new ForbiddenError()
}

/** Forces every existing session for this user to fail revalidation. */
export async function revokeAllSessions(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  })
}
