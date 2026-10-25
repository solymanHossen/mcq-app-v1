import { prisma } from "@/lib/prisma"

/**
 * What a user with no active paid subscription gets. Plans override this
 * entirely (a plan's `entitlements` JSON is the complete feature set for
 * that plan, not a set of deltas on top of this) — this is only the
 * fallback when there's no ACTIVE/TRIALING subscription to read from.
 */
export const FREE_TIER_ENTITLEMENTS: Record<string, number | boolean> = {
  maxActiveExams: 3,
  aiExplanationsEnabled: false,
}

/** The single current subscription, if any — "current" meaning the most
 * recent by period start among statuses that still grant access.
 * PAST_DUE is included deliberately: a late payment doesn't instantly
 * revoke access, it's a grace state (see lib/payments/webhook-processor.ts),
 * though getEntitlements below still treats it as de-escalated to the free
 * tier until the payment actually succeeds. */
export function getCurrentSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId, status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
    orderBy: { currentPeriodStart: "desc" },
    include: { plan: true },
  })
}

export async function getEntitlements(userId: string): Promise<Record<string, unknown>> {
  const subscription = await getCurrentSubscription(userId)
  if (!subscription || subscription.status === "PAST_DUE") {
    return FREE_TIER_ENTITLEMENTS
  }
  return subscription.plan.entitlements as Record<string, unknown>
}

export async function hasEntitlement(userId: string, key: string): Promise<boolean> {
  const entitlements = await getEntitlements(userId)
  return !!entitlements[key]
}

export async function getEntitlementValue(userId: string, key: string): Promise<unknown> {
  const entitlements = await getEntitlements(userId)
  return entitlements[key]
}
