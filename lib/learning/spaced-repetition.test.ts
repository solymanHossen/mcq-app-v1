import { describe, expect, it } from "vitest"
import { applyReviewOutcome, type ReviewState } from "./spaced-repetition"

const FRESH: ReviewState = { easeFactor: 2.5, intervalDays: 0, repetitions: 0 }

describe("applyReviewOutcome", () => {
  it("a lapse resets the interval and repetitions but only lowers the ease factor", () => {
    const outcome = applyReviewOutcome({ easeFactor: 2.5, intervalDays: 10, repetitions: 3 }, false)
    expect(outcome.intervalDays).toBe(1)
    expect(outcome.repetitions).toBe(0)
    expect(outcome.easeFactor).toBeCloseTo(2.3)
    expect(outcome.masteryStatus).toBe("LEARNING")
  })

  it("the ease factor never drops below the SM-2 floor even after repeated lapses", () => {
    let state: ReviewState = { easeFactor: 1.4, intervalDays: 1, repetitions: 0 }
    const outcome = applyReviewOutcome(state, false)
    expect(outcome.easeFactor).toBeGreaterThanOrEqual(1.3)
    state = outcome
    const again = applyReviewOutcome(state, false)
    expect(again.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it("the first correct review sets a 1-day interval", () => {
    const outcome = applyReviewOutcome(FRESH, true)
    expect(outcome.repetitions).toBe(1)
    expect(outcome.intervalDays).toBe(1)
    expect(outcome.masteryStatus).toBe("REVIEWING")
  })

  it("the second correct review sets a 6-day interval", () => {
    const afterFirst = applyReviewOutcome(FRESH, true)
    const afterSecond = applyReviewOutcome(afterFirst, true)
    expect(afterSecond.repetitions).toBe(2)
    expect(afterSecond.intervalDays).toBe(6)
  })

  it("subsequent correct reviews grow the interval by the ease factor", () => {
    let state = applyReviewOutcome(FRESH, true) // rep 1, interval 1
    state = applyReviewOutcome(state, true) // rep 2, interval 6
    const third = applyReviewOutcome(state, true) // rep 3
    expect(third.intervalDays).toBe(Math.round(6 * state.easeFactor))
  })

  it("the interval is capped and never grows unbounded", () => {
    let state: ReviewState = FRESH
    for (let i = 0; i < 20; i++) {
      state = applyReviewOutcome(state, true)
    }
    expect(state.intervalDays).toBeLessThanOrEqual(180)
  })

  it("graduates to MASTERED only after enough repetitions AND a long enough interval", () => {
    let state: ReviewState = FRESH
    let masteryStatus: string = "LEARNING"
    for (let i = 0; i < 10; i++) {
      const outcome = applyReviewOutcome(state, true)
      state = outcome
      masteryStatus = outcome.masteryStatus
      if (masteryStatus === "MASTERED") break
    }
    expect(masteryStatus).toBe("MASTERED")
  })

  it("a single correct review is never enough to be MASTERED", () => {
    const outcome = applyReviewOutcome(FRESH, true)
    expect(outcome.masteryStatus).not.toBe("MASTERED")
  })

  it("nextReviewAt is always in the future relative to `now`", () => {
    const now = new Date("2026-03-01T00:00:00.000Z")
    const correct = applyReviewOutcome(FRESH, true, now)
    const incorrect = applyReviewOutcome(FRESH, false, now)
    expect(correct.nextReviewAt.getTime()).toBeGreaterThan(now.getTime())
    expect(incorrect.nextReviewAt.getTime()).toBeGreaterThan(now.getTime())
  })
})
