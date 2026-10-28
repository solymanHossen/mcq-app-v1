import Link from "next/link"
import { connection } from "next/server"
import {
  Search,
  DollarSign,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Receipt,
  User,
  ShieldAlert,
  Layers,
  Building2,
} from "lucide-react"
import {
  adminListPaymentTransactions,
  getPaymentOverviewMetrics,
  getStalePendingTransactions,
} from "@/modules/payments/queries"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { PagePagination } from "@/components/shared/page-pagination"
import { RefundForm } from "@/modules/payments/components/payment-transaction-row"
import { ReconcileTransactionForm } from "@/modules/payments/components/reconcile-transaction-form"
import { cn } from "@/lib/utils"
import type { PaymentTransactionStatus } from "@/prisma/generated/prisma/client"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export const metadata = {
  title: "Payment Transactions",
  description: "Live payment telemetry, transaction audit status, and payment reconciliation.",
}

const PAGE_SIZE = 20

function formatAmount(cents: number, currency: string = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

const STATUS_FILTERS: {
  label: string
  value: PaymentTransactionStatus | undefined
  icon: React.ElementType
}[] = [
  { label: "All Transactions", value: undefined, icon: Receipt },
  { label: "Succeeded", value: "SUCCEEDED", icon: CheckCircle2 },
  { label: "Pending", value: "PENDING", icon: Clock },
  { label: "Failed", value: "FAILED", icon: AlertTriangle },
  { label: "Refunded", value: "REFUNDED", icon: RotateCcw },
]

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  await connection()

  const sp = await searchParams
  const page = sp.page ? Math.max(1, Number(sp.page)) : 1
  const status = sp.status as PaymentTransactionStatus | undefined
  const search = sp.q?.trim()

  const [
    [transactions, totalCount],
    metrics,
    stalePending,
  ] = await Promise.all([
    adminListPaymentTransactions({ page, pageSize: PAGE_SIZE, status, search }),
    getPaymentOverviewMetrics(),
    getStalePendingTransactions(),
  ])

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  function filterHref(nextStatus: PaymentTransactionStatus | undefined) {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (nextStatus) params.set("status", nextStatus)
    const qs = params.toString()
    return qs ? `?${qs}` : "/admin/payments"
  }

  const settlementRate =
    metrics.totalTransactions > 0
      ? Math.round((metrics.succeededCount / metrics.totalTransactions) * 100)
      : 100

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      {/* ================= PAGE HEADER & GLOBAL SEARCH BAR ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Payment Transactions
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{metrics.totalTransactions}</span> total transaction{metrics.totalTransactions === 1 ? "" : "s"} ·{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatAmount(metrics.totalVolumeCents, "usd")}
            </span>{" "}
            settled volume ·{" "}
            <span className="font-semibold text-foreground">{metrics.succeededCount}</span> successful
            {status ? ` · filtered by ${status.toLowerCase()}` : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        </div>

        {/* Global Search Bar aligned with Users Page pattern */}
        <form action="/admin/payments" className="relative w-full max-w-sm">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={search ?? ""}
            placeholder="Search by customer, email, or tx ID…"
            className="h-11 w-full rounded-2xl border border-border/70 bg-card pl-10 pr-4 text-xs sm:text-sm shadow-xs focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all"
          />
        </form>
      </div>

      {/* ================= 4-TILE SUMMARY METRICS STRIP ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
        {/* Metric 1: Gross Settled Revenue */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Gross Volume
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <DollarSign className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatAmount(metrics.totalVolumeCents, "usd")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Lifetime successful checkouts
            </p>
          </div>
        </div>

        {/* Metric 2: Settled Transactions & Settlement Rate */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Settled Checkouts
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-2xs">
              <CheckCircle2 className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {metrics.succeededCount}{" "}
              <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                ({settlementRate}% rate)
              </span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Completed student & teacher payments
            </p>
          </div>
        </div>

        {/* Metric 3: Pending & In-Flight */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pending & In-Flight
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
              <Clock className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {metrics.pendingCount}{" "}
              {stalePending.length > 0 && (
                <span className="text-xs font-bold text-destructive">
                  ({stalePending.length} stale)
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {stalePending.length > 0
                ? "Transactions requiring reconciliation"
                : "Awaiting gateway webhook confirm"}
            </p>
          </div>
        </div>

        {/* Metric 4: Total Refunded */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Refunds & Reversals
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-2xs">
              <RotateCcw className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400 tabular-nums">
              {formatAmount(metrics.totalRefundedCents, "usd")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {metrics.refundedCount} refund event{metrics.refundedCount === 1 ? "" : "s"} executed
            </p>
          </div>
        </div>
      </div>

      {/* ================= HIGH-PRIORITY RECONCILIATION QUEUE ================= */}
      {stalePending.length > 0 && (
        <section className="space-y-4 rounded-2xl sm:rounded-3xl border border-destructive/25 bg-destructive/5 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive border border-destructive/30">
              <ShieldAlert className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-base font-bold text-destructive">
                Pending Gateway Reconciliation ({stalePending.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                These transactions have remained PENDING for over 60 minutes without webhook resolution. Check your payment provider dashboard and resolve manually.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {stalePending.map((t) => (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 rounded-xl border border-border/70 bg-card p-4 text-sm shadow-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground">
                    {t.user.name}{" "}
                    <span className="text-xs text-muted-foreground font-normal">({t.user.email})</span> ·{" "}
                    <span className="text-primary font-mono font-bold">
                      {formatAmount(t.amountCents, t.currency)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Provider ID: {t.providerTransactionId} · Initiated {t.createdAt.toLocaleString()}
                  </p>
                </div>
                <div className="shrink-0">
                  <ReconcileTransactionForm transactionId={t.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= MODERN SEGMENTED STATUS FILTER DOCK ================= */}
      <div className="w-full overflow-x-auto pb-1 scrollbar-none">
        <nav
          role="tablist"
          aria-label="Filter transactions by payment status"
          className="flex w-fit min-w-fit items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-2 sm:p-2 min-h-12 sm:min-h-14"
        >
          {STATUS_FILTERS.map(({ label, value, icon: Icon }) => {
            const isSelected = status === value
            return (
              <Link
                key={label}
                href={filterHref(value)}
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

      {/* ================= WORLD-CLASS TRANSACTIONS DATA TABLE ================= */}
      <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/35 border-b border-border/70">
            <TableRow className="border-b border-border/70 hover:bg-transparent">
              <TableHead className="py-4 pl-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Customer & Account
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Transaction ID & Tier
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Created At
              </TableHead>
              <TableHead className="py-4 pr-6 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border/70">
                      <Receipt className="size-6" />
                    </span>
                    <p className="font-heading font-bold text-foreground text-base">
                      No matching payment transactions found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try selecting another status tab or adjusting your search query.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((t) => {
                const isSucceeded = t.status === "SUCCEEDED"
                const isPending = t.status === "PENDING"
                const isRefunded =
                  t.status === "REFUNDED" || t.status === "PARTIALLY_REFUNDED"
                const isFailed = t.status === "FAILED"

                return (
                  <TableRow
                    key={t.id}
                    className="border-b border-border/70 dark:border-border/40 last:border-b-0 hover:bg-muted/35 dark:hover:bg-muted/20 transition-colors duration-150"
                  >
                    {/* Column 1: Customer & Account */}
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 rounded-xl border border-border/60 shrink-0">
                          <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xs">
                            {getInitials(t.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate text-sm">
                            {t.user.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {t.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 2: Transaction ID & Tier */}
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="rounded-md px-1.5 py-0 text-[10.5px] font-mono uppercase bg-muted/50 border-border/70 text-muted-foreground"
                          >
                            {t.provider}
                          </Badge>
                          <span
                            title={t.providerTransactionId}
                            className="font-mono text-xs text-foreground/80 font-medium truncate max-w-[140px] sm:max-w-[200px]"
                          >
                            {t.providerTransactionId}
                          </span>
                        </div>
                        {t.subscription?.plan?.name && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Layers className="size-3" />
                            <span>{t.subscription.plan.name}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Column 3: Amount */}
                    <TableCell className="py-4 font-bold font-mono text-foreground text-sm tabular-nums">
                      <div>
                        {formatAmount(t.amountCents, t.currency)}
                        {t.refundedAmountCents && t.refundedAmountCents > 0 && (
                          <div className="text-[11px] font-normal text-rose-600 dark:text-rose-400">
                            - {formatAmount(t.refundedAmountCents, t.currency)} ref.
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Column 4: Status */}
                    <TableCell className="py-4">
                      {isSucceeded && (
                        <Badge
                          variant="outline"
                          className="gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                        >
                          <CheckCircle2 className="size-3" />
                          <span>Succeeded</span>
                        </Badge>
                      )}
                      {isPending && (
                        <Badge
                          variant="outline"
                          className="gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-2xs"
                        >
                          <Clock className="size-3" />
                          <span>Pending</span>
                        </Badge>
                      )}
                      {isFailed && (
                        <Badge
                          variant="outline"
                          className="gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold border-destructive/25 bg-destructive/10 text-destructive shadow-2xs"
                        >
                          <AlertTriangle className="size-3" />
                          <span>Failed</span>
                        </Badge>
                      )}
                      {isRefunded && (
                        <Badge
                          variant="outline"
                          className="gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold border-purple-500/25 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-2xs"
                        >
                          <RotateCcw className="size-3" />
                          <span>{t.status === "PARTIALLY_REFUNDED" ? "Partial Refund" : "Refunded"}</span>
                        </Badge>
                      )}
                    </TableCell>

                    {/* Column 5: Created At */}
                    <TableCell className="py-4 text-xs text-muted-foreground hidden md:table-cell">
                      <div className="space-y-0.5">
                        <div className="font-medium text-foreground">
                          {t.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {t.createdAt.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 6: Actions */}
                    <TableCell className="py-4 pr-6 text-right">
                      {isSucceeded && (
                        <RefundForm
                          transactionId={t.id}
                          customerName={t.user.name}
                          formattedAmount={formatAmount(t.amountCents, t.currency)}
                        />
                      )}
                      {isPending && (
                        <div className="flex justify-end">
                          <ReconcileTransactionForm transactionId={t.id} />
                        </div>
                      )}
                      {!isSucceeded && !isPending && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {t.refundReason ? `Reason: ${t.refundReason.slice(0, 20)}…` : "Settled"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ================= PAGE PAGINATION ================= */}
      <PagePagination page={page} pageCount={pageCount} searchParams={sp} />
    </div>
  )
}
