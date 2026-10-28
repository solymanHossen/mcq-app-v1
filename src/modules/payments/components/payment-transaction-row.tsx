"use client"

import { useActionState, useState, useEffect } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
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
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 rounded-lg border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
        >
          <RotateCcw className="size-3.5" />
          <span>Refund</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold text-foreground">
            Issue Transaction Refund
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {customerName && formattedAmount ? (
              <>
                Refunding <span className="font-semibold text-foreground">{formattedAmount}</span> for{" "}
                <span className="font-semibold text-foreground">{customerName}</span>.
              </>
            ) : (
              "Process a full or partial refund for this customer transaction."
            )}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2">
          <Field className="space-y-1.5">
            <FieldLabel className="text-xs font-semibold text-foreground">
              Refund Amount in Cents (Optional)
            </FieldLabel>
            <Input
              name="amountCents"
              type="number"
              min={1}
              placeholder="Leave blank for full amount"
              className="h-10 rounded-xl text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Leave blank to refund the full transaction amount.
            </p>
          </Field>

          <Field className="space-y-1.5">
            <FieldLabel className="text-xs font-semibold text-foreground">
              Reason for Refund <span className="text-destructive">*</span>
            </FieldLabel>
            <Textarea
              name="reason"
              rows={3}
              placeholder="Provide reason for audit log (e.g. customer request, double billing, cancelled course)..."
              required
              className="rounded-xl resize-none text-xs"
            />
          </Field>

          {state && "error" in state && <FieldError>{state.error}</FieldError>}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
              className="rounded-xl font-semibold"
            >
              {isPending && <Spinner data-icon="inline-start" className="size-4" />}
              Confirm Refund
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
