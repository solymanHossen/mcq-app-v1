import { Sparkles } from "lucide-react"
import { requireUser } from "@/lib/authorization"
import { getCurrentSubscription } from "@/modules/payments/entitlements"
import { getPaymentHistoryForUser, listActivePlans } from "@/modules/payments/queries"
import { getSystemSettings } from "@/modules/settings/queries"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { APP_NAME } from "@/lib/config"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { SubscribeButton } from "@/modules/payments/components/subscribe-button"
import { CancelSubscriptionButton } from "@/modules/payments/components/cancel-subscription-button"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100)
}

export default async function BillingPage() {
  const user = await requireUser()

  const [subscription, history, plans, { billingEnabled }] = await Promise.all([
    getCurrentSubscription(user.id),
    getPaymentHistoryForUser(user.id),
    listActivePlans(),
    getSystemSettings(),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Billing</h1>

      {!billingEnabled && (
        <Alert>
          <Sparkles />
          <AlertTitle>{APP_NAME} is currently free to use</AlertTitle>
          <AlertDescription>
            An admin has turned off billing platform-wide — every feature is available at no
            cost, and new subscriptions aren&apos;t open right now.
          </AlertDescription>
        </Alert>
      )}

      <section className="space-y-2">
        <h2 className="font-medium">Current plan</h2>
        {subscription ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {subscription.plan.name}
                <Badge variant={subscription.status === "ACTIVE" ? "secondary" : "outline"}>
                  {subscription.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                {formatPrice(subscription.plan.priceCents, subscription.plan.currency)} /{" "}
                {subscription.plan.billingInterval.toLowerCase()} · renews{" "}
                {subscription.currentPeriodEnd.toLocaleDateString()}
                {subscription.cancelAtPeriodEnd && " (canceling at period end)"}
              </CardDescription>
            </CardHeader>
            {!subscription.cancelAtPeriodEnd && (
              <CardFooter>
                <CancelSubscriptionButton subscriptionId={subscription.id} />
              </CardFooter>
            )}
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            {billingEnabled
              ? "You're on the free tier. Subscribe to a plan below for more features."
              : "You're all set — every feature is free while billing is turned off."}
          </p>
        )}
      </section>

      {billingEnabled && (
        <section className="space-y-3">
          <h2 className="font-medium">Available plans</h2>
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {formatPrice(plan.priceCents, plan.currency)} /{" "}
                  {plan.billingInterval.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <SubscribeButton planKey={plan.key} />
              </CardFooter>
            </Card>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <h2 className="font-medium">Payment history</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>{formatPrice(t.amountCents, t.currency)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
