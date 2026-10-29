import { PrismaClient } from "@/prisma/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const SCHEMA_VERSION = 2

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  schemaVersion?: number
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? 20),
    connectionTimeoutMillis: Number(process.env.DB_POOL_CONNECTION_TIMEOUT_MS ?? 5000),
  })
  return new PrismaClient({ adapter })
}

function getPrismaClientInstance(): PrismaClient {
  const existing = globalForPrisma.prisma
  if (
    !existing ||
    globalForPrisma.schemaVersion !== SCHEMA_VERSION ||
    !("examTitleTemplate" in (existing as unknown as Record<string, unknown>))
  ) {
    const client = createPrismaClient()
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client
      globalForPrisma.schemaVersion = SCHEMA_VERSION
    }
    return client
  }
  return existing
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClientInstance()
    const val = (client as unknown as Record<string | symbol, unknown>)[prop]
    if (typeof val === "function") {
      return (val as (...args: unknown[]) => unknown).bind(client)
    }
    return val
  },
})


/**
 * Graceful shutdown: only meaningful for a long-running Node process (this
 * app's own Docker/VM deployment via `next start`) — a serverless/edge
 * platform has no persistent process to deliver these signals to in the
 * first place, so registering this there is a safe no-op, never a problem.
 *
 * Without this, a SIGTERM (e.g. `docker stop`, a rolling deploy, an
 * orchestrator rescheduling the container) kills the process while the
 * pool's sockets are still open. Postgres eventually notices the dead TCP
 * connection on its own, and any in-flight transaction safely rolls back
 * (not a correctness risk) — but a clean `$disconnect()` closes the pool's
 * connections immediately instead of leaving Postgres to time them out,
 * and gives the process a well-defined moment to finish before exiting
 * rather than being cut off mid-socket-teardown.
 *
 * Guarded the same way as the singleton above (a global flag, not a module-
 * local one) so Next.js's dev-mode module reloading can never register this
 * twice and leak duplicate listeners.
 */
const shutdownState = globalForPrisma as unknown as { prismaShutdownRegistered?: boolean }
if (!shutdownState.prismaShutdownRegistered) {
  shutdownState.prismaShutdownRegistered = true
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.on(signal, () => {
      prisma
        .$disconnect()
        .catch(() => {
          // Shutting down regardless — a failed disconnect here is not a
          // reason to hang the process on exit.
        })
        .finally(() => process.exit(0))
    })
  }
}
