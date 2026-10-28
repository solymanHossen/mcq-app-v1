"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"
import {
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { verifyTeacherAction, rejectTeacherAction } from "@/modules/users/actions"

export function TeacherVerificationRow({
  userId,
  teacherName,
  teacherEmail,
}: {
  userId: string
  teacherName?: string
  teacherEmail?: string
}) {
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  const [verifyState, verifyFormAction, isVerifyPending] = useActionState(
    async (
      _state: Awaited<ReturnType<typeof verifyTeacherAction>> | undefined,
      formData: FormData
    ) => {
      const result = await verifyTeacherAction(userId, _state, formData)
      if ("success" in result) {
        setVerifyOpen(false)
        toast.success(
          teacherName
            ? `Faculty accreditation for ${teacherName} approved`
            : "Faculty accreditation approved successfully"
        )
      } else if ("error" in result) {
        toast.error(result.error)
      }
      return result
    },
    undefined
  )

  const [rejectState, rejectFormAction, isRejectPending] = useActionState(
    async (
      _state: Awaited<ReturnType<typeof rejectTeacherAction>> | undefined,
      formData: FormData
    ) => {
      const result = await rejectTeacherAction(userId, _state, formData)
      if ("success" in result) {
        setRejectOpen(false)
        toast.success(
          teacherName
            ? `Accreditation request for ${teacherName} rejected`
            : "Accreditation request rejected"
        )
      } else if ("error" in result) {
        toast.error(result.error)
      }
      return result
    },
    undefined
  )

  return (
    <>
      {/* Action Trigger Buttons in Row */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={() => setVerifyOpen(true)}
          className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] gap-2 cursor-pointer text-sm"
        >
          <UserCheck className="size-4.5 shrink-0" />
          <span>Verify</span>
        </Button>
        <Button
          type="button"
          onClick={() => setRejectOpen(true)}
          variant="outline"
          className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl font-semibold border-rose-200 dark:border-rose-900/60 bg-rose-50/90 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 shadow-xs hover:shadow-sm transition-all duration-200 active:scale-[0.98] gap-2 cursor-pointer text-sm"
        >
          <UserX className="size-4.5 shrink-0" />
          <span>Reject</span>
        </Button>
      </div>

      {/* World-Class Approve Verification Dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl sm:rounded-3xl border border-border/80 bg-popover/98 backdrop-blur-xl shadow-2xl">
          <form action={verifyFormAction} className="flex flex-col gap-5">
            <DialogHeader className="gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs">
                  <UserCheck className="size-6" />
                </div>
                <div>
                  <DialogTitle className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    Approve Faculty Accreditation
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Grant educator privileges to author and publish assessments.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Teacher Snapshot Card */}
            {teacherName && (
              <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-sm border border-emerald-500/30">
                  {teacherName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold text-foreground truncate">
                      {teacherName}
                    </span>
                    <Badge
                      variant="outline"
                      className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 text-[10px] font-semibold px-2 py-0.2 gap-1"
                    >
                      <Clock className="size-2.5" />
                      <span>Pending</span>
                    </Badge>
                  </div>
                  {teacherEmail && (
                    <p className="text-xs text-muted-foreground truncate">{teacherEmail}</p>
                  )}
                </div>
              </div>
            )}

            {/* Internal Note Field */}
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Internal Verification Note (Optional)
              </FieldLabel>
              <Textarea
                name="note"
                rows={3}
                placeholder="e.g. Verified university faculty badge and departmental credentials..."
                className="rounded-xl border-border/80 bg-background/80 p-3 text-sm shadow-2xs resize-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-all"
              />
              {verifyState && "error" in verifyState && (
                <FieldError>{verifyState.error}</FieldError>
              )}
            </Field>

            <DialogFooter className="mt-2 flex-row justify-end gap-2.5 border-t border-border/60 pt-4 -mx-6 -mb-6 px-6 pb-6 bg-muted/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVerifyOpen(false)}
                disabled={isVerifyPending}
                className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-medium border-border/70 text-xs sm:text-sm cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isVerifyPending}
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 gap-2 cursor-pointer text-xs sm:text-sm"
              >
                {isVerifyPending ? (
                  <>
                    <Spinner className="size-4" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Confirm Verify</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* World-Class Reject Verification Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl sm:rounded-3xl border border-border/80 bg-popover/98 backdrop-blur-xl shadow-2xl">
          <form action={rejectFormAction} className="flex flex-col gap-5">
            <DialogHeader className="gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 shadow-xs">
                  <UserX className="size-6" />
                </div>
                <div>
                  <DialogTitle className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    Reject Faculty Accreditation
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Decline this educator&apos;s request to author exams on the platform.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Teacher Snapshot Card */}
            {teacherName && (
              <div className="flex items-center gap-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold text-sm border border-rose-500/30">
                  {teacherName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-heading text-sm font-bold text-foreground truncate block">
                    {teacherName}
                  </span>
                  {teacherEmail && (
                    <p className="text-xs text-muted-foreground truncate">{teacherEmail}</p>
                  )}
                </div>
              </div>
            )}

            {/* Reason Field */}
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reason for Rejection <span className="text-rose-500">*</span>
              </FieldLabel>
              <Textarea
                name="reason"
                rows={3}
                required
                minLength={5}
                placeholder="Explain the justification for rejection (e.g. Unverifiable credentials, incomplete application)..."
                className="rounded-xl border-border/80 bg-background/80 p-3 text-sm shadow-2xs resize-none focus-visible:ring-2 focus-visible:ring-rose-500/30 focus-visible:border-rose-500 transition-all"
              />
              {rejectState && "error" in rejectState && (
                <FieldError>{rejectState.error}</FieldError>
              )}
            </Field>

            <DialogFooter className="mt-2 flex-row justify-end gap-2.5 border-t border-border/60 pt-4 -mx-6 -mb-6 px-6 pb-6 bg-muted/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectOpen(false)}
                disabled={isRejectPending}
                className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-medium border-border/70 text-xs sm:text-sm cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isRejectPending}
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl font-semibold shadow-sm shadow-rose-600/25 gap-2 cursor-pointer text-xs sm:text-sm"
              >
                {isRejectPending ? (
                  <>
                    <Spinner className="size-4" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 shrink-0" />
                    <span>Confirm Reject</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
