/**
 * Deterministic grading arithmetic.
 *
 * Every per-question mark value is converted to a fixed-point integer
 * (4 decimal places) before being summed. Summing integers is exact — it
 * can never accumulate the IEEE-754 floating-point drift that repeated
 * `+=` on plain JS numbers would (e.g. 0.1 + 0.2 !== 0.3). Only the final
 * total is converted back to a decimal, at which point it's rounded.
 *
 * Rounding policy: 2 decimal places, "round half away from zero" — 2.345 →
 * 2.35, and symmetrically -2.345 → -2.35. This is chosen over JS's native
 * `Math.round` (which rounds -2.5 to -2, toward +Infinity, not away from
 * zero) specifically because negative marking can produce negative totals,
 * and the policy should treat a loss the same way it treats a gain.
 *
 * Marks should be configured with at most 4 decimal places. A fraction that
 * isn't exactly representable at that scale (e.g. the repeating decimal for
 * 1/3) must be rounded by whoever configures it (e.g. 0.3333), not by this
 * module.
 */
const INTERNAL_SCALE = 10_000

export function toInternalUnits(marks: number): number {
  return Math.round(marks * INTERNAL_SCALE)
}

export function sumInternalUnits(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0)
}

/** Converts fixed-point internal units back to a rounded decimal. */
export function roundMarks(internalUnits: number): number {
  const marks = internalUnits / INTERNAL_SCALE
  const rounded = (Math.sign(marks) * Math.round(Math.abs(marks) * 100)) / 100
  return rounded === 0 ? 0 : rounded // normalize -0 to 0
}

/** Rounds a ratio (e.g. accuracy) to 4 decimal places, same policy. */
export function roundRatio(value: number): number {
  const rounded =
    (Math.sign(value) * Math.round(Math.abs(value) * 10_000)) / 10_000
  return rounded === 0 ? 0 : rounded
}
