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
import { Empty, EmptyDescription } from "@/components/ui/empty"
import { ArrowLeftIcon } from "lucide-react"

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
      <div className="w-full min-w-0 pb-12 sm:pb-16">
        <Empty className="rounded-2xl border border-solid border-border/70 bg-card p-4 shadow-xs sm:p-6 lg:p-7">
          <EmptyDescription className="text-xs sm:text-sm">
            This exam&apos;s leaderboard isn&apos;t enabled.
          </EmptyDescription>
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
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8 gap-1.5 self-start rounded-full border-border/70 bg-card px-3 text-xs font-semibold text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground sm:h-8.5 sm:gap-2 sm:px-3.5 sm:text-sm"
        >
          <Link href={`/exams/${examId}`}>
            <ArrowLeftIcon data-icon="inline-start" />
            Back to exam
          </Link>
        </Button>
        <div className="flex min-w-0 flex-col gap-2 border-b border-border/60 pb-3 sm:pb-4">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight wrap-anywhere text-foreground sm:text-3xl lg:text-4xl">
            {exam.title} — Leaderboard
          </h1>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {board.totalParticipants} participant
            {board.totalParticipants === 1 ? "" : "s"} with a published result.
          </p>
        </div>
      </div>
      <LeaderboardTable entries={board.entries} currentStudentId={user.id} />
      <div className="min-w-0 [&_[data-slot=pagination-content]]:flex-wrap [&_[data-slot=pagination-content]]:justify-center [&_[data-slot=pagination-content]]:gap-1.5">
        <PagePagination
          page={board.page}
          pageCount={board.pageCount}
          searchParams={sp}
        />
      </div>
    </div>
  )
}
