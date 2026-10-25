import { connection } from "next/server"
import { adminListPaymentTransactions, getStalePendingTransactions } from "@/lib/payments/queries"
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
import { PagePagination } from "@/components/teacher/page-pagination"
import { RefundForm } from "@/components/admin/payment-transaction-row"
import { ReconcileTransactionForm } from "@/components/admin/reconcile-transaction-form"

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
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Payments</h1>

      {stalePending.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-medium text-destructive">
            Needs reconciliation ({stalePending.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Pending for over an hour with no webhook resolving it — check the provider
            dashboard directly and resolve manually.
          </p>
          <div className="space-y-2">
            {stalePending.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div>
                  <p>
                    {t.user.name} · {formatAmount(t.amountCents, t.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.providerTransactionId} · {t.createdAt.toLocaleString()}
                  </p>
                </div>
                <ReconcileTransactionForm transactionId={t.id} />
              </div>
            ))}
          </div>
          <Separator />
        </section>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <div>{t.user.name}</div>
                <div className="text-xs text-muted-foreground">{t.user.email}</div>
              </TableCell>
              <TableCell>{formatAmount(t.amountCents, t.currency)}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[t.status] ?? "outline"}>{t.status}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {t.createdAt.toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {t.status === "SUCCEEDED" && <RefundForm transactionId={t.id} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PagePagination page={page} pageCount={pageCount} searchParams={sp} />
    </div>
  )
}
