import { createHash } from "crypto"

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ")
}

/**
 * Order-independent hash of question text + option set. Two questions with
 * the same wording and the same four options (even if the correct answer is
 * in a different slot) hash identically, since they're testing the same
 * thing. Exact-match only — this is a cheap, false-positive-free signal, not
 * fuzzy similarity.
 */
export function computeQuestionContentHash(input: {
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}) {
  const options = [input.optionA, input.optionB, input.optionC, input.optionD]
    .map(normalize)
    .sort()
  return createHash("sha256")
    .update(normalize(input.questionText) + "|" + options.join("|"))
    .digest("hex")
}
