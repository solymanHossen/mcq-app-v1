import { connection } from "next/server"
import { adminListPaymentTransactions, getStalePendingTransactions } from "@/modules/payments/queries"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const PAGE_SIZE = 20

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100)
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUCCEEDED: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  REFUNDED: "outline",
  PARTIALLY_REFUNDED: "outline",
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  // getStalePendingTransactions computes `now` internally — see the same
  // note on app/(admin)/admin/page.tsx.
  await connection()

  const sp = await searchParams
  const page = sp.page ? Math.max(1, Number(sp.page)) : 1

  const [[transactions, totalCount], stalePending] = await Promise.all([
    adminListPaymentTransactions({ page, pageSize: PAGE_SIZE }),
    getStalePendingTransactions(),
  ])
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Payment Transactions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live payment telemetry, transaction audit status, and payment reconciliation.
        </p>
      </div>

      {stalePending.length > 0 && (
        <section className="space-y-3 rounded-2xl sm:rounded-3xl bg-destructive/5 p-6 shadow-xs">
          <div>
            <h2 className="font-heading text-base font-bold text-destructive">
              Needs Reconciliation ({stalePending.length})
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Transactions pending for over an hour without webhook confirmation — check provider logs and reconcile manually.
            </p>
          </div>
          <div className="space-y-2.5">
            {stalePending.map((t) => (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-card p-4 text-sm shadow-xs"
              >
                <div>
                  <p className="font-bold text-foreground">
                    {t.user.name} · <span className="text-primary font-mono">{formatAmount(t.amountCents, t.currency)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    ID: <code className="font-mono">{t.providerTransactionId}</code> · {t.createdAt.toLocaleString()}
                  </p>
                </div>
                <ReconcileTransactionForm transactionId={t.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <Table>
          <TableHeader className="bg-muted/25">
            <TableRow className="border-b border-border/25 hover:bg-transparent">
              <TableHead className="py-4 pl-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                User
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="py-4 pr-6 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                  No payment transactions recorded yet.
                </TableCell>
              </TableRow>
            )}
            {transactions.map((t) => (
              <TableRow
                key={t.id}
                className="border-b border-border/15 last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="py-4 pl-6">
                  <div className="font-semibold text-foreground">{t.user.name}</div>
                  <div className="text-xs text-muted-foreground">{t.user.email}</div>
                </TableCell>
                <TableCell className="py-4 font-bold font-mono text-foreground text-sm">
                  {formatAmount(t.amountCents, t.currency)}
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant={statusVariant[t.status] ?? "secondary"}
                    className="rounded-lg px-2.5 py-0.5 text-xs font-semibold shadow-2xs"
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-xs text-muted-foreground">
                  {t.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell className="py-4 pr-6 text-right">
                  {t.status === "SUCCEEDED" && <RefundForm transactionId={t.id} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PagePagination page={page} pageCount={pageCount} searchParams={sp} />
    </div>
  )
}
