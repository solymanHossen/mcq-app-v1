"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { suspendUserAction, reinstateUserAction } from "@/actions/admin.actions"

export function UserRowActions({
  userId,
  isActive,
  isAdmin,
}: {
  userId: string
  isActive: boolean
  isAdmin: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [state, formAction, isPending] = useActionState(
    suspendUserAction.bind(null, userId),
    undefined
  )

  if (isAdmin) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  if (!isActive) {
    return <ReinstateButton userId={userId} />
  }

  if (!showForm) {
    return (
      <Button type="button" size="sm" variant="destructive" onClick={() => setShowForm(true)}>
        Suspend
      </Button>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Field>
        <Textarea name="reason" rows={2} placeholder="Reason for suspension (required)" required />
      </Field>
      {state && "error" in state && <FieldError>{state.error}</FieldError>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          Confirm suspend
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function ReinstateButton({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(async () => {
    return reinstateUserAction(userId)
  }, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending && <Spinner data-icon="inline-start" />}
        Reinstate
      </Button>
      {state && "error" in state && <FieldError>{state.error}</FieldError>}
    </form>
  )
}
