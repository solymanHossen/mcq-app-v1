"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"
import { Plus, CreditCard, Sparkles, Layers, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { createPlanAction } from "@/modules/payments/admin-actions"

const selectClassName =
  "h-10 w-full min-w-0 rounded-xl border border-border/70 bg-muted/30 px-3 py-1 text-xs sm:text-sm font-medium outline-none focus-visible:bg-background focus-visible:border-primary/50 transition-all cursor-pointer"

const PRESETS = [
  {
    name: "Standard Tier",
    entitlements: JSON.stringify(
      { maxActiveExams: 10, aiExplanationsEnabled: false },
      null,
      2
    ),
  },
  {
    name: "Pro Educator",
    entitlements: JSON.stringify(
      { maxActiveExams: 30, aiExplanationsEnabled: true },
      null,
      2
    ),
  },
  {
    name: "Enterprise Vault",
    entitlements: JSON.stringify(
      { maxActiveExams: 100, aiExplanationsEnabled: true, prioritySupport: true },
      null,
      2
    ),
  },
]

export function CreatePlanDialog() {
  const [open, setOpen] = useState(false)
  const [entitlements, setEntitlements] = useState(
    '{\n  "maxActiveExams": 20,\n  "aiExplanationsEnabled": true\n}'
  )

  const [state, formAction, isPending] = useActionState(
    async (
      _state: Awaited<ReturnType<typeof createPlanAction>> | undefined,
      formData: FormData
    ) => {
      const result = await createPlanAction(_state, formData)
      if ("success" in result) {
        setOpen(false)
        toast.success("Subscription plan created successfully")
      } else if ("error" in result) {
        toast.error(result.error)
      }
      return result
    },
    undefined
  )

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 sm:h-11 rounded-xl px-4 sm:px-5 font-bold shadow-xs gap-1.5 cursor-pointer"
      >
        <Plus className="size-4" />
        <span>New Plan</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl border border-border/80 bg-background/95 backdrop-blur-2xl p-6 shadow-2xl">
          <DialogHeader className="p-0 text-left">
            <DialogTitle className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Create Subscription Plan
            </DialogTitle>
            <p className="mt-0.5 text-xs text-muted-foreground font-medium">
              Define a new billing tier and its platform access entitlements.
            </p>
          </DialogHeader>

          <form action={formAction} className="flex flex-col gap-3.5 pt-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field className="space-y-1">
                <FieldLabel htmlFor="key" className="text-xs font-semibold text-foreground">
                  Identifier Key
                </FieldLabel>
                <Input
                  id="key"
                  name="key"
                  placeholder="e.g. pro-monthly"
                  required
                  className="h-10 rounded-xl border border-border/70 bg-muted/30 focus-visible:bg-background text-xs sm:text-sm font-medium shadow-2xs"
                />
              </Field>

              <Field className="space-y-1">
                <FieldLabel htmlFor="name" className="text-xs font-semibold text-foreground">
                  Plan Name
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Pro Tier"
                  required
                  className="h-10 rounded-xl border border-border/70 bg-muted/30 focus-visible:bg-background text-xs sm:text-sm font-medium shadow-2xs"
                />
              </Field>

              <Field className="space-y-1">
                <FieldLabel htmlFor="priceCents" className="text-xs font-semibold text-foreground">
                  Price (in cents)
                </FieldLabel>
                <Input
                  id="priceCents"
                  name="priceCents"
                  type="number"
                  min={0}
                  placeholder="2900 (= $29.00)"
                  required
                  className="h-10 rounded-xl border border-border/70 bg-muted/30 focus-visible:bg-background text-xs sm:text-sm font-medium shadow-2xs"
                />
              </Field>

              <Field className="space-y-1">
                <FieldLabel htmlFor="currency" className="text-xs font-semibold text-foreground">
                  Currency Code
                </FieldLabel>
                <Input
                  id="currency"
                  name="currency"
                  defaultValue="usd"
                  maxLength={3}
                  required
                  className="h-10 rounded-xl border border-border/70 bg-muted/30 focus-visible:bg-background text-xs sm:text-sm font-medium uppercase shadow-2xs"
                />
              </Field>
            </div>

            <Field className="space-y-1">
              <FieldLabel htmlFor="billingInterval" className="text-xs font-semibold text-foreground">
                Billing Cycle Interval
              </FieldLabel>
              <select
                id="billingInterval"
                name="billingInterval"
                className={selectClassName}
                defaultValue="MONTH"
              >
                <option value="MONTH">Monthly Billing Cycle</option>
                <option value="YEAR">Annual / Yearly Billing Cycle</option>
              </select>
            </Field>

            <Field className="space-y-1">
              <FieldLabel htmlFor="description" className="text-xs font-semibold text-foreground">
                Description (Optional)
              </FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Brief summary of who this plan is intended for..."
                className="h-14 rounded-xl border border-border/70 bg-muted/30 focus-visible:bg-background text-xs sm:text-sm font-medium resize-none shadow-2xs placeholder:text-muted-foreground/60 transition-all"
              />
            </Field>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="entitlements" className="text-xs font-semibold text-foreground">
                  Entitlements (JSON)
                </FieldLabel>
                <span className="text-[11px] text-muted-foreground">Quick Presets:</span>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setEntitlements(p.entitlements)}
                    className="rounded-lg border border-border/70 bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-background hover:text-foreground hover:border-primary/40 transition-colors shadow-2xs cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <Textarea
                id="entitlements"
                name="entitlements"
                rows={3}
                value={entitlements}
                onChange={(e) => setEntitlements(e.target.value)}
                required
                className="font-mono text-xs rounded-xl border border-border/70 bg-muted/30 focus-visible:bg-background shadow-2xs"
              />
            </div>

            {state && "error" in state && (
              <FieldError className="text-xs font-semibold text-destructive">
                {state.error}
              </FieldError>
            )}

            <DialogFooter className="mt-1 flex items-center justify-end gap-2.5 border-t border-border/40 pt-3.5 -mx-6 -mb-6 px-6 pb-6 bg-muted/20 rounded-b-3xl">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-4.5 rounded-xl border border-border/70 text-xs sm:text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-all"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-10 px-5.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all"
              >
                {isPending && <Spinner data-icon="inline-start" />}
                Create Plan Tier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function CreatePlanForm() {
  return <CreatePlanDialog />
}
