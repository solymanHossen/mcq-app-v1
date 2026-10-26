import { resolveCurrentUser, assertOwner, type CurrentUser } from "@/lib/authorization"
import { UnauthorizedError, ForbiddenError } from "@/lib/errors"
import { verifyAccessToken } from "@/modules/mobile/tokens"
import type { Role } from "@/prisma/generated/prisma/client"

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization")
  if (!header?.startsWith("Bearer ")) return null
  const token = header.slice("Bearer ".length).trim()
  return token || null
}

/**
 * The REST API's equivalent of lib/authorization.ts's requireUser/assertUser
 * — same DB-authoritative re-check on every call (role/isActive/tokenVersion
 * re-read fresh, never trusted from the token alone), just fed from a
 * verified bearer token instead of a cookie session.
 */
export async function requireApiUser(request: Request): Promise<CurrentUser> {
  const token = bearerToken(request)
  if (!token) throw new UnauthorizedError("Missing bearer token")

  const identity = await verifyAccessToken(token)
  if (!identity) throw new UnauthorizedError("Invalid or expired access token")

  const user = await resolveCurrentUser(identity)
  if (!user) throw new UnauthorizedError("Session no longer valid")

  return user
}

export function requireApiRole(user: CurrentUser, ...roles: Role[]): CurrentUser {
  if (!roles.includes(user.role)) throw new ForbiddenError()
  return user
}

export { assertOwner }
