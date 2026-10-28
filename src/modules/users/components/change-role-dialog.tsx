"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"
import {
  ShieldCheck,
  Crown,
  GraduationCap,
  Users,
  Check,
  Sparkles,
  Info,
} from "lucide-react"
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
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { changeUserRoleAction } from "@/modules/users/actions"
import type { Role } from "@/prisma/generated/prisma/client"

const ALL_ROLES: Role[] = ["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"]
const NON_ADMIN_ROLES: Role[] = ["STUDENT", "TEACHER"]
const ADMIN_TIER: Role[] = ["SUPER_ADMIN", "ADMIN"]

interface RoleMeta {
  role: Role
  title: string
  desc: string
  icon: React.ElementType
  color: string
}

const ROLE_DEFINITIONS: Record<Role, RoleMeta> = {
  STUDENT: {
    role: "STUDENT",
    title: "Student Candidate",
    desc: "Candidate access to practice questions, timed examinations, and personal learning records.",
    icon: Users,
    color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
  TEACHER: {
    role: "TEACHER",
    title: "Faculty Educator",
    desc: "Author timed exams, manage question vaults, and inspect candidate cohort performance.",
    icon: GraduationCap,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  ADMIN: {
    role: "ADMIN",
    title: "Platform Admin",
    desc: "Operational governance, educator accreditations, content moderation, and user oversight.",
    icon: ShieldCheck,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  SUPER_ADMIN: {
    role: "SUPER_ADMIN",
    title: "Super Administrator",
    desc: "Unrestricted platform authority, billing configurations, and administrator role assignment.",
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
        toast.success(`Role for ${userName} changed to ${role}`, {
          description: "Permissions updated and logged to audit trail.",
        })
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

      {/* ================= MODAL FOR ROLE MANAGEMENT ================= */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next) setRole(currentRole)
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-3xl border border-border/80 bg-background/95 backdrop-blur-2xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <ShieldCheck className="size-6" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <DialogHeader className="p-0 text-left">
                <DialogTitle className="font-heading text-lg font-bold text-foreground">
                  Update Account Role
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                  Adjust platform access privileges and credentials for{" "}
                  <strong className="text-foreground font-semibold">{userName}</strong>.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          {/* User Preview Capsule */}
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/40 p-3.5 shadow-2xs">
            <div className="min-w-0">
              <p className="font-heading text-sm font-bold text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-medium text-muted-foreground">Current:</span>
              <Badge variant="outline" className="font-bold text-xs uppercase tracking-wider border-border/70 bg-card shadow-2xs">
                {currentRole}
              </Badge>
            </div>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="role" value={role} />

            {/* Interactive Role Cards Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground tracking-wide uppercase">
                Select Target Role
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {roleOptions.map((r) => {
                  const meta = ROLE_DEFINITIONS[r]
                  const Icon = meta.icon
                  const isSelected = role === r
                  const isCurrent = currentRole === r

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer select-none",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                          : "border-border/60 bg-card/60 hover:bg-muted/40 hover:border-border"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "flex size-8.5 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105",
                            meta.color
                          )}
                        >
                          <Icon className="size-4.5" />
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isCurrent && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted/70">
                              Active
                            </span>
                          )}
                          {isSelected && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xs">
                              <Check className="size-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5">
                        <p className="font-heading text-sm font-bold text-foreground">
                          {meta.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {meta.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Context Notices */}
            {role === "TEACHER" && currentRole !== "TEACHER" && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-200">
                <Info className="size-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Promoting to Teacher will automatically initiate a new verification entry in the Faculty Accreditation queue.
                </span>
              </div>
            )}

            {canManageAdminTier && (role === "SUPER_ADMIN" || role === "ADMIN") && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-200">
                <Sparkles className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  Admin-tier roles grant administrative authority across the platform and are permanently logged in the audit trail.
                </span>
              </div>
            )}

            {/* Justification Reason */}
            <Field>
              <FieldLabel htmlFor="change-reason" className="text-xs font-semibold text-foreground">
                Operational Reason (Required)
              </FieldLabel>
              <Textarea
                id="change-reason"
                name="reason"
                rows={3}
                required
                placeholder="State why this user role is being changed (min 5 characters)..."
                className="rounded-xl border border-border/70 bg-muted/30 focus-visible:bg-background text-xs sm:text-sm resize-none shadow-2xs"
              />
            </Field>

            {state && "error" in state && (
              <FieldError className="text-xs font-semibold text-destructive">
                {state.error}
              </FieldError>
            )}

            <DialogFooter className="mt-2 flex items-center justify-end gap-2 border-t border-border/40 pt-4 -mx-6 -mb-6 px-6 pb-6 bg-muted/20 rounded-b-3xl">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border border-border/70 text-xs font-semibold cursor-pointer"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || role === currentRole}
                className="rounded-xl text-xs font-bold shadow-xs cursor-pointer"
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
