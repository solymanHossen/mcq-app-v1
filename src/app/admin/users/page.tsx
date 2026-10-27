import Link from "next/link"
import { Search, Crown } from "lucide-react"
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

const ROLE_FILTERS: { label: string; value: Role | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Super admins", value: "SUPER_ADMIN" },
  { label: "Admins", value: "ADMIN" },
  { label: "Teachers", value: "TEACHER" },
  { label: "Students", value: "STUDENT" },
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

  const [users, totalCount] = await listUsers({ page, pageSize: PAGE_SIZE, role, search })
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
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} account{totalCount === 1 ? "" : "s"}
            {role ? ` · ${role.toLowerCase()}` : ""}
            {search ? ` matching "${search}"` : ""}
            {" · Platform-wide access controls & accounts"}
          </p>
        </div>

        <form action="/admin/users" className="relative w-full max-w-sm">
          {role && <input type="hidden" name="role" value={role} />}
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={search ?? ""}
            placeholder="Search name or email…"
            className="h-10 w-full rounded-xl border-none bg-card pl-9.5 pr-4 text-xs sm:text-sm shadow-xs focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </form>
      </div>

      {/* Role Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {ROLE_FILTERS.map(({ label, value }) => {
          const isSelected = role === value
          return (
            <Link
              key={label}
              href={filterHref(value)}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-2xs",
                isSelected
                  ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/25"
                  : "bg-card text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Full-width Smooth Table Card */}
      <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <Table>
          <TableHeader className="bg-muted/25">
            <TableRow className="border-b border-border/25 hover:bg-transparent">
              <TableHead className="py-4 pl-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                User
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="py-4 pr-6 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-16 text-center text-sm text-muted-foreground">
                  No users match these filters.
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => (
              <TableRow
                key={u.id}
                className="border-b border-border/15 last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-extrabold text-primary shadow-2xs">
                      {initials(u.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground text-sm">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant={u.role === "SUPER_ADMIN" ? "default" : "secondary"}
                    className={cn(
                      "gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-2xs",
                      u.role === "SUPER_ADMIN" && "bg-amber-500 text-white hover:bg-amber-600"
                    )}
                  >
                    {u.role === "SUPER_ADMIN" && <Crown className="size-3" />}
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={u.isActive ? "secondary" : "destructive"}
                      className="rounded-lg px-2.5 py-0.5 text-xs font-semibold shadow-2xs"
                    >
                      {u.isActive ? "Active" : "Suspended"}
                    </Badge>
                    {u.role === "TEACHER" && (
                      <Badge
                        variant={
                          u.teacherVerificationStatus === "VERIFIED"
                            ? "default"
                            : u.teacherVerificationStatus === "REJECTED"
                              ? "destructive"
                              : "secondary"
                        }
                        className={cn(
                          "rounded-lg px-2.5 py-0.5 text-xs font-semibold shadow-2xs",
                          u.teacherVerificationStatus === "VERIFIED" && "bg-emerald-600 text-white"
                        )}
                      >
                        {u.teacherVerificationStatus}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 pr-6 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <ChangeRoleDialog
                      userId={u.id}
                      userName={u.name}
                      currentRole={u.role}
                      canManageAdminTier={canManageAdminTier}
                    />
                    <UserRowActions userId={u.id} isActive={u.isActive} isAdmin={isAdminTier(u.role)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PagePagination page={page} pageCount={pageCount} searchParams={sp} />
    </div>
  )
}
