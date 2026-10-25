import { describe, expect, it } from "vitest"
import { questionSchema, questionImportRowSchema } from "./validators"

const validQuestion = {
  subject: "Math",
  topic: "Algebra",
  difficulty: "MEDIUM",
  questionText: "What is 2 + 2?",
  optionA: "3",
  optionB: "4",
  optionC: "5",
  optionD: "6",
  correctOption: "B",
}

describe("questionSchema", () => {
  it("accepts a well-formed four-option question", () => {
    expect(questionSchema.safeParse(validQuestion).success).toBe(true)
  })

  it("rejects four options that aren't all different", () => {
    const result = questionSchema.safeParse({
      ...validQuestion,
      optionC: "4", // duplicates optionB
    })
    expect(result.success).toBe(false)
  })

  it("rejects options that are duplicates only after trimming/casing", () => {
    const result = questionSchema.safeParse({
      ...validQuestion,
      optionA: "Four",
      optionB: " four ",
    })
    expect(result.success).toBe(false)
  })

  it("rejects an empty option", () => {
    const result = questionSchema.safeParse({ ...validQuestion, optionD: "" })
    expect(result.success).toBe(false)
  })

  it("rejects an invalid correctOption value", () => {
    const result = questionSchema.safeParse({
      ...validQuestion,
      correctOption: "E",
    })
    expect(result.success).toBe(false)
  })

  it("treats an empty optional field as absent, not an error", () => {
    const result = questionSchema.safeParse({
      ...validQuestion,
      explanation: "",
      imageUrl: "",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.explanation).toBeUndefined()
      expect(result.data.imageUrl).toBeUndefined()
    }
  })

  it("rejects a malformed image URL", () => {
    const result = questionSchema.safeParse({
      ...validQuestion,
      imageUrl: "not-a-url",
    })
    expect(result.success).toBe(false)
  })
})

describe("questionImportRowSchema", () => {
  it("is lenient about case for difficulty and correctOption (CSV input)", () => {
    const result = questionImportRowSchema.safeParse({
      ...validQuestion,
      difficulty: "medium",
      correctOption: "b",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.difficulty).toBe("MEDIUM")
      expect(result.data.correctOption).toBe("B")
    }
  })

  it("still enforces four distinct options for import rows", () => {
    const result = questionImportRowSchema.safeParse({
      ...validQuestion,
      difficulty: "easy",
      optionC: "4",
    })
    expect(result.success).toBe(false)
  })
})
