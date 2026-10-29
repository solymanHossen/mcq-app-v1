"use client"

import { useActionState, useState, useEffect } from "react"
import { RotateCcw, AlertCircle, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { issueRefundAction } from "@/modules/payments/admin-actions"

export function RefundForm({
  transactionId,
  customerName,
  formattedAmount,
}: {
  transactionId: string
  customerName?: string
  formattedAmount?: string
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    issueRefundAction.bind(null, transactionId),
    undefined
  )

  useEffect(() => {
    if (state && !("error" in state)) {
      setOpen(false)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-8.5 px-3 gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-semibold cursor-pointer shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
        >
          <RotateCcw className="size-3.5 shrink-0" />
          <span>Refund</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl sm:rounded-3xl border border-border/80 bg-background/98 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        <form action={formAction} className="flex flex-col gap-5">
          <DialogHeader className="gap-3 text-left">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-transparent text-rose-600 dark:text-rose-400 border border-rose-500/25 shadow-xs">
                <RotateCcw className="size-6" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Issue Transaction Refund
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Process a full or partial refund for this customer transaction.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Transaction Snapshot Card */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-4 sm:p-4.5 shadow-2xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold text-sm border border-rose-500/30">
                  {customerName ? customerName.slice(0, 2).toUpperCase() : <Receipt className="size-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold text-foreground truncate">
                      {customerName || "Customer"}
                    </span>
                    <Badge
                      variant="outline"
                      className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 text-[10px] font-semibold px-2 py-0.2"
                    >
                      Refund Target
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                    ID: <span className="text-foreground/80">{transactionId.slice(0, 16)}…</span>
                  </p>
                </div>
              </div>
              {formattedAmount && (
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Payment Amount
                  </span>
                  <span className="font-heading text-base sm:text-lg font-extrabold text-foreground">
                    {formattedAmount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Refund Amount in Cents{" "}
                <span className="font-normal text-[11px] normal-case text-muted-foreground/75">
                  (Optional)
                </span>
              </FieldLabel>
              <Input
                name="amountCents"
                type="number"
                min={1}
                placeholder="Leave blank for full amount"
                className="h-11 rounded-xl border-border/80 bg-background/80 px-3.5 text-sm shadow-2xs placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-rose-500/30 focus-visible:border-rose-500 transition-all"
              />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                <span className="inline-block size-1.5 rounded-full bg-rose-500/60 shrink-0" />
                Leave blank to refund the full transaction amount automatically.
              </p>
            </Field>

            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reason for Refund <span className="text-rose-500">*</span>
              </FieldLabel>
              <Textarea
                name="reason"
                rows={3}
                placeholder="Provide reason for audit log (e.g. customer request, double billing, cancelled course)..."
                required
                minLength={4}
                className="min-h-[96px] rounded-xl border-border/80 bg-background/80 p-3.5 text-sm shadow-2xs resize-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-rose-500/30 focus-visible:border-rose-500 transition-all"
              />
            </Field>
          </div>

          {state && "error" in state && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <DialogFooter className="mt-2 flex-row justify-end gap-3 border-t border-border/60 pt-4 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 px-6 sm:px-7 pb-6 sm:pb-7 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-10 sm:h-11 px-5 rounded-xl font-medium border-border/70 text-xs sm:text-sm cursor-pointer hover:bg-muted/80 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 sm:h-11 px-6 rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white shadow-md shadow-rose-600/25 gap-2 cursor-pointer text-xs sm:text-sm transition-all inline-flex items-center justify-center"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4 shrink-0" />
                  <span>Processing Refund...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="size-4 shrink-0" />
                  <span>Confirm Refund</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
