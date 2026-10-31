"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"
import { Plus, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createPlanAction } from "@/modules/payments/admin-actions"

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
  const [key, setKey] = useState("")
  const [name, setName] = useState("")
  const [priceCents, setPriceCents] = useState("")
  const [currency, setCurrency] = useState("usd")
  const [billingInterval, setBillingInterval] = useState<"MONTH" | "YEAR">("MONTH")
  const [description, setDescription] = useState("")
  const [entitlements, setEntitlements] = useState(
    '{\n  "maxActiveExams": 20,\n  "aiExplanationsEnabled": true\n}'
  )

  function resetForm() {
    setKey("")
    setName("")
    setPriceCents("")
    setCurrency("usd")
    setBillingInterval("MONTH")
    setDescription("")
    setEntitlements('{\n  "maxActiveExams": 20,\n  "aiExplanationsEnabled": true\n}')
  }

  const [state, formAction, isPending] = useActionState(
    async (
      _state: Awaited<ReturnType<typeof createPlanAction>> | undefined,
      formData: FormData
    ) => {
      const result = await createPlanAction(_state, formData)
      if ("success" in result) {
        setOpen(false)
        resetForm()
        toast.success("Subscription plan created successfully")
      } else if ("error" in result) {
        toast.error(result.error)
      }
      return result
    },
    undefined
  )

  // Real-time client-side validation for required fields
  const isKeyValid =
    key.trim().length >= 2 && /^[a-z0-9-]+$/.test(key.trim())
  const isNameValid = name.trim().length >= 2
  const isPriceValid =
    priceCents.trim().length > 0 &&
    !isNaN(Number(priceCents)) &&
    Number(priceCents) >= 0
  const isCurrencyValid = currency.trim().length === 3

  let isEntitlementsValid = false
  try {
    const parsed = JSON.parse(entitlements)
    isEntitlementsValid =
      typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
  } catch {
    isEntitlementsValid = false
  }

  // Description is optional; all required fields must be valid to enable the submit button
  const isFormValid =
    isKeyValid &&
    isNameValid &&
    isPriceValid &&
    isCurrencyValid &&
    isEntitlementsValid

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          resetForm()
          setOpen(true)
        }}
        className="h-10 sm:h-11 rounded-xl px-4 sm:px-5 font-bold shadow-xs gap-1.5 cursor-pointer"
      >
        <Plus className="size-4" />
        <span>New Plan</span>
      </Button>

      {/* ================= MASTER REFERENCE COMPLIANT MODAL ================= */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) resetForm()
        }}
      >
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[calc(100vw-1.25rem)] sm:w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[90dvh] flex flex-col p-0 gap-0 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden bg-background"
        >
          {/* Header with Icon Badge */}
          <DialogHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/60 bg-muted/20 shrink-0 text-left">
            <div className="flex items-center gap-3 pr-6">
              <div className="size-10 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-xs">
                <CreditCard className="size-5 sm:size-5.5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-heading text-base sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                  Create Subscription Plan
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  Define a new billing tier and access entitlements.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form action={formAction} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-5 space-y-3.5 text-sm overflow-y-auto flex-1">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="key" className="text-xs font-semibold text-foreground">
                    Identifier Key <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="key"
                    name="key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="e.g. pro-monthly"
                    required
                    className="h-10 sm:h-11 rounded-xl border border-border/70 bg-muted/20 px-3.5 focus-visible:bg-background text-sm font-medium shadow-2xs"
                  />
                  {key.length > 0 && !isKeyValid && (
                    <p className="text-[11px] text-destructive">
                      Lowercase letters, numbers, and hyphens only (min 2 chars).
                    </p>
                  )}
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="name" className="text-xs font-semibold text-foreground">
                    Plan Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pro Tier"
                    required
                    className="h-10 sm:h-11 rounded-xl border border-border/70 bg-muted/20 px-3.5 focus-visible:bg-background text-sm font-medium shadow-2xs"
                  />
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="priceCents" className="text-xs font-semibold text-foreground">
                    Price (in cents) <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="priceCents"
                    name="priceCents"
                    type="number"
                    min={0}
                    value={priceCents}
                    onChange={(e) => setPriceCents(e.target.value)}
                    placeholder="2900 (= $29.00)"
                    required
                    className="h-10 sm:h-11 rounded-xl border border-border/70 bg-muted/20 px-3.5 focus-visible:bg-background text-sm font-medium shadow-2xs"
                  />
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel htmlFor="currency" className="text-xs font-semibold text-foreground">
                    Currency Code <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="currency"
                    name="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    maxLength={3}
                    required
                    className="h-10 sm:h-11 rounded-xl border border-border/70 bg-muted/20 px-3.5 focus-visible:bg-background text-sm font-medium uppercase shadow-2xs"
                  />
                </Field>
              </div>

              {/* shadcn UI Select for Billing Interval */}
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="billingInterval" className="text-xs font-semibold text-foreground">
                  Billing Cycle Interval <span className="text-destructive">*</span>
                </FieldLabel>
                <input type="hidden" name="billingInterval" value={billingInterval} />
                <Select
                  value={billingInterval}
                  onValueChange={(val) => setBillingInterval(val as "MONTH" | "YEAR")}
                >
                  <SelectTrigger
                    id="billingInterval"
                    className="!h-10 sm:!h-11 w-full rounded-xl border border-border/70 bg-muted/20 px-3.5 text-sm font-medium shadow-2xs focus-visible:bg-background focus-visible:border-primary/50 cursor-pointer"
                  >
                    <SelectValue placeholder="Select billing interval" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-border/70 bg-popover shadow-xl p-1">
                    <SelectItem
                      value="MONTH"
                      className="rounded-lg py-2 px-3 text-sm font-medium cursor-pointer"
                    >
                      Monthly Billing Cycle
                    </SelectItem>
                    <SelectItem
                      value="YEAR"
                      className="rounded-lg py-2 px-3 text-sm font-medium cursor-pointer"
                    >
                      Annual / Yearly Billing Cycle
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Optional Description */}
              <Field className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="description" className="text-xs font-semibold text-foreground">
                    Description
                  </FieldLabel>
                  <span className="text-[11px] text-muted-foreground font-normal">(Optional)</span>
                </div>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief summary of who this plan is intended for..."
                  className="min-h-14 rounded-xl border border-border/70 bg-muted/20 px-3.5 py-2.5 focus-visible:bg-background text-sm font-medium resize-none shadow-2xs placeholder:text-muted-foreground/60 transition-all"
                />
              </Field>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="entitlements" className="text-xs font-semibold text-foreground">
                    Entitlements (JSON) <span className="text-destructive">*</span>
                  </FieldLabel>
                  <span className="text-[11px] text-muted-foreground">Quick Presets:</span>
                </div>

                {/* shadcn Badge presets */}
                <div className="flex flex-wrap items-center gap-1.5 pb-1">
                  {PRESETS.map((p) => (
                    <Badge
                      key={p.name}
                      variant="outline"
                      onClick={() => setEntitlements(p.entitlements)}
                      className="cursor-pointer rounded-lg border-border/70 bg-muted/40 hover:bg-background hover:text-foreground hover:border-primary/40 px-2.5 py-1 text-[11px] font-semibold transition-colors shadow-2xs select-none"
                    >
                      {p.name}
                    </Badge>
                  ))}
                </div>

                <Textarea
                  id="entitlements"
                  name="entitlements"
                  rows={3}
                  value={entitlements}
                  onChange={(e) => setEntitlements(e.target.value)}
                  required
                  className="font-mono text-xs sm:text-sm rounded-xl border border-border/70 bg-muted/20 focus-visible:bg-background shadow-2xs"
                />
                {!isEntitlementsValid && (
                  <p className="text-[11px] text-destructive">
                    Entitlements must be a valid JSON object.
                  </p>
                )}
              </div>

              {state && "error" in state && (
                <FieldError className="text-xs font-semibold text-destructive">
                  {state.error}
                </FieldError>
              )}
            </div>

            <DialogFooter className="p-4 sm:p-5 pt-3.5 sm:pt-4 border-t border-border/60 bg-muted/20 shrink-0 flex items-center justify-end gap-2.5">
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
                disabled={!isFormValid || isPending}
                className="h-10 px-5.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all disabled:opacity-45 disabled:cursor-not-allowed"
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

