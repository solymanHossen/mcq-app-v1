import { Redis } from "ioredis"

/**
 * Entirely optional: every function here no-ops (never throws, never
 * blocks) when REDIS_URL isn't set, so the leaderboard works identically —
 * just always hitting Postgres directly — in any environment that hasn't
 * opted into caching. A cache failure (connection drop, timeout) also never
 * breaks a request; it just falls through to the database.
 *
 * Invalidation strategy: each cached page carries a short TTL (30s) as a
 * safety net, AND is explicitly invalidated the moment the underlying data
 * changes — a new attempt is graded, a regrade changes a score, results are
 * published, or an attempt is disqualified (see the call sites in
 * lib/grading/finalize.ts, lib/grading/regrade.ts, actions/grading.actions.ts,
 * and actions/leaderboard.actions.ts). A per-exam Redis SET tracks every
 * currently-cached page key so invalidation can delete them all in one pass
 * without an O(N) `KEYS` scan; that index set carries its own TTL as a
 * backstop in case an invalidation call is ever missed.
 */

const TTL_SECONDS = 30
const INDEX_TTL_SECONDS = TTL_SECONDS * 4

let client: Redis | null | undefined

function getClient(): Redis | null {
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
    // Swallowed deliberately — every call site below already falls back to
    // Postgres on any cache error. Logging would just be noise in dev.
  })
  return client
}

function pageKey(scope: string, page: number, pageSize: number) {
  return `leaderboard:${scope}:p${page}:s${pageSize}`
}

function indexKey(scope: string) {
  return `leaderboard:${scope}:keys`
}

export async function getCachedPage(
  scope: string,
  page: number,
  pageSize: number
): Promise<string | null> {
  const redis = getClient()
  if (!redis) return null
  try {
    return await redis.get(pageKey(scope, page, pageSize))
  } catch {
    return null
  }
}

export async function setCachedPage(
  scope: string,
  page: number,
  pageSize: number,
  data: string
): Promise<void> {
  const redis = getClient()
  if (!redis) return
  const key = pageKey(scope, page, pageSize)
  try {
    const pipeline = redis.multi()
    pipeline.set(key, data, "EX", TTL_SECONDS)
    pipeline.sadd(indexKey(scope), key)
    pipeline.expire(indexKey(scope), INDEX_TTL_SECONDS)
    await pipeline.exec()
  } catch {
    // caching is best-effort; the page was already served from Postgres
  }
}

export async function invalidateScope(scope: string): Promise<void> {
  const redis = getClient()
  if (!redis) return
  try {
    const keys = await redis.smembers(indexKey(scope))
    if (keys.length > 0) {
      await redis.del(...keys, indexKey(scope))
    } else {
      await redis.del(indexKey(scope))
    }
  } catch {
    // if invalidation fails, the 30s TTL is the worst-case staleness bound
  }
}

/** Test-only: forces a fresh client on the next call (env var changed). */
export function _resetClientForTests() {
  client?.disconnect()
  client = undefined
}
