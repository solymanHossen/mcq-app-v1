import { listPendingTeacherVerifications } from "@/modules/payments/queries"
import { TeacherVerificationRow } from "@/modules/users/components/teacher-verification-row"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { UserCheckIcon } from "lucide-react"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function TeacherVerificationPage() {
  const pending = await listPendingTeacherVerifications()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Teacher verification</h1>
        <p className="text-sm text-muted-foreground">
          An unverified teacher can draft and manage exams, but can&apos;t publish
          one until approved here.
        </p>
      </div>

      {pending.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserCheckIcon />
            </EmptyMedia>
            <EmptyTitle>Nothing pending</EmptyTitle>
            <EmptyDescription>Every teacher account has been reviewed.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {pending.map((teacher) => (
            <div key={teacher.id} className="space-y-2 rounded-md border p-4">
              <div>
                <p className="font-medium">{teacher.name}</p>
                <p className="text-xs text-muted-foreground">{teacher.email}</p>
              </div>
              <TeacherVerificationRow userId={teacher.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
