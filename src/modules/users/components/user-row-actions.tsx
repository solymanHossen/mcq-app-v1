"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"
import { AlertTriangle, Ban, CheckCircle2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
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
        toast.success(`Account for ${userName} has been suspended`, {
          description: "All active sessions were revoked immediately.",
        })
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
        toast.success(`Account for ${userName} has been reinstated`, {
          description: "The user may now sign in and access the platform.",
        })
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

      {/* ================= SUSPENSION CONFIRMATION ALERT DIALOG ================= */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border/80 bg-background/95 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-2xs">
              <AlertTriangle className="size-6" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <DialogHeader className="p-0 text-left">
                <DialogTitle className="font-heading text-lg font-bold text-foreground">
                  Suspend User Account
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                  Are you sure you want to suspend{" "}
                  <strong className="text-foreground font-semibold">{userName}</strong> (
                  <span className="text-muted-foreground">{userEmail}</span>)?
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive/90 space-y-1">
            <p className="font-bold">Immediate System Consequences:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-destructive/80">
              <li>All active user device sessions will be revoked instantly.</li>
              <li>Future login attempts will be strictly denied.</li>
              <li>This action is permanently recorded in the system audit log.</li>
            </ul>
          </div>

          <form action={suspendFormAction} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="reason" className="text-xs font-semibold text-foreground">
                Reason for Suspension (Required)
              </FieldLabel>
              <Textarea
                id="reason"
                name="reason"
                rows={3}
                required
                placeholder="Document the exact policy violation or operational reason (min 5 characters)..."
                className="rounded-xl border border-border/70 bg-muted/30 focus-visible:bg-background text-xs sm:text-sm resize-none shadow-2xs"
              />
            </Field>

            {suspendState && "error" in suspendState && (
              <FieldError className="text-xs font-semibold text-destructive">
                {suspendState.error}
              </FieldError>
            )}

            <DialogFooter className="mt-2 flex items-center justify-end gap-2 border-t border-border/40 pt-4 -mx-6 -mb-6 px-6 pb-6 bg-muted/20 rounded-b-3xl">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border border-border/70 text-xs font-semibold cursor-pointer"
                onClick={() => setSuspendOpen(false)}
                disabled={isSuspendPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                disabled={isSuspendPending}
              >
                {isSuspendPending && <Spinner data-icon="inline-start" />}
                Yes, Suspend Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= REINSTATE CONFIRMATION DIALOG ================= */}
      <Dialog open={reinstateOpen} onOpenChange={setReinstateOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border/80 bg-background/95 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <CheckCircle2 className="size-6" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <DialogHeader className="p-0 text-left">
                <DialogTitle className="font-heading text-lg font-bold text-foreground">
                  Reinstate User Account
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                  Confirm restoring full platform privileges for{" "}
                  <strong className="text-foreground font-semibold">{userName}</strong> (
                  <span className="text-muted-foreground">{userEmail}</span>).
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-800 dark:text-emerald-200">
            <p className="font-bold">Restoration Details:</p>
            <p className="mt-0.5 text-emerald-700/90 dark:text-emerald-300/90">
              The user will immediately be able to sign in, take examinations, and participate on the platform.
            </p>
          </div>

          <form action={reinstateFormAction} className="flex flex-col gap-4">
            {reinstateState && "error" in reinstateState && (
              <FieldError className="text-xs font-semibold text-destructive">
                {reinstateState.error}
              </FieldError>
            )}

            <DialogFooter className="mt-2 flex items-center justify-end gap-2 border-t border-border/40 pt-4 -mx-6 -mb-6 px-6 pb-6 bg-muted/20 rounded-b-3xl">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border border-border/70 text-xs font-semibold cursor-pointer"
                onClick={() => setReinstateOpen(false)}
                disabled={isReinstatePending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                disabled={isReinstatePending}
              >
                {isReinstatePending && <Spinner data-icon="inline-start" />}
                Confirm Reinstatement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
