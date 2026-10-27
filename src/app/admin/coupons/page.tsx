import { listAllCoupons } from "@/modules/payments/queries"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { CreateCouponForm } from "@/modules/payments/components/create-coupon-form"
import { DeactivateCouponButton } from "@/modules/payments/components/deactivate-coupon-button"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AdminCouponsPage() {
  const coupons = await listAllCoupons()

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Discount Coupons
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage promotional codes, percentage and fixed-amount discounts, and redemption limits.
        </p>
      </div>

      <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <Table>
          <TableHeader className="bg-muted/25">
            <TableRow className="border-b border-border/25 hover:bg-transparent">
              <TableHead className="py-4 pl-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Code
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Discount
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Redeemed
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
            {coupons.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                  No coupons found. Create your first coupon below.
                </TableCell>
              </TableRow>
            )}
            {coupons.map((c) => (
              <TableRow
                key={c.id}
                className="border-b border-border/15 last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="py-4 pl-6 font-mono font-bold text-foreground">
                  {c.code}
                </TableCell>
                <TableCell className="py-4 font-semibold text-foreground">
                  {c.discountType === "PERCENT" ? `${c.discountValue}%` : `${c.discountValue}¢`}
                </TableCell>
                <TableCell className="py-4 text-muted-foreground text-sm">
                  {c.timesRedeemed}
                  {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant={c.isActive ? "default" : "secondary"}
                    className={c.isActive ? "bg-emerald-600 text-white rounded-lg px-2.5 py-0.5 text-xs font-semibold shadow-2xs" : "rounded-lg px-2.5 py-0.5 text-xs font-semibold shadow-2xs"}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 pr-6 text-right">
                  {c.isActive && <DeactivateCouponButton couponId={c.id} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateCouponForm />
    </div>
  )
}
