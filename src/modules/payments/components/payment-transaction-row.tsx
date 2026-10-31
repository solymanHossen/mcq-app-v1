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

      <DialogContent className="w-[calc(100vw-1.25rem)] sm:w-full sm:max-w-lg max-h-[92dvh] flex flex-col p-0 gap-0 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden bg-background">
        <form action={formAction} className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="p-5 sm:p-6 border-b border-border/60 bg-muted/20 text-left shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 shadow-xs">
                <RotateCcw className="size-5 sm:size-6" />
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

          <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(92dvh-140px)]">
            {/* Transaction Snapshot Card */}
            <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 sm:p-4.5 shadow-2xs">
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
                <div className="flex items-center justify-between">
                  <FieldLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Refund Amount (Cents)
                  </FieldLabel>
                  <span className="text-[11px] text-muted-foreground/70 font-medium">
                    Leave blank for full refund
                  </span>
                </div>
                <Input
                  name="amountCents"
                  type="number"
                  min={1}
                  placeholder={
                    formattedAmount
                      ? `Full refund: ${formattedAmount}`
                      : "Leave blank for full refund"
                  }
                  className="h-11 rounded-xl border-border/80 bg-background px-3.5 text-sm shadow-2xs placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-rose-500/30 focus-visible:border-rose-500 transition-all"
                />
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
                  className="min-h-[96px] rounded-xl border-border/80 bg-background p-3.5 text-sm shadow-2xs resize-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-rose-500/30 focus-visible:border-rose-500 transition-all"
                />
              </Field>
            </div>

            {state && "error" in state && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-10 sm:h-11 px-5 rounded-xl font-medium border-border/70 text-xs sm:text-sm cursor-pointer hover:bg-muted/80 transition-all w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 sm:h-11 px-6 rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white shadow-md shadow-rose-600/25 gap-2 cursor-pointer text-xs sm:text-sm transition-all inline-flex items-center justify-center w-full sm:w-auto"
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
