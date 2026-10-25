import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  getCachedPage,
  setCachedPage,
  invalidateScope,
  acquireComputeLock,
  releaseComputeLock,
  waitForCachedPage,
  getOrComputeCachedPage,
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

describe("compute lock (stampede control)", () => {
  it("only the first caller acquires the lock for a given page", async () => {
    const first = await acquireComputeLock(scope, 1, 20)
    const second = await acquireComputeLock(scope, 1, 20)

    expect(first).not.toBeNull()
    expect(second).toBeNull()

    await releaseComputeLock(scope, 1, 20, first!)
  })

  it("releasing frees the lock for the next caller", async () => {
    const first = await acquireComputeLock(scope, 1, 20)
    await releaseComputeLock(scope, 1, 20, first!)

    const second = await acquireComputeLock(scope, 1, 20)
    expect(second).not.toBeNull()

    await releaseComputeLock(scope, 1, 20, second!)
  })

  it("releasing with the wrong token never clobbers a different holder's lock", async () => {
    const real = await acquireComputeLock(scope, 1, 20)
    await releaseComputeLock(scope, 1, 20, "not-the-real-token")

    // The real lock must still be held — a second acquire must still fail.
    const stillLocked = await acquireComputeLock(scope, 1, 20)
    expect(stillLocked).toBeNull()

    await releaseComputeLock(scope, 1, 20, real!)
  })

  it("waitForCachedPage returns the winner's result once it's cached", async () => {
    const waiter = waitForCachedPage(scope, 1, 20)
    await new Promise((r) => setTimeout(r, 100))
    await setCachedPage(scope, 1, 20, "winner-result")

    expect(await waiter).toBe("winner-result")
  })

  it("waitForCachedPage gives up and returns null if nothing appears", async () => {
    const result = await waitForCachedPage(scope, 1, 20)
    expect(result).toBeNull()
  })
})

describe("getOrComputeCachedPage", () => {
  it("computes once and serves every concurrent caller the same result", async () => {
    let computeCalls = 0
    const compute = async () => {
      computeCalls++
      await new Promise((r) => setTimeout(r, 150)) // simulate real query latency
      return { value: "computed-once" }
    }

    const results = await Promise.all(
      Array.from({ length: 10 }, () => getOrComputeCachedPage(scope, 1, 20, compute))
    )

    expect(results.every((r) => r.value === "computed-once")).toBe(true)
    // The lock makes 9 of the 10 wait for the 1st instead of recomputing —
    // not a hard guarantee of exactly 1 (a slow waiter can still time out and
    // compute independently), but it must be far fewer than all 10.
    expect(computeCalls).toBeLessThan(10)
  })

  it("returns a fresh value on a genuine cache miss with no contention", async () => {
    const result = await getOrComputeCachedPage(scope, 1, 20, async () => ({ value: "fresh" }))
    expect(result).toEqual({ value: "fresh" })

    const cached = await getCachedPage(scope, 1, 20)
    expect(JSON.parse(cached!)).toEqual({ value: "fresh" })
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

  it("acquireComputeLock always reports no lock, never blocking a caller", async () => {
    expect(await acquireComputeLock(scope, 1, 20)).toBeNull()
  })

  it("getOrComputeCachedPage still returns a correct value for every call, just uncached", async () => {
    let calls = 0
    const compute = async () => {
      calls++
      return { value: "always-fresh" }
    }

    const results = await Promise.all(
      Array.from({ length: 5 }, () => getOrComputeCachedPage(scope, 1, 20, compute))
    )

    expect(results.every((r) => r.value === "always-fresh")).toBe(true)
    expect(calls).toBe(5) // no cache, no lock — every call computes independently
  })
})
