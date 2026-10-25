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
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Coupons</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Redeemed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono">{c.code}</TableCell>
              <TableCell>
                {c.discountType === "PERCENT" ? `${c.discountValue}%` : `${c.discountValue}¢`}
              </TableCell>
              <TableCell>
                {c.timesRedeemed}
                {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}
              </TableCell>
              <TableCell>
                <Badge variant={c.isActive ? "secondary" : "outline"}>
                  {c.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {c.isActive && <DeactivateCouponButton couponId={c.id} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateCouponForm />
    </div>
  )
}
