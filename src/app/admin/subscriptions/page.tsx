import { listAllSubscriptionPlans } from "@/modules/payments/queries"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CreatePlanForm } from "@/modules/payments/components/create-plan-form"
import { PlanActiveToggle } from "@/modules/payments/components/plan-active-toggle"
import { cn } from "@/lib/utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100)
}

export default async function AdminSubscriptionsPage() {
  const plans = await listAllSubscriptionPlans()

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Subscription Plans
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage platform billing tiers, feature allocations, and subscription pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-card p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">
                    {plan.name}
                  </h3>
                  <Badge
                    variant={plan.isActive ? "default" : "secondary"}
                    className={cn(
                      "rounded-lg px-2.5 py-0.5 text-xs font-semibold shadow-2xs",
                      plan.isActive && "bg-emerald-600 text-white"
                    )}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <PlanActiveToggle planId={plan.id} isActive={plan.isActive} />
              </div>

              <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
                {formatPrice(plan.priceCents, plan.currency)}{" "}
                <span className="text-sm font-medium text-muted-foreground">
                  / {plan.billingInterval.toLowerCase()}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Identifier key: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{plan.key}</code>
              </p>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Entitlements
                </p>
                <pre className="mt-1.5 rounded-xl bg-muted/40 p-3 font-mono text-xs text-foreground shadow-2xs overflow-x-auto">
                  {JSON.stringify(plan.entitlements, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreatePlanForm />
    </div>
  )
}
