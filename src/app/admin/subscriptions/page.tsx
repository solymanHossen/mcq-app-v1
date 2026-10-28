import Link from "next/link"
import {
  CreditCard,
  CheckCircle2,
  Ban,
  Calendar,
  Check,
  Zap,
  Sparkles,
  Layers,
  Code2,
} from "lucide-react"
import { listAllSubscriptionPlans } from "@/modules/payments/queries"
import { Badge } from "@/components/ui/badge"
import { CreatePlanDialog } from "@/modules/payments/components/create-plan-form"
import { PlanActiveToggle } from "@/modules/payments/components/plan-active-toggle"
import { cn } from "@/lib/utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function formatEntitlement(key: string, value: unknown): string {
  if (key === "maxActiveExams") {
    return `Up to ${value} concurrent active assessment tracks`
  }
  if (key === "aiExplanationsEnabled") {
    return value
      ? "AI automated step-by-step question explanations"
      : "Standard textbook explanations"
  }
  if (key === "prioritySupport") {
    return value ? "Priority institutional educator support" : "Standard support"
  }
  if (typeof value === "boolean") {
    return value
      ? `${key.replace(/([A-Z])/g, " $1").toLowerCase()} included`
      : `No ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`
  }
  if (typeof value === "number") {
    return `${key.replace(/([A-Z])/g, " $1")}: ${value}`
  }
  return `${key}: ${String(value)}`
}

const FILTER_TABS = [
  { label: "All Tiers", value: "all", icon: CreditCard },
  { label: "Active Plans", value: "active", icon: CheckCircle2 },
  { label: "Inactive / Archived", value: "inactive", icon: Ban },
]

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>
}) {
  const sp = (await searchParams) ?? {}
  const activeTab = sp.filter ?? "all"

  const allPlans = await listAllSubscriptionPlans()

  const filteredPlans = allPlans.filter((p) => {
    if (activeTab === "active") return p.isActive
    if (activeTab === "inactive") return !p.isActive
    return true
  })

  const activeCount = allPlans.filter((p) => p.isActive).length

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      {/* ================= PAGE HEADER & NEW PLAN BUTTON ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Subscription Plans
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {activeCount} active · {allPlans.length} total billing tiers · Platform monetization, quotas, and feature allocations
          </p>
        </div>

        <CreatePlanDialog />
      </div>

      {/* ================= MODERN SEGMENTED FILTER DOCK ================= */}
      <div className="w-full overflow-x-auto pb-1 scrollbar-none">
        <nav
          role="tablist"
          aria-label="Filter subscription plans"
          className="flex w-fit min-w-fit items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-2 sm:p-2 min-h-12 sm:min-h-14"
        >
          {FILTER_TABS.map(({ label, value, icon: Icon }) => {
            const isSelected = activeTab === value
            const href = value === "all" ? "/admin/subscriptions" : `?filter=${value}`

            return (
              <Link
                key={value}
                href={href}
                role="tab"
                aria-selected={isSelected}
                className={cn(
                  "group relative flex !h-auto min-h-9.5 sm:min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 select-none sm:gap-2.5 sm:px-5 sm:py-2.5",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 sm:size-4.5 transition-transform duration-200 group-hover:scale-105",
                    isSelected
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ================= SUBSCRIPTION PLANS GRID ================= */}
      {filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-12 text-center shadow-xs">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border/70">
            <CreditCard className="size-6" />
          </span>
          <p className="font-heading font-bold text-foreground text-base">
            No subscription plans found
          </p>
          <p className="text-xs text-muted-foreground">
            {activeTab === "all"
              ? "Create your first subscription tier to get started."
              : `There are currently no ${activeTab} plans.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredPlans.map((plan) => {
            const entitlementsObj =
              typeof plan.entitlements === "object" && plan.entitlements !== null
                ? (plan.entitlements as Record<string, unknown>)
                : {}

            const entitlementEntries = Object.entries(entitlementsObj)

            return (
              <div
                key={plan.id}
                className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs hover:border-border hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Top Bar: Icon + Name + Key + Status Badge + Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                        <CreditCard className="size-5 sm:size-6" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                            {plan.name}
                          </h3>
                          <code className="rounded-lg bg-muted/60 border border-border/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground shadow-2xs">
                            {plan.key}
                          </code>
                        </div>
                        {plan.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {plan.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {plan.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground shadow-2xs">
                          <span>Inactive</span>
                        </span>
                      )}

                      <PlanActiveToggle planId={plan.id} isActive={plan.isActive} />
                    </div>
                  </div>

                  {/* Price Banner */}
                  <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 shadow-2xs">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
                        {formatPrice(plan.priceCents, plan.currency)}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                        / {plan.billingInterval.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* Entitlements Feature List */}
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Platform Entitlements
                    </p>

                    {entitlementEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        Standard platform privileges
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {entitlementEntries.map(([key, val]) => (
                          <li
                            key={key}
                            className="flex items-center gap-2 text-xs sm:text-sm text-foreground/90 font-medium"
                          >
                            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <Check className="size-3 stroke-[3]" />
                            </span>
                            <span>{formatEntitlement(key, val)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Footer Timestamp */}
                <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3 text-muted-foreground/80" />
                    <span>
                      Created{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(plan.createdAt))}
                    </span>
                  </div>

                  <details className="group/code cursor-pointer select-none">
                    <summary className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground list-none">
                      <Code2 className="size-3" />
                      <span>Raw JSON</span>
                    </summary>
                    <pre className="mt-2 rounded-xl border border-border/70 bg-muted/40 p-3 font-mono text-[11px] text-foreground shadow-2xs overflow-x-auto max-w-full">
                      {JSON.stringify(plan.entitlements, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
