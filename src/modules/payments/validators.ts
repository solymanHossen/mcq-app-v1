import { z } from "zod"

export const planSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "Key must be at least 2 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Key may only contain lowercase letters, numbers, and hyphens"),
  name: z.string().trim().min(2, "Name is required").max(100),
  description: z.string().trim().max(2000).optional(),
  priceCents: z.coerce.number({ error: "Enter a valid price" }).int().min(0).max(10_000_000),
  currency: z.string().trim().toLowerCase().length(3).default("usd"),
  billingInterval: z.enum(["MONTH", "YEAR"]),
  // A JSON object textarea — kept flat and simple rather than individual
  // form fields per entitlement, since the set of entitlements a plan might
  // define isn't fixed (see lib/payments/entitlements.ts).
  entitlements: z.string().trim().min(2, "Entitlements must be a JSON object").refine(
    (value) => {
      try {
        const parsed = JSON.parse(value)
        return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      } catch {
        return false
      }
    },
    { message: "Entitlements must be valid JSON (an object)" }
  ),
})

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Code must be at least 3 characters")
    .max(50)
    .regex(/^[A-Z0-9-]+$/, "Code may only contain letters, numbers, and hyphens"),
  discountType: z.enum(["PERCENT", "FIXED_AMOUNT"]),
  discountValue: z.coerce.number({ error: "Enter a valid discount value" }).positive(),
  maxRedemptions: z.coerce.number().int().positive().optional(),
  expiresAt: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
})

export const refundSchema = z.object({
  reason: z.string().trim().min(5, "Explain the reason for this refund").max(1000),
  amountCents: z.coerce.number().int().positive().optional(),
})

export const reconcileSchema = z.object({
  resolution: z.enum(["SUCCEEDED", "FAILED"]),
  reason: z.string().trim().min(5, "Explain the reconciliation decision").max(1000),
})
