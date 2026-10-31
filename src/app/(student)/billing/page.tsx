import { redirect } from "next/navigation"
import { Gift } from "lucide-react"
import { requireUser } from "@/lib/authorization"
import { getCurrentSubscription } from "@/modules/payments/entitlements"
import {
  getPaymentHistoryForUser,
  listActivePlans,
} from "@/modules/payments/queries"
import { getSystemSettings } from "@/modules/settings/queries"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { APP_NAME } from "@/lib/config"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
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
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100
  )
}

export default async function BillingPage() {
  const user = await requireUser()
  if (user.isGuest) redirect("/exams")

  const [subscription, history, plans, { billingEnabled }] = await Promise.all([
    getCurrentSubscription(user.id),
    getPaymentHistoryForUser(user.id),
    listActivePlans(),
    getSystemSettings(),
  ])

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      <h1 className="border-b border-border/60 pb-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:pb-4 sm:text-3xl lg:text-4xl">
        Billing
      </h1>

      {!billingEnabled && (
        <Alert className="rounded-2xl border-border/70 bg-card p-4 shadow-xs sm:p-6">
          <Gift className="size-4" />
          <AlertTitle>{APP_NAME} is currently free to use</AlertTitle>
          <AlertDescription>
            An admin has turned off billing platform-wide — every feature is
            available at no cost, and new subscriptions aren&apos;t open right
            now.
          </AlertDescription>
        </Alert>
      )}

      <Card className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
        <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
          <CardTitle>
            <h2 className="text-base font-bold tracking-tight sm:text-xl">
              Current plan
            </h2>
          </CardTitle>
        </CardHeader>
        {subscription ? (
          <>
            <CardContent className="flex min-w-0 flex-col gap-2 p-4 sm:p-6 lg:p-7">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="text-base font-bold tracking-tight wrap-anywhere sm:text-xl">
                  {subscription.plan.name}
                </h3>
                <Badge
                  className="rounded-full border border-border/60 px-2.5 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-xs"
                  variant={
                    subscription.status === "ACTIVE" ? "secondary" : "outline"
                  }
                >
                  {subscription.status}
                </Badge>
              </div>
              <CardDescription className="text-xs leading-relaxed sm:text-sm">
                {formatPrice(
                  subscription.plan.priceCents,
                  subscription.plan.currency
                )}{" "}
                / {subscription.plan.billingInterval.toLowerCase()} · renews{" "}
                {subscription.currentPeriodEnd.toLocaleDateString()}
                {subscription.cancelAtPeriodEnd && " (canceling at period end)"}
              </CardDescription>
            </CardContent>
            {!subscription.cancelAtPeriodEnd && (
              <CardFooter className="flex-wrap gap-3 rounded-b-2xl border-border/50 bg-muted/20 p-4 sm:px-6 lg:px-7">
                <CancelSubscriptionButton subscriptionId={subscription.id} />
              </CardFooter>
            )}
          </>
        ) : (
          <CardContent className="p-4 sm:p-6 lg:p-7">
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {billingEnabled
                ? "You're on the free tier. Subscribe to a plan below for more features."
                : "You're all set — every feature is free while billing is turned off."}
            </p>
          </CardContent>
        )}
      </Card>

      {billingEnabled && (
        <section
          className="flex min-w-0 flex-col gap-4 sm:gap-6"
          aria-labelledby="available-plans-title"
        >
          <h2
            id="available-plans-title"
            className="font-heading text-base font-bold tracking-tight sm:text-xl"
          >
            Available plans
          </h2>
          <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs"
              >
                <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
                  <CardTitle>
                    <h3 className="text-base font-bold tracking-tight wrap-anywhere sm:text-xl">
                      {plan.name}
                    </h3>
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed sm:text-sm">
                    {formatPrice(plan.priceCents, plan.currency)} /{" "}
                    {plan.billingInterval.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto p-4 sm:p-6 lg:p-7">
                  <SubscribeButton planKey={plan.key} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Card className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
        <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
          <CardTitle>
            <h2 className="text-base font-bold tracking-tight sm:text-xl">
              Payment history
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 p-4 sm:p-6 lg:p-7">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
              No payments yet.
            </p>
          ) : (
            <div className="min-w-0 overflow-hidden rounded-xl border border-border/70">
              <Table>
                <TableHeader className="bg-muted/20">
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
                      <TableCell>
                        {formatPrice(t.amountCents, t.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
