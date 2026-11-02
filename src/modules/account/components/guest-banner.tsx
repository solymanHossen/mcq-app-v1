"use client"

import * as React from "react"
import { UserCheck, ShieldAlert, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { UpgradeGuestModal } from "./upgrade-guest-modal"

interface GuestBannerProps {
  name: string
  email: string
}

export function GuestBanner({ name, email }: GuestBannerProps) {
  return (
    <Alert className="rounded-2xl border-border/70 bg-card p-4 shadow-xs sm:p-6 lg:p-7">
      <div className="flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-start gap-3 sm:gap-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shadow-2xs ring-1 ring-amber-500/20 sm:size-11 sm:rounded-2xl dark:text-amber-400">
            <ShieldAlert className="size-5" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold tracking-tight text-foreground sm:text-xl">
                Guest Candidate Workspace
              </span>
              <Badge
                variant="outline"
                className="rounded-full border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 sm:text-xs dark:text-amber-400"
              >
                Direct Link Access
              </Badge>
            </div>
            <p className="text-xs leading-relaxed wrap-anywhere text-muted-foreground sm:text-sm">
              You are signed in as <strong>{name}</strong> ({email}) via an exam
              link. You can only view assessments shared directly with you.
            </p>
          </div>
        </div>

        <div className="w-full shrink-0 sm:w-auto">
          <UpgradeGuestModal
            name={name}
            email={email}
            trigger={
              <Button
                size="lg"
                className="w-full rounded-xl font-bold shadow-sm sm:w-auto"
              >
                <UserCheck data-icon="inline-start" />
                <span>Activate Full Account</span>
                <ArrowRight data-icon="inline-end" />
              </Button>
            }
          />
        </div>
      </div>
    </Alert>
  )
}
