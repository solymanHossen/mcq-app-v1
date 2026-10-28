"use client"

import { CreditCard } from "lucide-react"
import { SettingToggle } from "@/modules/settings/components/setting-toggle"
import { setBillingEnabledAction } from "@/modules/settings/actions"
import type { SystemSettings } from "@/modules/settings/queries"

export function BillingModeSettings({ settings }: { settings: SystemSettings }) {
  return (
    <SettingToggle
      id="policy-billing-enabled"
      title="Enable billing & monetization"
      description="Enable paid subscriptions, checkout, and pricing plans across the platform"
      enabled={settings.billingEnabled}
      action={setBillingEnabledAction}
      icon={<CreditCard className="size-6" />}
      iconColor="emerald"
      extraLink={{
        label: "Manage plans",
        href: "/admin/subscriptions",
      }}
    />

  )
}


