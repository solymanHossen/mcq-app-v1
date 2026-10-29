"use client"

import * as React from "react"
import { Sparkles, ShieldAlert, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UpgradeGuestModal } from "./upgrade-guest-modal"

interface GuestBannerProps {
  name: string
  email: string
}

export function GuestBanner({ name, email }: GuestBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-background p-4 sm:p-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="size-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm">
                Guest Candidate Workspace
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Direct Link Access
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are signed in as <strong>{name}</strong> ({email}) via an exam link. You can only view assessments shared directly with you.
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <UpgradeGuestModal
            name={name}
            email={email}
            trigger={
              <Button size="sm" className="w-full sm:w-auto gap-1.5 shadow-sm font-semibold rounded-xl text-xs h-9">
                <Sparkles className="size-3.5" />
                <span>Activate Full Account</span>
                <ArrowRight className="size-3.5" />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}
