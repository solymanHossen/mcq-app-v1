"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { deactivateCouponAction } from "@/modules/payments/admin-actions"

export function DeactivateCouponButton({
  couponId,
  couponCode,
}: {
  couponId: string
  couponCode?: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDeactivate() {
    startTransition(async () => {
      const result = await deactivateCouponAction(couponId)
      if (result && "error" in result) {
        toast.error(result.error)
      } else {
        setOpen(false)
        toast.success(
          couponCode
            ? `Coupon "${couponCode}" deactivated`
            : "Coupon deactivated"
        )
      }
    })
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-8.5 rounded-xl border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/15 hover:border-destructive/60 shadow-2xs text-xs font-semibold gap-1.5 transition-all cursor-pointer"
      >
        <Ban className="size-3.5 shrink-0" />
        <span>Deactivate</span>
      </Button>

      {/* ================= MASTER REFERENCE CONFIRMATION DIALOG ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[calc(100vw-1.25rem)] sm:w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90dvh] flex flex-col p-0 gap-0 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden bg-background"
        >
          <DialogHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/60 bg-muted/20 shrink-0 text-left">
            <div className="flex items-center gap-3 pr-6">
              <div className="size-10 sm:size-11 rounded-xl sm:rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 ring-1 ring-destructive/20 shadow-xs">
                <Ban className="size-5 sm:size-5.5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-heading text-base sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                  Deactivate Coupon
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  {couponCode ? `Voucher code: ${couponCode}` : "Deprecate promotional voucher"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-5 space-y-3.5 text-sm overflow-y-auto flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to deactivate this coupon? Candidates will immediately no longer be able to claim this discount code at checkout.
            </p>
          </div>

          <DialogFooter className="p-4 sm:p-5 pt-3.5 sm:pt-4 border-t border-border/60 bg-muted/20 shrink-0 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-10 px-4.5 rounded-xl border border-border/70 text-xs sm:text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeactivate}
              disabled={isPending}
              className="h-10 px-5.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all"
            >
              {isPending && <Spinner data-icon="inline-start" />}
              Confirm Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

