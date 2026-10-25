import Link from "next/link"
import { requireRole } from "@/lib/auth/guards"
import { getMistakeNotebook, getBookmarks } from "@/lib/learning/queries"
import { MistakeReviewCard } from "@/components/student/mistake-review-card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { BookOpenCheckIcon } from "lucide-react"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function MistakeNotebookPage() {
  const user = await requireRole("STUDENT")

  const [mistakes, bookmarks] = await Promise.all([
    getMistakeNotebook(user.id),
    getBookmarks(user.id),
  ])
  const bookmarkedIds = new Set(bookmarks.map((b) => b.examQuestionId))

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mistake notebook</h1>
          <p className="text-sm text-muted-foreground">
            Questions you&apos;ve gotten wrong, with spaced review scheduling —
            answer them again to reinforce what you missed.
          </p>
        </div>
        <Link href="/progress" className="text-sm hover:underline">
          Your progress
        </Link>
      </div>

      {mistakes.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenCheckIcon />
            </EmptyMedia>
            <EmptyTitle>No active mistakes</EmptyTitle>
            <EmptyDescription>
              Every question you&apos;ve answered recently was correct, or you
              haven&apos;t completed an exam yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {mistakes.map((m) => (
            <MistakeReviewCard
              key={m.id}
              examQuestionId={m.examQuestion.id}
              questionText={m.examQuestion.questionTextSnapshot}
              options={{
                A: m.examQuestion.optionASnapshot,
                B: m.examQuestion.optionBSnapshot,
                C: m.examQuestion.optionCSnapshot,
                D: m.examQuestion.optionDSnapshot,
              }}
              examTitle={m.examQuestion.exam.title}
              answerKeyReleased={m.examQuestion.exam.answerKeyReleased}
              bookmarked={bookmarkedIds.has(m.examQuestion.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
