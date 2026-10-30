"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"
import {
  ShieldCheck,
  Crown,
  GraduationCap,
  Users,
  User,
  Check,
} from "lucide-react"
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
import { cn } from "@/lib/utils"
import { changeUserRoleAction } from "@/modules/users/actions"
import type { Role } from "@/prisma/generated/prisma/client"

const ALL_ROLES: Role[] = ["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"]
const NON_ADMIN_ROLES: Role[] = ["STUDENT", "TEACHER"]
const ADMIN_TIER: Role[] = ["SUPER_ADMIN", "ADMIN"]

const ROLE_TILES: Record<
  Role,
  {
    label: string
    icon: React.ElementType
    color: string
  }
> = {
  STUDENT: {
    label: "Student",
    icon: User,
    color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
  TEACHER: {
    label: "Teacher",
    icon: GraduationCap,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  ADMIN: {
    label: "Admin",
    icon: ShieldCheck,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: Crown,
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
}

export function ChangeRoleDialog({
  userId,
  userName,
  userEmail,
  currentRole,
  canManageAdminTier,
}: {
  userId: string
  userName: string
  userEmail: string
  currentRole: Role
  canManageAdminTier: boolean
}) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<Role>(currentRole)

  const [state, formAction, isPending] = useActionState(
    async (
      _state: Awaited<ReturnType<typeof changeUserRoleAction>> | undefined,
      formData: FormData
    ) => {
      const result = await changeUserRoleAction(userId, _state, formData)
      if ("success" in result) {
        setOpen(false)
        toast.success(`Role for ${userName} changed to ${role}`)
      } else if ("error" in result) {
        toast.error(result.error)
      }
      return result
    },
    undefined
  )

  if (!canManageAdminTier && ADMIN_TIER.includes(currentRole)) {
    return (
      <span
        className="inline-flex items-center text-xs text-muted-foreground font-medium px-2 py-1 rounded-lg bg-muted/40 border border-border/50"
        title="Only a super admin can alter admin-tier credentials"
      >
        Super Admin Only
      </span>
    )
  }

  const roleOptions = canManageAdminTier ? ALL_ROLES : NON_ADMIN_ROLES

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          setRole(currentRole)
          setOpen(true)
        }}
        className="h-8.5 rounded-xl border border-border/70 bg-card hover:bg-muted/70 hover:border-primary/40 shadow-2xs text-xs font-semibold gap-1.5 transition-all cursor-pointer"
      >
        <ShieldCheck className="size-3.5 text-primary" />
        <span>Change Role</span>
      </Button>

      {/* ================= REFINED, PROPORTIONAL WORLD-CLASS MODAL ================= */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next) setRole(currentRole)
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl border border-border/80 bg-background/95 backdrop-blur-2xl p-6 shadow-2xl">
          {/* Proportional Header */}
          <DialogHeader className="p-0 text-left">
            <DialogTitle className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Update Role
            </DialogTitle>
            <p className="mt-0.5 text-xs text-muted-foreground font-medium">
              {userName} · <span className="font-semibold text-foreground">{currentRole}</span>
            </p>
          </DialogHeader>

          <form action={formAction} className="flex flex-col gap-3.5 pt-1">
            <input type="hidden" name="role" value={role} />

            {/* Proportional Role Selection Tiles */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {roleOptions.map((r) => {
                const tile = ROLE_TILES[r]
                const Icon = tile.icon
                const isSelected = role === r
                const isCurrent = currentRole === r

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "group relative flex items-center justify-between rounded-xl border p-3 sm:p-3.5 transition-all duration-200 cursor-pointer select-none",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                        : "border-border/70 bg-card/70 hover:bg-muted/50 hover:border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-9 sm:size-9.5 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105",
                          tile.color
                        )}
                      >
                        <Icon className="size-4.5" />
                      </span>

                      <div className="text-left">
                        <p className="font-heading text-sm sm:text-[15px] font-bold text-foreground leading-snug">
                          {tile.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[10.5px] font-medium text-muted-foreground">
                            Current
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xs">
                        <Check className="size-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="size-4.5 shrink-0 rounded-full border border-border/80 group-hover:border-foreground/40 transition-colors" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Reason Field */}
            <Field className="space-y-1 pt-0.5">
              <Textarea
                id="change-reason"
                name="reason"
                rows={2}
                required
                placeholder="Reason for role change (min 5 characters)..."
                className="h-14 rounded-xl border border-border/70 bg-muted/30 focus-visible:bg-background text-xs sm:text-sm font-medium resize-none shadow-2xs placeholder:text-muted-foreground/60 transition-all"
              />
            </Field>

            {state && "error" in state && (
              <FieldError className="text-xs font-semibold text-destructive">
                {state.error}
              </FieldError>
            )}

            {/* Action Buttons */}
            <DialogFooter className="mt-1 flex items-center justify-end gap-2.5 border-t border-border/40 pt-3.5 -mx-6 -mb-6 px-6 pb-6 bg-muted/20 rounded-b-3xl">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-4.5 rounded-xl border border-border/70 text-xs sm:text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-all"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || role === currentRole}
                className="h-10 px-5.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all"
              >
                {isPending && <Spinner data-icon="inline-start" />}
                Save Role Change
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
