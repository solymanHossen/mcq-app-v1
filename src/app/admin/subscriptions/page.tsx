import { listAllSubscriptionPlans } from "@/modules/payments/queries"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CreatePlanForm } from "@/modules/payments/components/create-plan-form"
import { PlanActiveToggle } from "@/modules/payments/components/plan-active-toggle"

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
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Subscription plans</h1>

      <div className="space-y-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  <Badge variant={plan.isActive ? "secondary" : "outline"}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {formatPrice(plan.priceCents, plan.currency)} / {plan.billingInterval.toLowerCase()} ·
                  key: <code>{plan.key}</code>
                </CardDescription>
                <pre className="mt-2 rounded bg-muted p-2 text-xs">
                  {JSON.stringify(plan.entitlements, null, 2)}
                </pre>
              </div>
              <PlanActiveToggle planId={plan.id} isActive={plan.isActive} />
            </CardHeader>
          </Card>
        ))}
      </div>

      <CreatePlanForm />
    </div>
  )
}
