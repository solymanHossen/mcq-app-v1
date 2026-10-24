import { z } from "zod"

export const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"])
export const optionChoiceEnum = z.enum(["A", "B", "C", "D"])
export const questionStatusEnum = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"])

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined))

const questionBaseSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(100),
  topic: z.string().trim().min(1, "Topic is required").max(100),
  difficulty: difficultyEnum,
  questionText: z
    .string()
    .trim()
    .min(3, "Question text is required")
    .max(5000),
  optionA: z.string().trim().min(1, "Option A is required").max(1000),
  optionB: z.string().trim().min(1, "Option B is required").max(1000),
  optionC: z.string().trim().min(1, "Option C is required").max(1000),
  optionD: z.string().trim().min(1, "Option D is required").max(1000),
  correctOption: optionChoiceEnum,
  explanation: optionalText(5000),
  imageUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  codeSnippet: optionalText(5000),
  codeLanguage: optionalText(50),
})

function requireFourDistinctOptions(
  data: { optionA: string; optionB: string; optionC: string; optionD: string },
  ctx: z.RefinementCtx
) {
  const options = [data.optionA, data.optionB, data.optionC, data.optionD]
  const normalized = options.map((o) => o.trim().toLowerCase())
  if (new Set(normalized).size !== 4) {
    ctx.addIssue({
      code: "custom",
      message: "All four options must be different from each other",
      path: ["optionA"],
    })
  }
}

export const questionSchema = questionBaseSchema.superRefine(
  requireFourDistinctOptions
)

// CSV values are free text ("easy", "Easy", "a", "A", …) — be lenient about
// case before validating against the strict enum.
const upperTrim = (v: unknown) =>
  typeof v === "string" ? v.trim().toUpperCase() : v

export const questionImportRowSchema = questionBaseSchema
  .extend({
    difficulty: z.preprocess(upperTrim, difficultyEnum),
    correctOption: z.preprocess(upperTrim, optionChoiceEnum),
  })
  .superRefine(requireFourDistinctOptions)

export type QuestionInput = z.infer<typeof questionSchema>
export type QuestionImportRow = z.infer<typeof questionImportRowSchema>

export const questionReportSchema = z.object({
  reason: z.string().trim().min(5, "Describe the issue in a few words").max(1000),
})

export const questionReportResolutionSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]),
  resolutionNote: optionalText(1000),
})

export const IMPORT_COLUMNS = [
  "subject",
  "topic",
  "difficulty",
  "questionText",
  "optionA",
  "optionB",
  "optionC",
  "optionD",
  "correctOption",
  "explanation",
  "codeSnippet",
  "codeLanguage",
  "imageUrl",
] as const

export const IMPORT_TEMPLATE_HEADER = IMPORT_COLUMNS.join(",")
