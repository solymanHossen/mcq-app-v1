"use client"

import * as React from "react"
import {
  Calendar,
  Check,
  Copy,
  Fingerprint,
  KeyRound,
  Shield,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Role } from "@/prisma/generated/prisma/client"

interface AccountDetailsCardProps {
  id: string
  role: Role
  createdAt: Date
  isEmailVerified: boolean
}

function getRoleDescription(role: Role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Full platform governance: role delegation, system configuration, revenue oversight, and security audits."
    case "ADMIN":
      return "Operational administration: user management, teacher verification, subscriptions, and exam monitoring."
    case "TEACHER":
      return "Educator permissions: create questions, author exams, grade subjective papers, and analyze student cohort performance."
    case "STUDENT":
    default:
      return "Student permissions: enroll in exams, practice question banks, earn streak & badges, and review mistake notebooks."
  }
}

function getRoleCapabilities(role: Role): string[] {
  switch (role) {
    case "SUPER_ADMIN":
      return [
        "System Governance",
        "User Delegation",
        "Security Auditing",
        "Revenue Oversight",
      ]
    case "ADMIN":
      return [
        "User Management",
        "Teacher Verification",
        "Exam Monitoring",
        "Platform Reports",
      ]
    case "TEACHER":
      return [
        "Exam Authoring",
        "Question Bank Vault",
        "Auto-grading",
        "Cohort Insights",
      ]
    case "STUDENT":
    default:
      return [
        "Timed Exam Attempts",
        "Mistake Notebook",
        "Leaderboards",
        "Streak & XP",
      ]
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
    toast.success("Account UUID copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const roleDesc = getRoleDescription(role)
  const capabilities = getRoleCapabilities(role)
  const createdDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt))

  return (
    <Card className="rounded-[24px] border border-border/80 shadow-xs transition-all duration-300 hover:shadow-md">
      <CardHeader className="space-y-1.5 pb-6">
        <CardTitle className="font-heading text-lg font-bold text-foreground sm:text-xl">
          Account Identity & Permissions
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground sm:text-[13px]">
          Detailed cryptographic identifier, role privileges, and authorization
          scopes.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Unique User ID Cryptographic Station */}
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center">
          <div className="min-w-0 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <Fingerprint className="size-3.5 text-primary" />
              Unique Identifier (UUID)
            </span>
            <code className="block font-mono text-xs font-semibold tracking-tight break-all text-foreground sm:text-[13px]">
              {id}
            </code>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            className="h-9 shrink-0 gap-1.5 self-start rounded-xl border-border/80 bg-background text-xs font-semibold shadow-2xs hover:border-primary/40 hover:bg-muted active:scale-95 sm:self-auto"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-primary" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-muted-foreground" />
                <span>Copy ID</span>
              </>
            )}
          </Button>
        </div>

        {/* Role Permissions Information */}
        <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-4.5 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Shield className="size-4 text-primary" />
              Role Authority Scope
            </span>
            <Badge
              variant="secondary"
              className="rounded-lg text-xs font-semibold capitalize"
            >
              {role.replace("_", " ").toLowerCase()}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {roleDesc}
          </p>

          {/* Capability Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {capabilities.map((cap) => (
              <span
                key={cap}
                className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                <Check className="size-2.5 text-primary" />
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Account Integrity Metadata (Strict Token Colors) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 rounded-2xl border border-border/70 bg-muted/20 p-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <UserCheck className="size-3.5 text-primary" />
              Registration Timestamp
            </span>
            <p className="text-xs font-semibold text-foreground sm:text-sm">
              {createdDate}
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-border/70 bg-muted/20 p-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Security Status
            </span>
            <p className="text-xs font-semibold text-foreground sm:text-sm">
              {isEmailVerified
                ? "Verified Credentials & Protected"
                : "Verification Pending"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
