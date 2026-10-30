"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { UserCheck, Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { upgradeGuestAccountAction, type UpgradeGuestState } from "@/modules/auth/guest-actions"

interface UpgradeGuestModalProps {
  email: string
  name: string
  trigger?: React.ReactNode
  defaultOpen?: boolean
}

export function UpgradeGuestModal({
  email,
  name,
  trigger,
  defaultOpen = false,
}: UpgradeGuestModalProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<UpgradeGuestState, FormData>(
    upgradeGuestAccountAction,
    {}
  )

  React.useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        setOpen(false)
        router.refresh()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state.success, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck className="size-5 text-primary" />
            </div>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
              Guest Candidate
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Activate Full Student Account
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Hi <strong className="text-foreground">{name}</strong> ({email}), set a password to save your exam history permanently and unlock all practice tests, mistake notebook, and leaderboards.
          </DialogDescription>
        </DialogHeader>

        {state.success ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground text-base">Account Activated!</h4>
              <p className="text-xs text-muted-foreground">
                Your guest profile is now a permanent student account. Refreshing workspace...
              </p>
            </div>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 pt-2">
            {state.error && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="upgrade-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="upgrade-password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="pl-9 h-10"
                  required
                  minLength={8}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upgrade-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="upgrade-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  className="pl-9 h-10"
                  required
                  minLength={8}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:flex-1 gap-2 shadow-sm font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Activating...</span>
                  </>
                ) : (
                  <>
                    <span>Activate Account</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
