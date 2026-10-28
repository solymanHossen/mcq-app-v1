import Link from "next/link"
import {
  Search,
  Crown,
  ShieldCheck,
  GraduationCap,
  Users,
  Sparkles,
  CheckCircle2,
  Ban,
  Calendar,
  Clock,
} from "lucide-react"
import { requireRole, ADMIN_ROLES, isAdminTier } from "@/lib/authorization"
import { listUsers } from "@/modules/payments/queries"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { PagePagination } from "@/components/shared/page-pagination"
import { UserRowActions } from "@/modules/users/components/user-row-actions"
import { ChangeRoleDialog } from "@/modules/users/components/change-role-dialog"
import { cn } from "@/lib/utils"
import type { Role } from "@/prisma/generated/prisma/client"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const PAGE_SIZE = 20

const ROLE_FILTERS: {
  label: string
  value: Role | undefined
  icon: React.ElementType
}[] = [
  { label: "All Users", value: undefined, icon: Sparkles },
  { label: "Super Admins", value: "SUPER_ADMIN", icon: Crown },
  { label: "Admins", value: "ADMIN", icon: ShieldCheck },
  { label: "Teachers", value: "TEACHER", icon: GraduationCap },
  { label: "Students", value: "STUDENT", icon: Users },
]

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const viewer = await requireRole(...ADMIN_ROLES)
  const canManageAdminTier = viewer.role === "SUPER_ADMIN"

  const sp = await searchParams
  const page = sp.page ? Math.max(1, Number(sp.page)) : 1
  const role = sp.role as Role | undefined
  const search = sp.q

  const [users, totalCount] = await listUsers({
    page,
    pageSize: PAGE_SIZE,
    role,
    search,
  })
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  function filterHref(nextRole: Role | undefined) {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (nextRole) params.set("role", nextRole)
    const qs = params.toString()
    return qs ? `?${qs}` : "?"
  }

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      {/* ================= PAGE HEADER & GLOBAL SEARCH BAR ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {totalCount} total account{totalCount === 1 ? "" : "s"}
            {role ? ` · filtered by ${role.toLowerCase()}` : ""}
            {search ? ` matching "${search}"` : ""}
            {" · Platform access credentials & role controls"}
          </p>
        </div>

        <form action="/admin/users" className="relative w-full max-w-sm">
          {role && <input type="hidden" name="role" value={role} />}
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={search ?? ""}
            placeholder="Search by name or email…"
            className="h-11 w-full rounded-2xl border border-border/70 bg-card pl-10 pr-4 text-xs sm:text-sm shadow-xs focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all"
          />
        </form>
      </div>

      {/* ================= MODERN SEGMENTED ROLE FILTER DOCK ================= */}
      <div className="w-full overflow-x-auto pb-1 scrollbar-none">
        <nav
          role="tablist"
          aria-label="Filter users by system role"
          className="flex w-fit min-w-fit items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-2 sm:p-2 min-h-12 sm:min-h-14"
        >
          {ROLE_FILTERS.map(({ label, value, icon: Icon }) => {
            const isSelected = role === value
            return (
              <Link
                key={label}
                href={filterHref(value)}
                role="tab"
                aria-selected={isSelected}
                className={cn(
                  "group relative flex !h-auto min-h-9.5 sm:min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 select-none sm:gap-2.5 sm:px-5 sm:py-2.5",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 sm:size-4.5 transition-transform duration-200 group-hover:scale-105",
                    isSelected
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ================= WORLD-CLASS USERS DATA TABLE CARD ================= */}
      <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/60">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="py-4 pl-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                User & Identity
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Assigned Role
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Account Status
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Registration Date
              </TableHead>
              <TableHead className="py-4 pr-6 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border/50">
            {users.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border/70">
                      <Users className="size-6" />
                    </span>
                    <p className="font-heading font-bold text-foreground text-base">
                      No matching users found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search query or role filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const roleMeta =
                  u.role === "SUPER_ADMIN"
                    ? {
                        icon: Crown,
                        badgeClass:
                          "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                      }
                    : u.role === "ADMIN"
                    ? {
                        icon: ShieldCheck,
                        badgeClass:
                          "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
                      }
                    : u.role === "TEACHER"
                    ? {
                        icon: GraduationCap,
                        badgeClass:
                          "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                      }
                    : {
                        icon: Users,
                        badgeClass:
                          "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
                      }

                const RoleIcon = roleMeta.icon

                return (
                  <TableRow
                    key={u.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* 1. User Identity */}
                    <TableCell className="py-4.5 pl-6">
                      <div className="flex items-center gap-3.5">
                        <span className="flex size-10.5 shrink-0 items-center justify-center rounded-2xl bg-muted/60 text-xs font-black text-foreground border border-border/70 shadow-2xs">
                          {initials(u.name)}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <p className="truncate font-heading text-sm font-bold text-foreground">
                            {u.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* 2. Role */}
                    <TableCell className="py-4.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold shadow-2xs border",
                          roleMeta.badgeClass
                        )}
                      >
                        <RoleIcon className="size-3.5 shrink-0" />
                        <span>{u.role}</span>
                      </Badge>
                    </TableCell>

                    {/* 3. Account Status & Accreditations */}
                    <TableCell className="py-4.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/25 bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive shadow-2xs">
                            <Ban className="size-3" />
                            <span>Suspended</span>
                          </span>
                        )}

                        {u.role === "TEACHER" && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-xl px-2.5 py-0.5 text-xs font-semibold shadow-2xs border",
                              u.teacherVerificationStatus === "VERIFIED"
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : u.teacherVerificationStatus === "REJECTED"
                                ? "border-destructive/25 bg-destructive/10 text-destructive"
                                : "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            )}
                          >
                            {u.teacherVerificationStatus === "VERIFIED" && (
                              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                            )}
                            {u.teacherVerificationStatus}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* 4. Registration Date */}
                    <TableCell className="py-4.5 hidden md:table-cell text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="size-3.5 text-muted-foreground/80" />
                        <span>
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(u.createdAt))}
                        </span>
                      </div>
                    </TableCell>

                    {/* 5. Actions (Change Role Modal & Suspend Alert Dialog) */}
                    <TableCell className="py-4.5 pr-6 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <ChangeRoleDialog
                          userId={u.id}
                          userName={u.name}
                          userEmail={u.email}
                          currentRole={u.role}
                          canManageAdminTier={canManageAdminTier}
                        />

                        <UserRowActions
                          userId={u.id}
                          userName={u.name}
                          userEmail={u.email}
                          isActive={u.isActive}
                          isAdmin={isAdminTier(u.role)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ================= PAGINATION ================= */}
      <PagePagination page={page} pageCount={pageCount} searchParams={sp} />
    </div>
  )
}
