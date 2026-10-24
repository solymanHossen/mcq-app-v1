/**
 * Best-effort client IP for audit/rate-limit keys. Only trustworthy behind a
 * proxy that sets x-forwarded-for itself (Vercel, nginx, etc.) — in local
 * dev, or an unproxied deployment, this returns undefined and callers fall
 * back to identifier-only limiting.
 */
export function getClientIp(
  headers: Headers | Record<string, unknown> | undefined | null
): string | undefined {
  if (!headers) return undefined

  const read = (name: string): string | undefined => {
    if (headers instanceof Headers) return headers.get(name) ?? undefined
    const value = headers[name]
    return Array.isArray(value) ? value[0] : (value as string | undefined)
  }

  const forwardedFor = read("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim()

  return read("x-real-ip")
}
