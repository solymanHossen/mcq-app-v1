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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { PagePagination } from "@/components/shared/page-pagination"
import { Trophy, Medal } from "lucide-react"
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
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Global Leaderboard
          </h1>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
          >
            <Trophy className="size-3 text-amber-500" />
            <span>Platform Standings</span>
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
          >
            Cumulative XP &amp; Accuracy
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Participation-weighted sum of each exam&apos;s score percentage across all published results.
        </p>
      </div>

      {board.entries.length === 0 ? (
        <Empty className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 shadow-2xs">
              <Trophy className="size-6" />
            </EmptyMedia>
            <EmptyTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground mt-2">
              No Published Results Yet
            </EmptyTitle>
            <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Standings will automatically populate as candidates complete and submit examination assessments.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden min-w-0">
            <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-amber-500/20">
                  <Trophy className="size-4.5 sm:size-5.5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                    All-Time Candidate Rankings
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                    Continuous aggregate rating based on participation volume and exam scores
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 border-border/70">
                Page {board.page} of {board.pageCount}
              </Badge>
            </CardHeader>

            <CardContent className="min-w-0 p-0 overflow-x-auto">
              <Table className="text-xs sm:text-sm">
                <TableHeader className="bg-muted/15">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="w-16 font-bold">Rank</TableHead>
                    <TableHead className="font-bold">Student Candidate</TableHead>
                    <TableHead className="font-bold">Cumulative Score</TableHead>
                    <TableHead className="font-bold">Completed Exams</TableHead>
                    <TableHead className="font-bold">Percentile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {board.entries.map((e) => {
                    const isCurrentUser = e.studentId === user.id
                    return (
                      <TableRow
                        key={e.studentId}
                        className={cn(
                          "border-border/50 transition-colors",
                          isCurrentUser ? "bg-primary/5 font-semibold" : "hover:bg-muted/30"
                        )}
                      >
                        <TableCell className="py-3 sm:py-4">
                          {e.rank === 1 ? (
                            <Badge className="rounded-full px-2 py-0.5 text-xs font-extrabold bg-amber-500 text-amber-950 border-amber-600/50 shadow-2xs gap-1">
                              <Medal className="size-3 shrink-0" />
                              <span>#1</span>
                            </Badge>
                          ) : e.rank === 2 ? (
                            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-bold border-border/70 gap-1">
                              <Medal className="size-3 shrink-0 text-muted-foreground" />
                              <span>#2</span>
                            </Badge>
                          ) : e.rank === 3 ? (
                            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs font-bold border-amber-600/40 text-amber-700 dark:text-amber-400 gap-1">
                              <Medal className="size-3 shrink-0" />
                              <span>#3</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs font-semibold text-muted-foreground border-border/60">
                              #{e.rank}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="min-w-40 wrap-anywhere whitespace-normal py-3 sm:py-4 font-medium">
                          <span className="text-foreground">{e.studentName}</span>
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2 rounded-full text-[10px] sm:text-xs font-bold border-primary/40 text-primary bg-primary/10">
                              You
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3 sm:py-4 font-bold text-foreground">
                          {e.totalScore.toFixed(2)}
                        </TableCell>
                        <TableCell className="py-3 sm:py-4 text-muted-foreground font-medium">
                          {e.examsCompleted} test{e.examsCompleted === 1 ? "" : "s"}
                        </TableCell>
                        <TableCell className="py-3 sm:py-4">
                          <Badge variant="secondary" className="rounded-full text-[11px] font-bold">
                            {Math.round(e.percentile * 100)}th
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="min-w-0 pt-2 [&_[data-slot=pagination-content]]:flex-wrap [&_[data-slot=pagination-content]]:justify-center [&_[data-slot=pagination-content]]:gap-1.5">
            <PagePagination
              page={board.page}
              pageCount={board.pageCount}
              searchParams={sp}
            />
          </div>
        </>
      )}
    </div>
  )
}

