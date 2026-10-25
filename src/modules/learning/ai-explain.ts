import { z } from "zod"
import { prisma } from "@/lib/prisma"

/**
 * Optional end-to-end: disabled by default (no ANTHROPIC_API_KEY configured)
 * and entirely isolated from exam submission/grading — nothing in
 * lib/grading or actions/attempt.actions imports this module, and nothing
 * here is ever awaited as part of finishing an exam. It is only ever called
 * on-demand from the mistake-notebook review UI (actions/ai.actions.ts).
 *
 * Cost control: an explanation is generated at most ONCE per ExamQuestion,
 * ever — cached in AIExplanation and shared by every student who asks for
 * the same question afterward (a cache hit never calls the provider and
 * never counts against anyone's rate limit). The per-student daily limit
 * (AI_DAILY_EXPLANATION_LIMIT) only ever gates the cache-miss path.
 *
 * Validation: the provider's raw text is checked against explanationSchema
 * (non-empty, bounded length) before it's trusted enough to cache or show —
 * a provider returning garbage, an error page, or nothing never gets stored.
 *
 * Failure handling: every provider call is wrapped with a timeout and a
 * try/catch; a provider outage returns a typed `{ error }`, never a thrown
 * exception that could surface as a 500 to the student.
 */

export const AI_DAILY_EXPLANATION_LIMIT = 20
const PROVIDER_TIMEOUT_MS = 15_000
const DEFAULT_MODEL = "claude-haiku-4-5-20251001"

const explanationSchema = z.string().trim().min(10).max(2000)

export type ExplanationResult = { content: string; cached: boolean } | { error: string }

export function isAIExplanationsEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

export type ProviderResult = { content: string } | { error: string }

export async function callAnthropicProvider(prompt: string): Promise<ProviderResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { error: "AI explanations are not configured" }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS)
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_EXPLANATION_MODEL ?? DEFAULT_MODEL,
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      return { error: `AI provider returned an error (${res.status})` }
    }
    const data: unknown = await res.json()
    const text = extractText(data)
    return { content: text ?? "" }
  } catch {
    return { error: "AI provider request failed or timed out" }
  } finally {
    clearTimeout(timeout)
  }
}

function extractText(data: unknown): string | null {
  if (
    typeof data === "object" &&
    data !== null &&
    "content" in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    const first = (data as { content: unknown[] }).content[0]
    if (
      typeof first === "object" &&
      first !== null &&
      "text" in first &&
      typeof (first as { text: unknown }).text === "string"
    ) {
      return (first as { text: string }).text
    }
  }
  return null
}

function buildPrompt(question: {
  questionTextSnapshot: string
  optionASnapshot: string
  optionBSnapshot: string
  optionCSnapshot: string
  optionDSnapshot: string
  correctOptionSnapshot: string
}): string {
  return [
    "Explain, in 2-4 short sentences for a student reviewing a mistake, why the correct answer is correct and why a common wrong choice might seem tempting.",
    "Do not repeat the question verbatim. Plain text only, no markdown.",
    "",
    `Question: ${question.questionTextSnapshot}`,
    `A. ${question.optionASnapshot}`,
    `B. ${question.optionBSnapshot}`,
    `C. ${question.optionCSnapshot}`,
    `D. ${question.optionDSnapshot}`,
    `Correct answer: ${question.correctOptionSnapshot}`,
  ].join("\n")
}

async function isWithinDailyLimit(studentId: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const count = await prisma.aIExplanationRequest.count({
    where: { studentId, createdAt: { gte: since } },
  })
  return count < AI_DAILY_EXPLANATION_LIMIT
}

export async function getOrGenerateExplanation(
  examQuestionId: string,
  studentId: string,
  opts: { provider?: (prompt: string) => Promise<ProviderResult> } = {}
): Promise<ExplanationResult> {
  const cached = await prisma.aIExplanation.findUnique({ where: { examQuestionId } })
  if (cached) return { content: cached.content, cached: true }

  if (!isAIExplanationsEnabled()) {
    return { error: "AI explanations are not available right now" }
  }

  if (!(await isWithinDailyLimit(studentId))) {
    return { error: "You've reached today's limit for AI explanations — try again tomorrow" }
  }

  const question = await prisma.examQuestion.findUnique({
    where: { id: examQuestionId },
    select: {
      questionTextSnapshot: true,
      optionASnapshot: true,
      optionBSnapshot: true,
      optionCSnapshot: true,
      optionDSnapshot: true,
      correctOptionSnapshot: true,
    },
  })
  if (!question) return { error: "Question not found" }

  // Logged before the provider call, not after: a request that times out or
  // crashes mid-flight still consumed a slot of the daily limit (it still
  // cost real provider time/money), so it must still count.
  await prisma.aIExplanationRequest.create({ data: { studentId, examQuestionId } })

  const provider = opts.provider ?? callAnthropicProvider
  const result = await provider(buildPrompt(question))
  if ("error" in result) return result

  const parsed = explanationSchema.safeParse(result.content)
  if (!parsed.success) {
    return { error: "AI provider returned an invalid explanation" }
  }

  const saved = await prisma.aIExplanation.upsert({
    where: { examQuestionId },
    create: {
      examQuestionId,
      content: parsed.data,
      model: process.env.ANTHROPIC_EXPLANATION_MODEL ?? DEFAULT_MODEL,
    },
    update: {},
  })

  return { content: saved.content, cached: false }
}
