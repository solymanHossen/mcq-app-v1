"use client"

import * as React from "react"
import Link from "next/link"
import { ScrollText, ShieldCheck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/shared/admin-page-header"
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
    <div className="w-full min-w-0 space-y-8 sm:space-y-10 pb-16">
      {/* Master Reference Admin Page Header */}
      <AdminPageHeader
        title="Platform Policies"
        description="Configure system authentication rules, teacher publishing permissions, and monetization across the platform."
        actions={
          <Link href="/admin/audit-log">
            <Button
              variant="outline"
              className="h-10 px-4 gap-2 text-xs sm:text-sm rounded-xl font-medium cursor-pointer border-border/80 hover:bg-muted/70 transition-all"
            >
              <ScrollText className="size-4 text-muted-foreground" />
              <span>Audit Log</span>
            </Button>
          </Link>
        }
      />

      {/* Group 1: Verification & Access */}
      <div className="space-y-3.5">
        <div className="rounded-2xl border border-border/70 bg-card shadow-2xs overflow-hidden">
          <div className="px-5 sm:px-6 py-4 sm:py-4.5 border-b border-border/60 bg-muted/20 flex items-center gap-3">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
              <ShieldCheck className="size-4.5 sm:size-5" />
            </div>
            <div>
              <h2 className="font-heading text-sm sm:text-base font-bold text-foreground">
                Verification & Access
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Account verification rules and instructor exam publishing permissions
              </p>
            </div>
          </div>
          <VerificationSettings
            settings={settings}
            pendingTeacherCount={pendingTeacherCount}
          />
        </div>
      </div>

      {/* Group 2: Monetization & Billing */}
      <div className="space-y-3.5">
        <div className="rounded-2xl border border-border/70 bg-card shadow-2xs overflow-hidden">
          <div className="px-5 sm:px-6 py-4 sm:py-4.5 border-b border-border/60 bg-muted/20 flex items-center gap-3">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <CreditCard className="size-4.5 sm:size-5" />
            </div>
            <div>
              <h2 className="font-heading text-sm sm:text-base font-bold text-foreground">
                Monetization & Billing
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Subscription engine, checkout workflows, and paid exam access controls
              </p>
            </div>
          </div>
          <BillingModeSettings settings={settings} />
        </div>
      </div>
    </div>
  )
}
