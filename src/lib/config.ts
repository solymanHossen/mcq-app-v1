/**
 * Application-wide branding and environment configuration.
 *
 * Uses NEXT_PUBLIC_ prefixed environment variables so values are accessible
 * on both the client and server side without prop drilling or context wrappers.
 */

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ||
  process.env.APP_NAME ||
  "BCS & Bank Aspirants"

export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "The premier platform for BCS & Bank competitive examination preparation, timed mock exams, verified question banks, and AI-driven performance analytics."
