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

      {/* ================= CLEAN SUSPEND ALERT DIALOG ================= */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border/80 bg-background/95 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl">
          <DialogHeader className="p-0 text-left">
            <DialogTitle className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Suspend Account
            </DialogTitle>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
              {userName} · <span className="text-foreground">{userEmail}</span>
            </p>
          </DialogHeader>

          <form action={suspendFormAction} className="flex flex-col gap-4 pt-1">
            <Field className="space-y-1">
              <Textarea
                id="reason"
                name="reason"
                rows={2}
                required
                placeholder="Reason for suspension (min 5 characters)..."
                className="h-16 rounded-2xl border border-border/70 bg-muted/30 focus-visible:bg-background text-sm font-medium resize-none shadow-2xs placeholder:text-muted-foreground/60 transition-all"
              />
            </Field>

            {suspendState && "error" in suspendState && (
              <FieldError className="text-xs font-semibold text-destructive">
                {suspendState.error}
              </FieldError>
            )}

            <DialogFooter className="mt-2 flex items-center justify-end gap-3 border-t border-border/40 pt-4 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 px-6 pb-6 sm:px-7 sm:pb-7 bg-muted/20 rounded-b-3xl">
              <Button
                type="button"
                variant="outline"
                className="h-11 sm:h-12 px-5 sm:px-6 rounded-2xl border border-border/70 text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-all"
                onClick={() => setSuspendOpen(false)}
                disabled={isSuspendPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="h-11 sm:h-12 px-6 sm:px-8 rounded-2xl text-sm font-bold shadow-sm cursor-pointer transition-all"
                disabled={isSuspendPending}
              >
                {isSuspendPending && <Spinner data-icon="inline-start" />}
                Suspend Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= CLEAN REINSTATE DIALOG ================= */}
      <Dialog open={reinstateOpen} onOpenChange={setReinstateOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border/80 bg-background/95 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl">
          <DialogHeader className="p-0 text-left">
            <DialogTitle className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Reinstate Account
            </DialogTitle>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
              Restore full platform access for <strong className="text-foreground">{userName}</strong>?
            </p>
          </DialogHeader>

          <form action={reinstateFormAction} className="flex flex-col gap-4 pt-1">
            {reinstateState && "error" in reinstateState && (
              <FieldError className="text-xs font-semibold text-destructive">
                {reinstateState.error}
              </FieldError>
            )}

            <DialogFooter className="mt-2 flex items-center justify-end gap-3 border-t border-border/40 pt-4 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 px-6 pb-6 sm:px-7 sm:pb-7 bg-muted/20 rounded-b-3xl">
              <Button
                type="button"
                variant="outline"
                className="h-11 sm:h-12 px-5 sm:px-6 rounded-2xl border border-border/70 text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-all"
                onClick={() => setReinstateOpen(false)}
                disabled={isReinstatePending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 sm:h-12 px-6 sm:px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm cursor-pointer transition-all"
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
