import { listUsers } from "@/modules/payments/queries"
import { Badge } from "@/components/ui/badge"
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

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const PAGE_SIZE = 20

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = sp.page ? Math.max(1, Number(sp.page)) : 1

  const [users, totalCount] = await listUsers({ page, pageSize: PAGE_SIZE })
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{u.role}</Badge>
              </TableCell>
              <TableCell>
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
                    className="ml-1"
                  >
                    {u.teacherVerificationStatus}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <UserRowActions userId={u.id} isActive={u.isActive} isAdmin={u.role === "ADMIN"} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PagePagination page={page} pageCount={pageCount} searchParams={sp} />
    </div>
  )
}
