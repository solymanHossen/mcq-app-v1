import { prisma } from "@/lib/prisma"

/**
 * Timezone-aware streak rules.
 *
 * "Today" and "yesterday" are computed in the student's own IANA timezone
 * (client-reported — see the `clientTimezone` param on the actions that call
 * this), never in UTC or server-local time: a student in UTC+6 who studies
 * at 11pm their time and again at 1am the next calendar day (UTC) must see
 * that as two consecutive days, not a broken streak, and a student who is
 * simply inactive for a full local day must see the streak reset even if
 * fewer than 24 UTC hours have elapsed.
 *
 * Idempotency: calling this twice for the same local day is a no-op (the
 * stored lastActiveDate already equals today), so retried or duplicate
 * activity events (e.g. a submit retried after a dropped response) can never
 * inflate the streak.
 *
 * An unrecognized/invalid timezone string falls back to UTC rather than
 * throwing — this is a UX nicety, not a security boundary, so a malformed
 * client-reported value degrades gracefully instead of failing the whole
 * activity event it's attached to.
 */

export function localDateString(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date) // en-CA formats as YYYY-MM-DD
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)
  }
}

function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

export type StreakState = {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
}

/** Pure computation, unit-testable without touching the database. */
export function computeStreakUpdate(
  prev: StreakState,
  todayStr: string,
  yesterdayStr: string
): StreakState {
  if (prev.lastActiveDate === todayStr) {
    return prev // already recorded today — no-op, not a fresh increment
  }

  const currentStreak = prev.lastActiveDate === yesterdayStr ? prev.currentStreak + 1 : 1
  const longestStreak = Math.max(prev.longestStreak, currentStreak)

  return { currentStreak, longestStreak, lastActiveDate: todayStr }
}

export async function recordDailyActivity(
  studentId: string,
  clientTimezone: string | undefined,
  now: Date = new Date()
) {
  const timezone = clientTimezone && isValidTimezone(clientTimezone) ? clientTimezone : "UTC"
  const todayStr = localDateString(now, timezone)
  const yesterdayStr = localDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000), timezone)

  const existing = await prisma.userStreak.findUnique({ where: { studentId } })
  const prevState: StreakState = existing
    ? {
        currentStreak: existing.currentStreak,
        longestStreak: existing.longestStreak,
        lastActiveDate: existing.lastActiveDate,
      }
    : { currentStreak: 0, longestStreak: 0, lastActiveDate: null }

  const next = computeStreakUpdate(prevState, todayStr, yesterdayStr)

  if (existing && next.lastActiveDate === existing.lastActiveDate) {
    // No-op day — still refresh the stored timezone so a traveling student's
    // zone is current the next time they're active, but skip a pointless
    // write of identical streak numbers.
    if (existing.timezone !== timezone) {
      await prisma.userStreak.update({ where: { studentId }, data: { timezone } })
    }
    return { ...next, timezone, isNewDay: false }
  }

  await prisma.userStreak.upsert({
    where: { studentId },
    create: {
      studentId,
      currentStreak: next.currentStreak,
      longestStreak: next.longestStreak,
      lastActiveDate: next.lastActiveDate,
      timezone,
    },
    update: {
      currentStreak: next.currentStreak,
      longestStreak: next.longestStreak,
      lastActiveDate: next.lastActiveDate,
      timezone,
    },
  })

  return { ...next, timezone, isNewDay: true }
}
