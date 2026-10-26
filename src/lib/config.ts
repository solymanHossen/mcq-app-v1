/**
 * Application-wide branding and environment configuration.
 *
 * Uses NEXT_PUBLIC_ prefixed environment variables so values are accessible
 * on both the client and server side without prop drilling or context wrappers.
 */

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ||
  process.env.APP_NAME ||
  "ExamHub"

export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Build question banks, run timed exams, and auto-grade results with proctoring, leaderboards, and AI explanations."
