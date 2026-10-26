"use client"

import { useActionState, useState } from "react"
import { ShieldCheck, Crown } from "lucide-react"
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

const ALL_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"]
const NON_ADMIN_ROLES: Role[] = ["TEACHER", "STUDENT"]
const ADMIN_TIER: Role[] = ["SUPER_ADMIN", "ADMIN"]

export function ChangeRoleDialog({
  userId,
  userName,
  currentRole,
  canManageAdminTier,
}: {
  userId: string
  userName: string
  currentRole: Role
  /** Only a SUPER_ADMIN can assign/revoke admin-tier roles — see changeUserRoleAction. */
  canManageAdminTier: boolean
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

  // A plain ADMIN can't touch an admin-tier account at all (promoting or
  // demoting one both require SUPER_ADMIN) — don't offer a dialog whose
  // only possible outcome is a server-side rejection.
  if (!canManageAdminTier && ADMIN_TIER.includes(currentRole)) {
    return (
      <span className="text-xs text-muted-foreground" title="Only a super admin can change this role">
        —
      </span>
    )
  }

  const roleOptions = canManageAdminTier ? ALL_ROLES : NON_ADMIN_ROLES

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
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "SUPER_ADMIN" ? (
                      <span className="flex items-center gap-1.5">
                        <Crown className="size-3.5 text-amber-500" />
                        {r}
                      </span>
                    ) : (
                      r
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canManageAdminTier && (role === "SUPER_ADMIN" || role === "ADMIN") && (
              <p className="text-xs text-muted-foreground">
                Admin-tier roles can only be assigned or changed by a super admin.
              </p>
            )}
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
