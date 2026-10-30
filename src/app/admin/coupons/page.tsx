import Link from "next/link"
import {
  Ticket,
  CheckCircle2,
  Ban,
  Users,
  Percent,
  Calendar,
  Search,
  Tag,
  Clock,
  TrendingUp,
} from "lucide-react"
import { listAllCoupons } from "@/modules/payments/queries"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { CreateCouponDialog } from "@/modules/payments/components/create-coupon-dialog"
import { DeactivateCouponButton } from "@/modules/payments/components/deactivate-coupon-button"
import { CopyCouponButton } from "@/modules/payments/components/copy-coupon-button"
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input"
import { cn } from "@/lib/utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const FILTER_TABS = [
  { label: "All Coupons", value: "all", icon: Ticket },
  { label: "Active Vouchers", value: "active", icon: CheckCircle2 },
  { label: "Inactive / Deprecated", value: "inactive", icon: Ban },
]

function getExpiryStatus(expiresAt: Date | null) {
  if (!expiresAt) return { label: "No expiration date", isExpired: false, isSoon: false }
  const now = new Date()
  const exp = new Date(expiresAt)
  const isExpired = exp < now
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isSoon = !isExpired && diffDays <= 7

  const formatted = exp.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  if (isExpired) {
    return { label: `Expired on ${formatted}`, isExpired: true, isSoon: false }
  }
  if (isSoon) {
    return { label: `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`, isExpired: false, isSoon: true }
  }
  return { label: `Valid until ${formatted}`, isExpired: false, isSoon: false }
}

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string; q?: string }>
}) {
  const sp = (await searchParams) ?? {}
  const activeTab = sp.filter ?? "all"
  const search = sp.q?.trim()

  const allCoupons = await listAllCoupons()

  const activeCount = allCoupons.filter((c) => c.isActive).length
  const totalRedemptions = allCoupons.reduce((sum, c) => sum + c.timesRedeemed, 0)
  const maxPercent = allCoupons
    .filter((c) => c.discountType === "PERCENT")
    .reduce((max, c) => Math.max(max, c.discountValue), 0)

  const filteredCoupons = allCoupons.filter((c) => {
    if (activeTab === "active" && !c.isActive) return false
    if (activeTab === "inactive" && c.isActive) return false
    if (search && !c.code.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function filterHref(nextTab: string) {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (nextTab !== "all") params.set("filter", nextTab)
    const qs = params.toString()
    return qs ? `?${qs}` : "/admin/coupons"
  }

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      {/* ================= PAGE HEADER & NEW COUPON BUTTON ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Discount Coupons
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{activeCount}</span> of {allCoupons.length} active vouchers ·{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {totalRedemptions}
            </span>{" "}
            total claims applied ·{" "}
            <span className="font-semibold text-foreground">{maxPercent > 0 ? `Up to ${maxPercent}% off` : "Custom rates"}</span>
          </p>
        </div>

        {/* Aligned Create Coupon Modal Trigger */}
        <CreateCouponDialog />
      </div>

      {/* ================= 3-TILE SUMMARY METRICS STRIP ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {/* Metric 1: Active Coupons */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Vouchers
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <Ticket className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {activeCount} <span className="text-sm font-medium text-muted-foreground">/ {allCoupons.length}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Published promotional discount codes
            </p>
          </div>
        </div>

        {/* Metric 2: Total Redemptions */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Redemptions
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-2xs">
              <Users className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">
              {totalRedemptions}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Candidate checkouts with savings
            </p>
          </div>
        </div>

        {/* Metric 3: Top Savings Rate */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Peak Incentive
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-2xs">
              <TrendingUp className="size-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {maxPercent > 0 ? `${maxPercent}%` : "Fixed ¢"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Highest promotional deduction tier
            </p>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & SEGMENTED FILTER DOCK ================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-auto overflow-x-auto pb-1 scrollbar-none">
          <nav
            role="tablist"
            aria-label="Filter coupons"
            className="flex w-fit min-w-fit items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-2 sm:p-2 min-h-12 sm:min-h-14"
          >
            {FILTER_TABS.map(({ label, value, icon: Icon }) => {
              const isSelected = activeTab === value
              return (
                <Link
                  key={value}
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

        <div className="w-full max-w-sm">
          <DebouncedSearchInput
            placeholder="Search coupon code…"
            className="w-full"
          />
        </div>
      </div>

      {/* ================= WORLD-CLASS COUPONS DATA TABLE CARD ================= */}
      <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/60">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="py-4 pl-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Coupon Code
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Discount Benefit
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Redemption Usage
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Validity Window
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="py-4 pr-6 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoupons.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground/80 mb-1">
                      <Ticket className="size-6" />
                    </span>
                    <p className="font-heading text-base font-bold text-foreground">
                      No discount coupons found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {search
                        ? `No coupons match "${search}". Try clearing your search query.`
                        : "Issue promotional discount vouchers using the Create Coupon button above."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCoupons.map((c) => {
                const expiry = getExpiryStatus(c.expiresAt)
                const isCapped = typeof c.maxRedemptions === "number" && c.maxRedemptions > 0
                const percentUsed = isCapped
                  ? Math.min(100, Math.round((c.timesRedeemed / (c.maxRedemptions || 1)) * 100))
                  : null

                return (
                  <TableRow
                    key={c.id}
                    className="border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    {/* Code with Copy Button */}
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <Tag className="size-3.5" />
                        </div>
                        <CopyCouponButton code={c.code} />
                      </div>
                    </TableCell>

                    {/* Discount Value */}
                    <TableCell className="py-4">
                      {c.discountType === "PERCENT" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                          <Percent className="size-3" />
                          <span>{c.discountValue}% OFF</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-500/25">
                          <span>${(c.discountValue / 100).toFixed(2)} OFF</span>
                        </span>
                      )}
                    </TableCell>

                    {/* Redemption Progress */}
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1 min-w-[130px] max-w-[170px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground tabular-nums">
                            {c.timesRedeemed} claims
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {isCapped ? `/ ${c.maxRedemptions}` : "Unlimited"}
                          </span>
                        </div>
                        {isCapped && (
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                (percentUsed ?? 0) >= 100
                                  ? "bg-rose-500"
                                  : (percentUsed ?? 0) >= 80
                                  ? "bg-amber-500"
                                  : "bg-primary"
                              )}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Validity Window */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="size-3.5 text-muted-foreground/70 shrink-0" />
                        <span
                          className={cn(
                            expiry.isExpired
                              ? "text-rose-600 dark:text-rose-400 font-semibold"
                              : expiry.isSoon
                              ? "text-amber-600 dark:text-amber-400 font-semibold"
                              : "text-muted-foreground"
                          )}
                        >
                          {expiry.label}
                        </span>
                      </div>
                    </TableCell>

                    {/* Active Status */}
                    <TableCell className="py-4">
                      <Badge
                        variant={c.isActive && !expiry.isExpired ? "default" : "secondary"}
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-2xs gap-1.5",
                          c.isActive && !expiry.isExpired
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-muted text-muted-foreground border border-border/60"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            c.isActive && !expiry.isExpired ? "bg-white" : "bg-muted-foreground"
                          )}
                        />
                        <span>
                          {expiry.isExpired
                            ? "Expired"
                            : c.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 pr-6 text-right">
                      {c.isActive ? (
                        <DeactivateCouponButton couponId={c.id} couponCode={c.code} />
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">
                          Deactivated
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
    </div>
  )
}
