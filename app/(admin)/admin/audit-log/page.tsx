import { listAdminAuditLog } from "@/lib/payments/queries"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { PagePagination } from "@/components/teacher/page-pagination"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const PAGE_SIZE = 30

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = sp.page ? Math.max(1, Number(sp.page)) : 1

  const [entries, totalCount] = await listAdminAuditLog({ page, pageSize: PAGE_SIZE })
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-semibold">Admin audit log</h1>
      <p className="text-sm text-muted-foreground">
        Every sensitive admin action — account suspension, teacher verification, refunds,
        plan and coupon changes — append-only, never edited or deleted.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <Badge variant="outline">{entry.action}</Badge>
              </TableCell>
              <TableCell>{entry.actor.name}</TableCell>
              <TableCell>{entry.targetUser?.name ?? "—"}</TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                {entry.reason ?? "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {entry.createdAt.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PagePagination page={page} pageCount={pageCount} searchParams={sp} />
    </div>
  )
}
