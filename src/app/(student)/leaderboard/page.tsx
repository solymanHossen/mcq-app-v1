import { redirect } from "next/navigation"
import { requireRole } from "@/lib/authorization"
import { getGlobalLeaderboard, LEADERBOARD_PAGE_SIZE } from "@/modules/leaderboard/engine"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PagePagination } from "@/components/shared/page-pagination"
import { cn } from "@/lib/utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function GlobalLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const user = await requireRole("STUDENT")
  if (user.isGuest) redirect("/exams")
  const sp = await searchParams

  const board = await getGlobalLeaderboard({
    page: sp.page ? Number(sp.page) : 1,
    pageSize: LEADERBOARD_PAGE_SIZE,
  })

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Global leaderboard</h1>
      <p className="text-sm text-muted-foreground">
        Score = sum of each exam&apos;s percentage (obtained / total marks),
        across every exam with a published result. Taking more exams raises
        your total — this is a participation-weighted sum, not an average.
      </p>

      {board.entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No published results yet.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Total score</TableHead>
                <TableHead>Exams completed</TableHead>
                <TableHead>Percentile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {board.entries.map((e) => (
                <TableRow
                  key={e.studentId}
                  className={cn(e.studentId === user.id && "bg-primary/5")}
                >
                  <TableCell>
                    <Badge variant={e.rank <= 3 ? "default" : "outline"}>
                      #{e.rank}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {e.studentName}
                    {e.studentId === user.id && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{e.totalScore.toFixed(2)}</TableCell>
                  <TableCell>{e.examsCompleted}</TableCell>
                  <TableCell>{Math.round(e.percentile * 100)}th</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PagePagination page={board.page} pageCount={board.pageCount} searchParams={sp} />
        </>
      )}
    </div>
  )
}
