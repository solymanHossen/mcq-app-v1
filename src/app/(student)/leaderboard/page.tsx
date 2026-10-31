import { redirect } from "next/navigation"
import { requireRole } from "@/lib/authorization"
import {
  getGlobalLeaderboard,
  LEADERBOARD_PAGE_SIZE,
} from "@/modules/leaderboard/engine"
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
    <div className="w-full min-w-0 space-y-6 pb-12 sm:space-y-8 sm:pb-16">
      <h1 className="border-b border-border/60 pb-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:pb-4 sm:text-3xl lg:text-4xl">
        Global leaderboard
      </h1>
      <p className="text-sm text-muted-foreground">
        Score = sum of each exam&apos;s percentage (obtained / total marks),
        across every exam with a published result. Taking more exams raises your
        total — this is a participation-weighted sum, not an average.
      </p>

      {board.entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No published results yet.
        </p>
      ) : (
        <>
          <div className="min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
            <Table>
              <TableHeader className="bg-muted/20">
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
          </div>
          <PagePagination
            page={board.page}
            pageCount={board.pageCount}
            searchParams={sp}
          />
        </>
      )}
    </div>
  )
}
