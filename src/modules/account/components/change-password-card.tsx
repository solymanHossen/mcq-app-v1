"use client"

import { useState, useTransition } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
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
import { Spinner } from "@/components/ui/spinner"
import { changePasswordAction } from "@/modules/account/actions"

export function ChangePasswordCard() {
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
    <Card className="rounded-[24px] border border-border/80 shadow-xs transition-all duration-300 hover:shadow-md">
      <CardHeader className="space-y-1.5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-lg font-bold text-foreground sm:text-xl">
              Change Security Password
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground sm:text-[13px]">
              Update your account password with instant session revocation
              across untrusted devices.
            </CardDescription>
          </div>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-4.5" />
          </span>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {/* Current Password */}
          <div className="space-y-2">
            <Label
              htmlFor="currentPassword"
              className="text-sm font-semibold text-foreground"
            >
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                className="h-12 rounded-xl border-border/80 bg-background/50 pr-11 text-base font-medium focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your existing password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
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
              className="text-sm font-semibold text-foreground"
            >
              New Password
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
                className="h-12 rounded-xl border-border/80 bg-background/50 pr-11 text-base font-medium focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
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
              className="text-sm font-semibold text-foreground"
            >
              Confirm New Password
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
                className="h-12 rounded-xl border-border/80 bg-background/50 pr-11 text-base font-medium focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                placeholder="Repeat new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
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
          <div className="space-y-1.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs">
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
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="leading-relaxed">
              Upon successful password update, all active sessions on every
              connected device will be immediately terminated for your safety.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end border-t border-border/60 pt-5">
          <Button
            type="submit"
            disabled={!passwordsMatch || !isLongEnough || isPending}
            className="h-11 rounded-xl px-6 text-sm font-semibold shadow-xs transition-all duration-200 active:scale-95"
          >
            {isPending && <Spinner data-icon="inline-start" />}
            Update Password & Sign Out Everywhere
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
