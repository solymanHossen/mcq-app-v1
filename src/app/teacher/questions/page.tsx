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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Question Bank Vault
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Author, categorize, filter, and review your full repository of exam questions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-11 rounded-xl px-5 text-sm font-semibold shadow-2xs hover:border-primary/40"
          >
            <Link href="/teacher/questions/import">Bulk Import</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="h-11 rounded-xl px-5 text-sm font-semibold shadow-xs"
          >
            <Link href="/teacher/questions/new">New Question</Link>
          </Button>
        </div>
      </div>

      <QuestionFilters subjects={subjects} topics={topics} />

      {!hasAnyQuestions ? (
        <div className="rounded-[28px] bg-card p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileQuestionIcon className="size-8 text-primary" />
              </EmptyMedia>
              <EmptyTitle className="font-heading text-xl font-bold">
                No questions yet
              </EmptyTitle>
              <EmptyDescription className="text-sm text-muted-foreground sm:text-base">
                Build a reusable question bank you can pull from when creating exams.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                asChild
                size="lg"
                className="h-11 rounded-xl px-6 text-sm font-semibold shadow-xs"
              >
                <Link href="/teacher/questions/new">Create Your First Question</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[28px] bg-card p-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <p className="text-base font-semibold text-foreground">
            No matching questions found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search filters, difficulty levels, or subjects.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[28px] border-0 bg-card p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-4 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-foreground py-3.5">Question</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Subject / Topic</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Difficulty</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Status</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Used in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((q) => (
                  <TableRow key={q.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="max-w-md py-4">
                      <Link
                        href={`/teacher/questions/${q.id}`}
                        className="font-medium text-foreground transition-colors line-clamp-2 hover:text-primary hover:underline"
                      >
                        {q.questionText}
                      </Link>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{q.subject}</span>
                      <span className="mx-1 text-muted-foreground/50">/</span>
                      <span>{q.topic}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-flex items-center rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-semibold capitalize">
                        {q.difficulty.toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant={STATUS_VARIANT[q.status]}
                        className="rounded-lg text-xs font-semibold"
                      >
                        {q.status}
                      </Badge>
                      {q._count.reports > 0 && (
                        <Badge variant="destructive" className="ml-1.5 rounded-lg text-xs font-semibold">
                          {q._count.reports} report
                          {q._count.reports === 1 ? "" : "s"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-sm font-medium text-muted-foreground">
                      {q._count.examQuestions} exam
                      {q._count.examQuestions === 1 ? "" : "s"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PagePagination page={page} pageCount={pageCount} searchParams={params} />
        </div>
      )}
    </div>
  )
}
