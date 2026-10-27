"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  Check,
  Crown,
  GraduationCap,
  Lock,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { updateProfileNameAction } from "@/modules/account/actions"

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function formatRole(role: string) {
  const normalized = role.toUpperCase()
  switch (normalized) {
    case "SUPER_ADMIN":
      return { label: "Super Admin", icon: Crown }
    case "ADMIN":
      return { label: "Admin", icon: ShieldCheck }
    case "TEACHER":
      return { label: "Teacher", icon: GraduationCap }
    case "STUDENT":
    default:
      return { label: "Student", icon: UserIcon }
  }
}

export function ProfileCard({
  name,
  email,
  role,
  joinedAt,
  lastLoginAt,
}: {
  name: string
  email: string
  role: string
  joinedAt: string
  lastLoginAt: string | null
}) {
  const [value, setValue] = useState(name)
  const [isPending, startTransition] = useTransition()
  const dirty = value.trim().length > 0 && value.trim() !== name
  const roleInfo = formatRole(role)
  const RoleIcon = roleInfo.icon

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const result = await updateProfileNameAction(value.trim())
      if ("error" in result) {
        toast.error(result.error)
      } else {
        toast.success("Profile updated successfully")
      }
    })
  }

  return (
    <Card className="rounded-[24px] border border-border/80 shadow-xs transition-all duration-300 hover:shadow-md">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Avatar className="size-13 border-2 border-primary/20 shadow-xs sm:size-14">
              <AvatarFallback className="bg-primary/10 font-heading text-lg font-bold text-primary sm:text-xl">
                {initials(value || name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-heading text-lg font-bold text-foreground sm:text-xl">
                Personal Identity
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground sm:text-[13px]">
                Public profile name shown on exams, certificates, and
                leaderboards.
              </CardDescription>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold sm:inline-flex"
          >
            <RoleIcon className="size-3 text-primary" />
            <span>{roleInfo.label}</span>
          </Badge>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {/* Full Name Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-foreground"
              >
                Display Name
              </Label>
              <span className="font-mono text-xs text-muted-foreground">
                {value.length}/100
              </span>
            </div>
            <Input
              id="name"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              minLength={2}
              maxLength={100}
              required
              className="h-12 rounded-xl border-border/80 bg-background/50 px-4 text-base font-medium transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
              placeholder="Your full legal or preferred name"
            />
            <p className="text-xs text-muted-foreground">
              Shown to educators, proctors, and cohort peers.
            </p>
          </div>

          {/* Email (Immutable / Managed by Auth) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-foreground"
              >
                Email Address
              </Label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                <Lock className="size-3" />
                Immutable
              </span>
            </div>
            <Input
              id="email"
              value={email}
              disabled
              readOnly
              className="h-12 cursor-not-allowed rounded-xl border-border/80 bg-muted/40 px-4 font-mono text-sm text-muted-foreground select-all"
            />
            <p className="text-xs text-muted-foreground">
              Primary credential tied to login authentication and grade
              notifications.
            </p>
          </div>

          {/* Metadata pill */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Account Longevity:
            </span>{" "}
            Member since {joinedAt}
            {lastLoginAt && <> · Last session verified on {lastLoginAt}</>}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 pt-5">
          <span className="text-xs text-muted-foreground">
            {dirty ? (
              <span className="font-semibold text-primary">
                Unsaved changes pending
              </span>
            ) : (
              "Up to date"
            )}
          </span>

          <Button
            type="submit"
            disabled={!dirty || isPending}
            className="h-11 rounded-xl px-6 text-sm font-semibold shadow-xs transition-all duration-200 active:scale-95"
          >
            {isPending && <Spinner data-icon="inline-start" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
