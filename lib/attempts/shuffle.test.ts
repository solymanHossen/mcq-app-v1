import { describe, expect, it } from "vitest"
import { shuffledQuestionOrder, shuffledOptionOrder } from "./shuffle"

describe("shuffledQuestionOrder", () => {
  it("is a permutation of 0..n-1", () => {
    const order = shuffledQuestionOrder(5, "attempt-1")
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4])
  })

  it("is deterministic for the same attemptId", () => {
    expect(shuffledQuestionOrder(6, "attempt-1")).toEqual(
      shuffledQuestionOrder(6, "attempt-1")
    )
  })

  it("differs across attempts (with overwhelming probability)", () => {
    const a = shuffledQuestionOrder(8, "attempt-1")
    const b = shuffledQuestionOrder(8, "attempt-2")
    expect(a).not.toEqual(b)
  })
})

describe("shuffledOptionOrder", () => {
  it("is always a permutation of A-D", () => {
    const order = shuffledOptionOrder("attempt-1", "q-1")
    expect([...order].sort()).toEqual(["A", "B", "C", "D"])
  })

  it("is deterministic for the same attempt+question", () => {
    expect(shuffledOptionOrder("attempt-1", "q-1")).toEqual(
      shuffledOptionOrder("attempt-1", "q-1")
    )
  })

  it("varies independently per question within the same attempt", () => {
    const q1 = shuffledOptionOrder("attempt-1", "q-1")
    const q2 = shuffledOptionOrder("attempt-1", "q-2")
    expect(q1).not.toEqual(q2)
  })
})
