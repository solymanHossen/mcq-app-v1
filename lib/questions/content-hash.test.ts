import { describe, expect, it } from "vitest"
import { computeQuestionContentHash } from "./content-hash"

const base = {
  questionText: "What is 2 + 2?",
  optionA: "3",
  optionB: "4",
  optionC: "5",
  optionD: "6",
}

describe("computeQuestionContentHash", () => {
  it("is stable for identical input", () => {
    expect(computeQuestionContentHash(base)).toBe(
      computeQuestionContentHash(base)
    )
  })

  it("ignores surrounding whitespace and casing", () => {
    const messy = {
      questionText: "  WHAT is 2 + 2?  ",
      optionA: "3",
      optionB: " 4 ",
      optionC: "5",
      optionD: "6",
    }
    expect(computeQuestionContentHash(messy)).toBe(
      computeQuestionContentHash(base)
    )
  })

  it("ignores which slot the correct answer sits in (option order)", () => {
    const reordered = {
      questionText: "What is 2 + 2?",
      optionA: "6",
      optionB: "5",
      optionC: "4",
      optionD: "3",
    }
    expect(computeQuestionContentHash(reordered)).toBe(
      computeQuestionContentHash(base)
    )
  })

  it("differs when the question text differs", () => {
    expect(
      computeQuestionContentHash({ ...base, questionText: "What is 3 + 3?" })
    ).not.toBe(computeQuestionContentHash(base))
  })

  it("differs when an option differs", () => {
    expect(
      computeQuestionContentHash({ ...base, optionD: "7" })
    ).not.toBe(computeQuestionContentHash(base))
  })
})
