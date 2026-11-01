import { listPendingTeacherVerifications } from "@/modules/payments/queries"
import { TeacherVerificationRow } from "@/modules/users/components/teacher-verification-row"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { UserCheckIcon, Clock, Mail, Calendar, GraduationCap, Building2, BookOpen, FileText } from "lucide-react"
import { AdminPageHeader } from "@/components/shared/admin-page-header"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function TeacherVerificationPage() {
  const pending = await listPendingTeacherVerifications()

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <AdminPageHeader
        title="Teacher Verification"
        description={
          <>
            Review pending faculty instructor accounts. An unverified teacher can
            draft exams, but cannot publish assessments until verified here.
          </>
        }
        actions={
          pending.length > 0 ? (
            <Badge className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-0.5 text-xs font-bold text-amber-600 shadow-2xs dark:text-amber-400">
              <Clock className="size-3.5" />
              <span>{pending.length} Pending</span>
            </Badge>
          ) : null
        }
      />

      {pending.length === 0 ? (
        <div className="w-full rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-12 sm:p-16 text-center shadow-xs">
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
              className="group relative flex flex-col lg:flex-row lg:items-start justify-between gap-6 rounded-2xl sm:rounded-3xl border border-border/70 bg-card/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 backdrop-blur-xl"
            >
              <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                <div className="relative flex size-13 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold text-base sm:text-lg shadow-2xs">
                  {teacher.name.slice(0, 2).toUpperCase()}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-amber-500 border-2 border-card"
                    title="Pending verification"
                  />
                </div>
                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
                      {teacher.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 text-[11px] font-semibold px-2 py-0.5 gap-1"
                    >
                      <GraduationCap className="size-3" />
                      <span>Faculty Applicant</span>
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <a
                      href={`mailto:${teacher.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Mail className="size-3.5 text-muted-foreground/70" />
                      <span className="truncate">{teacher.email}</span>
                    </a>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground/80">
                      <Calendar className="size-3.5 text-muted-foreground/70" />
                      <span>
                        Applied {new Date(teacher.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </span>
                  </div>

                  {(teacher.institution || teacher.department) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/80 font-medium pt-1">
                      {teacher.institution && (
                        <span className="inline-flex items-center gap-1.5 text-foreground/90">
                          <Building2 className="size-3.5 text-primary/70 shrink-0" />
                          <span className="truncate font-semibold">{teacher.institution}</span>
                        </span>
                      )}
                      {teacher.department && (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <BookOpen className="size-3.5 text-primary/70 shrink-0" />
                          <span className="truncate">{teacher.department}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {teacher.bio && (
                    <div className="pt-2 text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border/50 max-w-2xl leading-relaxed">
                      <span className="font-semibold text-foreground/90 mr-1.5 inline-flex items-center gap-1">
                        <FileText className="size-3.5 text-primary shrink-0" /> Statement / Qualifications:
                      </span>
                      <span>{teacher.bio}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 w-full lg:w-auto flex justify-end">
                <TeacherVerificationRow
                  userId={teacher.id}
                  teacherName={teacher.name}
                  teacherEmail={teacher.email}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
