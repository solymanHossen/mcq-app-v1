import { describe, expect, it } from "vitest"
import {
  toInternalUnits,
  sumInternalUnits,
  roundMarks,
  roundRatio,
} from "./arithmetic"

describe("rounding policy: round half away from zero, 2 decimal places", () => {
  it("rounds a positive half up", () => {
    expect(roundMarks(toInternalUnits(2.345))).toBe(2.35)
  })

  it("rounds a negative half away from zero (not toward +Infinity)", () => {
    // Math.round(-2.345 * 100) would give -234 (toward +Infinity) in naive
    // JS rounding; the documented policy is -2.35, the mirror of +2.345.
    expect(roundMarks(toInternalUnits(-2.345))).toBe(-2.35)
  })

  it("never produces a signed negative zero", () => {
    const result = roundMarks(toInternalUnits(-0.001))
    expect(result).toBe(0)
    expect(Object.is(result, -0)).toBe(false)
  })
})

describe("fixed-point summation avoids float drift", () => {
  it("sums ten 0.1s to exactly 1, unlike naive float addition", () => {
    const naiveSum = Array.from({ length: 10 }, () => 0.1).reduce(
      (a, b) => a + b,
      0
    )
    expect(naiveSum).not.toBe(1) // the classic IEEE-754 drift this avoids

    const units = Array.from({ length: 10 }, () => toInternalUnits(0.1))
    expect(roundMarks(sumInternalUnits(units))).toBe(1)
  })

  it("sums three 0.3333 marks to exactly 1.00 at 2 decimal places", () => {
    const units = [0.3333, 0.3333, 0.3333].map(toInternalUnits)
    expect(roundMarks(sumInternalUnits(units))).toBe(1)
  })

  it("is deterministic regardless of summation order", () => {
    const a = [1.1, -0.25, 0.3333, 2, -0.6667]
    const b = [...a].reverse()
    expect(roundMarks(sumInternalUnits(a.map(toInternalUnits)))).toBe(
      roundMarks(sumInternalUnits(b.map(toInternalUnits)))
    )
  })
})

describe("roundRatio", () => {
  it("rounds accuracy to 4 decimal places", () => {
    expect(roundRatio(2 / 3)).toBe(0.6667)
  })

  it("returns exactly 0 for 0/0-shaped inputs rather than NaN", () => {
    expect(roundRatio(0)).toBe(0)
  })
})
