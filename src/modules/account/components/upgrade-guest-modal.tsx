"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import {
  UserCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  upgradeGuestAccountAction,
  type UpgradeGuestState,
} from "@/modules/auth/guest-actions"

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
  const [state, formAction, isPending] = useActionState<
    UpgradeGuestState,
    FormData
  >(upgradeGuestAccountAction, {})

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
      <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-1.25rem)] flex-col gap-0 overflow-hidden rounded-2xl border border-border/80 p-0 shadow-2xl sm:max-h-[90dvh] sm:w-full sm:max-w-md sm:rounded-3xl">
        <DialogHeader className="shrink-0 gap-3 border-b border-border/60 bg-muted/20 p-3.5 pr-10 text-left sm:p-6 sm:pr-12">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCheck className="size-5 text-primary" />
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-xs text-amber-600"
            >
              Guest Candidate
            </Badge>
          </div>
          <DialogTitle className="text-base leading-snug font-bold tracking-tight sm:text-2xl">
            Activate Full Student Account
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed wrap-anywhere text-muted-foreground sm:text-sm">
            Hi <strong className="text-foreground">{name}</strong> ({email}),
            set a password to save your exam history permanently and unlock all
            practice tests, mistake notebook, and leaderboards.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto p-3.5 sm:p-6">
          {state.success ? (
            <div
              role="status"
              className="flex flex-col items-center justify-center gap-3 py-6 text-center"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-foreground">
                  Account Activated!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Your guest profile is now a permanent student account.
                  Refreshing workspace...
                </p>
              </div>
            </div>
          ) : (
            <form action={formAction} aria-busy={isPending}>
              <FieldGroup className="gap-5 sm:gap-6">
                {state.error && (
                  <Alert
                    variant="destructive"
                    className="rounded-2xl border-destructive/30 shadow-xs"
                  >
                    <AlertCircle />
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <FieldLabel
                    htmlFor="upgrade-password"
                    className="text-sm font-semibold text-foreground sm:text-base"
                  >
                    New Password
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      id="upgrade-password"
                      name="password"
                      type="password"
                      placeholder="Create a password (min 8 chars)"
                      className="pl-9"
                      required
                      minLength={8}
                      disabled={isPending}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="upgrade-confirm-password"
                    className="text-sm font-semibold text-foreground sm:text-base"
                  >
                    Confirm Password
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      id="upgrade-confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      className="pl-9"
                      required
                      minLength={8}
                      disabled={isPending}
                    />
                  </div>
                </Field>

                <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full rounded-xl font-semibold sm:w-auto"
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-xl font-bold shadow-sm sm:flex-1"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2
                          data-icon="inline-start"
                          className="animate-spin"
                        />
                        <span>Activating...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate Account</span>
                        <ArrowRight data-icon="inline-end" />
                      </>
                    )}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
