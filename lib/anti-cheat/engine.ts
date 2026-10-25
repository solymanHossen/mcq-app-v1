import { z } from "zod"
import type {
  ViolationType,
  ViolationSeverity,
} from "@/prisma/generated/prisma/client"

/**
 * Fixed, documented severity weights. "Configurable" in this module refers
 * to Exam.violationReviewThreshold (the cumulative score that flags an
 * attempt for review) — these per-type weights are a single, auditable
 * policy shared by every exam, not a per-exam configuration surface. That
 * tradeoff is deliberate: a dozen independently-tunable weights per exam
 * would be easy to misconfigure into either uselessness or constant false
 * flags, for little real benefit over one well-chosen shared scale.
 */
export const VIOLATION_SEVERITY: Record<ViolationType, ViolationSeverity> = {
  TAB_SWITCH: "LOW",
  WINDOW_BLUR: "LOW",
  RIGHT_CLICK_ATTEMPT: "LOW",
  COPY_ATTEMPT: "MEDIUM",
  PASTE_ATTEMPT: "MEDIUM",
  FULLSCREEN_EXIT: "MEDIUM",
  MULTIPLE_TABS_DETECTED: "MEDIUM",
  DEVTOOLS_DETECTED: "HIGH",
  SESSION_CONFLICT: "HIGH",
  SUSPICIOUS_REQUEST_PATTERN: "HIGH",
  WEBCAM_NO_FACE: "MEDIUM",
  WEBCAM_MULTIPLE_FACES: "HIGH",
}

const SEVERITY_WEIGHT: Record<ViolationSeverity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 4,
}

export function severityScore(severities: ViolationSeverity[]): number {
  return severities.reduce((sum, s) => sum + SEVERITY_WEIGHT[s], 0)
}

// Only these types may ever be self-reported by the exam-taking client.
// SESSION_CONFLICT and SUSPICIOUS_REQUEST_PATTERN are exclusively derived by
// the server from its own observations — a client claiming one of those
// directly would itself be a red flag, so it's rejected outright rather
// than trusted.
export const CLIENT_REPORTABLE_TYPES = [
  "TAB_SWITCH",
  "WINDOW_BLUR",
  "FULLSCREEN_EXIT",
  "COPY_ATTEMPT",
  "PASTE_ATTEMPT",
  "RIGHT_CLICK_ATTEMPT",
  "DEVTOOLS_DETECTED",
  "MULTIPLE_TABS_DETECTED",
  "WEBCAM_NO_FACE",
  "WEBCAM_MULTIPLE_FACES",
] as const satisfies readonly ViolationType[]

/**
 * Per-type metadata shape, deliberately minimal — never a raw device
 * fingerprint, IP, or location. Unknown/extra fields are stripped (Zod's
 * default .strip() behavior on z.object), so a client can't smuggle
 * arbitrary data into stored evidence.
 */
const metadataSchemas: Record<(typeof CLIENT_REPORTABLE_TYPES)[number], z.ZodType> = {
  TAB_SWITCH: z.object({ awayDurationMs: z.number().int().min(0).max(3_600_000) }),
  WINDOW_BLUR: z.object({ durationMs: z.number().int().min(0).max(3_600_000) }),
  FULLSCREEN_EXIT: z.object({}),
  COPY_ATTEMPT: z.object({ selectionLength: z.number().int().min(0).max(10_000) }),
  PASTE_ATTEMPT: z.object({ pastedLength: z.number().int().min(0).max(10_000) }),
  RIGHT_CLICK_ATTEMPT: z.object({}),
  DEVTOOLS_DETECTED: z.object({}),
  MULTIPLE_TABS_DETECTED: z.object({ tabCount: z.number().int().min(2).max(50) }),
  WEBCAM_NO_FACE: z.object({ durationMs: z.number().int().min(0).max(3_600_000) }),
  WEBCAM_MULTIPLE_FACES: z.object({ faceCount: z.number().int().min(2).max(10) }),
}

export function parseClientViolationMetadata(
  type: (typeof CLIENT_REPORTABLE_TYPES)[number],
  metadata: unknown
): z.ZodSafeParseResult<Record<string, number>> {
  // Every schema above produces a flat record of primitives (or {}), so this
  // cast is safe — it exists only to give callers a concrete, JSON-safe
  // output type instead of the generic z.ZodType's unknown.
  return metadataSchemas[type].safeParse(
    metadata ?? {}
  ) as z.ZodSafeParseResult<Record<string, number>>
}

// ─── Session-conflict detection ────────────────────────────────────────
// A different session token touching the same attempt while the previous
// one was active within this window is treated as a genuine conflict
// signal (two tabs/browsers simultaneously in use). Outside the window, the
// old tab is presumed closed/idle and the new token is adopted silently —
// an ordinary reload or resume is not a violation.
export const SESSION_CONFLICT_WINDOW_MS = 30_000

export type SessionConflictCheck =
  | { conflict: false }
  | { conflict: true; previousToken: string }

export function checkSessionConflict(
  current: { activeSessionToken: string | null; activeSessionTokenAt: Date | null },
  incomingToken: string,
  now: Date
): SessionConflictCheck {
  if (!current.activeSessionToken || current.activeSessionToken === incomingToken) {
    return { conflict: false }
  }
  const elapsed = now.getTime() - (current.activeSessionTokenAt?.getTime() ?? 0)
  if (elapsed < SESSION_CONFLICT_WINDOW_MS) {
    return { conflict: true, previousToken: current.activeSessionToken }
  }
  return { conflict: false }
}

// ─── Suspicious request-rate detection ─────────────────────────────────
// More than this many answer-save calls for the same attempt within the
// window is well beyond plausible human clicking and suggests a scripted
// submitter. Entirely best-effort: silently disabled if Redis isn't
// configured (see lib/anti-cheat/rate-detection.ts) — detection is a bonus
// signal for human review, never something the exam-taking flow depends on.
export const SUSPICIOUS_RATE_LIMIT = 20
export const SUSPICIOUS_RATE_WINDOW_SECONDS = 10
