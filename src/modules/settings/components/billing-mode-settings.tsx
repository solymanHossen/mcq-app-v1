"use client"

import * as React from "react"
import Link from "next/link"
import { CreditCard, CheckCircle2, EyeOff, Ticket, Receipt } from "lucide-react"
import { SettingToggle } from "@/modules/settings/components/setting-toggle"
import { setBillingEnabledAction } from "@/modules/settings/actions"
import type { SystemSettings } from "@/modules/settings/queries"
import { Badge } from "@/components/ui/badge"

export function BillingModeSettings({ settings }: { settings: SystemSettings }) {
  const isEnabled = settings.billingEnabled

  return (
    <div className="divide-y divide-border/60">
      <SettingToggle
        id="policy-billing-enabled"
        title="Enable billing & monetization"
        description="Master switch to activate or completely hide all subscriptions, pricing plans, and checkout flows across the platform."
        enabled={isEnabled}
        action={setBillingEnabledAction}
        icon={<CreditCard className="size-6" />}
        iconColor="emerald"
      />

      <div className="p-5 sm:p-6 bg-muted/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Current Platform State
          </span>
          {isEnabled ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 rounded-full text-xs font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>Monetization Active &amp; Visible</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 rounded-full text-xs font-semibold text-muted-foreground border-border/80">
              <EyeOff className="size-3.5" />
              <span>All Billing Links Hidden (Free Mode)</span>
            </Badge>
          )}
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {isEnabled
            ? "Billing tabs are active on Student and Teacher portals. Students can explore subscription tiers and checkout. Admin sidebar displays Plans, Coupons, and Payments."
            : "Billing is completely turned off platform-wide. All /billing navigation links, student upgrade prompts, checkout gateways, and admin billing items are hidden. The platform runs in 100% free mode."}
        </p>

        <div className="pt-2 border-t border-border/50 flex flex-wrap gap-2.5">
          <Link
            href="/admin/subscriptions"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors shadow-2xs"
          >
            <CreditCard className="size-3.5 text-primary" />
            <span>Manage Plans</span>
          </Link>
          <Link
            href="/admin/coupons"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors shadow-2xs"
          >
            <Ticket className="size-3.5 text-amber-500" />
            <span>Promo Coupons</span>
          </Link>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors shadow-2xs"
          >
            <Receipt className="size-3.5 text-emerald-500" />
            <span>Payment Records</span>
          </Link>
        </div>
      </div>
    </div>
  )
}


