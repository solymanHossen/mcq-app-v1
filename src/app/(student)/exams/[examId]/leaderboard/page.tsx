import Link from "next/link"
import { notFound } from "next/navigation"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import {
  getExamLeaderboard,
  LEADERBOARD_PAGE_SIZE,
} from "@/modules/leaderboard/engine"
import { LeaderboardTable } from "@/modules/leaderboard/components/leaderboard-table"
import { PagePagination } from "@/components/shared/page-pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ArrowLeft, Trophy } from "lucide-react"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ExamLeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { examId } = await params
  const sp = await searchParams
  const user = await requireRole("STUDENT")

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam || exam.status !== "PUBLISHED") notFound()
  if (!exam.leaderboardEnabled) {
    return (
      <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-1.5 sm:gap-2 self-start"
        >
          <Link href={`/exams/${examId}`}>
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to assessment</span>
          </Link>
        </Button>

        <Empty className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 shadow-2xs">
              <Trophy className="size-6" />
            </EmptyMedia>
            <EmptyTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground mt-2">
              Leaderboard Disabled
            </EmptyTitle>
            <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              This assessment&apos;s leaderboard has not been enabled by the instructor.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const board = await getExamLeaderboard({
    examId,
    page: sp.page ? Number(sp.page) : 1,
    pageSize: LEADERBOARD_PAGE_SIZE,
  })

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-3 sm:space-y-4">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-1.5 sm:gap-2 self-start"
        >
          <Link href={`/exams/${examId}`}>
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to assessment</span>
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight wrap-anywhere text-foreground">
              {exam.title} — Leaderboard
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
            >
              <Trophy className="size-3 text-amber-500" />
              <span>Standings</span>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
            >
              {board.totalParticipants} participant{board.totalParticipants === 1 ? "" : "s"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Official ranking standings with published results for this assessment.
          </p>
        </div>
      </div>

      <LeaderboardTable entries={board.entries} currentStudentId={user.id} />

      <div className="min-w-0 pt-2 [&_[data-slot=pagination-content]]:flex-wrap [&_[data-slot=pagination-content]]:justify-center [&_[data-slot=pagination-content]]:gap-1.5">
        <PagePagination
          page={board.page}
          pageCount={board.pageCount}
          searchParams={sp}
        />
      </div>
    </div>
  )
}

