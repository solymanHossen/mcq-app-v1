import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  Scale,
} from "lucide-react"
import { requireUser, assertOwner } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { listFlaggedAttempts } from "@/modules/proctoring/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ViolationEventRow } from "@/modules/proctoring/components/violation-event-row"
import { AppealResolutionForm } from "@/modules/proctoring/components/appeal-resolution-form"
import { DisqualifyButton } from "@/modules/grading/components/disqualify-button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

export const instant = false

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

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
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/teacher/exams/${examId}/results`}>
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Back to results</span>
          </Link>
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {exam.title} — Flagged Proctoring Attempts
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review candidates exceeding the cumulative violation threshold ({exam.violationReviewThreshold} pts) or disqualified.
            </p>
          </div>
        </div>
      </div>

      {/* Proctoring Policy Notice */}
      <Alert className="rounded-2xl border-amber-500/20 bg-amber-500/[0.04]">
        <ShieldAlert className="size-4 text-amber-500" />
        <AlertTitle className="font-heading font-semibold text-foreground">
          Human Review Threshold: {exam.violationReviewThreshold} Points
        </AlertTitle>
        <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
          Attempts appear here automatically once detected anomalies (tab switches, window blur, fullscreen exits)
          reach this exam&apos;s review threshold. Flagging never disqualifies students automatically — any disqualification
          requires explicit faculty rationale.
        </AlertDescription>
      </Alert>

      {/* Flagged Attempts List */}
      {attempts.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldCheck className="size-8 text-emerald-500" />
              </EmptyMedia>
              <EmptyTitle className="font-heading text-lg sm:text-xl font-bold">
                Zero Flagged Attempts
              </EmptyTitle>
              <EmptyDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
                No students have crossed the violation review threshold for this assessment track.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="space-y-6">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-6 transition-all"
            >
              {/* Attempt Student Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
                <div className="flex items-center gap-3.5">
                  <Avatar className="size-11 rounded-2xl border border-border/80 shadow-2xs">
                    <AvatarFallback className="rounded-2xl text-sm font-bold bg-muted text-foreground">
                      {getInitials(attempt.student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-heading text-base font-bold text-foreground">
                      {attempt.student.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attempt.student.email} · Attempt ID: {attempt.id.slice(0, 8)}…
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Badge
                    variant={
                      attempt.status === "DISQUALIFIED" ? "destructive" : "secondary"
                    }
                    className="rounded-lg text-xs font-semibold px-2.5 py-1"
                  >
                    {attempt.status}
                  </Badge>
                  {attempt.status !== "DISQUALIFIED" && (
                    <DisqualifyButton attemptId={attempt.id} />
                  )}
                </div>
              </div>

              {attempt.disqualifiedReason && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive font-medium">
                  <strong>Disqualified by Faculty:</strong> {attempt.disqualifiedReason}
                </div>
              )}

              {/* Violation Events Timeline */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Detected Anomalies & Events ({attempt.violationEvents.length})
                </p>
                <ul className="space-y-2.5">
                  {attempt.violationEvents.map((event) => (
                    <ViolationEventRow key={event.id} event={event} />
                  ))}
                </ul>
              </div>

              {/* Student Appeals Section */}
              {attempt.appeals.length > 0 && (
                <div className="space-y-3 border-t border-border/50 pt-5">
                  <div className="flex items-center gap-2">
                    <Scale className="size-4 text-primary" />
                    <p className="text-sm font-bold text-foreground">
                      Candidate Appeals ({attempt.appeals.length})
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {attempt.appeals.map((appeal) => (
                      <AppealResolutionForm key={appeal.id} appeal={appeal} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
