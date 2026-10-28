"use client"

import { useActionState, useState } from "react"
import {
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { verifyTeacherAction, rejectTeacherAction } from "@/modules/users/actions"

export function TeacherVerificationRow({ userId }: { userId: string }) {
  const [mode, setMode] = useState<"idle" | "verify" | "reject">("idle")
  const [verifyState, verifyFormAction, verifyPending] = useActionState(
    verifyTeacherAction.bind(null, userId),
    undefined
  )
  const [rejectState, rejectFormAction, rejectPending] = useActionState(
    rejectTeacherAction.bind(null, userId),
    undefined
  )

  if (mode === "idle") {
    return (
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={() => setMode("verify")}
          className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] gap-2 cursor-pointer text-sm"
        >
          <UserCheck className="size-4.5 shrink-0" />
          <span>Verify</span>
        </Button>
        <Button
          type="button"
          onClick={() => setMode("reject")}
          variant="outline"
          className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl font-semibold border-rose-200 dark:border-rose-900/60 bg-rose-50/90 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 shadow-xs hover:shadow-sm transition-all duration-200 active:scale-[0.98] gap-2 cursor-pointer text-sm"
        >
          <UserX className="size-4.5 shrink-0" />
          <span>Reject</span>
        </Button>
      </div>
    )
  }

  if (mode === "verify") {
    return (
      <form
        action={verifyFormAction}
        className="flex flex-col gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 sm:p-5 w-full sm:min-w-[360px] animate-in fade-in-0 zoom-in-95 duration-200 shadow-sm"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <UserCheck className="size-4 shrink-0" />
          <span>Approve Faculty Accreditation</span>
        </div>
        <Field>
          <Textarea
            name="note"
            rows={2}
            placeholder="Add internal verification note (optional)..."
            className="rounded-xl border-border/80 bg-background text-sm shadow-2xs resize-none focus-visible:ring-1 focus-visible:ring-emerald-500"
          />
        </Field>
        {verifyState && "error" in verifyState && <FieldError>{verifyState.error}</FieldError>}
        <div className="flex items-center gap-2.5 pt-1">
          <Button
            type="submit"
            disabled={verifyPending}
            className="h-10 px-5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-2 cursor-pointer text-xs sm:text-sm"
          >
            {verifyPending ? <Spinner /> : <CheckCircle2 className="size-4 shrink-0" />}
            Confirm Verify
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setMode("idle")}
            disabled={verifyPending}
            className="h-10 px-4 rounded-xl text-xs sm:text-sm border-border/70 hover:bg-background"
          >
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form
      action={rejectFormAction}
      className="flex flex-col gap-3 rounded-2xl border border-rose-500/25 bg-rose-50/50 dark:bg-rose-950/20 p-4 sm:p-5 w-full sm:min-w-[360px] animate-in fade-in-0 zoom-in-95 duration-200 shadow-sm"
    >
      <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
        <UserX className="size-4 shrink-0" />
        <span>Reject Faculty Accreditation</span>
      </div>
      <Field>
        <Textarea
          name="reason"
          rows={2}
          placeholder="Reason for rejection (required, recorded in audit log)..."
          required
          className="rounded-xl border-border/80 bg-background text-sm shadow-2xs resize-none focus-visible:ring-1 focus-visible:ring-rose-500"
        />
      </Field>
      {rejectState && "error" in rejectState && <FieldError>{rejectState.error}</FieldError>}
      <div className="flex items-center gap-2.5 pt-1">
        <Button
          type="submit"
          variant="destructive"
          disabled={rejectPending}
          className="h-10 px-5 rounded-xl font-semibold shadow-xs gap-2 cursor-pointer text-xs sm:text-sm"
        >
          {rejectPending ? <Spinner /> : <XCircle className="size-4 shrink-0" />}
          Confirm Reject
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setMode("idle")}
          disabled={rejectPending}
          className="h-10 px-4 rounded-xl text-xs sm:text-sm border-border/70 hover:bg-background"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
