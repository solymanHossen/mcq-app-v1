import Link from "next/link"
import {
  CreditCard,
  CheckCircle2,
  Ban,
  Calendar,
  Check,
  Users,
  DollarSign,
  Layers,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { listAllSubscriptionPlans } from "@/modules/payments/queries"
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
      ? "AI automated step-by-step explanations"
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

  const [allPlans, totalActiveSubscribers, revenueAggregate, subscriberGroups] =
    await Promise.all([
      listAllSubscriptionPlans(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.paymentTransaction.aggregate({
        where: { status: "SUCCEEDED" },
        _sum: { amountCents: true },
      }),
      prisma.subscription.groupBy({
        by: ["planId"],
        where: { status: "ACTIVE" },
        _count: { id: true },
      }),
    ])

  const totalRevenueCents = revenueAggregate._sum.amountCents ?? 0
  const activePlanCount = allPlans.filter((p) => p.isActive).length

  const subscribersPerPlan = new Map(
    subscriberGroups.map((g) => [g.planId, g._count.id])
  )

  const filteredPlans = allPlans.filter((p) => {
    if (activeTab === "active") return p.isActive
    if (activeTab === "inactive") return !p.isActive
    return true
  })

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      {/* ================= PAGE HEADER & NEW PLAN BUTTON ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Subscription Plans
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalActiveSubscribers}</span> active subscriber{totalActiveSubscribers === 1 ? "" : "s"} ·{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatPrice(totalRevenueCents, "usd")}
            </span>{" "}
            total billed ·{" "}
            <span className="font-semibold text-foreground">{activePlanCount}</span> of {allPlans.length} active tiers
          </p>
        </div>

        <CreatePlanDialog />
      </div>

      {/* ================= 3-TILE SUMMARY METRICS STRIP ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {/* Metric 1: Total Active Subscribers */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Subscribers
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-2xs">
              <Users className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {totalActiveSubscribers}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Total candidates on paid plans
            </p>
          </div>
        </div>

        {/* Metric 2: Total Billed Revenue */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Billed
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <DollarSign className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatPrice(totalRevenueCents, "usd")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Lifetime successful transactions
            </p>
          </div>
        </div>

        {/* Metric 3: Active Tier Catalog */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Plan Tiers
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-2xs">
              <Layers className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {activePlanCount} <span className="text-sm font-medium text-muted-foreground">/ {allPlans.length}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Active tiers published to users
            </p>
          </div>
        </div>
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
            const subscribersCount = subscribersPerPlan.get(plan.id) ?? 0

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
                  {/* Top Bar: Icon + Name + Small Active Dot Indicator + Key + Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                        <CreditCard className="size-5" />
                      </span>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading text-lg font-bold tracking-tight text-foreground truncate">
                            {plan.name}
                          </h3>

                          {/* Smaller, elegant Active/Inactive indicator right beside the name */}
                          {plan.isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xs">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground shadow-2xs">
                              <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                              <span>Inactive</span>
                            </span>
                          )}
                        </div>

                        {plan.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {plan.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <code className="rounded-lg bg-muted/60 border border-border/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground shadow-2xs">
                        {plan.key}
                      </code>
                      <PlanActiveToggle planId={plan.id} isActive={plan.isActive} />
                    </div>
                  </div>

                  {/* Price Banner with Active Subscribers Count */}
                  <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 shadow-2xs flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-heading text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                        {formatPrice(plan.priceCents, plan.currency)}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        / {plan.billingInterval.toLowerCase()}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground shadow-2xs">
                      <Users className="size-3.5 text-primary" />
                      <span>{subscribersCount} active</span>
                    </span>
                  </div>

                  {/* Clean Formatted Entitlements (NO RAW JSON) */}
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Included Privileges
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

                  <span className="text-[11px] font-medium text-muted-foreground">
                    Tier #{plan.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
