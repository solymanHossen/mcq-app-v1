"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"
import { Ban, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { suspendUserAction, reinstateUserAction } from "@/modules/users/actions"

export function UserRowActions({
  userId,
  userName,
  userEmail,
  isActive,
  isAdmin,
}: {
  userId: string
  userName: string
  userEmail: string
  isActive: boolean
  isAdmin: boolean
}) {
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [reinstateOpen, setReinstateOpen] = useState(false)

  const [suspendState, suspendFormAction, isSuspendPending] = useActionState(
    async (
      _state: Awaited<ReturnType<typeof suspendUserAction>> | undefined,
      formData: FormData
    ) => {
      const result = await suspendUserAction(userId, _state, formData)
      if ("success" in result) {
        setSuspendOpen(false)
        toast.success(`Account for ${userName} suspended`)
      } else if ("error" in result) {
        toast.error(result.error)
      }
      return result
    },
    undefined
  )

  const [reinstateState, reinstateFormAction, isReinstatePending] = useActionState(
    async () => {
      const result = await reinstateUserAction(userId)
      if ("success" in result) {
        setReinstateOpen(false)
        toast.success(`Account for ${userName} reinstated`)
      } else if ("error" in result) {
        toast.error(result.error)
      }
      return result
    },
    undefined
  )

  if (isAdmin) {
    return (
      <span
        className="inline-flex items-center text-xs text-muted-foreground font-medium px-2 py-1 rounded-lg bg-muted/40 border border-border/50"
        title="Admin-tier accounts cannot be modified from user directory"
      >
        Protected
      </span>
    )
  }

  return (
    <>
      {isActive ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setSuspendOpen(true)}
          className="h-8.5 rounded-xl border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/15 hover:border-destructive/60 shadow-2xs text-xs font-semibold gap-1.5 transition-all cursor-pointer"
        >
          <Ban className="size-3.5" />
          <span>Suspend</span>
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setReinstateOpen(true)}
          className="h-8.5 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-500/60 shadow-2xs text-xs font-semibold gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          <span>Reinstate</span>
        </Button>
      )}

      {/* ================= MASTER REFERENCE SUSPEND ALERT DIALOG ================= */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[calc(100vw-1.25rem)] sm:w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90dvh] flex flex-col p-0 gap-0 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden bg-background"
        >
          <DialogHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/60 bg-muted/20 shrink-0 text-left">
            <div className="flex items-center gap-3 pr-6">
              <div className="size-10 sm:size-11 rounded-xl sm:rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 ring-1 ring-destructive/20 shadow-xs">
                <Ban className="size-5 sm:size-5.5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-heading text-base sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                  Suspend Account
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  {userName} · <span className="font-medium text-foreground">{userEmail}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form action={suspendFormAction} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-5 space-y-3.5 text-sm overflow-y-auto flex-1">
              <Field className="space-y-1.5">
                <label htmlFor="suspend-reason" className="text-xs font-semibold text-foreground">
                  Reason for Suspension <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="suspend-reason"
                  name="reason"
                  rows={2}
                  required
                  placeholder="Reason for suspension (min 5 characters)..."
                  className="min-h-16 rounded-xl border border-border/70 bg-muted/20 focus-visible:bg-background text-xs sm:text-sm font-medium resize-none shadow-2xs placeholder:text-muted-foreground/60 transition-all"
                />
              </Field>

              {suspendState && "error" in suspendState && (
                <FieldError className="text-xs font-semibold text-destructive">
                  {suspendState.error}
                </FieldError>
              )}
            </div>

            <DialogFooter className="px-5 sm:px-6 py-4 sm:py-4.5 border-t border-border/60 bg-muted/20 shrink-0 flex flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-4.5 rounded-xl border border-border/70 text-xs sm:text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-all"
                onClick={() => setSuspendOpen(false)}
                disabled={isSuspendPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="h-10 px-5.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all"
                disabled={isSuspendPending}
              >
                {isSuspendPending && <Spinner data-icon="inline-start" />}
                Suspend Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MASTER REFERENCE REINSTATE DIALOG ================= */}
      <Dialog open={reinstateOpen} onOpenChange={setReinstateOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[calc(100vw-1.25rem)] sm:w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90dvh] flex flex-col p-0 gap-0 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden bg-background"
        >
          <DialogHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/60 bg-muted/20 shrink-0 text-left">
            <div className="flex items-center gap-3 pr-6">
              <div className="size-10 sm:size-11 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/20 shadow-xs">
                <RotateCcw className="size-5 sm:size-5.5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-heading text-base sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                  Reinstate Account
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  Restore access for <strong className="text-foreground">{userName}</strong>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form action={reinstateFormAction} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-5 space-y-3.5 text-sm overflow-y-auto flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Reinstating this account will immediately reactivate authentication, assessment authoring, and platform access for this user.
              </p>

              {reinstateState && "error" in reinstateState && (
                <FieldError className="text-xs font-semibold text-destructive">
                  {reinstateState.error}
                </FieldError>
              )}
            </div>

            <DialogFooter className="px-5 sm:px-6 py-4 sm:py-4.5 border-t border-border/60 bg-muted/20 shrink-0 flex flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-4.5 rounded-xl border border-border/70 text-xs sm:text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-all"
                onClick={() => setReinstateOpen(false)}
                disabled={isReinstatePending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 px-5.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all"
                disabled={isReinstatePending}
              >
                {isReinstatePending && <Spinner data-icon="inline-start" />}
                Confirm Reinstate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
