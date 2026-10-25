import { getDueReviews } from "./queries"
import { getWeakestTopics } from "@/lib/analytics/engine"

/**
 * Pure composition over existing read queries — no new schema, no stored
 * "recommendation" rows. A recommendation is a view onto data that already
 * exists (due spaced-repetition items, weak topics from analytics), always
 * fresh on every read, never a stale cached suggestion.
 *
 * A due review whose exam hasn't had its answer key released yet is
 * excluded, not just hidden in the UI: reviewing it would require telling
 * the student right/wrong against an answer key their teacher hasn't
 * released, the same disclosure gate the review action itself enforces (see
 * actions/learning.actions.ts).
 */
export async function getPracticeRecommendations(studentId: string) {
  const [dueReviewsRaw, weakestTopics] = await Promise.all([
    getDueReviews(studentId),
    getWeakestTopics(studentId),
  ])

  const dueReviews = dueReviewsRaw.filter((r) => r.examQuestion.exam.answerKeyReleased)

  return { dueReviews, weakestTopics }
}
