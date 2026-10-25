import Link from "next/link"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { ClipboardListIcon } from "lucide-react"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AvailableExamsPage() {
  await requireRole("STUDENT")

  const now = new Date()
  const exams = await prisma.exam.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ startTime: null }, { startTime: { lte: now } }],
      AND: [{ OR: [{ endTime: null }, { endTime: { gte: now } }] }],
    },
    orderBy: { publishedAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Available exams</h1>

      {exams.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle>No exams open right now</EmptyTitle>
            <EmptyDescription>Check back later.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <CardTitle>{exam.title}</CardTitle>
                <CardDescription>
                  {exam.durationMinutes} minutes · {exam.maxAttempts} attempt
                  {exam.maxAttempts === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild size="sm">
                  <Link href={`/exams/${exam.id}`}>View</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
