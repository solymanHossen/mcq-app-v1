import { createHash } from "crypto"

// Deterministic PRNG (mulberry32) seeded from a string — same seed always
// produces the same sequence, so a shuffle computed from stable inputs
// (attemptId, examQuestionId) never "jumps" between renders/requests without
// having to persist the permutation itself.
function seededRandom(seed: string) {
  let state = createHash("sha256").update(seed).digest().readUInt32LE(0)
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], seed: string): T[] {
  const random = seededRandom(seed)
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Per-attempt question order, stable for the life of the attempt. */
export function shuffledQuestionOrder(count: number, attemptId: string) {
  return shuffle(
    Array.from({ length: count }, (_, i) => i),
    `questions:${attemptId}`
  )
}

const OPTION_KEYS = ["A", "B", "C", "D"] as const
export type OptionChoice = (typeof OPTION_KEYS)[number]

/**
 * Per-attempt, per-question display order for the four options. The
 * student's selection is always stored/compared by its canonical letter
 * (A–D as authored) — this only changes which slot it's rendered in.
 */
export function shuffledOptionOrder(
  attemptId: string,
  examQuestionId: string
): OptionChoice[] {
  return shuffle([...OPTION_KEYS], `options:${attemptId}:${examQuestionId}`)
}
