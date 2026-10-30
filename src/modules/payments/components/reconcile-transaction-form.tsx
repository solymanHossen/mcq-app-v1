"use client"

import { useActionState, useState } from "react"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { reconcileTransactionAction } from "@/modules/payments/admin-actions"

export function ReconcileTransactionForm({ transactionId }: { transactionId: string }) {
  const [resolution, setResolution] = useState<"SUCCEEDED" | "FAILED" | null>(null)
  const [state, formAction, isPending] = useActionState(
    reconcileTransactionAction.bind(null, transactionId),
    undefined
  )

  if (!resolution) {
    return (
      <div className="flex items-center gap-2">
        <Button
          type="button"
          className="h-8.5 px-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-2xs hover:shadow-xs cursor-pointer text-xs transition-all gap-1.5"
          onClick={() => setResolution("SUCCEEDED")}
        >
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span>Mark Succeeded</span>
        </Button>
        <Button
          type="button"
          className="h-8.5 px-3 rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white shadow-2xs hover:shadow-xs cursor-pointer text-xs transition-all gap-1.5"
          onClick={() => setResolution("FAILED")}
        >
          <XCircle className="size-3.5 shrink-0" />
          <span>Mark Failed</span>
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-2.5 text-left">
      <input type="hidden" name="resolution" value={resolution} />
      <Field>
        <Textarea
          name="reason"
          rows={2}
          placeholder="How was this confirmed? (e.g. checked the provider dashboard)"
          required
          className="rounded-xl border-border/80 bg-background/80 p-3 text-xs shadow-2xs resize-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all"
        />
      </Field>
      {state && "error" in state && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs font-medium text-destructive flex items-center gap-2">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={isPending}
          className="h-9 px-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer text-xs transition-all gap-1.5"
        >
          {isPending && <Spinner className="size-3.5 shrink-0" />}
          <span>Confirm Resolution</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setResolution(null)}
          className="h-9 px-3.5 rounded-xl font-medium border-border/70 text-xs cursor-pointer hover:bg-muted/80 transition-all"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
