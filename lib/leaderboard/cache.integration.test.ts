import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  getCachedPage,
  setCachedPage,
  invalidateScope,
  _resetClientForTests,
} from "./cache"

const scope = `test-scope-${Date.now()}-${Math.random().toString(36).slice(2)}`

afterEach(async () => {
  await invalidateScope(scope)
})

afterAll(() => {
  _resetClientForTests()
})

describe("leaderboard cache (requires REDIS_URL, see docker-compose.yml)", () => {
  it("returns null on a cold cache", async () => {
    expect(await getCachedPage(scope, 1, 20)).toBeNull()
  })

  it("round-trips a cached page", async () => {
    const payload = JSON.stringify({ entries: ["a", "b"] })
    await setCachedPage(scope, 1, 20, payload)
    expect(await getCachedPage(scope, 1, 20)).toBe(payload)
  })

  it("keys different pages and page sizes independently", async () => {
    await setCachedPage(scope, 1, 20, "page-1")
    await setCachedPage(scope, 2, 20, "page-2")
    await setCachedPage(scope, 1, 50, "page-1-size-50")

    expect(await getCachedPage(scope, 1, 20)).toBe("page-1")
    expect(await getCachedPage(scope, 2, 20)).toBe("page-2")
    expect(await getCachedPage(scope, 1, 50)).toBe("page-1-size-50")
  })

  it("invalidateScope clears every page cached under that scope", async () => {
    await setCachedPage(scope, 1, 20, "page-1")
    await setCachedPage(scope, 2, 20, "page-2")
    await setCachedPage(scope, 3, 20, "page-3")

    await invalidateScope(scope)

    expect(await getCachedPage(scope, 1, 20)).toBeNull()
    expect(await getCachedPage(scope, 2, 20)).toBeNull()
    expect(await getCachedPage(scope, 3, 20)).toBeNull()
  })

  it("invalidating one scope never touches a different scope", async () => {
    const otherScope = `${scope}-other`
    await setCachedPage(scope, 1, 20, "mine")
    await setCachedPage(otherScope, 1, 20, "theirs")

    await invalidateScope(scope)

    expect(await getCachedPage(scope, 1, 20)).toBeNull()
    expect(await getCachedPage(otherScope, 1, 20)).toBe("theirs")

    await invalidateScope(otherScope)
  })

  it("sets a bounded TTL rather than caching forever", async () => {
    const { Redis } = await import("ioredis")
    const redis = new Redis(process.env.REDIS_URL!)
    try {
      await setCachedPage(scope, 1, 20, "ttl-check")
      const ttl = await redis.ttl(`leaderboard:${scope}:p1:s20`)
      expect(ttl).toBeGreaterThan(0)
      expect(ttl).toBeLessThanOrEqual(30)
    } finally {
      redis.disconnect()
    }
  })
})

describe("leaderboard cache — disabled (no REDIS_URL)", () => {
  beforeEach(() => {
    vi.stubEnv("REDIS_URL", "")
    _resetClientForTests()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    _resetClientForTests()
  })

  it("getCachedPage always misses", async () => {
    expect(await getCachedPage(scope, 1, 20)).toBeNull()
  })

  it("setCachedPage and invalidateScope are safe no-ops", async () => {
    await expect(setCachedPage(scope, 1, 20, "x")).resolves.toBeUndefined()
    await expect(invalidateScope(scope)).resolves.toBeUndefined()
  })
})
