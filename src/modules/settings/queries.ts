import { cache } from "react"
import { prisma } from "@/lib/prisma"

export type SystemSettings = {
  requireEmailVerification: boolean
  requireTeacherVerification: boolean
  billingEnabled: boolean
  logoUrl: string | null
  heroImageUrl: string | null
  heroVideoUrl: string | null
  heroTitle: string | null
  heroSubtitle: string | null
}

// Mirrors the SystemSettings model's own column defaults — what the
// platform behaves like before a super admin ever saves a row (see
// modules/settings/actions.ts, the only place that row is ever written).
const DEFAULT_SETTINGS: SystemSettings = {
  requireEmailVerification: true,
  requireTeacherVerification: true,
  billingEnabled: true,
  logoUrl: null,
  heroImageUrl: null,
  heroVideoUrl: null,
  heroTitle: null,
  heroSubtitle: null,
}

// Memoized per request: a layout, a page, and a server action can all ask
// for this in the same request and share one DB lookup instead of issuing
// it repeatedly — same rationale as getCurrentUser in lib/authorization.ts.
export const getSystemSettings = cache(async (): Promise<SystemSettings> => {
  const row = await prisma.systemSettings.findUnique({ where: { id: "global" } })
  if (!row) return DEFAULT_SETTINGS

  return {
    requireEmailVerification: row.requireEmailVerification,
    requireTeacherVerification: row.requireTeacherVerification,
    billingEnabled: row.billingEnabled,
    logoUrl: row.logoUrl ?? null,
    heroImageUrl: row.heroImageUrl ?? null,
    heroVideoUrl: row.heroVideoUrl ?? null,
    heroTitle: row.heroTitle ?? null,
    heroSubtitle: row.heroSubtitle ?? null,
  }
})

