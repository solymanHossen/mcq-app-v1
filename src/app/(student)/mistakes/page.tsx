import Link from "next/link"
import { redirect } from "next/navigation"
import { requireRole } from "@/lib/authorization"
import { getMistakeNotebook, getBookmarks } from "@/modules/learning/queries"
import { MistakeReviewCard } from "@/modules/learning/components/mistake-review-card"
import { Button } from "@/components/ui/button"
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
  if (user.isGuest) redirect("/exams")

  const [mistakes, bookmarks] = await Promise.all([
    getMistakeNotebook(user.id),
    getBookmarks(user.id),
  ])
  const bookmarkedIds = new Set(bookmarks.map((b) => b.examQuestionId))

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Mistake notebook
          </h1>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Questions you&apos;ve gotten wrong, with spaced review scheduling —
            answer them again to reinforce what you missed.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-10 self-start rounded-xl text-sm font-semibold shadow-2xs sm:self-auto"
        >
          <Link href="/progress">Your progress</Link>
        </Button>
      </div>

      {mistakes.length === 0 ? (
        <Empty className="rounded-2xl border border-solid border-border/70 bg-card p-4 shadow-xs sm:p-6 lg:p-7">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenCheckIcon />
            </EmptyMedia>
            <EmptyTitle className="text-base font-bold tracking-tight sm:text-xl">
              No active mistakes
            </EmptyTitle>
            <EmptyDescription className="text-xs sm:text-sm">
              Every question you&apos;ve answered recently was correct, or you
              haven&apos;t completed an exam yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
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
