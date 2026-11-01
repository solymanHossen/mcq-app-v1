import { redirect } from "next/navigation"
import {
  CreditCard,
  Gift,
  CheckCircle2,
  Sparkles,
  Calendar,
  Receipt,
} from "lucide-react"
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
import { cn } from "@/lib/utils"
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
  if (user.role === "TEACHER") redirect("/teacher/billing")
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") redirect("/admin/subscriptions")

  const [subscription, history, plans, { billingEnabled }] = await Promise.all([
    getCurrentSubscription(user.id),
    getPaymentHistoryForUser(user.id),
    listActivePlans(),
    getSystemSettings(),
  ])

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-5 sm:pb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Badge
            variant="outline"
            className="h-6 gap-1.5 rounded-full border-primary/20 bg-primary/5 px-2.5 text-[11px] font-semibold text-primary"
          >
            <CreditCard className="size-3" />
            Billing & Subscriptions
          </Badge>
          <Badge
            variant="outline"
            className="h-6 rounded-full border-border/60 bg-muted/20 px-2.5 text-[11px] font-medium text-muted-foreground"
          >
            Student Account
          </Badge>
        </div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Billing & Plans
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Manage your active membership, explore available plans, and view transaction history.
        </p>
      </div>

      {!billingEnabled && (
        <Alert className="rounded-2xl border-border/70 bg-card p-4 shadow-xs sm:p-5">
          <Gift className="size-4 text-primary" />
          <AlertTitle className="text-sm font-bold sm:text-base">
            {APP_NAME} is currently free to use
          </AlertTitle>
          <AlertDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            An admin has turned off billing platform-wide — every feature is
            available at no cost, and new subscriptions aren&apos;t open right
            now.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Card */}
      <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs transition-all hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20 sm:size-11 sm:rounded-2xl">
              <CreditCard className="size-4 sm:size-5" />
            </span>
            <div>
              <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                Current Plan
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Your current active subscription status
              </CardDescription>
            </div>
          </div>
          {subscription && (
            <Badge
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-xs",
                subscription.status === "ACTIVE"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border/60 bg-muted/20 text-muted-foreground"
              )}
            >
              {subscription.status}
            </Badge>
          )}
        </CardHeader>
        {subscription ? (
          <>
            <CardContent className="flex min-w-0 flex-col gap-4 p-4 sm:p-6 lg:p-7">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                <div>
                  <h3 className="text-lg font-bold tracking-tight wrap-anywhere text-foreground sm:text-2xl">
                    {subscription.plan.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {formatPrice(
                      subscription.plan.priceCents,
                      subscription.plan.currency
                    )}{" "}
                    / {subscription.plan.billingInterval.toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5 text-primary" />
                  <span>
                    Renews on{" "}
                    <strong className="text-foreground">
                      {subscription.currentPeriodEnd.toLocaleDateString()}
                    </strong>
                  </span>
                  {subscription.cancelAtPeriodEnd && (
                    <span className="ml-1 font-medium text-destructive">
                      (cancels at period end)
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
            {!subscription.cancelAtPeriodEnd && (
              <CardFooter className="flex-wrap gap-3 border-t border-border/50 bg-muted/10 p-4 sm:px-6 lg:px-7">
                <CancelSubscriptionButton subscriptionId={subscription.id} />
              </CardFooter>
            )}
          </>
        ) : (
          <CardContent className="p-4 sm:p-6 lg:p-7">
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/15 p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {billingEnabled
                  ? "You are currently on the free student tier. Upgrade to any plan below to unlock premium exams and unlimited practice sessions."
                  : "You're all set — every platform feature is free while billing is turned off."}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Available Plans Section */}
      {billingEnabled && (
        <section
          className="flex min-w-0 flex-col gap-4 sm:gap-6"
          aria-labelledby="available-plans-title"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2
              id="available-plans-title"
              className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl"
            >
              Available Plans
            </h2>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="flex min-w-0 flex-col justify-between gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs transition-all hover:shadow-sm"
              >
                <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="font-heading text-base font-bold tracking-tight wrap-anywhere text-foreground sm:text-xl">
                      {plan.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="rounded-full border-primary/20 bg-primary/5 text-[11px] font-semibold text-primary"
                    >
                      {plan.billingInterval}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                      {formatPrice(plan.priceCents, plan.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {plan.billingInterval.toLowerCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto p-4 sm:p-6 lg:p-7">
                  <SubscribeButton planKey={plan.key} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Payment History Card */}
      <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs transition-all hover:shadow-sm">
        <CardHeader className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground ring-1 ring-border/50 sm:size-11 sm:rounded-2xl">
              <Receipt className="size-4 sm:size-5" />
            </span>
            <div>
              <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-xl">
                Payment History
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Your past transactions and receipt records
              </CardDescription>
            </div>
          </div>
          {history.length > 0 && (
            <Badge
              variant="outline"
              className="rounded-full border-border/60 bg-muted/20 text-[11px] font-semibold text-muted-foreground"
            >
              {history.length} {history.length === 1 ? "receipt" : "receipts"}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="min-w-0 p-4 sm:p-6 lg:p-7">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Receipt className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                No payment transactions recorded yet.
              </p>
            </div>
          ) : (
            <div className="min-w-0 overflow-hidden rounded-xl border border-border/70">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Date
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Amount
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((t) => (
                    <TableRow
                      key={t.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="text-xs font-medium sm:text-sm">
                        {t.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground sm:text-sm">
                        {formatPrice(t.amountCents, t.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full text-[11px] font-semibold",
                            t.status === "SUCCEEDED"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-border/60 bg-muted/20 text-muted-foreground"
                          )}
                        >
                          {t.status}
                        </Badge>
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
