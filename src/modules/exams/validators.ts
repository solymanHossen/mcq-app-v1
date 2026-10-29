import { z } from "zod"

export const examStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"])

export const examSchema = z
  .object({
    title: z.string().trim().min(3, "Title is required").max(200),
    description: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : undefined)),
    durationMinutes: z.coerce
      .number({ error: "Duration is required" })
      .int()
      .min(1, "Duration must be at least 1 minute")
      .max(600, "Duration can't exceed 600 minutes"),
    maxAttempts: z.coerce
      .number({ error: "Max attempts is required" })
      .int()
      .min(1)
      .max(10),
    passingMarks: z
      .union([z.coerce.number().min(0), z.literal("")])
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    startTime: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : undefined)),
    endTime: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : undefined)),
    // Booleans are pre-converted from the raw FormData checkbox presence
    // before this schema runs — see actions/exam.actions.ts.
    shuffleQuestions: z.boolean(),
    shuffleOptions: z.boolean(),
    webcamMonitoringRequired: z.boolean(),
    violationReviewThreshold: z.coerce
      .number({ error: "Review threshold is required" })
      .int()
      .min(1, "Must be at least 1")
      .max(1000),
    isPublic: z.boolean().default(true),
    allowGuestAccess: z.boolean().default(true),
    accessCode: z
      .string()
      .trim()
      .max(50)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : undefined)),
  })
  .refine(
    (data) =>
      !data.startTime ||
      !data.endTime ||
      new Date(data.startTime) < new Date(data.endTime),
    { message: "End time must be after start time", path: ["endTime"] }
  )

export type ExamInput = z.infer<typeof examSchema>

export const examQuestionOrderSchema = z.object({
  questionIds: z.array(z.string().uuid()).min(1),
})

export const addQuestionsToExamSchema = z.object({
  questionIds: z.array(z.string().uuid()).min(1).max(100),
})
