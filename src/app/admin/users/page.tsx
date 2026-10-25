import Link from "next/link"
import { Search } from "lucide-react"
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} account{totalCount === 1 ? "" : "s"}
            {role ? ` · ${role.toLowerCase()}` : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        </div>

        <form action="/admin/users" className="relative w-full max-w-xs">
          {role && <input type="hidden" name="role" value={role} />}
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={search ?? ""}
            placeholder="Search name or email…"
            className="pl-8"
          />
        </form>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ROLE_FILTERS.map(({ label, value }) => (
          <Link
            key={label}
            href={filterHref(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
              role === value && "border-primary/40 bg-primary/10 text-primary hover:text-primary"
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No users match these filters.
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {initials(u.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{u.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={u.isActive ? "secondary" : "destructive"}>
                      {u.isActive ? "Active" : "Suspended"}
                    </Badge>
                    {u.role === "TEACHER" && (
                      <Badge
                        variant={
                          u.teacherVerificationStatus === "VERIFIED"
                            ? "default"
                            : u.teacherVerificationStatus === "REJECTED"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {u.teacherVerificationStatus}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <ChangeRoleDialog userId={u.id} userName={u.name} currentRole={u.role} />
                    <UserRowActions userId={u.id} isActive={u.isActive} isAdmin={u.role === "ADMIN"} />
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
