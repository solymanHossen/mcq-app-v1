import { z } from "zod"
import { optionChoiceEnum } from "./question"

export const toggleBookmarkSchema = z.object({
  examQuestionId: z.string().uuid(),
})

export const submitMistakeReviewSchema = z.object({
  examQuestionId: z.string().uuid(),
  selectedOption: optionChoiceEnum,
  // Client-generated nonce, stable across retries of the same submission —
  // the idempotency key for the XP award (see lib/learning/xp.ts). Not a
  // security boundary, just a dedupe handle.
  reviewEventId: z.string().min(1).max(200),
  clientTimezone: z.string().min(1).max(100).optional(),
})

export const getExplanationSchema = z.object({
  examQuestionId: z.string().uuid(),
})
