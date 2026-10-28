"use client"

import * as React from "react"
import Link from "next/link"
import { ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VerificationSettings } from "@/modules/settings/components/verification-settings"
import { BillingModeSettings } from "@/modules/settings/components/billing-mode-settings"
import type { SystemSettings } from "@/modules/settings/queries"

interface PoliciesSettingsConsoleProps {
  settings: SystemSettings
  pendingTeacherCount: number
}

export function PoliciesSettingsConsole({
  settings,
  pendingTeacherCount,
}: PoliciesSettingsConsoleProps) {
  return (
    <div className="w-full min-w-0 space-y-10 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Platform Policies
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure system authentication rules, teacher publishing permissions, and monetization across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/audit-log">
            <Button variant="outline" size="default" className="h-10 px-4 gap-2 text-sm rounded-xl font-medium">
              <ScrollText className="size-4 text-muted-foreground" />
              <span>Audit Log</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Group 1: Verification & Access */}
      <div className="space-y-4">
        <div className="px-1 space-y-1">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Verification & Access
          </h2>
          <p className="text-sm text-muted-foreground">
            Account verification rules and instructor exam publishing permissions
          </p>
        </div>

        <div className="w-full rounded-2xl border border-border/70 bg-card shadow-2xs overflow-hidden">
          <VerificationSettings
            settings={settings}
            pendingTeacherCount={pendingTeacherCount}
          />
        </div>
      </div>

      {/* Group 2: Monetization & Billing */}
      <div className="space-y-4">
        <div className="px-1 space-y-1">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Monetization & Billing
          </h2>
          <p className="text-sm text-muted-foreground">
            Subscription engine, checkout workflows, and paid exam access controls
          </p>
        </div>

        <div className="w-full rounded-2xl border border-border/70 bg-card shadow-2xs overflow-hidden">
          <BillingModeSettings settings={settings} />
        </div>
      </div>
    </div>
  )
}
