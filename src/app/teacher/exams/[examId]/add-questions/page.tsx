import { notFound } from "next/navigation"
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

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
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
      <p className="text-sm text-muted-foreground">
        This exam&apos;s question list is locked — only a draft exam can have
        questions added.
      </p>
    )
  }

  const filters: Filters = {
    subject: sp.subject,
    topic: sp.topic,
    difficulty: sp.difficulty as Filters["difficulty"],
    search: sp.search,
  }

  const [{ items, page, pageCount }, subjects, topics] = await Promise.all([
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
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Add questions to {exam.title}</h1>
      <QuestionFilters subjects={subjects} topics={topics} />
      <AddQuestionsForm examId={examId} questions={items} />
      <PagePagination page={page} pageCount={pageCount} searchParams={sp} />
    </div>
  )
}
