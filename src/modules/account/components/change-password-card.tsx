"use client"

import { cn } from "@/lib/utils"

import { useState, useTransition } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { Eye, EyeOff, KeyRound, ShieldAlert } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { changePasswordAction } from "@/modules/account/actions"

export function ChangePasswordCard({
  className,
  variant = "default",
}: { className?: string; variant?: "default" | "outlined" } = {}) {
  const FormInput = variant === "outlined" ? Input : "input"
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
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all sm:p-8 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between pb-6">
          <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
            Change Security Password
          </h3>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-4.5" />
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Current Password */}
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm"
              >
                Current Password
              </Label>
              <div className="relative">
                <FormInput
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                  className="h-13.5 w-full rounded-2xl bg-muted/60 px-4.5 pr-12 text-base font-medium text-foreground transition-all duration-200 placeholder:text-muted-foreground/50 hover:bg-muted/80 focus:bg-background focus:ring-2 focus:ring-primary/25 focus:outline-none sm:h-14 sm:px-5"
                  placeholder="Enter existing password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 p-1.5 text-muted-foreground transition-colors hover:text-foreground"
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
                className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm"
              >
                New Password
              </Label>
              <div className="relative">
                <FormInput
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  required
                  className="h-13.5 w-full rounded-2xl bg-muted/60 px-4.5 pr-12 text-base font-medium text-foreground transition-all duration-200 placeholder:text-muted-foreground/50 hover:bg-muted/80 focus:bg-background focus:ring-2 focus:ring-primary/25 focus:outline-none sm:h-14 sm:px-5"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 p-1.5 text-muted-foreground transition-colors hover:text-foreground"
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
                className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <FormInput
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  required
                  className="h-13.5 w-full rounded-2xl bg-muted/60 px-4.5 pr-12 text-base font-medium text-foreground transition-all duration-200 placeholder:text-muted-foreground/50 hover:bg-muted/80 focus:bg-background focus:ring-2 focus:ring-primary/25 focus:outline-none sm:h-14 sm:px-5"
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 p-1.5 text-muted-foreground transition-colors hover:text-foreground"
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
            <div className="space-y-1.5 rounded-2xl bg-muted/60 p-3.5 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={
                    isLongEnough
                      ? "font-semibold text-primary"
                      : "text-muted-foreground"
                  }
                >
                  {isLongEnough ? "✓" : "○"} At least 8 characters
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span
                  className={
                    passwordsMatch
                      ? "font-semibold text-primary"
                      : "text-muted-foreground"
                  }
                >
                  {passwordsMatch
                    ? "✓ Passwords match"
                    : "○ Passwords must match"}
                </span>
              </div>
            </div>

            {/* Session Invalidation Warning */}
            <div className="flex items-start gap-3 rounded-2xl bg-destructive/10 p-3.5 text-xs text-muted-foreground">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="leading-relaxed">
                Upon successful password update, all active sessions on every
                connected device will be immediately terminated for your safety.
              </p>
            </div>
          </div>

          {/* Seamless Integrated Action Bar */}
          <div className="flex items-center justify-end pt-4">
            <Button
              type="submit"
              disabled={!passwordsMatch || !isLongEnough || isPending}
              className="h-11 cursor-pointer rounded-xl px-7 text-sm font-semibold shadow-none transition-all duration-200 active:scale-95 sm:h-12"
            >
              {isPending && <Spinner data-icon="inline-start" />}
              Update Password & Sign Out Everywhere
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
