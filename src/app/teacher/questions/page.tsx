import Link from "next/link"
import { requireUser } from "@/lib/authorization"
import {
  listQuestions,
  getDistinctSubjects,
  getDistinctTopics,
  type QuestionFilters as Filters,
} from "@/modules/question-bank/queries"
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
import { FileQuestionIcon } from "lucide-react"
import { QuestionFilters } from "@/modules/question-bank/components/question-filters"
import { PagePagination } from "@/components/shared/page-pagination"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const STATUS_VARIANT = {
  DRAFT: "secondary",
  ACTIVE: "default",
  ARCHIVED: "outline",
} as const

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const user = await requireUser()
  const params = await searchParams

  const filters: Filters = {
    subject: params.subject,
    topic: params.topic,
    difficulty: params.difficulty as Filters["difficulty"],
    status: params.status as Filters["status"],
    search: params.search,
  }

  const [{ items, total, page, pageCount }, subjects, topics] =
    await Promise.all([
      listQuestions({
        teacherId: user.id,
        filters,
        page: params.page ? Number(params.page) : 1,
      }),
      getDistinctSubjects(user.id),
      getDistinctTopics(user.id, filters.subject),
    ])

  const hasAnyQuestions = total > 0 || Object.values(filters).some(Boolean)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Question bank</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/teacher/questions/import">Bulk import</Link>
          </Button>
          <Button asChild>
            <Link href="/teacher/questions/new">New question</Link>
          </Button>
        </div>
      </div>

      <QuestionFilters subjects={subjects} topics={topics} />

      {!hasAnyQuestions ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestionIcon />
            </EmptyMedia>
            <EmptyTitle>No questions yet</EmptyTitle>
            <EmptyDescription>
              Build a reusable question bank you can pull from when creating
              exams.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/teacher/questions/new">Create your first question</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No questions match these filters.
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Subject / Topic</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Used in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-sm">
                    <Link
                      href={`/teacher/questions/${q.id}`}
                      className="line-clamp-2 hover:underline"
                    >
                      {q.questionText}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {q.subject} / {q.topic}
                  </TableCell>
                  <TableCell>{q.difficulty}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[q.status]}>
                      {q.status}
                    </Badge>
                    {q._count.reports > 0 && (
                      <Badge variant="destructive" className="ml-1">
                        {q._count.reports} report
                        {q._count.reports === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {q._count.examQuestions} exam
                    {q._count.examQuestions === 1 ? "" : "s"}
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
