import { PrismaClient } from "@/prisma/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Pool sizing (see docs/performance-audit.md for the measurements behind
 * these defaults):
 *
 * - `max: 20`, not node-postgres's own default of 10 — a 1500-way concurrent
 *   autosave burst against a 10-connection pool measured p50=10.6s/p99=11.6s
 *   server-action latency on a single shared dev machine; raising the pool
 *   materially cut that (p50=5.2s at max=50, p50=3.6s at max=95), with
 *   diminishing returns past roughly 20-30. 20 is a deliberately moderate
 *   default, not the fastest one measured: Postgres's own `max_connections`
 *   (100 on an unconfigured postgres:17-alpine image) is shared across every
 *   Next.js process that connects, so a multi-instance deployment must keep
 *   `instances * DB_POOL_MAX` comfortably under that ceiling (minus whatever
 *   headroom migrations/admin tools/other services need) — tune
 *   DB_POOL_MAX down for more instances, or raise Postgres's own
 *   max_connections (and shared_buffers/work_mem to match) if the deployment
 *   genuinely needs both more instances AND a bigger pool per instance.
 *
 * - `connectionTimeoutMillis: 5000` — node-postgres's own default is
 *   `undefined`, which means a request waiting for a free connection waits
 *   FOREVER once the pool is saturated (measured directly: a client waited
 *   7.8s for one of 3 held connections to free up, with zero error, zero
 *   indication anything was wrong). That turns overload into a silently
 *   hanging request instead of backpressure. An explicit timeout makes an
 *   overloaded pool fail FAST with a clear, catchable error (measured:
 *   fails in ~2.0s against a 2000ms timeout) that a caller can retry or
 *   surface as "please try again," rather than a spinner stuck for 10+
 *   seconds with no feedback.
 */
function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? 20),
    connectionTimeoutMillis: Number(process.env.DB_POOL_CONNECTION_TIMEOUT_MS ?? 5000),
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
