import { describe, expect, it } from "vitest"
import { examSchema } from "./exam"

const validExam = {
  title: "Midterm Exam",
  durationMinutes: "60",
  maxAttempts: "1",
  shuffleQuestions: true,
  shuffleOptions: false,
}

describe("examSchema", () => {
  it("accepts well-formed exam input", () => {
    expect(examSchema.safeParse(validExam).success).toBe(true)
  })

  it("rejects a title that's too short", () => {
    expect(
      examSchema.safeParse({ ...validExam, title: "Hi" }).success
    ).toBe(false)
  })

  it("rejects a duration outside the allowed range", () => {
    expect(
      examSchema.safeParse({ ...validExam, durationMinutes: "0" }).success
    ).toBe(false)
    expect(
      examSchema.safeParse({ ...validExam, durationMinutes: "601" }).success
    ).toBe(false)
  })

  it("rejects an end time before the start time", () => {
    const result = examSchema.safeParse({
      ...validExam,
      startTime: "2026-01-02T10:00",
      endTime: "2026-01-01T10:00",
    })
    expect(result.success).toBe(false)
  })

  it("accepts an end time after the start time", () => {
    const result = examSchema.safeParse({
      ...validExam,
      startTime: "2026-01-01T10:00",
      endTime: "2026-01-02T10:00",
    })
    expect(result.success).toBe(true)
  })
})
