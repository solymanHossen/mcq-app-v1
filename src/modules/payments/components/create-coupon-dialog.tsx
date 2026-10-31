"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"
import {
  Ticket,
  Plus,
  RefreshCw,
  Percent,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"
import { createCouponAction } from "@/modules/payments/admin-actions"


export function CreateCouponDialog() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED_AMOUNT">("PERCENT")
  const [discountValue, setDiscountValue] = useState("")
  const [maxRedemptions, setMaxRedemptions] = useState("")
  const [expiresAt, setExpiresAt] = useState("")

  function resetForm() {
    setCode("")
    setDiscountType("PERCENT")
    setDiscountValue("")
    setMaxRedemptions("")
    setExpiresAt("")
  }

  function generateRandomCode() {
    const prefixes = ["PROMO", "SAVE", "EXAM", "VIP", "BONUS", "WELCOME"]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const num = discountValue && !isNaN(Number(discountValue)) ? Math.round(Number(discountValue)) : 25
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    setCode(`${prefix}${num}-${rand}`)
  }

  const [state, formAction, isPending] = useActionState(
    async (
      _state: Awaited<ReturnType<typeof createCouponAction>> | undefined,
      formData: FormData
    ) => {
      // Clean up empty optional fields so Zod coercion doesn't treat empty strings as 0
      if (!formData.get("maxRedemptions") || String(formData.get("maxRedemptions")).trim() === "") {
        formData.delete("maxRedemptions")
      }
      if (!formData.get("expiresAt") || String(formData.get("expiresAt")).trim() === "") {
        formData.delete("expiresAt")
      }

      const result = await createCouponAction(_state, formData)
      if ("success" in result) {
        setOpen(false)
        resetForm()
        toast.success(`Coupon "${code.toUpperCase()}" created successfully`)
      } else if ("error" in result) {
        toast.error(result.error)
      }
      return result
    },
    undefined
  )

  const isCodeValid = code.trim().length >= 3 && /^[A-Z0-9-]+$/i.test(code.trim())
  const isValueValid =
    discountValue.trim().length > 0 &&
    !isNaN(Number(discountValue)) &&
    Number(discountValue) > 0 &&
    (discountType !== "PERCENT" || Number(discountValue) <= 100)

  const isFormValid = isCodeValid && isValueValid

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          resetForm()
          setOpen(true)
        }}
        className="h-10 sm:h-11 rounded-xl px-4 sm:px-5 font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98] gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm"
      >
        <Plus className="size-4 shrink-0" />
        <span>Create Coupon</span>
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
              <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary border border-primary/25 shadow-xs">
                <Ticket className="size-5 sm:size-5.5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-heading text-base sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                  Create Discount Coupon
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  Issue promotional codes with percentage or fixed limits.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form action={formAction} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-5 space-y-3.5 text-sm overflow-y-auto flex-1">
              {/* Interactive Live Coupon Ticket Preview */}
              <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Tag className="size-3.5 text-primary" />
                      <span className="font-mono text-sm sm:text-base font-black tracking-wider text-foreground">
                        {code.trim() ? code.trim().toUpperCase() : "YOUR-CODE"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {discountType === "PERCENT"
                        ? `${discountValue || "0"}% discount off subscription checkouts`
                        : `$${discountValue ? (Number(discountValue) / 100).toFixed(2) : "0.00"} fixed discount off checkouts`}
                    </p>
                  </div>
                  <Badge
                    className="rounded-lg px-2.5 py-0.5 font-bold text-xs shrink-0 shadow-2xs bg-primary text-primary-foreground"
                  >
                    {discountType === "PERCENT"
                      ? `${discountValue || 0}% OFF`
                      : `$${discountValue ? (Number(discountValue) / 100).toFixed(2) : "0.00"} OFF`}
                  </Badge>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-3 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3 text-muted-foreground/70" />
                    {maxRedemptions ? `Limit: ${maxRedemptions} claims` : "Unlimited claims"}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground/70" />
                    {expiresAt ? `Expires: ${expiresAt}` : "No expiry date"}
                  </span>
                </div>
              </div>

              {/* Coupon Code Input & Generator */}
              <Field className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="coupon-code" className="text-xs font-semibold text-foreground">
                    Coupon Code <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="size-3" />
                    <span>Generate Code</span>
                  </button>
                </div>
                <Input
                  id="coupon-code"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME50"
                  required
                  className="h-10 sm:h-11 rounded-xl font-mono text-sm uppercase tracking-wider font-bold border-border/70 bg-muted/20 shadow-2xs focus-visible:bg-background"
                />
              </Field>

              {/* Discount Type & Value Segment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field className="space-y-1.5">
                  <label htmlFor="discount-type" className="text-xs font-semibold text-foreground">
                    Discount Type <span className="text-destructive">*</span>
                  </label>
                  <input type="hidden" name="discountType" value={discountType} />
                  <div className="grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/30 p-1">
                    <button
                      type="button"
                      onClick={() => setDiscountType("PERCENT")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer",
                        discountType === "PERCENT"
                          ? "bg-background text-foreground shadow-xs border border-border/60"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Percent className="size-3.5" />
                      <span>Percent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("FIXED_AMOUNT")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer",
                        discountType === "FIXED_AMOUNT"
                          ? "bg-background text-foreground shadow-xs border border-border/60"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <DollarSign className="size-3.5" />
                      <span>Fixed (¢)</span>
                    </button>
                  </div>
                </Field>

                <Field className="space-y-1.5">
                  <label htmlFor="discount-value" className="text-xs font-semibold text-foreground">
                    {discountType === "PERCENT" ? "Percentage Off (%)" : "Amount Off (Cents ¢)"} <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="discount-value"
                      name="discountValue"
                      type="number"
                      min={1}
                      max={discountType === "PERCENT" ? 100 : undefined}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === "PERCENT" ? "20" : "500 (= $5.00)"}
                      required
                      className="h-10 sm:h-11 rounded-xl text-sm font-semibold border-border/70 bg-muted/20 pl-4 pr-10 shadow-2xs focus-visible:bg-background"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      {discountType === "PERCENT" ? "%" : "¢"}
                    </span>
                  </div>
                </Field>
              </div>

              {/* Optional Constraints: Max Redemptions & Expiration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field className="space-y-1.5">
                  <label htmlFor="max-redemptions" className="text-xs font-semibold text-foreground">
                    Max Redemptions
                  </label>
                  <Input
                    id="max-redemptions"
                    name="maxRedemptions"
                    type="number"
                    min={1}
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                    placeholder="e.g. 100 (Optional)"
                    className="h-10 sm:h-11 rounded-xl text-sm border-border/70 bg-muted/20 shadow-2xs focus-visible:bg-background"
                  />
                </Field>

                <Field className="space-y-1.5">
                  <label htmlFor="expires-at" className="text-xs font-semibold text-foreground">
                    Expiry Date
                  </label>
                  <DatePicker
                    id="expires-at"
                    name="expiresAt"
                    value={expiresAt ? new Date(expiresAt) : undefined}
                    onChange={(date) => setExpiresAt(date ? format(date, "yyyy-MM-dd") : "")}
                    placeholder="Pick expiration date"
                    minDate={new Date()}
                  />
                </Field>
              </div>

              {state && "error" in state && (
                <FieldError className="text-xs font-semibold text-destructive">{state.error}</FieldError>
              )}
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
                type="submit"
                disabled={isPending || !isFormValid}
                className="h-10 px-5.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs gap-2 cursor-pointer text-xs sm:text-sm transition-all disabled:opacity-45"
              >
                {isPending ? (
                  <>
                    <Spinner className="size-4" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Create Coupon</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

