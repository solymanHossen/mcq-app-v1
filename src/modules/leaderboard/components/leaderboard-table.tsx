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
import { Trophy, Medal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "@/modules/leaderboard/engine"

export function LeaderboardTable({
  entries,
  currentStudentId,
}: {
  entries: LeaderboardEntry[]
  currentStudentId?: string
}) {
  if (entries.length === 0) {
    return (
      <Empty className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 shadow-2xs">
            <Trophy className="size-6" />
          </EmptyMedia>
          <EmptyTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground mt-2">
            No Published Results Yet
          </EmptyTitle>
          <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Candidate submissions are currently being evaluated or no participants have completed this assessment yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden min-w-0">
      <CardHeader className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-amber-500/20">
            <Trophy className="size-4.5 sm:size-5.5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground">
              Participant Standings
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
              Rankings determined by obtained score, accuracy, and submission speed
            </CardDescription>
          </div>
        </div>
        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 border-border/70">
          {entries.length} ranked
        </Badge>
      </CardHeader>

      <CardContent className="min-w-0 p-0 overflow-x-auto">
        <Table className="text-xs sm:text-sm">
          <TableHeader className="bg-muted/15">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-16 font-bold">Rank</TableHead>
              <TableHead className="font-bold">Candidate</TableHead>
              <TableHead className="font-bold">Obtained Score</TableHead>
              <TableHead className="font-bold">Accuracy</TableHead>
              <TableHead className="font-bold">Percentile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => {
              const isCurrentUser = e.studentId === currentStudentId
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
                    {e.obtainedMarks} / {e.totalMarks}
                  </TableCell>
                  <TableCell className="py-3 sm:py-4 font-semibold text-muted-foreground">
                    {Math.round(e.accuracy * 100)}%
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
  )
}

