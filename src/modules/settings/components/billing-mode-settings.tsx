"use client"

import { SettingToggle } from "@/modules/settings/components/setting-toggle"
import { setBillingEnabledAction } from "@/modules/settings/actions"
import type { SystemSettings } from "@/modules/settings/queries"

export function BillingModeSettings({ settings }: { settings: SystemSettings }) {
  return (
    <SettingToggle
      title="Enable billing"
      description="When on, the billing system behaves as built — teachers and students see the Billing nav link, can view plans, and can subscribe. Turning this off makes ExamHub free for everyone: the Billing nav link and plan catalog are hidden, and new subscriptions are refused. Existing subscriptions, payment history, and the admin billing tools (Plans, Coupons, Payments) are never affected — only new subscribing is."
      enabled={settings.billingEnabled}
      action={setBillingEnabledAction}
    />
  )
}
