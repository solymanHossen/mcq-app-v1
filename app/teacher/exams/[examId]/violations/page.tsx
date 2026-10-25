import { notFound } from "next/navigation"
import Link from "next/link"
import { requireUser, assertOwner } from "@/lib/auth/guards"
import { prisma } from "@/lib/db"
import { listFlaggedAttempts } from "@/lib/anti-cheat/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ViolationEventRow } from "@/components/teacher/violation-event-row"
import { AppealResolutionForm } from "@/components/teacher/appeal-resolution-form"
import { DisqualifyButton } from "@/components/teacher/disqualify-button"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ExamViolationsPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const user = await requireUser()

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) notFound()
  assertOwner(user, exam.teacherId)

  const attempts = await listFlaggedAttempts(examId)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{exam.title} — Flagged attempts</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/teacher/exams/${examId}/results`}>Back to results</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        An attempt appears here once its cumulative violation severity
        crosses this exam&apos;s review threshold ({exam.violationReviewThreshold}),
        or once it&apos;s been disqualified. Flagging is automatic; disqualifying
        is always a separate, manual, reason-required decision below —
        nothing here does that on its own.
      </p>

      {attempts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No attempts have been flagged for this exam.
        </p>
      ) : (
        <div className="space-y-6">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{attempt.student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {attempt.student.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      attempt.status === "DISQUALIFIED" ? "destructive" : "secondary"
                    }
                  >
                    {attempt.status}
                  </Badge>
                  {attempt.status !== "DISQUALIFIED" && (
                    <DisqualifyButton attemptId={attempt.id} />
                  )}
                </div>
              </div>

              {attempt.disqualifiedReason && (
                <p className="text-sm text-muted-foreground">
                  Disqualified: {attempt.disqualifiedReason}
                </p>
              )}

              <ul className="space-y-2">
                {attempt.violationEvents.map((event) => (
                  <ViolationEventRow key={event.id} event={event} />
                ))}
              </ul>

              {attempt.appeals.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Appeals</p>
                    {attempt.appeals.map((appeal) => (
                      <AppealResolutionForm key={appeal.id} appeal={appeal} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
