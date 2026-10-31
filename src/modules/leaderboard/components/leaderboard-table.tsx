import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription } from "@/components/ui/empty"
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
      <Empty className="rounded-2xl border border-solid border-border/70 bg-card p-4 shadow-xs sm:p-6 lg:p-7">
        <EmptyDescription className="text-xs sm:text-sm">
          No published results yet.
        </EmptyDescription>
      </Empty>
    )
  }

  return (
    <Card className="min-w-0 gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
      <CardContent className="min-w-0 p-0">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Percentile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow
                key={e.studentId}
                className={cn(
                  e.studentId === currentStudentId && "bg-primary/5"
                )}
              >
                <TableCell>
                  <Badge variant={e.rank <= 3 ? "default" : "outline"}>
                    #{e.rank}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-40 wrap-anywhere whitespace-normal">
                  {e.studentName}
                  {e.studentId === currentStudentId && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (you)
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {e.obtainedMarks} / {e.totalMarks}
                </TableCell>
                <TableCell>{Math.round(e.accuracy * 100)}%</TableCell>
                <TableCell>{Math.round(e.percentile * 100)}th</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
