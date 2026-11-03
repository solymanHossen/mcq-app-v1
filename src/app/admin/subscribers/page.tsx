import {
  Mail,
  CheckCircle2,
  Ban,
  Calendar,
  Users,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { requireRole, ADMIN_ROLES } from "@/lib/authorization"
import { listNewsletterSubscribers } from "@/modules/newsletter/queries"
import type { NewsletterStatus } from "@/modules/newsletter/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { PagePagination } from "@/components/shared/page-pagination"
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input"
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
  const search = sp.q?.trim()

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
    return qs ? `?${qs}` : "/admin/subscribers"
  }

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      {/* ================= 1. TOP HEADER & BREADCRUMB (MASTER /teacher/exams/new) ================= */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-1.5 sm:gap-2 cursor-pointer"
          >
            <Link href="/admin">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to dashboard</span>
            </Link>
          </Button>

          <ExportSubscribersButton />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Newsletter Subscribers
              </h1>
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
              >
                <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Audience</span>
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
              >
                {metrics.total} Contacts
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              <span className="font-semibold text-foreground">{metrics.total}</span> total subscriber{metrics.total === 1 ? "" : "s"} ·{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{metrics.activeCount} active</span>
              {metrics.unsubscribedCount > 0 ? ` · ${metrics.unsubscribedCount} unsubscribed` : ""}
              {search ? ` · matching "${search}"` : ""} · Verified email directory from ExamHub Dispatch
            </p>
          </div>
        </div>
      </div>

      {/* ================= 2. THREE-TILE GRAND KPI SUMMARY (MASTER /teacher/exams/new) ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {/* KPI 1: Total Audience */}
        <Card className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all overflow-hidden relative group">
          <div className="flex items-center justify-between gap-2">
            <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform duration-200 group-hover:scale-105">
              <Mail className="size-4.5 sm:size-5" />
            </span>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold border-border/70 bg-muted/40 text-muted-foreground"
            >
              All Channels
            </Badge>
          </div>
          <div className="flex flex-col gap-1 pt-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Audience
            </p>
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {metrics.total}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Registered email leads &amp; subscribers
            </p>
          </div>
        </Card>

        {/* KPI 2: Active Subscribers */}
        <Card className="rounded-2xl border border-emerald-500/25 bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all overflow-hidden relative group">
          <div className="flex items-center justify-between gap-2">
            <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs transition-transform duration-200 group-hover:scale-105">
              <CheckCircle2 className="size-4.5 sm:size-5" />
            </span>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            >
              {metrics.total > 0 ? Math.round((metrics.activeCount / metrics.total) * 100) : 100}% Active
            </Badge>
          </div>
          <div className="flex flex-col gap-1 pt-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Active Subscribers
            </p>
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {metrics.activeCount}
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium">
              Receiving exam notifications &amp; bulletins
            </p>
          </div>
        </Card>

        {/* KPI 3: Unsubscribed */}
        <Card className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all overflow-hidden relative group">
          <div className="flex items-center justify-between gap-2">
            <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-muted/60 text-muted-foreground border border-border/70 shadow-2xs transition-transform duration-200 group-hover:scale-105">
              <Ban className="size-4.5 sm:size-5" />
            </span>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold border-border/70 bg-muted/40 text-muted-foreground"
            >
              Opted Out
            </Badge>
          </div>
          <div className="flex flex-col gap-1 pt-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Unsubscribed
            </p>
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-muted-foreground tabular-nums">
              {metrics.unsubscribedCount}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Users who unsubscribed from updates
            </p>
          </div>
        </Card>
      </div>

      {/* ================= 3. FILTER DOCK & DEBOUNCED SEARCH (MASTER /teacher/exams) ================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-auto overflow-x-auto pb-1 scrollbar-none">
          <nav
            role="tablist"
            aria-label="Filter subscribers by status"
            className="flex w-fit min-w-fit items-center gap-1 rounded-2xl bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-1.5 border border-border/40"
          >
            {STATUS_FILTERS.map((tab) => {
              const isActive = status === tab.value
              const count =
                tab.value === "ALL"
                  ? metrics.total
                  : tab.value === "SUBSCRIBED"
                  ? metrics.activeCount
                  : metrics.unsubscribedCount
              const Icon = tab.icon

              return (
                <Link
                  key={tab.label}
                  href={filterHref(tab.value)}
                  className={cn(
                    "flex shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 select-none cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tabular-nums transition-colors",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted-foreground/15 text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="w-full sm:max-w-xs">
          <DebouncedSearchInput
            placeholder="Search by email address…"
            className="w-full"
          />
        </div>
      </div>

      {/* ================= 4. MAIN CARD & TABLE (MASTER /teacher/exams/new) ================= */}
      <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
        {/* Card Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
              <Mail className="size-4.5 sm:size-5.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                  Subscriber Directory
                </h2>
                <Badge
                  variant="outline"
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold border-border/70 hidden sm:inline-flex"
                >
                  Audience List
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                All verified email addresses captured from the ExamHub Dispatch newsletter
              </p>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="text-xs font-semibold px-2.5 py-1 border border-border/60 shrink-0"
          >
            {totalCount} Total
          </Badge>
        </div>

        {/* Table Content */}
        {subscribers.length === 0 ? (
          <div className="p-8 sm:p-14 text-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Mail className="size-8 text-primary" />
                </EmptyMedia>
                <EmptyTitle className="font-heading text-xl font-bold">
                  No subscribers found
                </EmptyTitle>
                <EmptyDescription className="text-sm text-muted-foreground sm:text-base max-w-sm mx-auto leading-relaxed">
                  {search
                    ? `No subscriber matching "${search}". Try adjusting your search query or switching filters.`
                    : "Subscribers will appear here as soon as visitors subscribe to ExamHub Dispatch on the landing page."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 border-b border-border/60">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="py-3.5 pl-4 sm:pl-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Subscriber Email
                  </TableHead>
                  <TableHead className="py-3.5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="py-3.5 font-bold text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                    Source
                  </TableHead>
                  <TableHead className="py-3.5 font-bold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Subscribed Date
                  </TableHead>
                  <TableHead className="py-3.5 pr-4 sm:pr-6 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/50">
                {subscribers.map((s) => {
                  const isSubscribed = s.status === "SUBSCRIBED"
                  return (
                    <TableRow
                      key={s.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* 1. Email */}
                      <TableCell className="py-4 pl-4 sm:pl-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-9.5 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold shadow-2xs",
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
                      <TableCell className="py-4">
                        {isSubscribed ? (
                          <Badge
                            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20"
                          >
                            <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                            <span>Active</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase inline-flex items-center gap-1.5 text-muted-foreground border-border/70 bg-muted/40"
                          >
                            <span className="size-1.5 rounded-full bg-muted-foreground" />
                            <span>Unsubscribed</span>
                          </Badge>
                        )}
                      </TableCell>

                      {/* 3. Source */}
                      <TableCell className="py-4 hidden sm:table-cell">
                        <Badge
                          variant="secondary"
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border border-border/50"
                        >
                          {s.source || "Landing Footer"}
                        </Badge>
                      </TableCell>

                      {/* 4. Subscribed Date */}
                      <TableCell className="py-4 hidden md:table-cell text-xs text-muted-foreground">
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
                      <TableCell className="py-4 pr-4 sm:pr-6 text-right">
                        <SubscriberRowActions
                          subscriberId={s.id}
                          email={s.email}
                          status={s.status}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* ================= 5. PAGINATION ================= */}
      {pageCount > 1 && (
        <div className="pt-2 flex justify-center">
          <PagePagination page={page} pageCount={pageCount} searchParams={sp} />
        </div>
      )}
    </div>
  )
}
