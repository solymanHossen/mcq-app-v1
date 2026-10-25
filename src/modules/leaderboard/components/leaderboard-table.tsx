import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "@/lib/leaderboard/engine"

export function LeaderboardTable({
  entries,
  currentStudentId,
}: {
  entries: LeaderboardEntry[]
  currentStudentId?: string
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No published results yet.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
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
            className={cn(e.studentId === currentStudentId && "bg-primary/5")}
          >
            <TableCell>
              <Badge variant={e.rank <= 3 ? "default" : "outline"}>
                #{e.rank}
              </Badge>
            </TableCell>
            <TableCell>
              {e.studentName}
              {e.studentId === currentStudentId && (
                <span className="ml-2 text-xs text-muted-foreground">(you)</span>
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
  )
}
