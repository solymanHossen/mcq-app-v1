import { listAdminAuditLog } from "@/modules/payments/queries"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { PagePagination } from "@/components/shared/page-pagination"
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input"

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
  const search = sp.q?.trim()

  const [entries, totalCount] = await listAdminAuditLog({
    page,
    pageSize: PAGE_SIZE,
    search,
  })
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            System Audit Log
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalCount}</span> total audit record{totalCount === 1 ? "" : "s"}
            {search ? ` matching "${search}"` : ""} · Immutable log of administrative operations
          </p>
        </div>

        <div className="w-full max-w-sm">
          <DebouncedSearchInput
            placeholder="Search action, actor, target or reason…"
            className="w-full"
          />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <Table>
          <TableHeader className="bg-muted/25">
            <TableRow className="border-b border-border/25 hover:bg-transparent">
              <TableHead className="py-4 pl-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Action
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Actor
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Target User
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Reason
              </TableHead>
              <TableHead className="py-4 pr-6 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                  No audit log entries recorded.
                </TableCell>
              </TableRow>
            )}
            {entries.map((entry) => (
              <TableRow
                key={entry.id}
                className="border-b border-border/15 last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="py-4 pl-6">
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs font-semibold rounded-lg px-2.5 py-0.5 shadow-2xs"
                  >
                    {entry.action}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 font-semibold text-foreground text-sm">
                  {entry.actor.name}
                </TableCell>
                <TableCell className="py-4 text-sm text-foreground">
                  {entry.targetUser?.name ?? <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="py-4 max-w-xs truncate text-xs text-muted-foreground">
                  {entry.reason ?? "—"}
                </TableCell>
                <TableCell className="py-4 pr-6 text-right text-xs text-muted-foreground font-mono">
                  {entry.createdAt.toLocaleString()}
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
