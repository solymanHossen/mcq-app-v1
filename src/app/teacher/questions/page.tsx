import Link from "next/link"
import { Plus, UploadCloud, FileQuestionIcon } from "lucide-react"
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
import { LatexText } from "@/components/shared/latex-text"
import { QuestionFilters } from "@/modules/question-bank/components/question-filters"
import { PagePagination } from "@/components/shared/page-pagination"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

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
    <div className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Question Bank Vault
            </h1>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
            >
              {total} {total === 1 ? "Question" : "Questions"}
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Author, categorize, filter, and review your full repository of exam questions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-10 rounded-xl px-4 text-xs sm:text-sm font-semibold border-border/70 shadow-2xs hover:bg-muted transition-all"
          >
            <Link href="/teacher/questions/import">
              <UploadCloud className="mr-1.5 size-4 text-muted-foreground" />
              <span>Bulk Import</span>
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-10 rounded-xl px-4 text-xs sm:text-sm font-semibold shadow-xs"
          >
            <Link href="/teacher/questions/new">
              <Plus className="mr-1.5 size-4" />
              <span>New Question</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <QuestionFilters subjects={subjects} topics={topics} />

      {/* Content Area */}
      {!hasAnyQuestions ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileQuestionIcon className="size-8 text-primary" />
              </EmptyMedia>
              <EmptyTitle className="font-heading text-lg sm:text-xl font-bold">
                No questions yet
              </EmptyTitle>
              <EmptyDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
                Build a reusable question bank you can pull from when creating exams.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                asChild
                size="sm"
                className="h-10 rounded-xl px-5 text-sm font-semibold shadow-xs"
              >
                <Link href="/teacher/questions/new">
                  <Plus className="mr-1.5 size-4" />
                  <span>Create Your First Question</span>
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border/80 bg-card p-10 sm:p-12 text-center shadow-2xs">
          <p className="font-heading text-base font-bold text-foreground">
            No matching questions found
          </p>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Try adjusting your search filters, difficulty levels, or subjects.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-2xs">
            <Table>
              <TableHeader className="bg-muted/30 border-b border-border/70">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Question
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Subject / Topic
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Difficulty
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Used In
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((q) => (
                  <TableRow
                    key={q.id}
                    className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="max-w-md py-4 px-4">
                      <Link
                        href={`/teacher/questions/${q.id}`}
                        className="font-medium text-foreground transition-colors line-clamp-2 hover:text-primary leading-snug"
                      >
                        <LatexText text={q.questionText} />
                      </Link>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{q.subject}</span>
                      <span className="mx-1.5 text-muted-foreground/50">/</span>
                      <span>{q.topic}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      {q.difficulty === "EASY" ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-semibold">
                          Easy
                        </span>
                      ) : q.difficulty === "HARD" ? (
                        <span className="inline-flex items-center rounded-full border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 text-xs font-semibold">
                          Hard
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-xs font-semibold">
                          Medium
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {q.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : q.status === "DRAFT" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/80 text-secondary-foreground px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-border/70 bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
                            Archived
                          </span>
                        )}

                        {q._count.reports > 0 && (
                          <span className="inline-flex items-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 px-2 py-0.5 text-[11px] font-bold">
                            {q._count.reports} report
                            {q._count.reports === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-xs sm:text-sm font-medium text-muted-foreground tabular-nums">
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
