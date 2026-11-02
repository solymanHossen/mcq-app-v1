"use client"

import { cn } from "@/lib/utils"
import { useState, useTransition } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { Eye, EyeOff, KeyRound, ShieldAlert, CheckCircle2, Lock } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { changePasswordAction } from "@/modules/account/actions"

export function ChangePasswordCard({
  className,
  variant,
}: { className?: string; variant?: "default" | "outlined" } = {}) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword
  const isLongEnough = newPassword.length >= 8

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!passwordsMatch) {
      toast.error("New passwords do not match")
      return
    }

    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      })
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      toast.success("Password updated — signing out all devices for security")
      await signOut({ callbackUrl: "/login?passwordChanged=true" })
    })
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden",
        className
      )}
    >
      {/* Master Reference Card Header */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-amber-500/20">
            <KeyRound className="size-4.5 sm:size-5.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
              Change Security Password
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
              Update your account password and security credentials
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-muted-foreground self-start sm:self-auto"
        >
          Security Credential
        </Badge>
      </div>

      <div className="p-4 sm:p-6 lg:p-7">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label
              htmlFor="currentPassword"
              className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5"
            >
              <span>Current Password</span>
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl pr-11"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5"
            >
              <span>New Password</span>
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                required
                className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5"
            >
              <span>Confirm New Password</span>
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
                className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl pr-11"
                placeholder="Repeat new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Realtime Password Integrity Meter */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-3.5 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "flex items-center gap-1.5 font-medium transition-colors",
                  isLongEnough
                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                )}
              >
                <CheckCircle2 className={cn("size-3.5", isLongEnough ? "text-emerald-600 dark:text-emerald-400" : "opacity-40")} />
                <span>At least 8 characters</span>
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span
                className={cn(
                  "flex items-center gap-1.5 font-medium transition-colors",
                  passwordsMatch
                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                )}
              >
                <CheckCircle2 className={cn("size-3.5", passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "opacity-40")} />
                <span>Passwords match</span>
              </span>
            </div>
          </div>

          {/* Session Invalidation Warning Notice */}
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 sm:p-4 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="leading-relaxed">
              Upon successful password update, all active sessions on every connected device will be immediately terminated for your safety.
            </p>
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-end pt-2 border-t border-border/50">
            <Button
              type="submit"
              disabled={!passwordsMatch || !isLongEnough || isPending}
              className="h-11 sm:h-12 px-6 rounded-xl font-bold shadow-xs transition-all active:scale-95 w-full sm:w-auto"
            >
              {isPending && <Spinner data-icon="inline-start" />}
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
