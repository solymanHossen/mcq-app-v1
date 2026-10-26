import { NextResponse } from "next/server"
import { UnauthorizedError, ForbiddenError, RateLimitedError } from "@/lib/errors"
import { ZodError } from "zod"

export function apiOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function apiError(status: number, message: string) {
  return NextResponse.json({ error: { message } }, { status })
}

/**
 * The one place every /api/v1 route handler funnels a caught error through
 * — same error classes assertUser/assertRole/assertOwner already throw for
 * the web app (lib/errors.ts), mapped to the REST status code each one
 * means. Anything else is logged and hidden behind a generic 500, never
 * echoed back to the client.
 */
export function handleApiError(e: unknown) {
  if (e instanceof UnauthorizedError) return apiError(401, e.message)
  if (e instanceof ForbiddenError) return apiError(403, e.message)
  if (e instanceof RateLimitedError) return apiError(429, e.message)
  if (e instanceof ZodError) {
    return apiError(422, e.issues[0]?.message ?? "Invalid request")
  }
  if (e instanceof SyntaxError) return apiError(400, "Request body must be valid JSON")
  console.error("[api/v1] unhandled error", e)
  return apiError(500, "Something went wrong")
}

/** `request.json()` throws a plain SyntaxError on malformed/empty bodies — let handleApiError map it to 400. */
export function readJsonBody(request: Request): Promise<unknown> {
  return request.json()
}
