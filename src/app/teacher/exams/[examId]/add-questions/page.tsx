import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireUser, assertOwner } from "@/lib/authorization"
import {
  listActiveUnusedQuestions,
  getDistinctSubjects,
  getDistinctTopics,
  type QuestionFilters as Filters,
} from "@/modules/question-bank/queries"
import { QuestionFilters } from "@/modules/question-bank/components/question-filters"
import { AddQuestionsForm } from "@/modules/exams/components/add-questions-form"
import { PagePagination } from "@/components/shared/page-pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const instant = false

export default async function AddQuestionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { examId } = await params
  const sp = await searchParams
  const user = await requireUser()

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) notFound()
  assertOwner(user, exam.teacherId)

  if (exam.status !== "DRAFT") {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href={`/teacher/exams/${examId}`}>
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Back to exam</span>
          </Link>
        </Button>
        <Alert variant="destructive" className="rounded-2xl">
          <AlertTitle>Assessment is locked</AlertTitle>
          <AlertDescription>
            This exam is {exam.status.toLowerCase()} — questions can only be added to DRAFT exams.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const filters: Filters = {
    subject: sp.subject,
    topic: sp.topic,
    difficulty: sp.difficulty as Filters["difficulty"],
    search: sp.search,
  }

  const [{ items, page, pageCount, total }, subjects, topics] = await Promise.all([
    listActiveUnusedQuestions({
      teacherId: user.id,
      examId,
      filters,
      page: sp.page ? Number(sp.page) : 1,
    }),
    getDistinctSubjects(user.id),
    getDistinctTopics(user.id, filters.subject),
  ])

  return (
    <div className="w-full min-w-0 space-y-6 pb-12 sm:space-y-8 sm:pb-16">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 max-w-full rounded-full border-border/70 bg-card px-3 text-xs font-semibold text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground sm:h-8.5 sm:text-sm"
        >
          <Link href={`/teacher/exams/${examId}`}>
            <ArrowLeft className="mr-1.5 size-4" />
            <span className="truncate">Back to {exam.title}</span>
          </Link>
        </Button>
        <div className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:gap-4 sm:pb-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Add Questions from Vault
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Adding to <span className="font-semibold text-foreground">{exam.title}</span> ·{" "}
              <span className="font-semibold text-primary">{total}</span> eligible questions available
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="gap-0 rounded-2xl border border-border/70 bg-card py-0 shadow-xs ring-0">
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <QuestionFilters subjects={subjects} topics={topics} />
        </CardContent>
      </Card>

      {/* Questions Selection Form */}
      <AddQuestionsForm examId={examId} questions={items} />

      {/* Pagination */}
      <PagePagination page={page} pageCount={pageCount} searchParams={sp} />
    </div>
  )
}
