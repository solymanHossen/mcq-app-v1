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
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { QuestionFilters } from "@/modules/question-bank/components/question-filters"
import { QuestionBankTable } from "@/modules/question-bank/components/question-bank-table"
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
          <QuestionBankTable
            questions={items}
            total={total}
            filters={filters}
          />
          <PagePagination page={page} pageCount={pageCount} searchParams={params} />
        </div>
      )}
    </div>
  )
}
