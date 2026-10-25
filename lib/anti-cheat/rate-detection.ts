import { getRedisClient } from "@/lib/redis"
import { SUSPICIOUS_RATE_LIMIT, SUSPICIOUS_RATE_WINDOW_SECONDS } from "./engine"

/**
 * Sliding-window-ish request counter per attempt, backed by Redis. Returns
 * true the moment the count for this window crosses the threshold (fires
 * once per window, not on every subsequent call, so a sustained burst
 * doesn't flood the violation log with duplicates). Silently returns false
 * — never throws — if Redis isn't configured or errors: this is a bonus
 * detection signal, not something the save/report flow can depend on.
 */
export async function recordRequestAndCheckSuspicious(
  attemptId: string,
  action: "save" | "report"
): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  const key = `anti-cheat:rate:${action}:${attemptId}`
  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, SUSPICIOUS_RATE_WINDOW_SECONDS)
    }
    return count === SUSPICIOUS_RATE_LIMIT + 1
  } catch {
    return false
  }
}
