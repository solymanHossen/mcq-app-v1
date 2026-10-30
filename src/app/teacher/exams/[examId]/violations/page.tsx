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
    <div className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      {/* Header & Back Pill Button */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-1.5 sm:gap-2 mb-2 sm:mb-3"
          >
            <Link href={`/teacher/exams/${examId}/results`}>
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to results</span>
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                {exam.title} — Flagged Proctoring Attempts
              </h1>
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
              >
                {attempts.length} {attempts.length === 1 ? "Flagged Attempt" : "Flagged Attempts"}
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Review candidates exceeding the cumulative violation threshold ({exam.violationReviewThreshold} pts) or disqualified.
            </p>
          </div>
        </div>
      </div>

      {/* Proctoring Policy Notice */}
      <Alert className="rounded-2xl sm:rounded-3xl border border-amber-500/25 bg-amber-500/[0.05] p-5 sm:p-6 shadow-2xs">
        <ShieldAlert className="size-5 text-amber-500" />
        <AlertTitle className="font-heading text-sm sm:text-base font-bold text-foreground">
          Human Review Threshold: {exam.violationReviewThreshold} Points
        </AlertTitle>
        <AlertDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
          Attempts appear here automatically once detected anomalies (tab switches, window blur, fullscreen exits)
          reach this exam&apos;s review threshold. Flagging never disqualifies students automatically — any disqualification
          requires explicit faculty rationale.
        </AlertDescription>
      </Alert>

      {/* Flagged Attempts List */}
      {attempts.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 sm:p-14 text-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs ring-1 ring-emerald-500/20 mx-auto">
                  <ShieldCheck className="size-7" />
                </div>
              </EmptyMedia>
              <EmptyTitle className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-3">
                Zero Flagged Attempts
              </EmptyTitle>
              <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
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
              className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-2xs space-y-6 transition-all"
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
                    className="rounded-full text-xs font-semibold px-2.5 py-0.5"
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
