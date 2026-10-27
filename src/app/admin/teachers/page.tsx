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
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Teacher Verification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review pending faculty instructor accounts. An unverified teacher can draft exams, but cannot publish assessments until verified here.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="w-full rounded-2xl sm:rounded-3xl bg-card p-12 sm:p-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <Empty className="border-none shadow-none">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-16 rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-2xs mx-auto">
                <UserCheckIcon className="size-8" />
              </EmptyMedia>
              <EmptyTitle className="mt-4 text-xl font-bold tracking-tight">Nothing pending</EmptyTitle>
              <EmptyDescription className="mt-1 text-sm text-muted-foreground">
                All teacher accounts have been reviewed and verified.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {pending.map((teacher) => (
            <div
              key={teacher.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-2xl sm:rounded-3xl bg-card p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 text-sm font-bold shadow-2xs">
                  {teacher.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-base tracking-tight">{teacher.name}</p>
                  <p className="text-xs text-muted-foreground">{teacher.email}</p>
                </div>
              </div>
              <div className="shrink-0">
                <TeacherVerificationRow userId={teacher.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
