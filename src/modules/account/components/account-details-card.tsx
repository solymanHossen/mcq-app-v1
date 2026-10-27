"use client"

import * as React from "react"
import {
  Calendar,
  Check,
  Copy,
  Fingerprint,
  MailCheck,
  Shield,
  ShieldAlert,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Role } from "@/prisma/generated/prisma/client"

interface AccountDetailsCardProps {
  id: string
  role: Role
  createdAt: Date
  isEmailVerified: boolean
}

function getRoleTitle(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Administrator"
    case "ADMIN":
      return "Administrator"
    case "TEACHER":
      return "Educator & Instructor"
    case "STUDENT":
    default:
      return "Student Scholar"
  }
}

export function AccountDetailsCard({
  id,
  role,
  createdAt,
  isEmailVerified,
}: AccountDetailsCardProps) {
  const [copied, setCopied] = React.useState(false)

  function handleCopyId() {
    navigator.clipboard.writeText(id)
    setCopied(true)
    toast.success("Account ID copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const createdDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(createdAt))

  return (
    <div className="relative flex flex-col justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all sm:p-8 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <div>
        <div className="pb-6">
          <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
            Account Credentials
          </h3>
        </div>

        <div className="space-y-5">
          {/* User ID Field (Teacher Directory style soft box, no harsh border) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm">
              Account ID (UUID)
            </Label>
            <div className="flex h-13.5 w-full items-center justify-between gap-3 rounded-2xl bg-muted/30 px-5 transition-all hover:bg-muted/50 sm:h-14">
              <code className="truncate font-mono text-xs font-semibold text-foreground sm:text-sm select-all">
                {id}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                className="h-9 shrink-0 gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-primary" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Role Field (Teacher Directory style soft box) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm">
              Authority Level
            </Label>
            <div className="flex h-13.5 w-full items-center justify-between rounded-2xl bg-muted/30 px-5 transition-all hover:bg-muted/50 sm:h-14">
              <span className="text-sm font-semibold text-foreground sm:text-base">
                {getRoleTitle(role)}
              </span>
              <Badge
                variant="secondary"
                className="rounded-lg px-2.5 py-1 text-xs font-semibold capitalize"
              >
                <Shield className="mr-1 size-3 text-primary" />
                {role.replace("_", " ").toLowerCase()}
              </Badge>
            </div>
          </div>

          {/* Email Verification Status Field (Teacher Directory style soft box) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm">
              Security & Verification
            </Label>
            <div className="flex h-13.5 w-full items-center justify-between rounded-2xl bg-muted/30 px-5 transition-all hover:bg-muted/50 sm:h-14">
              <span className="text-sm font-semibold text-foreground sm:text-base">
                {isEmailVerified ? "Email Address Verified" : "Verification Required"}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                  isEmailVerified
                    ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                )}
              >
                {isEmailVerified ? (
                  <>
                    <MailCheck className="size-3.5" />
                    Verified
                  </>
                ) : (
                  <>
                    <ShieldAlert className="size-3.5" />
                    Pending
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Member Since Field (Teacher Directory style soft box) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm">
              Member Since
            </Label>
            <div className="flex h-13.5 w-full items-center justify-between rounded-2xl bg-muted/30 px-5 transition-all hover:bg-muted/50 sm:h-14">
              <span className="text-sm font-semibold text-foreground sm:text-base">
                {createdDate}
              </span>
              <Calendar className="size-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
