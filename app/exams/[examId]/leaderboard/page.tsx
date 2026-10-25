import Link from "next/link"
import { notFound } from "next/navigation"
import { requireRole } from "@/lib/auth/guards"
import { prisma } from "@/lib/db"
import { getExamLeaderboard, LEADERBOARD_PAGE_SIZE } from "@/lib/leaderboard/engine"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { PagePagination } from "@/components/teacher/page-pagination"
import { Button } from "@/components/ui/button"
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
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-muted-foreground">
          This exam&apos;s leaderboard isn&apos;t enabled.
        </p>
      </div>
    )
  }

  const board = await getExamLeaderboard({
    examId,
    page: sp.page ? Number(sp.page) : 1,
    pageSize: LEADERBOARD_PAGE_SIZE,
  })

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/exams/${examId}`}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to exam
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold">{exam.title} — Leaderboard</h1>
      <p className="text-sm text-muted-foreground">
        {board.totalParticipants} participant
        {board.totalParticipants === 1 ? "" : "s"} with a published result.
      </p>
      <LeaderboardTable entries={board.entries} currentStudentId={user.id} />
      <PagePagination page={board.page} pageCount={board.pageCount} searchParams={sp} />
    </div>
  )
}
