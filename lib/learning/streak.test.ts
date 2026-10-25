import { describe, expect, it } from "vitest"
import { computeStreakUpdate, localDateString } from "./streak"

describe("computeStreakUpdate", () => {
  it("starts a new streak at 1 for a student with no prior activity", () => {
    const result = computeStreakUpdate(
      { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
      "2026-01-05",
      "2026-01-04"
    )
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: "2026-01-05",
    })
  })

  it("extends the streak when the last activity was yesterday", () => {
    const result = computeStreakUpdate(
      { currentStreak: 4, longestStreak: 4, lastActiveDate: "2026-01-04" },
      "2026-01-05",
      "2026-01-04"
    )
    expect(result.currentStreak).toBe(5)
    expect(result.longestStreak).toBe(5)
  })

  it("is a no-op when activity for today was already recorded (idempotent retry)", () => {
    const prev = { currentStreak: 5, longestStreak: 10, lastActiveDate: "2026-01-05" }
    const result = computeStreakUpdate(prev, "2026-01-05", "2026-01-04")
    expect(result).toBe(prev) // same reference — truly a no-op, not just equal values
  })

  it("resets to 1 when there's a gap of more than one day", () => {
    const result = computeStreakUpdate(
      { currentStreak: 10, longestStreak: 10, lastActiveDate: "2026-01-01" },
      "2026-01-05",
      "2026-01-04"
    )
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(10) // the record itself is never lost
  })

  it("keeps the longest streak even after the current streak resets", () => {
    const result = computeStreakUpdate(
      { currentStreak: 2, longestStreak: 20, lastActiveDate: "2026-01-01" },
      "2026-01-10",
      "2026-01-09"
    )
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(20)
  })
})

describe("localDateString — timezone-aware day boundaries", () => {
  it("can place the same instant on different calendar days depending on timezone", () => {
    // 2026-01-05T23:30:00Z is already 2026-01-06 in UTC+6 (Asia/Dhaka).
    const instant = new Date("2026-01-05T23:30:00.000Z")
    expect(localDateString(instant, "UTC")).toBe("2026-01-05")
    expect(localDateString(instant, "Asia/Dhaka")).toBe("2026-01-06")
  })

  it("falls back to UTC for an unrecognized timezone instead of throwing", () => {
    const instant = new Date("2026-01-05T12:00:00.000Z")
    expect(() => localDateString(instant, "Not/A_Real_Zone")).not.toThrow()
    expect(localDateString(instant, "Not/A_Real_Zone")).toBe(
      localDateString(instant, "UTC")
    )
  })
})
