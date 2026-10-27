"use client"

import * as React from "react"
import {
  Check,
  Copy,
  Fingerprint,
  KeyRound,
  Shield,
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

  const roleDesc = getRoleDescription(role)
  const createdDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(createdAt))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Account Identity & Permissions
        </CardTitle>
        <CardDescription>
          Detailed account identifier, role specifications, and access scopes.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Unique User ID */}
        <div className="flex flex-col justify-between gap-2 rounded-xl border border-border/70 bg-muted/30 p-3.5 sm:flex-row sm:items-center">
          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Fingerprint className="size-3.5" />
              Unique Identifier (UUID)
            </span>
            <code className="font-mono text-xs font-medium break-all text-foreground">
              {id}
            </code>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            className="h-8 shrink-0 gap-1.5 self-start text-xs sm:self-auto"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </Button>
        </div>

        {/* Role Permissions Information */}
        <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Shield className="size-3.5 text-primary" />
              Role Scope
            </span>
            <Badge variant="secondary" className="text-[11px] capitalize">
              {role.replace("_", " ").toLowerCase()}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {roleDesc}
          </p>
        </div>

        {/* Account Integrity Metadata */}
        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <div className="space-y-1 rounded-xl border border-border/60 bg-muted/20 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <UserCheck className="size-3.5 text-emerald-500" />
              Registration Timestamp
            </span>
            <p className="text-xs font-medium text-foreground">{createdDate}</p>
          </div>

          <div className="space-y-1 rounded-xl border border-border/60 bg-muted/20 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <KeyRound className="size-3.5 text-amber-500" />
              Security Status
            </span>
            <p className="text-xs font-medium text-foreground">
              {isEmailVerified
                ? "Verified credentials"
                : "Verification pending"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
