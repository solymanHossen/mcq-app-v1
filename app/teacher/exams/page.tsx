import Link from "next/link"
import { requireUser } from "@/lib/auth/guards"
import { listExams } from "@/lib/exams/queries"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { ClipboardListIcon } from "lucide-react"
import { PagePagination } from "@/components/teacher/page-pagination"
import type { ExamStatus } from "@/prisma/generated/prisma/client"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const STATUS_VARIANT = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
} as const

const TABS: { label: string; value?: ExamStatus }[] = [
  { label: "All", value: undefined },
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
]

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const user = await requireUser()
  const params = await searchParams
  const status = params.status as ExamStatus | undefined

  const { items, total, page, pageCount } = await listExams({
    teacherId: user.id,
    status,
    page: params.page ? Number(params.page) : 1,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Exams</h1>
        <Button asChild>
          <Link href="/teacher/exams/new">New exam</Link>
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `?status=${tab.value}` : "?"}
            className={`border-b-2 px-3 py-2 text-sm ${
              status === tab.value
                ? "border-primary font-medium"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {total === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle>No exams yet</EmptyTitle>
            <EmptyDescription>
              Create an exam, then pull questions in from your question bank.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/teacher/exams/new">Create your first exam</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <Link
                      href={`/teacher/exams/${exam.id}`}
                      className="font-medium hover:underline"
                    >
                      {exam.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[exam.status]}>
                      {exam.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{exam.durationMinutes} min</TableCell>
                  <TableCell>{exam._count.examQuestions}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {exam.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PagePagination page={page} pageCount={pageCount} searchParams={params} />
        </>
      )}
    </div>
  )
}
