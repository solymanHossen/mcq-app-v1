import type { MasteryStatus } from "@/prisma/generated/prisma/client"

/**
 * SM-2-derived review update. Only ever called from an explicit
 * mistake-notebook review submission (never from ordinary exam grading,
 * which can mark something wrong but never "advances" a review schedule —
 * see lib/learning/progress.ts). A correct review grows the interval
 * (capped) and raises/holds the ease factor; an incorrect review ("a lapse")
 * resets the interval and repetition count but — per the standard SM-2
 * lapse rule — only lowers the ease factor, never resets it, so a card that
 * lapses once doesn't lose all its accumulated "this is an easy card" signal.
 */

const MIN_EASE_FACTOR = 1.3
const LAPSE_EASE_PENALTY = 0.2
const MAX_INTERVAL_DAYS = 180
// A card graduates out of the review queue once it's survived this many
// consecutive correct reviews with a comfortably long interval — otherwise
// a card answered right exactly once would count as "mastered" forever.
const MASTERY_REPETITIONS = 4
const MASTERY_MIN_INTERVAL_DAYS = 21

export type ReviewState = {
  easeFactor: number
  intervalDays: number
  repetitions: number
}

export type ReviewOutcome = ReviewState & {
  masteryStatus: MasteryStatus
  nextReviewAt: Date
}

export function applyReviewOutcome(
  current: ReviewState,
  correct: boolean,
  now: Date = new Date()
): ReviewOutcome {
  if (!correct) {
    const easeFactor = Math.max(MIN_EASE_FACTOR, current.easeFactor - LAPSE_EASE_PENALTY)
    return {
      easeFactor,
      intervalDays: 1,
      repetitions: 0,
      masteryStatus: "LEARNING",
      nextReviewAt: addDays(now, 1),
    }
  }

  const repetitions = current.repetitions + 1
  const intervalDays = Math.min(
    MAX_INTERVAL_DAYS,
    repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(current.intervalDays * current.easeFactor)
  )
  // SM-2's own ease-factor update formula, evaluated at quality=5 (every
  // in-app review is a binary right/wrong, i.e. always "perfect recall" when
  // correct) — this reduces to a small fixed increase per correct review.
  const easeFactor = current.easeFactor + 0.1

  const masteryStatus: MasteryStatus =
    repetitions >= MASTERY_REPETITIONS && intervalDays >= MASTERY_MIN_INTERVAL_DAYS
      ? "MASTERED"
      : "REVIEWING"

  return {
    easeFactor,
    intervalDays,
    repetitions,
    masteryStatus,
    nextReviewAt: addDays(now, intervalDays),
  }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
