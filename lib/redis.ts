import { Redis } from "ioredis"

/**
 * Shared, lazily-created Redis client for every optional caching/rate
 * feature in the app (leaderboard caching, anti-cheat rate detection).
 * Returns null — never throws — when REDIS_URL isn't set, so every caller
 * must already be written to work correctly without a cache. Connection
 * errors are swallowed here too; callers are expected to wrap their own
 * Redis calls in try/catch and fall back to their non-cached behavior.
 */
let client: Redis | null | undefined

export function getRedisClient(): Redis | null {
  if (client !== undefined) return client
  const url = process.env.REDIS_URL
  if (!url) {
    client = null
    return client
  }
  client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // don't keep retrying a dead connection
  })
  client.on("error", () => {
    // Swallowed deliberately — every call site falls back to its non-cached
    // path on any Redis error. Logging would just be noise in dev.
  })
  return client
}

/** Test-only: forces a fresh client on the next call (env var changed). */
export function _resetRedisClientForTests() {
  client?.disconnect()
  client = undefined
}
