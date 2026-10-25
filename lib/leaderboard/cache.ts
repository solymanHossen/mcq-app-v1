import { getRedisClient, _resetRedisClientForTests } from "@/lib/redis"

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
 *
 * Stampede control: a Phase 8 load test measured concurrent cache misses for
 * the SAME page (right after invalidation, or simply several students
 * opening a leaderboard at once) each redundantly recomputing and
 * re-caching the identical expensive query — 40 concurrent reads cost
 * ~300ms p50 versus ~20-40ms for one uncontended computation. The
 * compute-lock functions below (acquireComputeLock/releaseComputeLock/
 * waitForCachedPage) fix this: only the first miss computes, everyone else
 * waits briefly for that result. The lock is short-lived and advisory —
 * if the holder crashes or is simply slow, every waiter gives up after a
 * bounded wait and computes directly, so a stuck lock can never cause a
 * hang. See getExamLeaderboard/getGlobalLeaderboard in engine.ts for how
 * they're used together; same as every other function here, the whole
 * mechanism no-ops when REDIS_URL isn't set — concurrent requests just all
 * hit Postgres directly, as they always have.
 */

const TTL_SECONDS = 30
const INDEX_TTL_SECONDS = TTL_SECONDS * 4
const LOCK_TTL_MS = 3_000
const LOCK_WAIT_TIMEOUT_MS = 2_000
const LOCK_WAIT_POLL_MS = 50

function pageKey(scope: string, page: number, pageSize: number) {
  return `leaderboard:${scope}:p${page}:s${pageSize}`
}

function indexKey(scope: string) {
  return `leaderboard:${scope}:keys`
}

function lockKey(scope: string, page: number, pageSize: number) {
  return `leaderboard:${scope}:p${page}:s${pageSize}:lock`
}

export async function getCachedPage(
  scope: string,
  page: number,
  pageSize: number
): Promise<string | null> {
  const redis = getRedisClient()
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
  const redis = getRedisClient()
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
  const redis = getRedisClient()
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

/**
 * Tries to become the one request that computes this page. Returns a lock
 * token (pass it to releaseComputeLock) on success, or null if someone else
 * already holds it or Redis is unavailable — either way, the caller's
 * fallback is identical: compute and cache without a lock, same as before
 * this existed. The lock expires on its own after LOCK_TTL_MS even if never
 * released, so a crashed holder can never block others beyond that bound.
 */
export async function acquireComputeLock(
  scope: string,
  page: number,
  pageSize: number
): Promise<string | null> {
  const redis = getRedisClient()
  if (!redis) return null
  const token = Math.random().toString(36).slice(2)
  try {
    const result = await redis.set(lockKey(scope, page, pageSize), token, "PX", LOCK_TTL_MS, "NX")
    return result === "OK" ? token : null
  } catch {
    return null
  }
}

/** Only deletes the lock if it still holds OUR token — a compare-and-delete,
 * not a blind delete, so releasing late never clobbers a different request
 * that has since legitimately acquired the lock after ours expired. */
export async function releaseComputeLock(
  scope: string,
  page: number,
  pageSize: number,
  token: string
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return
  try {
    await redis.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
      1,
      lockKey(scope, page, pageSize),
      token
    )
  } catch {
    // the lock's own TTL is the worst-case backstop
  }
}

/**
 * For a request that lost the race to acquireComputeLock: polls for the
 * winner's result instead of computing redundantly. Gives up and returns
 * null (meaning "compute it yourself") after LOCK_WAIT_TIMEOUT_MS — bounded
 * so a stalled or crashed lock-holder never makes anyone wait indefinitely.
 */
export async function waitForCachedPage(
  scope: string,
  page: number,
  pageSize: number
): Promise<string | null> {
  const deadline = Date.now() + LOCK_WAIT_TIMEOUT_MS
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, LOCK_WAIT_POLL_MS))
    const cached = await getCachedPage(scope, page, pageSize)
    if (cached) return cached
  }
  return null
}

/**
 * The full stampede-safe read-through pattern, in one place so
 * getExamLeaderboard and getGlobalLeaderboard don't each reimplement it:
 * cache hit returns immediately; on a miss, the first caller to acquire the
 * lock computes and caches; everyone else waits briefly for that result
 * instead of recomputing, falling back to computing it themselves only if
 * the wait times out (so a slow or crashed computer can never hang anyone).
 * With no Redis configured, every call just runs `compute` directly — this
 * degrades to exactly the pre-caching behavior, never breaks.
 */
export async function getOrComputeCachedPage<T>(
  scope: string,
  page: number,
  pageSize: number,
  compute: () => Promise<T>
): Promise<T> {
  const cached = await getCachedPage(scope, page, pageSize)
  if (cached) return JSON.parse(cached) as T

  const lockToken = await acquireComputeLock(scope, page, pageSize)
  if (!lockToken) {
    const winner = await waitForCachedPage(scope, page, pageSize)
    if (winner) return JSON.parse(winner) as T
    // Gave up waiting for the lock-holder — fall through and compute it
    // ourselves, same as an ordinary cache miss would without this at all.
  }

  const result = await compute()
  await setCachedPage(scope, page, pageSize, JSON.stringify(result))
  if (lockToken) await releaseComputeLock(scope, page, pageSize, lockToken)
  return result
}

/** Test-only: forces a fresh client on the next call (env var changed). */
export function _resetClientForTests() {
  _resetRedisClientForTests()
}
