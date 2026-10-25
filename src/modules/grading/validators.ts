import { z } from "zod"
import { optionChoiceEnum } from "./question"

export const examQuestionCorrectionSchema = z
  .object({
    correctOption: optionChoiceEnum.optional(),
    isCancelled: z.coerce.boolean().optional(),
    reason: z
      .string()
      .trim()
      .min(5, "Explain the reason for this correction")
      .max(1000),
  })
  .refine(
    (data) => data.correctOption !== undefined || data.isCancelled !== undefined,
    {
      message: "Specify a corrected answer or mark the question as cancelled",
      path: ["correctOption"],
    }
  )

export const examQuestionMarksSchema = z.object({
  marks: z.coerce.number().min(0, "Marks can't be negative").max(1000),
  negativeMarks: z.coerce
    .number()
    .min(0, "Negative marks must be zero or a positive deduction")
    .max(1000),
})
