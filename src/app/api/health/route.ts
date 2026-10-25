import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRedisClient } from "@/lib/redis"

/**
 * Liveness/readiness probe for a load balancer, container orchestrator, or
 * uptime monitor. Exists directly because of a Phase 8 finding: after a
 * Postgres restart, requests fail for as long as the database is actually
 * down (measured: ~1-2s to self-heal once Postgres is reachable again, no
 * app restart needed — see docs/performance-audit.md) with no signal
 * visible from outside the app itself. This endpoint gives infrastructure
 * something concrete to poll instead of inferring health from ordinary
 * request error rates.
 *
 * Deliberately unauthenticated (a health check that requires a login can't
 * be probed by infrastructure that isn't a logged-in user) and deliberately
 * cheap — one indexed-PK query, no joins, no business logic. Redis is
 * reported but never fails the check: the whole app is specified to run
 * correctly without it (see lib/redis.ts).
 */
export async function GET() {
  const checks: Record<string, "ok" | "down" | "not_configured"> = {}

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = "ok"
  } catch {
    checks.database = "down"
  }

  const redis = getRedisClient()
  if (!redis) {
    checks.redis = "not_configured"
  } else {
    try {
      await redis.ping()
      checks.redis = "ok"
    } catch {
      checks.redis = "down"
    }
  }

  const healthy = checks.database === "ok"
  return NextResponse.json({ status: healthy ? "ok" : "degraded", checks }, { status: healthy ? 200 : 503 })
}
