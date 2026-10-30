"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"
import {
  Ticket,
  Plus,
  Sparkles,
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
        className="h-10 sm:h-11 rounded-xl px-4 sm:px-6 font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98] gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="size-4.5 shrink-0" />
        <span>Create Coupon</span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl sm:rounded-3xl border border-border/80 bg-background/98 backdrop-blur-2xl p-6 shadow-2xl">
          <form action={formAction} className="flex flex-col gap-5">
            <DialogHeader className="gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary border border-primary/25 shadow-xs">
                  <Ticket className="size-6" />
                </div>
                <div>
                  <DialogTitle className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    Create Discount Coupon
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Issue promotional codes with percentage or fixed discount limits.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Interactive Live Coupon Ticket Preview */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-primary" />
                    <span className="font-mono text-base sm:text-lg font-black tracking-wider text-foreground">
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
                  className="rounded-xl px-3 py-1 font-bold text-xs shrink-0 shadow-xs bg-primary text-primary-foreground"
                >
                  {discountType === "PERCENT"
                    ? `${discountValue || 0}% OFF`
                    : `$${discountValue ? (Number(discountValue) / 100).toFixed(2) : "0.00"} OFF`}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
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
                <FieldLabel htmlFor="coupon-code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Coupon Code <span className="text-rose-500">*</span>
                </FieldLabel>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  <Sparkles className="size-3" />
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
                className="h-11 rounded-xl font-mono text-sm uppercase tracking-wider font-bold border-border/80 bg-background shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </Field>

            {/* Discount Type & Value Segment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="discount-type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Discount Type <span className="text-rose-500">*</span>
                </FieldLabel>
                <input type="hidden" name="discountType" value={discountType} />
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-border/80 bg-muted/50 p-1">
                  <button
                    type="button"
                    onClick={() => setDiscountType("PERCENT")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer",
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
                      "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer",
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
                <FieldLabel htmlFor="discount-value" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {discountType === "PERCENT" ? "Percentage Off (%)" : "Amount Off (Cents ¢)"} <span className="text-rose-500">*</span>
                </FieldLabel>
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
                    className="h-11 rounded-xl text-sm font-semibold border-border/80 bg-background pl-4 pr-10 shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    {discountType === "PERCENT" ? "%" : "¢"}
                  </span>
                </div>
              </Field>
            </div>

            {/* Optional Constraints: Max Redemptions & Expiration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="max-redemptions" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Max Redemptions
                </FieldLabel>
                <Input
                  id="max-redemptions"
                  name="maxRedemptions"
                  type="number"
                  min={1}
                  value={maxRedemptions}
                  onChange={(e) => setMaxRedemptions(e.target.value)}
                  placeholder="e.g. 100 (Optional)"
                  className="h-11 rounded-xl text-sm border-border/80 bg-background shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </Field>

              <Field className="space-y-1.5">
                <FieldLabel htmlFor="expires-at" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Expiry Date
                </FieldLabel>
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

            {state && "error" in state && <FieldError>{state.error}</FieldError>}

            <DialogFooter className="mt-2 flex-row justify-end gap-2.5 border-t border-border/60 pt-4 -mx-6 -mb-6 px-6 pb-6 bg-muted/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-medium border-border/70 text-xs sm:text-sm cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !isFormValid}
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/25 gap-2 cursor-pointer text-xs sm:text-sm"
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
