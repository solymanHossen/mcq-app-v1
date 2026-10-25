"use client"

import { useActionState, useState } from "react"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { changeUserRoleAction } from "@/modules/users/actions"
import type { Role } from "@/prisma/generated/prisma/client"

const ROLES: Role[] = ["ADMIN", "TEACHER", "STUDENT"]

export function ChangeRoleDialog({
  userId,
  userName,
  currentRole,
}: {
  userId: string
  userName: string
  currentRole: Role
}) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<Role>(currentRole)
  const [state, formAction, isPending] = useActionState(async (
    _state: Awaited<ReturnType<typeof changeUserRoleAction>> | undefined,
    formData: FormData
  ) => {
    const result = await changeUserRoleAction(userId, _state, formData)
    if ("success" in result) setOpen(false)
    return result
  }, undefined)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setRole(currentRole)
      }}
    >
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Change role
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Change role
          </DialogTitle>
          <DialogDescription>
            {userName} is currently <Badge variant="outline">{currentRole}</Badge>. This takes
            effect immediately and is recorded in the audit log.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="role">New role</FieldLabel>
            <input type="hidden" name="role" value={role} />
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="reason">Reason</FieldLabel>
            <Textarea
              id="reason"
              name="reason"
              rows={3}
              required
              placeholder="Why is this role changing?"
            />
          </Field>

          {state && "error" in state && <FieldError>{state.error}</FieldError>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || role === currentRole}>
              {isPending && <Spinner data-icon="inline-start" />}
              Save role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
