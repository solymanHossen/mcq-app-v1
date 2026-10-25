"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { verifyTeacherAction, rejectTeacherAction } from "@/actions/admin.actions"

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
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => setMode("verify")}>
          Verify
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={() => setMode("reject")}>
          Reject
        </Button>
      </div>
    )
  }

  if (mode === "verify") {
    return (
      <form action={verifyFormAction} className="flex flex-col gap-2">
        <Field>
          <Textarea name="note" rows={2} placeholder="Optional note" />
        </Field>
        {verifyState && "error" in verifyState && <FieldError>{verifyState.error}</FieldError>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={verifyPending}>
            {verifyPending && <Spinner data-icon="inline-start" />}
            Confirm verify
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setMode("idle")}>
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form action={rejectFormAction} className="flex flex-col gap-2">
      <Field>
        <Textarea name="reason" rows={2} placeholder="Reason for rejection (required)" required />
      </Field>
      {rejectState && "error" in rejectState && <FieldError>{rejectState.error}</FieldError>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" disabled={rejectPending}>
          {rejectPending && <Spinner data-icon="inline-start" />}
          Confirm reject
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setMode("idle")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
