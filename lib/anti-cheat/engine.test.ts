import { describe, expect, it } from "vitest"
import {
  severityScore,
  checkSessionConflict,
  shouldWriteSessionToken,
  parseClientViolationMetadata,
  SESSION_CONFLICT_WINDOW_MS,
  SESSION_TOKEN_REFRESH_INTERVAL_MS,
  CLIENT_REPORTABLE_TYPES,
} from "./engine"

describe("severityScore", () => {
  it("sums weighted severities", () => {
    expect(severityScore(["LOW"])).toBe(1)
    expect(severityScore(["MEDIUM"])).toBe(2)
    expect(severityScore(["HIGH"])).toBe(4)
    expect(severityScore(["LOW", "LOW", "MEDIUM"])).toBe(4)
  })

  it("a single LOW-severity event (e.g. one tab switch) never approaches a typical threshold", () => {
    expect(severityScore(["LOW"])).toBeLessThan(5)
  })

  it("returns 0 for no events", () => {
    expect(severityScore([])).toBe(0)
  })
})

describe("checkSessionConflict", () => {
  const now = new Date("2026-01-01T00:01:00.000Z")

  it("no conflict when there's no prior session", () => {
    const result = checkSessionConflict(
      { activeSessionToken: null, activeSessionTokenAt: null },
      "token-a",
      now
    )
    expect(result.conflict).toBe(false)
  })

  it("no conflict when the same token continues", () => {
    const result = checkSessionConflict(
      { activeSessionToken: "token-a", activeSessionTokenAt: now },
      "token-a",
      now
    )
    expect(result.conflict).toBe(false)
  })

  it("conflicts when a different token appears within the window", () => {
    const recentlyActive = new Date(now.getTime() - SESSION_CONFLICT_WINDOW_MS / 2)
    const result = checkSessionConflict(
      { activeSessionToken: "token-a", activeSessionTokenAt: recentlyActive },
      "token-b",
      now
    )
    expect(result).toEqual({ conflict: true, previousToken: "token-a" })
  })

  it("does not conflict once the old token has been quiet past the window (a handoff, e.g. a reload)", () => {
    const longQuiet = new Date(now.getTime() - SESSION_CONFLICT_WINDOW_MS * 2)
    const result = checkSessionConflict(
      { activeSessionToken: "token-a", activeSessionTokenAt: longQuiet },
      "token-b",
      now
    )
    expect(result.conflict).toBe(false)
  })
})

describe("shouldWriteSessionToken", () => {
  const now = new Date("2026-01-01T00:01:00.000Z")

  it("always writes when the token has never been set", () => {
    expect(shouldWriteSessionToken({ activeSessionToken: null, activeSessionTokenAt: null }, "a", now)).toBe(true)
  })

  it("always writes when the token has changed, regardless of timing", () => {
    expect(
      shouldWriteSessionToken(
        { activeSessionToken: "a", activeSessionTokenAt: now },
        "b",
        now
      )
    ).toBe(true)
  })

  it("skips the write for a same-token refresh within the interval (the autosave-burst case)", () => {
    const recentlyWritten = new Date(now.getTime() - SESSION_TOKEN_REFRESH_INTERVAL_MS / 2)
    expect(
      shouldWriteSessionToken(
        { activeSessionToken: "a", activeSessionTokenAt: recentlyWritten },
        "a",
        now
      )
    ).toBe(false)
  })

  it("writes again for the same token once the refresh interval has elapsed", () => {
    const stale = new Date(now.getTime() - SESSION_TOKEN_REFRESH_INTERVAL_MS - 1)
    expect(
      shouldWriteSessionToken({ activeSessionToken: "a", activeSessionTokenAt: stale }, "a", now)
    ).toBe(true)
  })

  it("the refresh interval stays safely smaller than the conflict window", () => {
    // Otherwise a long-idle-but-never-refreshed timestamp could make a truly
    // stale tab look recently active, masking a genuine conflict.
    expect(SESSION_TOKEN_REFRESH_INTERVAL_MS).toBeLessThan(SESSION_CONFLICT_WINDOW_MS)
  })
})

describe("parseClientViolationMetadata", () => {
  it("accepts valid metadata for each client-reportable type", () => {
    expect(
      parseClientViolationMetadata("TAB_SWITCH", { awayDurationMs: 1500 }).success
    ).toBe(true)
    expect(
      parseClientViolationMetadata("MULTIPLE_TABS_DETECTED", { tabCount: 3 }).success
    ).toBe(true)
    expect(parseClientViolationMetadata("FULLSCREEN_EXIT", {}).success).toBe(true)
  })

  it("rejects out-of-range values", () => {
    expect(
      parseClientViolationMetadata("TAB_SWITCH", { awayDurationMs: -5 }).success
    ).toBe(false)
    expect(
      parseClientViolationMetadata("MULTIPLE_TABS_DETECTED", { tabCount: 1 }).success
    ).toBe(false) // must be at least 2 to mean "multiple"
  })

  it("strips unknown fields instead of accepting arbitrary data", () => {
    const result = parseClientViolationMetadata("TAB_SWITCH", {
      awayDurationMs: 1000,
      userAgent: "spoofed-fingerprint-attempt",
      ipAddress: "1.2.3.4",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ awayDurationMs: 1000 })
      expect(result.data).not.toHaveProperty("userAgent")
      expect(result.data).not.toHaveProperty("ipAddress")
    }
  })

  it("defaults missing metadata to an empty object for no-payload types", () => {
    expect(parseClientViolationMetadata("RIGHT_CLICK_ATTEMPT", undefined).success).toBe(
      true
    )
  })
})

describe("CLIENT_REPORTABLE_TYPES", () => {
  it("never includes the server-only detection types", () => {
    expect(CLIENT_REPORTABLE_TYPES).not.toContain("SESSION_CONFLICT")
    expect(CLIENT_REPORTABLE_TYPES).not.toContain("SUSPICIOUS_REQUEST_PATTERN")
  })
})
