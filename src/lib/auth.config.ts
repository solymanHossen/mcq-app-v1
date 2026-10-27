export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
} as const

// Both admin tiers reach every /admin route — SUPER_ADMIN-only restrictions
// (managing admin-tier roles) are enforced deeper in, in the server actions
// themselves, not by route. Kept here (not lib/authorization.ts) because
// this file is imported by proxy.ts, which runs on the Edge runtime and
// can't pull in anything Node/Prisma-specific — authorization.ts re-exports
// this same array (and an isAdminTier helper) for server-side use so
// there's one source of truth.
export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const

export function isAdminRole(role: string | undefined): boolean {
  return role !== undefined && (ADMIN_ROLES as readonly string[]).includes(role)
}

// Single source of truth for "where does this role live" — used by proxy.ts
// (Edge, JWT-only) to redirect straight there instead of bouncing everyone
// through /dashboard first, and by the login form for the same reason right
// after sign-in. /dashboard itself still redirects ADMIN/TEACHER onward too,
// as a fallback for any other entry point that lands there directly.
export function roleHomePath(role: string | undefined): string {
  if (isAdminRole(role)) return "/admin"
  if (role === "TEACHER") return "/teacher"
  return "/dashboard"
}

export const publicRoutes = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
] as const

export function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

// Routes accessible to both guests and authenticated users
export const openRoutes = ["/", "/teachers"] as const

export function isOpenRoute(pathname: string) {
  return openRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/")
}

export function isTeacherRoute(pathname: string) {
  return pathname === "/teacher" || pathname.startsWith("/teacher/")
}
