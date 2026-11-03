import {
  Mail,
  CheckCircle2,
  Ban,
  Calendar,
  Users,
} from "lucide-react"
import Link from "next/link"
import { requireRole, ADMIN_ROLES } from "@/lib/authorization"
import { listNewsletterSubscribers } from "@/modules/newsletter/queries"
import type { NewsletterStatus } from "@/modules/newsletter/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import { AdminPageHeader } from "@/components/shared/admin-page-header"
import { SubscriberRowActions } from "@/modules/newsletter/components/subscriber-row-actions"
import { ExportSubscribersButton } from "@/modules/newsletter/components/export-subscribers-button"
import { cn } from "@/lib/utils"

export const instant = false

const PAGE_SIZE = 20

const STATUS_FILTERS: {
  label: string
  value: NewsletterStatus | "ALL"
  icon: React.ElementType
}[] = [
    { label: "All Subscribers", value: "ALL", icon: Users },
    { label: "Active", value: "SUBSCRIBED", icon: CheckCircle2 },
    { label: "Unsubscribed", value: "UNSUBSCRIBED", icon: Ban },
  ]

export const metadata = {
  title: "Newsletter Subscribers | Admin Console",
  description: "View and manage email subscriptions from the landing page Dispatch newsletter.",
}

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  await requireRole(...ADMIN_ROLES)

  const sp = await searchParams
  const page = sp.page ? Math.max(1, Number(sp.page)) : 1
  const rawStatus = sp.status as NewsletterStatus | "ALL" | undefined
  const status: NewsletterStatus | "ALL" =
    rawStatus === "SUBSCRIBED" || rawStatus === "UNSUBSCRIBED" ? rawStatus : "ALL"
  const search = sp.q

  const { subscribers, totalCount, metrics } = await listNewsletterSubscribers({
    page,
    pageSize: PAGE_SIZE,
    status,
    search,
  })

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  function filterHref(nextStatus: NewsletterStatus | "ALL") {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (nextStatus !== "ALL") params.set("status", nextStatus)
    const qs = params.toString()
    return qs ? `?${qs}` : "?"
  }

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <AdminPageHeader
        title="Newsletter Subscribers"
        description={
          <>
            {metrics.total} total subscriber{metrics.total === 1 ? "" : "s"} ·{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {metrics.activeCount} active
            </span>{" "}
            {metrics.unsubscribedCount > 0 && `· ${metrics.unsubscribedCount} unsubscribed`}
            {search ? ` · matching "${search}"` : ""}
            {" · ExamHub Dispatch audience list"}
          </>
        }
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <DebouncedSearchInput
              placeholder="Search by email address…"
              className="w-full sm:w-72"
            />
            <ExportSubscribersButton />
          </div>
        }
      />

      {/* ================= 3-TILE SUMMARY KPI ROW ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs hover:shadow-xs transition-all">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Audience
              </p>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                {metrics.total}
              </p>
              <p className="text-xs text-muted-foreground">All captured leads & emails</p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Mail className="size-5" />
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 shadow-2xs hover:shadow-xs transition-all">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Active Subscribers
              </p>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {metrics.activeCount}
              </p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                Receiving exam notifications
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <CheckCircle2 className="size-5" />
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs hover:shadow-xs transition-all">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Unsubscribed
              </p>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-muted-foreground">
                {metrics.unsubscribedCount}
              </p>
              <p className="text-xs text-muted-foreground">Opted-out from email updates</p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground border border-border/70 shadow-2xs">
              <Ban className="size-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      {/* ================= SEGMENTED STATUS FILTER DOCK ================= */}
      <div className="w-full overflow-x-auto pb-1 scrollbar-none">
        <nav
          role="tablist"
          aria-label="Filter subscribers by status"
          className="flex w-fit min-w-fit items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-2 sm:p-2 min-h-12"
        >
          {STATUS_FILTERS.map(({ label, value, icon: Icon }) => {
            const isSelected = status === value
            const count =
              value === "ALL"
                ? metrics.total
                : value === "SUBSCRIBED"
                  ? metrics.activeCount
                  : metrics.unsubscribedCount

            return (
              <Link
                key={value}
                href={filterHref(value)}
                role="tab"
                aria-selected={isSelected}
                className={cn(
                  "group relative inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer select-none",
                  isSelected
                    ? "bg-card text-foreground shadow-xs ring-1 ring-border/80"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground active:scale-98"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isSelected
                      ? value === "SUBSCRIBED"
                        ? "text-emerald-500"
                        : "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <span>{label}</span>
                <span
                  className={cn(
                    "ml-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold leading-none transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                  )}
                >
                  {count}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ================= SUBSCRIBERS TABLE ================= */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/60">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="py-4 pl-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Subscriber Email
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                Source
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Subscribed Date
              </TableHead>
              <TableHead className="py-4 pr-6 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border/50">
            {subscribers.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border/70">
                      <Mail className="size-6" />
                    </span>
                    <p className="font-heading font-bold text-foreground text-base">
                      No subscribers found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {search
                        ? `No results matching "${search}". Try adjusting your search query.`
                        : "Subscribers will appear here when users submit the newsletter form on the landing page."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((s) => {
                const isSubscribed = s.status === "SUBSCRIBED"
                return (
                  <TableRow
                    key={s.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* 1. Email */}
                    <TableCell className="py-4.5 pl-6">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold shadow-2xs",
                            isSubscribed
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground border-border/70"
                          )}
                        >
                          <Mail className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-heading text-sm font-bold text-foreground truncate">
                            {s.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* 2. Status */}
                    <TableCell className="py-4.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-0.5 text-xs font-semibold shadow-2xs border",
                          isSubscribed
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            isSubscribed ? "bg-emerald-500" : "bg-amber-500"
                          )}
                        />
                        <span>{isSubscribed ? "Active" : "Unsubscribed"}</span>
                      </Badge>
                    </TableCell>

                    {/* 3. Source */}
                    <TableCell className="py-4.5 hidden sm:table-cell">
                      <Badge
                        variant="secondary"
                        className="rounded-lg text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-0.5"
                      >
                        {s.source || "Landing Footer"}
                      </Badge>
                    </TableCell>

                    {/* 4. Subscribed Date */}
                    <TableCell className="py-4.5 hidden md:table-cell text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="size-3.5 text-muted-foreground/80" />
                        <span>
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(s.createdAt))}
                        </span>
                      </div>
                    </TableCell>

                    {/* 5. Actions */}
                    <TableCell className="py-4.5 pr-6 text-right">
                      <SubscriberRowActions
                        subscriberId={s.id}
                        email={s.email}
                        status={s.status}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="pt-2 flex justify-center">
          <PagePagination currentPage={page} totalPages={pageCount} />
        </div>
      )}
    </div>
  )
}

