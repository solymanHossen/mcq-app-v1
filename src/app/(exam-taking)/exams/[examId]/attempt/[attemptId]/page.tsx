import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { APP_NAME } from "@/lib/config"
import { requireRole } from "@/lib/authorization"
import { getAttemptForStudent } from "@/modules/attempts/queries"
import { finalizeIfExpired } from "@/modules/attempts/expire"
import { getResultForStudent } from "@/modules/grading/queries"
import { getPendingAppeal } from "@/modules/proctoring/queries"
import { getSystemSettings } from "@/modules/settings/queries"
import { prisma } from "@/lib/prisma"
import { ExamAttemptClient } from "@/modules/attempts/components/exam-attempt-client"
import { ResultSummary } from "@/modules/grading/components/result-summary"
import { SubmissionResultModal } from "@/modules/grading/components/submission-result-modal"
import { AppealForm } from "@/modules/proctoring/components/appeal-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ examId: string; attemptId: string }>
}) {
  const { examId, attemptId } = await params
  const [user, attempt, settings] = await Promise.all([
    requireRole("STUDENT"),
    getAttemptForStudent(attemptId),
    getSystemSettings().catch(() => null),
  ])

  // Strict ownership, no ADMIN bypass — nobody but the student themself
  // should ever be able to open this exam-taking view.
  if (!attempt || attempt.studentId !== user.id || attempt.examId !== examId) {
    notFound()
  }

  const current = await finalizeIfExpired(attempt)

  if (current.status !== "IN_PROGRESS") {
    const titles: Record<typeof current.status, string> = {
      COMPLETED: "Exam submitted",
      TIMEOUT: "Time's up",
      DISQUALIFIED: "Attempt disqualified",
    }

    if (current.status === "DISQUALIFIED") {
      const [fullAttempt, existingAppeal] = await Promise.all([
        prisma.examAttempt.findUniqueOrThrow({
          where: { id: attemptId },
          select: { disqualifiedReason: true },
        }),
        getPendingAppeal(attemptId),
      ])
      const resolvedAppeal = existingAppeal
        ? null
        : await prisma.violationAppeal.findFirst({
            where: { attemptId },
            orderBy: { createdAt: "desc" },
          })

      return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
          {/* Top Breadcrumb */}
          <div className="space-y-3 sm:space-y-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-1.5 sm:gap-2"
            >
              <Link href={`/exams/${examId}`}>
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Back to assessment</span>
              </Link>
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                  {titles.DISQUALIFIED}
                </h1>
                <Badge
                  variant="destructive"
                  className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase"
                >
                  Disqualified
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Integrity policy violation detected during session
              </p>
            </div>
          </div>

          <Card className="rounded-2xl border border-destructive/40 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-destructive/5 flex items-center gap-3 sm:gap-3.5">
              <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-destructive/20">
                <AlertTriangle className="size-4.5 sm:size-5.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                  Violation Notice &amp; Appeal
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium line-clamp-1">
                  {fullAttempt.disqualifiedReason || "Session flagged for policy infractions"}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-7 space-y-6">
              <AppealForm
                attemptId={attemptId}
                existingAppeal={existingAppeal ?? resolvedAppeal}
              />
              <div className="pt-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs active:scale-95 transition-all"
                >
                  <Link href={`/exams/${examId}`}>Back to assessment overview</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    const result = await getResultForStudent(attemptId)
    const isPublished = result?.result?.status === "PUBLISHED"

    return (
      <div id="result-top" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0 scroll-mt-6">
        {/* Top Action Bar (Back Button + View Scorecard on the same row) */}
        <div className="flex items-center justify-between gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-1.5 sm:gap-2 cursor-pointer"
          >
            <Link href={`/exams/${examId}`}>
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to assessment</span>
            </Link>
          </Button>

          {isPublished && result?.result && (
            <SubmissionResultModal
              attemptId={attemptId}
              examId={examId}
              examTitle={result.examTitle}
              result={result.result}
              totalQuestions={result.totalQuestions}
              answeredCount={result.answeredCount}
              logoUrl={settings?.logoUrl ?? "/images/bcs-bank-logo-512.png"}
              appName={APP_NAME}
              targetScrollId="result-top"
            />
          )}
        </div>

        {/* Single Cohesive Parent Card (Zero Nested Cards, Full Width Scorecard) */}
        <Card className="rounded-2xl sm:rounded-3xl border border-border/70 bg-gradient-to-b from-card via-card to-muted/15 p-4 sm:p-6 lg:p-7 shadow-xs hover:shadow-sm transition-all overflow-hidden relative">
          {/* Soft Top Ambient Gradient Glow (Borderless & Premium) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 inset-x-0 h-36 bg-gradient-to-b from-primary/[0.04] via-emerald-500/[0.02] to-transparent blur-2xl"
          />
          {/* Soft Ambient System Gradient Bloom - Light & Clean */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-primary/[0.08] blur-3xl dark:bg-primary/[0.12]"
          />
          {/* Subtle Radiant Top Accent */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />

          {/* Institutional Header: Mobile = Centered Main Logo at Top + Centered Text; Desktop = Horizontal Left-aligned */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start text-center sm:text-left gap-3.5 sm:gap-5 pb-5 sm:pb-6 border-b border-border/60">
            {/* Main Brand Logo - Clean, Large & Borderless */}
            <div className="relative size-16 sm:size-20 shrink-0 select-none flex items-center justify-center transition-transform hover:scale-105">
              <Image
                src={settings?.logoUrl ?? "/images/bcs-bank-logo-512.png"}
                alt={APP_NAME}
                width={80}
                height={80}
                priority
                className="size-full object-contain drop-shadow-sm"
              />
            </div>

            <div className="min-w-0 space-y-1 sm:space-y-1.5 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-2.5 flex-wrap">
                <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
                  {titles[current.status]}
                </h1>
                <Badge
                  variant={current.status === "COMPLETED" ? "default" : "secondary"}
                  className="rounded-full px-2.5 sm:px-3 py-0.5 text-xs font-bold tracking-wide uppercase shadow-2xs border-0"
                >
                  <span>{current.status.replace("_", " ")}</span>
                </Badge>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base font-semibold text-muted-foreground flex-wrap">
                <span className="text-primary font-bold">{APP_NAME}</span>
                <span className="text-muted-foreground/40">•</span>
                <span className="font-medium text-foreground/90 line-clamp-1 sm:line-clamp-none" title={result?.examTitle || attempt.exam.title}>
                  {result?.examTitle || attempt.exam.title}
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-5 sm:pt-6">
            {result ? (
              <ResultSummary result={result} />
            ) : (
              <div className="space-y-4 text-center py-6">
                <p className="text-sm text-muted-foreground">
                  Your attempt has ended and been saved.
                </p>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href={`/exams/${examId}`}>Back to assessment overview</Link>
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <ExamAttemptClient
      attemptId={attempt.id}
      examTitle={attempt.exam.title}
      deadline={attempt.deadline.toISOString()}
      logoUrl={settings?.logoUrl ?? "/images/bcs-bank-logo-512.png"}
      negativeMarks={attempt.exam.negativeMarks}
      questions={attempt.answers.map((a) => ({
        examQuestionId: a.examQuestionId,
        questionText: a.questionText,
        marks: a.marks,
        negativeMarks: a.negativeMarks,
        optionOrder: a.optionOrder,
        optionText: a.optionText,
        selectedOption: a.selectedOption,
        isMarkedForReview: a.isMarkedForReview,
      }))}
    />
  )
}
